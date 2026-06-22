'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProvinces, getAmphoe, getTambon, getZipcode } from '@/lib/thai-address';

type SupContact = { full_name: string; email: string; phone1: string; phone2: string; roles: string[]; is_primary: boolean };
const emptyContact = (): SupContact => ({ full_name: '', email: '', phone1: '', phone2: '', roles: [], is_primary: true });
const CONTACT_ROLES = ['ผู้ซื้อ', 'บัญชี', 'โปรเจกต์', 'ติดต่อหลัก'];

const CATEGORIES = ['ช่างม่าน', 'ช่างติดตั้ง', 'ผ้าม่าน / ผ้า', 'อุปกรณ์ม่าน', 'กระจก / กรอบ', 'เฟอร์นิเจอร์', 'อื่นๆ'];
const PARTNER_TYPES = ['ช่างม่าน', 'ช่างติดตั้ง', 'ผู้จัดหาผ้า', 'จำนายกระจก', 'ลามิเนต', 'อินเตอร์เน็ต', 'ผู้รับเหมาก่อสร้าง', 'บริษัทบัญชี', 'ค่าจัดส่ง', 'อื่นๆ'];
const PAYMENT_TERMS = ['เงินสด / เงินโอน', 'เครดิต'];
const WITHHOLDING = [
  { v: 'ไม่หัก', l: 'ไม่หัก' },
  { v: '1', l: 'หัก 1%' },
  { v: '1.5', l: 'หัก 1.5%' },
  { v: '2', l: 'หัก 2%' },
  { v: '3', l: 'หัก 3%' },
  { v: '3ครั้งเดียว', l: '3% ออกให้ครั้งเดียว' },
  { v: '3ตลอดไป', l: '3% ออกให้ตลอดไป' },
  { v: '5', l: 'หัก 5%' },
  { v: '10', l: 'หัก 10%' },
  { v: '20', l: 'หัก 20%' },
];

