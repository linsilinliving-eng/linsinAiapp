'use client';

import { useMemo, useRef, useState } from 'react';
import { Menu } from '@mantine/core';

/* ------------------------------------------------------------------ */
/*  Types & data model                                                 */
/* ------------------------------------------------------------------ */

type RowType = 'heading' | 'note' | 'item' | 'retail';

interface BoqRow {
  id: string;
  type: RowType;
  text?: string;
  no?: string;
  size?: string;
  desc?: string;
  code?: string;
  faceW?: string;
  unitPrice?: string;
  qty?: string;
  price?: string;
  discount?: string;
  net?: string;
  rail?: string;
  motor?: string;
  c13?: string;
  hook?: string;
  sewing?: string;
  install?: string;
  unit?: string;
  total?: string;
}

let _uid = 0;
const nid = () => `row_${++_uid}_${Math.random().toString(36).slice(2, 7)}`;

const H = (text: string): BoqRow => ({ id: nid(), type: 'heading', text });
const N = (text: string): BoqRow => ({ id: nid(), type: 'note', text });

const I = (
  no: string, size: string, desc: string, code: string, faceW: string,
  unitPrice: string, qty: string, price: string, discount: string, net: string,
  rail: string, motor: string, unit: string, total: string,
): BoqRow => ({
  id: nid(), type: 'item', no, size, desc, code, faceW, unitPrice, qty, price,
  discount, net, rail, motor, c13: '300', hook: '300', sewing: '—', install: '—', unit, total,
});

const R = (
  no: string, desc: string, unitPrice: string, qty: string, price: string,
  net: string, rail: string, unit: string, total: string,
): BoqRow => ({
  id: nid(), type: 'retail', no, size: '—', desc, code: '', faceW: '—', unitPrice, qty,
  price, discount: '—', net, rail, motor: '—', c13: '—', hook: '—', sewing: '—',
  install: '—', unit, total,
});

