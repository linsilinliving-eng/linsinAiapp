'use client';

import { useState, useEffect } from "react";
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
} from "@mantine/core";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconBuildingBank,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useBankStore } from "@/store/bankStore";
import { bankSchema } from "@/lib/validations/bank";

export default function BankPage() {
  const { data: session } = useSession();
  const { banks, isLoading, fetchBanks, addBank, updateBank, deleteBank } = useBankStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [formData, setFormData] = useState({
    bank_id: "",
    bank_name: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const getPrimaryColor = () => {
    const themeColor = (session?.user as any)?.theme_color || 'blue';
    const COLORS: Record<string, string> = {
      green: '#12b886',
      blue: '#228be6',
      red: '#fa5252',
      pink: '#e292b6',
      orange: '#fd7e14',
      dark: '#212529'
    };
    return COLORS[themeColor] || COLORS.blue;
  };

  const handleOpenAdd = () => {
    setEditingBank(null);
    setFormData({ bank_id: "", bank_name: "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (bank: any) => {
    setEditingBank(bank);
    setFormData({
      bank_id: bank.bank_id,
      bank_name: bank.bank_name,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      uuid: editingBank?.uuid,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    const result = bankSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editingBank) {
        await updateBank(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "แก้ไขข้อมูลธนาคารเรียบร้อยแล้ว",
          color: "green",
        });
      } else {
        await addBank(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "เพิ่มข้อมูลธนาคารเรียบร้อยแล้ว",
          color: "green",
        });
      }
      setModalOpen(false);
    } catch (error) {
      notifications.show({
        title: "ข้อผิดพลาด",
        message: "ไม่สามารถบันทึกข้อมูลได้",
        color: "red",
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
        <Text size="sm">
          คุณต้องการลบข้อมูลรายชื่อธนาคารนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      centered: true,
      radius: 'lg',
      onConfirm: async () => {
        try {
          await deleteBank(uuid);
          notifications.show({
            title: "สำเร็จ",
            message: "ลบข้อมูลธนาคารเรียบร้อยแล้ว",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "ข้อผิดพลาด",
            message: "ไม่สามารถลบข้อมูลได้",
            color: "red",
          });
        }
      },
    });
  };

  const filteredBanks = banks.filter(
    (item) =>
      item.bank_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const currentData = filteredBanks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const items = [
    { title: "Dashboard", href: "/admin" },
    { title: "Master Data", href: "#" },
    { title: "รายชื่อธนาคาร", href: "/admin/master/banks" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm" c="dimmed">
      {item.title}
    </Anchor>
  ));

  const rows = currentData.map((bank) => (
    <Table.Tr key={bank.uuid} className="hover-row-lux">
      <Table.Td>
        <Text size="sm" fw={500}>{bank.bank_id}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{bank.bank_name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">{bank.updated_by || "-"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Tooltip label="แก้ไข">
            <ActionIcon
              variant="subtle"
              color={getPrimaryColor()}
              onClick={() => handleEdit(bank)}
              radius="md"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบ">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(bank.uuid)}
              radius="md"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="lg">
      <style jsx global>{`
        .hover-row-lux:hover {
          background-color: ${getPrimaryColor()}05 !important;
          transform: translateY(-1px);
        }
      `}</style>

      <Stack gap="lg">
        <Box>
          <Breadcrumbs separator={<IconChevronRight size={12} stroke={1.5} />} mb="xs">
            {items}
          </Breadcrumbs>
          <Group justify="space-between" align="flex-end">
            <Box>
              <Title order={2} fw={800} style={{ letterSpacing: "-1px" }}>
                รายชื่อธนาคาร / BANKS
              </Title>
              <Text size="sm" c="dimmed">
                จัดการรหัสและชื่อธนาคารที่ใช้ในระบบ
              </Text>
            </Box>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleOpenAdd}
              radius="xl"
              size="sm"
              style={{
                boxShadow: `0 4px 12px ${getPrimaryColor()}33`,
                backgroundColor: getPrimaryColor(),
                color: '#ffffff',
                height: '38px'
              }}
            >
              เพิ่มธนาคาร
            </Button>
          </Group>
        </Box>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหารหัส หรือชื่อธนาคาร..."
            leftSection={<IconSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
            size="xs"
            radius="md"
          />

          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
              <Table.Tr>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">รหัสธนาคาร</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ชื่อธนาคาร</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text></Table.Th>
                <Table.Th style={{ textAlign: "right", borderBottom: 'none' }} w={100}><Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={4}><Skeleton height={40} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center" py="xl">
                    <Text c="dimmed" size="sm">ไม่พบข้อมูลธนาคาร</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                color={getPrimaryColor()}
                radius="md"
                size="sm"
              />
            </Group>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <IconBuildingBank size={20} color={getPrimaryColor()} />
            <Text fw={700}>{editingBank ? "แก้ไขธนาคาร" : "เพิ่มธนาคาร"}</Text>
          </Group>
        }
        radius="lg"
        size="md"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="รหัสธนาคาร"
            placeholder="เช่น BBL, KBANK"
            required
            value={formData.bank_id}
            onChange={(e) => setFormData({ ...formData, bank_id: e.currentTarget.value })}
            error={errors.bank_id}
            radius="md"
          />
          <TextInput
            label="ชื่อธนาคาร"
            placeholder="กรอกชื่อธนาคารภาษาไทย หรือภาษาอังกฤษ"
            required
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.currentTarget.value })}
            error={errors.bank_name}
            radius="md"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)} radius="xl">
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              radius="xl"
              style={{ backgroundColor: getPrimaryColor(), color: '#fff' }}
            >
              บันทึก
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