const CSS = `
.wiz-root{min-height:100vh;background:#f0f1f3;font-family:'Sarabun',sans-serif;font-size:15px;padding:32px 20px 80px}
.wiz-root *{box-sizing:border-box}
.wiz-card{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e4e9;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07)}
.wiz-header{background:linear-gradient(135deg,#1a1d23,#2d3139);padding:24px 28px;color:#fff}
.wiz-header h1{font-size:20px;font-weight:700;margin:0 0 4px;letter-spacing:.01em}
.wiz-header p{font-size:13px;opacity:.6;margin:0}
.wiz-steps{display:flex;padding:0 20px;background:#fafafa;border-bottom:1px solid #e8eaed;overflow-x:auto}
.wiz-step{
  padding:14px 14px;font-size:12px;font-weight:600;color:#9ca3af;
  border-bottom:2px solid transparent;cursor:default;white-space:nowrap;flex-shrink:0;
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
.wiz-row-21{display:grid;grid-template-columns:2fr 1fr;gap:14px}
.wiz-row3{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:12px}
.wiz-row-3eq{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.wiz-row4{display:grid;grid-template-columns:1fr 1fr 1fr 0.8fr;gap:10px}
.wiz-info{background:#f0f1f3;border-left:3px solid #374151;border-radius:0 8px 8px 0;padding:10px 14px;font-size:13px;color:#374151;margin-bottom:14px}
.wiz-section{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f0f1f3}
.wiz-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.wiz-section-title{font-weight:700;font-size:14px;color:#374151;margin-bottom:12px}
.wiz-type-btn{
  flex:1;padding:10px 12px;font-size:13px;border-radius:8px;border:1px solid #d1d5db;
  cursor:pointer;font-family:inherit;font-weight:600;transition:all .15s;background:#fafafa;color:#374151;
}
.wiz-type-btn.active{background:#1f2937;color:#fff;border-color:#1f2937}
.wiz-checks{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.wiz-check-chip{
  display:flex;align-items:center;gap:6px;
  background:#fafafa;border:1px solid #e2e4e9;border-radius:8px;
  padding:5px 12px;cursor:pointer;font-size:13px;transition:all .15s;
}
.wiz-check-chip.selected{background:#1f2937;border-color:#1f2937;color:#fff;font-weight:600}
.wiz-check-chip:not(.selected):hover{background:#f0f1f3;border-color:#c4c8d0}
.wiz-review-block{
  background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;
  padding:14px 16px;margin-bottom:12px;
}
.wiz-review-row{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #f0f1f3;font-size:13.5px}
.wiz-review-row:last-child{border-bottom:none}
.wiz-review-row .lbl{color:#9ca3af;width:140px;flex-shrink:0;font-size:13px}
.wiz-review-row .val{color:#111827;font-weight:500;flex:1}
.wiz-footer{
  display:flex;justify-content:space-between;align-items:center;
  padding:18px 28px;background:#fafafa;border-top:1px solid #e8eaed;
}
.wiz-btn{border:none;border-radius:8px;padding:10px 22px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;}
.wiz-btn-back{background:#fff;border:1px solid #e2e4e9;color:#374151}
.wiz-btn-back:hover{background:#f0f1f3;border-color:#c4c8d0}
.wiz-btn-next{background:#1f2937;color:#fff}
.wiz-btn-next:hover{background:#111827}
.wiz-btn-save{background:#166534;color:#fff}
.wiz-btn-save:hover{background:#14532d}
.wiz-btn-next:disabled,.wiz-btn-save:disabled{opacity:.4;cursor:not-allowed}
.wiz-error{color:#c0392b;font-size:12px;margin-top:4px}
.wiz-info-row{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#f0f1f3;border-left:3px solid #374151;border-radius:0 8px 8px 0;padding:8px 14px;margin-bottom:14px}
.wiz-info-row span{font-size:13px;color:#374151;flex:1}
.wiz-info-row .wiz-input{width:130px;margin:0;flex-shrink:0}
.wiz-branch{display:flex;gap:8px;align-items:flex-end}
.wiz-branch-main{flex:1;min-width:0}
.wiz-branch-no{width:130px;flex-shrink:0}
.wiz-contact-card{background:#fafafa;border:1px solid #e2e4e9;border-radius:10px;padding:14px;margin-bottom:10px}
.wiz-add-btn{border:1.5px dashed #c4c8d0;background:transparent;color:#6b7280;border-radius:10px;padding:8px 14px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:inherit;width:100%;justify-content:center;transition:all .15s}
.wiz-add-btn:hover{background:#f0f1f3;border-color:#9ca3af;color:#374151}
.wiz-remove-btn{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:14px;padding:0 4px;line-height:1}
.wiz-remove-btn:hover{color:#c0392b}
.wiz-success{text-align:center;padding:48px 28px;}
.wiz-success .icon{font-size:56px;margin-bottom:16px}
.wiz-success h2{font-size:22px;font-weight:700;color:#166534;margin-bottom:8px}
.wiz-success p{color:#6b7280;font-size:14px}
`;

