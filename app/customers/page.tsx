'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomerRow {
  id: number;
  cus_code: string;
  category_code: string;
  cus_type: 'individual' | 'company';
  cus_name: string;
  nickname: string | null;
  business_type: string;
  sales_grade: 'VIP' | 'normal';
  service_flag: 'normal' | 'watch';
  status: string;
  credit_day: number;
  source_channels: string;
  created_at: string;
  address_line1: string | null;
  district: string | null;
  province: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_roles: string | null;
}

const SOURCE_CHANNELS = [
  'Walk-in', 'เว็บไซต์', 'Facebook', 'Instagram',
  'LINE OA', 'TikTok', 'ลูกค้าเก่าแนะนำ', 'Sale (พนักงาน)', 'อื่นๆ',
];

const BUSINESS_TYPES = [
  'โรงแรม / รีสอร์ท', 'ออฟฟิศ / สำนักงาน', 'บ้านพักอาศัย / บ้านเช่า',
  'คอนโด / อพาร์ทเม้นท์', 'ร้านอาหาร / คาเฟ่', 'ห้างสรรพสินค้า / ร้านค้า',
  'โรงพยาบาล / คลินิก', 'โรงเรียน / มหาวิทยาลัย', 'โชว์รูม',
  'อื่นๆ (ระบุเพิ่ม)',
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.cdb-root {
  display:flex;min-height:100vh;font-family:'Sarabun',sans-serif;font-size:15px;background:#f0f1f3;
}
.cdb-root *{box-sizing:border-box}
.cdb-sidebar{
  width:240px;background:#fff;border-right:1px solid #e2e4e9;
  position:fixed;top:0;left:0;height:100vh;overflow-y:auto;z-index:50;
  display:flex;flex-direction:column;flex-shrink:0;
}
.cdb-brand{padding:16px 18px;border-bottom:1px solid #e8eaed}
.cdb-logo{width:36px;height:36px;background:#1f2937;border-radius:8px;
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;margin-bottom:6px}
.cdb-brand-name{font-size:14px;font-weight:700;color:#1f2937}
.cdb-brand-sub{font-size:12px;color:#6b7280}
.cdb-nav{padding:10px 0;flex:1}
.cdb-nav-section{padding:6px 18px 3px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af}
.cdb-nav-item{display:block;padding:8px 18px;font-size:15px;color:#374151;text-decoration:none;
  border-left:3px solid transparent;transition:all .15s;cursor:pointer}
.cdb-nav-item:hover{background:#f0f1f3;color:#111827;border-left-color:#374151}
.cdb-nav-item.active{background:#f0f1f3;color:#111827;font-weight:600;border-left-color:#1f2937}
.cdb-main{margin-left:240px;flex:1;padding:28px 32px 80px}
.cdb-toolbar{
  display:flex;align-items:center;gap:10px;margin-bottom:16px;
  background:#fff;border:1px solid #e2e4e9;border-radius:10px;padding:12px 16px;
}
.cdb-search{
  flex:1;display:flex;align-items:center;gap:8px;
  border:1px solid #e2e4e9;border-radius:8px;padding:7px 12px;background:#fafafa;
  transition:border .15s;
}
.cdb-search:focus-within{border-color:#374151;background:#fff}
.cdb-search input{border:none;background:transparent;outline:none;font-size:14px;width:100%;font-family:inherit}
.cdb-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.cdb-select{
  border:1px solid #e2e4e9;border-radius:8px;padding:5px 10px;font-size:13px;
  background:#fff;color:#374151;cursor:pointer;font-family:inherit;transition:border .15s;
}
.cdb-select:focus{border-color:#374151;outline:none}
.cdb-btn-primary{
  background:#1f2937;color:#fff;border:none;border-radius:8px;
  padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;
  display:flex;align-items:center;gap:6px;white-space:nowrap;font-family:inherit;transition:background .15s;
}
.cdb-btn-primary:hover{background:#111827}
.cdb-card-list{display:flex;flex-direction:column;gap:10px}
.cdb-card{
  background:#fff;border:1px solid #e2e4e9;border-radius:12px;
  padding:14px 18px;transition:box-shadow .15s,border-color .15s;
}
.cdb-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);border-color:#d1d5db}
.cdb-card-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px}
.cdb-card-codes{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px}
.cdb-code{
  background:#f0f1f3;color:#374151;border:1px solid #d1d5db;
  border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;font-family:monospace;
}
.cdb-badge-vip{background:#fef9c3;color:#854d0e;border:1px solid #fbbf24;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700}
.cdb-badge-normal{background:#f0f1f3;color:#6b7280;border:1px solid #e2e4e9;border-radius:4px;padding:2px 8px;font-size:11px}
.cdb-badge-watch{background:#fdecea;color:#c0392b;border:1px solid #fca5a5;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700}
.cdb-badge-inactive{background:#f0f1f3;color:#9ca3af;border:1px solid #e2e4e9;border-radius:4px;padding:2px 7px;font-size:11px}
.cdb-card-name{font-size:15px;font-weight:700;color:#111827;flex:1}
.cdb-card-sub{font-size:13px;color:#6b7280;margin-bottom:3px}
.cdb-card-info{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#374151;margin-top:6px}
.cdb-card-info-item{display:flex;align-items:center;gap:5px}
.cdb-card-actions{display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid #f0f1f3}
.cdb-btn-sm{
  border:1px solid #e2e4e9;background:#fafafa;border-radius:6px;
  padding:5px 12px;font-size:12px;cursor:pointer;color:#374151;font-family:inherit;transition:all .15s;
}
.cdb-btn-sm:hover{background:#f0f1f3;border-color:#c4c8d0}
.cdb-btn-sm.danger:hover{background:#fdecea;color:#c0392b;border-color:#fca5a5}
.cdb-empty{text-align:center;padding:60px 20px;color:#9ca3af;font-size:14px}
.cdb-loading{text-align:center;padding:40px;color:#6b7280}
.cdb-pagination{display:flex;align-items:center;gap:8px;margin-top:20px;justify-content:flex-end}
.cdb-page-btn{
  border:1px solid #e2e4e9;background:#fff;border-radius:6px;
  padding:5px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s;
}
.cdb-page-btn:hover:not(:disabled){background:#f0f1f3;border-color:#c4c8d0}
.cdb-page-btn:disabled{opacity:.4;cursor:default}
.cdb-page-btn.active{background:#1f2937;color:#fff;border-color:#1f2937}
.cdb-stat-bar{display:flex;gap:12px;margin-bottom:16px}
.cdb-stat{
  background:#fff;border:1px solid #e2e4e9;border-radius:10px;
  padding:10px 16px;text-align:center;flex:1;
}
.cdb-stat .num{font-size:22px;font-weight:700;color:#111827}
.cdb-stat .lbl{font-size:11px;color:#9ca3af;margin-top:2px}
`;

export default function CustomersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [perPage, setPerPage] = useState(30);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (pg = 1, search = q, pp = perPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(pp), status: statusFilter });
      if (search) params.set('q', search);
      if (typeFilter) params.set('type', typeFilter);
      if (provinceFilter) params.set('province', provinceFilter);
      if (gradeFilter) params.set('grade', gradeFilter);
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [q, typeFilter, provinceFilter, gradeFilter, statusFilter, perPage]);

  useEffect(() => { load(1); }, [typeFilter, provinceFilter, gradeFilter, statusFilter]);

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
  const vipCount = rows.filter(r => r.sales_grade === 'VIP').length;
  const watchCount = rows.filter(r => r.service_flag === 'watch').length;

  const fmtAddress = (r: CustomerRow) => {
    const parts = [r.district, r.province].filter(Boolean);
    return parts.length ? parts.join(', ') : r.address_line1 || '—';
  };

  const fmtRoles = (rolesJson: string | null) => {
    if (!rolesJson) return '';
    try {
      const roles = JSON.parse(rolesJson) as string[];
      return roles.length ? `(${roles[0]})` : '';
    } catch { return ''; }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cdb-root">
        {/* Sidebar */}
        <aside className="cdb-sidebar">
          <div className="cdb-brand">
            <div className="cdb-logo">LSL</div>
            <div className="cdb-brand-name">LinSiLin Living</div>
            <div className="cdb-brand-sub">ระบบข้อมูลลูกค้า</div>
          </div>
          <nav className="cdb-nav">
            <div className="cdb-nav-section">ลูกค้า</div>
            <a className="cdb-nav-item active" onClick={() => load(1)}>👥 รายการลูกค้า</a>
            <a className="cdb-nav-item" onClick={() => router.push('/customers/new')}>➕ เพิ่มลูกค้าใหม่</a>
            <div className="cdb-nav-section">ลิงก์ด่วน</div>
            <a className="cdb-nav-item" onClick={() => router.push('/products')}>📦 ฐานข้อมูลสินค้า</a>
            <a className="cdb-nav-item" onClick={() => router.push('/admin/boq')}>📋 BOQ</a>
            <a className="cdb-nav-item" onClick={() => router.push('/admin')}>🏠 แดชบอร์ด</a>
          </nav>
        </aside>

        {/* Main */}
        <main className="cdb-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>รายการลูกค้า</h1>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                ทั้งหมด {total.toLocaleString()} ราย
              </div>
            </div>
            <button className="cdb-btn-primary" onClick={() => router.push('/customers/new')}>
              + เพิ่มลูกค้า
            </button>
          </div>

          {/* Stats */}
          <div className="cdb-stat-bar">
            <div className="cdb-stat"><div className="num">{total}</div><div className="lbl">ลูกค้าทั้งหมด</div></div>
            <div className="cdb-stat"><div className="num" style={{ color: '#854d0e' }}>{vipCount}</div><div className="lbl">VIP (หน้านี้)</div></div>
            <div className="cdb-stat"><div className="num" style={{ color: '#c0392b' }}>{watchCount}</div><div className="lbl">⚠️ ระวัง (หน้านี้)</div></div>
          </div>

          {/* Toolbar */}
          <div className="cdb-toolbar">
            <div className="cdb-search">
              <span>🔍</span>
              <input
                value={q}
                onChange={e => handleSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัส, เลขภาษี, เบอร์โทร..."
              />
            </div>
          </div>

          {/* Filters */}
          <div className="cdb-filters">
            <select className="cdb-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">ประเภท ▼</option>
              <option value="individual">บุคคลธรรมดา</option>
              <option value="company">นิติบุคคล</option>
            </select>
            <select className="cdb-select" value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setPage(1); }}>
              <option value="">Grade ▼</option>
              <option value="VIP">VIP</option>
              <option value="normal">ปกติ</option>
            </select>
            <select className="cdb-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="active">สถานะ: ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="blocked">บล็อก</option>
              <option value="">ทั้งหมด</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
              แสดง
              {[10, 20, 30].map(n => (
                <button
                  key={n}
                  className="cdb-page-btn"
                  style={perPage === n ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937', padding: '4px 10px' } : { padding: '4px 10px' }}
                  onClick={() => handlePerPage(n)}
                >{n}</button>
              ))}
              รายการ
            </div>
            {(typeFilter || gradeFilter || statusFilter !== 'active' || q) && (
              <button className="cdb-btn-sm" onClick={() => {
                setTypeFilter(''); setGradeFilter(''); setStatusFilter('active'); setQ(''); load(1, '');
              }}>✕ ล้างตัวกรอง</button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="cdb-loading">⏳ กำลังโหลด...</div>
          ) : rows.length === 0 ? (
            <div className="cdb-empty">
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <div>ไม่พบลูกค้า</div>
              {q && <div style={{ marginTop: 6 }}>ลองเปลี่ยนคำค้นหา</div>}
            </div>
          ) : (
            <div className="cdb-card-list">
              {rows.map((r, idx) => (
                <div key={r.id} className="cdb-card">
                  <div className="cdb-card-top">
                    <div style={{ flex: 1 }}>
                      <div className="cdb-card-codes">
                        <span className="cdb-code">{r.cus_code}</span>
                        <span className="cdb-code">{r.category_code}</span>
                        {r.sales_grade === 'VIP' && <span className="cdb-badge-vip">VIP</span>}
                        {r.service_flag === 'watch' && <span className="cdb-badge-watch">⚠️ ระวัง</span>}
                        {r.status !== 'active' && (
                          <span className="cdb-badge-inactive">{r.status === 'inactive' ? 'ไม่ใช้งาน' : 'บล็อก'}</span>
                        )}
                      </div>
                      <div className="cdb-card-name">{r.cus_name}{r.nickname ? ` (${r.nickname})` : ''}</div>
                      <div className="cdb-card-sub">{r.business_type || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                      {r.cus_type === 'company' ? 'นิติบุคคล' : 'บุคคล'}
                      <div style={{ marginTop: 4, fontWeight: 600, color: '#6b7280', fontSize: 12 }}>
                        #{(page - 1) * perPage + idx + 1}
                      </div>
                    </div>
                  </div>

                  <div className="cdb-card-info">
                    {(r.province || r.address_line1) && (
                      <span className="cdb-card-info-item">
                        <span>📍</span>
                        <span>{fmtAddress(r)}</span>
                      </span>
                    )}
                    {r.contact_name && (
                      <span className="cdb-card-info-item">
                        <span>👤</span>
                        <span>{r.contact_name} {fmtRoles(r.contact_roles)}</span>
                        {r.contact_phone && <span>· 📞 {r.contact_phone}</span>}
                      </span>
                    )}
                    {r.credit_day > 0 && (
                      <span className="cdb-card-info-item">
                        <span>💳</span>
                        <span>เครดิต {r.credit_day} วัน</span>
                      </span>
                    )}
                  </div>

                  <div className="cdb-card-actions">
                    <button className="cdb-btn-sm" onClick={() => router.push(`/customers/${r.id}`)}>
                      ✏️ แก้ไข
                    </button>
                    <button className="cdb-btn-sm" onClick={() => router.push(`/customers/${r.id}`)}>
                      🔗 เปิด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="cdb-pagination">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginRight: 'auto' }}>
                แสดง
                {[10, 20, 30].map(n => (
                  <button
                    key={n}
                    className="cdb-page-btn"
                    style={perPage === n ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937', padding: '4px 10px' } : { padding: '4px 10px' }}
                    onClick={() => handlePerPage(n)}
                  >{n}</button>
                ))}
                รายการ
              </div>
              <button className="cdb-page-btn" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>
                ← ก่อนหน้า
              </button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>หน้า {page} / {totalPages}</span>
              <button className="cdb-page-btn" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>
                ถัดไป →
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
