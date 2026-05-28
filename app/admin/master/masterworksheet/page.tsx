'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Paper, 
  Table, 
  Text, 
  Group, 
  Button, 
  ActionIcon, 
  TextInput, 
  Modal, 
  Stack, 
  Title, 
  Box, 
  Breadcrumbs, 
  Anchor,
  Skeleton,
  Pagination,
  Tooltip,
  NumberInput,
  Select,
  Badge,
  Grid,
  Divider,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconClipboardList,
  IconChevronRight,
  IconAlertCircle,
  IconLock,
  IconLockOpen,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useWorksheetStore } from '@/store/worksheetStore';
import { useForm } from '@mantine/form';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterWorksheetPage() {
  const { data: session } = useSession();
  const { 
    worksheets, 
    isLoading, 
    fetchWorksheets, 
    addWorksheet, 
    updateWorksheet, 
    deleteWorksheet,
    toggleLock,
    currentPage,
    setCurrentPage
  } = useWorksheetStore();
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchWorksheets();
  }, [fetchWorksheets]);

  const getPrimaryColor = () => {
    const themeColor = (session?.user as any)?.theme_color || 'blue';
    const COLORS: Record<string, string> = {
      green: '#12b886',  // Vivid Teal
      blue: '#1971c2',   // Deep Blue (Royal)
      red: '#fa5252',    // Vibrant Red
      pink: '#f0307e',   // Deep Pink
      orange: '#fd7e14',  // Tangy Orange
      dark: '#212529'    // Rich Dark
    };
    return COLORS[themeColor] || COLORS.blue;
  };

  const form = useForm({
    initialValues: {
      type_select1: '',
      type_select2: '',
      type_select4: '',
      type_select5: '',
      curtain_line: 'N',
      hook_no: '',
      type_whidth: 0,
      type_height: 0,
      floor_middle: 0,
      floor_over: 0,
      jiblontakai: '',
      saw_remark: '',
      master_setup_width: 0,
      master_setup_hight: 0,
    },
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.reset();
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.setValues({
      type_select1: item.type_select1 || '',
      type_select2: item.type_select2 || '',
      type_select4: item.type_select4 || '',
      type_select5: item.type_select5 || '',
      curtain_line: item.curtain_line || 'N',
      hook_no: item.hook_no || '',
      type_whidth: Number(item.type_whidth) || 0,
      type_height: Number(item.type_height) || 0,
      floor_middle: Number(item.floor_middle) || 0,
      floor_over: Number(item.floor_over) || 0,
      jiblontakai: item.jiblontakai || '',
      saw_remark: item.saw_remark || '',
      master_setup_width: Number(item.master_setup_width) || 0,
      master_setup_hight: Number(item.master_setup_hight) || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      uuid: editingItem?.uuid,
    };

    try {
      let success = false;
      if (editingItem) {
        success = await updateWorksheet(payload);
      } else {
        success = await addWorksheet(payload);
      }

      if (success) {
        notifications.show({
          title: 'สำเร็จ',
          message: editingItem ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว',
          color: 'green',
        });
        setModalOpen(false);
      }
    } catch (error) {
      notifications.show({
        title: 'ข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกข้อมูลได้',
        color: 'red',
      });
    }
  };

  const handleDelete = (uuid: string) => {
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconAlertCircle size={20} color="red" />
          <Text fw={700}>ยืนยันการลบข้อมูล</Text>
        </Group>
      ),
      children: (
        <Text size="sm">คุณต้องการลบข้อมูลใบงานนี้ใช่หรือไม่?</Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      onConfirm: async () => {
        const success = await deleteWorksheet(uuid);
        if (success) {
          notifications.show({ title: 'สำเร็จ', message: 'ลบข้อมูลเรียบร้อยแล้ว', color: 'green' });
        }
      },
    });
  };

  const filteredData = useMemo(() => {
    return [...worksheets].sort((a, b) => {
      // Sort by type_select1 first
      const compare1 = (a.type_select1 || '').localeCompare(b.type_select1 || '');
      if (compare1 !== 0) return compare1;
      
      // If type_select1 is same, sort by type_select2
      return (a.type_select2 || '').localeCompare(b.type_select2 || '');
    }).filter(
      (item: any) =>
        (item.type_select1 || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.type_select2 || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.type_select4 || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [worksheets, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, setCurrentPage]);

  const paginatedWorksheets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const rows = paginatedWorksheets.map((item: any, index: number) => (
    <Table.Tr 
      key={item.uuid} 
      className="hover-row-lux"
      style={{ cursor: "pointer" }}
    >
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Td>
      <Table.Td align="center" style={{ fontSize: '11px', padding: '4px' }}>
        <Group gap={4} justify="center" wrap="nowrap">
          {item.item_lock === 'Y' && <IconLock size={12} color="red" />}
          {item.type_select1}
        </Group>
      </Table.Td>
      <Table.Td style={{ fontSize: '11px', padding: '4px' }}>
        {item.type_select2} {item.type_select4} {item.type_select5}
      </Table.Td>
      
      {/* งานช่างเย็บผ้า */}
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>{item.curtain_line === 'Y' ? 'มี' : ''}</Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }} c={Number(item.type_whidth) < 0 ? 'red' : 'inherit'}>
        {item.type_whidth !== null && item.type_whidth !== 0 ? Number(item.type_whidth).toFixed(2) : ''}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }} c={Number(item.type_height) < 0 ? 'red' : 'inherit'}>
        {item.type_height !== null && item.type_height !== 0 ? Number(item.type_height).toFixed(2) : ''}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>
        {item.hook_no === '1' ? 'ห่วง' : item.hook_no ? `เบอร์ ${item.hook_no}` : ''}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>
        {item.floor_middle !== null && item.floor_middle !== 0 ? Number(item.floor_middle).toFixed(2) : ''}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>
        {item.floor_over !== null && item.floor_over !== 0 ? Number(item.floor_over).toFixed(2) : ''}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }}>
        <Text style={{ fontSize: '10px' }}>{item.jiblontakai}</Text>
      </Table.Td>
      
      {/* งานช่างติดตั้ง */}
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }} c={Number(item.master_setup_width) < 0 ? 'red' : 'inherit'}>
        {item.master_setup_width !== null && item.master_setup_width !== 0 ? Number(item.master_setup_width).toFixed(2) : '0.00'}
      </Table.Td>
      <Table.Td align="center" style={{ fontSize: '10px', padding: '4px' }} c={Number(item.master_setup_hight) < 0 ? 'red' : 'inherit'}>
        {item.master_setup_hight !== null && item.master_setup_hight !== 0 ? Number(item.master_setup_hight).toFixed(2) : '0.00'}
      </Table.Td>
      
      <Table.Td style={{ fontSize: '10px', padding: '4px' }}>
        <Text style={{ fontSize: '10px' }} c="dimmed">{item.saw_remark}</Text>
      </Table.Td>
      
      <Table.Td>
        <Group gap={4} justify="center" wrap="nowrap">
          <ActionIcon 
            variant="subtle" 
            color="orange" 
            size="sm"
            onClick={() => handleEdit(item)}
            disabled={item.item_lock === 'Y'}
          >
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            color="red" 
            size="sm"
            onClick={() => handleDelete(item.uuid)}
            disabled={item.item_lock === 'Y'}
          >
            <IconTrash size={14} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            color={item.item_lock === 'Y' ? "red" : "blue"} 
            size="sm"
            onClick={() => toggleLock(item.uuid, item.item_lock === 'Y' ? 'N' : 'Y')}
          >
            {item.item_lock === 'Y' ? <IconLock size={14} /> : <IconLockOpen size={14} />}
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="lg" fluid>
      <style jsx global>{`
        .hover-row-lux:hover {
          background-color: ${getPrimaryColor()}05 !important;
          transform: translateY(-1px);
        }
        .worksheet-table thead,
        .worksheet-table thead tr,
        .worksheet-table thead tr th {
          background-color: ${getPrimaryColor()} !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 4px 2px !important;
          font-size: 10px !important;
        }
        .worksheet-table tbody tr td {
          border: 1px solid #dee2e6 !important;
          padding: 2px 4px !important;
        }
      `}</style>
      <Stack gap="md">
        <Breadcrumbs separator={<IconChevronRight size={12} stroke={1.5} />}>
          <Anchor href="/admin" size="xs" c="dimmed">Dashboard</Anchor>
          <Text size="xs" c="dimmed">Master Data</Text>
          <Text size="xs" fw={700} c={getPrimaryColor()}>Master ใบงานช่าง</Text>
        </Breadcrumbs>

        <Group justify="space-between">
          <Box>
            <Title order={3} fw={900}>จัดการ Master ใบงานช่างเย็บ-ติดตั้ง</Title>
            <Text size="xs" c="dimmed">กำหนดค่าเริ่มต้นสำหรับงานเย็บผ้าม่านและงานติดตั้ง</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} />}
            radius="xl"
            onClick={handleOpenAdd}
            style={{ backgroundColor: getPrimaryColor() }}
          >
            เพิ่ม Master ใหม่
          </Button>
        </Group>

        <Paper withBorder radius="sm" shadow="xs" p={0}>
          <Box p="md">
            <TextInput
              placeholder="ค้นหาประเภท..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="sm"
              style={{ width: '100%' }}
              styles={{
                input: {
                  fontSize: '11px',
                  height: '32px',
                  minHeight: '32px'
                }
              }}
            />
          </Box>

          <Table 
            verticalSpacing="xs" 
            horizontalSpacing="xs"
            withColumnBorders 
            withRowBorders
            className="worksheet-table"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th rowSpan={2} style={{ width: '40px', textAlign: 'center' }}>##</Table.Th>
                <Table.Th rowSpan={2} style={{ width: '120px', textAlign: 'center' }}>ม่าน</Table.Th>
                <Table.Th rowSpan={2} style={{ textAlign: 'center' }}>ประเภท</Table.Th>
                <Table.Th colSpan={7} style={{ textAlign: 'center' }}>งานช่างเย็บผ้า</Table.Th>
                <Table.Th colSpan={2} style={{ width: '120px', textAlign: 'center' }}>งานช่างติดตั้ง</Table.Th>
                <Table.Th rowSpan={2} style={{ width: '200px', textAlign: 'center' }}>ระบุหมายเหตุ</Table.Th>
                <Table.Th rowSpan={2} style={{ width: '120px', textAlign: 'center' }}>Action</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>สายรวบม่าน</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ความกว้าง (+/-)</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ความยาว (+/-)</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ตะขอ/กระดุม</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>พอดีพื้น (+/-)</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>กองพื้น (+/-)</Table.Th>
                <Table.Th style={{ width: '120px', textAlign: 'center' }}>ระยะห่างจีบ /ลอน/ตาไก่</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ความกว้าง (+/-)</Table.Th>
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ความสูง (+/-)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Table.Tr key={i}><Table.Td colSpan={14}><Skeleton height={40} /></Table.Td></Table.Tr>
                ))
              ) : rows}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Box p="xs">
              <Group justify="center">
                <Pagination 
                  total={totalPages} 
                  value={currentPage} 
                  onChange={setCurrentPage} 
                  color={getPrimaryColor()}
                  radius="xl"
                  withEdges
                  size="xs"
                  styles={{
                    control: {
                      fontSize: '10px',
                      width: '24px',
                      height: '24px',
                      minWidth: '24px'
                    }
                  }}
                />
              </Group>
            </Box>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <IconClipboardList size={20} color="white" />
            <Text fw={700} size="sm" c="white">{editingItem ? 'แก้ไข Master ใบงาน' : 'เพิ่ม Master ใบงาน'}</Text>
          </Group>
        }
        styles={{
          header: {
            backgroundColor: getPrimaryColor(),
            minHeight: '50px',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          },
          title: {
            color: 'white',
          },
          close: {
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
            },
          },
          content: {
            borderRadius: '12px',
            padding: 0,
          },
          body: {
            padding: '20px',
          }
        }}
        radius="lg"
        size="xl"
        withCloseButton
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xs">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="ตัวเลือกที่ 1 (ทึบ/โปร่ง/...)"
                  placeholder="Choose.."
                  data={['ทึบ', 'โปร่ง', 'ทึบ - โปร่ง', 'ม่านม้วน', 'มู่ลี่ไม้', 'ม่านม้วน - MOTOR', 'ฉากกั้นห้อง', 'ม่านปรับแสงแนวตั้ง']}
                  searchable
                  clearable
                  size="xs"
                  {...form.getInputProps('type_select1')}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="ตัวเลือกที่ 2 (จีบ/ลอน/...)"
                  placeholder="Choose.."
                  data={['จีบ', 'ลอน', 'ตาไก่', 'พับ', 'แป๊ป', 'Blackout', 'Sunscreen', '100MM']}
                  searchable
                  clearable
                  size="xs"
                  {...form.getInputProps('type_select2')}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="รูปแบบการใช้งาน"
                  placeholder="Choose.."
                  data={['ผ่ากลาง', 'เก็บขวา', 'เก็บซ้าย', 'ดึงขวา', 'ดึงซ้าย']}
                  size="xs"
                  {...form.getInputProps('type_select4')}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="กล่อง/ดร๊อปฝ้า"
                  data={['D+Fit', 'N/D', 'offset-D', 'offset-N/D', 'ชุด-ริม']}
                  size="xs"
                  {...form.getInputProps('type_select5')}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="สายรวบม่าน"
                  data={[{ value: 'Y', label: 'มี' }, { value: 'N', label: 'ไม่มี' }]}
                  size="xs"
                  {...form.getInputProps('curtain_line')}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <Select
                  label="ตะขอ"
                  data={[{ value: '9', label: 'เบอร์ 9' }, { value: '6', label: 'เบอร์ 6' }, { value: '1', label: 'ห่วง/กระดุม' }]}
                  size="xs"
                  {...form.getInputProps('hook_no')}
                />
              </div>
              
              <div style={{ gridColumn: 'span 12' }}><Divider label="งานช่างเย็บผ้า" labelPosition="center" /></div>
              <div style={{ gridColumn: 'span 3' }}><NumberInput label="ความกว้าง (+/-)" step={0.01} size="xs" {...form.getInputProps('type_whidth')} /></div>
              <div style={{ gridColumn: 'span 3' }}><NumberInput label="ความสูง (+/-)" step={0.01} size="xs" {...form.getInputProps('type_height')} /></div>
              <div style={{ gridColumn: 'span 3' }}><NumberInput label="พอดีพื้น (+/-)" step={0.01} size="xs" {...form.getInputProps('floor_middle')} /></div>
              <div style={{ gridColumn: 'span 3' }}><NumberInput label="กองพื้น (+/-)" step={0.01} size="xs" {...form.getInputProps('floor_over')} /></div>
              <div style={{ gridColumn: 'span 6' }}><TextInput label="ระยะห่าง จีบ/ลอน/ตาไก่" size="xs" {...form.getInputProps('jiblontakai')} /></div>
              <div style={{ gridColumn: 'span 6' }}><TextInput label="หมายเหตุ" size="xs" {...form.getInputProps('saw_remark')} /></div>

              <div style={{ gridColumn: 'span 12' }}><Divider label="งานช่างติดตั้ง" labelPosition="center" /></div>
              <div style={{ gridColumn: 'span 6' }}><NumberInput label="ความกว้าง (+/-)" step={0.01} size="xs" {...form.getInputProps('master_setup_width')} /></div>
              <div style={{ gridColumn: 'span 6' }}><NumberInput label="ความสูง (+/-)" step={0.01} size="xs" {...form.getInputProps('master_setup_hight')} /></div>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" size="xs" onClick={() => setModalOpen(false)}>ยกเลิก</Button>
              <Button type="submit" size="xs" style={{ backgroundColor: getPrimaryColor() }}>บันทึกข้อมูล</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
