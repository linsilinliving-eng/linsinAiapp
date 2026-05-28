"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Text,
  Group,
  Paper,
  Title,
  Skeleton,
  Container,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Button,
  Box,
  Stack,
  Breadcrumbs,
  Anchor,
  Pagination,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronRight,
  IconReceipt2,
  IconAlertCircle,
  IconSearch
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useWithholdingTaxStore } from "@/store/withholdingTaxStore";
import { whtaxSchema } from "@/lib/validations/whtax";
import moment from "moment";

export default function SalesWHTaxPage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'blue';
  const { 
    items, 
    loading, 
    fetchItems, 
    addItem, 
    updateItem, 
    deleteItem,
    currentPage,
    itemsPerPage,
    setCurrentPage
  } = useWithholdingTaxStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Form states matching whtaxSchema
  const [whtDocno, setWhtDocno] = useState("");
  const [whtSuppname, setWhtSuppname] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [whtaxAmount, setWhtaxAmount] = useState<number>(0);
  const [errors, setErrors] = useState<any>({});

  // Get Primary Color Hex
  const getPrimaryColor = () => {
    const COLORS: Record<string, string> = {
      green: '#12b886',
      blue: '#1971c2',
      red: '#fa5252',
      pink: '#f0307e',
      orange: '#fd7e14',
      dark: '#212529'
    };
    return COLORS[themeColor] || COLORS.blue;
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setWhtDocno("");
    setWhtSuppname("");
    setTotalAmount(0);
    setWhtaxAmount(0);
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setWhtDocno(item.wht_docno || "");
    setWhtSuppname(item.wht_suppname || "");
    setTotalAmount(Number(item.total_amount) || 0);
    setWhtaxAmount(Number(item.whtax_amount) || 0);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      uuid: editingItem?.uuid,
      wht_docno: whtDocno,
      wht_suppname: whtSuppname,
      total_amount: totalAmount,
      whtax_amount: whtaxAmount,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    const result = whtaxSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      let success = false;
      if (editingItem) {
        success = await updateItem(payload);
      } else {
        success = await addItem(payload);
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
      console.error(error);
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
          <IconAlertCircle size={20} color="#fa5252" />
          <Text fw={700}>ยืนยันการลบข้อมูล</Text>
        </Group>
      ),
      children: <Text size="sm">คุณต้องการลบข้อมูลรายการหัก ณ ที่จ่ายนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</Text>,
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const success = await deleteItem(uuid);
        if (success) {
          notifications.show({
            title: 'สำเร็จ',
            message: 'ลบข้อมูลเรียบร้อยแล้ว',
            color: 'green',
          });
        }
      },
    });
  };

  const filteredData = useMemo(() => {
    return items.filter(item => 
      (item.wht_docno?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.wht_suppname?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [items, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const rows = paginatedItems.map((item, index) => (
    <Table.Tr key={item.uuid} className="hover-row-lux">
      <Table.Td align="center" style={{ fontSize: '10px' }}>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Td>
      <Table.Td style={{ fontSize: '11px' }}>{item.wht_docno || "-"}</Table.Td>
      <Table.Td style={{ fontSize: '11px' }}>{item.wht_date ? moment(item.wht_date).format("DD/MM/YYYY") : "-"}</Table.Td>
      <Table.Td style={{ fontSize: '11px' }}>{item.wht_suppname || "-"}</Table.Td>
      <Table.Td align="right" style={{ fontSize: '11px' }}>{Number(item.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
      <Table.Td align="right" style={{ fontSize: '11px' }}>{Number(item.whtax_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
      <Table.Td>
        <Group gap={4} justify="center">
          <ActionIcon variant="subtle" color="orange" size="sm" onClick={() => handleEdit(item)}>
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(item.uuid!)}>
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="lg" fluid>
      <Stack gap="md">
        <Breadcrumbs separator={<IconChevronRight size={12} stroke={1.5} />}>
          <Anchor href="/admin" size="xs" c="dimmed">Dashboard</Anchor>
          <Text size="xs" c="dimmed">Sales System</Text>
          <Text size="xs" fw={700} c={getPrimaryColor()}>ข้อมูลรายการหัก ณ ที่จ่าย (ขาย)</Text>
        </Breadcrumbs>

        <Group justify="space-between">
          <Box>
            <Title order={3} fw={900}>บันทึกข้อมูลรายการหัก ณ ที่จ่าย (ขาย)</Title>
            <Text size="xs" c="dimmed">รายการบันทึกภาษีหัก ณ ที่จ่าย (WHT Transactions)</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} />}
            radius="xl"
            onClick={handleOpenAdd}
            style={{ backgroundColor: getPrimaryColor() }}
          >
            เพิ่มรายการใหม่
          </Button>
        </Group>

        <Paper withBorder radius="sm" shadow="xs" p={0}>
          <Box p="md">
            <TextInput
              placeholder="ค้นหาเลขที่เอกสาร หรือ ชื่อผู้รับเงิน..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="sm"
              style={{ width: '100%' }}
              styles={{ input: { fontSize: '11px', height: '32px' } }}
            />
          </Box>

          <Table verticalSpacing="xs" horizontalSpacing="xs" withColumnBorders withRowBorders className="worksheet-table">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '50px', textAlign: 'center' }}>##</Table.Th>
                <Table.Th style={{ width: '150px', textAlign: 'center' }}>เลขที่เอกสาร</Table.Th>
                <Table.Th style={{ width: '120px', textAlign: 'center' }}>วันที่</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>ชื่อผู้รับเงิน</Table.Th>
                <Table.Th style={{ width: '150px', textAlign: 'center' }}>จำนวนเงินรวม</Table.Th>
                <Table.Th style={{ width: '150px', textAlign: 'center' }}>ภาษีหัก ณ ที่จ่าย</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'center' }}>จัดการ</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <Table.Tr key={i}><Table.Td colSpan={7}><Skeleton height={30} /></Table.Td></Table.Tr>
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
                  styles={{ control: { fontSize: '10px', width: '24px', height: '24px' } }}
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
            <IconReceipt2 size={20} color="white" />
            <Text fw={700} size="sm" c="white">{editingItem ? 'แก้ไขรายการหัก ณ ที่จ่าย' : 'เพิ่มรายการหัก ณ ที่จ่าย'}</Text>
          </Group>
        }
        styles={{
          header: { backgroundColor: getPrimaryColor(), minHeight: '50px' },
          close: { color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }
        }}
        radius="md"
        size="lg"
      >
        <Stack gap="md" p="md">
          <TextInput
            label="เลขที่เอกสาร"
            placeholder="เช่น WHT20240001"
            value={whtDocno}
            onChange={(e) => setWhtDocno(e.target.value)}
            error={errors.wht_docno}
            required
            size="xs"
          />
          <TextInput
            label="ชื่อผู้รับเงิน"
            placeholder="ระบุชื่อบริษัทหรือชื่อบุคคล"
            value={whtSuppname}
            onChange={(e) => setWhtSuppname(e.target.value)}
            error={errors.wht_suppname}
            required
            size="xs"
          />
          <Group grow>
            <NumberInput
              label="จำนวนเงินรวม"
              value={totalAmount}
              onChange={(val) => setTotalAmount(Number(val))}
              decimalScale={2}
              fixedDecimalScale
              size="xs"
            />
            <NumberInput
              label="ภาษีหัก ณ ที่จ่าย"
              value={whtaxAmount}
              onChange={(val) => setWhtaxAmount(Number(val))}
              decimalScale={2}
              fixedDecimalScale
              size="xs"
            />
          </Group>

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)} size="xs" color="gray">ยกเลิก</Button>
            <Button color={getPrimaryColor()} onClick={handleSubmit} size="xs">บันทึกข้อมูล</Button>
          </Group>
        </Stack>
      </Modal>

      <style jsx global>{`
        .worksheet-table thead tr th {
          background-color: ${getPrimaryColor()} !important;
          color: white !important;
          font-weight: 600;
          font-size: 11px;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .hover-row-lux:hover {
          background-color: ${getPrimaryColor()}05 !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
      `}</style>
    </Container>
  );
}
