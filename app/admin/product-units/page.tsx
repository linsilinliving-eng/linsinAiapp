"use client";

import { useEffect } from "react";
import {
  Table,
  Text,
  Badge,
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
  Tooltip,
  Pagination,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronRight,
  IconScale,
  IconAlertCircle
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSession } from "next-auth/react";
import { useUnitStore } from "@/store/unitStore";
import { useState } from "react";
import { productUnitSchema } from "@/lib/validations/productUnit";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductUnitsPage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'green';
  const { 
    units, 
    loading, 
    fetchUnits, 
    addUnit, 
    updateUnit, 
    deleteUnit,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    paginatedUnits
  } = useUnitStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  // Get Primary Color Hex
  const getPrimaryColor = () => {
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

  // Form states
  const [unitname, setUnitname] = useState("");
  const [unitindex, setUnitindex] = useState<number | string>(0);
  const [errors, setErrors] = useState<{ unitname?: string }>({});

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setUnitname("");
    setUnitindex(units.length > 0 ? Math.max(...units.map(u => u.unit_index)) + 1 : 1);
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (unit: any) => {
    setEditingUnit(unit);
    setUnitname(unit.unitname);
    setUnitindex(unit.unit_index);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      uuid: editingUnit?.uuid,
      unitname,
      unit_index: Number(unitindex || 0),
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    // Client-side validation with Zod
    const result = productUnitSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editingUnit) {
        await updateUnit(payload);
      } else {
        await addUnit(payload);
      }

      notifications.show({
        title: 'สำเร็จ',
        message: editingUnit ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว',
        color: 'green',
      });
      setModalOpen(false);
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
      children: (
        <Text size="sm" c="dimmed">
          คุณต้องการลบหน่วยสินค้านี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </Text>
      ),
      labels: { confirm: 'ยืนยันลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { variant: 'light', color: 'gray', radius: 'md' },
      centered: true,
      onConfirm: () => deleteUnit(uuid),
    });
  };

  const currentUnits = paginatedUnits();
  const totalPages = Math.ceil(units.length / itemsPerPage);

  const rows = currentUnits.map((unit, index) => (
    <motion.tr 
      key={unit.uuid}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ 
        cursor: "pointer",
        transition: 'all 0.2s ease',
      }}
      className="mantine-Table-tr hover-row-lux"
    >
      <Table.Td>
        <Text size="xs" c="dimmed" fw={500}>
          {unit.unit_index}
        </Text>
      </Table.Td>
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
             <IconScale size={12} />
          </ActionIcon>
          <Text size="xs" fw={600} style={{ letterSpacing: '0.1px' }}>
            {unit.unitname}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="dot" color="gray" size="xs" radius="xs" fz={9}>
          {unit.created_by || "System"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="10px" c="dimmed">
          {unit.created_at ? new Date(unit.created_at).toLocaleDateString("th-TH", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label="แก้ไขข้อมูล" withArrow position="left" fz="xs">
            <ActionIcon
              variant="subtle"
              color="blue.6"
              radius="md"
              size="md"
              onClick={() => handleEdit(unit)}
              className="action-btn-hover"
            >
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบรายการ" withArrow position="left" fz="xs">
            <ActionIcon
              variant="subtle"
              color="red.6"
              radius="md"
              size="md"
              onClick={() => handleDelete(unit.uuid)}
              className="action-btn-hover"
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
        .action-btn-hover:hover {
          transform: scale(1.05);
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
      <Stack gap="md">
        <Breadcrumbs 
          separator={<IconChevronRight size={12} stroke={1.5} />}
          styles={{ separator: { color: 'var(--mantine-color-dimmed)' } }}
        >
          <Anchor href="/admin" size="10px" c="dimmed" underline="hover">
            หน้าหลัก
          </Anchor>
          <Text size="10px" c="dimmed">
            ข้อมูลพื้นฐาน
          </Text>
          <Text size="10px" fw={700} c="primary">
            หน่วยสินค้า
          </Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={3} fw={900} style={{ letterSpacing: "-0.5px", fontSize: '24px' }}>
              จัดการหน่วยสินค้า
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              ตั้งค่าและบริหารจัดการข้อมูลหน่วยนับสินค้าที่ใช้ภายในคลังของคุณ
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} stroke={2} />}
            radius="xl"
            size="sm"
            onClick={handleOpenAdd}
            style={{
              paddingLeft: '16px',
              paddingRight: '20px',
              boxShadow: `0 4px 12px ${getPrimaryColor()}33`,
              backgroundColor: getPrimaryColor(),
              color: '#ffffff',
              border: 'none',
              height: '38px'
            }}
          >
            เพิ่มหน่วยสินค้าใหม่
          </Button>
        </Group>

        <Paper
          withBorder={false}
          shadow="0 4px 15px rgba(0,0,0,0.03)"
          radius="lg"
          p={0}
          style={{
            background: "#ffffff",
            border: '1px solid #f1f3f5',
            overflow: 'hidden'
          }}
        >
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
              <Table.Tr>
                <Table.Th style={{ width: 60, borderTopLeftRadius: '12px', borderBottom: 'none' }}>
                  <Text size="11px" fw={700} c="white" tt="uppercase">ลำดับ</Text>
                </Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}>
                  <Text size="11px" fw={700} c="white" tt="uppercase">ชื่อหน่วยสินค้า</Text>
                </Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}>
                  <Text size="11px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text>
                </Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}>
                  <Text size="11px" fw={700} c="white" tt="uppercase">วันที่บันทึก</Text>
                </Table.Th>
                <Table.Th style={{ textAlign: "right", borderTopRightRadius: '12px', borderBottom: 'none' }}>
                  <Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={5}><Skeleton height={42} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : units.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} align="center">
                    <Stack gap="xs" py="md">
                      <IconScale size={32} color="#e9ecef" />
                      <Text fz="xs" fw={500} c="dimmed">ไม่พบข้อมูลในขณะนี้</Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {rows}
                </AnimatePresence>
              )}
            </Table.Tbody>
          </Table>

          {totalPages > 0 && (
            <Group justify="center" py="md" style={{ borderTop: '1px solid #f1f3f5' }}>
              <Pagination 
                total={totalPages} 
                value={currentPage} 
                onChange={setCurrentPage} 
                radius="xl"
                size="sm"
                withEdges
              />
            </Group>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        withCloseButton={false}
        radius="lg"
        centered
        padding={0}
        styles={{
          content: { overflow: 'hidden' },
          body: { padding: 0 }
        }}
      >
        <div 
          className="modal-custom-header"
          style={{ 
            backgroundColor: getPrimaryColor(),
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#ffffff',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}>
            {editingUnit ? "แก้ไขหน่วยสินค้า" : "เพิ่มหน่วยสินค้าใหม่"}
          </div>
          <button 
            onClick={() => setModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '28px',
              fontWeight: 'bold',
              lineHeight: 1,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>
        </div>
        
        <Stack gap="md" p="xl">
          <TextInput
            label="ชื่อหน่วยสินค้า"
            placeholder="เช่น ชิ้น, ชุด, เมตร"
            required
            value={unitname}
            onChange={(e) => setUnitname(e.currentTarget.value)}
            error={errors.unitname}
          />
          <NumberInput
            label="เรียงลำดับ"
            placeholder="ลำดับการแสดงผล"
            value={unitindex}
            onChange={setUnitindex}
          />
          <Group justify="flex-end" mt="xl">
            <Button 
              variant="filled" 
              color="gray" 
              onClick={() => setModalOpen(false)}
              radius="md"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSubmit} 
              radius="md"
              size="md"
              px="xl"
              style={{
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                backgroundColor: getPrimaryColor(),
                color: '#ffffff'
              }}
              loading={loading}
            >
              {editingUnit ? "บันทึกการแก้ไข" : "เพิ่มหน่วยสินค้า"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
