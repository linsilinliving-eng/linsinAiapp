'use strict';

/* ------------------------------------------------------------------ */
/*  Curtain type → formula group mapping                               */
/* ------------------------------------------------------------------ */
const TYPE_FORMULA = {
  wave:     'wave',  // ม่านจีบ
  lon:      'wave',  // ม่านลอน
  sfold:    'wave',  // ม่านลอน-กระดุม (S-Fold)
  roman:    'sqy',   // ม่านพับ
  roller:   'sqy',   // ม่านม้วน
  wood:     'sqy',   // มู่ลี่ไม้
  net:      'sqy',   // มุ้งจีบ
  bay:      'wave',  // ม่านถุง
  hospital: 'wave',  // ม่าน รพ.
};

const DEFAULT_FACE = {
  wave:     1.20,
  lon:      1.20,
  sfold:    1.40,
  bay:      1.20,
  hospital: 1.20,
};

/* ------------------------------------------------------------------ */
/*  computeQty                                                          */
/*  formula : 'wave' | 'sqy'                                           */
/*  faceW   : หน้าผ้า (wave only)                                      */
/*  w, h    : ความกว้าง × สูง (เมตร)                                  */
/* ------------------------------------------------------------------ */
function computeQty(formula, faceW, w, h) {
  if (typeof w !== 'number' || typeof h !== 'number' || w <= 0 || h <= 0) {
    throw new RangeError(`w and h must be positive numbers (got w=${w}, h=${h})`);
  }
  if (formula === 'wave') {
    const fw = (typeof faceW === 'number' && faceW > 0) ? faceW : 1.2;
    const qty = (w * fw * (h + 0.5)) / 0.9144;
    return { qty, unit: 'yd', label: `${qty.toFixed(2)} yd` };
  } else {
    const qty = w * h * 1.196;
    return { qty, unit: 'sqy', label: `${qty.toFixed(2)} sqy` };
  }
}

/* ------------------------------------------------------------------ */
/*  computePrice                                                        */
/* ------------------------------------------------------------------ */
function computePrice(qty, unitPrice, discountPct, railPrice = 0, motorPrice = 0) {
  const price    = qty * unitPrice;
  const discount = price * (discountPct / 100);
  const net      = price - discount;
  const total    = net + railPrice + motorPrice;
  return { price, discount, net, total };
}

/* ------------------------------------------------------------------ */
/*  calcBoqItem — full pipeline                                         */
/*  params: { typeId, faceW?, width, height, unitPrice,                */
/*            discountPct?, railPrice?, motorPrice? }                   */
/* ------------------------------------------------------------------ */
function calcBoqItem({
  typeId,
  faceW,
  width,
  height,
  unitPrice,
  discountPct = 30,
  railPrice   = 0,
  motorPrice  = 0,
}) {
  if (!TYPE_FORMULA[typeId]) throw new Error(`Unknown typeId: "${typeId}"`);
  const formula = TYPE_FORMULA[typeId];
  const fw      = faceW ?? DEFAULT_FACE[typeId] ?? 1.2;
  const q       = computeQty(formula, fw, width, height);
  const p       = computePrice(q.qty, unitPrice, discountPct, railPrice, motorPrice);
  return {
    typeId, formula, faceW: fw,
    qty: q.qty, unit: q.unit, qtyLabel: q.label,
    unitPrice, discountPct, railPrice, motorPrice,
    price: p.price, discount: p.discount, net: p.net, total: p.total,
  };
}

/* ------------------------------------------------------------------ */
/*  f2  — Thai number format (2 decimal places)                        */
/* ------------------------------------------------------------------ */
function f2(n) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = { computeQty, computePrice, calcBoqItem, f2, TYPE_FORMULA, DEFAULT_FACE };
