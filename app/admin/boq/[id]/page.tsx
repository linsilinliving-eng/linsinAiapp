'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Menu } from '@mantine/core';
import Swal from 'sweetalert2';
import WizardModal from './WizardModal';

const swalConfirm = (title: string, text: string) =>
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1f2937',
    cancelButtonColor: '#e5e7eb',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
    customClass: { cancelButton: 'swal-cancel-dark' },
    reverseButtons: true,
    focusCancel: true,
  });

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type RowType = 'heading' | 'note' | 'item' | 'retail';

interface BoqRow {
  id: string; type: RowType; text?: string; no?: string; size?: string;
  desc?: string; code?: string; faceW?: string; unitPrice?: string;
  qty?: string; price?: string; discount?: string; net?: string;
  rail?: string; motor?: string; c13?: string; hook?: string;
  sewing?: string; install?: string; unit?: string; total?: string;
}

interface BoqDoc {
  id: number; boq_number: string; revision: number; opt_count: number;
  copy_count: number; quote_number: string | null; doc_date: string | null;
  customer_name: string | null; customer_code: string | null;
  project: string | null; project_name: string | null;
  location: string | null; responsible_person: string | null;
  note: string | null; amount: number; discount: number;
  subtotal: number; vat: number; total: number;
  quotation_ref: string | null; work_order_ref: string | null;
  status: string;
}

let _uid = 0;
const nid = () => `row_${++_uid}_${Math.random().toString(36).slice(2, 7)}`;
const I = (no: string, size: string, desc: string, code: string, faceW: string, unitPrice: string, qty: string, price: string, discount: string, net: string, rail: string, motor: string, unit: string, total: string): BoqRow =>
  ({ id: nid(), type: 'item', no, size, desc, code, faceW, unitPrice, qty, price, discount, net, rail, motor, c13: '300', hook: '300', sewing: '—', install: '—', unit, total });
const R = (no: string, desc: string, unitPrice: string, qty: string, price: string, net: string, rail: string, unit: string, total: string): BoqRow =>
  ({ id: nid(), type: 'retail', no, size: '—', desc, code: '', faceW: '—', unitPrice, qty, price, discount: '—', net, rail, motor: '—', c13: '—', hook: '—', sewing: '—', install: '—', unit, total });
const H = (text: string): BoqRow => ({ id: nid(), type: 'heading', text });
const N = (text: string): BoqRow => ({ id: nid(), type: 'note', text });

const ITEM_FIELDS: (keyof BoqRow)[] = ['faceW','unitPrice','qty','price','discount','net','rail','motor','c13','hook','sewing','install','unit'];

const toNum = (s?: string) => { if (!s) return 0; const n = parseFloat(s.replace(/,/g,'').replace(/[^0-9.-]/g,'')); return Number.isFinite(n) ? n : 0; };