/* Initial BOQ680315 Rev.3 data. Numeric values & product codes recovered  */
/* verbatim from the prototype; Thai descriptions reconstructed.            */
const INITIAL_ROWS: BoqRow[] = [
  H('ห้องนั่งเล่น'),
  I('1', 'W.02.54×H.06.78', 'ผ้าม่านลอน ทึบ | ผ่ากลาง | มอเตอร์', 'ACHIEVEMENT-02', '1.20', '910', '44.16 yd', '40,185.60', '-12,055.68', '28,129.92', '—', '18,250', 'ชุด', '48,424.99'),
  I('1.1', 'W.02.54×H.06.78', 'ผ้าม่านลอน โปร่ง | ผ่ากลาง | มอเตอร์', 'EXS335/01', '1.20', '350', '44.16 yd', '15,456.00', '-5,409.60', '10,046.40', '—', '16,850', 'ชุด', '30,043.89'),
  R('1.2', 'SMOOVE 1:2 คำอธิบายรายการ (ราวราคาพิเศษ)', '2,900', '1 ชุด', '2,900.00', '2,900.00', '2,900', 'ชุด', '2,900.00'),

  H('ห้องทานข้าว'),
  I('2', 'W.01.95×H.03.06', 'มู่ลี่ไม้ 50MM | ดึงซ้าย | Manual', 'FW50-301 WHITE BEECH', '—', '1,950', '7.14 sqy', '13,923.00', '-4,873.05', '9,049.95', '—', '—', 'ชุด', '9,270.46'),
  I('3', 'W.01.47×H.03.06', 'มู่ลี่ไม้ 50MM | ซ้าย | มอเตอร์', 'FW50-301 WHITE BEECH', '—', '1,950', '5.38 sqy', '10,491.00', '-4,196.40', '6,294.60', '—', '16,500', 'ชุด', '24,292.07'),
  I('3.1', 'W.01.47×H.03.06', 'มู่ลี่ไม้ 50MM | ขวา | มอเตอร์', 'FW50-301 WHITE BEECH', '—', '1,950', '5.38 sqy', '10,491.00', '-4,196.40', '6,294.60', '—', '16,500', 'ชุด', '24,292.07'),
  I('4', 'W.02.31×H.03.06', 'มู่ลี่ไม้ 50MM | ซ้าย | มอเตอร์', 'FW50-301 WHITE BEECH', '—', '1,950', '8.45 sqy', '16,477.50', '-6,591.00', '9,886.50', '—', '17,500', 'ชุด', '28,889.21'),
  R('4.1', 'รีโมทควบคุม 4 ช่อง (Tahoma Remote)', '3,500', '1 ตัว', '3,500.00', '3,500.00', '—', 'ตัว', '3,500.00'),

  H('ห้องนอน 1'),
  I('5', 'W.01.40×H.03.09', 'ผ้าม่านลอน ทึบ | ดึงซ้าย | Manual', 'GUV433', '1.40', '590', '10.14 yd', '5,982.60', '-2,093.91', '3,888.69', '—', '—', 'ชุด', '3,889.00'),
  I('5.1', 'W.01.40×H.03.09', 'ผ้าม่านลอน โปร่ง | ดึงซ้าย | Manual', 'EXS335/01', '1.20', '350', '9.97 yd', '3,489.50', '-1,221.32', '2,268.18', '—', '—', 'ชุด', '2,268.19'),
  I('6', 'W.01.20×H.03.09', 'ผ้าม่านลอน ทึบ | ดึงซ้าย | Manual', 'GUV433', '1.40', '590', '10.14 yd', '5,982.60', '-2,093.91', '3,888.69', '—', '—', 'ชุด', '3,888.69'),
  I('6.1', 'W.01.20×H.03.09', 'ผ้าม่านลอน โปร่ง | ดึงซ้าย | Manual', 'EXS335/01', '1.20', '350', '9.97 yd', '3,489.50', '-1,221.32', '2,268.18', '—', '—', 'ชุด', '2,269.39'),
  I('7', 'W.00.85×H.01.75', 'มู่ลี่ไม้ 50MM | ดึงขวา | Manual', 'FW50-830 LIGHT GREY', '—', '1,950', '1.78 sqy', '3,471.00', '-1,214.85', '2,256.15', '—', '—', 'ชุด', '2,678.95'),
  N('🟩 ราว: SNAKE SHAPE / ไม่มีกล่อง / สีขาว — รวมอยู่ในราคาสินค้าแล้ว'),

  H('ห้องออกกำลังกาย'),
  I('8', 'W.02.35×H.02.87', 'ม่านม้วน Blackout | ดึงขวา | Manual', 'BB09-02 BEIGE', '—', '1,900', '8.07 sqy', '15,333.00', '-5,366.55', '9,966.45', '—', '—', 'ชุด', '10,190.65'),
  I('9', 'W.02.35×H.02.87', 'ม่านม้วน Blackout | ดึงขวา | Manual', 'BB09-02 BEIGE', '—', '1,900', '8.07 sqy', '15,333.00', '-5,366.55', '9,966.45', '—', '—', 'ชุด', '10,190.65'),

  H('ห้องโถง'),
  I('10', 'W.01.15×H.02.60', 'ม่านม้วน Dimout | ดึงขวา | Manual', 'BIW-9160', '—', '1,400', '3.58 sqy', '5,012.00', '-1,754.20', '3,257.80', '—', '—', 'ชุด', '3,475.98'),

  H('โถงบันได'),
  I('11', 'W.02.27×H.04.92', 'ผ้าม่านลอน โปร่ง | ผ่ากลาง | Manual', 'EXS335/01', '1.20', '350', '26.63 yd', '9,320.50', '-3,262.17', '6,058.32', '—', '—', 'ชุด', '9,346.97'),
  N('🟩 ราว: รางเลื่อนดึง / ไม่มีกล่อง / สีขาว — รวมในราคา (เก็บสูง)'),

  H('ห้องพระ'),
  I('12', 'W.01.15×H.03.11', 'ม่านม้วน Dimout | ดึงขวา | Manual', 'BIW-9160', '—', '1,400', '4.28 sqy', '5,992.00', '-2,097.20', '3,894.80', '—', '—', 'ชุด', '4,116.44'),

  H('ห้องนั่งเล่น ชั้น 2'),
  I('13', 'W.03.66×H.03.11', 'ผ้าม่านลอน ทึบ | ดึงขวา | Manual', 'ACHIEVEMENT-02', '1.20', '910', '26.77 yd', '24,360.70', '-7,308.21', '17,052.49', '—', '—', 'ชุด', '19,486.06'),
  I('13.1', 'W.03.66×H.03.11', 'ผ้าม่านลอน โปร่ง | ดึงขวา | Manual', 'EXS335/01', '1.20', '350', '26.77 yd', '9,369.50', '-3,279.32', '6,090.18', '—', '—', 'ชุด', '9,127.87'),
  I('14', 'W.02.91×H.03.10', 'ผ้าม่านลอน ทึบ | ดึงขวา | Manual', 'ACHIEVEMENT-02', '1.20', '910', '20.01 yd', '18,209.10', '-5,462.73', '12,746.37', '—', '—', 'ชุด', '14,685.03'),
  I('14.1', 'W.02.91×H.03.10', 'ผ้าม่านลอน โปร่ง | ดึงขวา | Manual', 'EXS335/01', '1.20', '350', '20.01 yd', '7,003.50', '-2,451.22', '4,552.28', '—', '—', 'ชุด', '7,008.81'),

  H('ห้องนอน 2'),
  I('15', 'W.03.18×H.03.10', 'ผ้าม่านลอน ทึบ | ผ่ากลาง | Manual', 'GUV431', '1.60', '590', '16.95 yd', '10,000.50', '-3,500.17', '6,500.32', '—', '—', 'ชุด', '6,500.32'),
  I('15.1', 'W.03.18×H.03.10', 'ผ้าม่านลอน โปร่ง | ผ่ากลาง | Manual', 'EXS335/01', '1.20', '350', '23.35 yd', '8,172.50', '-2,860.38', '5,312.12', '—', '—', 'ชุด', '5,312.65'),
  I('16', 'W.00.80×H.02.25', 'มู่ลี่ไม้ 50MM | ดึงขวา | Manual', 'FW50-830 LIGHT GREY', '—', '1,950', '2.15 sqy', '4,192.50', '-1,467.38', '2,725.12', '—', '—', 'ชุด', '2,957.79'),

  H('ห้องนอน 3'),
  I('17', 'W.03.70×H.03.10', 'ผ้าม่านลอน ทึบ | ผ่ากลาง | Manual', 'GUV431', '1.60', '590', '20.34 yd', '12,000.60', '-4,200.21', '7,800.39', '—', '—', 'ชุด', '7,801.16'),
  I('17.1', 'W.03.70×H.03.10', 'ผ้าม่านลอน โปร่ง | ผ่ากลาง | Manual', 'EXS335/01', '1.20', '350', '26.68 yd', '9,338.00', '-3,268.30', '6,069.70', '—', '—', 'ชุด', '6,069.71'),
  I('18', 'W.00.85×H.01.85', 'มู่ลี่ไม้ 50MM | ดึงขวา | Manual', 'FW50-830 LIGHT GREY', '—', '1,950', '1.88 sqy', '3,666.00', '-1,283.10', '2,382.90', '—', '—', 'ชุด', '2,678.95'),

  H('ห้องนอนใหญ่ (Master Bedroom)'),
  I('19', 'W.01.17×H.03.09', 'ผ้าม่านลอน ทึบ | ดึงซ้าย | Manual', 'MALDIVES-07', '1.20', '1,140', '9.97 yd', '11,365.80', '-3,409.74', '7,956.06', '—', '—', 'ชุด', '8,778.66'),
  I('19.1', 'W.01.17×H.03.09', 'ผ้าม่านลอน โปร่ง | ดึงซ้าย | Manual', 'EXS335/01', '1.20', '350', '9.97 yd', '3,489.50', '-1,221.32', '2,268.18', '—', '—', 'ชุด', '3,375.07'),
  I('19.2', 'W.01.17×H.03.09', 'ลอน-B เย็บติด ทึบ | ดึงซ้าย', '18021-121', '1.40', '280', '10.14 yd', '2,839.20', '-993.72', '1,845.48', '—', '—', 'ชุด', '1,997.42'),
  I('20', 'W.01.17×H.03.09', 'ผ้าม่านลอน ทึบ | ดึงขวา | Manual', 'MALDIVES-07', '1.20', '1,140', '9.97 yd', '11,365.80', '-3,409.74', '7,956.06', '—', '—', 'ชุด', '8,778.66'),
  I('20.1', 'W.01.17×H.03.09', 'ผ้าม่านลอน โปร่ง | ดึงขวา | Manual', 'EXS335/01', '1.20', '350', '9.97 yd', '3,489.50', '-1,221.32', '2,268.18', '—', '—', 'ชุด', '3,375.07'),
  I('20.2', 'W.01.17×H.03.09', 'ลอน-B เย็บติด ทึบ | ดึงขวา', '18021-121', '1.40', '280', '10.14 yd', '2,839.20', '-993.72', '1,845.48', '—', '—', 'ชุด', '1,997.42'),
  I('21', 'W.02.60×H.03.09', 'ผ้าม่านลอน ทึบ | ผ่ากลาง | Manual', 'MALDIVES-07', '1.20', '1,140', '19.95 yd', '22,743.00', '-6,822.90', '15,920.10', '—', '—', 'ชุด', '17,559.64'),
  I('21.1', 'W.02.60×H.03.09', 'ผ้าม่านลอน โปร่ง | ผ่ากลาง | Manual', 'EXS335/01', '1.20', '350', '19.95 yd', '6,982.50', '-2,443.88', '4,538.62', '—', '—', 'ชุด', '6,754.10'),
  I('21.2', 'W.02.60×H.03.09', 'ลอน-B เย็บติด ทึบ | ผ่ากลาง', '18021-121', '1.40', '280', '16.90 yd', '4,732.00', '-1,656.20', '3,075.80', '—', '—', 'ชุด', '3,413.46'),
  I('22', 'W.01.17×H.03.09', 'ผ้าม่านลอน ทึบ | ดึงซ้าย | Manual', 'MALDIVES-07', '1.20', '1,140', '9.97 yd', '11,365.80', '-3,409.74', '7,956.06', '—', '—', 'ชุด', '8,778.66'),
  I('22.1', 'W.01.17×H.03.09', 'ผ้าม่านลอน โปร่ง | ดึงซ้าย | Manual', 'EXS335/01', '1.20', '350', '9.97 yd', '3,489.50', '-1,221.32', '2,268.18', '—', '—', 'ชุด', '3,375.07'),
  I('22.2', 'W.01.17×H.03.09', 'ลอน-B เย็บติด ทึบ | ดึงซ้าย', '18021-121', '1.40', '280', '10.14 yd', '2,839.20', '-993.72', '1,845.48', '—', '—', 'ชุด', '1,997.42'),

  H('ห้องน้ำ MASTER BEDROOM'),
  I('23', 'W.02.10×H.02.19', 'มู่ลี่ไม้ 50MM | ดึงซ้าย | Manual', 'FW50-830 LIGHT GREY', '—', '1,950', '5.50 sqy', '10,725.00', '-3,753.75', '6,971.25', '—', '—', 'ชุด', '7,215.08'),
  R('24', 'Tahoma สมาร์ทโฮมคอนโทรลเลอร์ (Somfy)', '9,500', '1 ตัว', '9,500.00', '9,500.00', '—', 'ตัว', '9,500.00'),
  R('25', 'ค่าติดตั้งราง จุดที่สูง', '3,500', '1 ชุด', '3,500.00', '3,500.00', '3,500', 'ชุด', '3,500.00'),
  N('📋 ** รายการหมายเหตุเพิ่มเติม — ไม่คิดราคาเพิ่ม ฟรี **'),
  N('📋 ชำระราคาสินค้าภายใน 30 วัน นับจากวันที่รับสินค้า / มัดจำ 50%'),
  N('📋 กรรมสิทธิ์ในสินค้าเป็นของบริษัทจนกว่าจะชำระครบถ้วน'),
  N('📋 รับประกันสินค้า 1 ปี นับตั้งแต่วันติดตั้ง'),
  N('⚠️ ราคานี้ไม่รวมค่าใช้จ่ายในการติดตั้งมอเตอร์'),
];

