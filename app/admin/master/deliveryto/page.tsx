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
  Badge,
  Tooltip,
  Pagination,
  NumberInput
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconChevronRight, 
  IconTruck,
  IconSearch,
  IconAlertCircle,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useDeliveryToStore } from "@/store/deliveryToStore";
import { deliveryToSchema, DeliveryTo } from "@/lib/validations/deliveryTo";
import { motion } from "framer-motion";

export default function DeliveryToPage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'blue';
  
  const { 
    deliveryLocations, 
    isLoading, 
    fetchDeliveryLocations, 
    addDeliveryLocation, 
    updateDeliveryLocation, 
    deleteDeliveryLocation 
  } = useDeliveryToStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeliveryTo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    dl_code: "",
    dl_name: "",
    dl_index: 30
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    fetchDeliveryLocations();
  }, [fetchDeliveryLocations]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ dl_code: "", dl_name: "", dl_index: 30 });
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (item: DeliveryTo) => {
    setEditingItem(item);
    setFormData({
      dl_code: item.dl_code,
      dl_name: item.dl_name,
      dl_index: item.dl_index ?? 30
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      uuid: editingItem?.uuid,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    const result = deliveryToSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editingItem) {
        await updateDeliveryLocation(payload);
        notifications.show({
          title: 'สำเร็จ',
          message: 'อัปเดตสถานที่จัดส่งเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      } else {
        await addDeliveryLocation(payload);
        notifications.show({
          title: 'สำเร็จ',
          message: 'เพิ่มสถานที่จัดส่งเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      }
      fetchDeliveryLocations();
      setModalOpen(false);
    } catch (error: any) {
      notifications.show({
        title: 'เกิดข้อผิดพลาด',
        message: error.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    }
  };

  const handleDelete = (item: DeliveryTo) => {
    modals.openConfirmModal({
      title: (
        <Group gap="xs">
          <IconAlertCircle size={20} color="#fa5252" />
          <Text fw={700}>ยืนยันการลบข้อมูล</Text>
        </Group>
      ),
      children: (
        <Text size="sm" c="dimmed">
          คุณต้องการลบสถานที่จัดส่ง <b>{item.dl_name}</b> ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </Text>
      ),
      labels: { confirm: 'ยืนยันลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { variant: 'light', color: 'gray', radius: 'md' },
      centered: true,
      onConfirm: async () => {
        try {
          await deleteDeliveryLocation(item.uuid!);
          notifications.show({
            title: 'สำเร็จ',
            message: 'ลบข้อมูลเรียบร้อยแล้ว',
            color: 'green',
            icon: <IconCheck size="1.1rem" />,
          });
          fetchDeliveryLocations();
        } catch (error: any) {
          notifications.show({
            title: 'เกิดข้อผิดพลาด',
            message: error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้',
            color: 'red',
            icon: <IconX size="1.1rem" />,
          });
        }
      },
    });
  };

  const filteredData = deliveryLocations.filter(item => 
    item.dl_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.dl_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const rows = currentData.map((item, index) => (
    <motion.tr 
      key={item.uuid}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ cursor: "pointer" }}
      className="mantine-Table-tr hover-row-lux"
    >
      <Table.Td>
        <Group gap="xs">
          <ActionIcon 
            variant="filled"
            radius="xl" 
            size="xs"
            style={{ 
              boxShadow: `0 2px 8px ${getPrimaryColor()}33`,
              backgroundColor: getPrimaryColor()
            }}
          >
             <IconTruck size={12} />
          </ActionIcon>
          <Text size="xs" fw={700}>
            {item.dl_code}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="xs" fw={600}>{item.dl_name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs">{item.dl_index}</Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="dot" color="gray" size="xs" radius="xs" fz={9}>
          {item.updated_by || item.created_by || "System"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label="แก้ไข" withArrow position="left" fz="xs">
            <ActionIcon
              variant="subtle"
              color="blue.6"
              radius="md"
              size="md"
              onClick={() => handleEdit(item)}
            >
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบ" withArrow position="left" fz="xs">
            <ActionIcon
              variant="subtle"
              color="red.6"
              radius="md"
              size="md"
              onClick={() => handleDelete(item)}
            >
              <IconTrash size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </motion.tr>
  ));

  return (
    <Container size="xl" py="lg">
      <style jsx global>{`
        .hover-row-lux:hover {
          background-color: ${getPrimaryColor()}05 !important;
          transform: translateY(-1px);
        }
        .custom-table-header, 
        .custom-table-header tr, 
        .custom-table-header th {
          background-color: ${getPrimaryColor()} !important;
          background: ${getPrimaryColor()} !important;
          color: white !important;
        }
      `}</style>
      
      <Stack gap="md">
        <Breadcrumbs 
          separator={<IconChevronRight size={12} stroke={1.5} />}
          styles={{ separator: { color: 'var(--mantine-color-dimmed)' } }}
        >
          <Anchor href="/admin" size="10px" c="dimmed" underline="hover">หน้าหลัก</Anchor>
          <Text size="10px" c="dimmed">ข้อมูลพื้นฐาน</Text>
          <Text size="10px" fw={700} c="primary">สถานที่จัดส่ง</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={3} fw={900} style={{ letterSpacing: "-0.5px", fontSize: '24px' }}>
              สถานที่จัดส่ง / DELIVERY TO
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              จัดการข้อมูลสถานที่จัดส่งสินค้าให้กับลูกค้าและโครงการต่างๆ
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} stroke={2} />}
            radius="xl"
            size="sm"
            onClick={handleOpenAdd}
            style={{
              boxShadow: `0 4px 12px ${getPrimaryColor()}33`,
              backgroundColor: getPrimaryColor(),
              color: '#ffffff',
              height: '38px'
            }}
          >
            เพิ่มสถานที่จัดส่งใหม่
          </Button>
        </Group>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหารหัส หรือชื่อสถานที่จัดส่ง..."
            leftSection={<IconSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
            size="xs"
            radius="md"
          />

          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead 
              className="custom-table-header"
              style={{ 
                backgroundColor: getPrimaryColor(),
                color: 'white'
              }}
            >
              <Table.Tr style={{ backgroundColor: 'transparent' }}>
                <Table.Th style={{ borderBottom: 'none', color: 'white' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">รหัส</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none', color: 'white' }}><Text size="11px" fw={700} c="white" tt="uppercase">ชื่อสถานที่จัดส่ง</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none', color: 'white' }} w={100}><Text size="11px" fw={700} c="white" tt="uppercase">ลำดับ</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none', color: 'white' }} w={150}><Text size="11px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text></Table.Th>
                <Table.Th style={{ textAlign: "right", borderBottom: 'none', color: 'white' }} w={100}><Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
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
                  <Table.Td colSpan={5}>
                    <Text ta="center" py="xl" c="dimmed" size="xs">
                      ไม่พบข้อมูลสถานที่จัดส่ง
                    </Text>
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
                color={themeColor}
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
            <IconTruck size={20} color={getPrimaryColor()} />
            <Text fw={900} size="lg" style={{ letterSpacing: "-0.5px" }}>
              {editingItem ? "แก้ไขสถานที่จัดส่ง" : "เพิ่มสถานที่จัดส่งใหม่"}
            </Text>
          </Group>
        }
        radius="lg"
        size="md"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="md">
          <TextInput
            label="รหัสสถานที่จัดส่ง"
            placeholder="ตัวอย่าง: DL01"
            value={formData.dl_code}
            onChange={(e) => setFormData({ ...formData, dl_code: e.currentTarget.value })}
            error={errors.dl_code}
            radius="md"
            disabled={!!editingItem}
            required
          />
          <TextInput
            label="ชื่อสถานที่จัดส่ง"
            placeholder="ตัวอย่าง: คอนโด แสนสิริ"
            value={formData.dl_name}
            onChange={(e) => setFormData({ ...formData, dl_name: e.currentTarget.value })}
            error={errors.dl_name}
            radius="md"
            required
          />
          <NumberInput
            label="ลำดับการแสดงผล"
            placeholder="ระบุตัวเลข (เช่น 30)"
            value={formData.dl_index}
            onChange={(val) => setFormData({ ...formData, dl_index: Number(val) })}
            radius="md"
            min={0}
          />
          
          <Group justify="flex-end" mt="lg">
            <Button variant="light" color="gray" onClick={() => setModalOpen(false)} radius="xl">
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              radius="xl"
              style={{ backgroundColor: getPrimaryColor() }}
            >
              {editingItem ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