/* convert DB row → BoqRow */
function dbToRow(r: any): BoqRow {
  return {
    id: nid(),
    type: (r.row_type ?? 'item') as RowType,
    text: r.text_val ?? undefined,
    no: r.no ?? undefined,
    size: r.size_val ?? undefined,
    desc: r.desc_text ?? undefined,
    code: r.code ?? undefined,
    faceW: r.face_w ?? undefined,
    unitPrice: r.unit_price ?? undefined,
    qty: r.qty ?? undefined,
    price: r.price ?? undefined,
    discount: r.discount_val ?? undefined,
    net: r.net ?? undefined,
    rail: r.rail ?? undefined,
    motor: r.motor ?? undefined,
    c13: r.c13 ?? undefined,
    hook: r.hook ?? undefined,
    sewing: r.sewing ?? undefined,
    install: r.install_val ?? undefined,
    unit: r.unit ?? undefined,
    total: r.total ?? undefined,
  };
}
const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtThaiDate = (d: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear() + 543}`;
};

type UndoEntry = { action: 'add'; id: string } | { action: 'del'; index: number; row: BoqRow } | { action: 'snapshot'; rows: BoqRow[] };

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function BoqDocPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [boq, setBoq] = useState<BoqDoc | null>(null);
  const [contact, setContact] = useState<{ contact_name: string | null; contact_phone: string | null } | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<BoqRow[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const undoStack = useRef<UndoEntry[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<BoqRow | null>(null);

  /* auto-save */
  type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const rowsRef = useRef<BoqRow[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* keep rowsRef in sync for auto-save timer */
  useEffect(() => { rowsRef.current = rows; }, [rows]);

  /* triggerSave — debounced 1.2 s, reads rowsRef so always captures latest */
  const triggerSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    clearTimeout(savedTimer.current);
    setSaveState('pending');
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const res = await fetch(`/api/boq/${id}/items`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowsRef.current),
        });
        if (res.ok) {
          setSaveState('saved');
          savedTimer.current = setTimeout(() => setSaveState('idle'), 3000);
        } else {
          setSaveState('error');
        }
      } catch {
        setSaveState('error');
      }
    }, 1200);
  }, [id]);

  /* load BOQ header + items */
  useEffect(() => {
    fetch(`/api/boq/${id}`)
      .then(r => r.json())
      .then((doc: BoqDoc) => {
        setBoq(doc);
        setStatus(doc.status ?? 'draft');
        setLoadingDoc(false);
        if (doc.customer_code) {
          fetch(`/api/customers?q=${encodeURIComponent(doc.customer_code)}&limit=1`)
            .then(r => r.json())
            .then(j => { if (j.rows?.[0]) setContact(j.rows[0]); });
        }
      })
      .catch(() => setLoadingDoc(false));

    /* load saved rows — set directly, no triggerSave */
    fetch(`/api/boq/${id}/items`)
      .then(r => r.json())
      .then((items: any[]) => {
        if (Array.isArray(items) && items.length > 0) {
          const loaded = items.map(dbToRow);
          setRows(loaded);
          rowsRef.current = loaded;
        }
      })
      .catch(() => {/* ignore */});
  }, [id]);

  /* save status */
  const saveStatus = async (s: string) => {
    setStatus(s);
    setSaving(true);
    await fetch(`/api/boq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s }),
    });
    setSaving(false);
  };

  const pushUndo = (e: UndoEntry) => { undoStack.current.push(e); if (undoStack.current.length > 50) undoStack.current.shift(); };

  const summary = useMemo(() => {
    const sub = rows.filter(r => r.type === 'item' || r.type === 'retail').reduce((s, r) => s + toNum(r.total), 0);
    const vat = sub * 0.07;
    return { sub, vat, total: sub + vat };
  }, [rows]);

  const addFullRow = (row: BoqRow) => {
    setRows(p => [...p, row]);
    pushUndo({ action: 'add', id: row.id });
    triggerSave();
  };

  const updateRow = (updated: BoqRow) => {
    setRows(p => {
      const idx = p.findIndex(r => r.id === updated.id);
      if (idx < 0) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const next = [...p];
      next[idx] = updated;
      return next;
    });
    triggerSave();
  };

  const addRow = (type: RowType, desc?: string) => {
    const blank: BoqRow = type === 'heading' ? { id: nid(), type, text: 'หัวเรื่องใหม่' }
      : type === 'note' ? { id: nid(), type, text: '📝 หมายเหตุ:' }
      : type === 'retail' ? R('', 'ค่าปลีก', '', '1 ตัว', '', '', '—', 'ตัว', '')
      : I('', '', desc ?? 'รายการใหม่', '', '', '', '', '', '', '', '—', '—', 'ชุด', '');
    setRows(p => [...p, blank]);
    pushUndo({ action: 'add', id: blank.id });
    triggerSave();
  };

  const deleteRow = async (rowId: string) => {
    const { isConfirmed } = await swalConfirm('ลบแถวนี้?', 'ไม่สามารถกู้คืนได้ (ยกเว้น UNDO)');
    if (!isConfirmed) return;
    setRows(p => { const index = p.findIndex(r => r.id === rowId); if (index < 0) return p; pushUndo({ action: 'del', index, row: p[index] }); return p.filter(r => r.id !== rowId); });
    triggerSave();
  };

  const move = (rowId: string, dir: -1 | 1) => {
    setRows(p => { const i = p.findIndex(r => r.id === rowId); const j = i + dir; if (i < 0 || j < 0 || j >= p.length) return p; pushUndo({ action: 'snapshot', rows: p }); const next = [...p]; [next[i], next[j]] = [next[j], next[i]]; return next; });
    triggerSave();
  };

  const duplicate = (rowId: string) => {
    setRows(p => { const i = p.findIndex(r => r.id === rowId); if (i < 0) return p; pushUndo({ action: 'snapshot', rows: p }); const clone = { ...p[i], id: nid() }; const next = [...p]; next.splice(i + 1, 0, clone); return next; });
    triggerSave();
  };

  const addNoteAfter = (rowId: string) => {
    setRows(p => { const i = p.findIndex(r => r.id === rowId); if (i < 0) return p; pushUndo({ action: 'snapshot', rows: p }); const note: BoqRow = { id: nid(), type: 'note', text: '📝 หมายเหตุ:' }; const next = [...p]; next.splice(i + 1, 0, note); return next; });
    triggerSave();
  };

  const insertBlankAbove = (rowId: string) => {
    setRows(p => {
      const i = p.findIndex(r => r.id === rowId);
      if (i < 0) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const src = p[i];
      const blank: BoqRow =
        src.type === 'heading' ? { id: nid(), type: 'heading', text: 'หัวเรื่องใหม่' } :
        src.type === 'note'    ? { id: nid(), type: 'note',    text: '📝 หมายเหตุ:' } :
        src.type === 'retail'  ? R('', 'ค่าปลีก', '', '1 ตัว', '', '', '—', 'ตัว', '') :
                                 I('', '', 'รายการใหม่', '', '', '', '', '', '', '', '—', '—', 'ชุด', '');
      const next = [...p];
      next.splice(i, 0, blank);
      return next;
    });
    triggerSave();
  };

  const clearRow = async (rowId: string) => {
    const { isConfirmed } = await swalConfirm('ล้างข้อมูลแถวนี้?', 'ข้อมูลทั้งหมดในแถวจะถูกล้าง (ยกเว้น UNDO)');
    if (!isConfirmed) return;
    setRows(p => {
      const i = p.findIndex(r => r.id === rowId);
      if (i < 0) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const src = p[i];
      const cleared: BoqRow =
        src.type === 'heading' ? { id: src.id, type: 'heading', text: '' } :
        src.type === 'note'    ? { id: src.id, type: 'note',    text: '' } :
        src.type === 'retail'  ? { ...R('', '', '', '', '', '', '—', 'ตัว', ''), id: src.id } :
                                 { ...I('', '', '', '', '', '', '', '', '', '', '—', '—', 'ชุด', ''), id: src.id };
      const next = [...p];
      next[i] = cleared;
      return next;
    });
    triggerSave();
  };

  const undo = () => {
    const last = undoStack.current.pop();
    if (!last) return;
    if (last.action === 'add') setRows(p => p.filter(r => r.id !== last.id));
    else if (last.action === 'del') setRows(p => { const next = [...p]; next.splice(last.index, 0, last.row); return next; });
    else setRows(last.rows);
    triggerSave();
  };

  const commit = (rowId: string, field: keyof BoqRow, value: string) => {
    setRows(p => p.map(r => r.id === rowId ? { ...r, [field]: value } : r));
    triggerSave();
  };

  const Cell = ({ row, field, className }: { row: BoqRow; field: keyof BoqRow; className?: string }) => (
    <td className={className} style={{ padding: 0 }}>
      <input className="boq-cell-input" value={(row[field] as string) ?? ''} onChange={e => commit(row.id, field, e.target.value)} />
    </td>
  );

  if (loadingDoc) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontFamily: 'Sarabun,sans-serif' }}>กำลังโหลด…</div>;
  if (!boq) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444', fontFamily: 'Sarabun,sans-serif' }}>ไม่พบเอกสาร <button onClick={() => router.push('/admin/boq')} style={{ marginLeft: 12, padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>← กลับ</button></div>;

  return (
    <div className="boq-page">
      <style>{CSS}</style>
      <div className="page-card">

        {/* ---------- header ---------- */}
        <div className="boq-header">
          <div className="header-right" style={{ textAlign: 'left' }}>
            <div className="badge-boq">
              ใบประมาณราคา · BOQ <span className="badge-rev">Rev.{boq.revision}</span>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>เลขที่</td><td>{boq.boq_number}</td>
                  <td style={{ paddingLeft: 16, color: '#9ca3af' }}>วันที่</td>
                  <td>{fmtThaiDate(boq.doc_date)}</td>
                </tr>
                <tr>
                  <td>Opt</td><td>{boq.opt_count}</td>
                  <td style={{ paddingLeft: 16, color: '#9ca3af' }}>ผู้ดูแล</td>
                  <td>{boq.responsible_person ?? '—'}</td>
                </tr>
                {boq.quote_number && (
                  <tr>
                    <td>ใบเสนอราคา</td><td>{boq.quote_number}</td>
                    <td style={{ paddingLeft: 16, color: '#9ca3af' }}>สถานะ</td>
                    <td><span style={{ fontWeight: 700, color: status === 'approved' ? '#15803d' : status === 'sent' ? '#1d4ed8' : status === 'cancelled' ? '#b91c1c' : '#6b7280' }}>{status === 'draft' ? 'แบบร่าง' : status === 'sent' ? 'ส่งแล้ว' : status === 'approved' ? 'อนุมัติ' : 'ยกเลิก'}</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- customer bar ---------- */}
        <div className="customer-bar">
          {boq.customer_name && <><span><span className="lbl">ลูกค้า:</span><span className="val">{boq.customer_name}</span></span><span className="sep">|</span></>}
          {boq.customer_code && <><span><span className="lbl">รหัส:</span><span className="val">{boq.customer_code}</span></span><span className="sep">|</span></>}
          {contact?.contact_name && <><span><span className="lbl">ผู้ติดต่อ:</span><span className="val">{contact.contact_name}{contact.contact_phone ? ` · ${contact.contact_phone}` : ''}</span></span><span className="sep">|</span></>}
          {boq.project && <><span><span className="lbl">โครงการ:</span><span className="val">{boq.project}</span></span><span className="sep">|</span></>}
          {boq.project_name && <><span><span className="lbl">ประเภทงาน:</span><span className="val">{boq.project_name}</span></span></>}
        </div>

        {/* ---------- toolbar ---------- */}
        <div className="action-toolbar">
          <button className="toolbar-btn" style={{ background:'#f3f4f6',border:'1px solid #d1d5db',color:'#374151' }} onClick={() => router.push('/admin/boq')}>← รายการ</button>
          <button className="toolbar-btn btn-title" onClick={() => addRow('heading')}>+ หัวเรื่อง</button>
          <button className="toolbar-btn btn-item" onClick={() => setWizardOpen(true)}>+ รายการ</button>
          <button className="toolbar-btn btn-retail" onClick={() => addRow('retail')}>+ ค่าปลีก-AUTO</button>
          <button className="toolbar-btn btn-note" onClick={() => addRow('note')}>+ NOTE</button>
          <button className="toolbar-btn btn-undo" onClick={undo}>↶ UNDO</button>
          <button className="toolbar-btn btn-print" onClick={() => window.print()}>🖨️ พิมพ์</button>
          <span className="save-indicator" data-state={saveState}>
            {saveState === 'pending' || saveState === 'saving' ? '⏳ กำลังบันทึก…' : saveState === 'saved' ? '✓ บันทึกแล้ว' : saveState === 'error' ? '⚠ บันทึกไม่สำเร็จ' : ''}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>สถานะ</label>
            <select value={status} onChange={e => saveStatus(e.target.value)}
              style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
                background: status==='draft'?'#f3f4f6':status==='sent'?'#dbeafe':status==='approved'?'#dcfce7':'#fee2e2',
                color: status==='draft'?'#374151':status==='sent'?'#1d4ed8':status==='approved'?'#15803d':'#b91c1c',
              }}>
              <option value="draft">แบบร่าง</option>
              <option value="sent">ส่งแล้ว</option>
              <option value="approved">อนุมัติ</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>

        {/* ---------- table ---------- */}
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: 14, border: '2px dashed #e2e4e9', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div>ยังไม่มีรายการ — กด <strong>+ รายการ</strong> เพื่อเริ่มต้น</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="boq">
              <colgroup>
                <col style={{ width: 96 }} /><col style={{ width: 38 }} />
                <col style={{ width: 168 }} /><col />
                <col style={{ width: 40 }} /><col style={{ width: 56 }} />
                <col style={{ width: 58 }} /><col style={{ width: 70 }} />
                <col style={{ width: 70 }} /><col style={{ width: 78 }} />
                <col style={{ width: 56 }} /><col style={{ width: 52 }} />
                <col style={{ width: 34 }} /><col style={{ width: 34 }} />
                <col style={{ width: 52 }} /><col style={{ width: 52 }} />
                <col style={{ width: 32 }} /><col style={{ width: 74 }} />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2}>Action</th><th rowSpan={2}>ลำดับ</th>
                  <th rowSpan={2}>ขนาด<br />SIZE</th><th rowSpan={2}>ประเภท / รายละเอียด</th>
                  <th rowSpan={2} className="rot"><span className="r">หน้าผ้า(ม.)</span></th>
                  <th rowSpan={2}>ราคา<br />ต่อหน่วย</th>
                  <th>จำนวน</th><th>ราคา</th><th>ส่วนลด</th><th>ราคาสินค้า</th><th>ราง</th>
                  <th rowSpan={2} className="rot"><span className="r">มอเตอร์</span></th>
                  <th rowSpan={2} className="rot"><span className="r">ด้ามจูง</span></th>
                  <th rowSpan={2} className="rot"><span className="r">ตะขอ</span></th>
                  <th rowSpan={2}>ค่าเย็บ</th><th rowSpan={2}>ค่าติดตั้ง</th>
                  <th rowSpan={2} className="rot"><span className="r">หน่วย</span></th>
                  <th rowSpan={2}>จำนวนเงิน</th>
                </tr>
                <tr>
                  <th>ที่ใช้<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(yd/sqyd)</span></th>
                  <th>รวม</th><th>ส่วนลด<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(บาท)</span></th>
                  <th>สุทธิ</th><th>อุปกรณ์</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const actionCell = (
                    <td className="cell-act">
                      <span className="act-inner">
                        <button className="bi" title="แก้ไขรายการ" onClick={() => { setEditingRow(row); setWizardOpen(true); }}>✏️</button>
                        <button className="bi" onClick={() => deleteRow(row.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                        <Menu shadow="md" width={150} position="bottom-start">
                          <Menu.Target><button className="bp bi">+</button></Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item onClick={() => move(row.id, -1)}>↑ เลื่อนขึ้น</Menu.Item>
                            <Menu.Item onClick={() => move(row.id, 1)}>↓ เลื่อนลง</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item onClick={() => insertBlankAbove(row.id)}>▲ แถวใหม่ด้านบน</Menu.Item>
                            <Menu.Item onClick={() => duplicate(row.id)}>⧉ ทำซ้ำ</Menu.Item>
                            <Menu.Item onClick={() => addNoteAfter(row.id)}>📝 NOTE ต่อท้าย</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" onClick={() => clearRow(row.id)}>🧹 ล้างข้อมูล</Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </span>
                    </td>
                  );
                  if (row.type === 'heading') return (
                    <tr key={row.id} className={`row-heading${highlightedId === row.id ? ' row-editing' : ''}`}>
                      {actionCell}
                      <td colSpan={17} style={{ padding: 0 }}><input className="boq-cell-input boq-heading-input" value={row.text || ''} onChange={e => commit(row.id, 'text', e.target.value)} /></td>
                    </tr>
                  );
                  if (row.type === 'note') return (
                    <tr key={row.id} className={`row-note${highlightedId === row.id ? ' row-editing' : ''}`}>
                      {actionCell}
                      <td colSpan={17} style={{ padding: 0 }}><input className="boq-cell-input boq-note-input" value={row.text || ''} onChange={e => commit(row.id, 'text', e.target.value)} /></td>
                    </tr>
                  );
                  return (
                    <tr key={row.id} className={`${row.type === 'retail' ? 'row-retail' : 'row-item'}${highlightedId === row.id ? ' row-editing' : ''}`}>
                      {actionCell}
                      <Cell row={row} field="no" />
                      <Cell row={row} field="size" className="cl" />
                      <td className="cl" style={{ padding: 0 }}>
                        <input className="boq-cell-input boq-cell-left" value={row.desc || ''} onChange={e => commit(row.id, 'desc', e.target.value)} />
                        {row.code ? <div className="si"><span>รหัส: {row.code}</span></div> : null}
                      </td>
                      {ITEM_FIELDS.map(f => {
                        const cls = f==='discount'?'c-red':f==='net'?'c-net':f==='faceW'?'cr c-facew':f==='qty'?'cr c-qty':f==='motor'?'cr c-motor':'cr';
                        return <Cell key={f} row={row} field={f} className={cls} />;
                      })}
                      <Cell row={row} field="total" className="c-tot" />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- summary ---------- */}
        {rows.length > 0 && (
          <div className="sum-wrap">
            <table className="sum-tbl">
              <tbody>
                <tr><td>รวมก่อน VAT</td><td>{fmt(summary.sub)} บาท</td></tr>
                <tr className="vat"><td>VAT 7%</td><td>{fmt(summary.vat)} บาท</td></tr>
                <tr className="tot"><td><strong>รวมทั้งสิ้น</strong></td><td><strong>{fmt(summary.total)} บาท</strong></td></tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
      {wizardOpen && (
        <WizardModal
          key={editingRow?.id ?? 'new'}
          onClose={() => { setWizardOpen(false); setEditingRow(null); }}
          onAdd={editingRow ? updateRow : addFullRow}
          nextNo={rows.filter(r => r.type === 'item' || r.type === 'retail').length + 1}
          editRow={editingRow ?? undefined}
        />
      )}
    </div>
  );
}

const CSS = `
.boq-page{font-family:'Sarabun','Cordia New','Browallia New',Tahoma,sans-serif;font-size:14px;color:#111827;background:#f0f1f3;min-height:100vh;padding:24px}
.boq-page .page-card{background:#fff;border:1px solid #e2e4e9;border-radius:16px;width:100%;max-width:100%;margin:0;padding:18px 20px 24px;box-shadow:0 4px 24px rgba(0,0,0,.07)}
.boq-page .boq-header{display:flex;justify-content:flex-start;align-items:flex-start;gap:20px;padding-bottom:14px;border-bottom:1.5px solid #e2e4e9;margin-bottom:12px}
.boq-page .badge-boq{display:inline-block;background:#f0f1f3;color:#1f2937;border:1px solid #d1d5db;border-radius:6px;padding:2px 12px;font-weight:700;font-size:16px;letter-spacing:1px;margin-bottom:6px}
.boq-page .badge-rev{display:inline-block;background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:4px;padding:1px 8px;font-weight:700;font-size:12px;margin-left:8px;vertical-align:middle}
.boq-page .header-right table{font-size:13px;border-collapse:collapse}
.boq-page .header-right td{padding:1px 6px}
.boq-page .header-right td:first-child{color:#9ca3af}
.boq-page .header-right td:nth-child(2){font-weight:600}
.boq-page .customer-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:#fafafa;border:1px solid #e2e4e9;border-radius:8px;padding:7px 14px;margin-bottom:10px;font-size:13px}
.boq-page .customer-bar .lbl{color:#9ca3af;margin-right:2px}
.boq-page .customer-bar .val{font-weight:600;color:#111827}
.boq-page .sep{color:#d1d5db}
.boq-page .action-toolbar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;align-items:center}
.boq-page .toolbar-btn{padding:4px 12px;font-family:inherit;font-size:12px;border-radius:6px;border:1px solid;cursor:pointer;font-weight:600;transition:all .15s}
.boq-page .btn-title{background:#fff3cd;border-color:#f0ad4e;color:#6d4c00}.boq-page .btn-title:hover{background:#ffe8a0}
.boq-page .btn-item{background:#d4edda;border-color:#28a745;color:#145221}.boq-page .btn-item:hover{background:#b8dfc4}
.boq-page .btn-retail{background:#cfe2ff;border-color:#0d6efd;color:#082c6b}.boq-page .btn-retail:hover{background:#aecbf8}
.boq-page .btn-note{background:#f0f1f3;border-color:#c4c8d0;color:#374151}.boq-page .btn-note:hover{background:#e2e4e9}
.boq-page .btn-undo{background:#f8d7da;border-color:#dc3545;color:#721c24}.boq-page .btn-undo:hover{background:#f5b8bc}
.boq-page .btn-print{background:#f0f1f3;border-color:#374151;color:#374151}.boq-page .btn-print:hover{background:#e2e4e9}
.boq-page .save-indicator{font-size:12px;padding:2px 0;min-width:100px;transition:all .3s}
.boq-page .save-indicator[data-state="idle"],.boq-page .save-indicator[data-state="pending"]{color:#9ca3af}
.boq-page .save-indicator[data-state="saving"]{color:#6b7280;font-style:italic}
.boq-page .save-indicator[data-state="saved"]{color:#16a34a;font-weight:600}
.boq-page .save-indicator[data-state="error"]{color:#dc2626;font-weight:600}
.boq-page .table-wrap{overflow-x:auto}
.boq-page table.boq{border-collapse:separate;border-spacing:0;width:100%;min-width:1130px;font-size:13px;table-layout:fixed}
.boq-page table.boq thead th{background:#1f2937;color:#fff;text-align:center;vertical-align:middle;padding:5px 3px;border:1px solid #374151;font-size:13px;font-weight:700;white-space:nowrap;line-height:1.3}
.boq-page table.boq thead th:first-child{position:sticky;left:0;z-index:3;background:#1f2937;box-shadow:2px 0 4px rgba(0,0,0,.12)}
.boq-page thead th.rot{width:22px;min-width:22px;padding:3px 1px}
.boq-page thead th.rot .r{display:inline-block;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;font-size:11px;line-height:1}
.boq-page table.boq tbody td{border:1px solid #e2e4e9;padding:4px;vertical-align:middle;text-align:center;overflow:hidden;white-space:nowrap}
.boq-page table.boq tbody tr.row-heading td{background:#e8eaed;font-weight:700;font-size:13px;color:#374151;text-align:left;padding-left:8px;white-space:normal}
.boq-page tr.row-item td{background:#fff}.boq-page tr.row-item:hover td{background:#f4f5f7}
.boq-page tr.row-retail td{background:#fefcf0}.boq-page tr.row-retail:hover td{background:#fdf5d0}
.boq-page table.boq tbody tr.row-note td{background:#f4f5f7;font-style:italic;color:#6b7280;font-size:12px;text-align:left;padding-left:8px;white-space:normal}
.boq-page table.boq tbody td.cl{text-align:left;white-space:normal;font-size:13px}
.boq-page table.boq tbody td.cr{text-align:right}
.boq-page table.boq tbody td.c-red{color:#c0392b;text-align:right}
.boq-page table.boq tbody td.c-net{font-size:13px;text-align:right;font-weight:400}
.boq-page table.boq tbody td.c-tot{font-weight:700;font-size:13px;text-align:right;color:#166534}
.boq-page table.boq tbody td.c-facew{font-size:11px;color:#6b7280}
.boq-page table.boq tbody td.c-qty{font-size:11px;color:#6b7280}
.boq-page table.boq tbody td.c-motor{font-size:13px;color:#6b7280}
.boq-page table.boq tbody td.cell-act{text-align:left;white-space:nowrap;padding:4px;vertical-align:middle;border:1px solid #e2e4e9;position:sticky;left:0;z-index:2;background:#fff;box-shadow:2px 0 4px rgba(0,0,0,.06)}
.boq-page tr.row-heading td.cell-act{background:#e8eaed}
.boq-page tr.row-note td.cell-act{background:#f4f5f7}
.boq-page tr.row-retail td.cell-act{background:#fffbeb}
.boq-page tr.row-editing td.cell-act{background:#f0f7ff}
.boq-page td.cell-act>.act-inner{display:flex;align-items:center;justify-content:space-between;width:100%}
.boq-page .bi{background:none;border:none;cursor:pointer;font-size:13px;width:24px;height:24px;min-width:24px;min-height:24px;padding:0;border-radius:4px;transition:background .12s;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1}
.boq-page .bi:hover{background:#e8eaed}
.boq-page .bi.bi-active{background:#dbeafe}
.boq-page tr.row-editing td{background:#f0f7ff !important;outline:1px solid #bfdbfe}
.boq-page tr.row-editing .boq-cell-input{background:#e8f1fd}
.boq-page .bp{background:#374151;color:#fff;font-weight:700}.boq-page .bp:hover{background:#1f2937}
.boq-page .si{font-size:11px;color:#9ca3af;margin-top:2px;white-space:normal}
.boq-page .sum-wrap{display:flex;justify-content:flex-end;margin-top:14px}
.boq-page .sum-tbl{border-collapse:collapse;font-size:13px;min-width:310px}
.boq-page .sum-tbl td{padding:3px 10px}
.boq-page .sum-tbl td:first-child{color:#6b7280;text-align:right}
.boq-page .sum-tbl td:last-child{text-align:right;font-weight:600;min-width:100px}
.boq-page .sum-tbl tr.tot td{border-top:2px solid #1f2937;font-weight:700;font-size:15px;color:#111827}
.boq-page .sum-tbl tr.vat td{color:#9ca3af;font-size:12px}
.swal-cancel-dark{color:#374151 !important}
@media print{.boq-page .action-toolbar,.boq-page .bi,.boq-page .bp{display:none}.boq-page table.boq tbody td.cell-act,.boq-page thead th:first-child{display:none}.boq-page .page-card{box-shadow:none;border:none}.boq-page{background:#fff;padding:0}}
.boq-cell-input{width:100%;border:none;background:transparent;font-family:inherit;font-size:inherit;color:inherit;padding:3px 4px;outline:none;text-align:right;display:block;min-width:0;box-sizing:border-box}
.boq-cell-input:focus{background:rgba(55,65,81,.07);outline:1.5px solid #374151;border-radius:3px;position:relative;z-index:1}
.boq-cell-left,.boq-page table.boq tbody td.cl .boq-cell-input{text-align:left}
.boq-page table.boq tbody tr.row-item td:nth-child(2) .boq-cell-input,.boq-page table.boq tbody tr.row-retail td:nth-child(2) .boq-cell-input{text-align:center}
.boq-heading-input{font-weight:700;font-size:13px;color:#374151;text-align:left}
.boq-note-input{font-style:italic;font-size:12px;color:#6b7280;text-align:left}
`;
