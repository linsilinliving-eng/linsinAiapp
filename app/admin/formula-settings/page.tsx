'use client';

import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

/* ------------------------------------------------------------------ */
interface TypeConfig {
  id: number;
  type_id: string;
  type_label: string;
  formula_group: string;
  face_width: number | null;
  height_threshold: number | null;
  unit: string;
  rail_cat_motor: string | null;
  rail_cat_manual: string | null;
  sort_order: number;
  is_locked: boolean;
}

interface SewingCombo {
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

/* ------------------------------------------------------------------ */
const FONT = "'Sarabun','Cordia New',Tahoma,sans-serif";
const DARK = '#1f2937';
const ACCENT = '#1F3A3A';
const GOLD = '#C9A581';

const INPUT: React.CSSProperties = {
  border: '1px solid #d1d5db', borderRadius: 6, padding: '7px 10px',
  fontSize: 13, width: '100%', outline: 'none', boxSizing: 'border-box',
  fontFamily: FONT,
};
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500,
};

function Field({ label, children, desc }: { label: string; children: React.ReactNode; desc?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={LABEL}>{label}</label>
      {children}
      {desc && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{desc}</div>}
    </div>
  );
}

function InputRow({
  value, onChange, locked, onToggleLock, inputProps,
}: {
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  onToggleLock: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div style={{ display:'flex',gap:4,alignItems:'center' }}>
      <input
        {...inputProps}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={locked}
        style={{ ...INPUT, flex:1, background: locked ? '#f9fafb' : '#fff', color: locked ? '#9ca3af' : undefined }}
      />
      <button type="button" title="ล้างค่า" disabled={locked || value === ''}
        onClick={() => onChange('')}
        style={{ flexShrink:0,padding:'6px 9px',background: locked||value==='' ? '#f3f4f6':'#fee2e2',
          color: locked||value==='' ? '#d1d5db':'#ef4444',border:'none',borderRadius:5,cursor: locked||value==='' ?'default':'pointer',fontSize:13,lineHeight:1 }}>
        ×
      </button>
      <button type="button" title={locked ? 'ปลดล็อก' : 'ล็อกค่า'} onClick={onToggleLock}
        style={{ flexShrink:0,padding:'5px 8px',background: locked ? ACCENT : '#f3f4f6',
          color: locked ? '#fff':'#6b7280',border:'none',borderRadius:5,cursor:'pointer',fontSize:13,lineHeight:1 }}>
        {locked ? '🔒' : '🔓'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function FormulaSettingsPage() {
  const [types,   setTypes]   = useState<TypeConfig[]>([]);
  const [combos,  setCombos]  = useState<SewingCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<'types' | 'combos'>('types');
  useEffect(() => {
    if (window.location.hash === '#combos') setTab('combos');
  }, []);
  const switchTab = (t: 'types' | 'combos') => { setTab(t); window.location.hash = t; };

  /* type edit modal */
  const [typeModal,    setTypeModal]    = useState(false);
  const [editType,     setEditType]     = useState<TypeConfig | null>(null);
  const [typeSaving,   setTypeSaving]   = useState(false);
  const [tFaceW,       setTFaceW]       = useState('');
  const [tThreshold,   setTThreshold]   = useState('');
  const [tMotor,       setTMotor]       = useState('');
  const [tManual,      setTManual]      = useState('');
  const [tSortOrder,    setTSortOrder]    = useState('');
  const [tFormulaGroup, setTFormulaGroup] = useState('wave');
  const [tFormulaP,    setTFormulaP]    = useState('');
  const [tFormulaH,    setTFormulaH]    = useState('');
  const [tFormulaEff,  setTFormulaEff]  = useState('');
  const [sfoldDirTab,  setSfoldDirTab]  = useState<'center'|'left'|'right'>('center');
  const [tFaceWLocked,     setTFaceWLocked]     = useState(false);
  const [tThresholdLocked, setTThresholdLocked] = useState(false);
  const [tMotorLocked,     setTMotorLocked]     = useState(false);
  const [tManualLocked,    setTManualLocked]    = useState(false);

  /* combo modal */
  const [comboModal,   setComboModal]   = useState(false);
  const [editCombo,    setEditCombo]    = useState<SewingCombo | null>(null);
  const [comboSaving,  setComboSaving]  = useState(false);
  const [cTypeId,      setCTypeId]      = useState('sfold');
  const [cComboKey,    setCComboKey]    = useState('');
  const [cLabel,       setCLabel]       = useState('');
  const [cSystem,      setCSystem]      = useState<'manual'|'motor'|'both'>('manual');
  const [cSewing,      setCSewing]      = useState('');
  const [cSetup,       setCSetup]       = useState('');
  const [cSort,        setCSort]        = useState('');
  const [cHMin,        setCHMin]        = useState('');
  const [cHMax,        setCHMax]        = useState('');
  const [cActive,      setCActive]      = useState(true);
  const [cHMinLocked,  setCHMinLocked]  = useState(false);
  const [cHMaxLocked,  setCHMaxLocked]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, cr] = await Promise.all([
        fetch('/api/formula-config/types').then(r => r.json()),
        fetch('/api/formula-config/combos').then(r => r.json()),
      ]);
      setTypes(Array.isArray(tr) ? tr : []);
      setCombos(Array.isArray(cr) ? cr : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Type edit ── */
  const openTypeEdit = (t: TypeConfig) => {
    setEditType(t);
    setTFaceW(t.face_width != null ? String(t.face_width) : '');
    setTThreshold(t.height_threshold != null ? String(t.height_threshold) : '');
    setTMotor(t.rail_cat_motor ?? '');
    setTManual(t.rail_cat_manual ?? '');
    setTSortOrder(t.sort_order != null ? String(t.sort_order) : '');
    setTFormulaGroup(t.formula_group ?? 'wave');
    setTFormulaP((t as any).formula_p != null ? String((t as any).formula_p) : '');
    setTFormulaH((t as any).formula_h != null ? String((t as any).formula_h) : '');
    setTFormulaEff((t as any).formula_eff != null ? String((t as any).formula_eff) : '');
    setSfoldDirTab('center');
    setTFaceWLocked(false); setTThresholdLocked(false);
    setTMotorLocked(false); setTManualLocked(false);
    setTypeModal(true);
  };

  const saveType = async () => {
    if (!editType) return;
    setTypeSaving(true);
    try {
      const res = await fetch('/api/formula-config/types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_id: editType.type_id,
          face_width:       tFaceW     !== '' ? Number(tFaceW)     : null,
          height_threshold: tThreshold !== '' ? Number(tThreshold) : null,
          rail_cat_motor:  tMotor,
          rail_cat_manual: tManual,
          formula_group:   tFormulaGroup,
          formula_p:   tFormulaP   !== '' ? Number(tFormulaP)   : null,
          formula_h:   tFormulaH   !== '' ? Number(tFormulaH)   : null,
          formula_eff: tFormulaEff !== '' ? Number(tFormulaEff) : null,
          sort_order:  tSortOrder  !== '' ? Number(tSortOrder)  : null,
        }),
      });
      if (!res.ok) throw new Error();
      notifications.show({ title: 'บันทึกแล้ว', message: `แก้ไข ${editType.type_label} สำเร็จ`, color: 'green' });
      setTypeModal(false);
      load();
    } catch {
      notifications.show({ title: 'ผิดพลาด', message: 'บันทึกไม่สำเร็จ', color: 'red' });
    } finally {
      setTypeSaving(false);
    }
  };

  /* ── Combo ── */
  const resetComboLocks = () => { setCHMinLocked(false); setCHMaxLocked(false); };

  const openComboAdd = () => {
    setEditCombo(null);
    setCTypeId('sfold'); setCComboKey(''); setCLabel('');
    setCSystem('manual'); setCSewing(''); setCSetup(''); setCSort('');
    setCHMin(''); setCHMax(''); setCActive(true);
    resetComboLocks();
    setComboModal(true);
  };

  const openComboCopy = (c: SewingCombo) => {
    setEditCombo(null);
    setCTypeId(c.type_id); setCComboKey(''); setCLabel(c.label);
    setCSystem(c.system); setCSewing(String(c.sewing_rate)); setCSetup(String(c.setup_rate));
    setCSort(String(c.sort_order)); setCHMin(c.height_min != null ? String(c.height_min) : '');
    setCHMax(c.height_max != null ? String(c.height_max) : ''); setCActive(c.is_active);
    resetComboLocks();
    setComboModal(true);
  };

  const openComboEdit = (c: SewingCombo) => {
    setEditCombo(c);
    setCTypeId(c.type_id); setCComboKey(c.combo_key); setCLabel(c.label);
    setCSystem(c.system); setCSewing(String(c.sewing_rate)); setCSetup(String(c.setup_rate));
    setCSort(String(c.sort_order)); setCHMin(c.height_min != null ? String(c.height_min) : '');
    setCHMax(c.height_max != null ? String(c.height_max) : ''); setCActive(c.is_active);
    resetComboLocks();
    setComboModal(true);
  };

  const saveCombo = async () => {
    setComboSaving(true);
    try {
      const res = await fetch('/api/formula-config/combos', {
        method: editCombo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editCombo?.id,
          type_id: cTypeId, combo_key: cComboKey, label: cLabel,
          system: cSystem, sewing_rate: Number(cSewing), setup_rate: Number(cSetup),
          sort_order: Number(cSort),
          height_min: cHMin !== '' ? Number(cHMin) : null,
          height_max: cHMax !== '' ? Number(cHMax) : null,
          is_active: cActive,
        }),
      });
      if (!res.ok) throw new Error();
      notifications.show({ title: 'บันทึกแล้ว', message: editCombo ? 'แก้ไข Combo สำเร็จ' : 'เพิ่ม Combo สำเร็จ', color: 'green' });
      setComboModal(false);
      load();
    } catch {
      notifications.show({ title: 'ผิดพลาด', message: 'บันทึกไม่สำเร็จ', color: 'red' });
    } finally {
      setComboSaving(false);
    }
  };

  const toggleLock = async (t: TypeConfig) => {
    await fetch('/api/formula-config/types', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ type_id: t.type_id, is_locked: !t.is_locked }) });
    notifications.show({ title: t.is_locked ? 'ปลดล็อคแล้ว' : 'ล็อคแล้ว', message: t.type_label, color: t.is_locked ? 'green' : 'yellow' });
    load();
  };

  const deleteType = async (t: TypeConfig) => {
    if (t.is_locked) { notifications.show({ title: 'ล็อคอยู่', message: 'ปลดล็อคก่อนจึงจะลบได้', color: 'red' }); return; }
    if (!window.confirm(`ลบ "${t.type_label}" ออกจากระบบ?`)) return;
    const res = await fetch(`/api/formula-config/types?type_id=${t.type_id}`, { method: 'DELETE' });
    if (!res.ok) { notifications.show({ title: 'ลบไม่ได้', message: 'row นี้ถูกล็อค', color: 'red' }); return; }
    notifications.show({ title: 'ลบแล้ว', message: t.type_label, color: 'orange' });
    load();
  };

  const deleteCombo = async (c: SewingCombo) => {
    if (!window.confirm(`ลบ "${c.label}" ออกจากระบบ?`)) return;
    await fetch(`/api/formula-config/combos?id=${c.id}`, { method: 'DELETE' });
    notifications.show({ title: 'ลบแล้ว', message: c.label, color: 'orange' });
    load();
  };

  /* group combos by type_id */
  const combosByType: Record<string, SewingCombo[]> = {};
  for (const c of combos) {
    if (!combosByType[c.type_id]) combosByType[c.type_id] = [];
    combosByType[c.type_id].push(c);
  }

  const TYPE_FORMULA_LABEL: Record<string, string> = { wave: 'A1', lon: 'A2', sfold: 'A3', roman: 'A4', wood: 'B1', roller: 'B2', sqy: 'sqy' };
  const formulaBadge = (fg: string, typeId?: string) => {
    const color = fg === 'sfold' ? '#7c3aed' : fg === 'wave' ? '#1d4ed8' : '#0f766e';
    const label = (typeId && TYPE_FORMULA_LABEL[typeId]) ?? TYPE_FORMULA_LABEL[fg] ?? fg;
    return (
      <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,background:color+'18',color,fontSize:11,fontWeight:700,letterSpacing:'0.03em' }}>
        {label}
      </span>
    );
  };

  /* ── Shared button styles ── */
  const btnDark  = { padding:'7px 18px',background:ACCENT,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:700,cursor:'pointer' as const,fontFamily:FONT };
  const btnGray  = { padding:'7px 14px',background:'#f3f4f6',color:'#374151',border:'1px solid #d1d5db',borderRadius:7,fontSize:13,cursor:'pointer' as const,fontFamily:FONT };
  const btnRed   = { padding:'3px 10px',background:'#fee2e2',color:'#ef4444',border:'none',borderRadius:5,fontSize:12,cursor:'pointer' as const,fontFamily:FONT };
  const btnEdit  = { padding:'3px 10px',background:'#eff6ff',color:'#1d4ed8',border:'none',borderRadius:5,fontSize:12,cursor:'pointer' as const,fontFamily:FONT };
  const btnCopy  = { padding:'3px 10px',background:'#f0fdf4',color:'#16a34a',border:'none',borderRadius:5,fontSize:12,cursor:'pointer' as const,fontFamily:FONT };

  /* ── Tab button ── */
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', border: 'none', borderRadius: '8px 8px 0 0', fontSize: 13,
    fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: FONT,
    background: active ? '#fff' : '#e9ebee',
    color: active ? ACCENT : '#6b7280',
    borderBottom: active ? '2px solid ' + ACCENT : '2px solid transparent',
  });

  /* ------------------------------------------------------------------ */
  return (
    <div style={{ padding:'20px 24px',minHeight:'100vh',background:'#f4f5f7',fontFamily:FONT,fontSize:13 }}>

      {/* Title */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0,fontSize:19,fontWeight:700,color:DARK }}>กำหนดสูตร BOQ</h1>
        <p style={{ margin:'4px 0 0',fontSize:13,color:'#6b7280' }}>ตั้งค่าสูตรคำนวณและค่าเย็บ-ค่าติดตั้งสำหรับผ้าม่านแต่ละประเภท</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:4,marginBottom:0 }}>
        <button style={tabBtn(tab === 'types')}  onClick={() => switchTab('types')}>📐 ตั้งค่าสูตรต่อประเภท</button>
        <button style={tabBtn(tab === 'combos')} onClick={() => switchTab('combos')}>🧵 COMBO ค่าเย็บ-ค่าติดตั้ง</button>
      </div>

      <div style={{ background:'#fff',borderRadius:'0 10px 10px 10px',border:'1px solid #e2e4e9',overflow:'auto',boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>

        {/* ── Tab: Types ── */}
        {tab === 'types' && (
          <>
            <div style={{ padding:'12px 16px',borderBottom:'1px solid #f0f1f3',color:'#9ca3af',fontSize:12 }}>
              กำหนด faceW default, formula_group และหมวดสินค้ารางสำหรับแต่ละประเภท
            </div>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:800 }}>
              <thead>
                <tr style={{ background:DARK }}>
                  {['ลำดับ','ประเภท','สูตร','หน่วย','faceW','H threshold','ราง (มอเตอร์)','ราง (แมนวล)',''].map((h,i) => (
                    <th key={i} style={{ padding:'8px 10px',color:'#fff',fontWeight:600,textAlign:'left',fontSize:11,whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding:40,textAlign:'center',color:'#9ca3af' }}>กำลังโหลด…</td></tr>
                ) : types.map((t, i) => (
                  <tr key={t.type_id}
                    style={{ borderBottom:'1px solid #f0f1f3', background: i%2===0?'#fff':'#fafafa' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#f0f7ff')}
                    onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#fff':'#fafafa')}>
                    <td style={{ padding:'8px 10px',textAlign:'center',fontWeight:700,color:GOLD,width:48 }}>{t.sort_order ?? '—'}</td>
                    <td style={{ padding:'8px 10px' }}>
                      <div style={{ fontWeight:600,color:DARK }}>{t.type_label}</div>
                      <div style={{ fontSize:10,color:'#9ca3af',fontFamily:'monospace' }}>{t.type_id}</div>
                    </td>
                    <td style={{ padding:'8px 10px' }}>{formulaBadge(t.formula_group, t.type_id)}</td>
                    <td style={{ padding:'8px 10px',color:'#374151' }}>{t.unit}</td>
                    <td style={{ padding:'8px 10px',fontWeight:t.face_width?600:400,color:t.face_width?GOLD:'#9ca3af' }}>
                      {t.face_width ?? '—'}
                    </td>
                    <td style={{ padding:'8px 10px',color:t.height_threshold?'#f59e0b':'#9ca3af' }}>
                      {t.height_threshold ? `> ${t.height_threshold} m` : '—'}
                    </td>
                    <td style={{ padding:'8px 10px',color:'#374151',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {t.rail_cat_motor ?? <span style={{ color:'#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding:'8px 10px',color:'#374151',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {t.rail_cat_manual ?? <span style={{ color:'#9ca3af' }}>—</span>}
                    </td>
                    <td style={{ padding:'8px 6px',textAlign:'center',whiteSpace:'nowrap' }}>
                      <button style={btnEdit} onClick={() => openTypeEdit(t)} disabled={t.is_locked} title={t.is_locked ? 'ล็อคอยู่' : 'แก้ไข'}>✏️ แก้ไข</button>
                      <button onClick={() => toggleLock(t)} title={t.is_locked ? 'ปลดล็อค' : 'ล็อค'}
                        style={{ marginLeft:6,padding:'4px 8px',borderRadius:6,border:'1px solid #d1d5db',background:t.is_locked?'#fef3c7':'#fff',cursor:'pointer',fontSize:13 }}>
                        {t.is_locked ? '🔒' : '🔓'}
                      </button>
                      <button onClick={() => deleteType(t)} title="ลบ" disabled={t.is_locked}
                        style={{ marginLeft:4,padding:'4px 8px',borderRadius:6,border:'1px solid #fecaca',background:t.is_locked?'#f9fafb':'#fff',cursor:t.is_locked?'not-allowed':'pointer',fontSize:13,opacity:t.is_locked?0.4:1 }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── Tab: Combos ── */}
        {tab === 'combos' && (
          <>
            <div style={{ padding:'12px 16px',borderBottom:'1px solid #f0f1f3',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ color:'#9ca3af',fontSize:12 }}>ค่าเย็บ (฿/ม.) และค่าติดตั้ง (฿/ชุด) แยกตามประเภทและระบบ</span>
              <button style={{ ...btnDark, display:'flex',alignItems:'center',gap:4 }} onClick={openComboAdd}>
                + เพิ่ม Combo
              </button>
            </div>

            {loading ? (
              <div style={{ padding:40,textAlign:'center',color:'#9ca3af' }}>กำลังโหลด…</div>
            ) : Object.entries(combosByType).map(([tid, cs]) => (
              <div key={tid}>
                <div style={{ padding:'8px 16px',background:'#f8f5f0',borderBottom:'1px solid #e9e0d4',fontWeight:700,fontSize:12,color:ACCENT,display:'flex',alignItems:'center',gap:8 }}>
                  ● {types.find(t => t.type_id === tid)?.type_label ?? tid}
                  <span style={{ fontFamily:'monospace',fontWeight:400,fontSize:11,color:'#9ca3af' }}>{tid}</span>
                </div>
                <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
                  <thead>
                    <tr style={{ background:'#f1f2f4' }}>
                      {['Key','Label','ระบบ','ค่าเย็บ (฿/ม.)','ค่าติดตั้ง (฿/ชุด)','H min','H max','ลำดับ','สถานะ',''].map((h,i) => (
                        <th key={i} style={{ padding:'6px 10px',fontWeight:600,textAlign:'left',fontSize:11,color:'#6b7280',whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cs.map((c, i) => (
                      <tr key={c.id}
                        style={{ borderBottom:'1px solid #f0f1f3',background:i%2===0?'#fff':'#fafafa',opacity:c.is_active?1:0.45 }}
                        onMouseEnter={e=>(e.currentTarget.style.background='#f0f7ff')}
                        onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#fff':'#fafafa')}>
                        <td style={{ padding:'7px 10px',fontFamily:'monospace',color:'#374151' }}>{c.combo_key}</td>
                        <td style={{ padding:'7px 10px',fontWeight:600,color:DARK }}>{c.label}</td>
                        <td style={{ padding:'7px 10px' }}>
                          {c.system === 'both' ? (<>
                            <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,background:'#f3f4f6',color:'#374151',fontSize:11,fontWeight:600,marginRight:3 }}>แมนวล</span>
                            <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,background:'#f3e8ff',color:'#7c3aed',fontSize:11,fontWeight:600 }}>มอเตอร์</span>
                          </>) : (
                            <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,
                              background:c.system==='motor'?'#f3e8ff':'#f3f4f6',
                              color:c.system==='motor'?'#7c3aed':'#374151',fontSize:11,fontWeight:600 }}>
                              {c.system === 'motor' ? 'มอเตอร์' : 'แมนวล'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding:'7px 10px',fontWeight:700,color:GOLD }}>{c.sewing_rate.toLocaleString()}</td>
                        <td style={{ padding:'7px 10px',fontWeight:700,color:GOLD }}>{c.setup_rate.toLocaleString()}</td>
                        <td style={{ padding:'7px 10px',color:c.height_min!=null?'#1d4ed8':'#9ca3af' }}>
                          {c.height_min != null ? `> ${c.height_min}` : '—'}
                        </td>
                        <td style={{ padding:'7px 10px',color:c.height_max!=null?'#1d4ed8':'#9ca3af' }}>
                          {c.height_max != null ? `≤ ${c.height_max}` : '—'}
                        </td>
                        <td style={{ padding:'7px 10px',color:'#374151' }}>{c.sort_order}</td>
                        <td style={{ padding:'7px 10px' }}>
                          <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:20,
                            background:c.is_active?'#dcfce7':'#f3f4f6',
                            color:c.is_active?'#16a34a':'#9ca3af',fontSize:11,fontWeight:600 }}>
                            {c.is_active ? 'ใช้งาน' : 'ปิด'}
                          </span>
                        </td>
                        <td style={{ padding:'6px 10px',whiteSpace:'nowrap' }}>
                          <button style={{ ...btnEdit,marginRight:4 }} onClick={() => openComboEdit(c)}>✏️</button>
                          <button style={{ ...btnCopy,marginRight:4 }} onClick={() => openComboCopy(c)}>📋</button>
                          <button style={btnRed} onClick={() => deleteCombo(c)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ================================================================ */}
      {/* Modal: Type config                                                */}
      {/* ================================================================ */}
      {typeModal && (
        <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.38)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff',borderRadius:14,padding:'26px 30px',width:520,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',fontFamily:FONT }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
              <h2 style={{ margin:0,fontSize:16,fontWeight:700,color:DARK }}>แก้ไข: {editType?.type_label}</h2>
              <button onClick={() => setTypeModal(false)} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af',lineHeight:1 }}>×</button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveType(); }}>

              {/* formula_group */}
              <Field label="สูตรคำนวณ (formula_group)" desc="wave = G1 ลอน/จีบ · sfold = G1 ลอน-กระดุม · sqy = G2/G4 ม้วน/พับ">
                <select value={tFormulaGroup} onChange={e => setTFormulaGroup(e.target.value)} style={INPUT}>
                  <option value="wave">wave  — (W × faceW × (H+0.5)) / 0.9144</option>
                  <option value="sfold">sfold — (W × 2.5 / loomW × (H+0.3)) / 0.9 + panels</option>
                  <option value="sqy">sqy   — W × H × 1.196</option>
                </select>
              </Field>

              {/* sfold sub-formula tabs */}
              {tFormulaGroup === 'sfold' && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12,color:'#6b7280',fontWeight:600,marginBottom:6 }}>สูตรย่อย — ตามทิศทางการเปิด</div>
                  <div style={{ display:'flex',gap:0,borderBottom:'1px solid #e2e4e9',marginBottom:0 }}>
                    {(['center','left','right'] as const).map(d => (
                      <button key={d} type="button" onClick={() => setSfoldDirTab(d)}
                        style={{ padding:'6px 16px',border:'none',cursor:'pointer',fontFamily:FONT,fontSize:12,fontWeight:sfoldDirTab===d?700:400,
                          background:'none',borderBottom:sfoldDirTab===d?`2px solid ${ACCENT}`:'2px solid transparent',
                          color:sfoldDirTab===d?ACCENT:'#9ca3af',marginBottom:-1 }}>
                        {d==='center'?'⇔ ผ่ากลาง':d==='left'?'⇐ เก็บซ้าย':'⇒ เก็บขวา'}
                      </button>
                    ))}
                  </div>
                  <div style={{ background:'#f8f5f0',borderRadius:'0 0 8px 8px',padding:'10px 14px',border:'1px solid #e9e0d4',borderTop:'none' }}>
                    {sfoldDirTab === 'center' ? (
                      <>
                        <pre style={{ margin:0,fontSize:11,fontFamily:'monospace',lineHeight:1.9,color:DARK }}>
{`Q = (W × 2.5) / loomW
R = H + 0.3
panels = ceil(Q / 2) × 2  (ปัดขึ้นเป็นเลขคู่)
total  = (Q × R / 0.9) + panels`}
                        </pre>
                        <div style={{ fontSize:11,color:'#9ca3af',marginTop:6 }}>
                          ตัวอย่าง: W=2.54, loomW=1.40, H=6.78 → Q=4.535 · panels=6 · total=<strong style={{color:DARK}}>41.68 yd</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <pre style={{ margin:0,fontSize:11,fontFamily:'monospace',lineHeight:1.9,color:DARK }}>
{`Q = (W × 2.5) / loomW
R = H + 0.3
panels = ceil(Q)  (ปัดขึ้น)
total  = (Q × R / 0.9) + panels`}
                        </pre>
                        <div style={{ fontSize:11,color:'#9ca3af',marginTop:6 }}>
                          ตัวอย่าง: W=2.54, loomW=1.40, H=6.78 → Q=4.535 · panels=5 · total=<strong style={{color:DARK}}>40.68 yd</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* formula constants */}
              <div style={{ background:'#f8f5f0',borderRadius:8,padding:'12px 14px',marginBottom:14,border:'1px solid #e9e0d4' }}>
                <div style={{ fontSize:11,fontWeight:600,color:'#6b7280',marginBottom:8 }}>ค่าคงที่ในสูตร</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 12px' }}>
                  <Field label={tFormulaGroup==='sqy' ? 'ตัวคูณพื้นที่' : 'W multiplier (J)'} desc={tFormulaGroup==='sfold'?'default 2.5':tFormulaGroup==='sqy'?'default 1.196':'—'}>
                    <input type="number" step="0.01" value={tFormulaP} onChange={e=>setTFormulaP(e.target.value)}
                      placeholder={tFormulaGroup==='sfold'?'2.5':tFormulaGroup==='sqy'?'1.196':'—'}
                      disabled={tFormulaGroup==='wave'||tFormulaGroup==='lon'}
                      style={{ ...INPUT, background: (tFormulaGroup==='wave'||tFormulaGroup==='lon')?'#f9fafb':'#fff' }} />
                  </Field>
                  <Field label="H addition (K)" desc={tFormulaGroup==='sfold'?'default 0.3':tFormulaGroup==='wave'?'default 0.5':'—'}>
                    <input type="number" step="0.01" value={tFormulaH} onChange={e=>setTFormulaH(e.target.value)}
                      placeholder={tFormulaGroup==='sfold'?'0.3':tFormulaGroup==='wave'?'0.5':'—'}
                      disabled={tFormulaGroup==='sqy'}
                      style={{ ...INPUT, background: tFormulaGroup==='sqy'?'#f9fafb':'#fff' }} />
                  </Field>
                  <Field label="Efficiency (eff)" desc={tFormulaGroup==='sfold'?'default 0.9':tFormulaGroup==='wave'?'default 0.9144':'—'}>
                    <input type="number" step="0.0001" value={tFormulaEff} onChange={e=>setTFormulaEff(e.target.value)}
                      placeholder={tFormulaGroup==='sfold'?'0.9':tFormulaGroup==='wave'?'0.9144':'—'}
                      disabled={tFormulaGroup==='sqy'}
                      style={{ ...INPUT, background: tFormulaGroup==='sqy'?'#f9fafb':'#fff' }} />
                  </Field>
                </div>
                <div style={{ fontSize:10,color:'#9ca3af',marginTop:4 }}>
                  {tFormulaGroup==='sfold' && `สูตร: (W × J / loomW × (H + K)) / eff + เผื่อผ้า`}
                  {tFormulaGroup==='wave'  && `สูตร: (W × faceW × (H + K)) / eff + เผื่อผ้า`}
                  {tFormulaGroup==='sqy'   && `สูตร: W × H × ตัวคูณ`}
                </div>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px',marginBottom:12 }}>
                <Field label="ลำดับแสดง (sort_order)" desc="ตัวเลขน้อย = อยู่บนสุด">
                  <input type="number" min="1" max="99" value={tSortOrder} onChange={e => setTSortOrder(e.target.value)} placeholder="เช่น 1" style={INPUT} />
                </Field>
                <Field label="รหัสสูตร (type_id)">
                  <div style={{ ...INPUT, background:'#f9fafb', color:'#374151', fontFamily:'monospace', cursor:'default' }}>{editType?.type_id ?? '—'}</div>
                </Field>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
                <Field label="faceW default (หน้าผ้า)" desc="เมตร เช่น 1.20 หรือ 1.40">
                  <InputRow value={tFaceW} onChange={setTFaceW} locked={tFaceWLocked} onToggleLock={() => setTFaceWLocked(p => !p)}
                    inputProps={{ type:'number', step:'0.05', min:'0.5', max:'3', placeholder:'เช่น 1.40' }} />
                </Field>
                <Field label="Height threshold — ขอบชุดสูง (ม.)" desc="H > ค่านี้ → auto-เลือก combo ชุดสูง">
                  <InputRow value={tThreshold} onChange={setTThreshold} locked={tThresholdLocked} onToggleLock={() => setTThresholdLocked(p => !p)}
                    inputProps={{ type:'number', step:'0.1', min:'1', max:'20', placeholder:'เช่น 3.20' }} />
                </Field>
              </div>

              <Field label="หมวดสินค้าราง (มอเตอร์)">
                <InputRow value={tMotor} onChange={setTMotor} locked={tMotorLocked} onToggleLock={() => setTMotorLocked(p => !p)}
                  inputProps={{ placeholder:'เช่น รางลอน-กระดุม-มอร์เตอร์' }} />
              </Field>
              <Field label="หมวดสินค้าราง (แมนวล)">
                <InputRow value={tManual} onChange={setTManual} locked={tManualLocked} onToggleLock={() => setTManualLocked(p => !p)}
                  inputProps={{ placeholder:'เช่น รางลอน-กระดุม' }} />
              </Field>

              <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:4 }}>
                <button type="button" style={btnGray} onClick={() => setTypeModal(false)}>ยกเลิก</button>
                <button type="submit" style={btnDark} disabled={typeSaving}>{typeSaving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Modal: Combo add/edit                                             */}
      {/* ================================================================ */}
      {comboModal && (
        <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.38)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff',borderRadius:14,padding:'26px 30px',width:500,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',fontFamily:FONT }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
              <h2 style={{ margin:0,fontSize:16,fontWeight:700,color:DARK }}>{editCombo ? 'แก้ไข Combo' : 'เพิ่ม Combo'}</h2>
              <button onClick={() => setComboModal(false)} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af',lineHeight:1 }}>×</button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveCombo(); }}>
              <Field label="ประเภทผ้าม่าน">
                <select value={cTypeId} onChange={e => setCTypeId(e.target.value)} style={INPUT}>
                  {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_label}</option>)}
                </select>
              </Field>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
                <Field label="Combo Key" desc="รหัสภายใน ไม่ซ้ำ ต่อ type">
                  <input value={cComboKey} onChange={e => setCComboKey(e.target.value)}
                    placeholder="เช่น motor-high" style={INPUT} />
                </Field>
                <Field label="Label (แสดงใน wizard)">
                  <input value={cLabel} onChange={e => setCLabel(e.target.value)}
                    placeholder="เช่น ลอนกระดุม-มอเตอร์-ชุดสูง" style={INPUT} />
                </Field>
              </div>
              <Field label="ระบบ">
                <select value={cSystem} onChange={e => setCSystem(e.target.value as 'manual'|'motor'|'both')} style={INPUT}>
                  <option value="manual">แมนวล</option>
                  <option value="motor">มอเตอร์</option>
                  <option value="both">แมนวล + มอเตอร์</option>
                </select>
              </Field>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
                <Field label="ค่าเย็บ (฿/ม.)">
                  <input type="number" min="0" step="10" value={cSewing} onChange={e => setCSewing(e.target.value)}
                    placeholder="เช่น 270" style={INPUT} />
                </Field>
                <Field label="ค่าติดตั้ง (฿/ชุด)">
                  <input type="number" min="0" step="50" value={cSetup} onChange={e => setCSetup(e.target.value)}
                    placeholder="เช่น 2000" style={INPUT} />
                </Field>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
                <Field label="H min (ม.) — H >" desc="null = ไม่จำกัด">
                  <InputRow value={cHMin} onChange={setCHMin} locked={cHMinLocked} onToggleLock={() => setCHMinLocked(p => !p)}
                    inputProps={{ type:'number', step:'0.01', min:'0', placeholder:'เช่น 3.20' }} />
                </Field>
                <Field label="H max (ม.) — H ≤" desc="null = ไม่จำกัด">
                  <InputRow value={cHMax} onChange={setCHMax} locked={cHMaxLocked} onToggleLock={() => setCHMaxLocked(p => !p)}
                    inputProps={{ type:'number', step:'0.01', min:'0', placeholder:'เช่น 7.00' }} />
                </Field>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px' }}>
                <Field label="ลำดับ (sort)">
                  <input type="number" min="0" value={cSort} onChange={e => setCSort(e.target.value)}
                    placeholder="0" style={INPUT} />
                </Field>
                <Field label="สถานะ">
                  <div style={{ display:'flex',alignItems:'center',gap:8,paddingTop:6 }}>
                    <input type="checkbox" id="cActive" checked={cActive} onChange={e => setCActive(e.target.checked)}
                      style={{ width:16,height:16,cursor:'pointer',accentColor:ACCENT }} />
                    <label htmlFor="cActive" style={{ fontSize:13,cursor:'pointer',color:DARK }}>เปิดใช้งาน</label>
                  </div>
                </Field>
              </div>

              <div style={{ display:'flex',justifyContent:'flex-end',gap:8,marginTop:4 }}>
                <button type="button" style={btnGray} onClick={() => setComboModal(false)}>ยกเลิก</button>
                <button type="submit" style={btnDark} disabled={comboSaving}>{comboSaving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
