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
  Checkbox,
} from "@mantine/core";
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconCategory,
  IconChevronRight,
  IconAlertCircle
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useProductGroupStore } from "@/store/productGroupStore";
import { useGroupMainStore } from "@/store/groupMainStore";
import { productGroupSchema } from "@/lib/validations/productGroup";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";

export default function ProductGroupPage() {
  const { data: session } = useSession();
  const { productGroups, isLoading, fetchProductGroups, addProductGroup, updateProductGroup, deleteProductGroup } = useProductGroupStore();
  const { groups, fetchGroups } = useGroupMainStore();
  
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProductGroups();
    fetchGroups();
  }, [fetchProductGroups, fetchGroups]);

  const form = useForm({
    initialValues: {
      code: "",
      name: "",
      item_index: 1,
      groupmain_id: [] as string[],
    },
    validate: zodResolver(productGroupSchema),
  });

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

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.reset();
    setModalOpen(true);
  };

  const handleEdit = (group: any) => {
    setEditingItem(group);
    
    // แปลง "GM01,GM02" เป็น ["GM01", "GM02"]
    const selectedMainGroups = typeof group.groupmain_id === 'string' 
      ? group.groupmain_id.split(',').filter(Boolean)
      : [];

    form.setValues({
      code: group.code,
      name: group.name,
      item_index: group.item_index || 1,
      groupmain_id: selectedMainGroups,
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
        await updateProductGroup(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "แก้ไขข้อมูลกลุ่มสินค้าเรียบร้อยแล้ว",
          color: "green",
        });
      } else {
        await addProductGroup(payload as any);
        notifications.show({
          title: "สำเร็จ",
          message: "เพิ่มข้อมูลกลุ่มสินค้าเรียบร้อยแล้ว",
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
          คุณต้องการลบข้อมูลกลุ่มสินค้านี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      centered: true,
      radius: 'lg',
      onConfirm: async () => {
        try {
          await deleteProductGroup(uuid);
          notifications.show({
            title: "สำเร็จ",
            message: "ลบข้อมูลกลุ่มสินค้าเรียบร้อยแล้ว",
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
    return productGroups.filter(
      (item) =>
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.groupmain_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [productGroups, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const breadcrumbItems = [
    { title: "Dashboard", href: "/admin" },
    { title: "Master Data", href: "#" },
    { title: "กลุ่มสินค้า", href: "/admin/master/product-groups" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm" c="dimmed">
      {item.title}
    </Anchor>
  ));

  const mainGroupData = groups.map(g => ({ value: g.groupmain_id, label: g.groupmain_name }));

  const rows = currentData.map((group) => (
    <Table.Tr key={group.uuid} className="hover-row-lux">
      <Table.Td>
        <Text size="sm" fw={500}>{group.code}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{group.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{group.groupmain_name || "-"}</Text>
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
              color={getPrimaryColor()}
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
        /* แก้ไขสี Pagination Active */
        .mantine-Pagination-control[data-active] {
          background-color: ${getPrimaryColor()} !important;
          color: white !important;
          border: none !important;
        }
        .mantine-Pagination-control:not([data-active]) {
          background-color: transparent !important;
          border: none !important;
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
                กลุ่มสินค้า / PRODUCT GROUP
              </Title>
              <Text size="sm" c="dimmed">
                จัดการรหัสและชื่อกลุ่มสินค้ารวมถึงการจัดกลุ่มหลักในระบบ
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
                height: '38px',
                fontWeight: 700
              }}
            >
              เพิ่มกลุ่มสินค้า
            </Button>
          </Group>
        </Box>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหารหัส ชื่อกลุ่มสินค้า หรือกลุ่มหลัก..."
            leftSection={<IconSearch size={14} stroke={1.5} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="md"
            size="xs"
            radius="md"
          />

          <Table verticalSpacing="sm" horizontalSpacing="md" withRowBorders>
            <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
              <Table.Tr>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="13px" fw={700} c="white" tt="uppercase">รหัสกลุ่มสินค้า</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}><Text size="13px" fw={700} c="white" tt="uppercase">ชื่อกลุ่มสินค้า</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={200}><Text size="13px" fw={700} c="white" tt="uppercase">กลุ่มหลัก</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={100}><Text size="13px" fw={700} c="white" tt="uppercase">ลำดับ</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }} w={150}><Text size="13px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text></Table.Th>
                <Table.Th style={{ textAlign: "right", borderBottom: 'none' }} w={100}><Text size="13px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={6}><Skeleton height={40} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center" py="xl">
                    <Text c="dimmed" size="sm">ไม่พบข้อมูลกลุ่มสินค้า</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>

          {totalPages > 0 && (
            <Box py="md" style={{ borderTop: '1px solid #f1f3f5' }}>
              <Group justify="center">
                <Pagination 
                  total={totalPages} 
                  value={currentPage} 
                  onChange={setCurrentPage}
                  radius="xl"
                  size="sm"
                  withEdges
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
            <IconCategory size={20} color={getPrimaryColor()} />
            <Text fw={700}>{editingItem ? "แก้ไขกลุ่มสินค้า" : "เพิ่มกลุ่มสินค้า"}</Text>
          </Group>
        }
        radius="lg"
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="รหัสกลุ่มสินค้า"
              placeholder="กรอกรหัสกลุ่มสินค้า"
              required
              {...form.getInputProps("code")}
              radius="md"
            />
            <TextInput
              label="ชื่อกลุ่มสินค้า"
              placeholder="กรอกชื่อกลุ่มสินค้า"
              required
              {...form.getInputProps("name")}
              radius="md"
            />

            <Box>
              <Text size="sm" fw={500} mb={5}>กลุ่มหลัก :</Text>
              <Checkbox.Group
                {...form.getInputProps("groupmain_id")}
              >
                <Stack gap="xs" mt="xs">
                  {groups.map((g) => (
                    <Checkbox
                      key={g.groupmain_id}
                      value={g.groupmain_id}
                      label={g.groupmain_name}
                      radius="sm"
                    />
                  ))}
                  {groups.length === 0 && (
                    <Text size="xs" c="dimmed">ไม่พบข้อมูลกลุ่มหลัก</Text>
                  )}
                </Stack>
              </Checkbox.Group>
            </Box>

            <NumberInput
              label="ลำดับการแสดงผล"
              placeholder="1"
              {...form.getInputProps("item_index")}
              radius="md"
            />
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
