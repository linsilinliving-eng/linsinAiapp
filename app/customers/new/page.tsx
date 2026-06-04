'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProvinces, getAmphoe, getTambon, getZipcode, isBangkok } from '@/lib/thai-address';

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


// ─── Interfaces ───────────────────────────────────────────────────────────────
interface AddressForm {
  label: string;
  address_line1: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  use_for_invoice: boolean;
  use_for_shipping: boolean;
  use_for_install: boolean;
}

interface ContactForm {
  full_name: string;
  nickname: string;
  roles: string[];
  phone1: string;
  phone2: string;
  email: string;
  is_primary: boolean;
}

const emptyAddr = (): AddressForm => ({
  label: 'บริษัท', address_line1: '', sub_district: '', district: '',
  province: '', postal_code: '', is_default: true,
  use_for_invoice: true, use_for_shipping: true, use_for_install: false,
});

const emptyContact = (): ContactForm => ({
  full_name: '', nickname: '', roles: [], phone1: '', phone2: '', email: '', is_primary: true,
});

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.wiz-root{min-height:100vh;background:#f0f1f3;font-family:'Sarabun',sans-serif;font-size:15px;padding:32px 20px 80px}
.wiz-root *{box-sizing:border-box}
.wiz-card{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e4e9;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07)}
.wiz-header{background:linear-gradient(135deg,#1a1d23,#2d3139);padding:24px 28px;color:#fff}
.wiz-header h1{font-size:20px;font-weight:700;margin:0 0 4px;letter-spacing:.01em}
.wiz-header p{font-size:13px;opacity:.6;margin:0}
.wiz-steps{display:flex;padding:0 28px;background:#fafafa;border-bottom:1px solid #e8eaed}
.wiz-step{
  padding:14px 16px;font-size:12px;font-weight:600;color:#9ca3af;
  border-bottom:2px solid transparent;cursor:default;white-space:nowrap;
}
.wiz-step.done{color:#374151}
.wiz-step.active{color:#111827;border-bottom-color:#374151}
.wiz-body{padding:28px}
.wiz-field{margin-bottom:18px}
.wiz-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
.wiz-label .req{color:#c0392b;margin-left:2px}
.wiz-input{
  width:100%;border:1px solid #d1d5db;border-radius:8px;
  padding:9px 12px;font-size:14px;font-family:inherit;outline:none;
  background:#fafafa;transition:border .15s,background .15s;
}
.wiz-input:focus{border-color:#374151;background:#fff;box-shadow:0 0 0 3px rgba(55,65,81,.1)}
.wiz-input.error{border-color:#c0392b}
.wiz-select{
  width:100%;border:1px solid #d1d5db;border-radius:8px;
  padding:9px 12px;font-size:14px;font-family:inherit;background:#fafafa;cursor:pointer;
  transition:border .15s;
}
.wiz-select:focus{border-color:#374151;outline:none;background:#fff}
.wiz-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.wiz-row3{display:grid;grid-template-columns:2fr 1fr 1fr;gap:14px}
.wiz-auto-tag{
  display:inline-block;background:#f0f1f3;color:#374151;
  border:1px solid #d1d5db;border-radius:4px;padding:1px 8px;font-size:12px;font-weight:600;
}
.wiz-section{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f0f1f3}
.wiz-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.wiz-section-title{font-weight:700;font-size:14px;color:#374151;margin-bottom:12px;display:flex;align-items:center;gap:6px}
.wiz-checks{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.wiz-check-chip{
  display:flex;align-items:center;gap:6px;
  background:#fafafa;border:1px solid #e2e4e9;border-radius:8px;
  padding:4px 10px;cursor:pointer;font-size:12px;transition:all .15s;
}
.wiz-check-chip.selected{background:#1f2937;border-color:#1f2937;color:#fff;font-weight:600}
.wiz-check-chip:not(.selected):hover{background:#f0f1f3;border-color:#c4c8d0}
.wiz-check-chip input{display:none}
.wiz-flag-checks{display:flex;gap:10px;margin-top:6px}
.wiz-flag-check{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer}
.wiz-flag-check input{width:15px;height:15px;cursor:pointer;accent-color:#374151}
.wiz-addr-card{
  background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;
  padding:14px;margin-bottom:10px;
}
.wiz-contact-card{
  background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;
  padding:14px;margin-bottom:10px;
}
.wiz-add-btn{
  border:1.5px dashed #c4c8d0;background:transparent;color:#6b7280;
  border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;
  display:flex;align-items:center;gap:6px;font-family:inherit;width:100%;justify-content:center;
  transition:all .15s;
}
.wiz-add-btn:hover{background:#f0f1f3;border-color:#9ca3af;color:#374151}
.wiz-remove-btn{
  background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;
  padding:0 4px;line-height:1;
}
.wiz-remove-btn:hover{color:#c0392b}
.wiz-review-block{
  background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;
  padding:14px 16px;margin-bottom:12px;
}
.wiz-review-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #f0f1f3;font-size:13.5px}
.wiz-review-row:last-child{border-bottom:none}
.wiz-review-row .lbl{color:#9ca3af;width:130px;flex-shrink:0;font-size:13px}
.wiz-review-row .val{color:#111827;font-weight:500;flex:1}
.wiz-footer{
  display:flex;justify-content:space-between;align-items:center;
  padding:18px 28px;background:#fafafa;border-top:1px solid #e8eaed;
}
.wiz-btn{
  border:none;border-radius:8px;padding:10px 22px;font-size:14px;
  font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;
}
.wiz-btn-back{background:#fff;border:1px solid #e2e4e9;color:#374151}
.wiz-btn-back:hover{background:#f0f1f3;border-color:#c4c8d0}
.wiz-btn-next{background:#1f2937;color:#fff}
.wiz-btn-next:hover{background:#111827}
.wiz-btn-save{background:#166534;color:#fff}
.wiz-btn-save:hover{background:#14532d}
.wiz-btn-next:disabled,.wiz-btn-save:disabled{opacity:.4;cursor:not-allowed}
.wiz-error{color:#c0392b;font-size:12px;margin-top:4px}
.wiz-info{background:#f0f1f3;border-left:3px solid #374151;border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:#374151;margin-bottom:14px}
.wiz-success{
  text-align:center;padding:48px 28px;
}
.wiz-success .icon{font-size:56px;margin-bottom:16px}
.wiz-success h2{font-size:22px;font-weight:700;color:#166534;margin-bottom:8px}
.wiz-success p{color:#6b7280;font-size:14px}
`;

export default function NewCustomerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ id: number; cus_code: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: basic info
  const [cusType, setCusType] = useState<'individual' | 'company'>('company');
  const [cusName, setCusName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branchType, setBranchType] = useState<'HO' | 'BR' | '-'>('-');
  const [branchNo, setBranchNo] = useState('');
  const [businessType, setBusinessType] = useState('');

  // Step 2: addresses
  const [addresses, setAddresses] = useState<AddressForm[]>([emptyAddr()]);

  // Step 3: contacts
  const [contacts, setContacts] = useState<ContactForm[]>([emptyContact()]);

  // Step 4: source channels
  const [sources, setSources] = useState<string[]>([]);
  const [sourceOther, setSourceOther] = useState('');
  const [commType, setCommType] = useState<'none' | 'percent' | 'amount'>('none');
  const [commValue, setCommValue] = useState('');
  const [creditDay, setCreditDay] = useState('0');
  const [creditDoc, setCreditDoc] = useState<File | null>(null);
  const [creditDocUrl, setCreditDocUrl] = useState<string | null>(null);
  const [remark, setRemark] = useState('');

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!cusName.trim()) e.cusName = 'กรุณาระบุชื่อ';
    if (!businessType) e.businessType = 'กรุณาเลือกประเภทธุรกิจ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    addresses.forEach((a, i) => {
      if (!a.address_line1.trim()) e[`addr_${i}`] = 'กรุณาระบุที่อยู่';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate3 = () => {
    const e: Record<string, string> = {};
    contacts.forEach((c, i) => {
      if (!c.full_name.trim()) e[`contact_${i}`] = 'กรุณาระบุชื่อ';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validate1()) return;
    if (step === 2 && !validate2()) return;
    if (step === 3 && !validate3()) return;
    setStep(s => s + 1);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        cus_type: cusType,
        cus_name: cusName,
        nickname: null,
        tax_id: taxId || null,
        branch_type: branchType,
        branch_no: branchNo || null,
        business_type: businessType,
        source_channels: sources,
        source_other: sourceOther || null,
        commission_type: commType,
        commission_value: commType !== 'none' ? Number(commValue) : 0,
        credit_day: Number(creditDay),
        remark: remark || null,
        address: addresses[0] || null,
        contact: contacts[0] || null,
      };
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');

      // Save extra addresses + contacts
      for (let i = 1; i < addresses.length; i++) {
        await fetch(`/api/customers/${data.id}/addresses`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addresses[i]),
        });
      }
      for (let i = 1; i < contacts.length; i++) {
        await fetch(`/api/customers/${data.id}/contacts`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contacts[i]),
        });
      }

      setSaved(data);
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSource = (s: string) => {
    setSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleRole = (ci: number, role: string) => {
    setContacts(prev => prev.map((c, i) => {
      if (i !== ci) return c;
      const roles = c.roles.includes(role) ? c.roles.filter(r => r !== role) : [...c.roles, role];
      return { ...c, roles };
    }));
  };

  const updateAddr = (i: number, field: keyof AddressForm, value: string | boolean) => {
    setAddresses(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  };

  const updateContact = (i: number, field: keyof ContactForm, value: string | boolean | string[]) => {
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const STEPS = ['ข้อมูลชื่อบริษัท', 'ที่อยู่', 'ผู้ติดต่อ', 'แหล่งที่มา + ตรวจสอบ'];

  return (
    <>
      <style>{CSS}</style>
      <div className="wiz-root">
        <div className="wiz-card">
          <div className="wiz-header">
            <h1>เพิ่มลูกค้าใหม่</h1>
            <p>กรอกข้อมูลลูกค้าตามขั้นตอน (Wizard 4 ขั้น)</p>
          </div>

          {/* Step tabs */}
          {!saved && (
            <div className="wiz-steps">
              {STEPS.map((s, i) => (
                <div key={i} className={`wiz-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                  {step > i + 1 ? '✓ ' : `${i + 1}. `}{s}
                </div>
              ))}
            </div>
          )}

          {/* ─── SUCCESS ─────────────────────────────────────────── */}
          {saved && (
            <div className="wiz-body">
              <div className="wiz-success">
                <div className="icon">✅</div>
                <h2>บันทึกลูกค้าสำเร็จ!</h2>
                <p>รหัสลูกค้า: <strong style={{ color: '#1f2937' }}>{saved.cus_code}</strong></p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
                  <button className="wiz-btn wiz-btn-next" onClick={() => router.push(`/customers/${saved.id}`)}>
                    🔗 เปิดข้อมูลลูกค้า
                  </button>
                  <button className="wiz-btn wiz-btn-back" onClick={() => router.push('/customers/new')}>
                    + เพิ่มลูกค้าอีก
                  </button>
                  <button className="wiz-btn wiz-btn-back" onClick={() => router.push('/customers')}>
                    📋 รายการลูกค้า
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 1: ข้อมูลชื่อบริษัท ─────────────────────────── */}
          {!saved && step === 1 && (
            <div className="wiz-body">
              <div className="wiz-info">รหัสลูกค้าและรหัสหมวด (IND/COR) จะถูกสร้างโดยอัตโนมัติ</div>

              <div className="wiz-field">
                <label className="wiz-label">ประเภทลูกค้า <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['company', 'individual'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCusType(t)}
                      className="wiz-btn"
                      style={{
                        flex: 1, padding: '9px 12px', fontSize: 13,
                        background: cusType === t ? '#1f2937' : '#fafafa',
                        color: cusType === t ? '#fff' : '#374151',
                        border: `1px solid ${cusType === t ? '#1f2937' : '#d1d5db'}`,
                        borderRadius: 7,
                      }}
                    >
                      {t === 'company' ? '🏢 นิติบุคคล → COR-XXX' : '👤 บุคคลธรรมดา → IND-XXX'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wiz-field">
                <label className="wiz-label">ชื่อ{cusType === 'company' ? 'บริษัท' : ''} <span className="req">*</span></label>
                <input
                  className={`wiz-input ${errors.cusName ? 'error' : ''}`}
                  value={cusName}
                  onChange={e => { setCusName(e.target.value); setErrors(p => ({ ...p, cusName: '' })); }}
                  placeholder={cusType === 'company' ? 'บริษัท ... จำกัด' : 'ชื่อ-นามสกุล'}
                />
                {errors.cusName && <div className="wiz-error">{errors.cusName}</div>}
              </div>

              <div className="wiz-row">
                <div className="wiz-field">
                  <label className="wiz-label">เลขประจำตัวผู้เสียภาษี</label>
                  <input className="wiz-input" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="13 หลัก" maxLength={13} />
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">ประเภทธุรกิจ <span className="req">*</span></label>
                  <select className={`wiz-select ${errors.businessType ? 'error' : ''}`} value={businessType} onChange={e => { setBusinessType(e.target.value); setErrors(p => ({ ...p, businessType: '' })); }}>
                    <option value="">— เลือกประเภท —</option>
                    {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.businessType && <div className="wiz-error">{errors.businessType}</div>}
                </div>
              </div>

              {cusType === 'company' && (
                <div className="wiz-row">
                  <div className="wiz-field">
                    <label className="wiz-label">สาขา</label>
                    <select className="wiz-select" value={branchType} onChange={e => setBranchType(e.target.value as any)}>
                      <option value="-">— ไม่ระบุ</option>
                      <option value="HO">HO (สำนักงานใหญ่)</option>
                      <option value="BR">BR (สาขา)</option>
                    </select>
                  </div>
                  <div className="wiz-field">
                    <label className="wiz-label">เลขที่สาขา</label>
                    <input className="wiz-input" value={branchNo} onChange={e => setBranchNo(e.target.value)} placeholder="เช่น 00001" disabled={branchType === '-'} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: ที่อยู่ ─────────────────────────────────── */}
          {!saved && step === 2 && (
            <div className="wiz-body">
              {addresses.map((a, i) => (
                <div key={i} className="wiz-addr-card">
                  {i > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button className="wiz-remove-btn" onClick={() => setAddresses(p => p.filter((_, idx) => idx !== i))}>✕ ลบ</button>
                    </div>
                  )}

                  <div className="wiz-field">
                    <label className="wiz-label">บรรทัดที่ 1 <span className="req">*</span></label>
                    <input
                      className={`wiz-input ${errors[`addr_${i}`] ? 'error' : ''}`}
                      value={a.address_line1}
                      onChange={e => { updateAddr(i, 'address_line1', e.target.value); setErrors(p => ({ ...p, [`addr_${i}`]: '' })); }}
                      placeholder="บ้านเลขที่ ซอย ถนน..."
                    />
                    {errors[`addr_${i}`] && <div className="wiz-error">{errors[`addr_${i}`]}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label className="wiz-label">จังหวัด</label>
                      <select className="wiz-select" value={a.province} onChange={e => {
                        const pv = e.target.value;
                        setAddresses(prev => prev.map((x, idx) => idx === i ? { ...x, province: pv, district: '', sub_district: '', postal_code: '' } : x));
                      }}>
                        <option value="">— เลือก —</option>
                        {getProvinces().map(pv => <option key={pv} value={pv}>{pv}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="wiz-label">อำเภอ/เขต</label>
                      <select className="wiz-input" value={a.district} onChange={e => {
                        const v = e.target.value;
                        setAddresses(prev => prev.map((x, idx) => idx === i ? { ...x, district: v, sub_district: '', postal_code: '' } : x));
                      }}>
                        <option value="">-- เลือก --</option>
                        {getAmphoe(a.province).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="wiz-label">ตำบล/แขวง</label>
                      <select className="wiz-input" value={a.sub_district} onChange={e => {
                        const v = e.target.value;
                        const z = getZipcode(a.province, a.district, v);
                        setAddresses(prev => prev.map((x, idx) => idx === i ? { ...x, sub_district: v, postal_code: z || x.postal_code } : x));
                      }}>
                        <option value="">-- เลือก --</option>
                        {getTambon(a.province, a.district).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="wiz-label">รหัสไปรษณีย์</label>
                      <input className="wiz-input" value={a.postal_code} onChange={e => updateAddr(i, 'postal_code', e.target.value)} maxLength={5} placeholder="อัตโนมัติ" />
                    </div>
                  </div>

                  <div className="wiz-flag-checks" style={{ marginTop: 4 }}>
                    <label className="wiz-flag-check">
                      <input type="checkbox" checked={a.is_default} onChange={e => {
                        if (!e.target.checked) return;
                        setAddresses(prev => prev.map((x, idx) => ({ ...x, is_default: idx === i })));
                      }} />
                      ⭐ ตั้งเป็นหลัก
                    </label>
                    {([['use_for_invoice', 'ออกใบกำกับ'], ['use_for_shipping', 'จัดส่ง'], ['use_for_install', 'ติดตั้ง']] as const).map(([field, lbl]) => (
                      <label key={field} className="wiz-flag-check">
                        <input type="checkbox" checked={Boolean(a[field])} onChange={e => updateAddr(i, field, e.target.checked)} />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="wiz-add-btn" onClick={() => setAddresses(p => [...p, { ...emptyAddr(), is_default: false }])}>
                + เพิ่มที่อยู่อีก
              </button>
            </div>
          )}

          {/* ─── STEP 3: ผู้ติดต่อ ──────────────────────────────── */}
          {!saved && step === 3 && (
            <div className="wiz-body">
              {contacts.map((c, i) => (
                <div key={i} className="wiz-contact-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>
                      {c.is_primary ? '⭐ ผู้ติดต่อหลัก' : `ผู้ติดต่อ ${i + 1}`}
                    </div>
                    {i > 0 && (
                      <button className="wiz-remove-btn" onClick={() => setContacts(p => p.filter((_, idx) => idx !== i))}>✕ ลบ</button>
                    )}
                  </div>

                  <div className="wiz-row">
                    <div className="wiz-field">
                      <label className="wiz-label">ชื่อ-นามสกุล <span className="req">*</span></label>
                      <input
                        className={`wiz-input ${errors[`contact_${i}`] ? 'error' : ''}`}
                        value={c.full_name}
                        onChange={e => { updateContact(i, 'full_name', e.target.value); setErrors(p => ({ ...p, [`contact_${i}`]: '' })); }}
                        placeholder="ชื่อ นามสกุล"
                      />
                      {errors[`contact_${i}`] && <div className="wiz-error">{errors[`contact_${i}`]}</div>}
                    </div>
                    <div className="wiz-field">
                      <label className="wiz-label">อีเมล</label>
                      <input className="wiz-input" type="email" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} placeholder="email@example.com" />
                    </div>
                  </div>

                  <div className="wiz-row">
                    <div className="wiz-field">
                      <label className="wiz-label">เบอร์โทร 1</label>
                      <input className="wiz-input" value={c.phone1} onChange={e => updateContact(i, 'phone1', e.target.value)} placeholder="0xx-xxx-xxxx" />
                    </div>
                    <div className="wiz-field">
                      <label className="wiz-label">เบอร์โทร 2</label>
                      <input className="wiz-input" value={c.phone2} onChange={e => updateContact(i, 'phone2', e.target.value)} placeholder="ถ้ามี" />
                    </div>
                  </div>

                  <div className="wiz-field">
                    <label className="wiz-label">ตำแหน่ง / บทบาท</label>
                    <div className="wiz-checks">
                      {CONTACT_ROLES.map(role => (
                        <label key={role} className={`wiz-check-chip ${c.roles.includes(role) ? 'selected' : ''}`} onClick={() => toggleRole(i, role)}>
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="wiz-flag-check">
                    <input type="checkbox" checked={c.is_primary} onChange={e => {
                      if (!e.target.checked) return;
                      setContacts(prev => prev.map((x, idx) => ({ ...x, is_primary: idx === i })));
                    }} />
                    ⭐ ผู้ติดต่อหลัก
                  </label>
                </div>
              ))}
              <button className="wiz-add-btn" onClick={() => setContacts(p => [...p, { ...emptyContact(), is_primary: false }])}>
                + เพิ่มผู้ติดต่ออีก
              </button>
            </div>
          )}

          {/* ─── STEP 4: แหล่งที่มา + ตรวจสอบ ──────────────────── */}
          {!saved && step === 4 && (
            <div className="wiz-body">
              <div className="wiz-section">
                <div className="wiz-section-title">📡 แหล่งที่มา (เลือกได้หลายช่องทาง)</div>
                <div className="wiz-checks">
                  {SOURCE_OPTIONS.map(s => (
                    <label key={s} className={`wiz-check-chip ${sources.includes(s) ? 'selected' : ''}`} onClick={() => toggleSource(s)}>
                      {s}
                    </label>
                  ))}
                </div>
                {sources.includes('อื่นๆ') && (
                  <input
                    className="wiz-input"
                    style={{ marginTop: 8 }}
                    value={sourceOther}
                    onChange={e => setSourceOther(e.target.value)}
                    placeholder="ระบุแหล่งที่มาอื่น..."
                  />
                )}
              </div>

              {(sources.includes('ลูกค้าเก่าแนะนำ') || sources.includes('Sale')) && (
                <div className="wiz-section">
                  <div className="wiz-section-title">💰 ค่าคอมมิชชัน</div>
                  <div className="wiz-row">
                    <div className="wiz-field">
                      <label className="wiz-label">ประเภทค่าคอม</label>
                      <select className="wiz-select" value={commType} onChange={e => setCommType(e.target.value as any)}>
                        <option value="none">ไม่มี</option>
                        <option value="percent">% เปอร์เซ็นต์</option>
                        <option value="amount">฿ จำนวนเงิน</option>
                      </select>
                    </div>
                    {commType !== 'none' && (
                      <div className="wiz-field">
                        <label className="wiz-label">มูลค่า</label>
                        <input
                          className="wiz-input"
                          type="number"
                          value={commValue}
                          onChange={e => setCommValue(e.target.value)}
                          placeholder={commType === 'percent' ? '0-100' : 'จำนวนบาท'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="wiz-section">
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div className="wiz-section-title">💳 เงื่อนไขเครดิต</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      <label className="wiz-flag-check" style={{ fontSize: 14 }}>
                        <input type="radio" name="creditType" checked={Number(creditDay) === 0} onChange={() => setCreditDay('0')} />
                        เงินสด
                      </label>
                      <label className="wiz-flag-check" style={{ fontSize: 14 }}>
                        <input type="radio" name="creditType" checked={Number(creditDay) > 0} onChange={() => setCreditDay(creditDay === '0' ? '30' : creditDay)} />
                        เครดิต
                      </label>
                      {Number(creditDay) > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input className="wiz-input" type="number" min={1} value={creditDay} onChange={e => setCreditDay(e.target.value)} style={{ width: 80 }} />
                          <span style={{ fontSize: 13, color: '#6b7280' }}>วัน</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="wiz-section-title" style={{ fontSize: 12 }}>แนบเอกสาร ลูกค้า</div>
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        if (creditDocUrl) URL.revokeObjectURL(creditDocUrl);
                        setCreditDoc(f);
                        setCreditDocUrl(f ? URL.createObjectURL(f) : null);
                      }} />
                      {creditDocUrl && creditDoc?.type.startsWith('image/') ? (
                        <div style={{ position: 'relative' }}>
                          <img src={creditDocUrl} alt="preview" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e4e9', display: 'block' }} />
                          <button type="button" onClick={e => { e.preventDefault(); if (creditDocUrl) URL.revokeObjectURL(creditDocUrl); setCreditDoc(null); setCreditDocUrl(null); }}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0 }}>✕</button>
                        </div>
                      ) : creditDoc ? (
                        <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 20 }}>📄</div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, wordBreak: 'break-all' }}>{creditDoc.name}</div>
                        </div>
                      ) : (
                        <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: '5px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 14 }}>📷</div>
                          <div style={{ fontSize: 10, color: '#6b7280' }}>คลิกเพื่อเลือก</div>
                          <div style={{ fontSize: 9, color: '#9ca3af' }}>JPG, PNG, PDF</div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Review summary */}
              <div className="wiz-section">
                <div className="wiz-section-title">📝 หมายเหตุ / Note</div>
                <textarea
                  className="wiz-input"
                  rows={3}
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="บันทึกเพิ่มเติม..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="wiz-section">
                <div className="wiz-section-title">🔍 ตรวจสอบก่อนบันทึก</div>
                <div className="wiz-review-block">
                  <div className="wiz-review-row"><span className="lbl">ประเภท</span><span className="val">{cusType === 'company' ? '🏢 นิติบุคคล' : '👤 บุคคลธรรมดา'}</span></div>
                  <div className="wiz-review-row"><span className="lbl">ชื่อ</span><span className="val">{cusName || '—'}</span></div>
                  {taxId && <div className="wiz-review-row"><span className="lbl">เลขภาษี</span><span className="val">{taxId}</span></div>}
                  <div className="wiz-review-row"><span className="lbl">ประเภทธุรกิจ</span><span className="val">{businessType || '—'}</span></div>
                  <div className="wiz-review-row">
                    <span className="lbl">ที่อยู่</span>
                    <span className="val">{addresses[0]?.address_line1 || '—'}{addresses[0]?.province ? `, ${addresses[0].province}` : ''}</span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">ผู้ติดต่อ {contacts.length} คน</span>
                    <span className="val">{contacts[0]?.full_name || '—'} {contacts[0]?.phone1 ? `· 📞 ${contacts[0].phone1}` : ''}</span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">แหล่งที่มา</span>
                    <span className="val">{sources.length ? sources.join(', ') : '—'}</span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">เงื่อนไข</span>
                    <span className="val">{Number(creditDay) > 0 ? `เครดิต ${creditDay} วัน` : 'เงินสด'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer nav */}
          {!saved && (
            <div className="wiz-footer">
              {step > 1 ? (
                <button className="wiz-btn wiz-btn-back" onClick={() => setStep(s => s - 1)}>← ย้อน</button>
              ) : (
                <button className="wiz-btn wiz-btn-back" onClick={() => router.push('/customers')}>← รายการลูกค้า</button>
              )}
              {step < 4 ? (
                <button className="wiz-btn wiz-btn-next" onClick={goNext}>ขั้นต่อ →</button>
              ) : (
                <button className="wiz-btn wiz-btn-save" onClick={save} disabled={saving}>
                  {saving ? '⏳ กำลังบันทึก...' : '✓ บันทึกลูกค้า'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
