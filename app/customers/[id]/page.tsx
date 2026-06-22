'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProvinces, getAmphoe, getTambon, getZipcode, isBangkok } from '@/lib/thai-address';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: number;
  cus_code: string;
  category_code: string;
  cus_type: string;
  cus_name: string;
  nickname: string | null;
  tax_id: string | null;
  branch_type: string;
  branch_no: string | null;
  business_type: string;
  sales_grade: 'VIP' | 'normal';
  service_flag: 'normal' | 'watch';
  service_reason: string | null;
  source_channels: string;
  source_other: string | null;
  commission_type: string;
  commission_value: number;
  credit_day: number;
  status: string;
  remark: string | null;
  created_at: string;
  addresses: Address[];
  contacts: Contact[];
  flagHistory: FlagHistoryRow[];
}

interface Address {
  id: number;
  label: string;
  is_default: boolean;
  use_for_invoice: boolean;
  use_for_shipping: boolean;
  use_for_install: boolean;
  address_line1: string;
  sub_district: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  note: string | null;
}

interface Contact {
  id: number;
  full_name: string;
  nickname: string | null;
  roles: string;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  is_primary: boolean;
  display_order: number;
  note: string | null;
}

interface FlagHistoryRow {
  id: number;
  action: string;
  flag_value: string;
  reason: string | null;
  created_at: string;
}

const BUSINESS_TYPES = [
  'โรงแรม / รีสอร์ท', 'ออฟฟิศ / สำนักงาน', 'บ้านพักอาศัย / บ้านเช่า',
  'คอนโด / อพาร์ทเม้นท์', 'ร้านอาหาร / คาเฟ่', 'ห้างสรรพสินค้า / ร้านค้า',
  'โรงพยาบาล / คลินิก', 'โรงเรียน / มหาวิทยาลัย', 'โชว์รูม', 'อื่นๆ',
];

const SOURCE_OPTIONS = [
  'Walk-in', 'เว็บไซต์', 'Facebook', 'IG - X',
  'LINE OA', 'TikTok', 'ลูกค้าเก่าแนะนำ', 'Sale', 'อื่นๆ',
];

