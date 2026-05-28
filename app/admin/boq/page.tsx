'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/* ─── types ─── */
interface BoqDoc {
  id: number;
  boq_number: string;
  revision: number;
  opt_count: number;
  copy_count: number;
  quote_number: string | null;
  doc_date: string | null;
  customer_name: string | null;
  customer_code: string | null;
  project: string | null;
  project_name: string | null;
  location: string | null;
  responsible_person: string | null;
  note: string | null;
  amount: number;
  discount: number;
  subtotal: number;
  vat: number;
  total: number;
  quotation_ref: string | null;
  work_order_ref: string | null;
  status: string;
  created_at: string;
}

const MONTHS = ['แสดงทั้งหมด','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const CUR_YEAR = new Date().getFullYear() + 543;
const YEARS = Array.from({ length: 6 }, (_, i) => CUR_YEAR - i);

const fmt = (n: number) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  const day = String(dt.getDate()).padStart(2, '0');
  const mon = String(dt.getMonth() + 1).padStart(2, '0');
  const yr = dt.getFullYear() + 543;
  return `${day}-${mon}-${yr}`;
};

/* ─── Add Modal ─── */
function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    boq_number: '', revision: 1, opt_count: 1, copy_count: 1,
    quote_number: '', doc_date: today,
    customer_name: '', customer_code: '',
    project: '', project_name: '', location: '',
    responsible_person: '', note: '',
    amount: '', discount: '0',
    vat_rate: '0.07',
    status: 'draft',
  });
  const [loadingNo, setLoadingNo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [cusQ, setCusQ] = useState('');
  const [cusList, setCusList] = useState<{ id: number; cus_name: string; cus_code: string; nickname: string | null }[]>([]);
  const [cusOpen, setCusOpen] = useState(false);
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch('/api/boq?action=next')
      .then(r => r.json())
      .then(j => { setForm(p => ({ ...p, boq_number: j.boq_number })); setLoadingNo(false); })
      .catch(() => setLoadingNo(false));
  }, []);

  useEffect(() => {
    if (!cusQ.trim()) { setCusList([]); setCusOpen(false); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(cusQ)}&limit=10`);
      if (res.ok) { const j = await res.json(); setCusList(j.rows ?? []); setCusOpen(true); }
    }, 250);
    return () => clearTimeout(t);
  }, [cusQ]);

  const selectCus = (c: { cus_name: string; cus_code: string }) => {
    setForm(p => ({ ...p, customer_name: c.cus_name, customer_code: c.cus_code }));
    setCusQ(c.cus_name);
    setCusOpen(false);
  };

  const save = async () => {
    if (!form.boq_number.trim()) { setErr('กรุณาระบุเลขที่เอกสาร'); return; }
    setSaving(true);
    const res = await fetch('/api/boq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) || 0, discount: Number(form.discount) || 0 }),
    });
    setSaving(false);
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    onSaved();
    router.push(`/admin/boq/${j.id}`);
  };

  const fields: { k: string; lbl: string; span?: number; type?: string }[] = [
    { k: 'project', lbl: 'Project', span: 2 },
    { k: 'project_name', lbl: 'ประเภทงาน', span: 2 },
  ];

  return (
    <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.38)',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#fff',borderRadius:14,padding:'26px 30px',width:560,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
          <h2 style={{ margin:0,fontSize:16,fontWeight:700,color:'#1f2937' }}>+ เพิ่มเอกสาร BOQ</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af',lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 16px' }}>
          {/* row 1: เลขที่เอกสาร | วันที่ | Rev. | Opt */}
          <div style={{ gridColumn:'1/-1',display:'flex',gap:10,alignItems:'flex-end' }}>
            <div style={{ flex:'1 1 160px' }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>
                เลขที่เอกสาร <span style={{ color:'#16a34a',fontSize:10,fontWeight:600 }}>● Auto</span>
              </label>
              <input
                value={loadingNo ? '' : form.boq_number}
                placeholder={loadingNo ? 'กำลังสร้างเลข…' : ''}
                onChange={e => set('boq_number', e.target.value)}
                disabled={loadingNo}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:14,fontWeight:700,background:loadingNo?'#f3f4f6':'#fff',color:'#374151',boxSizing:'border-box',outline:'none' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
            <div style={{ flex:'1 1 130px' }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>วันที่เสนอราคา</label>
              <input type="date" value={form.doc_date}
                onChange={e => set('doc_date', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
            <div style={{ width:58 }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>Rev.</label>
              <input type="number" value={form.revision} min={1}
                onChange={e => set('revision', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 8px',fontSize:13,outline:'none',boxSizing:'border-box',textAlign:'center' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
            <div style={{ width:58 }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>Opt</label>
              <input type="number" value={form.opt_count} min={1}
                onChange={e => set('opt_count', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 8px',fontSize:13,outline:'none',boxSizing:'border-box',textAlign:'center' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
          </div>
          {/* row 2: ชื่อลูกค้า | รหัสลูกค้า | VAT */}
          <div style={{ gridColumn:'1/-1',display:'flex',gap:10,alignItems:'flex-end' }}>
            <div style={{ flex:'1 1 180px',position:'relative' }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>ชื่อลูกค้า</label>
              <input
                value={cusQ}
                onChange={e => { setCusQ(e.target.value); if (!e.target.value) setForm(p => ({ ...p, customer_name:'', customer_code:'' })); }}
                placeholder="พิมพ์ชื่อหรือรหัสลูกค้า..."
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>{ setTimeout(()=>setCusOpen(false),150); e.target.style.borderColor='#d1d5db'; }}
              />
              {cusOpen && cusList.length > 0 && (
                <div style={{ position:'absolute',top:'calc(100% + 2px)',left:0,right:0,background:'#fff',border:'1px solid #d1d5db',borderRadius:8,zIndex:300,boxShadow:'0 4px 20px rgba(0,0,0,0.13)',maxHeight:220,overflowY:'auto' }}>
                  {cusList.map(c => (
                    <div key={c.id} onMouseDown={() => selectCus(c)}
                      style={{ padding:'8px 12px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #f0f1f3',display:'flex',justifyContent:'space-between',alignItems:'center' }}
                      onMouseEnter={e=>(e.currentTarget.style.background='#f0f7ff')}
                      onMouseLeave={e=>(e.currentTarget.style.background='#fff')}>
                      <span>
                        <span style={{ fontWeight:600,color:'#1f2937' }}>{c.cus_name}</span>
                        {c.nickname && <span style={{ color:'#9ca3af',marginLeft:5,fontSize:12 }}>({c.nickname})</span>}
                      </span>
                      <span style={{ fontSize:11,color:'#6b7280',fontFamily:'monospace',marginLeft:8,flexShrink:0 }}>{c.cus_code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width:90 }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>VAT *</label>
              <select value={form.vat_rate} onChange={e => set('vat_rate', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 6px',fontSize:13,background:'#fff',boxSizing:'border-box' }}>
                <option value="0.07">VAT 7%</option>
                <option value="0">NO VAT</option>
              </select>
            </div>
          </div>
          {fields.map(({ k, lbl, span, type }) => (
            <div key={k} style={{ gridColumn: span === 2 ? '1/-1' : undefined }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>{lbl}</label>
              <input type={type ?? 'text'} value={String((form as any)[k])}
                onChange={e => set(k, e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
          ))}
          {/* ผู้ดูแลโครงการ (แคบ) + Note (กว้าง) */}
          <div style={{ gridColumn:'1/-1',display:'flex',gap:10,alignItems:'flex-end' }}>
            <div style={{ width:150,flexShrink:0 }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>ผู้ดูแลโครงการ</label>
              <input value={form.responsible_person}
                onChange={e => set('responsible_person', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:3 }}>Note</label>
              <input value={form.note}
                onChange={e => set('note', e.target.value)}
                style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'6px 10px',fontSize:13,outline:'none',boxSizing:'border-box' }}
                onFocus={e=>(e.target.style.borderColor='#3b82f6')}
                onBlur={e=>(e.target.style.borderColor='#d1d5db')}
              />
            </div>
          </div>
        </div>
        {err && <p style={{ color:'#b91c1c',fontSize:12,margin:'10px 0 0' }}>{err}</p>}
        <div style={{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:20 }}>
          <button onClick={onClose} style={{ padding:'7px 18px',border:'1px solid #d1d5db',borderRadius:7,background:'#fff',fontSize:13,cursor:'pointer' }}>ยกเลิก</button>
          <button onClick={save} disabled={saving}
            style={{ padding:'7px 22px',border:'none',borderRadius:7,background:'#16a34a',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',opacity:saving?0.6:1 }}>
            {saving ? 'กำลังบันทึก…' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function BoqListPage() {
  const [docs, setDocs] = useState<BoqDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [year, setYear] = useState('0');
  const [month, setMonth] = useState('0');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [applied, setApplied] = useState({ q: '', year: '0', month: '0' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const load = useCallback(async (pg = page, pp = perPage) => {
    setLoading(true);
    const p = new URLSearchParams();
    if (applied.q) p.set('q', applied.q);
    if (applied.year && applied.year !== '0') p.set('year', String(Number(applied.year) - 543));
    if (applied.month !== '0') p.set('month', applied.month);
    p.set('page', String(pg));
    p.set('limit', String(pp));
    const res = await fetch(`/api/boq?${p}`);
    if (res.ok) {
      const json = await res.json();
      setDocs(json.rows ?? []);
      setTotal(json.total ?? 0);
    }
    setLoading(false);
  }, [applied, page, perPage]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / perPage);

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setApplied({ q: searchInput, year, month });
  };

  const handlePerPage = (n: number) => {
    setPerPage(n);
    setPage(1);
    load(1, n);
  };

  const doDelete = async (id: number) => {
    await fetch(`/api/boq/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    load();
  };

  const exportExcel = () => {
    const header = ['วันที่','เลขที่','Rev.','Opt','Copy','ลูกค้า','Project','ประเภทงาน','Note','ใบเสนอราคา','ใบงาน','จำนวนเงิน','ส่วนลด','รวม','VAT 7%','สุทธิ'];
    const rows = docs.map(d => [
      fmtDate(d.doc_date), d.boq_number, d.revision, d.opt_count, d.copy_count,
      d.customer_name ?? '', d.project ?? '', d.project_name ?? '', d.note ?? '',
      d.quotation_ref ?? 'N/A', d.work_order_ref ?? 'ไม่มี',
      d.amount, d.discount, d.subtotal, d.vat, d.total,
    ]);
    const csv = [header, ...rows].map(r => r.join('\t')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/tab-separated-values;charset=utf-8,﻿' + encodeURIComponent(csv);
    a.download = `BOQ_${applied.year}_${Date.now()}.xls`;
    a.click();
  };

  return (
    <div style={{ padding:'20px 24px',minHeight:'100vh',background:'#f4f5f7',fontFamily:"'Sarabun','Cordia New',Tahoma,sans-serif",fontSize:13 }}>

      {/* ─── Title + Add ─── */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0,fontSize:19,fontWeight:700,color:'#1f2937' }}>ข้อมูล ใบประมาณราคา / Bill of Quantities</h1>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ display:'flex',alignItems:'center',gap:6,padding:'9px 22px',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 6px rgba(22,163,74,0.25)' }}>
          + เพิ่มเอกสาร
        </button>
      </div>

      {/* ─── Filter bar ─── */}
      <div style={{ background:'#fff',borderRadius:10,border:'1px solid #e2e4e9',padding:'14px 18px',marginBottom:16,boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <form onSubmit={doSearch} style={{ display:'flex',flexWrap:'wrap',gap:12,alignItems:'flex-end' }}>
          <div>
            <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:4 }}>ปี</label>
            <select value={year} onChange={e=>setYear(e.target.value)}
              style={{ border:'1px solid #d1d5db',borderRadius:6,padding:'7px 10px',fontSize:13,minWidth:100 }}>
              <option value="0">ทั้งหมด</option>
              {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:4 }}>เดือน</label>
            <select value={month} onChange={e=>setMonth(e.target.value)}
              style={{ border:'1px solid #d1d5db',borderRadius:6,padding:'7px 10px',fontSize:13,minWidth:120 }}>
              {MONTHS.map((m, i) => <option key={i} value={String(i)}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex:1,minWidth:260 }}>
            <label style={{ display:'block',fontSize:12,color:'#6b7280',marginBottom:4 }}>
              Search &nbsp;<span style={{ color:'#9ca3af',fontWeight:400 }}>เลขที่ BOQ + ชื่อลูกค้า + Project + ประเภทงาน</span>
            </label>
            <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
              placeholder="ค้นหา เลขที่ BOQ / ชื่อลูกค้า / Project / ประเภทงาน..."
              style={{ width:'100%',border:'1px solid #d1d5db',borderRadius:6,padding:'7px 12px',fontSize:13,outline:'none',boxSizing:'border-box' }}
              onFocus={e=>(e.target.style.borderColor='#3b82f6')}
              onBlur={e=>(e.target.style.borderColor='#d1d5db')}
            />
          </div>
          <button type="submit"
            style={{ padding:'7px 22px',background:'#3b82f6',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer' }}>
            search
          </button>
          <button type="button" onClick={exportExcel}
            style={{ padding:'7px 16px',background:'#f59e0b',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer' }}>
            Export Excel
          </button>
        </form>
      </div>

      {/* ─── Table ─── */}
      <div style={{ background:'#fff',borderRadius:10,border:'1px solid #e2e4e9',overflow:'auto',boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:1300 }}>
          <thead>
            <tr style={{ background:'#1f2937' }}>
              {[
                { lbl:'วันที่เสนอราคา', w:80 },
                { lbl:'เลขที่เอกสาร', w:88 },
                { lbl:'Action', w:36 },
                { lbl:'พิมพ์', w:36 },
                { lbl:'Rev.', w:28 },
                { lbl:'Opt', w:28 },
                { lbl:'Copy', w:28 },
                { lbl:'ชื่อลูกค้า', w:160 },
                { lbl:'Project', w:120 },
                { lbl:'ประเภทงาน', w:160 },
                { lbl:'Note', w:130 },
                { lbl:'ใบเสนอราคา', w:60 },
                { lbl:'ใบงาน', w:52 },
                { lbl:'จำนวนเงิน', w:100 },
                { lbl:'ส่วนลด', w:50 },
                { lbl:'จำนวนเงินรวม', w:110 },
                { lbl:'ภาษี 7%', w:60 },
                { lbl:'จำนวนเงินสุทธิ', w:110 },
              ].map(({ lbl, w }) => (
                <th key={lbl} style={{ padding:'7px 6px',color:'#fff',fontWeight:600,textAlign:'center',fontSize:11,whiteSpace:'nowrap',borderBottom:'1px solid #374151',width:w }}>
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={18} style={{ padding:40,textAlign:'center',color:'#9ca3af' }}>กำลังโหลด…</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={18} style={{ padding:40,textAlign:'center',color:'#9ca3af' }}>ไม่พบข้อมูล</td></tr>
            ) : docs.map((doc, i) => (
              <tr key={doc.id}
                style={{ borderBottom:'1px solid #f0f1f3',background: i%2===0 ? '#fff' : '#fafafa' }}
                onMouseEnter={e=>(e.currentTarget.style.background='#f0f7ff')}
                onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'#fff':'#fafafa')}>
                {/* วันที่ */}
                <td style={{ padding:'6px 4px',textAlign:'center',whiteSpace:'nowrap',color:'#374151' }}>{fmtDate(doc.doc_date)}</td>
                {/* เลขที่ */}
                <td style={{ padding:'6px 4px',textAlign:'center' }}>
                  <Link href={`/admin/boq/${doc.id}`}
                    style={{ color:'#1d4ed8',fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:3 }}>
                    {doc.boq_number}
                    <span style={{ fontSize:10,color:'#60a5fa' }}>↗</span>
                  </Link>
                </td>
                {/* Action */}
                <td style={{ padding:'4px 2px',textAlign:'center' }}>
                  <button onClick={() => setDeleteId(doc.id)}
                    style={{ padding:'3px 6px',background:'#ef4444',color:'#fff',border:'none',borderRadius:4,fontSize:11,cursor:'pointer' }}>
                    🗑️
                  </button>
                </td>
                {/* พิมพ์ */}
                <td style={{ padding:'4px 2px',textAlign:'center' }}>
                  <button onClick={() => window.open(`/boq/${doc.boq_number}.html`, '_blank')}
                    style={{ padding:'3px 6px',background:'#06b6d4',color:'#fff',border:'none',borderRadius:4,fontSize:11,cursor:'pointer' }}>
                    🖨️
                  </button>
                </td>
                {/* Rev / Opt / Copy */}
                <td style={{ padding:'6px 2px',textAlign:'center',color:'#374151' }}>{doc.revision}</td>
                <td style={{ padding:'6px 2px',textAlign:'center',color:'#374151' }}>{doc.opt_count}</td>
                <td style={{ padding:'6px 2px',textAlign:'center',color:'#374151' }}>{doc.copy_count}</td>
                {/* ลูกค้า */}
                <td style={{ padding:'8px 8px',color:'#1f2937',fontWeight:600 }}>
                  {doc.customer_name ?? '—'}
                  {doc.customer_code && <div style={{ fontSize:10,color:'#9ca3af',fontWeight:400 }}>{doc.customer_code}</div>}
                </td>
                {/* Project / ประเภทงาน */}
                <td style={{ padding:'8px 8px',color:'#374151',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:120 }}>{doc.project ?? '—'}</td>
                <td style={{ padding:'8px 8px',color:'#374151' }}>{doc.project_name ?? '—'}</td>
                {/* Note */}
                <td style={{ padding:'8px 8px',color:'#6b7280',fontStyle:'italic' }}>{doc.note || '—'}</td>
                {/* ใบเสนอราคา */}
                <td style={{ padding:'6px 3px',textAlign:'center' }}>
                  {doc.quotation_ref
                    ? <span style={{ background:'#dbeafe',color:'#1d4ed8',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600 }}>{doc.quotation_ref}</span>
                    : <span style={{ background:'#dcfce7',color:'#15803d',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:700 }}>N/A</span>
                  }
                </td>
                {/* ใบงาน */}
                <td style={{ padding:'6px 3px',textAlign:'center' }}>
                  {doc.work_order_ref
                    ? <span style={{ background:'#dbeafe',color:'#1d4ed8',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600 }}>{doc.work_order_ref}</span>
                    : <span style={{ background:'#e5e7eb',color:'#6b7280',padding:'2px 8px',borderRadius:4,fontSize:10,fontWeight:600 }}>ไม่มี</span>
                  }
                </td>
                {/* ตัวเลข */}
                <td style={{ padding:'8px 8px',textAlign:'right',color:'#1f2937' }}>{fmt(doc.amount)}</td>
                <td style={{ padding:'8px 8px',textAlign:'right',color:'#6b7280' }}>{doc.discount ? fmt(doc.discount) : '-'}</td>
                <td style={{ padding:'8px 8px',textAlign:'right',fontWeight:600,color:'#1f2937' }}>{fmt(doc.subtotal)}</td>
                <td style={{ padding:'8px 8px',textAlign:'right',color:'#6b7280' }}>{fmt(doc.vat)}</td>
                <td style={{ padding:'8px 8px',textAlign:'right',fontWeight:700,color:'#15803d' }}>{fmt(doc.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && docs.length > 0 && (
          <div style={{ padding:'10px 16px',borderTop:'1px solid #f0f1f3',fontSize:12,color:'#9ca3af',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8 }}>
            {/* Pagination */}
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ fontSize:12,color:'#6b7280' }}>แสดง</span>
              {[10,20,30].map(n => (
                <button key={n} onClick={() => handlePerPage(n)}
                  style={{ border:'1px solid #e2e4e9',borderRadius:6,padding:'3px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',
                    background: perPage===n ? '#1f2937' : '#fff',
                    color: perPage===n ? '#fff' : '#374151',
                    borderColor: perPage===n ? '#1f2937' : '#e2e4e9',
                  }}>{n}</button>
              ))}
              <span style={{ fontSize:12,color:'#6b7280' }}>รายการ</span>
              <button disabled={page<=1}
                onClick={() => { const p=page-1; setPage(p); load(p); }}
                style={{ border:'1px solid #e2e4e9',borderRadius:6,padding:'3px 12px',fontSize:12,cursor:page<=1?'default':'pointer',background:'#fff',color:page<=1?'#d1d5db':'#374151' }}>
                ← ก่อนหน้า
              </button>
              <span style={{ fontSize:12,color:'#6b7280',whiteSpace:'nowrap' }}>หน้า {page} / {totalPages}</span>
              <button disabled={page>=totalPages}
                onClick={() => { const p=page+1; setPage(p); load(p); }}
                style={{ border:'1px solid #e2e4e9',borderRadius:6,padding:'3px 12px',fontSize:12,cursor:page>=totalPages?'default':'pointer',background:'#fff',color:page>=totalPages?'#d1d5db':'#374151' }}>
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={load} />}

      {deleteId !== null && (
        <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.38)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:'#fff',borderRadius:12,padding:'28px 32px',width:360,textAlign:'center',boxShadow:'0 8px 40px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize:36,marginBottom:12 }}>🗑️</div>
            <h3 style={{ margin:'0 0 8px',fontSize:16 }}>ยืนยันการลบ</h3>
            <p style={{ margin:'0 0 20px',fontSize:13,color:'#6b7280' }}>ต้องการลบเอกสารนี้ใช่หรือไม่?<br/>ไม่สามารถกู้คืนได้</p>
            <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
              <button onClick={()=>setDeleteId(null)} style={{ padding:'8px 20px',border:'1px solid #d1d5db',borderRadius:7,background:'#fff',fontSize:13,cursor:'pointer' }}>ยกเลิก</button>
              <button onClick={()=>doDelete(deleteId!)} style={{ padding:'8px 20px',border:'none',borderRadius:7,background:'#ef4444',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer' }}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
