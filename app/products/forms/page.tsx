'use client';

/* ------------------------------------------------------------------ *
 *  Product Forms — faithful build of Mockup-Product-Forms.html         *
 *  8 category tabs (ผ้า / ราง / มอเตอร์ / มู่ลี่ไม้ / มู่ลี่อลู /        *
 *  ม่านม้วน / มุ้งจีบ / รีโมท-สวิทช์) · LinSiLin design system          *
 * ------------------------------------------------------------------ */

import Link from 'next/link';
import { useState } from 'react';

type FieldType = 'text' | 'number' | 'select' | 'toggle' | 'checks' | 'upload';
interface Field {
  l: string;
  t: FieldType;
  o?: string[];      // options (select / toggle / checks)
  unit?: string;     // suffix for number
  v?: string;        // default value
  req?: boolean;
}
interface ValidationBox {
  title: string;
  fields: { l: string; unit?: string; v?: string }[];
  color: 'red' | 'amber' | 'green';
}
interface Tab {
  key: string;
  label: string;
  icon: string;
  grad: string;
  fg: string;
  iconFg: string;
  sub: string;
  suppliers: string[];
  code: string;
  name: string;
  fields: Field[];
  priceUnit: string;
  price: string;
  cost: string;
  validate?: ValidationBox;
}

