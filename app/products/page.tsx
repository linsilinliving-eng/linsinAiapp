'use client';

/* ------------------------------------------------------------------ *
 *  Product Database — DB-backed (/products)                            *
 *  LinSiLin Living design system (gray #1f2937 / light #f0f1f3)        *
 *  Products + sidebar menu tree both stored in MySQL.                  *
 * ------------------------------------------------------------------ */

import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ================= types ================= */
interface Product {
  id: number;
  code: string | null;
  name: string;
  name_en: string | null;
  category: string | null;
  ptype: string | null;
  price: string | number;
  unit: string | null;
  face_width: string | number | null;
  reorder_point: string | number | null;
  supplier: string | null;
  status: string;
  description: string | null;
}
interface MenuRow { id: number; parent_id: number | null; icon: string; label: string; sort_order: number; }
interface MenuNodeT extends MenuRow { children: MenuNodeT[]; }

/* ================= helpers ================= */
const CAT_FABRIC = { bg: '#f0f1f3', fg: '#374151' };
const CAT_MOTOR = { bg: '#E5F0FF', fg: '#1F4A8B' };
const CAT_RAIL = { bg: '#FFE5E5', fg: '#8B1F1F' };
const CAT_SLAT = { bg: '#F0E5D5', fg: '#5C3D1F' };
const CAT_REMOTE = { bg: '#E5F0FF', fg: '#1F4A8B' };
const CAT_OTHER = { bg: '#F0EBE0', fg: '#6B6B6B' };

function catColor(category: string | null) {
  const c = category ?? '';
  if (c.includes('ผ้า')) return CAT_FABRIC;
  if (c.includes('ราง')) return CAT_RAIL;
  if (c.includes('มอเตอร์')) return CAT_MOTOR;
  if (c.includes('มู่ลี่')) return CAT_SLAT;
  if (c.includes('รีโมท') || c.includes('สวิตช์')) return CAT_REMOTE;
  return CAT_OTHER;
}
const fmtPrice = (v: string | number) => Number(v || 0).toLocaleString('th-TH');
const fmtReorder = (v: string | number | null) =>
  v === null || v === undefined || v === '' ? '—' : String(parseFloat(String(v)));

function buildTree(rows: MenuRow[]): MenuNodeT[] {
  const map = new Map<number, MenuNodeT>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: MenuNodeT[] = [];
  map.forEach((n) => {
    if (n.parent_id != null && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n);
    else roots.push(n);
  });
  return roots;
}
function flatten(tree: MenuNodeT[], depth = 0, acc: { id: number; label: string; depth: number }[] = []) {
  for (const n of tree) { acc.push({ id: n.id, label: n.label, depth }); flatten(n.children, depth + 1, acc); }
  return acc;
}

