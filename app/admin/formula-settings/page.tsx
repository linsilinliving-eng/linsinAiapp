'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container, Title, Text, Paper, Tabs, Table, ActionIcon, Group,
  Button, Modal, Stack, TextInput, NumberInput, Select, Badge,
  Breadcrumbs, Anchor, Box, Skeleton, Tooltip, Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import {
  IconChevronRight, IconEdit, IconTrash, IconPlus, IconCopy,
  IconRuler, IconTools,
} from '@tabler/icons-react';

/* ------------------------------------------------------------------ */
interface TypeConfig {
  id: number;
  type_id: string;
  type_label: string;
  formula_group: string;
  face_width: number | null;
  unit: string;
  rail_cat_motor: string | null;
  rail_cat_manual: string | null;
}

interface SewingCombo {
  id: number;
  type_id: string;
  combo_key: string;
  label: string;
  system: 'manual' | 'motor';
  sewing_rate: number;
  setup_rate: number;
  sort_order: number;
  is_active: boolean;
}

const ACCENT = '#1F3A3A';
const GOLD   = '#C9A581';

/* ------------------------------------------------------------------ */
export default function FormulaSettingsPage() {
  const [types, setTypes]   = useState<TypeConfig[]>([]);
  const [combos, setCombos] = useState<SewingCombo[]>([]);
  const [loading, setLoading] = useState(true);

  /* type edit modal */
  const [editType, setEditType]   = useState<TypeConfig | null>(null);
  const [typeModal, setTypeModal] = useState(false);
  const [typeSaving, setTypeSaving] = useState(false);

  /* combo edit/add modal */
  const [editCombo, setEditCombo]   = useState<SewingCombo | null>(null);
  const [comboModal, setComboModal] = useState(false);
  const [comboSaving, setComboSaving] = useState(false);

  /* combo form state */
  const [cTypeId,     setCTypeId]     = useState('sfold');
  const [cComboKey,   setCComboKey]   = useState('');
  const [cLabel,      setCLabel]      = useState('');
  const [cSystem,     setCSystem]     = useState<'manual'|'motor'>('manual');
  const [cSewing,     setCSewing]     = useState<number | string>(0);
  const [cSetup,      setCSetup]      = useState<number | string>(0);
  const [cSort,       setCSort]       = useState<number | string>(0);
  const [cHMin,       setCHMin]       = useState<number | string>('');
  const [cHMax,       setCHMax]       = useState<number | string>('');
  const [cActive,     setCActive]     = useState(true);

  /* type form state */
  const [tFaceW,        setTFaceW]        = useState<number | string>('');
  const [tThreshold,    setTThreshold]    = useState<number | string>('');
  const [tMotor,        setTMotor]        = useState('');
  const [tManual,       setTManual]       = useState('');
  const [tFormulaGroup, setTFormulaGroup] = useState('wave');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, cr] = await Promise.all([
        fetch('/api/formula-config/types').then(r => r.json()),
        fetch('/api/formula-config/combos').then(r => r.json()),
      ]);
      setTypes(Array.isArray(tr) ? tr : []);
      setCombos(Array.isArray(cr) ? cr : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Type config ── */
  const openTypeEdit = (t: TypeConfig) => {
    setEditType(t);
    setTFaceW(t.face_width ?? '');
    setTThreshold((t as any).height_threshold ?? '');
    setTMotor(t.rail_cat_motor ?? '');
    setTManual(t.rail_cat_manual ?? '');
    setTFormulaGroup(t.formula_group ?? 'wave');
    setTypeModal(true);
  };

  const saveType = async () => {
    if (!editType) return;
    setTypeSaving(true);
    try {
      const res = await fetch('/api/formula-config/types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_id: editType.type_id,
          face_width:       tFaceW     !== '' ? Number(tFaceW)     : null,
          height_threshold: tThreshold !== '' ? Number(tThreshold) : null,
          rail_cat_motor: tMotor,
          rail_cat_manual: tManual,
          formula_group: tFormulaGroup,
        }),
      });
      if (!res.ok) throw new Error();
      notifications.show({ title: 'บันทึกแล้ว', message: `แก้ไข ${editType.type_label} สำเร็จ`, color: 'green' });
      setTypeModal(false);
      load();
    } catch {
      notifications.show({ title: 'ผิดพลาด', message: 'บันทึกไม่สำเร็จ', color: 'red' });
    } finally {
      setTypeSaving(false);
    }
  };

  /* ── Combo ── */
  const openComboAdd = () => {
    setEditCombo(null);
    setCTypeId('sfold'); setCComboKey(''); setCLabel('');
    setCSystem('manual'); setCSewing(0); setCSetup(0); setCSort(0); setCHMin(''); setCHMax(''); setCActive(true);
    setComboModal(true);
  };

  const openComboCopy = (c: SewingCombo) => {
    setEditCombo(null);
    setCTypeId(c.type_id); setCComboKey(''); setCLabel(c.label);
    setCSystem(c.system); setCSewing(c.sewing_rate); setCSetup(c.setup_rate);
    setCSort(c.sort_order); setCHMin((c as any).height_min ?? ''); setCHMax((c as any).height_max ?? ''); setCActive(c.is_active);
    setComboModal(true);
  };

  const openComboEdit = (c: SewingCombo) => {
    setEditCombo(c);
    setCTypeId(c.type_id); setCComboKey(c.combo_key); setCLabel(c.label);
    setCSystem(c.system); setCSewing(c.sewing_rate); setCSetup(c.setup_rate);
    setCSort(c.sort_order); setCHMin((c as any).height_min ?? ''); setCHMax((c as any).height_max ?? ''); setCActive(c.is_active);
    setComboModal(true);
  };

  const saveCombo = async () => {
    setComboSaving(true);
    const payload = {
      id: editCombo?.id,
      type_id: cTypeId, combo_key: cComboKey, label: cLabel,
      system: cSystem, sewing_rate: Number(cSewing), setup_rate: Number(cSetup),
      sort_order: Number(cSort),
      height_min: cHMin !== '' ? Number(cHMin) : null,
      height_max: cHMax !== '' ? Number(cHMax) : null,
      is_active: cActive,
    };
    try {
      const res = await fetch('/api/formula-config/combos', {
        method: editCombo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      notifications.show({ title: 'บันทึกแล้ว', message: editCombo ? 'แก้ไข Combo สำเร็จ' : 'เพิ่ม Combo สำเร็จ', color: 'green' });
      setComboModal(false);
      load();
    } catch {
      notifications.show({ title: 'ผิดพลาด', message: 'บันทึกไม่สำเร็จ', color: 'red' });
    } finally {
      setComboSaving(false);
    }
  };

  const deleteCombo = (c: SewingCombo) => {
    modals.openConfirmModal({
      title: 'ยืนยันการลบ',
      children: <Text size="sm">ลบ <strong>{c.label}</strong> ออกจากระบบ?</Text>,
      labels: { confirm: 'ลบ', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      centered: true,
      radius: 'lg',
      onConfirm: async () => {
        await fetch(`/api/formula-config/combos?id=${c.id}`, { method: 'DELETE' });
        notifications.show({ title: 'ลบแล้ว', message: c.label, color: 'orange' });
        load();
      },
    });
  };

  const breadcrumbs = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'กำหนดสูตร BOQ', href: '/admin/formula-settings' },
  ].map((item, i) => (
    <Anchor href={item.href} key={i} size="sm" c="dimmed">{item.title}</Anchor>
  ));

  /* group combos by type_id for display */
  const combosByType: Record<string, SewingCombo[]> = {};
  for (const c of combos) {
    if (!combosByType[c.type_id]) combosByType[c.type_id] = [];
    combosByType[c.type_id].push(c);
  }

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Box>
          <Breadcrumbs separator={<IconChevronRight size={12} stroke={1.5} />} mb="xs">
            {breadcrumbs}
          </Breadcrumbs>
          <Title order={2} fw={800} style={{ letterSpacing: '-1px' }}>กำหนดสูตร BOQ</Title>
          <Text size="sm" c="dimmed">ตั้งค่าสูตรคำนวณและค่าเย็บ-ค่าติดตั้งสำหรับผ้าม่านแต่ละประเภท</Text>
        </Box>

        <Tabs defaultValue="types" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="types"  leftSection={<IconRuler  size={16} />}>ตั้งค่าสูตรต่อประเภท</Tabs.Tab>
            <Tabs.Tab value="combos" leftSection={<IconTools  size={16} />}>COMBO ค่าเย็บ-ค่าติดตั้ง</Tabs.Tab>
          </Tabs.List>

          {/* ── Tab 1: Type config ── */}
          <Tabs.Panel value="types">
            <Paper withBorder radius="lg" p="md" shadow="sm">
              <Text size="sm" c="dimmed" mb="md">
                กำหนด faceW default และหมวดสินค้ารางสำหรับแต่ละประเภท (formula_group และ unit ไม่สามารถแก้ได้จาก UI เนื่องจากกำหนดโดยสูตรฟิสิกส์)
              </Text>
              <Table verticalSpacing="sm" horizontalSpacing="md" withRowBorders>
                <Table.Thead style={{ background: ACCENT }}>
                  <Table.Tr>
                    {['ประเภท', 'สูตร', 'หน่วย', 'faceW', 'H threshold', 'ราง (มอเตอร์)', 'ราง (แมนวล)', ''].map((h, i) => (
                      <Table.Th key={i} style={{ borderBottom: 'none' }}>
                        <Text size="12px" fw={700} c="white" tt="uppercase">{h}</Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <Table.Tr key={i}>
                        <Table.Td colSpan={7}><Skeleton height={36} radius="md" /></Table.Td>
                      </Table.Tr>
                    ))
                  ) : types.map(t => (
                    <Table.Tr key={t.type_id}>
                      <Table.Td>
                        <Text size="sm" fw={600}>{t.type_label}</Text>
                        <Text size="xs" c="dimmed" ff="monospace">{t.type_id}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm"
                          color={t.formula_group === 'sfold' ? 'violet' : t.formula_group === 'wave' ? 'blue' : 'teal'}
                          variant="light">
                          {t.formula_group}
                        </Badge>
                      </Table.Td>
                      <Table.Td><Text size="sm">{t.unit}</Text></Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={t.face_width ? 600 : 400} c={t.face_width ? undefined : 'dimmed'}>
                          {t.face_width ?? '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={(t as any).height_threshold ? 600 : 400} c={(t as any).height_threshold ? 'orange' : 'dimmed'}>
                          {(t as any).height_threshold ? `> ${(t as any).height_threshold} m` : '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c={t.rail_cat_motor ? undefined : 'dimmed'} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.rail_cat_motor ?? '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c={t.rail_cat_manual ? undefined : 'dimmed'} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.rail_cat_manual ?? '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="แก้ไข">
                          <ActionIcon variant="subtle" color={ACCENT} onClick={() => openTypeEdit(t)} radius="md">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          {/* ── Tab 2: Combo ── */}
          <Tabs.Panel value="combos">
            <Paper withBorder radius="lg" p="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">ค่าเย็บ (฿/ม.) และค่าติดตั้ง (฿/ชุด) แยกตามประเภทและระบบ</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openComboAdd} radius="xl" size="sm"
                  style={{ background: ACCENT, color: '#fff' }}>
                  เพิ่ม Combo
                </Button>
              </Group>

              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} height={40} radius="md" mb="xs" />)
              ) : Object.entries(combosByType).map(([tid, cs]) => (
                <Box key={tid} mb="xl">
                  <Text fw={700} size="sm" mb="xs" style={{ color: ACCENT }}>
                    ● {types.find(t => t.type_id === tid)?.type_label ?? tid}
                    <Text span size="xs" c="dimmed" ff="monospace" ml={8}>{tid}</Text>
                  </Text>
                  <Table verticalSpacing="xs" horizontalSpacing="md" withRowBorders>
                    <Table.Thead style={{ background: '#F8F5F0' }}>
                      <Table.Tr>
                        {['Key', 'Label', 'ระบบ', 'ค่าเย็บ (฿/ม.)', 'ค่าติดตั้ง (฿/ชุด)', 'H min', 'H max', 'ลำดับ', 'สถานะ', ''].map((h, i) => (
                          <Table.Th key={i}><Text size="11px" fw={600} c="dimmed" tt="uppercase">{h}</Text></Table.Th>
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {cs.map(c => (
                        <Table.Tr key={c.id} style={{ opacity: c.is_active ? 1 : 0.45 }}>
                          <Table.Td><Text size="xs" ff="monospace">{c.combo_key}</Text></Table.Td>
                          <Table.Td><Text size="sm" fw={500}>{c.label}</Text></Table.Td>
                          <Table.Td>
                            <Badge size="sm" color={c.system === 'motor' ? 'grape' : 'gray'} variant="light">
                              {c.system === 'motor' ? 'มอเตอร์' : 'แมนวล'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600} style={{ color: GOLD }}>
                              {c.sewing_rate.toLocaleString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600} style={{ color: GOLD }}>
                              {c.setup_rate.toLocaleString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c={(c as any).height_min != null ? 'blue' : 'dimmed'}>
                              {(c as any).height_min != null ? `> ${(c as any).height_min}` : '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c={(c as any).height_max != null ? 'blue' : 'dimmed'}>
                              {(c as any).height_max != null ? `≤ ${(c as any).height_max}` : '—'}
                            </Text>
                          </Table.Td>
                          <Table.Td><Text size="sm">{c.sort_order}</Text></Table.Td>
                          <Table.Td>
                            <Badge size="sm" color={c.is_active ? 'green' : 'gray'} variant="dot">
                              {c.is_active ? 'ใช้งาน' : 'ปิด'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <Tooltip label="แก้ไข">
                                <ActionIcon variant="subtle" color={ACCENT} onClick={() => openComboEdit(c)} radius="md">
                                  <IconEdit size={15} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="คัดลอก">
                                <ActionIcon variant="subtle" color="teal" onClick={() => openComboCopy(c)} radius="md">
                                  <IconCopy size={15} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="ลบ">
                                <ActionIcon variant="subtle" color="red" onClick={() => deleteCombo(c)} radius="md">
                                  <IconTrash size={15} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              ))}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* ── Modal: Type config ── */}
      <Modal opened={typeModal} onClose={() => setTypeModal(false)}
        title={<Text fw={700}>แก้ไข: {editType?.type_label}</Text>}
        radius="lg" size="md" centered>
        <form onSubmit={e => { e.preventDefault(); saveType(); }}>
          <Stack gap="md">
            <Select
              label="สูตรคำนวณ (formula_group)"
              description="wave = G1 ลอน/จีบ · sfold = G1 ลอน-กระดุม · sqy = G2/G4 ม้วน/พับ"
              value={tFormulaGroup}
              onChange={v => setTFormulaGroup(v ?? 'wave')}
              data={[
                { value: 'wave',  label: 'wave  — (W × faceW × (H+0.5)) / 0.9144' },
                { value: 'sfold', label: 'sfold — (W × 2.5 / loomW × (H+0.3)) / 0.9 + panels' },
                { value: 'sqy',   label: 'sqy   — W × H × 1.196' },
              ]}
              radius="md"
            />

            {tFormulaGroup === 'sfold' && (
              <Box>
                <Text size="xs" fw={600} c="dimmed" mb={6}>สูตรย่อย — ตามทิศทางการเปิด</Text>
                <Tabs defaultValue="center" radius="md" variant="outline">
                  <Tabs.List>
                    <Tabs.Tab value="center">⇔ ผ่ากลาง</Tabs.Tab>
                    <Tabs.Tab value="left">⇐ เก็บซ้าย</Tabs.Tab>
                    <Tabs.Tab value="right">⇒ เก็บขวา</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="center">
                    <Box p="sm" style={{ background: '#F8F5F0', borderRadius: '0 0 8px 8px' }}>
                      <Text size="xs" ff="monospace" c="dark" style={{ lineHeight: 2 }}>
                        Q = (W × 2.5) / loomW<br/>
                        R = H + 0.3<br/>
                        panels = ceil(Q / 2) × 2 &nbsp;<Text span size="xs" c="dimmed">(ปัดขึ้นเป็นเลขคู่)</Text><br/>
                        total = (Q × R / 0.9) + panels
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        ตัวอย่าง: W=2.54, loomW=1.40, H=6.78<br/>
                        Q=4.535 · R=7.08 · panels=6 · total=<Text span fw={700} c="dark">41.68 yd</Text>
                      </Text>
                    </Box>
                  </Tabs.Panel>

                  <Tabs.Panel value="left">
                    <Box p="sm" style={{ background: '#F8F5F0', borderRadius: '0 0 8px 8px' }}>
                      <Text size="xs" ff="monospace" c="dark" style={{ lineHeight: 2 }}>
                        Q = (W × 2.5) / loomW<br/>
                        R = H + 0.3<br/>
                        panels = ceil(Q) &nbsp;<Text span size="xs" c="dimmed">(ปัดขึ้น)</Text><br/>
                        total = (Q × R / 0.9) + panels
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        ตัวอย่าง: W=2.54, loomW=1.40, H=6.78<br/>
                        Q=4.535 · R=7.08 · panels=5 · total=<Text span fw={700} c="dark">40.68 yd</Text>
                      </Text>
                    </Box>
                  </Tabs.Panel>

                  <Tabs.Panel value="right">
                    <Box p="sm" style={{ background: '#F8F5F0', borderRadius: '0 0 8px 8px' }}>
                      <Text size="xs" ff="monospace" c="dark" style={{ lineHeight: 2 }}>
                        Q = (W × 2.5) / loomW<br/>
                        R = H + 0.3<br/>
                        panels = ceil(Q) &nbsp;<Text span size="xs" c="dimmed">(ปัดขึ้น)</Text><br/>
                        total = (Q × R / 0.9) + panels
                      </Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        ตัวอย่าง: W=2.54, loomW=1.40, H=6.78<br/>
                        Q=4.535 · R=7.08 · panels=5 · total=<Text span fw={700} c="dark">40.68 yd</Text>
                      </Text>
                    </Box>
                  </Tabs.Panel>
                </Tabs>
              </Box>
            )}

            {(tFormulaGroup === 'wave') && (
              <Box p="sm" style={{ background: '#F8F5F0', borderRadius: 8 }}>
                <Text size="xs" ff="monospace" c="dark" style={{ lineHeight: 2 }}>
                  qty = (W × faceW × (H + 0.5)) / 0.9144
                </Text>
                <Text size="xs" c="dimmed" mt={4}>หน่วย: yd · faceW default จากช่องด้านล่าง</Text>
              </Box>
            )}

            {(tFormulaGroup === 'sqy') && (
              <Box p="sm" style={{ background: '#F8F5F0', borderRadius: 8 }}>
                <Text size="xs" ff="monospace" c="dark" style={{ lineHeight: 2 }}>
                  qty = W × H × 1.196
                </Text>
                <Text size="xs" c="dimmed" mt={4}>หน่วย: sqy</Text>
              </Box>
            )}

            <NumberInput
              label="faceW default (หน้าผ้า)"
              description="ค่า default หน้าผ้า (เมตร) เช่น 1.20 หรือ 1.40 — เว้นว่างถ้าไม่มี"
              value={tFaceW}
              onChange={setTFaceW}
              decimalScale={2}
              step={0.05}
              min={0.5}
              max={3}
              placeholder="เช่น 1.40"
              radius="md"
            />
            <NumberInput
              label="Height threshold — ขอบ ชุดสูง (ม.)"
              description="ถ้า H > ค่านี้ → auto-เลือก combo ชุดสูง เว้นว่างถ้าไม่ใช้กฎ"
              value={tThreshold}
              onChange={setTThreshold}
              decimalScale={2}
              step={0.10}
              min={1}
              max={20}
              placeholder="เช่น 3.20"
              radius="md"
            />
            <TextInput
              label="หมวดสินค้าราง (มอเตอร์)"
              value={tMotor}
              onChange={e => setTMotor(e.currentTarget.value)}
              placeholder="เช่น รางลอน-กระดุม-มอร์เตอร์"
              radius="md"
            />
            <TextInput
              label="หมวดสินค้าราง (แมนวล)"
              value={tManual}
              onChange={e => setTManual(e.currentTarget.value)}
              placeholder="เช่น รางลอน-กระดุม"
              radius="md"
            />
            <Group justify="flex-end" mt="xs">
              <Button type="button" variant="subtle" onClick={() => setTypeModal(false)} radius="xl">ยกเลิก</Button>
              <Button type="submit" loading={typeSaving} radius="xl"
                style={{ background: ACCENT, color: '#fff' }}>บันทึก</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* ── Modal: Combo ── */}
      <Modal opened={comboModal} onClose={() => setComboModal(false)}
        title={<Text fw={700}>{editCombo ? 'แก้ไข Combo' : 'เพิ่ม Combo'}</Text>}
        radius="lg" size="md" centered>
        <form onSubmit={e => { e.preventDefault(); saveCombo(); }}>
          <Stack gap="md">
            <Select
              label="ประเภทผ้าม่าน"
              value={cTypeId}
              onChange={v => setCTypeId(v ?? 'sfold')}
              data={types.map(t => ({ value: t.type_id, label: t.type_label }))}
              radius="md"
            />
            <TextInput label="Combo Key" value={cComboKey} onChange={e => setCComboKey(e.currentTarget.value)}
              placeholder="เช่น motor-high" radius="md" description="รหัสภายใน ไม่ซ้ำกัน ต่อ type" />
            <TextInput label="Label (แสดงใน wizard)" value={cLabel} onChange={e => setCLabel(e.currentTarget.value)}
              placeholder="เช่น ลอนกระดุม-มอเตอร์-ชุดสูง" radius="md" />
            <Select label="ระบบ" value={cSystem} onChange={v => setCSystem((v ?? 'manual') as 'manual'|'motor')}
              data={[{ value: 'manual', label: 'แมนวล' }, { value: 'motor', label: 'มอเตอร์' }]}
              radius="md" />
            <Group grow>
              <NumberInput label="ค่าเย็บ (฿/ม.)" value={cSewing} onChange={setCSewing}
                min={0} step={10} placeholder="เช่น 270" radius="md" />
              <NumberInput label="ค่าติดตั้ง (฿/ชุด)" value={cSetup} onChange={setCSetup}
                min={0} step={50} placeholder="เช่น 2000" radius="md" />
            </Group>
            <Group grow>
              <NumberInput label="H min (ม.) — H >" value={cHMin} onChange={setCHMin}
                decimalScale={2} step={0.5} min={0} placeholder="เช่น 3.20 (null=ไม่จำกัด)" radius="md" />
              <NumberInput label="H max (ม.) — H ≤" value={cHMax} onChange={setCHMax}
                decimalScale={2} step={0.5} min={0} placeholder="เช่น 7.00 (null=ไม่จำกัด)" radius="md" />
            </Group>
            <NumberInput label="ลำดับ (sort)" value={cSort} onChange={setCSort} min={0} radius="md" />
            <Switch label="เปิดใช้งาน" checked={cActive} onChange={e => setCActive(e.currentTarget.checked)} />
            <Group justify="flex-end" mt="xs">
              <Button type="button" variant="subtle" onClick={() => setComboModal(false)} radius="xl">ยกเลิก</Button>
              <Button type="submit" loading={comboSaving} radius="xl"
                style={{ background: ACCENT, color: '#fff' }}>บันทึก</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
