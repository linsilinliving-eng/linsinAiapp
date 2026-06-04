/**
 * Import customers from legacy CSV export into new customers schema.
 * Usage: node scripts/import_customers.js
 */
const fs = require('fs');
const path = require('path');
const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const CSV_PATH = 'C:\\Users\\acer\\Downloads\\customer.csv';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

function parseLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function extractPostal(text) {
  if (!text) return null;
  const m = text.match(/\b(\d{5})\b/);
  return m ? m[1] : null;
}

function extractProvince(text) {
  if (!text) return '';
  if (text.includes('กรุงเทพ')) return 'กรุงเทพมหานคร';
  // Try to match จังหวัด XXX or just the province name after postal
  const m = text.match(/จังหวัด\s*(\S+)/);
  if (m) return m[1];
  return '';
}

function firstPhone(tel) {
  if (!tel) return null;
  return tel.split(/[\/,]/, 1)[0].trim() || null;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} rows from CSV`);

  // Clear existing data (FK order)
  await knex('customer_service_flag_history').del();
  await knex('customer_contacts').del();
  await knex('customer_addresses').del();
  await knex('customers').del();
  console.log('Cleared existing customer data');

  let indCount = 0;
  let corCount = 0;
  let inserted = 0;

  for (const row of rows) {
    const cusCode = row['cus_id']?.trim();
    if (!cusCode) continue;

    const rawType = row['cus_type']?.trim();
    const cusType = rawType === 'P' ? 'individual' : 'company';

    let categoryCode;
    if (cusType === 'individual') {
      indCount++;
      categoryCode = `IND-${String(indCount).padStart(3, '0')}`;
    } else {
      corCount++;
      categoryCode = `COR-${String(corCount).padStart(3, '0')}`;
    }

    const branchRaw = row['branch_type']?.trim();
    const branchType = branchRaw === 'HO' ? 'HO' : branchRaw === 'BR' ? 'BR' : '-';

    const creditDayRaw = parseInt(row['credit_day'], 10);
    const creditDay = isNaN(creditDayRaw) ? 0 : creditDayRaw;

    const [cusId] = await knex('customers').insert({
      cus_code: cusCode,
      category_code: categoryCode,
      cus_type: cusType,
      cus_name: row['cus_name']?.trim() || cusCode,
      tax_id: row['cus_tax']?.trim() || null,
      branch_type: branchType,
      branch_no: row['branch_no']?.trim() || null,
      business_type: '',
      sales_grade: 'normal',
      service_flag: 'normal',
      source_channels: '[]',
      commission_type: 'none',
      commission_value: 0,
      credit_day: creditDay,
      status: 'active',
      remark: row['remark']?.trim() || null,
      created_at: row['created_at']?.trim() || knex.fn.now(),
    });

    // Address from cus_address + cus_address2
    const addr1 = row['cus_address']?.trim();
    const addr2 = row['cus_address2']?.trim();
    if (addr1 || addr2) {
      const postal = extractPostal(addr2) || extractPostal(addr1);
      const province = extractProvince(addr2) || extractProvince(addr1);
      await knex('customer_addresses').insert({
        customer_id: cusId,
        label: 'หลัก',
        is_default: true,
        use_for_invoice: true,
        use_for_shipping: true,
        use_for_install: true,
        address_line1: addr1 || '',
        sub_district: '',
        district: '',
        province: province,
        postal_code: postal || '',
        note: addr2 || null,
      });
    }

    // Contact
    const contactName = row['cus_contact']?.trim();
    const phone1 = firstPhone(row['cus_tel']);
    const email = row['cus_email']?.trim() || null;
    if (contactName || phone1 || email) {
      await knex('customer_contacts').insert({
        customer_id: cusId,
        full_name: contactName || '',
        nickname: null,
        roles: '[]',
        phone1: phone1,
        phone2: null,
        email: email,
        is_primary: true,
        display_order: 0,
      });
    }

    inserted++;
    if (inserted % 50 === 0) console.log(`  ...${inserted} customers inserted`);
  }

  console.log(`Done: ${inserted} customers, ${indCount} individual (IND), ${corCount} company (COR)`);
  await knex.destroy();
}

main().catch(err => { console.error(err); process.exit(1); });