function MoveDropdown({ value, items, onChange, onClose }: {
  value: string; items: { id: number; label: string; depth: number }[];
  onChange: (v: string) => void; onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; openUp: boolean } | null>(null);

  React.useEffect(() => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const dropH = Math.min(320, items.length * 30);
      setPos({ top: r.bottom, left: r.left, openUp: spaceBelow < dropH });
    }
  }, [items.length]);

  return (
    <div ref={ref} style={{ display: 'inline-block', minWidth: 160 }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={onClose} />
      {pos && (
        <div style={{
          position: 'fixed',
          top: pos.openUp ? 'auto' : pos.top + 2,
          bottom: pos.openUp ? window.innerHeight - pos.top + 2 : 'auto',
          left: pos.left,
          zIndex: 51,
          background: '#fff',
          border: '1.5px solid #c4c8d0',
          borderRadius: 8,
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          minWidth: 220,
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {items.map((m) => (
            <div key={m.id}
              onClick={m.depth === 0 ? undefined : () => { onChange(m.label); onClose(); }}
              style={{
                padding: m.depth === 0 ? '7px 14px' : '5px 14px 5px ' + (14 + m.depth * 14) + 'px',
                background: m.label === value ? '#1f2937' : m.depth === 0 ? '#e8eaed' : '#fff',
                color: m.label === value ? '#fff' : m.depth === 0 ? '#6b7280' : '#1f2937',
                fontWeight: m.depth === 0 ? 600 : 400,
                fontSize: 12,
                cursor: m.depth === 0 ? 'default' : 'pointer',
                pointerEvents: m.depth === 0 ? 'none' : 'auto',
                borderBottom: m.depth === 0 ? '1px solid #d1d5db' : 'none',
                userSelect: 'none',
              }}
              onMouseEnter={m.depth === 0 ? undefined : e => { if (m.label !== value) (e.currentTarget as HTMLDivElement).style.background = '#f0f1f3'; }}
              onMouseLeave={m.depth === 0 ? undefined : e => { (e.currentTarget as HTMLDivElement).style.background = m.label === value ? '#1f2937' : '#fff'; }}
            >
              {m.depth > 0 && <span style={{ color: '#9ca3af', marginRight: 4 }}>·</span>}{m.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  code: '', name: '', name_en: '', category: '🧵 ผ้า', ptype: 'ทึบ',
  description: '', price: '', unit: 'หลา', face_width: '', reorder_point: '',
  supplier: '', status: 'active',
};
type FormState = typeof EMPTY_FORM;

function Count({ n, color }: { n: number; color?: string }) {
  return <span className="text-xs" style={{ color: color ?? '#A8A8A8' }}>{n}</span>;
}

/* ================= recursive menu node ================= */
function MenuNode({ node, depth, cnt, catFilter, manage, onPick, onDelete }: {
  node: MenuNodeT; depth: number;
  cnt: (kw: string) => number;
  catFilter: string; manage: boolean;
  onPick: (kw: string) => void; onDelete: (n: MenuNodeT) => void;
}) {
  const display = `${node.icon ? node.icon + ' ' : ''}${node.label}`;
  const n = cnt(node.label);
  const hasChildren = node.children.length > 0;

  const delBtn = manage && (
    <button title="ลบเมนูนี้"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(node); }}
      className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
  );

  if (hasChildren) {
    return (
      <details className="group" open>
        <summary className="px-3 py-2 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-stone-200"
          style={{ listStyle: 'none', ...(depth === 0 ? { background: catFilter === node.label ? '#1f2937' : '#e8eaed', fontWeight: 600, color: catFilter === node.label ? '#fff' : '#1f2937' } : { fontWeight: 500, color: '#1f2937' }) }}>
          <span className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); onPick(node.label); }}>
            <span className="pdb-chev text-stone-400 text-xs">▶</span>{display}
          </span>
          <span className="flex items-center gap-1">{delBtn}<Count n={n} color={catFilter === node.label ? 'rgba(255,255,255,.7)' : undefined} /></span>
        </summary>
        <div className="ml-6 mt-1 space-y-0.5 text-xs">
          {node.children.map((c) => (
            <MenuNode key={c.id} node={c} depth={depth + 1} cnt={cnt}
              catFilter={catFilter} manage={manage} onPick={onPick} onDelete={onDelete} />
          ))}
        </div>
      </details>
    );
  }

  const active = catFilter === node.label;
  if (depth === 0) {
    return (
      <div onClick={() => onPick(node.label)}
        className="px-3 py-2 rounded-lg flex items-center justify-between text-xs cursor-pointer hover:bg-stone-100"
        style={active ? { background: '#1f2937', color: '#fff' } : { background: '#e8eaed', fontWeight: 600, color: '#1f2937' }}>
        <span className="flex items-center gap-2"><span className="text-xs inline-block w-3" />{display}</span>
        <span className="flex items-center gap-1">{delBtn}<Count n={n} color={active ? 'rgba(255,255,255,.7)' : undefined} /></span>
      </div>
    );
  }
  return (
    <div onClick={() => onPick(node.label)}
      className="px-3 py-1.5 rounded hover:bg-stone-100 cursor-pointer flex justify-between"
      style={active ? { color: '#1f2937', fontWeight: 600 } : undefined}>
      <span>· {display}</span>
      <span className="flex items-center gap-1">{delBtn}<Count n={n} /></span>
    </div>
  );
}

/* ================= page ================= */
export default function ProductDatabasePage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* menu */
  const [menu, setMenu] = useState<MenuRow[]>([]);
  const [manage, setManage] = useState(false);
  const [mForm, setMForm] = useState({ icon: '', label: '', parent_id: '' });

  /* filters */
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  /* product form */
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  /* quick move-group */
  const [moveId, setMoveId] = useState<number | null>(null);

  /* pagination */
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pdb/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else setError(data.error || 'โหลดข้อมูลไม่สำเร็จ');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/pdb/menu');
      const data = await res.json();
      if (Array.isArray(data)) setMenu(data);
    } catch { /* ignore — sidebar just stays empty */ }
  }, []);

  useEffect(() => { loadProducts(); loadMenu(); }, [loadProducts, loadMenu]);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const cnt = useCallback(
    (kw: string) => products.filter((p) =>
      (p.category ?? '').includes(kw) || (p.ptype ?? '').includes(kw)).length,
    [products],
  );

  const tree = useMemo(() => buildTree(menu), [menu]);
  const flatMenu = useMemo(() => flatten(tree), [tree]);

  const allCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ = !q || [p.code, p.name, p.name_en, p.supplier, p.category, p.ptype, p.description]
        .some((x) => (x ?? '').toLowerCase().includes(q));
      const matchCat = !catFilter || (p.category ?? '').includes(catFilter) || (p.ptype ?? '').includes(catFilter);
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchQ && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => { setPage(1); }, [search, catFilter, statusFilter]);

  const handlePerPage = (pp: number) => { setPerPage(pp); setPage(1); };

  /* ---- product actions ---- */
  function openCreate() { setForm({ ...EMPTY_FORM }); setEditingId(null); setError(''); setView('form'); }
  function openEdit(p: Product) {
    setForm({
      code: p.code ?? '', name: p.name, name_en: p.name_en ?? '',
      category: p.category ?? '🧵 ผ้า', ptype: p.ptype ?? 'ทึบ',
      description: p.description ?? '', price: String(p.price ?? ''), unit: p.unit ?? 'หลา',
      face_width: p.face_width != null ? String(p.face_width) : '',
      reorder_point: p.reorder_point != null ? String(p.reorder_point) : '',
      supplier: p.supplier ?? '', status: p.status ?? 'active',
    });
    setEditingId(p.id); setError(''); setView('form');
  }
  async function save(addAnother: boolean) {
    if (!form.name.trim()) { setError('กรุณาระบุชื่อสินค้า'); return; }
    setSaving(true); setError('');
    try {
      const url = editingId ? `/api/pdb/products/${editingId}` : '/api/pdb/products';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      setForm({ ...EMPTY_FORM }); setEditingId(null);
      await loadProducts();
      if (!addAnother) setView('list');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function remove(p: Product) {
    if (!confirm(`ลบสินค้า "${p.name}" ?`)) return;
    try {
      const res = await fetch(`/api/pdb/products/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');
      await loadProducts();
    } catch (e: any) { setError(e.message); }
  }
  async function moveCategory(p: Product, newCat: string) {
    setMoveId(null);
    if (newCat === p.category) return;
    try {
      const res = await fetch(`/api/pdb/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: p.code, name: p.name, name_en: p.name_en,
          category: newCat, ptype: p.ptype,
          price: p.price, unit: p.unit,
          face_width: p.face_width, reorder_point: p.reorder_point,
          supplier: p.supplier, status: p.status, description: p.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ย้ายกลุ่มไม่สำเร็จ');
      await loadProducts();
    } catch (e: any) { setError(e.message); }
  }

  const pickCat = (kw: string) => { setCatFilter(kw); setView('list'); };

  /* ---- menu actions ---- */
  async function addMenu() {
    if (!mForm.label.trim()) { setError('กรุณาระบุชื่อเมนู'); return; }
    try {
      const res = await fetch('/api/pdb/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icon: mForm.icon.trim(),
          label: mForm.label.trim(),
          parent_id: mForm.parent_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เพิ่มเมนูไม่สำเร็จ');
      setMForm({ icon: '', label: '', parent_id: '' });
      await loadMenu();
    } catch (e: any) { setError(e.message); }
  }
  async function deleteMenu(node: MenuNodeT) {
    const extra = node.children.length ? ` (รวมเมนูย่อย ${node.children.length} รายการ)` : '';
    if (!confirm(`ลบเมนู "${node.label}"${extra} ?`)) return;
    try {
      const res = await fetch(`/api/pdb/menu/${node.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบเมนูไม่สำเร็จ');
      await loadMenu();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="pdb-root">
      <style>{CSS}</style>

      {/* ===== Top Nav ===== */}
      <header style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e4e9' }}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: '#1f2937', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>LSL</div>
            <span style={{ color: '#d1d5db' }}>/</span>
            <div className="text-base font-semibold" style={{ color: '#111827' }}>ฐานข้อมูลสินค้า</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/products/forms" className="text-sm hover:underline" style={{ color: '#374151' }}>
              📋 ฟอร์มเต็ม (12 หมวด)
            </Link>
            <span style={{ color: '#6b7280' }}>คุณศลิษา เสนหิรัญ</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#374151' }}>ศ</div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">

        {/* ---------- Sidebar ---------- */}
        <aside className="py-8 px-4 border-r border-stone-200" style={{ minWidth: 260, width: 260, minHeight: 'calc(100vh - 64px)', background: '#fff' }}>
          <div className="mb-5 p-3 rounded-lg border-2 border-dashed" style={{ background: '#f0f1f3', borderColor: '#c4c8d0' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>🎯 Smart Filter</div>
            <div className="text-xs text-stone-600 mb-2">{catFilter ? `กำลังกรอง: ${catFilter}` : 'แสดงทุกหมวด'}</div>
            <div className="text-xs" style={{ color: '#166534' }}>✓ {filtered.length} รายการที่ตรงเงื่อนไข</div>
            <button onClick={() => { setCatFilter(''); setSearch(''); setStatusFilter(''); }}
              className="text-xs text-stone-500 underline mt-1">ล้างฟิลเตอร์</button>
          </div>

          <div className="flex items-center justify-between mb-2 px-3">
            <div className="text-lg tracking-wider text-stone-400 uppercase">หมวด</div>
            <button onClick={() => setManage((m) => !m)}
              className="text-xs px-2 py-0.5 rounded"
              style={manage ? { background: '#1f2937', color: '#fff' } : { color: '#6b7280' }}>
              {manage ? '✓ เสร็จ' : '⚙️ จัดการเมนู'}
            </button>
          </div>

          <nav className="space-y-0.5">
            <div onClick={() => pickCat('')}
              className="px-3 py-2 rounded-lg flex items-center justify-between text-sm cursor-pointer hover:bg-stone-100"
              style={catFilter === '' ? { background: '#1f2937', color: '#fff' } : undefined}>
              <span className="flex items-center gap-2"><span className="text-xs inline-block w-3" />📦 ทั้งหมด</span>
              <Count n={products.length} color={catFilter === '' ? 'rgba(255,255,255,.7)' : undefined} />
            </div>

            {tree.map((node) => (
              <MenuNode key={node.id} node={node} depth={0} cnt={cnt}
                catFilter={catFilter} manage={manage} onPick={pickCat} onDelete={deleteMenu} />
            ))}

            {tree.length === 0 && (
              <div className="px-3 py-2 text-xs text-stone-400">ยังไม่มีเมนู</div>
            )}
          </nav>

          {/* add-menu panel */}
          {manage && (
            <div className="mt-4 p-3 rounded-lg" style={{ background: '#f0f1f3', border: '1px solid #e2e4e9' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: '#374151' }}>➕ เพิ่มเมนูย่อย / รายการ</div>
              <div className="flex gap-2 mb-2">
                <input value={mForm.icon} onChange={(e) => setMForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="ไอคอน" className="pdb-input" style={{ width: 64, textAlign: 'center' }} />
                <input value={mForm.label} onChange={(e) => setMForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="ชื่อเมนู" className="pdb-input flex-1" />
              </div>
              <select value={mForm.parent_id} onChange={(e) => setMForm((f) => ({ ...f, parent_id: e.target.value }))}
                className="pdb-input mb-2">
                <option value="">— เมนูหลัก (บนสุด) —</option>
                {flatMenu.map((m) => (
                  <option key={m.id} value={m.id}>{'  '.repeat(m.depth)}↳ {m.label}</option>
                ))}
              </select>
              <button onClick={addMenu}
                className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#1f2937' }}>
                + เพิ่มเมนู
              </button>
              <div className="text-[10px] text-stone-500 mt-2">เลือก “เมนูหลัก” = หมวดบนสุด · เลือกเมนูอื่น = เมนูย่อยใต้เมนูนั้น</div>
            </div>
          )}

          <div className="mt-4 px-3 text-[10px] tracking-wider text-stone-400 uppercase border-t border-stone-200 pt-3">
            เมนู + ตัวเลข นับจากฐานข้อมูลจริง
          </div>
        </aside>

        {/* ---------- Main ---------- */}
        <main className="flex-1 p-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light mb-1" style={{ color: '#111827' }}>📦 สินค้าทั้งหมด</h1>
              <p className="text-sm text-stone-500">
                {loading ? 'กำลังโหลด…' : `${products.length} รายการ · แสดง ${filtered.length} · ข้อมูลจากฐานข้อมูล`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setView('list')}
                className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                style={view === 'list'
                  ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937' }
                  : { background: '#fff', color: '#6B6B6B', borderColor: '#e2e4e9' }}>📋 รายการ</button>
              <button onClick={openCreate}
                className="px-4 py-2 rounded-lg text-sm border-2"
                style={view === 'form'
                  ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937' }
                  : { background: '#fff', color: '#6B6B6B', borderColor: '#e2e4e9' }}>+ เพิ่มใหม่</button>
            </div>
          </div>

          {error && view === 'list' && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FFE5E5', color: '#8B1F1F' }}>⚠️ {error}</div>
          )}

          {view === 'list' && (
            <>
              <div className="bg-white rounded-xl pdb-shadow p-4 mb-5 flex items-center gap-3">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 ค้นหา รหัส / ชื่อ / supplier..." className="pdb-input" style={{ width: 280 }} />
                <select className="pdb-input" style={{ width: 180 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                  <option value="">หมวดทั้งหมด</option>
                  <option value="ผ้า">🧵 ผ้า</option>
                  <option value="ราง">🌤️ ราง</option>
                  <option value="มอเตอร์">⚙️ มอเตอร์</option>
                  <option value="มู่ลี่">📜 มู่ลี่</option>
                  <option value="รีโมท">📞 รีโมท</option>
                </select>
                <select className="pdb-input" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">สถานะทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="paused">พักขาย</option>
                  <option value="discontinued">หยุดขาย</option>
                </select>
              </div>

              <div className="bg-white rounded-xl pdb-shadow overflow-hidden">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 200 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 220 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 180 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 90 }} />
                    <col style={{ width: 70 }} />
                    <col style={{ width: 90 }} />
                  </colgroup>
                  <thead style={{ background: '#f4f5f7' }}>
                    <tr className="text-xs uppercase tracking-wider" style={{ color: '#1f2937' }}>
                      <th className="text-left py-3 px-4">Supplier</th>
                      <th className="text-left py-3 px-4">รหัส</th>
                      <th className="text-left py-3 px-4">ข้อมูลสินค้า</th>
                      <th className="text-center py-3 px-4">จัดการ</th>
                      <th className="text-left py-3 px-4">หมวด</th>
                      <th className="text-right py-3 px-4">หน้าผ้า</th>
                      <th className="text-right py-3 px-4">ราคา</th>
                      <th className="text-left py-3 px-4">หน่วย</th>
                      <th className="text-center py-3 px-4">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading && <tr><td colSpan={9} className="py-10 text-center text-stone-400">กำลังโหลด…</td></tr>}
                    {!loading && filtered.length === 0 && (
                      <tr><td colSpan={9} className="py-10 text-center text-stone-400">ไม่พบสินค้าที่ตรงเงื่อนไข</td></tr>
                    )}
                    {!loading && paginatedProducts.map((p) => {
                      const cc = catColor(p.category);
                      const off = p.status === 'discontinued';
                      return (
                        <tr key={p.id} onClick={() => openEdit(p)}
                          className={`hover:bg-stone-50 transition cursor-pointer ${off ? 'opacity-60' : ''}`}>
                          <td className="py-3 px-4 text-sm text-stone-600" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.supplier || '—'}</td>
                          <td className="py-3 px-4 font-mono text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.code || '—'}</td>
                          <td className="py-3 px-4 font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                              className="px-2 py-1 rounded hover:bg-stone-200" title="แก้ไข">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); remove(p); }}
                              className="px-2 py-1 rounded hover:bg-red-100" title="ลบ">🗑️</button>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {moveId === p.id ? (
                              <MoveDropdown
                                value={p.category ?? ''}
                                items={flatMenu}
                                onChange={(v) => moveCategory(p, v)}
                                onClose={() => setMoveId(null)}
                              />
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  title="ย้ายกลุ่มสินค้า"
                                  onClick={(e) => { e.stopPropagation(); setMoveId(p.id); }}
                                  className="pdb-movebtn"
                                >⇄</button>
                                <span className="pdb-badge" style={{ background: cc.bg, color: cc.fg }}>{p.category || '—'}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-sm whitespace-nowrap">{p.face_width != null && p.face_width !== '' ? p.face_width : '—'}</td>
                          <td className={`py-3 px-4 text-right font-medium whitespace-nowrap ${off ? 'text-stone-400' : ''}`}>{fmtPrice(p.price)}</td>
                          <td className="py-3 px-4 text-sm text-stone-600 whitespace-nowrap">฿/{p.unit || 'ชิ้น'}</td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {p.status === 'active' && <span className="pdb-badge" style={{ background: '#D1F2D7', color: '#166534' }}>ใช้งาน</span>}
                            {p.status === 'paused' && <span className="pdb-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>พักขาย</span>}
                            {p.status === 'discontinued' && <span className="pdb-badge" style={{ background: '#FFE5E5', color: '#8B1F1F' }}>หยุดขาย</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pdb-pagination">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginRight: 'auto' }}>
                  แสดง
                  {[10, 20, 30].map((n) => (
                    <button key={n} className="pdb-page-btn"
                      style={perPage === n ? { background: '#1f2937', color: '#fff', borderColor: '#1f2937', padding: '4px 10px' } : { padding: '4px 10px' }}
                      onClick={() => handlePerPage(n)}>{n}</button>
                  ))}
                  รายการ
                  <span style={{ marginLeft: 8 }}>· {filtered.length} รายการที่กรอง / {products.length} ทั้งหมด</span>
                </div>
                <button className="pdb-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← ก่อนหน้า</button>
                <span style={{ fontSize: 13, color: '#6b7280' }}>หน้า {page} / {totalPages || 1}</span>
                <button className="pdb-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>ถัดไป →</button>
              </div>
            </>
          )}

          {/* ===== Add / Edit Form ===== */}
          {view === 'form' && (
            <div className="bg-white rounded-xl pdb-shadow p-8">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                <h2 className="text-xl font-medium" style={{ color: '#1f2937' }}>
                  {editingId ? `✏️ แก้ไขสินค้า — ${form.code || form.name}` : '+ เพิ่มสินค้าใหม่'}
                </h2>
                <button onClick={() => setView('list')} className="text-stone-400 hover:text-stone-600">✕</button>
              </div>

              <div className="mb-5">
                <label className="pdb-label">ชื่อผู้ขาย</label>
                <input type="text" value={form.supplier} onChange={(e) => set('supplier', e.target.value)}
                  className="pdb-input" placeholder="เช่น SMILE Design, SOMFY Thailand, บริษัท ธาวัน เดคคอน 2001 จำกัด" />
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: '#FFE5E5', color: '#8B1F1F' }}>⚠️ {error}</div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9ca3af' }}>ข้อมูลหลัก</div>
                  <div>
                    <label className="pdb-label">รหัสสินค้า</label>
                    <input type="text" value={form.code} onChange={(e) => set('code', e.target.value)}
                      className="pdb-input font-mono" placeholder="เช่น F-CR-103" />
                  </div>
                  <div>
                    <label className="pdb-label">ข้อมูลสินค้า <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="pdb-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="pdb-label">หมวด <span className="text-red-500">*</span></label>
                      <select className="pdb-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                        <option value="">-- เลือกหมวด --</option>
                        {flatMenu.map((m) => {
                          const row = menu.find((r) => r.id === m.id);
                          const icon = row?.icon ? row.icon + ' ' : '';
                          return m.depth === 0
                            ? <option key={m.id} value="" disabled style={{ fontWeight: 600, color: '#6b7280', background: '#e8eaed' }}>── {icon}{m.label} ──</option>
                            : <option key={m.id} value={m.label}>{'· '.repeat(m.depth - 1)}{m.label}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="pdb-label">ประเภทผ้า</label>
                      <select className="pdb-input" value={form.ptype} onChange={(e) => set('ptype', e.target.value)}>
                        <option>ทึบ</option>
                        <option>โปร่ง</option>
                        <option>Backout</option>
                        <option>ซับหลัง</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="pdb-label">รายละเอียด</label>
                    <textarea className="pdb-input" rows={3} placeholder="คุณสมบัติพิเศษ, สีผ้า, เทรนด์..."
                      value={form.description} onChange={(e) => set('description', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9ca3af' }}>ราคา + ข้อมูลทางการค้า</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="pdb-label">ราคาขาย <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className="pdb-input pr-12" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">฿</span>
                      </div>
                    </div>
                    <div>
                      <label className="pdb-label">หน่วย <span className="text-red-500">*</span></label>
                      <select className="pdb-input" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                        <option>หลา</option><option>เมตร</option><option>SQM</option><option>ชุด</option><option>ตัว</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="pdb-label">หน้ากว้างผ้า (P)</label>
                    <div className="relative">
                      <input type="number" step={0.01} value={form.face_width} onChange={(e) => set('face_width', e.target.value)} className="pdb-input pr-12" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">m</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="pdb-label">ขั้นต่ำสั่งซื้อ</label>
                      <input type="number" step={0.1} value={form.reorder_point} onChange={(e) => set('reorder_point', e.target.value)} className="pdb-input" />
                    </div>
                    <div>
                      <label className="pdb-label">Supplier</label>
                      <select className="pdb-input" value={form.supplier} onChange={(e) => set('supplier', e.target.value)}>
                        <option value="">-- เลือก --</option>
                        <option>SMILE Design</option>
                        <option>SOMFY Thailand</option>
                        <option>Decorail Co.</option>
                        <option>Hunter Douglas TH</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="pdb-label">สถานะ</label>
                    <div className="flex gap-3">
                      {[['active', '✓ ใช้งาน'], ['paused', '⏸️ พักขาย'], ['discontinued', '✕ หยุดขาย']].map(([v, l]) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="status" checked={form.status === v} onChange={() => set('status', v)} />
                          <span className="text-sm">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="pdb-label">รูปสินค้า</label>
                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
                      <div className="text-3xl mb-2">📷</div>
                      <div className="text-sm text-stone-600">ลากรูปมาวาง หรือคลิกเพื่อเลือก</div>
                      <div className="text-xs text-stone-400 mt-1">JPG, PNG ขนาดไม่เกิน 5MB</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-stone-100">
                <button onClick={() => setView('list')} disabled={saving}
                  className="px-6 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100">ยกเลิก</button>
                {!editingId && (
                  <button onClick={() => save(true)} disabled={saving}
                    className="px-6 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50">💾 บันทึก + เพิ่มอีก</button>
                )}
                <button onClick={() => save(false)} disabled={saving}
                  className="px-8 py-2.5 rounded-lg text-white font-medium" style={{ background: '#1f2937', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'กำลังบันทึก…' : editingId ? '✓ บันทึกการแก้ไข' : '✓ บันทึก'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="text-center py-6 text-xs text-stone-400">
        ฐานข้อมูลสินค้า · ลินศิลิน ลิฟวิ่ง · 2026
      </footer>
    </div>
  );
}

const CSS = `
.pdb-root{font-family:'Sarabun',sans-serif;background:#f0f1f3;color:#111827;min-height:100vh}
.pdb-shadow{box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 24px rgba(0,0,0,0.07)}
.pdb-input{border:1.5px solid #e2e4e9;border-radius:8px;padding:10px 14px;width:100%;font-size:14px;background:#fafafa;color:#111827;transition:all .2s}
.pdb-input:focus{border-color:#374151;outline:none;background:#fff;box-shadow:0 0 0 3px rgba(55,65,81,0.1)}
.pdb-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;display:block}
.pdb-badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:500}
.pdb-chev{transition:transform .15s;display:inline-block}
.pdb-movebtn{font-size:13px;color:#9ca3af;padding:1px 5px;border-radius:5px;border:1.5px solid #e2e4e9;background:#f4f5f7;cursor:pointer;line-height:1.4;transition:all .15s}
.pdb-movebtn:hover{color:#1f2937;border-color:#9ca3af;background:#e8eaed}
.pdb-pagination{display:flex;align-items:center;gap:8px;margin-top:20px;justify-content:flex-end}
.pdb-page-btn{border:1px solid #e2e4e9;background:#fff;border-radius:6px;padding:5px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:all .15s}
.pdb-page-btn:hover:not(:disabled){background:#f0f1f3;border-color:#c4c8d0}
.pdb-page-btn:disabled{opacity:.4;cursor:default}
.pdb-root details[open]>summary .pdb-chev{transform:rotate(90deg)}
.pdb-root summary::-webkit-details-marker{display:none}
.pdb-root summary{list-style:none}
`;
