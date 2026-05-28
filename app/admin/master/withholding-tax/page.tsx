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
import { withholdingTaxSchema } from "@/lib/validations/withholdingTax";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import moment from "moment";

export default function WHTaxPage() {
  const { data: session } = useSession();
  const { items, loading, fetchItems, addItem, updateItem, deleteItem, currentPage, itemsPerPage, setCurrentPage } = useWithholdingTaxStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState("");

  const form = useForm({
    initialValues: {
      whtax_index: 0,
      whtax_name: "",
      whtax_rate: 0,
      wht_condition: "1",
    },
    validate: zodResolver(withholdingTaxSchema),
  });

  // Get Primary Color Hex
  const getPrimaryColor = () => {
    const themeColor = (session?.user as any)?.theme_color || 'blue';
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
    form.reset();
    setModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.setValues({
      whtax_index: item.whtax_index,
      whtax_name: item.whtax_name,
      whtax_rate: item.whtax_rate,
      wht_condition: item.wht_condition || "1",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      ...values,
      whtax_id: editingItem?.whtax_id,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

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

  const handleDelete = (id: string) => {
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
        const success = await deleteItem(id);
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
      (item.whtax_name?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [items, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const rows = paginatedItems.map((item, index) => (
    <Table.Tr key={item.whtax_id} className="hover-row-lux">
      <Table.Td align="center" style={{ fontSize: '10px' }}>{item.whtax_index}</Table.Td>
      <Table.Td align="center" style={{ fontSize: '11px' }}>WHT{item.whtax_index}</Table.Td>
      <Table.Td style={{ fontSize: '11px' }}>{item.whtax_name}</Table.Td>
      <Table.Td align="center" style={{ fontSize: '11px' }}>{item.whtax_rate}</Table.Td>
      <Table.Td>
        <Group gap={4} justify="center">
          <ActionIcon variant="subtle" color="orange" size="sm" onClick={() => handleEdit(item)}>
            <IconEdit size={14} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(item.whtax_id)}>
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
          <Text size="xs" c="dimmed">Master Data</Text>
          <Text size="xs" fw={700} c={getPrimaryColor()}>ข้อมูลรายการหัก ณ ที่จ่าย</Text>
        </Breadcrumbs>

        <Group justify="space-between">
          <Box>
            <Title order={3} fw={900}>จัดการข้อมูลรายการหัก ณ ที่จ่าย</Title>
            <Text size="xs" c="dimmed">รายการบันทึกประเภทภาษีหัก ณ ที่จ่าย (WHT Master)</Text>
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
              placeholder="ค้นหาชื่อรายการ..."
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
                <Table.Th style={{ width: '60px', textAlign: 'center' }}>ลำดับ</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'center' }}>รหัส</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>รายละเอียด</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'center' }}>% หัก</Table.Th>
                <Table.Th style={{ width: '100px', textAlign: 'center' }}>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <Table.Tr key={i}><Table.Td colSpan={5}><Skeleton height={30} /></Table.Td></Table.Tr>
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
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" p="md">
            <NumberInput
              label="ลำดับ"
              placeholder="เช่น 1, 2, 3"
              {...form.getInputProps('whtax_index')}
              required
              size="xs"
            />
            <TextInput
              label="รายละเอียด/ชื่อรายการ"
              placeholder="เช่น 3% ออกให้ครั้งเดียว"
              {...form.getInputProps('whtax_name')}
              required
              size="xs"
            />
            <NumberInput
              label="อัตราภาษี (%)"
              placeholder="ระบุตัวเลข เช่น 3"
              {...form.getInputProps('whtax_rate')}
              decimalScale={2}
              required
              size="xs"
            />
            <TextInput
              label="เงื่อนไข (Condition)"
              placeholder="1, 2, 3"
              {...form.getInputProps('wht_condition')}
              size="xs"
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={() => setModalOpen(false)} size="xs" color="gray">ยกเลิก</Button>
              <Button type="submit" color={getPrimaryColor()} size="xs">บันทึกข้อมูล</Button>
            </Group>
          </Stack>
        </form>
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
