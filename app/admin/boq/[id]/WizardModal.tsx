'use client';

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface BoqRow {
  id: string; type: 'item'; no?: string; size?: string; desc?: string;
  code?: string; faceW?: string; unitPrice?: string; qty?: string;
  price?: string; discount?: string; net?: string; rail?: string;
  motor?: string; c13?: string; hook?: string; sewing?: string;
  install?: string; unit?: string; total?: string;
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
}

interface DbSewingCombo {
  id: number;
  type_id: string;
  combo_key: string;
  label: string;
  system: 'manual' | 'motor';
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
  system: 'manual' | 'motor';
  sewing: number;
  setup: number;
}

/* curtain type → product category */
const TYPE_TO_CATEGORY: Record<string, string> = {
  wave:     '🧵 ผ้าม่าน ทึบ-โปร่ง',
  lon:      '🧵 ผ้าม่าน ทึบ-โปร่ง',
  sfold:    '🧵 ผ้าม่าน ทึบ-โปร่ง',
  roman:    '🧵 ผ้าม่าน ทึบ-โปร่ง',
  roller:   '📜 ม่านม้วน',
  wood:     '▤ มู่ลี่ไม้',
  net:      '▩ มุ้งจีบ',
  bay:      '🧵 ผ้าม่าน ทึบ-โปร่ง',
  hospital: '🧵 ผ้าม่าน ทึบ-โปร่ง',
};

