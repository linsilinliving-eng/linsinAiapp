const fs = require('fs');
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    database: 'linsilin_nextjs',
    user: 'root',
    password: '',
  },
});

const GROUP_CATEGORY = {
  AA: '🧵 ผ้าม่าน ทึบ-โปร่ง',
  AB: '🪡 ผ้าซับBackout-ผ้าซับหลัง',
  AC: '📦 รางม่าน (แมนนวล)',
  AD: '⚙️ รางม่าน (มอร์เตอร์)',
  AE: '📜 ม่านม้วน',
  AF: '💡📞 สวิตช์ + รีโมท',
  AG: '▤ มู่ลี่ไม้',
  AH: '🪝 ตะขอสายรวมม่าน',
  AI: '🤚 ด้ามจูง',
  AJ: '🏗️ วัสดุก่อสร้าง',
  AK: '▩ มุ้งจีบ',
  AL: '⚙️ มอเตอร์ (มูลี่ไม้-ม่านม้วน)',
  AW: '🏗️ วัสดุก่อสร้าง',
};

function parseRow(line) {
  const fields = [];
  let field = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { fields.push(field); field = ''; }
    else field += ch;
  }
  fields.push(field);
  return fields;
}

function toFloat(s) {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

async function main() {
  const content = fs.readFileSync('C:/Users/acer/Downloads/product.csv', 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseRow(lines[0]);

  const idx = (col) => headers.indexOf(col);
  const H = {
    code: idx('product_code'),
    name: idx('product_name'),
    unit: idx('product_unit'),
    group: idx('product_group'),
    supplier: idx('supplier_name'),
    salePrice: idx('sale_price'),
    status: idx('product_status'),
    clothFace: idx('cloth_face'),
    itemType: idx('item_type'),
    productLower: idx('product_lower'),
    createdAt: idx('created_at'),
    updatedAt: idx('updated_at'),
  };

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const r = parseRow(lines[i]);
    const code = r[H.code]?.trim();
    const group = r[H.group]?.trim();
    if (!code || !group) continue;

    const rawName = r[H.name]?.trim();
    const name = rawName || code;
    const category = GROUP_CATEGORY[group] || group;
    const price = toFloat(r[H.salePrice]);
    const face_width = toFloat(r[H.clothFace]) || null;
    const reorder_point = toFloat(r[H.productLower]) || null;
    const status = r[H.status]?.trim() === 'Y' ? 'active' : 'inactive';
    const ptype = r[H.itemType]?.trim() || null;
    const unit = r[H.unit]?.trim() || 'ชิ้น';
    const supplier = r[H.supplier]?.trim() || null;
    const created_at = r[H.createdAt]?.trim() || new Date().toISOString();
    const updated_at = r[H.updatedAt]?.trim() || new Date().toISOString();

    rows.push({ code, name, category, price, unit, supplier, status, ptype, face_width, reorder_point, stock: 0, created_at, updated_at });
  }

  console.log(`Parsed ${rows.length} rows. Inserting in batches...`);

  const BATCH = 200;
  let inserted = 0, skipped = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    try {
      const result = await knex.raw(
        `INSERT IGNORE INTO products (name, price, category, stock, code, ptype, unit, face_width, reorder_point, supplier, status, created_at, updated_at) VALUES ${batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',')}`,
        batch.flatMap(r => [r.name, r.price, r.category, r.stock, r.code, r.ptype, r.unit, r.face_width, r.reorder_point, r.supplier, r.status, r.created_at, r.updated_at])
      );
      inserted += result[0].affectedRows;
      skipped += batch.length - result[0].affectedRows;
    } catch (e) {
      console.error(`Batch ${i}-${i + BATCH} error:`, e.message);
    }
    process.stdout.write(`\r${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (duplicate code): ${skipped}`);
  await knex.destroy();
}

main().catch(e => { console.error(e); process.exit(1); });
