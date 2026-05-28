'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Title,
  Button,
  Group,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Text,
  Badge,
  Box,
  LoadingOverlay,
  Stack,
  Tooltip,
  Breadcrumbs,
  Anchor,
  Pagination,
  Skeleton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch, 
  IconCheck,
  IconX,
  IconChevronRight
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useCreditTermStore } from '@/store/creditTermStore';
import { creditTermSchema, CreditTerm } from '@/lib/validations/creditTerm';
import { motion } from 'framer-motion';

export default function CreditTermPage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'blue';

  const getPrimaryColor = () => {
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
  
  const { creditTerms, isLoading, fetchCreditTerms, addCreditTerm, updateCreditTerm, deleteCreditTerm } = useCreditTermStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<CreditTerm | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCreditTerms();
  }, [fetchCreditTerms]);

  const form = useForm({
    initialValues: {
      credit_id: '',
      credit_name: '',
      credit_day: 0,
    },
    validate: zodResolver(creditTermSchema),
  });

  const filteredData = useMemo(() => {
    return creditTerms.filter((item) =>
      item.credit_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.credit_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [creditTerms, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.reset();
    open();
  };

  const handleOpenEdit = (item: CreditTerm) => {
    setEditingItem(item);
    form.setValues({
      credit_id: item.credit_id,
      credit_name: item.credit_name,
      credit_day: item.credit_day,
    });
    open();
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        created_by: session?.user?.name || 'system',
        updated_by: session?.user?.name || 'system',
      };

      if (editingItem) {
        await updateCreditTerm({ ...payload, uuid: editingItem.uuid });
        notifications.show({
          title: 'สำเร็จ',
          message: 'อัปเดตประเภทการจ่ายเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      } else {
        await addCreditTerm(payload);
        notifications.show({
          title: 'สำเร็จ',
          message: 'เพิ่มประเภทการจ่ายเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      }
      fetchCreditTerms();
      close();
    } catch (error: any) {
      notifications.show({
        title: 'เกิดข้อผิดพลาด',
        message: error.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    }
  };

  const handleDelete = (item: CreditTerm) => {
    modals.openConfirmModal({
      title: <Text fw={700} size="lg">ยืนยันการลบข้อมูล</Text>,
      children: (
        <Text size="sm">
          คุณต้องการลบประเภทการจ่าย <b>{item.credit_name}</b> ใช่หรือไม่?
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { radius: 'md' },
      onConfirm: async () => {
        try {
          await deleteCreditTerm(item.uuid!);
          notifications.show({
            title: 'สำเร็จ',
            message: 'ลบข้อมูลเรียบร้อยแล้ว',
            color: 'green',
            icon: <IconCheck size="1.1rem" />,
          });
          fetchCreditTerms();
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
        <Badge variant="filled" color={themeColor} radius="xs" fz={10}>
          {item.credit_id}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={600} size="xs">{item.credit_name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs">{item.credit_day} วัน</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end">
          <Tooltip label="แก้ไข" withArrow position="left" fz="xs">
            <ActionIcon 
              variant="subtle" 
              color="blue.6" 
              onClick={() => handleOpenEdit(item)}
              radius="md"
              size="md"
            >
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบ" withArrow position="left" fz="xs">
            <ActionIcon 
              variant="subtle" 
              color="red.6" 
              onClick={() => handleDelete(item)}
              radius="md"
              size="md"
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
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
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
          <Text size="10px" fw={700} color={themeColor}>ประเภทการจ่าย</Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={3} fw={900} style={{ letterSpacing: "-0.5px", fontSize: '24px' }}>
              ข้อมูลประเภทการจ่าย
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              จัดการเงื่อนไขเครดิตและรูปแบบการชำระเงินสำหรับคู่ค้าของคุณ
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
            เพิ่มประเภทการจ่าย
          </Button>
        </Group>

        <Paper withBorder radius="lg" p="md" shadow="sm">
          <TextInput
            placeholder="ค้นหารหัส หรือชื่อประเภทการจ่าย..."
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
                <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">รหัส</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ชื่อประเภทการจ่าย</Text></Table.Th>
                <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">จำนวนวัน (เครดิต)</Text></Table.Th>
                <Table.Th style={{ textAlign: "right", borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">จัดการ</Text></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={4}><Skeleton height={40} radius="md" /></Table.Td>
                  </Table.Tr>
                ))
              ) : rows.length > 0 ? rows : (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center" py="xl">
                    <Text fz="xs" c="dimmed">ไม่พบข้อมูลประเภทการจ่าย</Text>
                  </Table.Td>
                </Table.Tr>
              )}
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
        opened={opened}
        onClose={close}
        withCloseButton={false}
        radius="lg"
        centered
        padding={0}
      >
        <div style={{ backgroundColor: getPrimaryColor(), padding: '16px 20px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
          <Text fw={700}>{editingItem ? 'แก้ไขประเภทการจ่าย' : 'เพิ่มประเภทการจ่าย'}</Text>
          <button onClick={close} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
        </div>
        <Box p="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="รหัสประเภทการจ่าย"
                placeholder="เช่น CASH, 30DAYS"
                required
                {...form.getInputProps('credit_id')}
                radius="md"
              />
              <TextInput
                label="ชื่อประเภทการจ่าย"
                placeholder="เช่น เงินสด, เครดิต 30 วัน"
                required
                {...form.getInputProps('credit_name')}
                radius="md"
              />
              <NumberInput
                label="จำนวนวัน (เครดิต)"
                placeholder="0"
                min={0}
                {...form.getInputProps('credit_day')}
                radius="md"
              />
              <Group justify="flex-end" mt="xl">
                <Button variant="light" color="gray" onClick={close} radius="md">ยกเลิก</Button>
                <Button 
                  type="submit" 
                  radius="md"
                  px="xl"
                  style={{ backgroundColor: getPrimaryColor(), color: '#fff' }}
                >
                  บันทึกข้อมูล
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