const TABS: Tab[] = [
  {
    key: 'fabric', label: '🧵 ผ้าทึบ-โปร่ง-ซับBack-ซับหลัง', icon: '🧵',
    grad: 'linear-gradient(135deg,#f0f1f3 0%,#e2e4e9 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Fabric · ผ้าม่านทึบ / โปร่ง / Backout / ซับหลัง · หน่วยเป็นหลา',
    suppliers: ['SMILE Design', 'EXW Thailand'],
    code: 'F-CR-102', name: 'ผ้า Sevilla Cream 102',
    fields: [
      { l: 'ประเภทผ้า', t: 'select', o: ['ทึบ', 'โปร่ง', 'Backout', 'ซับหลัง'], req: true },
      { l: 'หน้ากว้างผ้า (P)', t: 'number', unit: 'm', v: '0' },
      { l: 'ขั้นต่ำสั่งซื้อ', t: 'number', unit: 'หลา', v: '0' },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/หลา', price: '0', cost: '0',
  },
  {
    key: 'rail-motor', label: '⚙️ รางม่าน (มอร์เตอร์)', icon: '⚙️',
    grad: 'linear-gradient(135deg,#e2e4e9 0%,#d1d5db 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Rail Motor · รางม่านมอเตอร์ · หน่วยเป็นเมตร',
    suppliers: ['SOMFY Thailand', 'Decorail Co.'],
    code: 'R-RG101-WH-MOT', name: 'รางจีบ RG-101 สีขาว มอเตอร์',
    fields: [
      { l: 'ประเภทราง', t: 'select', o: ['รางม่านจีบ-มอร์เตอร์', 'รางม่านลอน-มอร์เตอร์', 'รางลอน-กระดุม-มอร์เตอร์'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['ขาว', 'ดำ', 'เงิน', 'เทา', 'กำหนดเอง...'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/เมตร', price: '0', cost: '0',
  },
  {
    key: 'rail-manual', label: '📦 รางม่าน (แมนนวล)', icon: '📦',
    grad: 'linear-gradient(135deg,#d1d5db 0%,#c0c5cc 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Rail Manual · รางม่านแมนนวล · หน่วยเป็นเมตร',
    suppliers: ['SOMFY Thailand', 'Decorail Co.'],
    code: 'R-RG101-WH-MAN', name: 'รางจีบ RG-101 สีขาว แมนนวล',
    fields: [
      { l: 'ประเภทราง', t: 'select', o: ['รางม่านจีบ', 'รางม่านลอน', 'รางลอน-กระดุม'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['ขาว', 'ดำ', 'เงิน', 'เทา', 'กำหนดเอง...'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/เมตร', price: '0', cost: '0',
    validate: {
      title: '📏 ระยะกว้างที่ใช้ได้', color: 'amber',
      fields: [{ l: 'Min กว้าง', unit: 'm', v: '3.00' }, { l: 'Max กว้าง', unit: 'm', v: '3.99' }],
    },
  },
  {
    key: 'slat', label: '▤ มู่ลี่ไม้', icon: '▤',
    grad: 'linear-gradient(135deg,#c0c5cc 0%,#adb3bc 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Wood Blinds · Bundle ครบชุด · หน่วยเป็น SQM',
    suppliers: ['Hunter Douglas TH', 'Wooden Blinds Co.'],
    code: 'S-WD-35-OAK', name: 'มู่ลี่ไม้ 35mm สีโอ๊ค',
    fields: [
      { l: 'ขนาดใบ', t: 'select', o: ['25 mm', '35 mm', '50 mm'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['โอ๊ค', 'วอลนัท', 'มะฮอกกานี', 'สีขาว', 'สีดำ'] },
      { l: 'มอเตอร์', t: 'checks', o: ['ใส่มอเตอร์ได้ (ใบ ≥ 35mm)'] },
      { l: 'ขั้นต่ำสั่งซื้อ', t: 'number', unit: 'SQM', v: '0' },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/SQM', price: '0', cost: '0',
    validate: {
      title: '⚠️ ข้อจำกัด (Validation)', color: 'red',
      fields: [{ l: 'ความกว้างสูงสุด (Max W)', unit: 'm', v: '2.40' }, { l: 'ความสูงสูงสุด เมนนวล', unit: 'm', v: '3.30' }],
    },
  },
  {
    key: 'roller', label: '📜 ม่านม้วน', icon: '📜',
    grad: 'linear-gradient(135deg,#adb3bc 0%,#9ba2ac 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Roller Curtain · Sunscreen / Blackout · Bundle · SQM',
    suppliers: ['Decorail TH', 'Roller Blinds Pro'],
    code: 'RL-SS3-WH', name: 'ม่านม้วน Sunscreen 3% สีขาว',
    fields: [
      { l: 'ประเภทผ้า', t: 'select', o: ['Sunscreen 1%', 'Sunscreen 3%', 'Sunscreen 5%', 'Blackout'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['ขาว', 'ดำ', 'เทา', 'กำหนดเอง...'] },
      { l: 'มอเตอร์', t: 'checks', o: ['ใส่มอเตอร์ได้ (มี option ระบบ RTS/WT)'] },
      { l: 'ขั้นต่ำสั่งซื้อ', t: 'number', unit: 'SQM', v: '0' },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/SQM', price: '0', cost: '0',
  },
  {
    key: 'motor', label: '⚙️ มอเตอร์ (มูลี่ไม้-ม่านม้วน)', icon: '⚙️',
    grad: 'linear-gradient(135deg,#9ba2ac 0%,#8a9199 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Motor · มอเตอร์มู่ลี่ไม้ / ม่านม้วน · หน่วยเป็นตัว',
    suppliers: ['SOMFY Thailand', 'Beyond Mosquito'],
    code: 'M-SOMFY-IP35-RTS', name: 'IRISMO PLUS 35KG',
    fields: [
      { l: 'ใช้กับ', t: 'select', o: ['มู่ลี่ไม้', 'มู่ลี่อลูมิเนียม', 'ม่านม้วน'], req: true },
      { l: 'ระบบ', t: 'toggle', o: ['RTS', 'WT'], req: true },
      { l: 'รูปสินค้า', t: 'upload' },
      { l: 'รีโมท / สวิตช์ที่รองรับ', t: 'checks', o: ['Somfy RTS Remote 1-ch', 'Somfy RTS Remote 4-ch', 'Somfy Smoove WT Switch'] },
    ],
    priceUnit: '฿/ตัว', price: '0', cost: '0',
  },
  {
    key: 'aluminum', label: '▧ มู่ลี่อลูมิเนียม', icon: '▧',
    grad: 'linear-gradient(135deg,#8a9199 0%,#797f88 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Aluminum Blinds · Bundle ครบชุด · หน่วยเป็น SQM',
    suppliers: ['Hunter Douglas TH', 'Aluminum Blinds Co.'],
    code: 'S-AL-35-SLV', name: 'ใบมู่ลี่อลู 35mm สีเงิน',
    fields: [
      { l: 'ขนาดใบ', t: 'select', o: ['25 mm', '35 mm', '50 mm'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['เงิน', 'ขาว', 'ดำ', 'สีเฉพาะกำหนดเอง', 'กำหนดเอง...'] },
      { l: 'มอเตอร์', t: 'checks', o: ['ใส่มอเตอร์ได้ (ใบ ≥ 35mm)'] },
      { l: 'ขั้นต่ำสั่งซื้อ', t: 'number', unit: 'SQM', v: '0' },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/SQM', price: '0', cost: '0',
    validate: {
      title: '⚠️ ข้อจำกัด (Validation)', color: 'red',
      fields: [{ l: 'ความกว้างสูงสุด (Max W)', unit: 'm', v: '2.40' }, { l: 'ความสูงสูงสุด เมนนวล', unit: 'm', v: '3.30' }],
    },
  },
  {
    key: 'mosquito', label: '▩ มุ้งจีบ', icon: '▩',
    grad: 'linear-gradient(135deg,#797f88 0%,#686e77 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Pleated Mosquito Net · Bundle ครบชุด · SQM',
    suppliers: ['Beyond Mosquito'],
    code: 'MJ-25-BK-2P', name: 'มุ้งจีบ ราง 2.5 บานคู่ สีดำ',
    fields: [
      { l: 'ประเภทบาน', t: 'select', o: ['ประตู', 'หน้าต่าง'], req: true },
      { l: 'สีอุปกรณ์', t: 'select', o: ['ดำ', 'ขาว', 'เงิน', 'กำหนดเอง...'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/SQM', price: '0', cost: '0',
    validate: {
      title: '⚠️ ข้อจำกัด (Validation)', color: 'red',
      fields: [{ l: 'Max W', unit: 'm', v: '2.50' }, { l: 'Max H', unit: 'm', v: '3.00' }],
    },
  },
  {
    key: 'remote', label: '📡 สวิตช์ + รีโมท', icon: '📡',
    grad: 'linear-gradient(135deg,#686e77 0%,#575d67 100%)', fg: '#1f2937', iconFg: '#374151',
    sub: 'Remote & Switch · อุปกรณ์ควบคุมมอเตอร์',
    suppliers: ['SOMFY Thailand'],
    code: 'RM-SOMFY-4CH', name: 'SOMFY Telis 4 Channels',
    fields: [
      { l: 'ประเภทควบคุม', t: 'toggle', o: ['📞 รีโมท (RTS)', '📟 สวิตช์ (WT)'], req: true },
      { l: 'จำนวนช่อง (รีโมท)', t: 'select', o: ['1 ช่อง', '4 ช่อง', '8 ช่อง+'] },
      { l: 'สีอุปกรณ์', t: 'select', o: ['ขาว', 'ดำ', 'เงิน'] },
      { l: 'รูปสินค้า', t: 'upload' },
      { l: 'มอเตอร์ที่รองรับ', t: 'checks', o: ['Somfy IRISMO PLUS 35KG', 'Somfy IRISMO 25KG', 'Somfy IRISMO 45KG'] },
    ],
    priceUnit: '฿/ตัว', price: '0', cost: '0',
  },
  {
    key: 'hook', label: '🔗 ตะขอสายรวมม่าน', icon: '🔗',
    grad: 'linear-gradient(135deg,#575d67 0%,#464c56 100%)', fg: '#f9fafb', iconFg: '#e5e7eb',
    sub: 'Hook & Tie · ตะขอ / สายรวมม่าน · หน่วยเป็นชิ้น',
    suppliers: ['Decorail Co.'],
    code: 'HK-001', name: 'ตะขอรวมม่านสีโครม',
    fields: [
      { l: 'สีอุปกรณ์', t: 'select', o: ['โครม', 'ทอง', 'ดำ', 'ขาว'] },
      { l: 'ขนาด', t: 'select', o: ['เล็ก', 'กลาง', 'ใหญ่'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/ชิ้น', price: '0', cost: '0',
  },
  {
    key: 'handle', label: '🖐️ ด้ามจูง', icon: '🖐️',
    grad: 'linear-gradient(135deg,#464c56 0%,#353b46 100%)', fg: '#f9fafb', iconFg: '#e5e7eb',
    sub: 'Handle / Pull · ด้ามจูงม่าน · หน่วยเป็นชิ้น',
    suppliers: ['Decorail Co.'],
    code: 'HD-001', name: 'ด้ามจูงม่านสีโครม',
    fields: [
      { l: 'สีอุปกรณ์', t: 'select', o: ['โครม', 'ทอง', 'ดำ', 'ขาว'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/ชิ้น', price: '0', cost: '0',
  },
  {
    key: 'construction', label: '🏗️ วัสดุก่อสร้าง', icon: '🏗️',
    grad: 'linear-gradient(135deg,#353b46 0%,#242a35 100%)', fg: '#f9fafb', iconFg: '#e5e7eb',
    sub: 'Construction Material · วัสดุก่อสร้าง · หน่วยตามสินค้า',
    suppliers: ['ผู้ค้าวัสดุก่อสร้าง'],
    code: 'CS-001', name: 'วัสดุก่อสร้าง',
    fields: [
      { l: 'ประเภท', t: 'text', req: true },
      { l: 'หน่วยนับ', t: 'select', o: ['ชิ้น', 'กล่อง', 'ถุง', 'เมตร', 'SQM'] },
      { l: 'รูปสินค้า', t: 'upload' },
    ],
    priceUnit: '฿/หน่วย', price: '0', cost: '0',
  },
];

const VBOX = {
  red: { bg: '#FEF2F2', border: '#FECACA', fg: '#8B1F1F' },
  amber: { bg: '#FFFBEB', border: '#FDE68A', fg: '#8B6F3D' },
  green: { bg: '#F0FDF4', border: '#BBF7D0', fg: '#3D6B1F' },
};

/* ---- field renderer ---- */
function FieldView({ f }: { f: Field }) {
  if (f.t === 'upload') {
    return (
      <div>
        <label className="pf-label">{f.l}</label>
        <button type="button" className="pf-upload">
          <span style={{ fontSize: 18 }}>📷</span><span>เลือกรูปภาพ</span>
        </button>
      </div>
    );
  }
  if (f.t === 'checks') {
    return (
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="pf-label">{f.l}</label>
        <div className="rounded-lg p-3 space-y-1.5 text-sm" style={{ background: '#fafafa', border: '1px solid #e2e4e9' }}>
          {f.o!.map((opt, i) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked={i === 0} /><span>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (f.t === 'toggle') {
    return (
      <div>
        <label className="pf-label">{f.l} {f.req && <span className="text-red-500">*</span>}</label>
        <div className="flex gap-2">
          {f.o!.map((opt, i) => (
            <label key={opt} className="flex-1 cursor-pointer">
              <input type="radio" name={`tg-${f.l}`} defaultChecked={i === 0} className="peer hidden" />
              <div className="pf-toggle">{opt}</div>
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (f.t === 'select') {
    return (
      <div>
        <label className="pf-label">{f.l} {f.req && <span className="text-red-500">*</span>}</label>
        <select className="pf-input">{f.o!.map((o) => <option key={o}>{o}</option>)}</select>
      </div>
    );
  }
  /* text / number */
  return (
    <div>
      <label className="pf-label">{f.l} {f.req && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <input type={f.t} defaultValue={f.v} className={`pf-input ${f.unit ? 'pr-12' : ''}`} />
        {f.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">{f.unit}</span>}
      </div>
    </div>
  );
}

function handleEnterKey(e: React.KeyboardEvent) {
  if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
  e.preventDefault();
  const card = (e.currentTarget as HTMLElement);
  const els = Array.from(card.querySelectorAll<HTMLElement>('input, select, textarea'));
  const idx = els.indexOf(document.activeElement as HTMLElement);
  if (idx >= 0 && idx < els.length - 1) els[idx + 1].focus();
}

export default function ProductFormsPage() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="pf-root">
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e4e9' }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: '#1f2937', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>LSL</div>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <Link href="/products" className="text-base hover:underline" style={{ color: '#6b7280' }}>ฐานข้อมูลสินค้า</Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <div className="text-base font-semibold" style={{ color: '#111827' }}>ฟอร์ม 12 หมวด</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span style={{ color: '#6b7280' }}>คุณศลิษา เสนหิรัญ</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#374151' }}>ศ</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-8 pt-6">
        <div className="flex gap-1 border-b border-stone-200 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t.key} onClick={() => setActive(i)}
              className={`pf-tab ${i === active ? 'pf-tab-active' : ''}`}>{t.label}</button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="pf-card" onKeyDown={handleEnterKey}>

          {/* Hero */}
          <div className="pf-hero" style={{ background: tab.grad, color: tab.fg }}>
            <div className="pf-hero-icon" style={{ color: tab.iconFg }}>{tab.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1, marginBottom: 6 }}>{tab.label.replace(/^\S+\s/, '')}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{tab.sub}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>🏠 ลินศิลิน ลิฟวิ่ง</div>
              <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>หมวดสินค้า</div>
            </div>
          </div>

          {/* Top card */}
          <div className="pf-top">
            <div className="grid grid-cols-4 gap-6 mb-5">
              <div className="col-span-3">
                <label className="pf-label">บริษัทผู้ค้า <span className="text-red-500">*</span></label>
                <select className="pf-input">
                  {tab.suppliers.map((s) => <option key={s}>{s}</option>)}
                  <option>+ เพิ่มผู้ค้าใหม่</option>
                </select>
              </div>
              {tab.fields.filter(f => f.t === 'upload').slice(0, 1).map(f => (
                <div key={f.l}>
                  <label className="pf-label">{f.l}</label>
                  <button type="button" className="pf-upload">
                    <span style={{ fontSize: 18 }}>📷</span><span>เลือกรูปภาพ</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="pf-label">รหัสสินค้า <span className="text-red-500">*</span></label>
                <input type="text" defaultValue={tab.code} className="pf-input font-mono" />
              </div>
              <div>
                <label className="pf-label">ชื่อสินค้า <span className="text-red-500">*</span></label>
                <input type="text" defaultValue={tab.name} className="pf-input" />
              </div>
            </div>
          </div>

          {/* ข้อมูลสินค้า + ราคา — 4 คอล แถวเดียวกัน */}
          <div className="pf-divider"><span>ข้อมูลสินค้า</span></div>
          <div className="grid grid-cols-5 gap-x-6 gap-y-5 mb-6">
            {/* 2 fields แรก */}
            {tab.fields.filter(f => f.t !== 'upload').slice(0, 2).map((f) => <FieldView key={f.l} f={f} />)}
            {/* ราคาขาย — คอล 3 */}
            <div>
              <label className="pf-label">ราคาขาย <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type="text" defaultValue={tab.price} className="pf-input pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{tab.priceUnit}</span>
              </div>
            </div>
            {/* ต้นทุน — คอล 4 */}
            <div>
              <label className="pf-label">ต้นทุนสินค้า</label>
              <div className="relative">
                <input type="text" defaultValue={tab.cost} className="pf-input pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{tab.priceUnit}</span>
              </div>
            </div>
            {/* ขั้นต่ำสั่งซื้อ — คอล 5 (ถ้ามี) */}
            {tab.fields.filter(f => f.l === 'ขั้นต่ำสั่งซื้อ').map((f) => <FieldView key={f.l} f={f} />)}
            {/* fields ที่เหลือ (ยกเว้น ขั้นต่ำสั่งซื้อ และ checks) */}
            {tab.fields.filter(f => f.t !== 'upload' && f.t !== 'checks' && f.l !== 'ขั้นต่ำสั่งซื้อ').slice(2).map((f) => <FieldView key={f.l} f={f} />)}
          </div>

          {/* checks + Validation box — แถวเดียวกัน */}
          {(tab.fields.some(f => f.t === 'checks') || tab.validate) && (
            <div className="flex gap-6 mb-6">
              {tab.fields.filter(f => f.t === 'checks').map(f => (
                <div key={f.l} style={{ flex: 1 }}>
                  <label className="pf-label">{f.l}</label>
                  <div className="rounded-lg p-3 space-y-1.5 text-sm" style={{ background: '#fafafa', border: '1px solid #e2e4e9' }}>
                    {f.o!.map((opt, i) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={i === 0} /><span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {tab.validate && (
                <div className="rounded-lg p-4" style={{
                  flex: 1,
                  background: VBOX[tab.validate.color].bg,
                  border: `1px solid ${VBOX[tab.validate.color].border}`,
                }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: VBOX[tab.validate.color].fg }}>{tab.validate.title}</div>
                  <div className="grid grid-cols-2 gap-4">
                    {tab.validate.fields.map((vf) => (
                      <div key={vf.l}>
                        <label className="pf-label" style={{ fontSize: 12 }}>{vf.l}</label>
                        <div className="relative">
                          <input type="number" defaultValue={vf.v} className="pf-input pr-12" style={{ fontSize: 13 }} />
                          {vf.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">{vf.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* สถานะ */}
          <div className="mb-6">
            <label className="pf-label">สถานะ</label>
            <div className="flex gap-3">
              {['✓ กำลังใช้งาน', '⏸️ พัก', '✕ สินค้ายกเลิก'].map((s, i) => (
                <label key={s} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-stone-200 cursor-pointer hover:border-stone-400">
                  <input type="radio" name="pf-status" defaultChecked={i === 0} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* รายละเอียด + Actions แถวเดียวกัน */}
          <div className="pf-divider"><span>รายละเอียด</span></div>
          <div className="flex items-start gap-6 mb-8">
            <div style={{ flex: '0 0 72%' }}>
              <textarea className="pf-input" rows={3} placeholder="รวม สี / ลาย / Collection / แท็กอื่นๆ ที่เกี่ยวข้อง" />
            </div>
            <div className="flex gap-3 pt-1">
              <Link href="/products" className="px-6 py-3 rounded-xl text-stone-600 hover:bg-stone-100 font-medium">ยกเลิก</Link>
              <button onClick={() => alert(`บันทึก "${tab.label}" — ตัวอย่างฟอร์ม (mockup)`)}
                className="px-8 py-3 rounded-xl text-white font-medium" style={{ background: '#1f2937' }}>✓ บันทึก</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-stone-400">
        ฟอร์มสินค้า · ลินศิลิน ลิฟวิ่ง · 2026
      </footer>
    </div>
  );
}

const CSS = `
.pf-root{font-family:'Sarabun',sans-serif;background:#f0f1f3;color:#111827;min-height:100vh}
.pf-card{background:#fff;border-radius:16px;padding:32px 36px;box-shadow:0 1px 3px rgba(0,0,0,.04),0 4px 24px rgba(0,0,0,.07)}
.pf-hero{display:flex;align-items:center;gap:20px;padding:20px 24px;margin:-32px -36px 28px;border-radius:16px 16px 0 0}
.pf-hero-icon{width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:36px;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.pf-top{background:#f4f5f7;border-radius:12px;padding:20px 24px;margin-bottom:24px}
.pf-input{border:1.5px solid #e2e4e9;border-radius:8px;padding:10px 14px;width:100%;font-size:14px;background:#fafafa;color:#111827;transition:all .2s}
.pf-input:focus{border-color:#374151;outline:none;background:#fff;box-shadow:0 0 0 3px rgba(55,65,81,.1)}
.pf-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;display:block}
.pf-divider{display:flex;align-items:center;gap:16px;margin:32px 0 20px}
.pf-divider::before,.pf-divider::after{content:'';flex:1;height:1px;background:#e2e4e9}
.pf-divider span{font-size:12px;font-weight:600;letter-spacing:.1em;color:#6B6B6B;text-transform:uppercase;padding:0 8px}
.pf-tab{padding:12px 20px;border-radius:10px 10px 0 0;border-bottom:2px solid transparent;font-size:14px;cursor:pointer;white-space:nowrap;color:#6B6B6B;background:none;transition:all .2s}
.pf-tab:hover{color:#1f2937}
.pf-tab-active{background:#fff;border-bottom-color:#1f2937;color:#1f2937;font-weight:600}
.pf-upload{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:10px 14px;background:#fafafa;border:1.5px solid #e2e4e9;border-radius:8px;color:#374151;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;transition:all .2s}
.pf-upload:hover{border-color:#374151;background:#fff;color:#1f2937}
.pf-toggle{text-align:center;padding:8px 0;border-radius:8px;border:2px solid #e2e4e9;font-size:14px}
.pf-root .peer:checked+.pf-toggle{border-color:#1f2937;background:rgba(31,41,55,.06);font-weight:600;color:#1f2937}
`;