export default function NewSupplierPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ id: number; sup_code: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: ข้อมูลหลัก
  const [supType, setSupType] = useState<'individual' | 'company'>('individual');
  const [supName, setSupName] = useState('');
  const [nickname, setNickname] = useState('');
  const [supCode, setSupCode] = useState('');
  const [category, setCategory] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branchType, setBranchType] = useState<'HO' | 'BR' | '-'>('-');
  const [branchNo, setBranchNo] = useState('');

  // Step 2: ที่อยู่
  const [addressLine1, setAddressLine1] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: ผู้ติดต่อ + เงื่อนไขชำระ
  const [contacts, setContacts] = useState<SupContact[]>([emptyContact()]);
  const [paymentTerm, setPaymentTerm] = useState('เงินสด / เงินโอน');
  const [creditDay, setCreditDay] = useState('0');
  const [withholdingTax, setWithholdingTax] = useState('3');

  const updateContact = (i: number, field: keyof SupContact, val: string | boolean) =>
    setContacts(p => p.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const toggleRole = (i: number, role: string) =>
    setContacts(p => p.map((c, idx) => idx === i ? { ...c, roles: c.roles.includes(role) ? c.roles.filter(r => r !== role) : [...c.roles, role] } : c));

  // Step 4: ประเภทคู่ค้า + ตรวจสอบ
  const [partnerType, setPartnerType] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [supDoc, setSupDoc] = useState<File | null>(null);
  const [supDocUrl, setSupDocUrl] = useState<string | null>(null);

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!supName.trim()) e.supName = 'กรุณาระบุชื่อผู้ขาย / ผู้รับเหมา';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validate1()) return;
    setStep(s => s + 1);
  };

  const save = async () => {
    setSaving(true);
    try {
      const primary = contacts[0];
      const body = {
        sup_code: supCode.trim() || undefined,
        sup_type: supType,
        sup_name: supName.trim(),
        nickname: nickname.trim() || null,
        tax_id: taxId.trim() || null,
        branch_type: branchType,
        branch_no: branchNo.trim() || null,
        category: category || '',
        address_line1: addressLine1.trim() || null,
        sub_district: subDistrict.trim() || null,
        district: district.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        contact_name: primary?.full_name.trim() || null,
        contact_phone: primary?.phone1.trim() || null,
        contact_phone2: primary?.phone2.trim() || null,
        payment_term: paymentTerm,
        credit_day: Number(creditDay),
        withholding_tax: withholdingTax,
        partner_type: partnerType.trim() || null,
        note: note.trim() || null,
        status,
      };
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      // Save extra contacts
      for (let i = 1; i < contacts.length; i++) {
        const c = contacts[i];
        if (!c.full_name.trim()) continue;
        await fetch(`/api/suppliers/${data.id}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...c, is_primary: false, display_order: i }),
        });
      }
      setSaved({ id: data.id, sup_code: data.sup_code });
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const STEPS = ['ข้อมูลหลัก', 'ที่อยู่', 'ผู้ติดต่อ + ชำระเงิน', 'ตรวจสอบ + บันทึก'];

  return (
    <>
      <style>{CSS}</style>
      <div className="wiz-root">
        <div className="wiz-card">
          <div className="wiz-header">
            <h1>เพิ่มผู้ขาย / ผู้รับเหมาใหม่</h1>
            <p>กรอกข้อมูลตามขั้นตอน (Wizard {STEPS.length} ขั้น)</p>
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
                <h2>บันทึกข้อมูลสำเร็จ!</h2>
                <p>รหัสผู้ขาย: <strong style={{ color: '#1f2937' }}>{saved.sup_code}</strong></p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                  <button className="wiz-btn wiz-btn-next" onClick={() => router.push('/admin/purchase/suppliers/new')}>
                    + เพิ่มผู้ขายอีก
                  </button>
                  <button className="wiz-btn wiz-btn-back" onClick={() => router.push('/admin/purchase/suppliers')}>
                    📋 รายการผู้ขาย
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 1: ข้อมูลหลัก ──────────────────────────────── */}
          {!saved && step === 1 && (
            <div className="wiz-body">
              <div className="wiz-info-row">
                <span>รหัสผู้ขาย (V0001...) จะถูกสร้างอัตโนมัติถ้าไม่ระบุ</span>
                <input className="wiz-input" value={supCode} onChange={e => setSupCode(e.target.value)} placeholder="V0001 / S0001" title="รหัสผู้ขาย" />
              </div>

              {/* ประเภท */}
              <div className="wiz-field">
                <label className="wiz-label">ประเภทผู้ขาย / ผู้รับจ้าง <span className="req">*</span></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['individual', 'company'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`wiz-type-btn ${supType === t ? 'active' : ''}`}
                      onClick={() => { setSupType(t); if (t === 'individual') setBranchType('-'); }}
                    >
                      {t === 'individual' ? '👤 บุคคลธรรมดา' : '🏢 นิติบุคคล'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ชื่อ + หมวดหมู่ */}
              <div className="wiz-row-21">
                <div className="wiz-field">
                  <label className="wiz-label">ชื่อผู้ขาย / ผู้รับจ้าง <span className="req">*</span></label>
                  <input
                    className={`wiz-input ${errors.supName ? 'error' : ''}`}
                    value={supName}
                    onChange={e => { setSupName(e.target.value); setErrors(p => ({ ...p, supName: '' })); }}
                    placeholder={supType === 'company' ? 'บริษัท ... จำกัด' : 'ชื่อ นามสกุล'}
                  />
                  {errors.supName && <div className="wiz-error">{errors.supName}</div>}
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">หมวดหมู่</label>
                  <input
                    className="wiz-input"
                    list="cat-list"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="เลือกหรือพิมพ์..."
                  />
                  <datalist id="cat-list">
                    {CATEGORIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* เลขภาษี + สาขา + เลขที่สาขา */}
              <div className="wiz-row-3eq">
                <div className="wiz-field">
                  <label className="wiz-label">เลขประจำตัวผู้เสียภาษี</label>
                  <input className="wiz-input" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="13 หลัก" maxLength={13} />
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">สาขา</label>
                  <select className="wiz-select" title="สาขา" value={branchType} onChange={e => { setBranchType(e.target.value as any); if (e.target.value !== 'BR') setBranchNo(''); }}>
                    <option value="-">— ไม่ระบุ</option>
                    <option value="HO">HO — สำนักงานใหญ่</option>
                    <option value="BR">BR — สาขา</option>
                  </select>
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">เลขที่สาขา</label>
                  <input className="wiz-input" value={branchNo} onChange={e => setBranchNo(e.target.value)} placeholder="เช่น 00001" disabled={branchType !== 'BR'} title="เลขที่สาขา" />
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: ที่อยู่ ─────────────────────────────────── */}
          {!saved && step === 2 && (
            <div className="wiz-body">
              <div className="wiz-info">ข้ามได้ถ้าไม่มีที่อยู่ในระบบ</div>

              <div className="wiz-field">
                <label className="wiz-label">บรรทัดที่อยู่</label>
                <input
                  className="wiz-input"
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="บ้านเลขที่ ซอย ถนน หมู่..."
                />
              </div>

              <div className="wiz-row4">
                <div className="wiz-field">
                  <label className="wiz-label">จังหวัด</label>
                  <select className="wiz-select" title="จังหวัด" value={province} onChange={e => {
                    setProvince(e.target.value);
                    setDistrict('');
                    setSubDistrict('');
                    setPostalCode('');
                  }}>
                    <option value="">— เลือก —</option>
                    {getProvinces().map(pv => <option key={pv} value={pv}>{pv}</option>)}
                  </select>
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">อำเภอ / เขต</label>
                  <select className="wiz-select" title="อำเภอ/เขต" value={district} onChange={e => {
                    setDistrict(e.target.value);
                    setSubDistrict('');
                    setPostalCode('');
                  }}>
                    <option value="">— เลือก —</option>
                    {getAmphoe(province).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">ตำบล / แขวง</label>
                  <select className="wiz-select" title="ตำบล/แขวง" value={subDistrict} onChange={e => {
                    const v = e.target.value;
                    setSubDistrict(v);
                    const z = getZipcode(province, district, v);
                    if (z) setPostalCode(z);
                  }}>
                    <option value="">— เลือก —</option>
                    {getTambon(province, district).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="wiz-field">
                  <label className="wiz-label">รหัสไปรษณีย์</label>
                  <input className="wiz-input" value={postalCode} onChange={e => setPostalCode(e.target.value)} maxLength={5} placeholder="อัตโนมัติ" />
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: ผู้ติดต่อ + เงื่อนไขการชำระเงิน ────────── */}
          {!saved && step === 3 && (
            <div className="wiz-body">
              {contacts.map((c, i) => (
                <div key={i} className="wiz-contact-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>
                      {i === 0 ? '⭐ ผู้ติดต่อหลัก' : `ผู้ติดต่อ ${i + 1}`}
                    </div>
                    {i > 0 && (
                      <button type="button" className="wiz-remove-btn" onClick={() => setContacts(p => p.filter((_, idx) => idx !== i))}>✕ ลบ</button>
                    )}
                  </div>
                  <div className="wiz-row">
                    <div className="wiz-field">
                      <label className="wiz-label">ชื่อ-นามสกุล</label>
                      <input className="wiz-input" value={c.full_name} onChange={e => updateContact(i, 'full_name', e.target.value)} placeholder="คุณ..." />
                    </div>
                    <div className="wiz-field">
                      <label className="wiz-label">อีเมล</label>
                      <input className="wiz-input" type="email" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="wiz-row">
                    <div className="wiz-field">
                      <label className="wiz-label">เบอร์โทร 1</label>
                      <input className="wiz-input" value={c.phone1} onChange={e => updateContact(i, 'phone1', e.target.value)} placeholder="08x-xxx-xxxx" />
                    </div>
                    <div className="wiz-field">
                      <label className="wiz-label">เบอร์โทร 2 (สำรอง)</label>
                      <input className="wiz-input" value={c.phone2} onChange={e => updateContact(i, 'phone2', e.target.value)} placeholder="ถ้ามี..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label className="wiz-label">ตำแหน่ง / บทบาท</label>
                      <div className="wiz-checks">
                        {CONTACT_ROLES.map(role => (
                          <label key={role} className={`wiz-check-chip ${c.roles.includes(role) ? 'selected' : ''}`} onClick={() => toggleRole(i, role)}>
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>
                    {i === 0 && (
                      <div style={{ flexShrink: 0 }}>
                        <label className="wiz-label" style={{ whiteSpace: 'nowrap' }}>💳 หัก ณ ที่จ่าย</label>
                        <select title="หัก ณ ที่จ่าย" className="wiz-select" style={{ width: 200 }} value={withholdingTax} onChange={e => setWithholdingTax(e.target.value)}>
                          <option value="">— เลือก —</option>
                          {WITHHOLDING.map(w => <option key={w.v} value={w.v}>{w.l}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="wiz-add-btn" onClick={() => setContacts(p => [...p, emptyContact()])}>
                + เพิ่มผู้ติดต่ออีก
              </button>
            </div>
          )}

          {/* ─── STEP 4: ตรวจสอบ + บันทึก ───────────────────────────── */}
          {!saved && step === 4 && (
            <div className="wiz-body">
              <div className="wiz-section">
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div className="wiz-section-title">💳 TERM การชำระ</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PAYMENT_TERMS.map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`wiz-check-chip ${paymentTerm === t ? 'selected' : ''}`}
                          onClick={() => { setPaymentTerm(t); if (t !== 'เครดิต') setCreditDay('0'); }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {paymentTerm === 'เครดิต' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <input className="wiz-input" type="number" min={1} value={creditDay} onChange={e => setCreditDay(e.target.value)} style={{ width: 90 }} title="จำนวนวันเครดิต" />
                        <span style={{ fontSize: 13, color: '#6b7280' }}>วัน</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="wiz-section-title" style={{ fontSize: 12 }}>แนบเอกสาร ผู้ขาย</div>
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        if (supDocUrl) URL.revokeObjectURL(supDocUrl);
                        setSupDoc(f);
                        setSupDocUrl(f ? URL.createObjectURL(f) : null);
                      }} />
                      {supDocUrl && supDoc?.type.startsWith('image/') ? (
                        <div style={{ position: 'relative' }}>
                          <img src={supDocUrl} alt="preview" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e4e9', display: 'block' }} />
                          <button type="button" onClick={e => { e.preventDefault(); if (supDocUrl) URL.revokeObjectURL(supDocUrl); setSupDoc(null); setSupDocUrl(null); }}
                            style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', borderRadius: 4, width: 20, height: 20, cursor: 'pointer', fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0 }}>✕</button>
                        </div>
                      ) : supDoc ? (
                        <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: '12px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 20 }}>📄</div>
                          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, wordBreak: 'break-all' }}>{supDoc.name}</div>
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

              <div className="wiz-section">
                <div className="wiz-section-title">📝 หมายเหตุ / Note</div>
                <div className="wiz-field">
                  <textarea
                    className="wiz-input"
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="บันทึกเพิ่มเติม..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="wiz-section">
                <div className="wiz-section-title">🔍 ตรวจสอบก่อนบันทึก</div>
                <div className="wiz-review-block">
                  <div className="wiz-review-row">
                    <span className="lbl">ประเภท</span>
                    <span className="val">{supType === 'company' ? '🏢 นิติบุคคล' : '👤 บุคคลธรรมดา'}</span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">ชื่อ</span>
                    <span className="val">{supName || '—'}{nickname ? ` (${nickname})` : ''}</span>
                  </div>
                  {supCode && (
                    <div className="wiz-review-row">
                      <span className="lbl">รหัส</span>
                      <span className="val">{supCode}</span>
                    </div>
                  )}
                  {taxId && (
                    <div className="wiz-review-row">
                      <span className="lbl">เลขภาษี</span>
                      <span className="val">{taxId}</span>
                    </div>
                  )}
                  {category && (
                    <div className="wiz-review-row">
                      <span className="lbl">หมวดหมู่</span>
                      <span className="val">{category}</span>
                    </div>
                  )}
                  {supType === 'company' && branchType !== '-' && (
                    <div className="wiz-review-row">
                      <span className="lbl">สาขา</span>
                      <span className="val">{branchType === 'HO' ? 'สำนักงานใหญ่' : `สาขา ${branchNo}`}</span>
                    </div>
                  )}
                  <div className="wiz-review-row">
                    <span className="lbl">ที่อยู่</span>
                    <span className="val">
                      {[addressLine1, subDistrict && `ต.${subDistrict}`, district && `อ.${district}`, province, postalCode].filter(Boolean).join(' ') || '—'}
                    </span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">ผู้ติดต่อ</span>
                    <span className="val">
                      {contacts[0]?.full_name || '—'}{contacts[0]?.phone1 ? ` · 📞 ${contacts[0].phone1}` : ''}{contacts[0]?.phone2 ? ` · ${contacts[0].phone2}` : ''}{contacts.length > 1 ? ` (+${contacts.length - 1})` : ''}
                    </span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">TERM ชำระ</span>
                    <span className="val">{paymentTerm}{paymentTerm === 'เครดิต' && creditDay !== '0' ? ` ${creditDay} วัน` : ''}</span>
                  </div>
                  <div className="wiz-review-row">
                    <span className="lbl">หัก ณ ที่จ่าย</span>
                    <span className="val">{WITHHOLDING.find(w => w.v === withholdingTax)?.l || withholdingTax || '—'}</span>
                  </div>
                  {partnerType && (
                    <div className="wiz-review-row">
                      <span className="lbl">ประเภทคู่ค้า</span>
                      <span className="val">{partnerType}</span>
                    </div>
                  )}
                  <div className="wiz-review-row">
                    <span className="lbl">สถานะ</span>
                    <span className="val">{status === 'active' ? '✅ ใช้งาน' : '⏸️ ไม่ใช้งาน'}</span>
                  </div>
                  {note && (
                    <div className="wiz-review-row">
                      <span className="lbl">หมายเหตุ</span>
                      <span className="val">{note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {!saved && (
            <div className="wiz-footer">
              {step > 1 ? (
                <button className="wiz-btn wiz-btn-back" onClick={() => setStep(s => s - 1)}>← ย้อน</button>
              ) : (
                <button className="wiz-btn wiz-btn-back" onClick={() => router.push('/admin/purchase/suppliers')}>← รายการผู้ขาย</button>
              )}
              {step < STEPS.length ? (
                <button className="wiz-btn wiz-btn-next" onClick={goNext}>ขั้นต่อ →</button>
              ) : (
                <button className="wiz-btn wiz-btn-save" onClick={save} disabled={saving}>
                  {saving ? '⏳ กำลังบันทึก...' : '✓ บันทึกผู้ขาย'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