interface Props {
  onClose: () => void;
  onAdd: (row: BoqRow) => void;
  nextNo: number;
  editRow?: BoqRow;
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
let _uid = 0;
const nid = () => `row_${++_uid}_${Math.random().toString(36).slice(2, 7)}`;

const CURTAIN_TYPES = [
  { id: 'wave',     label: 'ม่านจีบ',         sub: 'สูตร G1 · หลากหลายที่สุด', face: '1.20', unit: 'yd',  formula: 'wave', group: 'G1' },
  { id: 'lon',      label: 'ม่านลอน',          sub: 'สูตร G1 · ทรงคลื่น',       face: '1.20', unit: 'yd',  formula: 'wave', group: 'G1' },
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
  { id: 'blackout' as const, label: 'Blackout', sub: 'Blackout 100% · กันแสงสนิท', icon: '⬛' },
  { id: 'thick'    as const, label: 'ทึบ',       sub: 'Dimout · ซับหลัง',            icon: '🌑' },
  { id: 'sheer'    as const, label: 'โปร่ง',      sub: 'Sheer · Voile · ลูกไม้',      icon: '🌤️' },
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

/* typeId → { motor, manual } rail product categories */
const RAIL_CATEGORY: Partial<Record<string, { motor: string; manual: string }>> = {
  sfold: { motor: 'รางลอน-กระดุม-มอร์เตอร์', manual: 'รางลอน-กระดุม' },
  lon:   { motor: 'รางลอน-กระดุม-มอร์เตอร์', manual: 'รางลอน-กระดุม' },
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

  let typeId = '';
  const sortedTypes = [...ALL_TYPES].sort((a, b) => b.label.length - a.label.length);
  for (const t of sortedTypes) {
    if (desc0.startsWith(t.label)) { typeId = t.id; break; }
  }

  const fabricOpacity: 'blackout'|'thick'|'sheer'|'' =
    desc0.includes('Blackout') ? 'blackout' : desc0.includes('ทึบ') ? 'thick' : desc0.includes('โปร่ง') ? 'sheer' : '';

  let direction = 'center';
  for (const d of [...DIRECTIONS, ...SFOLD_OPENINGS]) {
    if (dir0 === d.label) { direction = d.id; break; }
  }

  const systemMain: 'manual'|'motor' = sys0.includes('มอเตอร์') ? 'motor' : 'manual';
  const manualRope = sys0.includes('เชือกดึง');

  const sm = (row.size ?? '').match(/W\.([0-9.]+).*H\.([0-9.]+)/);

  const priceN = parseFloat((row.price    ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const discN  = parseFloat((row.discount ?? '0').replace(/[^0-9.]/g, '')) || 0;
  const discountPct = priceN > 0 && discN > 0
    ? String(Math.round(discN / priceN * 100)) : '30';

  const toPrice = (s?: string) => (!s || s === '—') ? '' : s.replace(/,/g, '').replace(/[^0-9.]/g, '');

  const w0 = parseFloat(sm?.[1] ?? '0') || 0;
  const sewingN = parseFloat((row.sewing ?? '').replace(/[^0-9.]/g, '')) || 0;
  let comboId = systemMain === 'motor' ? 'motor' : 'normal';
  if (sewingN > 0 && w0 > 0) {
    const rate = sewingN / w0;
    for (const c of SFOLD_COMBOS) {
      if (c.system === systemMain && Math.abs(c.sewing - rate) < 50) { comboId = c.id; break; }
    }
  }

  return {
    typeId, fabricOpacity, direction, systemMain, manualRope, comboId,
    selectedCode : row.code ?? '',
    width        : sm?.[1] ?? '',
    height       : sm?.[2] ?? '',
    faceOverride : (!row.faceW || row.faceW === '—') ? '' : row.faceW,
    unitPrice    : row.unitPrice ?? '',
    discountPct,
    railPrice    : toPrice(row.rail),
    motorPrice   : toPrice(row.motor),
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const f2 = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

function computeQty(formula: string, face: string, w: number, h: number, direction?: string, panelsNum = 0): { qty: number; unit: string; label: string; panels?: number } {
  if (formula === 'sfold') {
    const loomW = parseFloat(face) || 1.4;
    const Q = (w * 2.5) / loomW;
    const R = h + 0.3;
    const qty = (Q * R / 0.9) + panelsNum;
    return { qty, unit: 'yd', label: `${qty.toFixed(2)} yd (${panelsNum} หน้า)`, panels: panelsNum };
  } else if (formula === 'wave') {
    const fw = parseFloat(face) || 1.2;
    const base = (w * fw * (h + 0.5)) / 0.9144;
    const qty = base + panelsNum;
    return { qty, unit: 'yd', label: `${qty.toFixed(2)} yd`, panels: panelsNum };
  } else {
    const qty = w * h * 1.196;
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
export default function WizardModal({ onClose, onAdd, nextNo, editRow }: Props) {
  const editMode     = !!editRow;
  const init         = editRow ? parseEditRow(editRow) : null;
  const initIsSfold  = (init?.typeId ?? '') === 'sfold';

  const [step, setStep]         = useState(() => editMode ? (initIsSfold ? 7 : 5) : 1);
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
  const [systemMain, setSystemMain] = useState<'manual' | 'motor'>(init?.systemMain ?? 'manual');
  const [manualRope, setManualRope] = useState(init?.manualRope   ?? false);
  const [direction, setDirection]   = useState(init?.direction    ?? 'center');

  /* derived: final system value used in description + price */
  const system = systemMain === 'motor' ? 'motor' : manualRope ? 'manual-rope' : 'manual';
  /* size */
  const [width, setWidth]   = useState(init?.width  ?? '');
  const [height, setHeight] = useState(init?.height ?? '');
  const [faceOverride, setFaceOverride] = useState(init?.faceOverride ?? '');
  const [panels, setPanels]             = useState('2');
  /* price */
  const [unitPrice, setUnitPrice]     = useState(init?.unitPrice   ?? '');
  const [discountPct, setDiscountPct] = useState(init?.discountPct ?? '30');
  const [railPrice, setRailPrice]     = useState(init?.railPrice   ?? '');
  const [motorPrice, setMotorPrice]   = useState(init?.motorPrice  ?? '');
  const [comboId, setComboId]         = useState(init?.comboId ?? (init?.systemMain === 'motor' ? 'motor' : 'normal'));
  /* rail product picker */
  const [railProducts, setRailProducts] = useState<Product[]>([]);
  const [loadingRail, setLoadingRail] = useState(false);
  /* DB formula config */
  const [dbTypes,  setDbTypes]  = useState<DbTypeConfig[]>([]);
  const [dbCombos, setDbCombos] = useState<DbSewingCombo[]>([]);

  const isSfold = typeId === 'sfold';

  /* dynamic step list — sfold gets 2 extra steps (opacity + opening) */
  const STEPS = isSfold
    ? ['ประเภทม้าน', 'ระบบ', 'ทึบ/โปร่ง', 'Opening style', 'เลือกผ้า', 'ขนาด', 'ราคา']
    : ['ประเภทม้าน', 'ระบบ', 'เลือกผ้า', 'ขนาด', 'ราคา'];

  const STEP_FABRIC = isSfold ? 5 : 3;
  const STEP_SIZE   = isSfold ? 6 : 4;
  const STEP_PRICE  = isSfold ? 7 : 5;

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
  /* sfold: hint = auto-panels from direction (for display only, does not override user input) */
  const sfoldAutoPanels = formula === 'sfold' && w > 0 && h > 0
    ? (direction === 'center'
        ? Math.ceil((w * 2.5 / (parseFloat(face) || 1.4)) / 2) * 2
        : Math.ceil(w * 2.5 / (parseFloat(face) || 1.4)))
    : null;
  const computed = w > 0 && h > 0 ? computeQty(formula, face, w, h, direction, panelsNum) : null;
  const upNum = parseFloat(unitPrice.replace(/,/g, '')) || 0;
  const rawPrice = computed ? computed.qty * upNum : 0;
  const discNum = rawPrice * (parseFloat(discountPct) / 100);
  const net = rawPrice - discNum;
  const railNum  = parseFloat(railPrice.replace(/,/g, '')) || 0;
  const motorNum = parseFloat(motorPrice.replace(/,/g, '')) || 0;

  const hasRailDropdown = !!(activeRailCat.motor || activeRailCat.manual);
  const hasCombos       = typeSewingCombos.length > 0;
  const availableCombos = typeSewingCombos.filter(c => c.system === systemMain);
  const comboInfo       = hasCombos ? (typeSewingCombos.find(c => c.id === comboId) ?? availableCombos[0] ?? null) : null;
  const sewingAmt       = comboInfo && w > 0 ? Math.round(comboInfo.sewing * w) : 0;
  const setupAmt        = comboInfo ? comboInfo.setup : 0;

  /* for types with rail dropdown (sfold/lon), motor is included in rail price → no separate motorNum
     for types with combos but no rail dropdown (wave/roman), motor input is still separate           */
  const total = hasCombos
    ? net + railNum + (hasRailDropdown ? 0 : motorNum) + sewingAmt + setupAmt
    : net + railNum + motorNum;

  const systemLabel = system === 'motor' ? 'มอเตอร์' : system === 'manual-rope' ? 'แมนวล-เชือกดึง' : 'แมนวล';
  const dirs = isSfold ? SFOLD_OPENINGS : DIRECTIONS;
  const dirLabel = dirs.find(d => d.id === direction)?.label ?? direction;

  /* fetch products when the fabric step is reached (re-fetch if type changes) */
  useEffect(() => {
    if (step !== STEP_FABRIC) return;
    const category = typeId ? TYPE_TO_CATEGORY[typeId] ?? '' : '';
    setAllProducts([]);
    setProductsFetched(false);
    setLoadingProducts(true);
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then(r => r.json())
      .then((data: any) => {
        setAllProducts(Array.isArray(data) ? data : []);
        setLoadingProducts(false);
        setProductsFetched(true);
      })
      .catch(() => setLoadingProducts(false));
  }, [step, typeId]);

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

    if (hasHeightRules) {
      /* pick the combo whose H range covers current h */
      const candidates = dbCombos.filter(c =>
        c.type_id === typeId && c.system === systemMain && c.is_active &&
        (c.height_min == null || h >  Number(c.height_min)) &&
        (c.height_max == null || h <= Number(c.height_max))
      );
      const pick = candidates[0] ?? dbCombos.find(c => c.type_id === typeId && c.system === systemMain && c.is_active);
      if (pick) setComboId(pick.combo_key);
    } else {
      /* no height rules (e.g. roman): only reset when system or type actually changed */
      if (!systemOrTypeChanged) return;
      const def = typeSewingCombos.find(c => c.system === systemMain);
      if (def) setComboId(def.id);
    }
  }, [systemMain, typeId, h, dbCombos, typeSewingCombos]);

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

  /* fetch rail products when reaching ราคา step (re-fetch when system or rail categories change) */
  useEffect(() => {
    if (step !== STEP_PRICE) return;
    const cat = systemMain === 'motor' ? activeRailCat.motor : activeRailCat.manual;
    if (!cat) { setRailProducts([]); return; }
    setRailProducts([]);
    setLoadingRail(true);
    fetch(`/api/products?category=${encodeURIComponent(cat)}`)
      .then(r => r.json())
      .then((data: any) => {
        setRailProducts(Array.isArray(data) ? data : []);
        setLoadingRail(false);
      })
      .catch(() => setLoadingRail(false));
  }, [step, typeId, systemMain, activeRailCat.motor, activeRailCat.manual]);

  /* filter products: search query only (opacity is metadata, not a DB-level filter) */
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
    if (selectedCode === p.code) {
      setSelectedCode('');
      setUnitPrice('');
      setFaceOverride('');
      return;
    }
    setSelectedCode(p.code);
    if (p.price > 0) setUnitPrice(String(p.price));
    if (p.face_width && parseFloat(String(p.face_width)) > 0 && typeInfo?.formula === 'wave') {
      setFaceOverride(String(p.face_width));
    }
  };

  const handleAdd = () => {
    if (!typeInfo) return;
    const opacityPart = opacityInfo ? (isSfold ? ` ${opacityInfo.label}` : ` (${opacityInfo.label})`) : '';
    const desc = `${typeInfo.label}${opacityPart} | ${dirLabel} | ${systemLabel}`;
    const sizeStr = w && h ? `W.${parseFloat(width).toFixed(2)}×H.${parseFloat(height).toFixed(2)}` : '';
    const row: BoqRow = {
      id: editRow?.id ?? nid(), type: 'item',
      no: editRow?.no ?? String(nextNo),
      size: sizeStr,
      desc,
      code: selectedCode,
      faceW: face,
      unitPrice: unitPrice || '0',
      qty: computed?.label ?? '',
      price: f2(rawPrice),
      discount: discNum ? `-${f2(discNum)}` : '0',
      net: f2(net),
      rail: railPrice || '—',
      motor: hasCombos ? '—' : (system === 'motor' ? (motorPrice || '—') : '—'),
      c13: '300', hook: '300',
      sewing:  hasCombos && sewingAmt > 0 ? f2(sewingAmt) : '—',
      install: hasCombos && setupAmt  > 0 ? f2(setupAmt)  : '—',
      unit: 'ชุด',
      total: f2(total),
    };
    onAdd(row);
    onClose();
  };

  const pickType = (id: string) => {
    setTypeId(id);
    setFabricOpacity('');
    setSelectedCode('');
    setStep(2);
  };

  const needsOpacity = NEEDS_OPACITY.has(typeId);

  const canNext =
    step === 1             ? !!typeId :
    step === 2             ? true :
    isSfold && step === 3  ? !!fabricOpacity :
    isSfold && step === 4  ? true :
    step === STEP_FABRIC   ? (!isSfold && needsOpacity ? !!fabricOpacity : true) :
    step === STEP_SIZE     ? (w > 0 && h > 0) :
    !!unitPrice;

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
              <div style={{ textAlign:'center',marginBottom:24 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ 1</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>เลือกประเภทม้าน</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>เลือกประเภทที่ลูกค้าต้องการ</div>
              </div>

              <div style={{ marginBottom:16 }}>
                <SectionLabel color="#1F3A3A" label="กลุ่ม G1" sub="ม่านจีบ / ลอน — คิดปริมาณเป็นหลา (yd)" />
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
              <div style={{ textAlign:'center',marginBottom:28 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ 2</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>เลือกระบบ</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>ระบบการทำงานของม้าน</div>
              </div>

              {/* Main system — 2 cards */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,maxWidth:400,margin:'0 auto 24px' }}>
                {SYSTEMS_MAIN.map(s => (
                  <div key={s.id} onClick={() => { setSystemMain(s.id as 'manual' | 'motor'); if (s.id === 'motor') setManualRope(false); }}
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
                    <button onClick={() => setManualRope(false)}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${!manualRope ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:!manualRope?'#1F3A3A':'#fff',color:!manualRope?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      🖐️ ปกติ
                    </button>
                    <button onClick={() => setManualRope(true)}
                      style={{ flex:1,padding:'9px 0',border:`1.5px solid ${manualRope ? '#1F3A3A' : '#E5E0D5'}`,borderRadius:10,background:manualRope?'#1F3A3A':'#fff',color:manualRope?'#fff':'#374151',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
                      🪢 เชือกดึง
                    </button>
                  </div>
                </div>
              )}

              {/* Direction — non-sfold only (sfold has its own opening-style step) */}
              {!isSfold && (
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
                </div>
              )}
            </>
          )}

          {/* STEP 3 (sfold) — ทึบ / โปร่ง */}
          {isSfold && step === 3 && (
            <>
              <div style={{ textAlign:'center',marginBottom:28 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>ชนิดผ้า</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>เลือก ทึบ หรือ โปร่ง สำหรับลอนกระดุม</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:560,margin:'0 auto' }}>
                {FABRIC_OPACITY.map(f => (
                  <div key={f.id} onClick={() => setFabricOpacity(f.id)}
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
          {isSfold && step === 4 && (
            <>
              <div style={{ textAlign:'center',marginBottom:28 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>Opening style</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>รูปแบบการเปิด-ปิดม้าน</div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:480,margin:'0 auto' }}>
                {SFOLD_OPENINGS.map(d => (
                  <div key={d.id} onClick={() => setDirection(d.id)}
                    style={{ borderRadius:16,padding:'28px 16px',border:`2px solid ${direction === d.id ? '#1F3A3A' : '#E5E0D5'}`,background: direction === d.id ? '#1F3A3A' : '#fff',cursor:'pointer',textAlign:'center',transition:'all .25s' }}>
                    <div style={{ fontSize:40,marginBottom:10,lineHeight:1 }}>{d.icon}</div>
                    <div style={{ fontWeight:700,fontSize:16,color: direction === d.id ? '#fff' : '#1F3A3A' }}>{d.label}</div>
                    {direction === d.id && <div style={{ marginTop:8,fontSize:11,background:'rgba(255,255,255,0.15)',display:'inline-block',padding:'2px 10px',borderRadius:20,color:'#fff' }}>เลือกแล้ว ✓</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP FABRIC — เลือกผ้า */}
          {step === STEP_FABRIC && (
            <>
              <div style={{ textAlign:'center',marginBottom:16 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>เลือกผ้า / สินค้า</div>
              </div>

              {/* Step 1 summary bar */}
              {typeInfo && (
                <div style={{ display:'flex',alignItems:'center',gap:14,background:'#1F3A3A',borderRadius:14,padding:'12px 18px',marginBottom:16 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0 }}>
                    {ICONS[typeInfo.id]}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:2 }}>ขั้นที่ 1 · เลือกแล้ว</div>
                    <div style={{ fontWeight:700,fontSize:15,color:'#fff' }}>{typeInfo.label}</div>
                    <div style={{ fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:1 }}>{typeInfo.sub}</div>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:3 }}>หมวดสินค้า</div>
                    <div style={{ fontSize:12,color:'#C9A581',fontWeight:600 }}>{TYPE_TO_CATEGORY[typeInfo.id] ?? '—'}</div>
                  </div>
                </div>
              )}

              {/* ── Opacity gate: only for non-sfold (sfold chose opacity in step 3) ── */}
              {!isSfold && needsOpacity && !fabricOpacity ? (
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
                  {/* selected opacity chip */}
                  {opacityInfo && (
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:6,background: fabricOpacity==='thick'?'#1F3A3A':'#F8F5F0',border:`1.5px solid ${fabricOpacity==='thick'?'#1F3A3A':'#C9A581'}`,borderRadius:8,padding:'5px 14px' }}>
                        <span style={{ fontSize:13,color: fabricOpacity==='thick'?'#fff':'#7a5c2e',fontWeight:600 }}>{opacityInfo.icon} {opacityInfo.label}</span>
                      </div>
                      {!isSfold && (
                        <button onClick={() => setFabricOpacity('')}
                          style={{ background:'none',border:'1px solid #E5E0D5',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',color:'#9ca3af',fontFamily:'inherit' }}>
                          เปลี่ยน
                        </button>
                      )}
                    </div>
                  )}

                  {/* search bar */}
                  <div style={{ marginBottom:14,position:'relative' }}>
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
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10,maxHeight:340,overflowY:'auto',paddingRight:4 }}>
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
              <div style={{ textAlign:'center',marginBottom:28 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>ขนาดหน้าต่าง</div>
                <div style={{ fontSize:13,color:'#6b7280' }}>วัดขนาดจริงที่หน้างาน</div>
              </div>
              <div style={{ maxWidth:420,margin:'0 auto' }}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
                  <LabelInput label="ความกว้าง (m)" value={width} onChange={setWidth} placeholder="เช่น 2.50" />
                  <LabelInput label="สูง (m)" value={height} onChange={setHeight} placeholder="เช่น 3.00" />
                </div>
                {(formula === 'wave' || formula === 'sfold') && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <LabelInput
                      label={`หน้าผ้า (ค่าเริ่มต้น ${typeInfo?.face ?? face})`}
                      value={faceOverride}
                      onChange={setFaceOverride}
                      placeholder={typeInfo?.face ?? face}
                    />
                    <div>
                      <LabelInput label="panels (หน้า)" value={panels} onChange={setPanels} placeholder="2" />
                      {sfoldAutoPanels != null && (
                        <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>auto: {sfoldAutoPanels} หน้า</div>
                      )}
                    </div>
                  </div>
                )}
                {computed && (
                  <div style={{ marginTop:16,background:'#fff',borderRadius:12,padding:'14px 18px',border:'1px solid #E5E0D5' }}>
                    <div style={{ fontSize:11,color:'#9ca3af',marginBottom:4 }}>ปริมาณที่ใช้ (Auto)</div>
                    <div style={{ fontSize:20,fontWeight:700,color:'#1F3A3A' }}>{computed.label}</div>
                    <div style={{ fontSize:11,color:'#C9A581',marginTop:2 }}>⚡ คำนวณอัตโนมัติ</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP PRICE — ราคา */}
          {step === STEP_PRICE && (
            <>
              <div style={{ textAlign:'center',marginBottom:24 }}>
                <div style={{ fontSize:11,letterSpacing:'0.3em',color:'#9ca3af',textTransform:'uppercase',marginBottom:4 }}>ขั้นที่ {step}</div>
                <div style={{ fontSize:22,fontWeight:300,color:'#1F3A3A',marginBottom:4 }}>สินค้า + ราคา</div>
                {selectedCode && (
                  <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#1F3A3A',color:'#fff',borderRadius:20,padding:'4px 14px',fontSize:12,marginTop:4 }}>
                    <span>📦</span><span>สินค้า: {selectedCode}</span>
                  </div>
                )}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:680,margin:'0 auto' }}>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  <LabelInput label={`ราคาต่อหน่วย (${typeInfo?.unit ?? 'yd'})`} value={unitPrice} onChange={setUnitPrice} placeholder="เช่น 910" />
                  <LabelInput label="ส่วนลด (%)" value={discountPct} onChange={setDiscountPct} placeholder="30" />
                  <RailComboInput
                    label={`ค่าราง / อุปกรณ์${hasCombos ? (systemMain === 'motor' ? ' (฿/ชุด)' : ' (฿/ม.)') : ' (฿)'}`}
                    value={railPrice}
                    onChange={setRailPrice}
                    products={railProducts}
                    loading={loadingRail}
                  />
                  {hasCombos && (
                    <div>
                      <div style={{ fontSize:12,color:'#6b7280',marginBottom:7,fontWeight:500 }}>ชุดคิด (ค่าเย็บ + ค่าติดตั้ง)</div>
                      {availableCombos.map(c => (
                        <div key={c.id} onClick={() => setComboId(c.id)}
                          style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,border:`1.5px solid ${comboId === c.id ? '#1F3A3A' : '#E5E0D5'}`,background: comboId === c.id ? '#1F3A3A' : '#fff',cursor:'pointer',transition:'all .2s',marginBottom:8 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600,fontSize:12,color: comboId === c.id ? '#fff' : '#1F3A3A' }}>{c.label}</div>
                            <div style={{ fontSize:11,color: comboId === c.id ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>เย็บ {c.sewing.toLocaleString()}/m · ติดตั้ง {c.setup.toLocaleString()}/ชุด</div>
                          </div>
                          {comboId === c.id && <span style={{ fontSize:13,color:'#C9A581',fontWeight:700 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {system === 'motor' && !hasRailDropdown && (
                    <LabelInput label="ค่ามอเตอร์ (฿)" value={motorPrice} onChange={setMotorPrice} placeholder="เช่น 18250" />
                  )}
                </div>
                <div style={{ background:'#fff',borderRadius:16,padding:'20px',border:'1px solid #E5E0D5',alignSelf:'start' }}>
                  <div style={{ fontSize:11,color:'#9ca3af',marginBottom:14,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase' }}>สรุปราคา</div>
                  <SumRow label="ปริมาณ" value={computed?.label ?? '—'} />
                  <SumRow label="ราคาผ้า" value={`${f2(rawPrice)} ฿`} />
                  <SumRow label={`ส่วนลด ${discountPct}%`} value={`-${f2(discNum)} ฿`} gold />
                  <SumRow label="ราคาสินค้า" value={`${f2(net)} ฿`} />
                  {railNum > 0 && <SumRow label="ราง/อุปกรณ์" value={`${f2(railNum)} ฿`} />}
                  {!hasCombos && motorNum > 0 && <SumRow label="มอเตอร์" value={`${f2(motorNum)} ฿`} />}
                  {hasCombos && sewingAmt > 0 && <SumRow label="ค่าเย็บ" value={`${f2(sewingAmt)} ฿`} />}
                  {hasCombos && setupAmt  > 0 && <SumRow label="ค่าติดตั้ง" value={`${f2(setupAmt)} ฿`} />}
                  <div style={{ borderTop:'1.5px solid #1F3A3A',marginTop:10,paddingTop:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontWeight:700,color:'#1F3A3A' }}>รวมทั้งสิ้น</span>
                    <span style={{ fontWeight:700,fontSize:18,color:'#1F3A3A' }}>{f2(total)} ฿</span>
                  </div>
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
            {typeId && <span style={{ fontSize:12,color:'#6b7280' }}>ประเภท: <strong style={{ color:'#1F3A3A' }}>{typeInfo?.label}</strong></span>}
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
      style={{ borderRadius:12,padding:'12px 14px',border:`2px solid ${selected ? '#1F3A3A' : '#E5E0D5'}`,background: selected ? '#1F3A3A' : '#fff',cursor:'pointer',transition:'all .2s',position:'relative' }}>
      {/* Checkbox */}
      <div style={{ position:'absolute',top:10,right:10,width:17,height:17,borderRadius:4,border:`2px solid ${selected ? '#C9A581' : '#C8C2BA'}`,background: selected ? '#C9A581' : '#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s' }}>
        {selected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3.2,5.8 8,1" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4,paddingRight:22 }}>
        <div style={{ fontSize:10,color: selected ? 'rgba(255,255,255,0.55)' : '#9ca3af',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.code}</div>
        {fw > 0 && (
          <div style={{ fontSize:10,background: selected ? 'rgba(201,165,129,0.3)' : '#FFF6E5',color: selected ? '#C9A581' : '#7a5c2e',borderRadius:6,padding:'1px 5px',flexShrink:0 }}>fw {fw}m</div>
        )}
      </div>
      <div style={{ fontWeight:600,fontSize:12,color: selected ? '#fff' : '#1F3A3A',marginBottom:4,lineHeight:1.4 }}>{p.name || '—'}</div>
      {p.price > 0 ? (
        <div style={{ fontWeight:700,fontSize:13,color: selected ? '#C9A581' : '#1F3A3A' }}>
          {Number(p.price).toLocaleString('th-TH')} / {p.unit}
        </div>
      ) : (
        <div style={{ fontSize:11,color: selected ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>— ไม่ระบุราคา</div>
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

function LabelInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }}
        onFocus={e => (e.target.style.borderColor = '#1F3A3A')}
        onBlur={e => (e.target.style.borderColor = '#E5E0D5')}
      />
    </div>
  );
}

function RailComboInput({ label, value, onChange, products, loading }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  products: Product[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selName, setSelName] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = products.filter(p => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return (p.code ?? '').toLowerCase().includes(ql) || (p.name ?? '').toLowerCase().includes(ql);
  });

  const handleSelect = (p: Product) => {
    onChange(p.price > 0 ? String(p.price) : '');
    setSelName(p.name || p.code);
    setQ('');
    setOpen(false);
  };

  const handleClear = () => { onChange(''); setSelName(''); };

  /* fallback to plain input when no catalog available */
  if (products.length === 0 && !loading) {
    return (
      <div>
        <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>{label}</div>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="ถ้ามี เช่น 2900"
          style={{ width:'100%',border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',fontSize:14,outline:'none',background:'#fff',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }}
          onFocus={e => (e.target.style.borderColor='#1F3A3A')} onBlur={e => (e.target.style.borderColor='#E5E0D5')} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <div style={{ fontSize:12,color:'#6b7280',marginBottom:5,fontWeight:500 }}>{label}</div>

      {/* Trigger */}
      {selName ? (
        <div style={{ display:'flex',alignItems:'center',gap:8,border:'1.5px solid #1F3A3A',borderRadius:10,padding:'9px 14px',background:'#fff' }}>
          <span style={{ flex:1,fontSize:13,fontWeight:600,color:'#1F3A3A',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>📦 {selName}</span>
          {value && <span style={{ fontSize:13,fontWeight:700,color:'#C9A581',flexShrink:0 }}>฿{Number(value).toLocaleString('th-TH')}</span>}
          <button onClick={handleClear} style={{ background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:16,lineHeight:1,padding:0,flexShrink:0 }}>✕</button>
        </div>
      ) : (
        <div onClick={() => setOpen(o => !o)}
          style={{ display:'flex',alignItems:'center',gap:8,border:'1.5px solid #E5E0D5',borderRadius:10,padding:'9px 14px',background:'#fff',cursor:'pointer' }}>
          <span style={{ flex:1,fontSize:13,color: loading ? '#9ca3af' : value ? '#1F3A3A' : '#9ca3af' }}>
            {loading ? '⏳ กำลังโหลดรายการ...' : value ? `฿ ${Number(value).toLocaleString('th-TH')}` : '🔍 เลือกจากรายการ หรือพิมพ์ราคา'}
          </span>
          <span style={{ fontSize:10,color:'#9ca3af' }}>▾</span>
        </div>
      )}

      {/* Dropdown */}
      {open && !loading && (
        <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:50,background:'#fff',border:'1.5px solid #E5E0D5',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',overflow:'hidden' }}>
          <div style={{ padding:'8px 10px',borderBottom:'1px solid #E5E0D5' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหา ชื่อ / รหัสสินค้า..." autoFocus
              style={{ width:'100%',border:'1px solid #E5E0D5',borderRadius:8,padding:'7px 10px',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }} />
          </div>
          <div style={{ maxHeight:180,overflowY:'auto' }}>
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
                <div style={{ fontSize:13,fontWeight:700,color:'#C9A581',flexShrink:0 }}>
                  {p.price > 0 ? `฿${Number(p.price).toLocaleString('th-TH')}` : '—'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding:'8px 10px',borderTop:'1px solid #E5E0D5',background:'#F8F5F0' }}>
            <div style={{ fontSize:10,color:'#9ca3af',marginBottom:4 }}>หรือพิมพ์ราคาเอง</div>
            <input value={value} onChange={e => { onChange(e.target.value); setSelName(''); }}
              placeholder="เช่น 18250"
              style={{ width:'100%',border:'1px solid #E5E0D5',borderRadius:8,padding:'6px 10px',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit',color:'#1F3A3A' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function SumRow({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'4px 0',color: gold ? '#C9A581' : '#374151' }}>
      <span>{label}</span>
      <span style={{ fontWeight:500 }}>{value}</span>
    </div>
  );
}
