'use strict';
const { computeQty, computePrice, calcBoqItem, f2 } = require('./boq_calc.js');

let pass = 0, fail = 0;

function assert(label, actual, expected, tolerance = 0.01) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) {
    console.log(`  ✅ ${label}: ${actual.toFixed(4)}`);
    pass++;
  } else {
    console.error(`  ❌ ${label}: got ${actual.toFixed(4)}, expected ${expected.toFixed(4)}`);
    fail++;
  }
}

/* ------------------------------------------------------------------ */
console.log('\n── computeQty ──────────────────────────────────────────');

// sqy: W × H × 1.196
// มู่ลี่ไม้: W=0.85, H=1.75 → 0.85×1.75×1.196 = 1.7784
assert('sqy 0.85×1.75', computeQty('sqy', null, 0.85, 1.75).qty, 0.85 * 1.75 * 1.196);

// sqy: W=2.35, H=2.87 → 2.35×2.87×1.196 = 8.0655
assert('sqy 2.35×2.87', computeQty('sqy', null, 2.35, 2.87).qty, 2.35 * 2.87 * 1.196);

// wave: W=2.54, H=6.78, faceW=1.20
// qty = 2.54×1.20×(6.78+0.5)/0.9144
assert('wave 2.54×6.78 fw=1.20', computeQty('wave', 1.20, 2.54, 6.78).qty, (2.54 * 1.20 * 7.28) / 0.9144);

// wave: default faceW = 1.20
assert('wave default faceW', computeQty('wave', null, 2.00, 3.00).qty, (2.00 * 1.20 * 3.50) / 0.9144);

// wave: sfold faceW = 1.40
assert('wave sfold fw=1.40', computeQty('wave', 1.40, 1.40, 3.09).qty, (1.40 * 1.40 * 3.59) / 0.9144);

/* ------------------------------------------------------------------ */
console.log('\n── computePrice ────────────────────────────────────────');

// qty=44.16, unitPrice=910, discount=30% → price=40185.6, disc=12055.68, net=28129.92
const p1 = computePrice(44.16, 910, 30);
assert('price 44.16×910',    p1.price,    44.16 * 910);
assert('discount 30%',       p1.discount, 44.16 * 910 * 0.30);
assert('net',                p1.net,      44.16 * 910 * 0.70);

// with motor: net=28129.92 + motor=18250 = 46379.92
const p2 = computePrice(44.16, 910, 30, 0, 18250);
assert('total with motor',   p2.total,    44.16 * 910 * 0.70 + 18250);

/* ------------------------------------------------------------------ */
console.log('\n── calcBoqItem ─────────────────────────────────────────');

const item = calcBoqItem({ typeId: 'wood', width: 0.85, height: 1.75, unitPrice: 1950, discountPct: 35 });
assert('wood qty (sqy)',   item.qty,      0.85 * 1.75 * 1.196);
assert('wood price',       item.price,    item.qty * 1950);
assert('wood net 35%',     item.net,      item.price * 0.65);

const item2 = calcBoqItem({ typeId: 'sfold', width: 1.40, height: 3.09, unitPrice: 590, discountPct: 35 });
const expectedQty2 = (1.40 * 1.40 * (3.09 + 0.5)) / 0.9144;
assert('sfold qty (yd)',    item2.qty,     expectedQty2);
assert('sfold unit = yd',   item2.unit === 'yd' ? 1 : 0, 1);

/* ------------------------------------------------------------------ */
console.log('\n── f2 (Thai format) ────────────────────────────────────');
console.log('  f2(28129.92) =', f2(28129.92));
console.log('  f2(0)        =', f2(0));

/* ------------------------------------------------------------------ */
console.log(`\n${'─'.repeat(54)}`);
console.log(`  ${pass} passed  ${fail} failed`);
if (fail > 0) process.exit(1);
