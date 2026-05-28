'use client';

import { useState, useEffect, useMemo } from "react";
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
} from "@mantine/core";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconDatabase,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useGroupMainStore } from "@/store/groupMainStore";
import { groupMainSchema } from "@/lib/validations/groupMain";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";

export default function GroupMainPage() {
  const { data: session } = useSession();
  const { groups, isLoading, fetchGroups, addGroup, updateGroup, deleteGroup } = useGroupMainStore();
  
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const form = useForm({
    initialValues: {
      groupmain_id: "",
      groupmain_name: "",
      groupmain_max: 0,
      item_index: 0,
    },
    validate: zodResolver(groupMainSchema),
  });

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
    setEditingItem(null);
    form.reset();
    setModalOpen(true);
  };

  const handleEdit = (group: any) => {
    setEditingItem(group);
    form.setValues({
      groupmain_id: group.groupmain_id,
      groupmain_name: group.groupmain_name,
      groupmain_max: group.groupmain_max || 0,
      item_index: group.item_index || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      ...values,
      uuid: editingItem?.uuid,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    try {
      if (editingItem) {
        await updateGroup(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "แก้ไขข้อมูลกลุ่มหลักเรียบร้อยแล้ว",
          color: "green",
        });
      } else {
        await addGroup(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "เพิ่มข้อมูลกลุ่มหลักเรียบร้อยแล้ว",
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
          คุณต้องการลบคลังข้อมูลกลุ่มหลักนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      centered: true,
      radius: 'lg',
      onConfirm: async () => {
        try {
          await deleteGroup(uuid);
          notifications.show({
            title: "สำเร็จ",
            message: "ลบข้อมูลกลุ่มหลักเรียบร้อยแล้ว",
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

  const filteredData = useMemo(() => {
    return groups.filter(
      (item) =>
        item.groupmain_id.toLowerCase().includes(search.toLowerCase()) ||
        item.groupmain_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const breadcrumbItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Master Data", href: "#" },
    { title: "ข้อมูลกลุ่มหลัก", href: "/admin/master/main-groups" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm" c="dimmed">
      {item.title}
    </Anchor>
  ));

  const rows = currentData.map((group) => (
    <Table.Tr key={group.uuid} className="hover-row-lux">
      <Table.Td>
        <Text size="sm" fw={500}>{group.groupmain_id}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{group.groupmain_name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{group.item_index || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">{group.updated_by || "-"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <Tooltip label="แก้ไข">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleEdit(group)}
              radius="md"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบ">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(group.uuid)}
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
            {breadcrumbItems}
          </Breadcrumbs>
          <Group justify="space-between" align="flex-end">
            <Box>
              <Title order={2} fw={800} style={{ letterSpacing: "-1px" }}>
                ข้อมูลกลุ่มหลัก / MAIN GROUP
              </Title>
              <Text size="sm" c="dimmed">
                จัดการรหัสและชื่อกลุ่มหลักของสินค้าในระบบ
              </Text>
            </Box>
            <Button
              leftSection={<IconPlus size={18} stroke={2} />}
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
              เพิ่มกลุ่มหลัก
            </Button>
          </Group>
        </Box>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหารหัส หรือชื่อกลุ่มหลัก..."
            leftSection={<IconSearch size={14} stroke={1.5} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="md"
            size="xs"
            radius="md"
          />

          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
              <Table.Tr>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">รหัสกลุ่มหลัก</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ชื่อกลุ่มหลัก</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={100}><Text size="11px" fw={700} c="white" tt="uppercase">ลำดับ</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text></Table.Th>
                <Table.Th style={{ textAlign: "right", borderBottom: 'none' }} w={100}><Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={5}><Skeleton height={40} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} align="center" py="xl">
                    <Text c="dimmed" size="sm">ไม่พบข้อมูลกลุ่มหลัก</Text>
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
                color="blue"
                radius="xl"
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
            <IconDatabase size={20} color={getPrimaryColor()} />
            <Text fw={700}>{editingItem ? "แก้ไขกลุ่มหลัก" : "เพิ่มกลุ่มหลัก"}</Text>
          </Group>
        }
        radius="lg"
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="รหัสกลุ่มหลัก"
              placeholder="กรอกรหัสกลุ่มหลัก"
              required
              {...form.getInputProps("groupmain_id")}
              radius="md"
            />
            <TextInput
              label="ชื่อกลุ่มหลัก"
              placeholder="กรอกชื่อกลุ่มหลัก"
              required
              {...form.getInputProps("groupmain_name")}
              radius="md"
            />
            <Group grow>
              <NumberInput
                label="ลำดับการแสดงผล"
                placeholder="0"
                {...form.getInputProps("item_index")}
                radius="md"
              />
              <NumberInput
                label="ค่าสูงสุด (Max)"
                placeholder="0"
                {...form.getInputProps("groupmain_max")}
                radius="md"
              />
            </Group>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpen(false)} radius="xl">
                ยกเลิก
              </Button>
              <Button
                type="submit"
                radius="xl"
                style={{ backgroundColor: getPrimaryColor(), color: '#fff' }}
              >
                บันทึก
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
