'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SupplierRow {
  id: number;
  sup_code: string;
  sup_type: 'individual' | 'company';
  sup_name: string;
  nickname: string | null;
  tax_id: string | null;
  branch_type: 'HO' | 'BR' | '-';
  category: string;
  partner_type: string | null;
  address_line1: string | null;
  sub_district: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_phone2: string | null;
  payment_term: string;
  credit_day: number;
  withholding_tax: string;
  note: string | null;
  status: 'active' | 'inactive';
}

interface FormState {
  sup_code: string;
  sup_type: 'individual' | 'company';
  sup_name: string;
  nickname: string;
  tax_id: string;
  branch_type: 'HO' | 'BR' | '-';
  category: string;
  address_line1: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  contact_name: string;
  contact_phone: string;
  contact_phone2: string;
  payment_term: string;
  credit_day: number;
  withholding_tax: string;
  partner_type: string;
  note: string;
  status: 'active' | 'inactive';
}

const CATEGORIES = ['ช่างม่าน', 'ช่างติดตั้ง', 'ผ้าม่าน / ผ้า', 'อุปกรณ์ม่าน', 'กระจก / กรอบ', 'เฟอร์นิเจอร์', 'อื่นๆ'];
const PARTNER_TYPES = ['ช่างม่าน', 'ช่างติดตั้ง', 'ผู้จัดหาผ้า', 'จำนายกระจก', 'ลามิเนต', 'อินเตอร์เน็ต', 'ผู้รับเหมาก่อสร้าง', 'บริษัทบัญชี', 'ค่าจัดส่ง', 'อื่นๆ'];
const PAYMENT_TERMS = ['เงินสด / เงินโอน', 'เงินสด', 'เงินโอน', 'เครดิต'];
const WITHHOLDING = [{ v: 'ไม่หัก', l: 'ไม่หัก' }, { v: '1.5', l: 'หัก 1.5%' }, { v: '3', l: 'หัก 3%' }];

const BLANK: FormState = {
  sup_code: '', sup_type: 'individual', sup_name: '', nickname: '', tax_id: '',
  branch_type: '-', category: '', address_line1: '', sub_district: '', district: '',
  province: '', postal_code: '', contact_name: '', contact_phone: '', contact_phone2: '',
  payment_term: 'เงินสด / เงินโอน', credit_day: 0, withholding_tax: '3', partner_type: '', note: '', status: 'active',
};

