'use client';

import { Fragment, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import Swal from 'sweetalert2';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface BoqRow {
  id: string; type: 'item' | 'note' | 'heading' | 'retail'; no?: string; size?: string; desc?: string;
  code?: string; faceW?: string; unitPrice?: string; qty?: string;
  price?: string; discount?: string; net?: string; rail?: string;
  motor?: string; c13?: string; hook?: string; acc1?: string; acc2?: string; acc3?: string; acc3p?: string; sewing?: string;
  install?: string; sets?: string; unit?: string; total?: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  ptype: string | null;
  price: number;
  unit: string;
  face_width: number | null;
  status: string;
  description?: string | null;
  supplier?: string | null;
  width1?: string | null;
  width2?: string | null;
}

/* DB-sourced formula config */
interface DbTypeConfig {
  id: number;
  type_id: string;
  type_label: string;
  formula_group: string;
  face_width: number | null;
  height_threshold: number | null;
  unit: string;
  rail_cat_motor: string | null;
  rail_cat_manual: string | null;
  formula_p:   number | null;   // sfold: W multiplier | sqy: area factor
  formula_h:   number | null;   // sfold/wave: H addition
  formula_eff: number | null;   // sfold/wave: efficiency divisor
}

interface DbSewingCombo {
  id: number;
  type_id: string;
  combo_key: string;
  label: string;
  system: 'manual' | 'motor' | 'both';
  sewing_rate: number;
  setup_rate: number;
  sort_order: number;
  is_active: boolean;
  height_min: number | null;
  height_max: number | null;
}

/* Runtime combo shape used inside the component */
interface SewingComboConfig {
  id: string;
  label: string;
  sub: string;
  system: 'manual' | 'motor' | 'both';
  sewing: number;
  setup: number;
}

/* curtain type → product category */
const TYPE_TO_CATEGORY: Record<string, string> = {
  wave:     'ผ้าม่าน',
  lon:      'ผ้าม่าน',
  sfold:    'ผ้าม่าน',
  roman:    'ผ้าม่าน',
  roller:   'SUNSCREEN 1%-3%-5%,SUNSCREEN 6%-15%,BLACKOUT,2LAYER-อื่นๆ',
  wood:     'มู่ลี่ไม้',
  net:      'มุ้งจีบ-ประตู,มุ้งจีบ-หน้าต่าง',
  bay:      'ผ้าม่าน',
  hospital: 'ผ้าม่าน',
};

interface Props {
  onClose: () => void;
  onAdd: (row: BoqRow) => void;
  nextNo: number;
  editRow?: BoqRow;
  startStep?: number;
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
let _uid = 0;
const nid = () => `row_${++_uid}_${Math.random().toString(36).slice(2, 7)}`;

const CURTAIN_TYPES = [
  { id: 'wave',     label: 'ม่านจีบ',         sub: 'สูตร G1 · Pleated',        face: '1.20', unit: 'yd',  formula: 'wave', group: 'G1' },
  { id: 'lon',      label: 'ม่านลอน',          sub: 'สูตร G1 · S-Curve',        face: '1.20', unit: 'yd',  formula: 'wave', group: 'G1' },
  { id: 'sfold',    label: 'ม่านลอน-กระดุม',   sub: 'สูตร G1 · S-Fold',         face: '1.40', unit: 'yd',  formula: 'sfold', group: 'G1' },
  { id: 'roman',    label: 'ม่านพับ',           sub: 'สูตร G4 · Roman',          face: '—',   unit: 'sqy', formula: 'sqy',  group: 'G4' },
  { id: 'roller',   label: 'ม่านม้วน',          sub: 'สูตร G2 · Sunscreen / Blackout', face: '—', unit: 'sqy', formula: 'sqy', group: 'G2' },
  { id: 'wood',     label: 'มู่ลี่ไม้',          sub: 'สูตร G2 · 25/35/50mm',    face: '—',   unit: 'sqy', formula: 'sqy',  group: 'G2' },
  { id: 'net',      label: 'มุ้งจีบ',            sub: 'สูตร G2 · กันแมลง',        face: '—',   unit: 'sqy', formula: 'sqy',  group: 'G2' },
];

const SPECIAL_TYPES = [
  { id: 'bay',      label: 'ม่านถุง',   sub: 'หน้าต่างเต้ / Bay window', face: '1.20', unit: 'yd',  formula: 'wave' },
  { id: 'hospital', label: 'ม่าน รพ.', sub: 'โรงพยาบาล · spec พิเศษ',   face: '1.20', unit: 'yd',  formula: 'wave' },
];

const ALL_TYPES = [...CURTAIN_TYPES, ...SPECIAL_TYPES];

const SYSTEMS_MAIN = [
  { id: 'manual', label: 'แมนวล',  icon: '🖐️' },
  { id: 'motor',  label: 'มอเตอร์', icon: '⚙️' },
];

/* ทึบ / โปร่ง — mandatory for sewn fabric types (G1, G4, Special) */
const FABRIC_OPACITY = [
  { id: 'thick'    as const, label: 'ทึบ',        sub: 'Dimout · ซับหลัง',            icon: '🌑' },
  { id: 'sheer'    as const, label: 'โปร่ง',       sub: 'Sheer · Voile · ลูกไม้',      icon: '🌤️' },
  { id: 'blackout' as const, label: 'Backout',  sub: 'Backout 100% · ซับหลัง',     icon: '⬛' },
];
const NEEDS_OPACITY = new Set(['wave','lon','sfold','roman','bay','hospital']);

const DIRECTIONS = [
  { id: 'left',   label: 'เก็บซ้าย' },
  { id: 'right',  label: 'เก็บขวา' },
  { id: 'center', label: 'ผ่ากลาง' },
];

const SFOLD_OPENINGS = [
  { id: 'center', label: 'ผ่ากลาง',  icon: '⇔' },
  { id: 'left',   label: 'เก็บซ้าย', icon: '⇐' },
  { id: 'right',  label: 'เก็บขวา',  icon: '⇒' },
];
const MOTOR_OPENINGS = [
  { id: 'motor-left',  label: 'มอเตอร์ซ้าย', icon: '◀⚙' },
  { id: 'motor-right', label: 'มอเตอร์ขวา',  icon: '⚙▶' },
];

const CEILING_TYPES = [
  { id: 'D+Fit',      label: 'D+Fit',      sub: 'มีกล่องม่าน และ ฝ้าซ้าย-ขวาฟิต', box: true,  fit: true,  offset: false },
  { id: 'N/D',        label: 'N/D',        sub: 'ไม่มีกล่องม่าน / R+L-ว่าง', box: false, fit: false, offset: false },
  { id: 'offset-D',   label: 'offset-D',   sub: 'รอหัก/ตัด มีกล่องม่าน',    box: true,  fit: false, offset: true  },
  { id: 'offset-N/D', label: 'offset-N/D', sub: 'รอหัก/ตัด ไม่มีกล่องม่าน', box: false, fit: false, offset: true  },
];

/* typeId → { motor, manual } rail product categories */
const RAIL_CATEGORY: Partial<Record<string, { motor: string; manual: string }>> = {
  sfold: { motor: 'รางลอน-กระดุม-มอร์เตอร์',  manual: 'รางลอน-กระดุม' },
  lon:   { motor: 'รางม่านลอน-มอร์เตอร์',      manual: 'รางม่านลอน' },
  wave:  { motor: 'รางม่านจีบ-มอร์เตอร์',      manual: 'รางม่านจีบ' },
};

/* COMBO — ค่าเย็บ + ค่าติดตั้ง for sfold / lon */
const SFOLD_COMBOS = [
  { id: 'normal',     label: 'ลอน-กระดุม',              sub: 'แมนวล ปกติ',      system: 'manual', sewing: 270, setup: 220  },
  { id: 'high',       label: 'ลอนกระดุม-ชุดสูง',         sub: 'แมนวล ชุดสูง',    system: 'manual', sewing: 550, setup: 450  },
  { id: 'motor',      label: 'ลอนกระดุม-มอเตอร์',        sub: 'มอเตอร์ ปกติ',    system: 'motor',  sewing: 270, setup: 2000 },
  { id: 'motor-high', label: 'ลอนกระดุม-มอเตอร์-ชุดสูง', sub: 'มอเตอร์ ชุดสูง',  system: 'motor',  sewing: 550, setup: 2000 },
] as const;

/* ------------------------------------------------------------------ */
/*  Parse an existing BoqRow back into wizard state (for edit mode)    */
/* ------------------------------------------------------------------ */
function parseEditRow(row: BoqRow) {
  const parts = (row.desc ?? '').split('|');
  const desc0 = parts[0]?.trim() ?? '';
  const dir0  = parts[1]?.trim() ?? '';
  const sys0  = parts[2]?.trim() ?? '';
  const ceil0 = parts[3]?.trim() ?? '';

  let typeId = '';
  const sortedTypes = [...ALL_TYPES].sort((a, b) => b.label.length - a.label.length);
  for (const t of sortedTypes) {
    if (desc0.startsWith(t.label)) { typeId = t.id; break; }
  }

  const fabricOpacity: 'blackout'|'thick'|'sheer'|'' =
    (desc0.includes('Backout') || desc0.includes('Blackout')) ? 'blackout' : desc0.includes('ทึบ') ? 'thick' : desc0.includes('โปร่ง') ? 'sheer' : '';

  /* backward compat: old data stored motor-pos in dir0 */
  const motorFromDir = MOTOR_OPENINGS.find(d => d.label === dir0);
  let direction = '';
  if (!motorFromDir) {
    for (const d of [...DIRECTIONS, ...SFOLD_OPENINGS]) {
      if (dir0 === d.label) { direction = d.id; break; }
    }
  }
  const motorSide0 = parts[4]?.trim() ?? '';
  const motorSide = MOTOR_OPENINGS.find(d => d.label === motorSide0)?.id ?? motorFromDir?.id ?? '';

  const systemMain: 'manual'|'motor' = sys0.includes('มอเตอร์') ? 'motor' : 'manual';
  const manualRope = sys0.includes('เชือกดึง');

  const sm = (row.size ?? '').match(/W\.([0-9.]+).*H\.([0-9.]+)/);

  const priceN = parseFloat((row.price    ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const discN  = parseFloat((row.discount ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const discountPct = priceN > 0 && discN > 0
    ? String(Math.round(discN / priceN * 100)) : '30';

  const toPrice = (s?: string) => (!s || s === '—') ? '' : s.replace(/,/g, '').replace(/[^0-9.]/g, '');

  const w0 = parseFloat(sm?.[1] ?? '0') || 0;
  const h0 = parseFloat(sm?.[2] ?? '0') || 0;
  const sewingN = parseFloat((row.sewing ?? '').replace(/[^0-9.]/g, '')) || 0;
  let comboId = systemMain === 'motor' ? 'motor' : 'normal';
  if (sewingN > 0 && w0 > 0) {
    const rate = sewingN / w0;
    for (const c of SFOLD_COMBOS) {
      if (c.system === systemMain && Math.abs(c.sewing - rate) < 50) { comboId = c.id; break; }
    }
  }

  /* infer เผื่อผ้า from stored qty − base (sfold / wave) */
  let panels = '2';
  const storedQtyN = parseFloat((row.qty ?? '').replace(/[^0-9.]/g, '')) || 0;
  const face0 = parseFloat((!row.faceW || row.faceW === '—') ? '' : (row.faceW ?? '')) || 0;
  if (storedQtyN > 0 && w0 > 0 && h0 > 0) {
    let base = 0;
    if (typeId === 'sfold' || typeId === 'wave') {
      const loomW = face0 || 1.4;
      base = ((w0 * 2.5) / loomW) * (h0 + 0.3) / 0.9;
    } else if (['lon','bay','hospital'].includes(typeId)) {
      const fw = face0 || 1.2;
      base = (w0 * fw * (h0 + 0.5)) / 0.9144;
    }
    if (base > 0) {
      const inferred = Math.round(storedQtyN - base);
      if (inferred >= 0 && inferred <= 20) panels = String(inferred);
    }
  }

  return {
    typeId, fabricOpacity, direction, motorSide, systemMain, manualRope, comboId,
    motorType    : (sys0.includes('WT') ? 'WT' : 'RTS') as 'RTS' | 'WT',
    ceilingType  : CEILING_TYPES.find(c => c.id === ceil0)?.id ?? '',
    selectedCode : row.code ?? '',
    width        : sm?.[1] ?? '',
    height       : sm?.[2] ?? '',
    faceOverride : (!row.faceW || row.faceW === '—') ? '' : row.faceW,
    unitPrice    : row.unitPrice ?? '',
    discountPct,
    railPrice    : toPrice(row.rail),
    motorPrice   : toPrice(row.motor),
    panels,
    acc1Price: (row.c13 && row.c13 !== '-' && row.c13 !== '300')
      ? row.c13.replace(/,/g, '').replace(/[^0-9.]/g, '') : '',
    acc2Price: (row.hook && row.hook !== '-' && row.hook !== '300')
      ? row.hook.replace(/,/g, '').replace(/[^0-9.]/g, '') : '',
    acc1Label: row.acc1 ?? '',
    acc2Label: row.acc2 ?? '',
    acc3Label: row.acc3 ?? '',
    acc3Price: (row.acc3p && row.acc3p !== '-') ? row.acc3p.replace(/,/g, '').replace(/[^0-9.]/g, '') : '',
    railQty: (row.sets && row.sets !== '-' && row.sets !== '0') ? row.sets : '1',
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const f2 = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface FormulaConfig { formula_p?: number|null; formula_h?: number|null; formula_eff?: number|null; }

function computeQty(formula: string, face: string, w: number, h: number, direction?: string, panelsNum = 0, cfg?: FormulaConfig): { qty: number; unit: string; label: string; panels?: number; sfoldConditionMet?: boolean } {
  if (formula === 'sfold') {
    const loomW  = parseFloat(face) || 1.4;
    const pMult  = Number(cfg?.formula_p)   || 2.5;
    const hAdd   = Number(cfg?.formula_h)   || 0.3;
    const eff    = Number(cfg?.formula_eff) || 0.9;
    const Q      = (w * pMult) / loomW;
    const R      = h + hAdd;
    const qty    = (Q * R / eff) + panelsNum;
    return { qty, unit: 'yd', label: `${qty.toFixed(2)} yd`, panels: panelsNum };
  } else if (formula === 'wave') {
    const fw   = parseFloat(face) || 1.2;
    const hAdd = Number(cfg?.formula_h)   || 0.5;
    const eff  = Number(cfg?.formula_eff) || 0.9144;
    const base = (w * fw * (h + hAdd)) / eff;
    const qty  = base + panelsNum;
    return { qty, unit: 'yd', label: `${qty.toFixed(2)} yd`, panels: panelsNum };
  } else {
    const mult = Number(cfg?.formula_p) || 1.196;
    const qty  = w * h * mult;
    return { qty, unit: 'sqy', label: `${qty.toFixed(2)} sqy` };
  }
}

/* ------------------------------------------------------------------ */
/*  Curtain icon SVGs                                                   */
/* ------------------------------------------------------------------ */
const ICONS: Record<string, ReactElement> = {
  wave: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 4h24v4H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 8c2 6 0 18 2 22M9 8c2 6 0 18 2 22M14 8c2 6 0 18 2 22M19 8c2 6 0 18 2 22M24 8c2 6 0 18 2 22" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  lon: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 4h24v4H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 12c4 0 4 4 8 4s4-4 8-4 4 4 8 4M4 18c4 0 4 4 8 4s4-4 8-4 4 4 8 4M4 24c4 0 4 4 8 4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  sfold: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 4h24v4H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 12c4 0 4 4 8 4s4-4 8-4 4 4 8 4M4 22c4 0 4 4 8 4s4-4 8-4" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="8" cy="11" r="1.2" fill="#C9A581"/><circle cx="16" cy="11" r="1.2" fill="#C9A581"/><circle cx="24" cy="11" r="1.2" fill="#C9A581"/></svg>,
  roman: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="4" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="4" y="10" width="24" height="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="4" y="15" width="24" height="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="4" y="20" width="24" height="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="4" y="25" width="24" height="3" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  roller: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="6" y="9" width="20" height="19" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="9" y1="14" x2="23" y2="14" stroke="#C9A581" strokeWidth="1"/><line x1="9" y1="19" x2="23" y2="19" stroke="#C9A581" strokeWidth="1"/><line x1="9" y1="24" x2="23" y2="24" stroke="#C9A581" strokeWidth="1"/></svg>,
  wood: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="2" rx="0.5" fill="#C9A581"/><rect x="4" y="10" width="24" height="2" rx="0.5" fill="#C9A581"/><rect x="4" y="14" width="24" height="2" rx="0.5" fill="#C9A581"/><rect x="4" y="18" width="24" height="2" rx="0.5" fill="#C9A581"/><rect x="4" y="22" width="24" height="2" rx="0.5" fill="#C9A581"/><rect x="4" y="26" width="24" height="2" rx="0.5" fill="#C9A581"/></svg>,
  net: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 4h24v4H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="4" y="8" width="24" height="20" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><line x1="10" y1="8" x2="10" y2="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><line x1="16" y1="8" x2="16" y2="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/><line x1="22" y1="8" x2="22" y2="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2"/></svg>,
  bay: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 8 Q16 0 28 8 L28 12 Q16 4 4 12 Z" stroke="#C9A581" strokeWidth="1.5" fill="none"/><path d="M5 14 Q16 6 27 14 L27 28 L5 28 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
  hospital: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 4h24v4H4z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 8c2 6 0 18 2 22M9 8c2 6 0 18 2 22M14 8c2 6 0 18 2 22M19 8c2 6 0 18 2 22M24 8c2 6 0 18 2 22" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="24" cy="6" r="4" fill="#C9A581"/><line x1="24" y1="3.5" x2="24" y2="8.5" stroke="white" strokeWidth="1.5"/><line x1="21.5" y1="6" x2="26.5" y2="6" stroke="white" strokeWidth="1.5"/></svg>,
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function WizardModal({ onClose, onAdd, nextNo, editRow, startStep }: Props) {
  const editMode     = !!editRow;
  const init         = editRow ? parseEditRow(editRow) : null;
  const initIsSfold    = (init?.typeId ?? '') === 'sfold';
  const initIsFullFlow = ['sfold', 'wave', 'lon'].includes(init?.typeId ?? '');

  const [step, setStep]         = useState(() => startStep ?? (editMode ? (initIsFullFlow ? 8 : 5) : 1));
  const [isDirty, setIsDirty]   = useState(false);
  const markDirty = () => setIsDirty(true);
  const [typeId, setTypeId]     = useState(init?.typeId ?? '');
  /* product picker */
  const [allProducts, setAllProducts]       = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsFetched, setProductsFetched] = useState(false);
  const [productQ, setProductQ]             = useState('');
  const [productPage, setProductPage]       = useState(1);
  const PRODUCT_PER_PAGE = 100;
  const [selectedCode, setSelectedCode]     = useState(init?.selectedCode ?? '');
  const [fabricOpacity, setFabricOpacity]   = useState<'blackout'|'thick'|'sheer'|''>(init?.fabricOpacity ?? '');
  /* system + direction */
  const [systemMain, setSystemMain] = useState<'manual' | 'motor' | ''>(init?.systemMain ?? '');
  const [manualRope, setManualRope] = useState(init?.manualRope   ?? false);
  const [motorType, setMotorType]   = useState<'RTS' | 'WT'>(init?.motorType ?? 'RTS');
  const [direction, setDirection]   = useState(init?.direction    ?? '');
  const [motorSide, setMotorSide]   = useState(init?.motorSide    ?? '');
  const [ceilingType, setCeilingType] = useState(init?.ceilingType ?? '');

  /* derived: final system value used in description + price */
  const system = systemMain === 'motor' ? 'motor' : manualRope ? 'manual-rope' : 'manual';
  /* size */
  const [width, setWidth]   = useState(init?.width  ?? '');
  const [height, setHeight] = useState(init?.height ?? '');
  /* wood blind formula — C1/C2/C3 widths + J multiplier + K height addition */
  const [woodC1, setWoodC1] = useState('');
  const [woodC2, setWoodC2] = useState('');
  const [woodC3, setWoodC3] = useState('');
  const [woodJ,  setWoodJ]  = useState('');
  const [woodK,  setWoodK]  = useState('');
  const [faceOverride, setFaceOverride] = useState(init?.faceOverride ?? '');
  const [panels, setPanels]             = useState(init?.panels ?? '2');
  /* price */
  const [unitPrice, setUnitPrice]     = useState(init?.unitPrice   ?? '');
  const [discountPct, setDiscountPct] = useState(init?.discountPct ?? '35');
  const [railPrice, setRailPrice]     = useState(init?.railPrice   ?? '');
  const [railQty, setRailQty]         = useState(init?.railQty ?? '1');
  const [railSelectedId, setRailSelectedId] = useState<number | null>(null);
  const [railSystem, setRailSystem]   = useState<'RTS' | 'WT' | ''>('');
  const [motorPrice, setMotorPrice]   = useState(init?.motorPrice  ?? '');
  const [comboId, setComboId]         = useState(init?.comboId ?? (init?.systemMain === 'motor' ? 'motor' : 'normal'));
  /* accessories (motor + thick) */
  const [acc1Label, setAcc1Label] = useState(init?.acc1Label ?? '');
  const [acc1Price, setAcc1Price] = useState(init?.acc1Price ?? '');
  const [acc1Qty,   setAcc1Qty]   = useState('1');
  const [acc2Label, setAcc2Label] = useState(init?.acc2Label ?? '');
  const [acc2Price, setAcc2Price] = useState(init?.acc2Price ?? '');
  const [acc2Qty,   setAcc2Qty]   = useState('1');
  const [acc3Label, setAcc3Label] = useState(init?.acc3Label ?? '');
  const [acc3Price, setAcc3Price] = useState(init?.acc3Price ?? '');
  /* rail product picker */
  const [railProducts, setRailProducts] = useState<Product[]>([]);
  const [loadingRail, setLoadingRail] = useState(false);
  /* accessory product list */
  const [accProducts, setAccProducts] = useState<Product[]>([]);
  const [wandProducts, setWandProducts] = useState<Product[]>([]);
  const [hookProducts, setHookProducts] = useState<Product[]>([]);
  const [manualAccProducts, setManualAccProducts] = useState<Product[]>([]);
  /* DB formula config */
  const [dbTypes,  setDbTypes]  = useState<DbTypeConfig[]>([]);
  const [dbCombos, setDbCombos] = useState<DbSewingCombo[]>([]);

  const isSfold     = typeId === 'sfold';
  const isFullFlow  = typeId === 'sfold' || typeId === 'wave' || typeId === 'lon';

  /* dynamic step list — sfold gets 3 extra steps (opacity + opening + ceiling) */
  const STEPS = isFullFlow
    ? ['ประเภทม้าน', 'ระบบ', 'ทึบ/โปร่ง', 'Opening style', 'รูปแบบฝ้า', 'เลือกผ้า', 'ขนาด', 'ราคา']
    : ['ประเภทม้าน', 'ระบบ', 'เลือกผ้า', 'ขนาด', 'ราคา'];

  const STEP_CEILING = 5; // fullFlow only
  const STEP_FABRIC  = isFullFlow ? 6 : 3;
  const STEP_SIZE    = isFullFlow ? 7 : 4;
  const STEP_PRICE   = isFullFlow ? 8 : 5;

  const typeInfo = ALL_TYPES.find(t => t.id === typeId);
  const opacityInfo = FABRIC_OPACITY.find(f => f.id === fabricOpacity);

  /* derive rail categories and combos from DB (fall back to hard-coded if not loaded yet) */
  const dbTypeConfig   = useMemo(() => dbTypes.find(t => t.type_id === typeId), [dbTypes, typeId]);
  const activeRailCat  = useMemo(() => {
    if (dbTypeConfig) return { motor: dbTypeConfig.rail_cat_motor ?? '', manual: dbTypeConfig.rail_cat_manual ?? '' };
    return RAIL_CATEGORY[typeId] ?? { motor: '', manual: '' };
  }, [dbTypeConfig, typeId]);

  const typeSewingCombos = useMemo<SewingComboConfig[]>(() => {
    const dbRows = dbCombos.filter(c => c.type_id === typeId);
    if (dbRows.length > 0) {
      return dbRows.map(c => ({
        id: c.combo_key, label: c.label,
        sub: c.system === 'motor' ? 'มอเตอร์' : 'แมนวล',
        system: c.system, sewing: c.sewing_rate, setup: c.setup_rate,
      }));
    }
    /* fallback to hard-coded (e.g. before first fetch completes) */
    return (SFOLD_COMBOS as unknown as SewingComboConfig[]).filter(
      () => typeId === 'sfold' || typeId === 'lon'
    );
  }, [dbCombos, typeId]);

  const face = faceOverride
    || (dbTypeConfig?.face_width ? String(dbTypeConfig.face_width) : null)
    || typeInfo?.face
    || '—';
  const formula = dbTypeConfig?.formula_group || typeInfo?.formula || 'sqy';
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const panelsNum = parseInt(panels) || 0;
  /* wood blind derived values */
  const woodCTotal = (parseFloat(woodC1)||0) + (parseFloat(woodC2)||0) + (parseFloat(woodC3)||0);
  const woodJNum   = parseFloat(woodJ) || 1;
  const woodKNum   = parseFloat(woodK) || 0;
  const woodQ      = woodCTotal > 0 ? (woodCTotal * woodJNum) : 0;
  const woodR      = h > 0 ? h + woodKNum : 0;
  const woodQty    = woodQ > 0 && woodR > 0 ? +(woodQ * woodR * 1.20).toFixed(2) : 0;
  /* sfold: hint = auto-panels from direction (for display only, does not override user input) */
  const sfoldAutoPanels = formula === 'sfold' && w > 0 && h > 0
    ? (direction === 'center'
        ? Math.ceil((w * 2.5 / (parseFloat(face) || 1.4)) / 2) * 2
        : Math.ceil(w * 2.5 / (parseFloat(face) || 1.4)))
    : null;
  const formulaCfg: FormulaConfig = {
    formula_p:   dbTypeConfig?.formula_p,
    formula_h:   dbTypeConfig?.formula_h,
    formula_eff: dbTypeConfig?.formula_eff,
  };
  const computed = w > 0 && h > 0 ? computeQty(formula, face, w, h, direction, panelsNum, formulaCfg) : null;
  const upNum = parseFloat(unitPrice.replace(/,/g, '')) || 0;
  const rawPrice = computed ? computed.qty * upNum : 0;
  const discNum = rawPrice * (parseFloat(discountPct) / 100);
  const net = rawPrice - discNum;
  const railNum    = parseFloat(railPrice.replace(/,/g, '')) || 0;
  const railCost   = ((typeId === 'lon' || typeId === 'sfold' || typeId === 'wave') && system !== 'motor' && w > 0) ? railNum * w : railNum;
  const railQtyNum = Math.max(1, parseInt(railQty) || 1);
  const motorNum = parseFloat(motorPrice.replace(/,/g, '')) || 0;
  const acc1QtyNum = Math.max(1, parseInt(acc1Qty) || 1);
  const acc2QtyNum = Math.max(1, parseInt(acc2Qty) || 1);
  const acc1Num  = (parseFloat((acc1Price || '').replace(/,/g, '')) || 0) * acc1QtyNum;
  const acc2Num  = (parseFloat((acc2Price || '').replace(/,/g, '')) || 0) * acc2QtyNum;
  const acc3Num  = parseFloat((acc3Price || '').replace(/,/g, '')) || 0;

  const hasRailDropdown = !!(activeRailCat.motor || activeRailCat.manual);
  const hasCombos       = typeSewingCombos.length > 0;
  const isBlackoutLon    = (typeId === 'lon' || typeId === 'sfold' || typeId === 'wave') && fabricOpacity === 'blackout';
  const isBackoutFabric  = fabricOpacity === 'blackout' && (typeId === 'lon' || typeId === 'sfold' || typeId === 'wave');
  const availableCombos  = typeSewingCombos.filter(c => {
    const isBackoutCombo = c.id.includes('backout');
    if (isBackoutFabric) return isBackoutCombo;
    return (c.system === systemMain || c.system === 'both') && !isBackoutCombo;
  });
  const comboInfo       = hasCombos ? (typeSewingCombos.find(c => c.id === comboId) ?? availableCombos[0] ?? null) : null;
  const sewingAmt       = comboInfo && w > 0 ? Math.round(comboInfo.sewing * w) : 0;
  const setupAmt        = comboInfo ? comboInfo.setup : 0;

  /* for types with rail dropdown (sfold/lon), motor is included in rail price → no separate motorNum
     for types with combos but no rail dropdown (wave/roman), motor input is still separate           */
  const total = hasCombos
    ? net + railCost + (hasRailDropdown ? 0 : motorNum) + sewingAmt + setupAmt + acc1Num + acc2Num + acc3Num
    : net + railCost + motorNum;

  const systemLabel = system === 'motor' ? `มอเตอร์ ${motorType}` : system === 'manual-rope' ? 'แมนวล-เชือกดึง' : 'แมนวล';
  const dirs = isSfold ? SFOLD_OPENINGS : DIRECTIONS;
  const dirLabel = dirs.find(d => d.id === direction)?.label ?? direction;
  const motorSideLabel = MOTOR_OPENINGS.find(d => d.id === motorSide)?.label ?? '';

  /* auto-search init flag — pre-fill productQ with selectedCode once when entering fabric step in edit mode */
  const editProductInitRef = useRef(false);
  const handlingRef = useRef(false);

  /* fetch products when the fabric step is reached (re-fetch if type changes) */
  useEffect(() => {
    if (step !== STEP_FABRIC) return;
    const category = typeId ? TYPE_TO_CATEGORY[typeId] ?? '' : '';
    setAllProducts([]);
    setProductsFetched(false);
    setLoadingProducts(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}&includeBoqUsed=true`)
      .then(r => r.json())
      .then((data: any) => {
        setAllProducts(Array.isArray(data) ? data : []);
        setLoadingProducts(false);
        setProductsFetched(true);
        if (editMode && selectedCode && !editProductInitRef.current) {
          editProductInitRef.current = true;
          setProductQ(selectedCode);
        }
      })
      .catch(() => setLoadingProducts(false));
  }, [step, typeId]);

  /* clear acc/motor fields when system changes — skip first mount so edit-mode values are preserved */
  const systemChangeInitRef = useRef(true);
  useEffect(() => {
    if (systemChangeInitRef.current) { systemChangeInitRef.current = false; return; }
    setAcc1Label(''); setAcc1Price('');
    setAcc2Label(''); setAcc2Price('');
    setAcc3Label(''); setAcc3Price('');
    setMotorPrice('');
  }, [systemMain]);

  /* auto-select combo based on system + height range rules — skip first mount so edit-mode comboId is preserved */
  const comboInitRef   = useRef(true);
  const prevTriggerRef = useRef({ systemMain, typeId });
  useEffect(() => {
    if (comboInitRef.current) { comboInitRef.current = false; return; }
    if (typeSewingCombos.length === 0) return;

    const prev = prevTriggerRef.current;
    const systemOrTypeChanged = prev.systemMain !== systemMain || prev.typeId !== typeId;
    prevTriggerRef.current = { systemMain, typeId };

    const hasHeightRules = dbCombos.some(c =>
      c.type_id === typeId && c.is_active && (c.height_min != null || c.height_max != null)
    );

    const isBackoutMode = fabricOpacity === 'blackout' && (typeId === 'lon' || typeId === 'sfold' || typeId === 'wave');
    if (hasHeightRules) {
      const candidates = dbCombos.filter(c => {
        if (c.type_id !== typeId || !c.is_active) return false;
        const isBackoutCombo = c.combo_key.includes('backout');
        if (isBackoutMode) {
          if (!isBackoutCombo) return false;
        } else {
          if (isBackoutCombo || c.system !== systemMain) return false;
        }
        return (c.height_min == null || h > Number(c.height_min)) &&
               (c.height_max == null || h <= Number(c.height_max));
      });
      const fallback = dbCombos.find(c => {
        if (c.type_id !== typeId || !c.is_active) return false;
        const isBackoutCombo = c.combo_key.includes('backout');
        return isBackoutMode ? isBackoutCombo : (!isBackoutCombo && c.system === systemMain);
      });
      const pick = candidates[0] ?? fallback;
      if (pick) setComboId(pick.combo_key);
    } else {
      if (!systemOrTypeChanged) return;
      const def = typeSewingCombos.find(c => c.system === systemMain && !c.id.includes('backout'));
      if (def) setComboId(def.id);
    }
  }, [systemMain, typeId, h, fabricOpacity, dbCombos, typeSewingCombos]);

  /* auto-save when rail/acc selections change in edit mode step 8 */
  useEffect(() => {
    if (step !== STEP_PRICE || !editMode || !typeInfo || !editRow || !isDirty) return;
    const opacityPart = opacityInfo ? `-${opacityInfo.label}` : '';
    const ceilingPart = isFullFlow && ceilingType ? ` | ${ceilingType}` : '';
    const motorSidePart = system === 'motor' && motorSideLabel ? ` | ${motorSideLabel}` : '';
    const desc = `${typeInfo.label}${opacityPart} | ${dirLabel} | ${systemLabel}${ceilingPart}${motorSidePart}`;
    const sizeStr = w && h ? `W.${parseFloat(width).toFixed(2)}×H.${parseFloat(height).toFixed(2)}` : '';
    const row: BoqRow = {
      id: editRow.id, type: 'item', no: editRow.no,
      size: sizeStr, desc,
      code: selectedCode, faceW: face,
      unitPrice: upNum > 0 ? String(Math.round(upNum)) : '0',
      qty: computed?.label ?? '',
      price: f2(rawPrice),
      discount: discNum ? `-${f2(discNum)}` : '0',
      net: f2(net),
      rail: railCost > 0 ? Math.round(railCost).toLocaleString('th-TH') : '—',
      motor: hasCombos ? '-' : (system === 'motor' ? (motorNum > 0 ? Math.round(motorNum).toLocaleString('th-TH') : '-') : '-'),
      c13: system === 'motor' ? '-' : (acc1Num > 0 ? Math.round(acc1Num).toLocaleString('th-TH') : '-'),
      hook: system === 'motor' ? '-' : (acc2Num > 0 ? Math.round(acc2Num).toLocaleString('th-TH') : '-'),
      acc1: acc1Label || undefined,
      acc2: acc2Label || undefined,
      acc3: acc3Label || undefined,
      acc3p: system === 'motor'
        ? ((acc1Num + acc2Num) > 0 ? Math.round(acc1Num + acc2Num).toLocaleString('th-TH') : undefined)
        : (acc3Num > 0 ? Math.round(acc3Num).toLocaleString('th-TH') : undefined),
      sewing: hasCombos && sewingAmt > 0 ? sewingAmt.toLocaleString('th-TH') : '—',
      install: hasCombos && setupAmt > 0 ? setupAmt.toLocaleString('th-TH') : '—',
      unit: 'ชุด',
      total: f2(total * railQtyNum),
    };
    onAdd(row);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railSelectedId, acc1Label, acc2Label]);

  /* fetch formula config once on mount */
  useEffect(() => {
    fetch('/api/formula-config')
      .then(r => r.json())
      .then((data: any) => {
        setDbTypes(Array.isArray(data.types)  ? data.types  : []);
        setDbCombos(Array.isArray(data.combos) ? data.combos : []);
      })
      .catch(() => { /* keep hard-coded fallback */ });
  }, []);

  /* fetch accessory products once when reaching ราคา step with motor */
  useEffect(() => {
    if (step !== STEP_PRICE || systemMain !== 'motor') return;
    setAccProducts([]);
    fetch(`/api/products?category=${encodeURIComponent('อุปกรณ์เสริมรางม่าน-มอร์เตอร์')}&ptype=${motorType}&includeBoqUsed=true`)
      .then(r => r.json())
      .then((data: any) => setAccProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [step, systemMain, motorType]);

  /* fetch ด้ามจูง + ตะขอ products for non-motor systems */
  useEffect(() => {
    if (step !== STEP_PRICE || systemMain === 'motor') return;
    if (wandProducts.length === 0)
      fetch(`/api/products?category=${encodeURIComponent('ด้ามจูง')}&includeBoqUsed=true`)
        .then(r => r.json())
        .then((data: any) => setWandProducts(Array.isArray(data) ? data : []))
        .catch(() => {});
    if (hookProducts.length === 0)
      fetch(`/api/products?category=${encodeURIComponent('ตะขอสายรวบม่าน')}&includeBoqUsed=true`)
        .then(r => r.json())
        .then((data: any) => setHookProducts(Array.isArray(data) ? data : []))
        .catch(() => {});
    if (manualAccProducts.length === 0)
      fetch(`/api/products?category=${encodeURIComponent('อุปกรณ์เสริมรางม่าน-แมนนวล')}&includeBoqUsed=true`)
        .then(r => r.json())
        .then((data: any) => setManualAccProducts(Array.isArray(data) ? data : []))
        .catch(() => {});
  }, [step, systemMain]);

  /* auto-set ตะขอ qty: Pleated/S-Curve/S-Fold + manual (lon: thick only) */
  useEffect(() => {
    if (step !== STEP_PRICE || !isFullFlow || systemMain !== 'manual' || isBackoutFabric) return;
    if (typeId === 'lon' && fabricOpacity !== 'thick') return;
    setAcc2Qty(direction === 'center' ? '2' : '1');
  }, [step, isFullFlow, typeId, systemMain, fabricOpacity, direction, isBackoutFabric]);

  /* auto-update ด้ามจูง qty when direction changes */
  useEffect(() => {
    if (!acc1Label || systemMain === 'motor' || isBlackoutLon) return;
    setAcc1Qty(direction === 'center' ? '2' : '1');
  }, [direction, acc1Label, systemMain, isBlackoutLon]);

  /* fetch rail products when reaching ราคา step (re-fetch when system or rail categories change) */
  useEffect(() => {
    if (step !== STEP_PRICE) return;
    const cat = systemMain === 'motor' ? activeRailCat.motor : activeRailCat.manual;
    if (!cat) { setRailProducts([]); return; }
    setRailProducts([]);
    setLoadingRail(true);
    fetch(`/api/products?category=${encodeURIComponent(cat)}&includeBoqUsed=true`)
      .then(r => r.json())
      .then((data: any) => {
        setRailProducts(Array.isArray(data) ? data : []);
        setLoadingRail(false);
      })
      .catch(() => setLoadingRail(false));
  }, [step, typeId, systemMain, activeRailCat.motor, activeRailCat.manual]);

  /* filter rail products by motorType (RTS/WT) and window width */
  const hasRailSystem = railProducts.some(p => p.ptype === 'RTS' || p.ptype === 'WT');
  const filteredRailProducts = useMemo(() => {
    if (!hasRailSystem) return railProducts;
    /* filter by ptype only — do NOT filter by width (gap in ranges causes missing items) */
    return railProducts.filter(p => p.ptype === motorType);
  }, [railProducts, motorType, hasRailSystem]);

  /* filter products: search query only */
  const filteredProducts = useMemo(() => {
    setProductPage(1);
    if (!productQ.trim()) return allProducts;
    const q = productQ.trim().toLowerCase();
    return allProducts.filter(p =>
      (p.code ?? '').toLowerCase().includes(q) ||
      (p.name ?? '').toLowerCase().includes(q)
    );
  }, [allProducts, productQ]);

  const totalPages     = Math.ceil(filteredProducts.length / PRODUCT_PER_PAGE);
  const pagedProducts  = filteredProducts.slice((productPage - 1) * PRODUCT_PER_PAGE, productPage * PRODUCT_PER_PAGE);

  const selectProduct = (p: Product) => {
    markDirty();
    if (selectedCode === p.code) {
      setSelectedCode('');
      setUnitPrice('');
      setFaceOverride('');
      return;
    }
    setSelectedCode(p.code);
    if (p.price > 0) setUnitPrice(String(p.price));
    if (p.face_width && parseFloat(String(p.face_width)) > 0) {
      setFaceOverride(String(p.face_width));
    }
  };

  const handleAdd = async () => {
    if (handlingRef.current) return;
    handlingRef.current = true;
    try {
    if (editMode && !isDirty && editRow) { onAdd(editRow); onClose(); return; }
    if (!typeInfo) return;
    if (system === 'motor' && (!acc1Label.trim() || !acc2Label.trim())) {
      const missing = [!acc1Label.trim() && 'อุปกรณ์เสริม 1', !acc2Label.trim() && 'อุปกรณ์เสริม 2'].filter(Boolean).join(' และ ');
      const { isConfirmed } = await Swal.fire({
        title: `${missing} ยังว่างอยู่`,
        text: 'ต้องการบันทึกโดยไม่ระบุอุปกรณ์เสริมไหม?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1f2937',
        cancelButtonColor: '#e5e7eb',
        confirmButtonText: 'บันทึกต่อ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        focusCancel: true,
      });
      if (!isConfirmed) { setTimeout(() => { handlingRef.current = false; }, 200); return; }
    }
    const opacityPart = opacityInfo ? `-${opacityInfo.label}` : '';
    const ceilingPart = isFullFlow && ceilingType ? ` | ${ceilingType}` : '';
    const motorSidePart = system === 'motor' && motorSideLabel ? ` | ${motorSideLabel}` : '';
    const desc = `${typeInfo.label}${opacityPart} | ${dirLabel} | ${systemLabel}${ceilingPart}${motorSidePart}`;
    const sizeStr = w && h ? `W.${parseFloat(width).toFixed(2)}×H.${parseFloat(height).toFixed(2)}` : '';
    const row: BoqRow = {
      id: editRow?.id ?? nid(), type: 'item',
      no: editRow?.no ?? String(nextNo),
      size: sizeStr,
      desc,
      code: selectedCode,
      faceW: face,
      unitPrice: upNum > 0 ? String(Math.round(upNum)) : '0',
      qty: computed?.label ?? '',
      price: f2(rawPrice),
      discount: discNum ? `-${f2(discNum)}` : '0',
      net: f2(net),
      rail: railCost > 0 ? Math.round(railCost).toLocaleString('th-TH') : '—',
      motor: hasCombos ? '-' : (system === 'motor' ? (motorNum > 0 ? Math.round(motorNum).toLocaleString('th-TH') : '-') : '-'),
      c13: system === 'motor' ? '-' : (acc1Num > 0 ? Math.round(acc1Num).toLocaleString('th-TH') : '-'),
      hook: system === 'motor' ? '-' : (acc2Num > 0 ? Math.round(acc2Num).toLocaleString('th-TH') : '-'),
      acc1: acc1Label || undefined,
      acc2: acc2Label || undefined,
      acc3: acc3Label || undefined,
      acc3p: system === 'motor'
        ? ((acc1Num + acc2Num) > 0 ? Math.round(acc1Num + acc2Num).toLocaleString('th-TH') : undefined)
        : (acc3Num > 0 ? Math.round(acc3Num).toLocaleString('th-TH') : undefined),
      sewing:  hasCombos && sewingAmt > 0 ? sewingAmt.toLocaleString('th-TH') : '—',
      install: hasCombos && setupAmt  > 0 ? setupAmt.toLocaleString('th-TH')  : '—',
      sets: railQtyNum > 0 ? String(railQtyNum) : '0',
      unit: 'ชุด',
      total: f2(total * railQtyNum),
    };
    /* mark selected products as boq_used */
    const idsToMark: number[] = [];
    const fabricProd = allProducts.find(p => p.code === selectedCode);
    if (fabricProd && fabricProd.status !== 'boq_used') idsToMark.push(fabricProd.id);
    if (railSelectedId !== null) idsToMark.push(railSelectedId);
    if (idsToMark.length > 0) {
      await Promise.all(idsToMark.map(id =>
        fetch(`/api/pdb/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'boq_used' }),
        })
      ));
    }
    onAdd(row);
    onClose();
    handlingRef.current = false;
    } catch {
      handlingRef.current = false;
    }
  };

  const pickType = (id: string) => {
    markDirty();
    setTypeId(id);
    setFabricOpacity('');
    setSelectedCode('');
    setStep(2);
  };

  const needsOpacity = NEEDS_OPACITY.has(typeId);

  const canNext =
    step === 1                      ? !!typeId :
    step === 2                      ? !!systemMain :
    isFullFlow && step === 3           ? !!fabricOpacity :
    isFullFlow && step === 4           ? (systemMain !== 'motor' || !!motorSide) :
    isFullFlow && step === STEP_CEILING ? !!ceilingType :
    step === STEP_FABRIC               ? (!isFullFlow && needsOpacity ? !!fabricOpacity : true) :
    step === STEP_SIZE              ? (w > 0 && h > 0) :
    !!unitPrice && (system !== 'motor' || !hasRailDropdown || railNum > 0 || isBackoutFabric);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey) return;
      if (!canNext) return;
      if (step < STEP_PRICE) setStep(s => s + 1);
      else handleAdd();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canNext, step, handleAdd]);

  return (
    <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'#F8F5F0',borderRadius:20,width:'100%',maxWidth:900,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.25)',display:'flex',flexDirection:'column' }}>

        {/* ── Header ── */}
        <div style={{ background:'#fff',borderBottom:'1px solid #E5E0D5',padding:'18px 28px',borderRadius:'20px 20px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div>
            <div style={{ fontSize:11,letterSpacing:'0.2em',color:'#9ca3af',textTransform:'uppercase',marginBottom:2 }}>{editMode ? 'แก้ไขรายการ BOQ' : 'เพิ่มรายการ BOQ'}</div>
            <div style={{ fontSize:17,fontWeight:600,color:'#1F3A3A' }}>{editMode ? `✏️ แก้ไขรายการ #${editRow?.no ?? '—'}` : 'สร้างรายการใหม่'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af',lineHeight:1 }}>×</button>
        </div>

        {/* ── Progress ── */}
        <div style={{ background:'#fff',borderBottom:'1px solid #E5E0D5',padding:'14px 28px',display:'flex',alignItems:'center',gap:0,flexShrink:0 }}>
          {STEPS.map((lbl, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={n} style={{ display:'flex',alignItems:'center',flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div onClick={(done || editMode) ? () => setStep(n) : undefined}
                  style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0,cursor: (done || editMode) ? 'pointer' : 'default' }}>
                  <div style={{ width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,transition:'opacity .15s',
                    background: done ? '#C9A581' : active ? '#1F3A3A' : '#E5E0D5',
                    color: done || active ? '#fff' : '#6B6B6B',
                  }}>{done ? '✓' : n}</div>
                  <div>
                    <div style={{ fontSize:10,color:'#9ca3af' }}>ขั้นที่ {n}</div>
                    <div style={{ fontSize:11,fontWeight: active ? 600 : 400, color: active ? '#1F3A3A' : done ? '#C9A581' : '#6b7280' }}>{lbl}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex:1,height:1,background:'#E5E0D5',margin:'0 10px' }} />}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'28px',flex:1 }}>

          {/* STEP 1 — ประเภทม้าน */}
          {step === 1 && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:24 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ 1</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>เลือกประเภทม้าน</div>
              </div>

              <div style={{ marginBottom:16 }}>
                <SectionLabel color="#1F3A3A" label="กลุ่ม G1" sub="Pleated / S-Curve / S-Fold — คิดปริมาณเป็นหลา (yd)" />
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                  {CURTAIN_TYPES.filter(t => t.group === 'G1').map(t => (
                    <TypeCard key={t.id} id={t.id} label={t.label} sub={t.sub} icon={ICONS[t.id]} selected={typeId === t.id} onSelect={pickType} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <SectionLabel color="#7B9E87" label="กลุ่ม G4" sub="ม่านพับ — คิดปริมาณเป็นตร.หลา (sqy)" />
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
                  {CURTAIN_TYPES.filter(t => t.group === 'G4').map(t => (
                    <TypeCard key={t.id} id={t.id} label={t.label} sub={t.sub} icon={ICONS[t.id]} selected={typeId === t.id} onSelect={pickType} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <SectionLabel color="#C9A581" label="กลุ่ม G2" sub="ม่านม้วน / มู่ลี่ / มุ้งจีบ — ตร.หลา (sqy)" />
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                  {CURTAIN_TYPES.filter(t => t.group === 'G2').map(t => (
                    <TypeCard key={t.id} id={t.id} label={t.label} sub={t.sub} icon={ICONS[t.id]} selected={typeId === t.id} onSelect={pickType} />
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel color="#9ca3af" label="ประเภทพิเศษ" sub="สูตรเฉพาะ · ใช้น้อย" />
                <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
                  {SPECIAL_TYPES.map(t => (
                    <TypeCard key={t.id} id={t.id} label={t.label} sub={t.sub} icon={ICONS[t.id]} selected={typeId === t.id} onSelect={pickType} special />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STEP 2 — ระบบ */}
          {step === 2 && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:28 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ 2</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>เลือกระบบ</div>
              </div>

              {/* Main system — 2 cards */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,maxWidth:400,margin:'0 auto 24px' }}>
                {SYSTEMS_MAIN.map(s => (
                  <div key={s.id} onClick={() => { markDirty(); setSystemMain(s.id as 'manual' | 'motor'); if (s.id === 'motor') setManualRope(false); }}
                    style={{ borderRadius:16,padding:'24px 16px',border:`2px solid ${systemMain === s.id ? '#1F3A3A' : '#E5E0D5'}`,background: systemMain === s.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .2s' }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>{s.icon}</div>
                    <div style={{ fontWeight:700,fontSize:15,color: systemMain === s.id ? '#fff' : '#1F3A3A' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Sub-type: rope — only when manual selected */}
              {systemMain === 'manual' && (
                <div style={{ maxWidth:400,margin:'0 auto 24px' }}>
                  <div style={{ fontSize:11,color:'#9ca3af',marginBottom:8,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' }}>รูปแบบ</div>
                  <div style={{ display:'flex',gap:10 }}>
                    <button onClick={() => { markDirty(); setManualRope(false); setStep(p => p + 1); }}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${!manualRope ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:!manualRope?'#1F3A3A':'#fff',color:!manualRope?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      🖐️ มือปัด
                    </button>
                    <button onClick={() => { markDirty(); setManualRope(true); setStep(p => p + 1); }}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${manualRope ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:manualRope?'#1F3A3A':'#fff',color:manualRope?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      🪢 เชือกดึง
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-type: motor RTS / WT */}
              {systemMain === 'motor' && (
                <div style={{ maxWidth:400,margin:'0 auto 24px' }}>
                  <div style={{ fontSize:11,color:'#9ca3af',marginBottom:8,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' }}>ระบบมอเตอร์</div>
                  <div style={{ display:'flex',gap:10 }}>
                    <button onClick={() => { markDirty(); setMotorType('RTS'); setStep(p => p + 1); }}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${motorType === 'RTS' ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:motorType==='RTS'?'#1F3A3A':'#fff',color:motorType==='RTS'?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      📡 RTS
                    </button>
                    <button onClick={() => { markDirty(); setMotorType('WT'); setStep(p => p + 1); }}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${motorType === 'WT' ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:motorType==='WT'?'#1F3A3A':'#fff',color:motorType==='WT'?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      🔌 WT
                    </button>
                  </div>
                </div>
              )}

              {/* Direction — non-sfold only (sfold has its own opening-style step) */}
              {!isFullFlow && (
                <div style={{ maxWidth:400,margin:'0 auto' }}>
                  <div style={{ fontSize:11,color:'#9ca3af',marginBottom:8,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' }}>ทิศทาง</div>
                  <div style={{ display:'flex',gap:10 }}>
                    {DIRECTIONS.map(d => (
                      <button key={d.id} onClick={() => setDirection(d.id)}
                        style={{ flex:1,padding:'9px 0',border:`1.5px solid ${direction === d.id ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background: direction === d.id ? '#1F3A3A' : '#fff',color: direction === d.id ? '#fff' : '#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s' }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {systemMain === 'motor' && (
                    <>
                      <div style={{ fontSize:11,color:'#9ca3af',marginBottom:8,marginTop:14,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' }}>ตำแหน่งมอเตอร์</div>
                      <div style={{ display:'flex',gap:10 }}>
                        {MOTOR_OPENINGS.map(d => (
                          <button key={d.id} onClick={() => setDirection(d.id)}
                            style={{ flex:1,padding:'9px 0',border:`1.5px solid ${direction === d.id ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background: direction === d.id ? '#1F3A3A' : '#fff',color: direction === d.id ? '#fff' : '#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s' }}>
                            {d.icon} {d.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 3 (sfold) — ทึบ / โปร่ง */}
          {isFullFlow && step === 3 && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:28 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>ชนิดผ้า</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:560,margin:'0 auto' }}>
                {FABRIC_OPACITY.map(f => (
                  <div key={f.id} onClick={() => { markDirty(); setFabricOpacity(f.id); setStep(p => p + 1); }}
                    style={{ borderRadius:16,padding:'32px 16px',border:`2px solid ${fabricOpacity === f.id ? '#1F3A3A' : '#E5E0D5'}`,background: fabricOpacity === f.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                    <div style={{ fontSize:48,marginBottom:12,lineHeight:1 }}>{f.icon}</div>
                    <div style={{ fontWeight:700,fontSize:20,color: fabricOpacity === f.id ? '#fff' : '#1F3A3A',marginBottom:6 }}>{f.label}</div>
                    <div style={{ fontSize:11,color: fabricOpacity === f.id ? 'rgba(255,255,255,0.6)' : '#9ca3af',lineHeight:1.5 }}>{f.sub}</div>
                    {fabricOpacity === f.id && <div style={{ marginTop:10,fontSize:11,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 10px',borderRadius:20,color:'#fff' }}>เลือกแล้ว ✓</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 4 (sfold) — Opening style */}
          {isFullFlow && step === 4 && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:28 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>Opening style</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:480,margin:'0 auto' }}>
                {SFOLD_OPENINGS.map(d => (
                  <div key={d.id} onClick={() => { markDirty(); setDirection(d.id); if (systemMain !== 'motor') setStep(p => p + 1); }}
                    style={{ borderRadius:16,padding:'28px 16px',border:`2px solid ${direction === d.id ? '#1F3A3A' : '#E5E0D5'}`,background: direction === d.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                    <div style={{ fontSize:40,marginBottom:10,lineHeight:1 }}>{d.icon}</div>
                    <div style={{ fontWeight:700,fontSize:16,color: direction === d.id ? '#fff' : '#1F3A3A' }}>{d.label}</div>
                    {direction === d.id && <div style={{ marginTop:8,fontSize:11,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 10px',borderRadius:20,color:'#fff' }}>เลือกแล้ว ✓</div>}
                  </div>
                ))}
              </div>
              {systemMain === 'motor' && (
                <>
                  <div style={{ fontSize:11,color:'#9ca3af',fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase',textAlign:'center',margin:'20px 0 10px' }}>ตำแหน่งมอเตอร์ <span style={{ color:'#dc2626' }}>*</span></div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,maxWidth:260,margin:'0 auto' }}>
                    {MOTOR_OPENINGS.map(d => (
                      <div key={d.id} onClick={() => { markDirty(); setMotorSide(d.id); setStep(p => p + 1); }}
                        style={{ borderRadius:12,padding:'12px 10px',border:`2px solid ${motorSide === d.id ? '#1F3A3A' : '#E5E0D5'}`,background: motorSide === d.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                        <div style={{ fontSize:24,marginBottom:6,lineHeight:1 }}>{d.icon}</div>
                        <div style={{ fontWeight:700,fontSize:13,color: motorSide === d.id ? '#fff' : '#1F3A3A' }}>{d.label}</div>
                        {motorSide === d.id && <div style={{ marginTop:6,fontSize:10,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 8px',borderRadius:20,color:'#fff' }}>✓</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* STEP 5 (sfold) — รูปแบบฝ้า */}
          {isFullFlow && step === STEP_CEILING && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:28 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>รูปแบบฝ้า</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:420,margin:'0 auto' }}>
                {CEILING_TYPES.map(c => (
                  <div key={c.id} onClick={() => { markDirty(); setCeilingType(c.id); setStep(p => p + 1); }}
                    style={{ borderRadius:14,padding:'18px 14px',border:`2px solid ${ceilingType === c.id ? '#1F3A3A' : '#E5E0D5'}`,background: ceilingType === c.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                    <div style={{ fontWeight:700,fontSize:20,color: ceilingType === c.id ? '#fff' : '#1F3A3A',marginBottom:6 }}>{c.label}</div>
                    {!['D+Fit','offset-D','offset-N/D'].includes(c.id) && <div style={{ marginTop:4,display:'flex',justifyContent:'center',gap:6,flexWrap:'wrap' }}>
                      {c.box    && <span style={{ fontSize:10,background: ceilingType===c.id?'rgba(255,255,255,0.15)':'#F0EBE3',color: ceilingType===c.id?'#C9A581':'#7a5c2e',borderRadius:4,padding:'1px 6px' }}>มีกล่อง</span>}
                      {c.fit    && <span style={{ fontSize:10,background: ceilingType===c.id?'rgba(255,255,255,0.15)':'#F0EBE3',color: ceilingType===c.id?'#C9A581':'#7a5c2e',borderRadius:4,padding:'1px 6px' }}>ฟิตฝ้า</span>}
                      {c.offset && <span style={{ fontSize:10,background: ceilingType===c.id?'rgba(255,255,255,0.15)':'#F0EBE3',color: ceilingType===c.id?'#C9A581':'#7a5c2e',borderRadius:4,padding:'1px 6px' }}>offset</span>}
                    </div>}
                    <div style={{ marginTop:8,fontSize:9,color: ceilingType===c.id?'rgba(255,255,255,0.45)':'#9ca3af',letterSpacing:'0.08em',textTransform:'uppercase' }}>ความหมาย</div>
                    {c.sub && <div style={{ marginTop:3,fontSize:10,background:'#F0EBE3',color:'#1F3A3A',borderRadius:6,padding:'3px 8px',display:'inline-block',lineHeight:1.5 }}>{c.sub}</div>}
                    {ceilingType === c.id && <div style={{ marginTop:8,fontSize:11,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 10px',borderRadius:20,color:'#fff' }}>เลือกแล้ว ✓</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP FABRIC — เลือกผ้า */}
          {step === STEP_FABRIC && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:16 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>เลือกผ้า / สินค้า</div>
              </div>


              {/* ── Opacity gate: only for non-sfold (sfold chose opacity in step 3) ── */}
              {!isFullFlow && needsOpacity && !fabricOpacity ? (
                <div style={{ textAlign:'center',paddingTop:4 }}>
                  <div style={{ fontSize:13,fontWeight:600,color:'#1F3A3A',marginBottom:4 }}>เลือกชนิดผ้า</div>
                  <div style={{ fontSize:11,color:'#9ca3af',marginBottom:22 }}>บันทึกลงรายการ BOQ — กรุณาเลือกก่อนดูสินค้า</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,maxWidth:560,margin:'0 auto' }}>
                    {FABRIC_OPACITY.map(f => (
                      <div key={f.id} onClick={() => setFabricOpacity(f.id)}
                        style={{ borderRadius:16,padding:'28px 16px',border:'2px solid #E5E0D5',background:'#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                        <div style={{ fontSize:44,marginBottom:10,lineHeight:1 }}>{f.icon}</div>
                        <div style={{ fontWeight:700,fontSize:18,color:'#1F3A3A',marginBottom:6 }}>{f.label}</div>
                        <div style={{ fontSize:11,color:'#9ca3af',lineHeight:1.5 }}>{f.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* opacity chip + selected product — same row */}
                  {opacityInfo && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:6,background: fabricOpacity==='thick'?'#1F3A3A':'#F8F5F0',border:`1.5px solid ${fabricOpacity==='thick'?'#1F3A3A':'#C9A581'}`,borderRadius:8,padding:'5px 14px',flexShrink:0,alignSelf:'stretch',justifyContent:'center' }}>
                        <span style={{ fontSize:13,color: fabricOpacity==='thick'?'#fff':'#7a5c2e',fontWeight:600 }}>{opacityInfo.icon} {opacityInfo.label}</span>
                      </div>
                      {selectedCode && (() => {
                        const sp = allProducts.find(p => p.code === selectedCode);
                        if (!sp) return null;
                        return <div style={{ flex:1,minWidth:0 }}><ProductCard product={sp} selected onSelect={() => {}} /></div>;
                      })()}
                      {!isFullFlow && (
                        <button onClick={() => setFabricOpacity('')}
                          style={{ background:'none',border:'1px solid #E5E0D5',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',color:'#9ca3af',fontFamily:'inherit',flexShrink:0 }}>
                          เปลี่ยน
                        </button>
                      )}
                    </div>
                  )}

                  {/* search bar + ส่วนลด */}
                  <div style={{ display:'flex',gap:10,marginBottom:14,alignItems:'flex-end' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12,color:'#dc2626',fontWeight:500,marginBottom:5 }}>เลือกผ้า / สินค้า</div>
                      <div style={{ position:'relative' }}>
                        <div style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#9ca3af',fontSize:15,pointerEvents:'none' }}>🔍</div>
                        <input
                          value={productQ}
                          onChange={e => setProductQ(e.target.value)}
                          placeholder="ค้นหา รหัสสินค้า / ชื่อสินค้า / กลุ่ม..."
                          style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px 9px 36px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }}
                          onFocus={e => (e.target.style.borderColor = '#1F3A3A')}
                          onBlur={e => (e.target.style.borderColor = '#E5E0D5')}
                        />
                        {productQ && (
                          <button onClick={() => setProductQ('')} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:16,lineHeight:1,padding:2 }}>×</button>
                        )}
                      </div>
                    </div>
                    <div style={{ width:90,flexShrink:0 }}>
                      <LabelInput label="ส่วนลด (%)" value={discountPct} onChange={v => { markDirty(); setDiscountPct(v); }} placeholder="35" labelColor="#dc2626" />
                    </div>
                    {selectedCode && isFullFlow && (
                      <div style={{ flexShrink:0 }}>
                        <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>ราคาผ้า ({typeInfo?.unit ?? 'yd'})</div>
                        <div style={{ border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',color:'#6b7280',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap' }}>
                          <span style={{ fontWeight:600,color:'#1F3A3A' }}>{unitPrice || '—'}</span>
                          <a href="/admin/master/products" target="_blank" rel="noreferrer"
                            style={{ fontSize:10,color:'#C9A581',textDecoration:'none' }}>🔒</a>
                        </div>
                      </div>
                    )}
                    {selectedCode && !isFullFlow && (
                      <div style={{ width:120,flexShrink:0 }}>
                        <LabelInput label={`ราคาต่อหน่วย (${typeInfo?.unit ?? 'yd'})`} value={unitPrice} onChange={setUnitPrice} placeholder="เช่น 910" />
                      </div>
                    )}
                  </div>

                  {loadingProducts ? (
                    <div style={{ textAlign:'center',padding:'40px 0',color:'#9ca3af',fontSize:14 }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>⏳</div>
                      กำลังโหลดสินค้า…
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign:'center',padding:'40px 0',color:'#9ca3af',fontSize:14 }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>📦</div>
                      {productQ ? `ไม่พบสินค้าที่ค้นหา "${productQ}"` : 'ไม่พบสินค้าในระบบ'}
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:6 }}>
                        <div style={{ fontSize:11,color:'#9ca3af' }}>
                          พบ {filteredProducts.length.toLocaleString()} รายการ
                          {productQ && allProducts.length !== filteredProducts.length && ` (กรองจาก ${allProducts.length.toLocaleString()})`}
                          {selectedCode && <span style={{ marginLeft:8,color:'#C9A581',fontWeight:600 }}>· เลือก: {selectedCode}</span>}
                        </div>
                        {totalPages > 1 && (
                          <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                            <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1}
                              style={{ padding:'3px 10px',border:'1px solid #E5E0D5',borderRadius:6,background:'#fff',cursor: productPage===1?'default':'pointer',color: productPage===1?'#ccc':'#374151',fontSize:12 }}>‹</button>
                            <span style={{ fontSize:11,color:'#6b7280',padding:'0 4px' }}>{productPage} / {totalPages}</span>
                            <button onClick={() => setProductPage(p => Math.min(totalPages, p + 1))} disabled={productPage === totalPages}
                              style={{ padding:'3px 10px',border:'1px solid #E5E0D5',borderRadius:6,background:'#fff',cursor: productPage===totalPages?'default':'pointer',color: productPage===totalPages?'#ccc':'#374151',fontSize:12 }}>›</button>
                          </div>
                        )}
                      </div>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10,maxHeight:155,overflowY:'auto',paddingRight:4 }}>
                        {pagedProducts.map(p => (
                          <ProductCard key={p.code} product={p} selected={selectedCode === p.code} onSelect={selectProduct} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* STEP SIZE — ขนาด */}
          {step === STEP_SIZE && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:28 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>ขนาด ประตู / หน้าต่าง</div>
              </div>
              <div style={{ maxWidth:520,margin:'0 auto' }}>
                <div style={{ display:'grid',gridTemplateColumns:(formula === 'wave' || formula === 'sfold') ? '1fr 1fr 1fr 1fr' : '1fr 1fr',gap:14,marginBottom:16 }}>
                  <LabelInput label="ความกว้าง (m)" value={width} onChange={v => { markDirty(); setWidth(v); }} placeholder="เช่น 2.50" labelColor="#dc2626" />
                  <LabelInput label="สูง (m)" value={height} onChange={v => { markDirty(); setHeight(v); }} placeholder="เช่น 3.00" labelColor="#dc2626" />
                  {(formula === 'wave' || formula === 'sfold') && (
                    <LabelInput label="เผื่อผ้า (หลา)" value={panels} onChange={v => { markDirty(); setPanels(v); }} placeholder="2" labelColor="#dc2626" />
                  )}
                  {(formula === 'wave' || formula === 'sfold') && (
                    <div>
                      <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>หน้าผ้า</div>
                      <div style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',boxSizing:'border-box',color:'#9ca3af',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                        <span>{face}</span>
                        <span style={{ fontSize:10,color:'#C9A581' }}>🔒</span>
                      </div>
                    </div>
                  )}
                </div>
                {computed && (() => {
                  const loomW = parseFloat(face) || 1.4;
                  const fw    = parseFloat(face) || 1.2;
                  return (
                    <div style={{ marginTop:16,background:'#F8F5F0',borderRadius:12,padding:'14px 18px',border:'1px solid #E5E0D5' }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                        <div style={{ fontSize:11,color:'#9ca3af' }}>ปริมาณที่ใช้ (Auto)</div>
                        <div style={{ fontSize:10,color:'#C9A581',display:'flex',alignItems:'center',gap:4 }}>
                          🔒 <span>แก้สูตรได้ที่ <strong>หน้ากำหนดสูตร BOQ</strong></span>
                        </div>
                      </div>
                      <div style={{ fontSize:20,fontWeight:700,color:'#1F3A3A' }}>{computed.label}</div>

                      {/* sfold formula steps */}
                      {formula === 'sfold' && (() => {
                        const pMult = Number(formulaCfg.formula_p)   || 2.5;
                        const hAdd  = Number(formulaCfg.formula_h)   || 0.3;
                        const eff   = Number(formulaCfg.formula_eff) || 0.9;
                        const Q    = (w * pMult) / loomW;
                        const R    = h + hAdd;
                        const base = computed.qty - panelsNum;
                        return (
                          <div style={{ marginTop:10,paddingTop:10,borderTop:'1px solid #f0ece4',fontFamily:'monospace',fontSize:11,color:'#374151',lineHeight:2 }}>
                            <div><span style={{ color:'#9ca3af' }}>Q =</span> (W × {pMult}) / loomW = ({w} × {pMult}) / {loomW} = <strong>{Q.toFixed(4)}</strong></div>
                            <div><span style={{ color:'#9ca3af' }}>R =</span> H + {hAdd} = {h} + {hAdd} = <strong>{R.toFixed(2)}</strong></div>
                            <div><span style={{ color:'#9ca3af' }}>base =</span> Q × R / {eff} = {Q.toFixed(4)} × {R.toFixed(2)} / {eff} = <strong>{base.toFixed(4)}</strong></div>
                            <div style={{ margin:'4px 0',borderTop:'1px dashed #e5e0d5',color:'#9ca3af',fontSize:10 }}>── สูตรจบที่นี่ ──</div>
                            <div><span style={{ color:'#9ca3af' }}>+ เผื่อผ้า =</span> <strong>{panelsNum} หลา</strong> <span style={{color:'#9ca3af'}}>(default)</span></div>
                            <div style={{ marginTop:2 }}><span style={{ color:'#9ca3af' }}>รวม =</span> {base.toFixed(4)} + {panelsNum} = <strong style={{color:'#1F3A3A',fontSize:13}}>{computed.qty.toFixed(2)} yd</strong></div>
                          </div>
                        );
                      })()}

                      {/* wave formula steps */}
                      {formula === 'wave' && (() => {
                        const hAdd = Number(formulaCfg.formula_h)   || 0.5;
                        const eff  = Number(formulaCfg.formula_eff) || 0.9144;
                        const base = (w * fw * (h + hAdd)) / eff;
                        return (
                          <div style={{ marginTop:10,paddingTop:10,borderTop:'1px solid #f0ece4',fontFamily:'monospace',fontSize:11,color:'#374151',lineHeight:1.9 }}>
                            <div><span style={{ color:'#9ca3af' }}>base =</span> (W × faceW × (H+{hAdd})) / {eff} = ({w} × {fw} × {(h+hAdd).toFixed(2)}) / {eff} = <strong>{base.toFixed(4)}</strong></div>
                            {panelsNum > 0 && <div><span style={{ color:'#9ca3af' }}>total =</span> base + เผื่อผ้า = {base.toFixed(4)} + {panelsNum} = <strong style={{color:'#1F3A3A'}}>{computed.qty.toFixed(2)} yd</strong></div>}
                          </div>
                        );
                      })()}

                      {/* sqy formula steps */}
                      {formula === 'sqy' && (
                        <div style={{ marginTop:10,paddingTop:10,borderTop:'1px solid #f0ece4',fontFamily:'monospace',fontSize:11,color:'#374151',lineHeight:1.9 }}>
                          <div><span style={{ color:'#9ca3af' }}>qty =</span> W × H × 1.196 = {w} × {h} × 1.196 = <strong style={{color:'#1F3A3A'}}>{computed.qty.toFixed(2)} sqy</strong></div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* wood + manual: มู่ลี่ไม้ formula */}
                {(typeId === 'wood' || typeId === 'roller') && (
                  <div style={{ marginTop:16,background:'#fff',borderRadius:12,padding:'16px 18px',border:'1px solid #E5E0D5' }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#1F3A3A',marginBottom:12 }}>สูตรคำนวณหาจำนวนผ้า (หลา)</div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:10 }}>
                      <LabelInput label="C-กว้าง 1 (ม.)" value={woodC1} onChange={v=>{markDirty();setWoodC1(v);}} placeholder="เช่น 1.95" />
                      <LabelInput label="C-กว้าง 2 (ม.)" value={woodC2} onChange={v=>{markDirty();setWoodC2(v);}} placeholder="0" />
                      <LabelInput label="C-กว้าง 3 (ม.)" value={woodC3} onChange={v=>{markDirty();setWoodC3(v);}} placeholder="0" />
                      <div>
                        <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>F-สูง (ม.)</div>
                        <div style={{ border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',color:'#1F3A3A' }}>{h || '—'}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10 }}>
                      <LabelInput label="J-คำนวน *W" value={woodJ} onChange={v=>{markDirty();setWoodJ(v);}} placeholder="1" />
                      <LabelInput label="K-คำนวน +H" value={woodK} onChange={v=>{markDirty();setWoodK(v);}} placeholder="0" />
                      <LabelInput label="N-เผื่อผ้า (หลา)" value={panels} onChange={v=>{markDirty();setPanels(v);}} placeholder="2" />
                      <div>
                        <div style={{ fontSize:12,color:'#9ca3af',marginBottom:5,fontWeight:500 }}>ค่า Q = (C×J)</div>
                        <div style={{ border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',color:'#1F3A3A' }}>{woodQ.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:12,color:'#9ca3af',marginBottom:5,fontWeight:500 }}>ค่า R = F + K</div>
                        <div style={{ border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',color:'#1F3A3A' }}>{woodR.toFixed(2)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:12,color:'#1F3A3A',marginBottom:5,fontWeight:700 }}>จำนวนผ้า (หลา)</div>
                        <div style={{ border:'1.5px solid #1F3A3A',borderRadius:10,padding:'9px 14px',fontSize:14,background:'#F8F5F0',color:'#1F3A3A',fontWeight:700 }}>{woodQty.toFixed(2)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:8,fontSize:11,color:'#dc2626' }}>ช่องสีเทาไม่ต้องกรอกข้อมูล</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP PRICE — ราคา */}
          {step === STEP_PRICE && (
            <>
              <div style={{ display:'flex',alignItems:'baseline',justifyContent:'center',gap:10,marginBottom:24 }}>
                <div style={{ fontSize:22,fontWeight:300,color:'#9ca3af',flexShrink:0 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A' }}>{isSfold && systemMain === 'motor' ? 'เลือกรางมอเตอร์ + รุ่นมอเตอร์' : 'สินค้า + ราคา'}</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20,maxWidth:760,margin:'0 auto' }}>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  {hasRailSystem && (
                    <div style={{ fontSize:11,color:'#9ca3af',fontWeight:600 }}>
                      ระบบ: <span style={{ color:'#1F3A3A' }}>{motorType}</span> · กว้าง {parseFloat(width) || '—'} m
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize:12,color:'#dc2626',marginBottom:5,fontWeight:500 }}>
                      {`ค่าราง / อุปกรณ์${hasCombos ? (systemMain === 'motor' ? ' (฿/ชุด)' : ' (฿/ม.)') : ' (฿)'}`}
                    </div>
                    {/* single grid — ราง + ตะขอ + ด้ามจูง share same column tracks */}
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 56px 70px',rowGap:8,columnGap:6 }}>
                      {/* ── ราง row ── */}
                      {!isBlackoutLon && <><RailComboInput label="" noLabel hidePrice value={railPrice}
                        onChange={v => { markDirty(); setRailPrice(v); }}
                        onSelectId={id => setRailSelectedId(id)}
                        products={filteredRailProducts} loading={loadingRail} windowWidth={w} />
                      <div>
                        <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>จำนวน (ชุด)</div>
                        <input type="number" min="1" value={railQty} onChange={e => { markDirty(); setRailQty(e.target.value); }}
                          style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'center' }}
                          onFocus={e => (e.target.style.borderColor='#1F3A3A')} onBlur={e => (e.target.style.borderColor='#E5E0D5')} />
                      </div>
                      <div>
                        <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>ราคา (฿)</div>
                        <input value={railPrice} onChange={e => { markDirty(); setRailPrice(e.target.value); }} placeholder="—"
                          style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'right' }}
                          onFocus={e => (e.target.style.borderColor='#1F3A3A')} onBlur={e => (e.target.style.borderColor='#E5E0D5')} />
                      </div></>}
                      {/* ── ตะขอ row (conditional) ── */}
                      {hasCombos && system !== 'motor' && !isBlackoutLon && (typeId !== 'lon' || fabricOpacity === 'thick') && <>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>ตะขอ</div>
                          <select title="ตะขอ" value={acc2Label} onChange={e => { markDirty(); const v=e.target.value; setAcc2Label(v); if (!v) { setAcc2Price(''); return; } const p=hookProducts.find(pr=>pr.name===v||pr.code===v); if(p&&p.price>0) setAcc2Price(String(Math.round(p.price))); }}
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:12,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:acc2Label?'#1F3A3A':'#9ca3af',cursor:'pointer' }}>
                            <option value="">— เลือก —</option>
                            {hookProducts.map(p => <option key={p.id} value={p.name||p.code}>{p.name||p.code}{p.price>0?` (฿${p.price.toLocaleString('th-TH')})`:''}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>จำนวน (ชุด)</div>
                          <input title="จำนวน ตะขอ" type="number" min="1" value={acc2Label ? acc2Qty : ''} disabled={!acc2Label} onChange={e=>{markDirty();setAcc2Qty(e.target.value);}}
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'center' }}
                            onFocus={e=>(e.target.style.borderColor='#1F3A3A')} onBlur={e=>(e.target.style.borderColor='#E5E0D5')} />
                        </div>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>ราคา (฿)</div>
                          <input value={acc2Price} onChange={e=>{markDirty();setAcc2Price(e.target.value);}} placeholder="0"
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'right' }}
                            onFocus={e=>(e.target.style.borderColor='#1F3A3A')} onBlur={e=>(e.target.style.borderColor='#E5E0D5')} />
                        </div>
                      </>}
                      {/* ── ด้ามจูง row ── */}
                      {hasCombos && system !== 'motor' && !isBlackoutLon && <>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>ด้ามจูง</div>
                          <select title="ด้ามจูง" value={acc1Label} onChange={e => { markDirty(); const v=e.target.value; setAcc1Label(v); if (!v) { setAcc1Price(''); return; } const p=wandProducts.find(pr=>pr.name===v||pr.code===v); if(p&&p.price>0) setAcc1Price(String(Math.round(p.price))); setAcc1Qty(direction === 'center' ? '2' : '1'); }}
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:12,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:acc1Label?'#1F3A3A':'#9ca3af',cursor:'pointer' }}>
                            <option value="">— เลือก —</option>
                            {wandProducts.map(p => <option key={p.id} value={p.name||p.code}>{p.name||p.code}{p.price>0?` (฿${p.price.toLocaleString('th-TH')})`:''}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>จำนวน (ชุด)</div>
                          <input title="จำนวน ด้ามจูง" type="number" min="1" value={acc1Label ? acc1Qty : ''} disabled={!acc1Label} onChange={e=>{markDirty();setAcc1Qty(e.target.value);}}
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'center' }}
                            onFocus={e=>(e.target.style.borderColor='#1F3A3A')} onBlur={e=>(e.target.style.borderColor='#E5E0D5')} />
                        </div>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>ราคา (฿)</div>
                          <input value={acc1Price} onChange={e=>{markDirty();setAcc1Price(e.target.value);}} placeholder="0"
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'right' }}
                            onFocus={e=>(e.target.style.borderColor='#1F3A3A')} onBlur={e=>(e.target.style.borderColor='#E5E0D5')} />
                        </div>
                      </>}
                      {/* ── อุปกรณ์เสริม rows (motor only) — col1=dropdown(1fr), col2-3=ราคา ── */}
                      {system === 'motor' && ([
                        { n: 1, label: acc1Label, price: acc1Price, setLabel: setAcc1Label, setPrice: setAcc1Price },
                        { n: 2, label: acc2Label, price: acc2Price, setLabel: setAcc2Label, setPrice: setAcc2Price },
                      ] as const).map(({ n, label, price, setLabel, setPrice }) => (
                        <Fragment key={n}>
                          <div>
                            <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>อุปกรณ์เสริม {n}</div>
                            <select value={label} onChange={e => { markDirty(); const v=e.target.value; setLabel(v); if (!v) { setPrice(''); return; } const p=accProducts.find(pr=>pr.name===v||pr.code===v); if(p&&p.price>0) setPrice(String(p.price)); }}
                              style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:label?'#1F3A3A':'#9ca3af',cursor:'pointer' }}>
                              <option value="">— เลือกอุปกรณ์ —</option>
                              {accProducts.map(p => (
                                <option key={p.id} value={p.name||p.code}>{p.name||p.code}{p.price>0?` (฿${p.price.toLocaleString('th-TH')})`:''}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ gridColumn:'2 / span 2' }}>
                            <div style={{ fontSize:11,color:'#6b7280',fontWeight:500,marginBottom:4 }}>ราคา (฿)</div>
                            <input value={price} onChange={e=>{ markDirty(); setPrice(e.target.value); }} placeholder="เช่น 1500"
                              style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 8px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A',textAlign:'right' }}
                              onFocus={e=>(e.target.style.borderColor='#1F3A3A')} onBlur={e=>(e.target.style.borderColor='#E5E0D5')} />
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    {railQtyNum > 1 && railCost > 0 && (
                      <div style={{ fontSize:11,color:'#9ca3af',marginTop:4,whiteSpace:'nowrap' }}>× {railQtyNum} ชุด</div>
                    )}
                    {hasCombos && system !== 'motor' && (
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 56px 70px',rowGap:8,columnGap:6,marginTop:0 }}>
                        <div>
                          <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>อุปกรณ์เสริม</div>
                          <select title="อุปกรณ์เสริม" value={acc3Label} onChange={e => { markDirty(); const v=e.target.value; setAcc3Label(v); if (!v) { setAcc3Price(''); return; } const p=manualAccProducts.find(pr=>pr.name===v||pr.code===v); if(p&&p.price>0) setAcc3Price(String(Math.round(p.price))); }}
                            style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 12px',fontSize:13,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:acc3Label?'#1F3A3A':'#9ca3af',cursor:'pointer' }}>
                            <option value="">— เลือกอุปกรณ์ —</option>
                            {manualAccProducts.map(p => <option key={p.id} value={p.name||p.code}>{p.name||p.code}{p.price>0?` (฿${p.price.toLocaleString('th-TH')})`:''}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn:'2 / span 2', marginTop:-3 }}>
                          <LabelInput label="ราคา (฿)" value={acc3Price} onChange={v=>{markDirty();setAcc3Price(v);}} placeholder="0" />
                        </div>
                      </div>
                    )}
                  </div>
                  {hasCombos && comboInfo && (
                    <div>
                      <div style={{ fontSize:12,color:'#6b7280',marginBottom:7,fontWeight:500 }}>ชุดคิด (ค่าเย็บ + ค่าติดตั้ง)</div>
                      {/* selected combo — pinned top */}
                      <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,background:'#1F3A3A',marginBottom:8 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600,fontSize:12,color:'#fff' }}>{comboInfo.label}</div>
                          <div style={{ fontSize:11,color:'rgba(255,255,255,0.6)' }}>เย็บ {comboInfo.sewing.toLocaleString()}/m · ติดตั้ง {comboInfo.setup.toLocaleString()}/ชุด</div>
                        </div>
                        <span style={{ fontSize:13,color:'#C9A581',fontWeight:700 }}>✓</span>
                      </div>
                      {/* remaining combos — dropdown */}
                      {availableCombos.length > 1 && (
                        <select value={comboId} onChange={e => { markDirty(); setComboId(e.target.value); }}
                          style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:13,background:'#fff',color:'#1F3A3A',fontFamily:'inherit',cursor:'pointer',outline:'none' }}>
                          {availableCombos.map(c => (
                            <option key={c.id} value={c.id}>{c.label} — เย็บ {c.sewing.toLocaleString()} · ติดตั้ง {c.setup.toLocaleString()}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  {system === 'motor' && !hasRailDropdown && (
                    <LabelInput label="ค่ามอเตอร์ (฿)" value={motorPrice} onChange={v => { markDirty(); setMotorPrice(v); }} placeholder="เช่น 18250" />
                  )}
                </div>
                <div style={{ background:'#fff',borderRadius:16,padding:'20px',border:'1px solid #E5E0D5',alignSelf:'start' }}>
                  <div style={{ fontSize:15,color:'#1F3A3A',marginBottom:14,fontWeight:700 }}>สรุปราคา</div>
                  <SumRow label="ปริมาณ" value={computed?.label ?? '—'} />
                  <SumRow label="ราคาผ้า" value={`${f2(rawPrice)} ฿`} />
                  <SumRow label={`ส่วนลด ${discountPct}%`} value={`-${f2(discNum)} ฿`} gold />
                  <SumRow label="ราคาสินค้า" value={`${f2(net)} ฿`} />
                  {railCost > 0 && <SumRow label="ราง/อุปกรณ์" value={`${Math.round(railCost).toLocaleString('th-TH')} ฿`} />}
                  {hasCombos && system !== 'motor' && acc1Num > 0 && <SumRow label="ด้ามจูง" value={`${Math.round(acc1Num).toLocaleString('th-TH')} ฿`} />}
                  {hasCombos && system !== 'motor' && acc2Num > 0 && <SumRow label="ตะขอ" value={`${Math.round(acc2Num).toLocaleString('th-TH')} ฿`} />}
                  {hasCombos && system !== 'motor' && acc3Num > 0 && <SumRow label="อุปกรณ์เสริม" value={`${Math.round(acc3Num).toLocaleString('th-TH')} ฿`} />}
                  {system === 'motor' && acc1Num > 0 && <SumRow label="อุปกรณ์เสริม 1" value={`${Math.round(acc1Num).toLocaleString('th-TH')} ฿`} />}
                  {system === 'motor' && acc2Num > 0 && <SumRow label="อุปกรณ์เสริม 2" value={`${Math.round(acc2Num).toLocaleString('th-TH')} ฿`} />}
                  {!hasCombos && motorNum > 0 && <SumRow label="มอเตอร์" value={`${Math.round(motorNum).toLocaleString('th-TH')} ฿`} />}
                  {hasCombos && sewingAmt > 0 && <SumRow label="ค่าเย็บ" value={`${sewingAmt.toLocaleString('th-TH')} ฿`} />}
                  {hasCombos && setupAmt  > 0 && <SumRow label="ค่าติดตั้ง" value={`${setupAmt.toLocaleString('th-TH')} ฿`} />}
                  <div style={{ borderTop:'1.5px solid #1F3A3A',marginTop:10,paddingTop:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontWeight:700,color:'#1F3A3A' }}>รวมทั้งสิ้น</span>
                    <span style={{ fontWeight:700,fontSize:14,color:'#1F3A3A' }}>{f2(total)} ฿</span>
                  </div>
                  <div style={{ borderTop:'2px solid #dc2626',marginTop:8,paddingTop:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontWeight:700,color:'#dc2626',fontSize:13 }}>ราคารวมสุทธิ <span style={{ fontWeight:400,color:'#9ca3af' }}>({railQtyNum} ชุด)</span></span>
                    <span style={{ fontWeight:700,fontSize:15,color:'#dc2626' }}>{f2(total * railQtyNum)} ฿</span>
                  </div>
                  {selectedCode && (
                    <div style={{ marginTop:10,fontSize:12,color:'#dc2626',fontWeight:600 }}>
                      📦 สินค้า: {selectedCode}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ background:'#fff',borderTop:'1px solid #E5E0D5',padding:'16px 28px',borderRadius:'0 0 20px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <button onClick={onClose} style={{ padding:'8px 20px',border:'1px solid #E5E0D5',borderRadius:10,background:'#fff',fontSize:13,cursor:'pointer',color:'#374151' }}>
              ยกเลิก
            </button>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding:'8px 20px',border:'1px solid #E5E0D5',borderRadius:10,background:'#fff',fontSize:13,cursor:'pointer',color:'#374151' }}>
                ← ก่อนหน้า
              </button>
            )}
            {typeId && <span style={{ fontSize:12,color:'#6b7280' }}>ประเภท: <strong style={{ color:'#1F3A3A' }}>{typeInfo?.label}</strong>{step >= 2 && !!systemMain && <> · ระบบ: <strong style={{ color:'#1F3A3A' }}>{systemLabel}</strong></>}</span>}
          </div>
          {step < STEP_PRICE ? (
            <button disabled={!canNext} onClick={() => setStep(s => s + 1)}
              style={{ padding:'10px 28px',borderRadius:10,border:'none',background: canNext ? '#1F3A3A' : '#E5E0D5',color: canNext ? '#fff' : '#9ca3af',fontWeight:600,fontSize:13,cursor: canNext ? 'pointer' : 'default',display:'flex',alignItems:'center',gap:8,transition:'all .2s' }}>
              ถัดไป: {STEPS[step]}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          ) : (
            <button disabled={!canNext} onClick={handleAdd}
              style={{ padding:'10px 28px',borderRadius:10,border:'none',background: canNext ? '#1F3A3A' : '#E5E0D5',color: canNext ? '#fff' : '#9ca3af',fontWeight:600,fontSize:13,cursor: canNext ? 'pointer' : 'default',display:'flex',alignItems:'center',gap:8 }}>
              {editMode ? '💾 บันทึกการแก้ไข' : '✓ เพิ่มลงใน BOQ'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */
function TypeCard({ id, label, sub, icon, selected, onSelect, special }: { id: string; label: string; sub: string; icon: ReactElement; selected: boolean; onSelect: (id: string) => void; special?: boolean }) {
  return (
    <div onClick={() => onSelect(id)}
      style={{ borderRadius:16,padding:'18px 16px',border:`2px solid ${selected ? '#1F3A3A' : '#E5E0D5'}`,background: selected ? '#1F3A3A' : '#fff',cursor:'pointer',transition:'all .25s',minHeight:130 }}>
      <div style={{ width:52,height:52,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,background: selected ? 'rgba(255,255,255,0.15)' : special ? 'linear-gradient(135deg,#FFF6E5,#F0E0C5)' : 'linear-gradient(135deg,#F8F5F0,#E5E0D5)',color: selected ? '#fff' : '#1F3A3A' }}>
        {icon}
      </div>
      <div style={{ fontWeight:600,fontSize:13,color: selected ? '#fff' : '#1F3A3A',marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:11,color: selected ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>{sub}</div>
      {selected && <div style={{ marginTop:8,fontSize:11,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 10px',borderRadius:20,color:'#fff' }}>เลือกแล้ว ✓</div>}
    </div>
  );
}

function ProductCard({ product: p, selected, onSelect }: { product: Product; selected: boolean; onSelect: (p: Product) => void }) {
  const fw = p.face_width ? parseFloat(String(p.face_width)) : 0;
  return (
    <div onClick={() => onSelect(p)}
      style={{ borderRadius:10,padding:'8px 10px',border:`2px solid ${selected ? '#1F3A3A' : '#E5E0D5'}`,background: selected ? '#1F3A3A' : '#fff',cursor:'pointer',transition:'all .2s',position:'relative' }}>
      {/* Checkbox */}
      <div style={{ position:'absolute',top:8,right:8,width:14,height:14,borderRadius:3,border:`2px solid ${selected ? '#C9A581' : '#C8C2BA'}`,background: selected ? '#C9A581' : '#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s' }}>
        {selected && <svg width="8" height="6" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3.2,5.8 8,1" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:4,marginBottom:3,paddingRight:18 }}>
        <div style={{ fontWeight:600,fontSize:11,color: selected ? '#fff' : '#1F3A3A',flex:1,lineHeight:1.3 }}>{p.name || p.code}</div>
        {fw > 0 && (
          <div style={{ fontSize:9,background: selected ? 'rgba(201,165,129,0.3)' : '#FFF6E5',color: selected ? '#C9A581' : '#7a5c2e',borderRadius:4,padding:'1px 4px',flexShrink:0 }}>fw {fw}m</div>
        )}
      </div>
      {p.price > 0 ? (
        <div style={{ fontWeight:700,fontSize:11,color: selected ? '#C9A581' : '#1F3A3A' }}>
          {Number(p.price).toLocaleString('th-TH')} / {p.unit}
        </div>
      ) : (
        <div style={{ fontSize:10,color: selected ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>— ไม่ระบุราคา</div>
      )}
    </div>
  );
}

function SectionLabel({ color, label, sub }: { color: string; label: string; sub?: string }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14,paddingLeft:4 }}>
      <div style={{ width:4,height:18,borderRadius:2,background:color,flexShrink:0 }} />
      <span style={{ fontWeight:700,fontSize:12,color:'#1F3A3A',letterSpacing:'0.05em' }}>{label}</span>
      {sub && <span style={{ fontSize:11,color:'#9ca3af',fontStyle:'italic' }}>· {sub}</span>}
      <div style={{ flex:1,height:1,background:'#E5E0D5' }} />
    </div>
  );
}

function LabelInput({ label, value, onChange, placeholder, labelColor }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; labelColor?: string }) {
  return (
    <div>
      <div style={{ fontSize:12,color:labelColor ?? '#6b7280',marginBottom:5,fontWeight:500 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }}
        onFocus={e => (e.target.style.borderColor = '#1F3A3A')}
        onBlur={e => (e.target.style.borderColor = '#E5E0D5')}
      />
    </div>
  );
}

function RailComboInput({ label, value, onChange, onSelectId, products, loading, windowWidth, noLabel, hidePrice }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelectId?: (id: number | null) => void;
  products: Product[];
  loading: boolean;
  windowWidth?: number;
  noLabel?: boolean;
  hidePrice?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selName, setSelName] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const matchesWidth = (p: Product) => {
    if (!windowWidth || windowWidth <= 0) return false;
    const w1 = parseFloat(p.width1 ?? '') || 0;
    const w2 = parseFloat(p.width2 ?? '') || 0;
    if (w2 <= 0) return false;
    return windowWidth >= w1 && windowWidth <= w2;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* auto-select: (1) restore by price in edit mode, (2) auto-match by window width */
  useEffect(() => {
    if (products.length === 0) return;
    if (!selName && value) {
      const priceNum = parseFloat(value.replace(/,/g, ''));
      const match = products.find(p => p.price > 0 && Math.abs(p.price - priceNum) < 1);
      if (match) { setSelName(match.name || match.code); onSelectId?.(match.id); return; }
    }
    if (!selName && !value && windowWidth && windowWidth > 0) {
      const match = products.find(matchesWidth);
      if (match) {
        onChange(match.price > 0 ? String(match.price) : '');
        onSelectId?.(match.id);
        setSelName(match.name || match.code);
      }
    }
  }, [products]);

  const hasWidthRange = windowWidth && windowWidth > 0 && products.some(p => parseFloat(p.width2 ?? '') > 0);
  const filtered = products.filter(p => {
    if (hasWidthRange && !matchesWidth(p)) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return (p.code ?? '').toLowerCase().includes(ql) || (p.name ?? '').toLowerCase().includes(ql);
  });

  const handleSelect = (p: Product) => {
    onChange(p.price > 0 ? String(p.price) : '');
    onSelectId?.(p.id);
    setSelName(p.name || p.code);
    setQ('');
    setOpen(false);
  };

  const handleClear = () => { onChange(''); onSelectId?.(null); setSelName(''); };

  const inputStyle: React.CSSProperties = {
    width:'100%', border:'1.5px solid #E5E0D5', borderRadius:10, padding:'9px 14px',
    fontSize:13, outline:'none', background:'#fff', boxSizing:'border-box',
    fontFamily:'inherit', color:'#1F3A3A',
  };

  return (
    <div>
      {!noLabel && <div style={{ fontSize:12,color:'#dc2626',marginBottom:5,fontWeight:500 }}>{label}</div>}
      <div style={{ display:'flex',gap:8 }}>

        {/* ── Product picker ── */}
        <div ref={wrapRef} style={{ flex:1,position:'relative' }}>
          <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>รหัสสินค้า</div>
          {selName ? (
            <div style={{ display:'flex',alignItems:'center',gap:6,border:'1.5px solid #1F3A3A',borderRadius:10,padding:'9px 12px',background:'#fff' }}>
              <span style={{ flex:1,fontSize:12,fontWeight:600,color:'#1F3A3A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>📦 {selName}</span>
              <button onClick={handleClear} style={{ background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:15,lineHeight:1,padding:0,flexShrink:0 }}>✕</button>
            </div>
          ) : (
            <div onClick={() => !loading && setOpen(o => !o)}
              style={{ display:'flex',alignItems:'center',gap:6,border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 12px',background:'#fff',cursor: loading ? 'default' : 'pointer' }}>
              <span style={{ flex:1,fontSize:12,color:'#9ca3af' }}>
                {loading ? '⏳ กำลังโหลด...' : '🔍 เลือกรายการ'}
              </span>
              <span style={{ fontSize:10,color:'#9ca3af' }}>▾</span>
            </div>
          )}
          {open && !loading && (
            <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:50,background:'#fff',border:'1.5px solid #E5E0D5',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',overflow:'hidden' }}>
              <div style={{ padding:'8px 10px',borderBottom:'1px solid #E5E0D5' }}>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหา ชื่อ / รหัสสินค้า..." autoFocus
                  style={{ width:'100%',border:'1px solid #E5E0D5',borderRadius:8,padding:'7px 10px',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }} />
              </div>
              <div style={{ maxHeight:200,overflowY:'auto' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding:'14px',textAlign:'center',fontSize:12,color:'#9ca3af' }}>ไม่พบรายการ</div>
                ) : filtered.map(p => (
                  <div key={p.code} onClick={() => handleSelect(p)}
                    style={{ padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid #F8F5F0',display:'flex',alignItems:'center',gap:10 }}
                    onMouseEnter={e => (e.currentTarget.style.background='#F8F5F0')}
                    onMouseLeave={e => (e.currentTarget.style.background='')}>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:10,color:'#9ca3af',fontFamily:'monospace' }}>{p.code}</div>
                      <div style={{ fontSize:12,fontWeight:600,color:'#1F3A3A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.name || '—'}</div>
                    </div>
                    <div style={{ flexShrink:0, textAlign:'right' }}>
                      {matchesWidth(p) && (
                        <div style={{ fontSize:9, color:'#166534', background:'#D1F2D7', borderRadius:4, padding:'1px 5px', marginBottom:2 }}>ตรงขนาด ✓</div>
                      )}
                      <div style={{ fontSize:13, fontWeight:700, color: matchesWidth(p) ? '#166534' : '#C9A581' }}>
                        {p.price > 0 ? `฿${Number(p.price).toLocaleString('th-TH')}` : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Price input ── */}
        {!hidePrice && (
        <div style={{ width:70,flexShrink:0 }}>
          <div style={{ fontSize:11,color:'#6b7280',marginBottom:3 }}>ราคา (฿)</div>
          <input value={value} onChange={e => onChange(e.target.value)} placeholder="เช่น 15850"
            style={{ ...inputStyle, textAlign:'right' }}
            onFocus={e => (e.target.style.borderColor='#1F3A3A')}
            onBlur={e => (e.target.style.borderColor='#E5E0D5')} />
        </div>
        )}

      </div>
    </div>
  );
}

function SumRow({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'4px 0',color: gold ? '#dc2626' : '#374151' }}>
      <span>{label}</span>
      <span style={{ fontWeight:500 }}>{value}</span>
    </div>
  );
}
