/**
 * VARIUS — Generate restore SQL for all locked product groups
 * Run: node scripts/generate_varius.js
 */
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);
const fs = require('fs');
const path = require('path');

const LOCKED_CATS = [
  'รางม่านจีบ', 'รางม่านลอน', 'รางลอน-กระดุม', 'รางม่านพับ',
  'อุปกรณ์เสริมรางม่าน-แมนนวล',
  'รางม่านจีบ-มอร์เตอร์', 'รางม่านลอน-มอร์เตอร์', 'รางลอน-กระดุม-มอร์เตอร์',
  'อุปกรณ์เสริมรางม่าน-มอร์เตอร์',
  'มู่ลี่อลูมิเนียม', 'รางโชว์',
  'มุ้งจีบ-ประตู', 'มุ้งจีบ-หน้าต่าง',
  'ตะขอสายรวบม่าน', 'ด้ามจูง',
];

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

knex('products')
  .whereIn('category', LOCKED_CATS)
  .orderBy('category').orderBy('id')
  .select('id','code','name','name_en','category','ptype','price','cost_price',
    'unit','face_width','supplier','status','description','width1','width2','reorder_point')
  .then(rows => {
    let sql = 'SET NAMES utf8mb4;\n\n';
    sql += '-- ============================================================\n';
    sql += '-- VARIUS RESTORE SCRIPT — LinSiLin Living\n';
    sql += '-- Generated: 2026-06-01  |  Products: ' + rows.length + ' rows\n';
    sql += '-- กู้คืน 15 กลุ่ม locked products 100%\n';
    sql += '-- วิธีใช้: run ใน MySQL Client หรือ phpMyAdmin\n';
    sql += '-- ============================================================\n\n';

    const cats = [...new Set(rows.map(r => r.category))];
    cats.forEach(cat => {
      const catRows = rows.filter(r => r.category === cat);
      sql += '-- ─────────────────────────────────────\n';
      sql += '-- ' + cat + ' (' + catRows.length + ' รายการ)\n';
      sql += '-- ─────────────────────────────────────\n';
      catRows.forEach(r => {
        const vals = [
          r.id, r.code, r.name, r.name_en, r.category, r.ptype,
          r.price, r.cost_price, r.unit, r.face_width, r.supplier,
          r.status, r.description, r.width1, r.width2, r.reorder_point
        ].map(esc).join(',');
        sql += 'INSERT INTO products\n';
        sql += '  (id,code,name,name_en,category,ptype,price,cost_price,unit,face_width,supplier,status,description,width1,width2,reorder_point)\n';
        sql += 'VALUES (' + vals + ')\n';
        sql += 'ON DUPLICATE KEY UPDATE\n';
        sql += '  code=VALUES(code), name=VALUES(name), name_en=VALUES(name_en),\n';
        sql += '  category=VALUES(category), ptype=VALUES(ptype), price=VALUES(price),\n';
        sql += '  cost_price=VALUES(cost_price), unit=VALUES(unit), face_width=VALUES(face_width),\n';
        sql += '  supplier=VALUES(supplier), status=VALUES(status), description=VALUES(description),\n';
        sql += '  width1=VALUES(width1), width2=VALUES(width2), reorder_point=VALUES(reorder_point);\n\n';
      });
    });

    sql += '-- ============================================================\n';
    sql += '-- VERIFY COUNTS AFTER RESTORE:\n';
    cats.forEach(cat => {
      const cnt = rows.filter(r => r.category === cat).length;
      sql += "-- SELECT COUNT(*) FROM products WHERE category='" + cat.replace(/'/g, "\\'") + "'; -- expect " + cnt + '\n';
    });
    sql += '-- ============================================================\n';

    const outPath = path.join(__dirname, '..', 'varius_restore.sql');
    fs.writeFileSync(outPath, sql, 'utf8');
    const kb = (Buffer.byteLength(sql, 'utf8') / 1024).toFixed(1);
    console.log('✅ VARIUS restore script saved:', outPath);
    console.log('   Rows:', rows.length, '| Size:', kb, 'KB');
    cats.forEach(cat => {
      const cnt = rows.filter(r => r.category === cat).length;
      console.log('  ', cat + ':', cnt);
    });
    knex.destroy();
  })
  .catch(e => { console.error(e.message); knex.destroy(); });