// ─── CSS (same mood as customers page) ───────────────────────────────────────
const CSS = `
.sdb-root{display:flex;min-height:100vh;font-family:'Sarabun',sans-serif;font-size:15px;background:#f0f1f3;}
.sdb-root *{box-sizing:border-box}
.sdb-sidebar{width:240px;background:#fff;border-right:1px solid #e2e4e9;
  position:fixed;top:0;left:0;height:100vh;overflow-y:auto;z-index:50;
  display:flex;flex-direction:column;flex-shrink:0;}
.sdb-brand{padding:16px 18px;border-bottom:1px solid #e8eaed}
.sdb-logo{width:36px;height:36px;background:#1f2937;border-radius:8px;
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;margin-bottom:6px}
.sdb-brand-name{font-size:14px;font-weight:700;color:#1f2937}
.sdb-brand-sub{font-size:12px;color:#6b7280}
.sdb-nav{padding:10px 0;flex:1}
.sdb-nav-section{padding:6px 18px 3px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af}
.sdb-nav-item{display:block;padding:8px 18px;font-size:14px;color:#374151;text-decoration:none;
  border-left:3px solid transparent;transition:all .15s;cursor:pointer}
.sdb-nav-item:hover{background:#f0f1f3;color:#111827;border-left-color:#374151}
.sdb-nav-item.active{background:#f0f1f3;color:#111827;font-weight:600;border-left-color:#1f2937}
.sdb-main{margin-left:240px;flex:1;padding:28px 32px 80px}
.sdb-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;
  background:#fff;border:1px solid #e2e4e9;border-radius:10px;padding:12px 16px;}
.sdb-search{flex:1;display:flex;align-items:center;gap:8px;
  border:1px solid #e2e4e9;border-radius:8px;padding:7px 12px;background:#fafafa;transition:border .15s;}
.sdb-search:focus-within{border-color:#374151;background:#fff}
.sdb-search input{border:none;background:transparent;outline:none;font-size:14px;width:100%;font-family:inherit}
.sdb-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.sdb-select{border:1px solid #e2e4e9;border-radius:8px;padding:5px 10px;font-size:13px;
  background:#fff;color:#374151;cursor:pointer;font-family:inherit;transition:border .15s;}
.sdb-select:focus{border-color:#374151;outline:none}
.sdb-btn-primary{background:#1f2937;color:#fff;border:none;border-radius:8px;
  padding:9px 18px;font-size:14px;font-weight:600;cursor:pointer;
  display:flex;align-items:center;gap:6px;white-space:nowrap;font-family:inherit;transition:background .15s;}
.sdb-btn-primary:hover{background:#111827}
.sdb-btn-success{background:#166534;color:#fff;border:none;border-radius:8px;
  padding:9px 18px;font-size:14px;font-weight:600;cursor:pointer;
  display:flex;align-items:center;gap:6px;font-family:inherit;transition:background .15s;}
.sdb-btn-success:hover{background:#14532d}
.sdb-card-list{display:flex;flex-direction:column;gap:3px}
.sdb-card{background:#fff;border:1px solid #e2e4e9;border-radius:8px;
  padding:8px 14px;transition:box-shadow .15s,border-color .15s;}
.sdb-card:hover{box-shadow:0 2px 8px rgba(0,0,0,.07);border-color:#d1d5db}
.sdb-code{background:#f0f1f3;color:#374151;border:1px solid #d1d5db;
  border-radius:4px;padding:2px 8px;font-size:13px;font-weight:700;font-family:monospace;}
.sdb-badge-co{background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600}
.sdb-badge-ind{background:#f0f1f3;color:#6b7280;border:1px solid #e2e4e9;border-radius:4px;padding:1px 7px;font-size:11px}
.sdb-badge-cat{background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:500}
.sdb-badge-ptype{background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600}
.sdb-badge-wht{background:#fef9c3;color:#854d0e;border:1px solid #fbbf24;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600}
.sdb-badge-nowht{background:#f0f1f3;color:#6b7280;border:1px solid #e2e4e9;border-radius:4px;padding:1px 7px;font-size:11px}
.sdb-badge-inactive{background:#f0f1f3;color:#9ca3af;border:1px solid #e2e4e9;border-radius:4px;padding:1px 6px;font-size:11px}
.sdb-card-name{font-size:14px;font-weight:700;color:#111827}
.sdb-card-info{display:flex;flex-wrap:wrap;gap:10px;font-size:13px;color:#374151;margin-top:4px}
.sdb-card-info-item{display:flex;align-items:center;gap:4px}
.sdb-card-actions{display:flex;gap:6px;margin-top:6px;padding-top:5px;border-top:1px solid #f0f1f3}
.sdb-btn-sm{border:1px solid #e2e4e9;background:#fafafa;border-radius:6px;
  padding:3px 10px;font-size:12px;cursor:pointer;color:#374151;font-family:inherit;transition:all .15s;}
.sdb-btn-sm:hover{background:#f0f1f3;border-color:#c4c8d0}
.sdb-btn-sm.danger:hover{background:#fdecea;color:#c0392b;border-color:#fca5a5}
.sdb-empty{text-align:center;padding:60px 20px;color:#9ca3af;font-size:14px}
.sdb-loading{text-align:center;padding:40px;color:#6b7280}
.sdb-pagination{display:flex;align-items:center;gap:8px;margin-top:20px;justify-content:flex-end}
.sdb-page-btn{border:1px solid #e2e4e9;background:#fff;border-radius:6px;
  padding:5px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s;}
.sdb-page-btn:hover:not(:disabled){background:#f0f1f3;border-color:#c4c8d0}
.sdb-page-btn:disabled{opacity:.4;cursor:default}
.sdb-page-btn.active{background:#1f2937;color:#fff;border-color:#1f2937}
.sdb-stat-bar{display:flex;gap:12px;margin-bottom:16px}
.sdb-stat{background:#fff;border:1px solid #e2e4e9;border-radius:10px;
  padding:10px 16px;text-align:center;flex:1;}
.sdb-stat .num{font-size:22px;font-weight:700;color:#111827}
.sdb-stat .lbl{font-size:11px;color:#9ca3af;margin-top:2px}

/* Modal */
.sdb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto;}
.sdb-modal{background:#fff;border-radius:14px;width:100%;max-width:680px;padding:28px 32px;position:relative}
.sdb-modal-title{font-size:18px;font-weight:700;color:#1f2937;margin-bottom:20px}
.sdb-form-grid{display:grid;gap:14px}
.sdb-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sdb-form-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.sdb-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:4px;display:block}
.sdb-label .req{color:#dc2626}
.sdb-input,.sdb-textarea,.sdb-iselect{
  width:100%;border:1px solid #e2e4e9;border-radius:8px;padding:8px 11px;
  font-size:14px;font-family:inherit;color:#111827;background:#fafafa;transition:border .15s;outline:none;}
.sdb-input:focus,.sdb-textarea:focus,.sdb-iselect:focus{border-color:#1f2937;background:#fff}
.sdb-textarea{min-height:64px;resize:vertical}
.sdb-section-sep{font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;
  border-bottom:1px solid #e2e4e9;padding-bottom:4px;margin:6px 0 2px}
.sdb-modal-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:14px;border-top:1px solid #e2e4e9}
.sdb-btn-cancel{background:#f0f1f3;color:#374151;border:none;border-radius:8px;
  padding:9px 18px;font-size:14px;cursor:pointer;font-family:inherit;transition:background .15s;}
.sdb-btn-cancel:hover{background:#e2e4e9}
.sdb-err{color:#dc2626;font-size:13px;margin-top:8px}

/* Delete confirm */
.sdb-del-box{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:16px}
.sdb-del-name{font-size:15px;font-weight:700;color:#991b1b;margin-bottom:4px}
.sdb-del-detail{font-size:13px;color:#7f1d1d}
`;