/* item / retail data columns rendered between "no" and "total" */
const ITEM_FIELDS: (keyof BoqRow)[] = [
  'faceW', 'unitPrice', 'qty', 'price', 'discount', 'net',
  'rail', 'motor', 'c13', 'hook', 'sewing', 'install', 'unit',
];

const toNum = (s?: string) => {
  if (!s) return 0;
  const n = parseFloat(s.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const fmt = (n: number) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

type UndoEntry =
  | { action: 'add'; id: string }
  | { action: 'del'; index: number; row: BoqRow }
  | { action: 'snapshot'; rows: BoqRow[] };

export default function BoqPage() {
  const [rows, setRows] = useState<BoqRow[]>(INITIAL_ROWS);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [status, setStatus] = useState('sent');
  const undoStack = useRef<UndoEntry[]>([]);

  const pushUndo = (e: UndoEntry) => {
    undoStack.current.push(e);
    if (undoStack.current.length > 50) undoStack.current.shift();
  };

  const summary = useMemo(() => {
    const sub = rows
      .filter((r) => r.type === 'item' || r.type === 'retail')
      .reduce((s, r) => s + toNum(r.total), 0);
    const vat = sub * 0.07;
    return { sub, vat, total: sub + vat };
  }, [rows]);

  /* -------- row mutations -------- */
  const addRow = (type: RowType) => {
    const blank: BoqRow =
      type === 'heading'
        ? { id: nid(), type, text: 'หัวเรื่องใหม่' }
        : type === 'note'
        ? { id: nid(), type, text: '📝 หมายเหตุ:' }
        : type === 'retail'
        ? R('', 'ค่าปลีก AUTO', '', '1 ตัว', '', '', '—', 'ตัว', '')
        : I('', '', 'รายการใหม่', '', '', '', '', '', '', '', '—', '—', 'ชุด', '');
    setRows((p) => [...p, blank]);
    pushUndo({ action: 'add', id: blank.id });
  };

  const deleteRow = (id: string) => {
    setRows((p) => {
      const index = p.findIndex((r) => r.id === id);
      if (index < 0) return p;
      pushUndo({ action: 'del', index, row: p[index] });
      return p.filter((r) => r.id !== id);
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    setRows((p) => {
      const i = p.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.length) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const duplicate = (id: string) => {
    setRows((p) => {
      const i = p.findIndex((r) => r.id === id);
      if (i < 0) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const clone = { ...p[i], id: nid() };
      const next = [...p];
      next.splice(i + 1, 0, clone);
      return next;
    });
  };

  const addNoteAfter = (id: string) => {
    setRows((p) => {
      const i = p.findIndex((r) => r.id === id);
      if (i < 0) return p;
      pushUndo({ action: 'snapshot', rows: p });
      const note: BoqRow = { id: nid(), type: 'note', text: '📝 หมายเหตุ:' };
      const next = [...p];
      next.splice(i + 1, 0, note);
      return next;
    });
  };

  const undo = () => {
    const last = undoStack.current.pop();
    if (!last) return;
    if (last.action === 'add') {
      setRows((p) => p.filter((r) => r.id !== last.id));
    } else if (last.action === 'del') {
      setRows((p) => {
        const next = [...p];
        next.splice(last.index, 0, last.row);
        return next;
      });
    } else {
      setRows(last.rows);
    }
  };

  const commit = (id: string, field: keyof BoqRow, value: string) => {
    setRows((p) =>
      p.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  /* editable cell helper */
  const Cell = ({
    row, field, className,
  }: { row: BoqRow; field: keyof BoqRow; className?: string }) => (
    <td className={className} style={{ padding: 0 }}>
      <input
        className="boq-cell-input"
        value={(row[field] as string) ?? ''}
        onChange={(e) => commit(row.id, field, e.target.value)}
      />
    </td>
  );

  return (
    <div className="boq-page">
      <style>{CSS}</style>

      <div className="page-card">
        {/* ---------- header ---------- */}
        <div className="boq-header">
          <div className="header-right" style={{ textAlign:'left' }}>
            <div className="badge-boq">
              ใบประมาณราคา · BOQ <span className="badge-rev">Rev.3</span>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>เลขที่</td><td>BOQ680315</td>
                  <td style={{ paddingLeft: 16, color: '#9ca3af' }}>วันที่</td>
                  <td>9 ก.ย. 2568</td>
                </tr>
                <tr>
                  <td>Opt</td><td>1</td>
                  <td style={{ paddingLeft: 16, color: '#9ca3af' }}>ผู้ดูแล</td>
                  <td>ปุ๊ก</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- customer bar ---------- */}
        <div className="customer-bar">
          <span><span className="lbl">ลูกค้า:</span><span className="val">คุณการิกาญ หวังแก้ว</span></span>
          <span className="sep">|</span>
          <span><span className="lbl">รหัส:</span><span className="val">C0301</span></span>
          <span className="sep">|</span>
          <span><span className="lbl">ผู้ติดต่อ:</span><span className="val">คุณฟ้า · 089-171-3128</span></span>
          <span className="sep">|</span>
          <span><span className="lbl">โครงการ:</span><span className="val">แพรกษา สมุทรปราการ</span></span>
          <span className="sep">|</span>
          <span><span className="lbl">ประเภทงาน:</span><span className="val">ผ้าม่านบ้านคุณหนึ่งคุณฟ้า</span></span>
          <span className="sep">|</span>
          <span><span className="lbl">ผู้ดูแลโครงการ:</span><span className="val">ปุ๊ก</span></span>
        </div>

        {/* ---------- toolbar ---------- */}
        <div className="action-toolbar">
          <button className="toolbar-btn btn-title" onClick={() => addRow('heading')}>+ หัวเรื่อง</button>
          <button className="toolbar-btn btn-item" onClick={() => addRow('item')}>+ รายการ</button>
          <button className="toolbar-btn btn-retail" onClick={() => addRow('retail')}>+ ค่าปลีก-AUTO</button>
          <button className="toolbar-btn btn-note" onClick={() => addRow('note')}>+ NOTE</button>
          <button className="toolbar-btn btn-undo" onClick={undo}>↶ UNDO</button>
          <button className="toolbar-btn btn-print" onClick={() => window.print()}>🖨️ พิมพ์</button>
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:8 }}>
            <label style={{ fontSize:12,color:'#6b7280',fontWeight:600 }}>สถานะ</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ border:'1px solid #d1d5db',borderRadius:6,padding:'4px 10px',fontSize:13,fontWeight:600,cursor:'pointer',
                background: status==='draft'?'#f3f4f6': status==='sent'?'#dbeafe': status==='approved'?'#dcfce7':'#fee2e2',
                color: status==='draft'?'#374151': status==='sent'?'#1d4ed8': status==='approved'?'#15803d':'#b91c1c',
              }}>
              <option value="draft">แบบร่าง</option>
              <option value="sent">ส่งแล้ว</option>
              <option value="approved">อนุมัติ</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>

        {/* ---------- table ---------- */}
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
                <th rowSpan={2}>Action</th>
                <th rowSpan={2}>ลำดับ</th>
                <th rowSpan={2}>ขนาด<br />SIZE</th>
                <th rowSpan={2}>ประเภท / รายละเอียด</th>
                <th rowSpan={2} className="rot"><span className="r">หน้าผ้า(ม.)</span></th>
                <th rowSpan={2}>ราคา<br />ต่อหน่วย</th>
                <th>จำนวน</th>
                <th>ราคา</th>
                <th>ส่วนลด</th>
                <th>ราคาสินค้า</th>
                <th>ราง</th>
                <th rowSpan={2} className="rot"><span className="r">มอเตอร์</span></th>
                <th rowSpan={2} className="rot"><span className="r">ด้ามจูง</span></th>
                <th rowSpan={2} className="rot"><span className="r">ตะขอ</span></th>
                <th rowSpan={2}>ค่าเย็บ</th>
                <th rowSpan={2}>ค่าติดตั้ง</th>
                <th rowSpan={2} className="rot"><span className="r">หน่วย</span></th>
                <th rowSpan={2}>จำนวนเงิน</th>
              </tr>
              <tr>
                <th>ที่ใช้<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(yd/sqyd)</span></th>
                <th>รวม</th>
                <th>ส่วนลด<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(บาท)</span></th>
                <th>สุทธิ</th>
                <th>อุปกรณ์</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const actionCell = (
                  <td className="cell-act">
                    <span className="act-inner">
                      <button
                        className={`bi${highlightedId === row.id ? ' bi-active' : ''}`}
                        title="แก้ไข"
                        onClick={() => setHighlightedId(highlightedId === row.id ? null : row.id)}
                      >✏️</button>
                      <button className="bi" title="ลบ" onClick={() => deleteRow(row.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                      <Menu shadow="md" width={150} position="bottom-start">
                        <Menu.Target>
                          <button className="bp bi">+</button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item onClick={() => move(row.id, -1)}>↑ เลื่อนขึ้น</Menu.Item>
                          <Menu.Item onClick={() => move(row.id, 1)}>↓ เลื่อนลง</Menu.Item>
                          <Menu.Divider />
                          <Menu.Item onClick={() => duplicate(row.id)}>⧉ ทำซ้ำ</Menu.Item>
                          <Menu.Item onClick={() => addNoteAfter(row.id)}>📝 NOTE ต่อท้าย</Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </span>
                  </td>
                );

                if (row.type === 'heading') {
                  return (
                    <tr key={row.id} className={`row-heading${highlightedId === row.id ? ' row-editing' : ''}`}>
                      {actionCell}
                      <td colSpan={17} style={{ padding: 0 }}>
                        <input
                          className="boq-cell-input boq-heading-input"
                          value={row.text || ''}
                          onChange={(e) => commit(row.id, 'text', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                }

                if (row.type === 'note') {
                  return (
                    <tr key={row.id} className={`row-note${highlightedId === row.id ? ' row-editing' : ''}`}>
                      {actionCell}
                      <td colSpan={17} style={{ padding: 0 }}>
                        <input
                          className="boq-cell-input boq-note-input"
                          value={row.text || ''}
                          onChange={(e) => commit(row.id, 'text', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                }

                /* item / retail */
                return (
                  <tr key={row.id} className={`${row.type === 'retail' ? 'row-retail' : 'row-item'}${highlightedId === row.id ? ' row-editing' : ''}`}>
                    {actionCell}
                    <Cell row={row} field="no" />
                    <Cell row={row} field="size" className="cl" />
                    <td className="cl" style={{ padding: 0 }}>
                      <input
                        className="boq-cell-input boq-cell-left"
                        value={row.desc || ''}
                        onChange={(e) => commit(row.id, 'desc', e.target.value)}
                      />
                      {row.code ? <div className="si"><span>รหัส: {row.code}</span></div> : null}
                    </td>
                    {ITEM_FIELDS.map((f) => {
                      const cls =
                        f === 'discount' ? 'c-red'
                          : f === 'net' ? 'c-net'
                          : f === 'faceW' ? 'cr c-facew'
                          : f === 'qty' ? 'cr c-qty'
                          : f === 'motor' ? 'cr c-motor'
                          : 'cr';
                      return <Cell key={f} row={row} field={f} className={cls} />;
                    })}
                    <Cell row={row} field="total" className="c-tot" />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---------- summary ---------- */}
        <div className="sum-wrap">
          <table className="sum-tbl">
            <tbody>
              <tr><td>รวมก่อน VAT (ส่วนลดพิเศษ)</td><td>{fmt(summary.sub)} บาท</td></tr>
              <tr className="vat"><td>VAT 7%</td><td>{fmt(summary.vat)} บาท</td></tr>
              <tr className="tot">
                <td><strong>รวมทั้งสิ้น (รวม VAT)</strong></td>
                <td><strong>{fmt(summary.total)} บาท</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scoped styles (ported from the BOQ680315 prototype)                 */
/* ------------------------------------------------------------------ */

const CSS = `
.boq-page{font-family:'Sarabun','Cordia New','Browallia New',Tahoma,sans-serif;font-size:14px;color:#111827;background:#f0f1f3;min-height:100vh;padding:24px}
.boq-page .page-card{background:#fff;border:1px solid #e2e4e9;border-radius:16px;width:100%;max-width:100%;margin:0;padding:18px 20px 24px;box-shadow:0 4px 24px rgba(0,0,0,.07)}
.boq-page .boq-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:14px;border-bottom:1.5px solid #e2e4e9;margin-bottom:12px}
.boq-page .header-left{display:flex;align-items:center;gap:14px}
.boq-page .logo-box{width:54px;height:54px;background:#1f2937;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;letter-spacing:1px}
.boq-page .company-info h1{font-size:18px;font-weight:700;color:#111827}
.boq-page .company-info p{font-size:13px;color:#6b7280;line-height:1.5}
.boq-page .header-divider{width:1.5px;background:#e2e4e9;align-self:stretch}
.boq-page .header-right{text-align:right}
.boq-page .badge-boq{display:inline-block;background:#f0f1f3;color:#1f2937;border:1px solid #d1d5db;border-radius:6px;padding:2px 12px;font-weight:700;font-size:16px;letter-spacing:1px;margin-bottom:6px}
.boq-page .badge-rev{display:inline-block;background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:4px;padding:1px 8px;font-weight:700;font-size:12px;margin-left:8px;vertical-align:middle}
.boq-page .header-right table{font-size:13px;border-collapse:collapse;margin-left:auto}
.boq-page .header-right td{padding:1px 4px}
.boq-page .header-right td:first-child{color:#9ca3af;text-align:right}
.boq-page .header-right td:nth-child(2){font-weight:600}
.boq-page .header-right td:last-child{font-weight:600}
.boq-page .customer-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:#fafafa;border:1px solid #e2e4e9;border-radius:8px;padding:7px 14px;margin-bottom:10px;font-size:13px}
.boq-page .customer-bar .lbl{color:#9ca3af;margin-right:2px}
.boq-page .customer-bar .val{font-weight:600;color:#111827}
.boq-page .sep{color:#d1d5db}
.boq-page .action-toolbar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.boq-page .toolbar-btn{padding:4px 12px;font-family:inherit;font-size:12px;border-radius:6px;border:1px solid;cursor:pointer;font-weight:600;transition:all .15s}
.boq-page .btn-title{background:#fff3cd;border-color:#f0ad4e;color:#6d4c00}
.boq-page .btn-title:hover{background:#ffe8a0}
.boq-page .btn-item{background:#d4edda;border-color:#28a745;color:#145221}
.boq-page .btn-item:hover{background:#b8dfc4}
.boq-page .btn-retail{background:#cfe2ff;border-color:#0d6efd;color:#082c6b}
.boq-page .btn-retail:hover{background:#aecbf8}
.boq-page .btn-note{background:#f0f1f3;border-color:#c4c8d0;color:#374151}
.boq-page .btn-note:hover{background:#e2e4e9}
.boq-page .btn-undo{background:#f8d7da;border-color:#dc3545;color:#721c24}
.boq-page .btn-undo:hover{background:#f5b8bc}
.boq-page .btn-print{background:#f0f1f3;border-color:#374151;color:#374151}
.boq-page .btn-print:hover{background:#e2e4e9}
.boq-page .table-wrap{overflow-x:auto}
.boq-page table.boq{border-collapse:separate;border-spacing:0;width:100%;min-width:1130px;font-size:13px;table-layout:fixed}
.boq-page table.boq thead th{background:#1f2937;color:#fff;text-align:center;vertical-align:middle;padding:5px 3px;border:1px solid #374151;font-size:13px;font-weight:700;white-space:nowrap;line-height:1.3}
.boq-page table.boq thead th:first-child{position:sticky;left:0;z-index:3;background:#1f2937;box-shadow:2px 0 4px rgba(0,0,0,.12)}
.boq-page thead th.rot{width:22px;min-width:22px;padding:3px 1px}
.boq-page thead th.rot .r{display:inline-block;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;font-size:11px;line-height:1}
.boq-page table.boq tbody td{border:1px solid #e2e4e9;padding:4px;vertical-align:middle;text-align:center;overflow:hidden;white-space:nowrap}
.boq-page table.boq tbody tr.row-heading td{background:#e8eaed;font-weight:700;font-size:13px;color:#374151;text-align:left;padding-left:8px;white-space:normal}
.boq-page tr.row-item td{background:#fff}
.boq-page tr.row-item:hover td{background:#f4f5f7}
.boq-page tr.row-retail td{background:#fefcf0}
.boq-page tr.row-retail:hover td{background:#fdf5d0}
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
.boq-page .bp{background:#374151;color:#fff;font-weight:700}
.boq-page .bp:hover{background:#1f2937}
.boq-page .si{font-size:11px;color:#9ca3af;margin-top:2px;white-space:normal}
.boq-page .sum-wrap{display:flex;justify-content:flex-end;margin-top:14px}
.boq-page .sum-tbl{border-collapse:collapse;font-size:13px;min-width:310px}
.boq-page .sum-tbl td{padding:3px 10px}
.boq-page .sum-tbl td:first-child{color:#6b7280;text-align:right}
.boq-page .sum-tbl td:last-child{text-align:right;font-weight:600;min-width:100px}
.boq-page .sum-tbl tr.tot td{border-top:2px solid #1f2937;font-weight:700;font-size:15px;color:#111827}
.boq-page .sum-tbl tr.vat td{color:#9ca3af;font-size:12px}
@media print{
  .boq-page .action-toolbar,.boq-page .bi,.boq-page .bp{display:none}
  .boq-page table.boq tbody td.cell-act,.boq-page thead th:first-child{display:none}
  .boq-page .page-card{box-shadow:none;border:none}
  .boq-page{background:#fff;padding:0}
}
.boq-cell-input{width:100%;border:none;background:transparent;font-family:inherit;font-size:inherit;color:inherit;padding:3px 4px;outline:none;text-align:right;display:block;min-width:0;box-sizing:border-box}
.boq-cell-input:focus{background:rgba(55,65,81,.07);outline:1.5px solid #374151;border-radius:3px;position:relative;z-index:1}
.boq-cell-left,.boq-page table.boq tbody td.cl .boq-cell-input{text-align:left}
.boq-page table.boq tbody tr.row-item td:nth-child(2) .boq-cell-input,
.boq-page table.boq tbody tr.row-retail td:nth-child(2) .boq-cell-input{text-align:center}
.boq-heading-input{font-weight:700;font-size:13px;color:#374151;text-align:left}
.boq-note-input{font-style:italic;font-size:12px;color:#6b7280;text-align:left}
`;