const CONTACT_ROLES = ['ผู้ซื้อ', 'บัญชี', 'โปรเจกต์', 'ติดต่อหลัก'];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.cdt-root{min-height:100vh;background:#f0f1f3;font-family:'Sarabun',sans-serif;font-size:15px;padding:28px 32px 80px}
.cdt-root *{box-sizing:border-box}
.cdt-back{
  display:inline-flex;align-items:center;gap:6px;color:#374151;
  font-size:13px;font-weight:600;cursor:pointer;margin-bottom:16px;
  background:none;border:none;padding:0;font-family:inherit;
}
.cdt-back:hover{text-decoration:underline;color:#111827}
.cdt-hero{
  background:linear-gradient(135deg,#1a1d23,#2d3139);
  border-radius:12px;padding:20px 24px;color:#fff;margin-bottom:20px;
}
.cdt-hero h1{font-size:22px;font-weight:700;margin:0 0 4px}
.cdt-hero .sub{font-size:13px;opacity:.7}
.cdt-hero .meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.cdt-badge{border-radius:4px;padding:2px 10px;font-size:12px;font-weight:700;border:1px solid}
.cdt-badge-vip{background:#fef9c3;color:#854d0e;border-color:#fbbf24}
.cdt-badge-normal{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.cdt-badge-watch{background:#fdecea;color:#c0392b;border-color:#fca5a5}
.cdt-tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:20px}
.cdt-tab{
  padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;
  cursor:pointer;border:1px solid #e2e4e9;background:#fff;color:#6b7280;
  font-family:inherit;transition:all .15s;
}
.cdt-tab:hover{background:#f0f1f3;color:#111827;border-color:#c4c8d0}
.cdt-tab.active{background:#1f2937;color:#fff;border-color:#1f2937}
.cdt-panel{background:#fff;border:1px solid #e2e4e9;border-radius:12px;padding:24px}
.cdt-section-title{font-weight:700;font-size:14px;color:#374151;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.cdt-input{width:100%;border:1px solid #d1d5db;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;background:#fafafa;transition:border .15s,background .15s}
.cdt-input:focus{border-color:#374151;background:#fff;box-shadow:0 0 0 3px rgba(55,65,81,.1)}
.cdt-select{width:100%;border:1px solid #d1d5db;border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;background:#fafafa;cursor:pointer;transition:border .15s}
.cdt-select:focus{border-color:#374151;outline:none;background:#fff}
.cdt-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cdt-row3{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}
.cdt-lbl{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
.cdt-field{margin-bottom:14px}
.cdt-addr-card{background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;padding:14px;margin-bottom:8px}
.cdt-contact-card{background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;padding:14px;margin-bottom:8px}
.cdt-checks{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.cdt-check-chip{
  display:flex;align-items:center;gap:6px;
  background:#fafafa;border:1px solid #e2e4e9;border-radius:8px;
  padding:4px 10px;cursor:pointer;font-size:12px;transition:all .15s;
}
.cdt-check-chip.selected{background:#1f2937;border-color:#1f2937;color:#fff;font-weight:600}
.cdt-check-chip:not(.selected):hover{background:#f0f1f3;border-color:#c4c8d0}
.cdt-flag-checks{display:flex;gap:14px;flex-wrap:wrap}
.cdt-flag-check{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer}
.cdt-flag-check input{width:15px;height:15px;cursor:pointer;accent-color:#374151}
.cdt-btn{border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
.cdt-btn-primary{background:#1f2937;color:#fff}
.cdt-btn-primary:hover{background:#111827}
.cdt-btn-primary:disabled{opacity:.4;cursor:not-allowed}
.cdt-btn-danger{background:#c0392b;color:#fff}
.cdt-btn-danger:hover{background:#a93226}
.cdt-btn-sm{background:#fafafa;border:1px solid #e2e4e9;border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:inherit;color:#374151;transition:all .15s}
.cdt-btn-sm:hover{background:#f0f1f3;border-color:#c4c8d0}
.cdt-btn-sm.danger:hover{background:#fdecea;color:#c0392b;border-color:#fca5a5}
.cdt-save-bar{display:flex;gap:10px;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid #f0f1f3}
.cdt-add-btn{
  border:1.5px dashed #c4c8d0;background:transparent;color:#6b7280;
  border-radius:10px;padding:7px 14px;font-size:13px;cursor:pointer;
  display:flex;align-items:center;gap:6px;font-family:inherit;width:100%;justify-content:center;
  transition:all .15s;
}
.cdt-add-btn:hover{background:#f0f1f3;border-color:#9ca3af;color:#374151}
.cdt-remove-btn{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;padding:0 4px}
.cdt-remove-btn:hover{color:#c0392b}
.cdt-history-row{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f0f1f3;font-size:13px}
.cdt-history-row:last-child{border-bottom:none}
.cdt-tag{display:inline-block;border-radius:4px;padding:1px 8px;font-size:11px;font-weight:700}
.cdt-tag-watch{background:#fdecea;color:#c0392b;border:1px solid #fca5a5}
.cdt-tag-normal{background:#e8f5e9;color:#1a7a3c;border:1px solid #86efac}
.cdt-info{background:#f0f1f3;border-left:3px solid #374151;border-radius:0 6px 6px 0;padding:10px 14px;font-size:13px;color:#374151;margin-bottom:14px}
.cdt-loading{text-align:center;padding:60px;color:#6b7280}
.cdt-upload-box{border:2px dashed #d1d5db;border-radius:8px;padding:8px;text-align:center;cursor:pointer;transition:all .15s}
.cdt-upload-box:hover{border-color:#374151;background:#fafafa}
`;

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const VALID_TABS = ['info', 'address', 'contact', 'source', 'sflag', 'history'];
  const [tab, setTab] = useState('info');
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (VALID_TABS.includes(hash)) setTab(hash);
  }, []);
  const switchTab = (key: string) => { setTab(key); window.location.hash = key; };
  const [saving, setSaving] = useState(false);

  // Editable fields (tab: info)
  const [cusName, setCusName] = useState('');
  const [nickname, setNickname] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branchType, setBranchType] = useState('-');
  const [branchNo, setBranchNo] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [sourceOther, setSourceOther] = useState('');
  const [commType, setCommType] = useState('none');
  const [commValue, setCommValue] = useState('');
  const [creditDay, setCreditDay] = useState('0');
  const [status, setStatus] = useState('active');
  const [remark, setRemark] = useState('');

  // Address editing
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddr, setEditingAddr] = useState<number | null>(null);
  const [newAddr, setNewAddr] = useState(false);
  const [addrForm, setAddrForm] = useState<Partial<Address>>({});

  // Contact editing
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingContact, setEditingContact] = useState<number | null>(null);
  const [newContact, setNewContact] = useState(false);
  const [contactForm, setContactForm] = useState<Partial<Contact> & { roles_arr?: string[] }>({});

  // Service flag
  const [sflag, setSflag] = useState<'normal' | 'watch'>('normal');
  const [sflagReason, setSflagReason] = useState('');

  // Upload doc
  const [cusDoc, setCusDoc] = useState<File | null>(null);
  const [cusDocUrl, setCusDocUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) { router.push('/customers'); return; }
      const d: Customer = await res.json();
      setData(d);
      setCusName(d.cus_name);
      setNickname(d.nickname || '');
      setTaxId(d.tax_id || '');
      setBranchType(d.branch_type || '-');
      setBranchNo(d.branch_no || '');
      setBusinessType(d.business_type || '');
      try { setSources(JSON.parse(d.source_channels) || []); } catch { setSources([]); }
      setSourceOther(d.source_other || '');
      setCommType(d.commission_type || 'none');
      setCommValue(String(d.commission_value || 0));
      setCreditDay(String(d.credit_day || 0));
      setStatus(d.status || 'active');
      setRemark(d.remark || '');
      setAddresses(d.addresses || []);
      setContacts(d.contacts || []);
      setSflag(d.service_flag);
      setSflagReason(d.service_reason || '');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const saveInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cus_name: cusName, nickname, tax_id: taxId, branch_type: branchType,
          branch_no: branchNo, business_type: businessType, sales_grade: data?.sales_grade,
          service_flag: sflag, service_reason: sflagReason,
          source_channels: sources, source_other: sourceOther,
          commission_type: commType, commission_value: Number(commValue),
          credit_day: Number(creditDay), status, remark,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await load();
      alert('บันทึกสำเร็จ');
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally { setSaving(false); }
  };

  const saveAddr = async () => {
    if (!addrForm.address_line1?.trim()) { alert('กรุณาระบุที่อยู่'); return; }
    setSaving(true);
    try {
      const payload = { ...addrForm, roles: undefined };
      if (editingAddr !== null) {
        await fetch(`/api/customers/${id}/addresses/${editingAddr}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/customers/${id}/addresses`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      }
      setEditingAddr(null); setNewAddr(false); setAddrForm({});
      await load();
    } finally { setSaving(false); }
  };

  const deleteAddr = async (aid: number) => {
    if (!confirm('ลบที่อยู่นี้?')) return;
    await fetch(`/api/customers/${id}/addresses/${aid}`, { method: 'DELETE' });
    await load();
  };

  const saveContact = async () => {
    if (!contactForm.full_name?.trim()) { alert('กรุณาระบุชื่อ'); return; }
    setSaving(true);
    try {
      const payload = { ...contactForm, roles: contactForm.roles_arr || [] };
      if (editingContact !== null) {
        await fetch(`/api/customers/${id}/contacts/${editingContact}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/customers/${id}/contacts`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
      }
      setEditingContact(null); setNewContact(false); setContactForm({});
      await load();
    } finally { setSaving(false); }
  };

  const deleteContact = async (cid: number) => {
    if (!confirm('ลบผู้ติดต่อนี้?')) return;
    await fetch(`/api/customers/${id}/contacts/${cid}`, { method: 'DELETE' });
    await load();
  };

  const saveSFlag = async () => {
    setSaving(true);
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cus_name: data?.cus_name, business_type: data?.business_type,
          sales_grade: data?.sales_grade,
          service_flag: sflag, service_reason: sflagReason,
          source_channels: sources, credit_day: Number(creditDay), status,
        }),
      });
      await load();
      alert('บันทึก Service Flag สำเร็จ');
    } finally { setSaving(false); }
  };

  const toggleSource = (s: string) => setSources(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const fmtAddrLine = (a: Address) => {
    const parts = [a.address_line1, a.sub_district && `แขวง${a.sub_district}`, a.district && `เขต${a.district}`, a.province].filter(Boolean);
    return parts.join(' ');
  };

  const parseRoles = (r: string | null | undefined) => { try { return JSON.parse(r || '[]') as string[]; } catch { return []; } };

  const TABS = [
    { key: 'info', label: '📋 ข้อมูลทั่วไป' },
    { key: 'address', label: '📍 ที่อยู่' },
    { key: 'contact', label: '👤 ผู้ติดต่อ' },
    { key: 'source', label: '📡 แหล่งที่มา' },
    { key: 'sflag', label: '⚠️ Service Flag' },
    { key: 'history', label: '📜 ประวัติ' },
  ];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="cdt-root"><div className="cdt-loading">⏳ กำลังโหลด...</div></div>
    </>
  );

  if (!data) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="cdt-root">
        <button className="cdt-back" onClick={() => router.push('/customers')}>← กลับรายการลูกค้า</button>

        {/* Hero */}
        <div className="cdt-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1>{data.cus_name}{data.nickname ? ` (${data.nickname})` : ''}</h1>
              <div className="meta" style={{ fontSize: 15, opacity: .9, marginTop: 8 }}>
                {data.addresses[0] && <span>📍 {data.addresses[0].province || data.addresses[0].address_line1}</span>}
                {data.contacts[0] && <span>👤 {data.contacts[0].full_name} · 📞 {data.contacts[0].phone1 || '—'}</span>}
                <span>💳 {Number(data.credit_day) > 0 ? `เครดิต ${data.credit_day} วัน` : 'เงินสด'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span className="cdt-badge cdt-badge-normal">{data.cus_code}</span>
                <span className="cdt-badge cdt-badge-normal">{data.category_code}</span>
                {data.sales_grade === 'VIP' && <span className="cdt-badge cdt-badge-vip">VIP</span>}
                {data.service_flag === 'watch' && <span className="cdt-badge cdt-badge-watch">⚠️ ระวัง</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, opacity: .85 }}>
                {data.cus_type === 'company' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="cdt-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`cdt-tab ${tab === t.key ? 'active' : ''}`} onClick={() => switchTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── TAB: ข้อมูลทั่วไป ─── */}
        {tab === 'info' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">📋 ข้อมูลทั่วไป</div>

            {/* ชื่อ */}
            <div className="cdt-field">
              <label className="cdt-lbl">ชื่อ{data.cus_type === 'company' ? 'บริษัท' : ''} *</label>
              <input className="cdt-input" value={cusName} onChange={e => setCusName(e.target.value)} />
            </div>

            {/* เลขภาษี + ประเภทธุรกิจ */}
            <div className="cdt-row2 cdt-field">
              <div>
                <label className="cdt-lbl">เลขประจำตัวผู้เสียภาษี</label>
                <input className="cdt-input" value={taxId} onChange={e => setTaxId(e.target.value)} maxLength={13} placeholder="13 หลัก" />
              </div>
              <div>
                <label className="cdt-lbl">ประเภทธุรกิจ</label>
                <select className="cdt-select" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  <option value="">— เลือก —</option>
                  {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* สาขา (company only) */}
            {data.cus_type === 'company' && (
              <div className="cdt-row2 cdt-field">
                <div>
                  <label className="cdt-lbl">สาขา</label>
                  <select className="cdt-select" value={branchType} onChange={e => setBranchType(e.target.value)}>
                    <option value="-">— ไม่ระบุ</option>
                    <option value="HO">HO (สำนักงานใหญ่)</option>
                    <option value="BR">BR (สาขา)</option>
                  </select>
                </div>
                <div>
                  <label className="cdt-lbl">เลขที่สาขา</label>
                  <input className="cdt-input" value={branchNo} onChange={e => setBranchNo(e.target.value)} disabled={branchType === '-'} placeholder="เช่น 00001" />
                </div>
              </div>
            )}

            {/* เครดิต + upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }} className="cdt-field">
              <div>
                <label className="cdt-lbl">💳 เงื่อนไขเครดิต</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="cdt-flag-check">
                    <input type="radio" name="editCreditType" checked={Number(creditDay) === 0} onChange={() => setCreditDay('0')} />
                    เงินสด
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label className="cdt-flag-check">
                      <input type="radio" name="editCreditType" checked={Number(creditDay) > 0} onChange={() => setCreditDay(creditDay === '0' ? '30' : creditDay)} />
                      เครดิต
                    </label>
                    {Number(creditDay) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input className="cdt-input" type="number" min={1} value={creditDay} onChange={e => setCreditDay(e.target.value)} style={{ width: 80 }} />
                        <span style={{ fontSize: 13, color: '#6b7280' }}>วัน</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="cdt-lbl">แนบเอกสาร ลูกค้า</label>
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    if (cusDocUrl) URL.revokeObjectURL(cusDocUrl);
                    setCusDoc(f);
                    setCusDocUrl(f ? URL.createObjectURL(f) : null);
                  }} />
                  {cusDocUrl && cusDoc?.type.startsWith('image/') ? (
                    <div style={{ position: 'relative' }}>
                      <img src={cusDocUrl} alt="preview" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e4e9', display: 'block' }} />
                      <button type="button" onClick={e => { e.preventDefault(); if (cusDocUrl) URL.revokeObjectURL(cusDocUrl); setCusDoc(null); setCusDocUrl(null); }}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0 }}>✕</button>
                    </div>
                  ) : cusDoc ? (
                    <div className="cdt-upload-box">
                      <div style={{ fontSize: 18 }}>📄</div>
                      <div style={{ fontSize: 10, color: '#6b7280', wordBreak: 'break-all' }}>{cusDoc.name}</div>
                    </div>
                  ) : (
                    <div className="cdt-upload-box">
                      <div style={{ fontSize: 14 }}>📷</div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>คลิกเพื่อเลือก</div>
                      <div style={{ fontSize: 9, color: '#9ca3af' }}>JPG, PNG, PDF</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="cdt-save-bar">
              <button className="cdt-btn cdt-btn-primary" onClick={saveInfo} disabled={saving}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: ที่อยู่ ─── */}
        {tab === 'address' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">📍 ที่อยู่</div>
            {addresses.map((a, idx) => (
              <div key={a.id} className="cdt-addr-card">
                {editingAddr === a.id ? (
                  <>
                    {idx > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                        <button className="cdt-remove-btn" onClick={() => deleteAddr(a.id)}>✕ ลบ</button>
                      </div>
                    )}
                    <div className="cdt-field">
                      <label className="cdt-lbl">บรรทัดที่ 1 *</label>
                      <input className="cdt-input" value={addrForm.address_line1 || ''} onChange={e => setAddrForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="บ้านเลขที่ ซอย ถนน..." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', gap: 10, marginBottom: 10 }}>
                      <div>
                        <label className="cdt-lbl">จังหวัด</label>
                        <select className="cdt-select" value={addrForm.province || ''} onChange={e => setAddrForm(p => ({ ...p, province: e.target.value, district: '', sub_district: '', postal_code: '' }))}>
                          <option value="">— เลือก —</option>
                          {getProvinces().map(pv => <option key={pv} value={pv}>{pv}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="cdt-lbl">{isBangkok(addrForm.province || '') ? 'อำเภอ/เขต' : 'อำเภอ'}</label>
                        <select className="cdt-select" value={addrForm.district || ''} onChange={e => setAddrForm(p => ({ ...p, district: e.target.value, sub_district: '', postal_code: '' }))}>
                          <option value="">-- เลือก --</option>
                          {getAmphoe(addrForm.province || '').map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="cdt-lbl">{isBangkok(addrForm.province || '') ? 'ตำบล/แขวง' : 'ตำบล'}</label>
                        <select className="cdt-select" value={addrForm.sub_district || ''} onChange={e => {
                          const z = getZipcode(addrForm.province || '', addrForm.district || '', e.target.value);
                          setAddrForm(p => ({ ...p, sub_district: e.target.value, postal_code: z || p.postal_code }));
                        }}>
                          <option value="">-- เลือก --</option>
                          {getTambon(addrForm.province || '', addrForm.district || '').map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="cdt-lbl">รหัสไปรษณีย์</label>
                        <input className="cdt-input" value={addrForm.postal_code || ''} onChange={e => setAddrForm(p => ({ ...p, postal_code: e.target.value }))} maxLength={5} placeholder="อัตโนมัติ" />
                      </div>
                    </div>
                    <div className="cdt-flag-checks" style={{ marginBottom: 12 }}>
                      <label className="cdt-flag-check">
                        <input type="checkbox" checked={!!addrForm.is_default} onChange={e => setAddrForm(p => ({ ...p, is_default: e.target.checked }))} />
                        ⭐ ตั้งเป็นหลัก
                      </label>
                      {([['use_for_invoice', 'ออกใบกำกับ'], ['use_for_shipping', 'จัดส่ง'], ['use_for_install', 'ติดตั้ง']] as const).map(([f, l]) => (
                        <label key={f} className="cdt-flag-check">
                          <input type="checkbox" checked={!!addrForm[f]} onChange={e => setAddrForm(p => ({ ...p, [f]: e.target.checked }))} />{l}
                        </label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="cdt-btn cdt-btn-primary" onClick={saveAddr} disabled={saving}>{saving ? '⏳' : '💾 บันทึก'}</button>
                      <button className="cdt-btn-sm" onClick={() => { setEditingAddr(null); setAddrForm({}); }}>ยกเลิก</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      {a.is_default && <div style={{ fontSize: 11, color: '#374151', fontWeight: 700, marginBottom: 3 }}>⭐ ที่อยู่หลัก</div>}
                      <div style={{ fontSize: 14, color: '#374151' }}>{fmtAddrLine(a)}</div>
                      {a.postal_code && <div style={{ fontSize: 12, color: '#6b7280' }}>{a.postal_code}</div>}
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                        {a.use_for_invoice && '📄 ออกใบกำกับ '}{a.use_for_shipping && '🚚 จัดส่ง '}{a.use_for_install && '🔧 ติดตั้ง'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="cdt-btn-sm" onClick={() => { setEditingAddr(a.id); setAddrForm({ ...a }); }}>✏️</button>
                      <button className="cdt-btn-sm danger" onClick={() => deleteAddr(a.id)}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {newAddr ? (
              <div className="cdt-addr-card">
                <div className="cdt-field">
                  <label className="cdt-lbl">บรรทัดที่ 1 *</label>
                  <input className="cdt-input" value={addrForm.address_line1 || ''} onChange={e => setAddrForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="บ้านเลขที่ ซอย ถนน..." />
                </div>
                <div className="cdt-field">
                  <label className="cdt-lbl">จังหวัด</label>
                  <select className="cdt-select" value={addrForm.province || ''} onChange={e => setAddrForm(p => ({ ...p, province: e.target.value, district: '', sub_district: '', postal_code: '' }))}>
                    <option value="">— เลือก —</option>
                    {getProvinces().map(pv => <option key={pv} value={pv}>{pv}</option>)}
                  </select>
                </div>
                <div className="cdt-field">
                  <label className="cdt-lbl">{isBangkok(addrForm.province || '') ? 'อำเภอ/เขต' : 'อำเภอ'}</label>
                  <select className="cdt-select" value={addrForm.district || ''} onChange={e => setAddrForm(p => ({ ...p, district: e.target.value, sub_district: '', postal_code: '' }))}>
                    <option value="">-- เลือก --</option>
                    {getAmphoe(addrForm.province || '').map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="cdt-row2" style={{ marginBottom: 10 }}>
                  <div>
                    <label className="cdt-lbl">{isBangkok(addrForm.province || '') ? 'ตำบล/แขวง' : 'ตำบล'}</label>
                    <select className="cdt-select" value={addrForm.sub_district || ''} onChange={e => {
                      const z = getZipcode(addrForm.province || '', addrForm.district || '', e.target.value);
                      setAddrForm(p => ({ ...p, sub_district: e.target.value, postal_code: z || p.postal_code }));
                    }}>
                      <option value="">-- เลือก --</option>
                      {getTambon(addrForm.province || '', addrForm.district || '').map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="cdt-lbl">รหัสไปรษณีย์</label>
                    <input className="cdt-input" value={addrForm.postal_code || ''} onChange={e => setAddrForm(p => ({ ...p, postal_code: e.target.value }))} maxLength={5} placeholder="อัตโนมัติ" />
                  </div>
                </div>
                <div className="cdt-flag-checks" style={{ marginBottom: 12 }}>
                  <label className="cdt-flag-check">
                    <input type="checkbox" checked={!!addrForm.is_default} onChange={e => setAddrForm(p => ({ ...p, is_default: e.target.checked }))} />
                    ⭐ ตั้งเป็นหลัก
                  </label>
                  {([['use_for_invoice', 'ออกใบกำกับ'], ['use_for_shipping', 'จัดส่ง'], ['use_for_install', 'ติดตั้ง']] as const).map(([f, l]) => (
                    <label key={f} className="cdt-flag-check"><input type="checkbox" checked={!!addrForm[f as keyof typeof addrForm]} onChange={e => setAddrForm(p => ({ ...p, [f]: e.target.checked }))} />{l}</label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cdt-btn cdt-btn-primary" onClick={saveAddr} disabled={saving}>{saving ? '⏳' : '💾 บันทึก'}</button>
                  <button className="cdt-btn-sm" onClick={() => { setNewAddr(false); setAddrForm({}); }}>ยกเลิก</button>
                </div>
              </div>
            ) : (
              <button className="cdt-add-btn" onClick={() => { setNewAddr(true); setAddrForm({ use_for_invoice: true, use_for_shipping: true, use_for_install: false }); }}>
                + เพิ่มที่อยู่อีก
              </button>
            )}
          </div>
        )}

        {/* ─── TAB: ผู้ติดต่อ ─── */}
        {tab === 'contact' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">👤 ผู้ติดต่อ</div>
            {contacts.map(c => (
              <div key={c.id} className="cdt-contact-card">
                {editingContact === c.id ? (
                  <>
                    <div className="cdt-row2" style={{ marginBottom: 10 }}>
                      <div><label className="cdt-lbl">ชื่อ-นามสกุล *</label><input className="cdt-input" value={contactForm.full_name || ''} onChange={e => setContactForm(p => ({ ...p, full_name: e.target.value }))} placeholder="ชื่อ นามสกุล" /></div>
                      <div><label className="cdt-lbl">อีเมล</label><input className="cdt-input" type="email" value={contactForm.email || ''} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
                    </div>
                    <div className="cdt-row2" style={{ marginBottom: 10 }}>
                      <div><label className="cdt-lbl">เบอร์โทร 1</label><input className="cdt-input" value={contactForm.phone1 || ''} onChange={e => setContactForm(p => ({ ...p, phone1: e.target.value }))} placeholder="0xx-xxx-xxxx" /></div>
                      <div><label className="cdt-lbl">เบอร์โทร 2</label><input className="cdt-input" value={contactForm.phone2 || ''} onChange={e => setContactForm(p => ({ ...p, phone2: e.target.value }))} placeholder="ถ้ามี" /></div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label className="cdt-lbl">ตำแหน่ง / บทบาท</label>
                      <div className="cdt-checks">
                        {CONTACT_ROLES.map(role => (
                          <label key={role} className={`cdt-check-chip ${(contactForm.roles_arr || []).includes(role) ? 'selected' : ''}`}
                            onClick={() => {
                              const arr = contactForm.roles_arr || [];
                              setContactForm(p => ({ ...p, roles_arr: arr.includes(role) ? arr.filter(r => r !== role) : [...arr, role] }));
                            }}>{role}</label>
                        ))}
                      </div>
                    </div>
                    <label className="cdt-flag-check" style={{ marginBottom: 12 }}>
                      <input type="checkbox" checked={!!contactForm.is_primary} onChange={e => setContactForm(p => ({ ...p, is_primary: e.target.checked }))} />
                      ⭐ ผู้ติดต่อหลัก
                    </label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="cdt-btn cdt-btn-primary" onClick={saveContact} disabled={saving}>{saving ? '⏳' : '💾 บันทึก'}</button>
                      <button className="cdt-btn-sm" onClick={() => { setEditingContact(null); setContactForm({}); }}>ยกเลิก</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
                        {c.is_primary ? '⭐ ' : ''}{c.full_name}{c.nickname ? ` (${c.nickname})` : ''}
                      </div>
                      {parseRoles(c.roles).length > 0 && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{parseRoles(c.roles).join(' · ')}</div>
                      )}
                      <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>
                        {c.phone1 && <span>📞 {c.phone1}</span>}
                        {c.phone2 && <span> · {c.phone2}</span>}
                        {c.email && <span style={{ marginLeft: 8 }}>✉️ {c.email}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="cdt-btn-sm" onClick={() => {
                        const displayName = c.full_name + (c.nickname ? ` (${c.nickname})` : '');
                        setEditingContact(c.id);
                        setContactForm({ ...c, full_name: displayName, roles_arr: parseRoles(c.roles) });
                      }}>✏️</button>
                      <button className="cdt-btn-sm danger" onClick={() => deleteContact(c.id)}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {newContact ? (
              <div className="cdt-contact-card">
                <div className="cdt-row2" style={{ marginBottom: 10 }}>
                  <div><label className="cdt-lbl">ชื่อ-นามสกุล *</label><input className="cdt-input" value={contactForm.full_name || ''} onChange={e => setContactForm(p => ({ ...p, full_name: e.target.value }))} placeholder="ชื่อ นามสกุล" /></div>
                  <div><label className="cdt-lbl">อีเมล</label><input className="cdt-input" type="email" value={contactForm.email || ''} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" /></div>
                </div>
                <div className="cdt-row2" style={{ marginBottom: 10 }}>
                  <div><label className="cdt-lbl">เบอร์โทร 1</label><input className="cdt-input" value={contactForm.phone1 || ''} onChange={e => setContactForm(p => ({ ...p, phone1: e.target.value }))} placeholder="0xx-xxx-xxxx" /></div>
                  <div><label className="cdt-lbl">เบอร์โทร 2</label><input className="cdt-input" value={contactForm.phone2 || ''} onChange={e => setContactForm(p => ({ ...p, phone2: e.target.value }))} placeholder="ถ้ามี" /></div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label className="cdt-lbl">ตำแหน่ง / บทบาท</label>
                  <div className="cdt-checks">
                    {CONTACT_ROLES.map(role => (
                      <label key={role} className={`cdt-check-chip ${(contactForm.roles_arr || []).includes(role) ? 'selected' : ''}`}
                        onClick={() => {
                          const arr = contactForm.roles_arr || [];
                          setContactForm(p => ({ ...p, roles_arr: arr.includes(role) ? arr.filter(r => r !== role) : [...arr, role] }));
                        }}>{role}</label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cdt-btn cdt-btn-primary" onClick={saveContact} disabled={saving}>{saving ? '⏳' : '💾 บันทึก'}</button>
                  <button className="cdt-btn-sm" onClick={() => { setNewContact(false); setContactForm({}); }}>ยกเลิก</button>
                </div>
              </div>
            ) : (
              <button className="cdt-add-btn" onClick={() => { setNewContact(true); setContactForm({ roles_arr: [] }); }}>
                + เพิ่มผู้ติดต่ออีก
              </button>
            )}
          </div>
        )}

        {/* ─── TAB: แหล่งที่มา ─── */}
        {tab === 'source' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">📡 แหล่งที่มา</div>
            <div className="cdt-checks" style={{ marginBottom: 16 }}>
              {SOURCE_OPTIONS.map(s => (
                <label key={s} className={`cdt-check-chip ${sources.includes(s) ? 'selected' : ''}`} onClick={() => toggleSource(s)}>{s}</label>
              ))}
            </div>
            {sources.includes('อื่นๆ') && (
              <div style={{ marginBottom: 14 }}>
                <label className="cdt-lbl">ระบุแหล่งที่มาอื่น</label>
                <input className="cdt-input" value={sourceOther} onChange={e => setSourceOther(e.target.value)} style={{ maxWidth: 400 }} />
              </div>
            )}
            {(sources.includes('ลูกค้าเก่าแนะนำ') || sources.includes('Sale (พนักงาน)')) && (
              <div className="cdt-row2" style={{ marginBottom: 14 }}>
                <div>
                  <label className="cdt-lbl">ประเภทค่าคอม</label>
                  <select className="cdt-select" value={commType} onChange={e => setCommType(e.target.value)}>
                    <option value="none">ไม่มี</option>
                    <option value="percent">% เปอร์เซ็นต์</option>
                    <option value="amount">฿ จำนวนเงิน</option>
                  </select>
                </div>
                {commType !== 'none' && (
                  <div>
                    <label className="cdt-lbl">มูลค่า</label>
                    <input className="cdt-input" type="number" value={commValue} onChange={e => setCommValue(e.target.value)} />
                  </div>
                )}
              </div>
            )}
            <div className="cdt-save-bar">
              <button className="cdt-btn cdt-btn-primary" onClick={saveInfo} disabled={saving}>{saving ? '⏳' : '💾 บันทึก'}</button>
            </div>
          </div>
        )}

        {/* ─── TAB: Service Flag ─── */}
        {tab === 'sflag' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">⚠️ Service Flag</div>
            <div className="cdt-info">Service Flag ใช้สำหรับ mark ลูกค้าที่ต้องระวังเป็นพิเศษ ทุกการเปลี่ยนแปลงจะถูกบันทึกในประวัติ</div>
            <div className="cdt-field" style={{ maxWidth: 280, marginBottom: 20 }}>
              <label className="cdt-lbl">สถานะบัญชี</label>
              <select className="cdt-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="blocked">บล็อก</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {(['normal', 'watch'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  className="cdt-btn"
                  onClick={() => setSflag(f)}
                  style={{
                    flex: 1, padding: '10px', fontSize: 14,
                    background: sflag === f ? (f === 'watch' ? '#c0392b' : '#1a7a3c') : '#fff',
                    color: sflag === f ? '#fff' : '#374151',
                    border: `1px solid ${sflag === f ? (f === 'watch' ? '#c0392b' : '#1a7a3c') : '#d1d5db'}`,
                    borderRadius: 8,
                  }}
                >
                  {f === 'watch' ? '⚠️ ระวัง (Watch)' : '✅ ปกติ (Normal)'}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="cdt-lbl">เหตุผล (จำเป็นถ้าเปลี่ยนเป็น ระวัง)</label>
              <textarea className="cdt-input" rows={3} value={sflagReason} onChange={e => setSflagReason(e.target.value)} placeholder="ระบุเหตุผลที่ต้องระวัง..." />
            </div>
            <div className="cdt-save-bar">
              <button className="cdt-btn cdt-btn-primary" onClick={saveSFlag} disabled={saving}>{saving ? '⏳' : '💾 บันทึก Flag'}</button>
            </div>
          </div>
        )}

        {/* ─── TAB: ประวัติ ─── */}
        {tab === 'history' && (
          <div className="cdt-panel">
            <div className="cdt-section-title">📜 ประวัติ Service Flag</div>
            {data.flagHistory.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>ไม่มีประวัติ</div>
            ) : (
              data.flagHistory.map(h => (
                <div key={h.id} className="cdt-history-row">
                  <div style={{ width: 140, flexShrink: 0, color: '#6b7280', fontSize: 12 }}>
                    {new Date(h.created_at).toLocaleDateString('th-TH')}
                  </div>
                  <div>
                    <span className={`cdt-tag ${h.flag_value === 'watch' ? 'cdt-tag-watch' : 'cdt-tag-normal'}`}>
                      {h.flag_value === 'watch' ? '⚠️ ระวัง' : '✅ ปกติ'}
                    </span>
                    {' '}
                    <span style={{ fontSize: 12, color: '#374151' }}>{h.action}</span>
                    {h.reason && <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>เหตุผล: {h.reason}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