export default function SuppliersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [perPage, setPerPage] = useState(30);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Modal state
  const [modal, setModal] = useState<'new' | 'edit' | 'delete' | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null);

  const load = useCallback(async (pg = 1, search = q, pp = perPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(pp), status: statusFilter });
      if (search) params.set('q', search);
      if (typeFilter) params.set('type', typeFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await fetch(`/api/suppliers?${params}`);
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [q, typeFilter, categoryFilter, statusFilter, perPage]);

  useEffect(() => { load(1); }, [typeFilter, categoryFilter, statusFilter]);

  const handleSearch = (v: string) => {
    setQ(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, v), 350);
  };

  const handlePerPage = (pp: number) => {
    setPerPage(pp);
    setPage(1);
    load(1, q, pp);
  };

  const totalPages = Math.ceil(total / perPage);

  // Stats
  const companyCount = rows.filter(r => r.sup_type === 'company').length;
  const wht3Count = rows.filter(r => r.withholding_tax === '3').length;

  // Form helpers
  const setF = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    router.push('/admin/purchase/suppliers/new');
  };

  const openEdit = (r: SupplierRow) => {
    setForm({
      sup_code: r.sup_code,
      sup_type: r.sup_type,
      sup_name: r.sup_name,
      nickname: r.nickname || '',
      tax_id: r.tax_id || '',
      branch_type: r.branch_type,
      category: r.category,
      address_line1: r.address_line1 || '',
      sub_district: r.sub_district || '',
      district: r.district || '',
      province: r.province || '',
      postal_code: r.postal_code || '',
      contact_name: r.contact_name || '',
      contact_phone: r.contact_phone || '',
      contact_phone2: r.contact_phone2 || '',
      payment_term: r.payment_term,
      credit_day: r.credit_day,
      withholding_tax: r.withholding_tax,
      partner_type: r.partner_type || '',
      note: r.note || '',
      status: r.status,
    });
    setEditId(r.id);
    setFormErr('');
    setModal('edit');
  };

  const openDelete = (r: SupplierRow) => {
    setDeleteTarget(r);
    setModal('delete');
  };

  const handleSave = async () => {
    if (!form.sup_name.trim()) { setFormErr('กรุณากรอกชื่อผู้ขาย'); return; }
    setSaving(true);
    setFormErr('');
    try {
      const url = editId ? `/api/suppliers/${editId}` : '/api/suppliers';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json();
        setFormErr(err.error || 'เกิดข้อผิดพลาด');
        return;
      }
      setModal(null);
      load(1);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/suppliers/${deleteTarget.id}`, { method: 'DELETE' });
    setModal(null);
    setDeleteTarget(null);
    load(page);
  };

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const params = new URLSearchParams({ page: '1', limit: '9999', status: statusFilter });
    if (q) params.set('q', q);
    if (typeFilter) params.set('type', typeFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    const res = await fetch(`/api/suppliers?${params}`);
    const data = await res.json();
    const exportRows = (data.rows || []) as SupplierRow[];
    const wsData = [
      ['รหัส', 'ชื่อ', 'ชื่อเล่น', 'ประเภท', 'หมวด', 'เลขภาษี', 'ที่อยู่', 'แขวง/ตำบล', 'เขต/อำเภอ', 'จังหวัด', 'ผู้ติดต่อ', 'เบอร์', 'TERM', 'หัก ณ ที่จ่าย', 'หมายเหตุ'],
      ...exportRows.map(r => [
        r.sup_code, r.sup_name, r.nickname || '', r.sup_type === 'company' ? 'นิติบุคคล' : 'บุคคล',
        r.category, r.tax_id || '', r.address_line1 || '', r.sub_district || '', r.district || '', r.province || '',
        r.contact_name || '', r.contact_phone || '', r.payment_term,
        r.withholding_tax === 'ไม่หัก' ? 'ไม่หัก' : `${r.withholding_tax}%`, r.note || '',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [8, 30, 12, 8, 12, 13, 30, 12, 12, 12, 15, 14, 16, 10, 20].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ผู้ขาย');
    XLSX.writeFile(wb, `suppliers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const fmtAddress = (r: SupplierRow) => {
    const parts = [r.address_line1, r.district, r.province].filter(Boolean);
    return parts.length ? parts.join(' ') : null;
  };

  const whtLabel = (v: string) => v === 'ไม่หัก' ? 'ไม่หัก' : `หัก ${v}%`;

  return (
    <>
      <style>{CSS}</style>
      <div className="sdb-root">
        {/* Sidebar */}
        <aside className="sdb-sidebar">
          <div className="sdb-brand">
            <div className="sdb-logo">LSL</div>
            <div className="sdb-brand-name">LinSiLin Living</div>
            <div className="sdb-brand-sub">ระบบจัดซื้อจัดจ้าง</div>
          </div>
          <nav className="sdb-nav">
            <div className="sdb-nav-section">จัดซื้อจัดจ้าง</div>
            <a className="sdb-nav-item active">🏭 ผู้ขาย / ผู้รับเหมา</a>
            <a className="sdb-nav-item" onClick={() => router.push('/admin/purchase/orders')}>📋 ใบสั่งซื้อสินค้า</a>
            <a className="sdb-nav-item" onClick={() => router.push('/admin/purchase/vouchers')}>💳 ใบสำคัญจ่าย</a>
            <a className="sdb-nav-item" onClick={() => router.push('/admin/purchase/labor-reports')}>🔧 รายงานค่าแรงช่าง</a>
            <div className="sdb-nav-section">ลิงก์ด่วน</div>
            <a className="sdb-nav-item" onClick={() => router.push('/admin')}>🏠 แดชบอร์ด</a>
            <a className="sdb-nav-item" onClick={() => router.push('/customers')}>👥 ฐานข้อมูลลูกค้า</a>
            <a className="sdb-nav-item" onClick={() => router.push('/products')}>📦 ฐานข้อมูลสินค้า</a>
            <a className="sdb-nav-item" onClick={() => router.push('/admin/boq')}>📑 BOQ</a>
          </nav>
        </aside>

        {/* Main */}
        <main className="sdb-main">
          {/* Stats */}
          <div className="sdb-stat-bar">
            <div className="sdb-stat">
              <div className="num">{total}</div>
              <div className="lbl">ผู้ขาย / ผู้รับเหมา ทั้งหมด</div>
            </div>
            <div className="sdb-stat">
              <div className="num" style={{ color: '#1d4ed8' }}>{companyCount}</div>
              <div className="lbl">นิติบุคคล (หน้านี้)</div>
            </div>
            <div className="sdb-stat">
              <div className="num" style={{ color: '#854d0e' }}>{wht3Count}</div>
              <div className="lbl">หัก ณ ที่จ่าย 3% (หน้านี้)</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 10px' }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>ผู้ขาย / ผู้รับเหมา</h1>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                ทั้งหมด {total.toLocaleString()} ราย
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="sdb-btn-success" onClick={handleExport}>
                📥 Export Excel
              </button>
              <button className="sdb-btn-primary" onClick={openNew}>
                + เพิ่มผู้ขาย
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="sdb-toolbar">
            <div className="sdb-search">
              <span>🔍</span>
              <input
                value={q}
                onChange={e => handleSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัส, เลขภาษี, เบอร์โทร, ผู้ติดต่อ..."
              />
            </div>
          </div>

          {/* Filters */}
          <div className="sdb-filters">
            <select className="sdb-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">ประเภท ▼</option>
              <option value="individual">บุคคลธรรมดา</option>
              <option value="company">นิติบุคคล</option>
            </select>
            <select className="sdb-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">หมวดหมู่ ▼</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="sdb-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="active">สถานะ: ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="">ทั้งหมด</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
              แสดง
              {[10, 20, 30].map(n => (
                <button key={n} className="sdb-page-btn"
                  style={perPage === n ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937', padding: '4px 10px' } : { padding: '4px 10px' }}
                  onClick={() => handlePerPage(n)}>{n}</button>
              ))}
              รายการ
            </div>
            {(typeFilter || categoryFilter || statusFilter !== 'active' || q) && (
              <button className="sdb-btn-sm" onClick={() => {
                setTypeFilter(''); setCategoryFilter(''); setStatusFilter('active'); setQ(''); load(1, '');
              }}>✕ ล้างตัวกรอง</button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="sdb-loading">⏳ กำลังโหลด...</div>
          ) : rows.length === 0 ? (
            <div className="sdb-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏭</div>
              <div>ไม่พบผู้ขาย / ผู้รับเหมา</div>
              {q && <div style={{ marginTop: 6 }}>ลองเปลี่ยนคำค้นหา</div>}
              {!q && <div style={{ marginTop: 12 }}><button className="sdb-btn-primary" onClick={openNew}>+ เพิ่มผู้ขายรายแรก</button></div>}
            </div>
          ) : (
            <div className="sdb-card-list">
              {rows.map((r, idx) => (
                <div key={r.id} className="sdb-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="sdb-code">{r.sup_code}</span>
                        <span className={r.sup_type === 'company' ? 'sdb-badge-co' : 'sdb-badge-ind'}>
                          {r.sup_type === 'company'
                            ? (r.branch_type === 'HO' ? 'สำนักงานใหญ่' : r.branch_type === 'BR' ? 'สาขา' : 'นิติบุคคล')
                            : 'บุคคล'}
                        </span>
                        {r.partner_type && <span className="sdb-badge-ptype">{r.partner_type}</span>}
                        {r.category && <span className="sdb-badge-cat">{r.category}</span>}
                        {r.withholding_tax !== 'ไม่หัก'
                          ? <span className="sdb-badge-wht">หัก {r.withholding_tax}%</span>
                          : <span className="sdb-badge-nowht">ไม่หัก</span>}
                        {r.status === 'inactive' && <span className="sdb-badge-inactive">ไม่ใช้งาน</span>}
                        <span className="sdb-card-name">{r.sup_name}{r.nickname ? ` (${r.nickname})` : ''}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      #{(page - 1) * perPage + idx + 1}
                    </div>
                  </div>

                  <div className="sdb-card-info">
                    {r.tax_id && <span className="sdb-card-info-item"><span>🪪</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.tax_id}</span></span>}
                    {fmtAddress(r) && <span className="sdb-card-info-item"><span>📍</span><span>{fmtAddress(r)}</span></span>}
                    {r.contact_name && <span className="sdb-card-info-item"><span>👤</span><span>{r.contact_name}</span></span>}
                    {r.contact_phone && <span className="sdb-card-info-item"><span>📞</span><span>{r.contact_phone}</span></span>}
                    {r.contact_phone2 && <span className="sdb-card-info-item"><span>📞</span><span>{r.contact_phone2}</span></span>}
                    <span className="sdb-card-info-item">
                      <span>💳</span>
                      <span>{r.payment_term}{r.credit_day > 0 ? ` ${r.credit_day} วัน` : ''}</span>
                    </span>
                    {r.note && <span className="sdb-card-info-item" style={{ color: '#6b7280', fontStyle: 'italic' }}><span>📝</span><span>{r.note}</span></span>}
                  </div>

                  <div className="sdb-card-actions">
                    <button className="sdb-btn-sm" onClick={() => openEdit(r)}>✏️ แก้ไข</button>
                    <button className="sdb-btn-sm danger" onClick={() => openDelete(r)}>🗑️ ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sdb-pagination">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginRight: 'auto' }}>
                แสดง
                {[10, 20, 30].map(n => (
                  <button key={n} className="sdb-page-btn"
                    style={perPage === n ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937', padding: '4px 10px' } : { padding: '4px 10px' }}
                    onClick={() => handlePerPage(n)}>{n}</button>
                ))}
                รายการ
              </div>
              <button className="sdb-page-btn" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>← ก่อนหน้า</button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>หน้า {page} / {totalPages}</span>
              <button className="sdb-page-btn" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>ถัดไป →</button>
            </div>
          )}
        </main>
      </div>

      {/* ─── Modal เพิ่ม / แก้ไข ─── */}
      {(modal === 'new' || modal === 'edit') && (
        <div className="sdb-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="sdb-modal">
            <div className="sdb-modal-title">
              {modal === 'new' ? '➕ เพิ่มผู้ขาย / ผู้รับเหมา' : '✏️ แก้ไขข้อมูล'}
            </div>

            <div className="sdb-form-grid">
              {/* ข้อมูลหลัก */}
              <div className="sdb-section-sep">ข้อมูลหลัก</div>
              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">รหัส <span style={{ fontSize: 11, color: '#9ca3af' }}>(ว่างไว้ = ออก V0001 อัตโนมัติ)</span></label>
                  <input className="sdb-input" value={form.sup_code} onChange={e => setF('sup_code', e.target.value)} placeholder="V0001 / S0352" />
                </div>
                <div>
                  <label className="sdb-label">ประเภท <span className="req">*</span></label>
                  <select className="sdb-iselect" value={form.sup_type} onChange={e => setF('sup_type', e.target.value)}>
                    <option value="individual">บุคคลธรรมดา</option>
                    <option value="company">นิติบุคคล</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="sdb-label">ชื่อผู้ขาย / ผู้รับเหมา <span className="req">*</span></label>
                <input className="sdb-input" value={form.sup_name} onChange={e => setF('sup_name', e.target.value)} placeholder="ชื่อเต็ม..." />
              </div>

              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">ชื่อเล่น / ชื่อย่อ</label>
                  <input className="sdb-input" value={form.nickname} onChange={e => setF('nickname', e.target.value)} placeholder="ชื่อเล่น..." />
                </div>
                <div>
                  <label className="sdb-label">หมวดหมู่</label>
                  <select className="sdb-iselect" value={form.category} onChange={e => setF('category', e.target.value)}>
                    <option value="">-- เลือก --</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">เลขประจำตัวผู้เสียภาษี</label>
                  <input className="sdb-input" value={form.tax_id} onChange={e => setF('tax_id', e.target.value)} placeholder="0000000000000" maxLength={13} />
                </div>
                {form.sup_type === 'company' && (
                  <div>
                    <label className="sdb-label">ประเภทสำนักงาน</label>
                    <select className="sdb-iselect" value={form.branch_type} onChange={e => setF('branch_type', e.target.value)}>
                      <option value="-">-</option>
                      <option value="HO">สำนักงานใหญ่</option>
                      <option value="BR">สาขา</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ที่อยู่ */}
              <div className="sdb-section-sep">ที่อยู่</div>
              <div>
                <label className="sdb-label">ที่อยู่</label>
                <input className="sdb-input" value={form.address_line1} onChange={e => setF('address_line1', e.target.value)} placeholder="บ้านเลขที่ ถนน หมู่..." />
              </div>
              <div className="sdb-form-row3">
                <div>
                  <label className="sdb-label">แขวง / ตำบล</label>
                  <input className="sdb-input" value={form.sub_district} onChange={e => setF('sub_district', e.target.value)} />
                </div>
                <div>
                  <label className="sdb-label">เขต / อำเภอ</label>
                  <input className="sdb-input" value={form.district} onChange={e => setF('district', e.target.value)} />
                </div>
                <div>
                  <label className="sdb-label">จังหวัด</label>
                  <input className="sdb-input" value={form.province} onChange={e => setF('province', e.target.value)} />
                </div>
              </div>

              {/* ผู้ติดต่อ */}
              <div className="sdb-section-sep">ผู้ติดต่อ</div>
              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">ชื่อผู้ติดต่อ</label>
                  <input className="sdb-input" value={form.contact_name} onChange={e => setF('contact_name', e.target.value)} placeholder="คุณ..." />
                </div>
                <div>
                  <label className="sdb-label">เบอร์โทร</label>
                  <input className="sdb-input" value={form.contact_phone} onChange={e => setF('contact_phone', e.target.value)} placeholder="08x-xxx-xxxx" />
                </div>
              </div>
              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">เบอร์โทร 2</label>
                  <input className="sdb-input" value={form.contact_phone2} onChange={e => setF('contact_phone2', e.target.value)} placeholder="เบอร์สำรอง..." />
                </div>
              </div>

              {/* เงื่อนไขการชำระเงิน */}
              <div className="sdb-section-sep">เงื่อนไขการชำระเงิน</div>
              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">TERM</label>
                  <select className="sdb-iselect" value={form.payment_term} onChange={e => setF('payment_term', e.target.value)}>
                    {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="sdb-label">หัก ณ ที่จ่าย</label>
                  <select className="sdb-iselect" value={form.withholding_tax} onChange={e => setF('withholding_tax', e.target.value)}>
                    {WITHHOLDING.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
                  </select>
                </div>
              </div>

              {form.payment_term === 'เครดิต' && (
                <div style={{ maxWidth: 200 }}>
                  <label className="sdb-label">เครดิต (วัน)</label>
                  <input className="sdb-input" type="number" min={0} value={form.credit_day} onChange={e => setF('credit_day', Number(e.target.value))} />
                </div>
              )}

              <div>
                <label className="sdb-label">ประเภทคู่ค้า / ผู้รับจ้าง <span style={{ fontSize: 11, color: '#9ca3af' }}>(พิมพ์อิสระ)</span></label>
                <input
                  className="sdb-input"
                  list="partner-type-list"
                  value={form.partner_type}
                  onChange={e => setF('partner_type', e.target.value)}
                  placeholder="เช่น ช่างม่าน, จำนายกระจก, ลามิเนต..."
                />
                <datalist id="partner-type-list">
                  {PARTNER_TYPES.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>

              {/* อื่นๆ */}
              <div className="sdb-section-sep">อื่นๆ</div>
              <div className="sdb-form-row">
                <div>
                  <label className="sdb-label">สถานะ</label>
                  <select className="sdb-iselect" value={form.status} onChange={e => setF('status', e.target.value as any)}>
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="sdb-label">หมายเหตุ</label>
                <textarea className="sdb-textarea" value={form.note} onChange={e => setF('note', e.target.value)} placeholder="หมายเหตุ..." />
              </div>
            </div>

            {formErr && <div className="sdb-err">⚠️ {formErr}</div>}

            <div className="sdb-modal-footer">
              <button className="sdb-btn-cancel" onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="sdb-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal ยืนยันการลบ ─── */}
      {modal === 'delete' && deleteTarget && (
        <div className="sdb-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="sdb-modal" style={{ maxWidth: 460 }}>
            <div className="sdb-modal-title">🗑️ ยืนยันการลบ</div>
            <div className="sdb-del-box">
              <div className="sdb-del-name">{deleteTarget.sup_name}</div>
              <div className="sdb-del-detail">
                รหัส: {deleteTarget.sup_code}
                {deleteTarget.tax_id ? ` · เลขภาษี: ${deleteTarget.tax_id}` : ''}
                {deleteTarget.contact_phone ? ` · ${deleteTarget.contact_phone}` : ''}
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#374151' }}>ต้องการลบรายการนี้ออกจากระบบ? การกระทำนี้ไม่สามารถยกเลิกได้</p>
            <div className="sdb-modal-footer">
              <button className="sdb-btn-cancel" onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="sdb-btn-primary" style={{ background: '#dc2626' }} onClick={handleDelete}>
                🗑️ ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
