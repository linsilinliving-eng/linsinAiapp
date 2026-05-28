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
  rem
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconChevronRight, 
  IconUsers,
  IconSearch,
  IconAlertCircle
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useProjectTypeStore } from "@/store/projectTypeStore";
import { projectTypeSchema } from "@/lib/validations/projectType";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectTypesPage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'blue';
  
  const { 
    types, 
    loading, 
    fetchTypes, 
    addType, 
    updateType, 
    deleteType,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    paginatedTypes
  } = useProjectTypeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [projectTypeName, setProjectTypeName] = useState("");
  const [errors, setErrors] = useState<{ project_type?: string }>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenAdd = () => {
    setEditingType(null);
    setProjectTypeName("");
    setErrors({});
    setModalOpen(true);
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setProjectTypeName(type.project_type);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      uuid: editingType?.uuid,
      project_type: projectTypeName,
      created_by: session?.user?.name || "system",
      updated_by: session?.user?.name || "system",
    };

    const result = projectTypeSchema.safeParse(payload);
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
      if (editingType) {
        success = await updateType(payload);
      } else {
        success = await addType(payload);
      }

      if (success) {
        setModalOpen(false);
      }
    } catch (error) {
      console.error(error);
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
          คุณต้องการลบประเภทคู่ค้านี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </Text>
      ),
      labels: { confirm: 'ยืนยันลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { variant: 'light', color: 'gray', radius: 'md' },
      centered: true,
      onConfirm: () => deleteType(uuid),
    });
  };

  const filteredTypes = types.filter(t => 
    t.project_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentTypes = filteredTypes.slice(startIdx, startIdx + itemsPerPage);

  const rows = currentTypes.map((type, index) => (
    <motion.tr 
      key={type.uuid}
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
             <IconUsers size={12} />
          </ActionIcon>
          <Text size="xs" fw={600}>
            {type.project_type}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="dot" color="gray" size="xs" radius="xs" fz={9}>
          {type.created_by || "System"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="10px" c="dimmed">
          {type.created_at ? new Date(type.created_at).toLocaleDateString("th-TH", {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label="แก้ไข" withArrow position="left" fz="xs">
            <ActionIcon
              variant="subtle"
              color="blue.6"
              radius="md"
              size="md"
              onClick={() => handleEdit(type)}
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
              onClick={() => handleDelete(type.uuid)}
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
      `}</style>
      
      <Stack gap="md">
        <Breadcrumbs 
          separator={<IconChevronRight size={12} stroke={1.5} />}
          styles={{ separator: { color: 'var(--mantine-color-dimmed)' } }}
        >
          <Anchor href="/admin" size="10px" c="dimmed" underline="hover">หน้าหลัก</Anchor>
          <Text size="10px" c="dimmed">ข้อมูลพื้นฐาน</Text>
          <Text size="10px" fw={700} c="primary">ประเภทคู่ค้า</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={3} fw={900} style={{ letterSpacing: "-0.5px", fontSize: '24px' }}>
              จัดการประเภทคู่ค้า
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              บริหารจัดการประเภทของคู่ค้าหรือบริษัทที่ดำเนินโครงการร่วมกับคุณ
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
            เพิ่มประเภทคู่ค้าใหม่
          </Button>
        </Group>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหาประเภทคู่ค้า..."
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
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ชื่อประเภทคู่ค้า</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ผู้บันทึก</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">วันที่บันทึก</Text></Table.Th>
              <Table.Th style={{ textAlign: "right", borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
            </Table.Tr>
          </Table.Thead>
            <Table.Tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={4}><Skeleton height={40} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center" py="xl">
                    <Text fz="xs" c="dimmed">ไม่พบข้อมูล</Text>
                  </Table.Td>
                </Table.Tr>
              ) : rows}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination 
                total={totalPages} 
                value={currentPage} 
                onChange={setCurrentPage} 
                size="sm" 
                radius="md"
                color={themeColor}
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
      >
        <div style={{ backgroundColor: getPrimaryColor(), padding: '16px 20px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
          <Text fw={700}>{editingType ? "แก้ไขประเภทคู่ค้า" : "เพิ่มประเภทคู่ค้าใหม่"}</Text>
          <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
        </div>
        <Stack p="xl" gap="md">
          <TextInput
            label="ชื่อประเภทคู่ค้า"
            placeholder="ระบุชื่อประเภทคู่ค้า"
            required
            value={projectTypeName}
            onChange={(e) => setProjectTypeName(e.target.value)}
            error={errors.project_type}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" color="gray" onClick={() => setModalOpen(false)}>ยกเลิก</Button>
            <Button 
              onClick={handleSubmit} 
              style={{ backgroundColor: getPrimaryColor() }}
              loading={loading}
            >
              บันทึกข้อมูล
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
