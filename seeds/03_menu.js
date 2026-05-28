/**
 * Seed the sidebar menu tree (same structure as the original mockup).
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('menu_nodes').del();

  const add = async (parent_id, icon, label, sort) => {
    const [id] = await knex('menu_nodes').insert({ parent_id, icon, label, sort_order: sort });
    return id;
  };

  let s = 0;

  const fabric = await add(null, '🧵', 'ผ้า', s++);
  const fGroup = await add(fabric, '', 'ทึบ-Backout-ทับหลัง', 0);
  await add(fGroup, '', 'ทึบ', 0);
  await add(fGroup, '', 'Backout', 1);
  await add(fGroup, '', 'ทับหลัง', 2);
  await add(fabric, '', 'โปร่ง', 1);

  const rail = await add(null, '🌤️', 'ราง', s++);
  await add(rail, '', 'รางม่านจีบ', 0);
  await add(rail, '', 'รางม่านลอน', 1);
  await add(rail, '', 'รางลอน-กระทุม', 2);

  await add(null, '📜', 'มู่ลี่ไม้', s++);
  await add(null, '🌳', 'มู่ลี่อลูมิเนียม', s++);
  await add(null, '📃', 'ม่านม้วน', s++);
  await add(null, '🪟', 'มุ้งจีบ', s++);
  await add(null, '⚙️', 'มอเตอร์', s++);

  const sw = await add(null, '💡📞', 'สวิตช์ + รีโมท', s++);
  await add(sw, '', 'รีโมท', 0);
  await add(sw, '', 'สวิตช์', 1);

  await add(null, '🪝', 'ตะขอสายรวมม่าน', s++);
  await add(null, '🤚', 'ผ้าซับใน', s++);
};
