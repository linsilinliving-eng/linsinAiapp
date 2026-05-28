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
  Select,
  Text,
  Badge,
  Box,
  LoadingOverlay,
  Menu,
  Stack,
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
  IconDotsVertical,
  IconScale,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useHookSizeStore } from '@/store/hookSizeStore';
import { hookSizeSchema, HookSize } from '@/lib/validations/hookSize';

export default function HookSizePage() {
  const { data: session } = useSession();
  const themeColor = (session?.user as any)?.theme_color || 'blue';

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

  const { hookSizes, isLoading, fetchHookSizes, addHookSize, updateHookSize, deleteHookSize } = useHookSizeStore();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingItem, setEditingItem] = useState<HookSize | null>(null);
  const [search, setSearch] = useState('');

  const form = useForm({
    initialValues: {
      hook_size: '',
      desc: '',
      hook_status: 'Y',
    },
    validate: zodResolver(hookSizeSchema),
  });

  useEffect(() => {
    fetchHookSizes();
  }, [fetchHookSizes]);

  const filteredData = useMemo(() => {
    return hookSizes.filter((item) =>
      item.hook_size?.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.desc?.toLowerCase().includes(search.toLowerCase())
    );
  }, [hookSizes, search]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.reset();
    form.setFieldValue('hook_status', 'Y');
    open();
  };

  const handleOpenEdit = (item: HookSize) => {
    setEditingItem(item);
    form.setValues({
      hook_size: item.hook_size.toString(),
      desc: item.desc || '',
      hook_status: item.hook_status || 'Y',
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
        await updateHookSize({ ...payload, uuid: editingItem.uuid });
        notifications.show({
          title: 'สำเร็จ',
          message: 'อัปเดตข้อมูลขนาดห่วง/ตะขอเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      } else {
        await addHookSize(payload);
        notifications.show({
          title: 'สำเร็จ',
          message: 'เพิ่มข้อมูลขนาดห่วง/ตะขอเรียบร้อยแล้ว',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      }
      fetchHookSizes();
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

  const handleDelete = (item: HookSize) => {
    modals.openConfirmModal({
      title: <Text fw={700} size="lg">ยืนยันการลบข้อมูล</Text>,
      children: (
        <Text size="sm">
          คุณต้องการลบขนาดห่วง/ตะขอ <b>{item.hook_size}</b> ({item.desc}) ใช่หรือไม่?
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'md' },
      cancelProps: { radius: 'md' },
      onConfirm: async () => {
        try {
          await deleteHookSize(item.uuid!);
          notifications.show({
            title: 'สำเร็จ',
            message: 'ลบข้อมูลเรียบร้อยแล้ว',
            color: 'green',
            icon: <IconCheck size="1.1rem" />,
          });
          fetchHookSizes();
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

  const rows = filteredData.map((item) => (
    <Table.Tr key={item.uuid} style={{ transition: 'background-color 0.2s ease' }}>
      <Table.Td>
        <Text fw={600} size="sm">{item.hook_size}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.desc}</Text>
      </Table.Td>
      <Table.Td>
        <Badge 
          variant="light" 
          color={item.hook_status === 'Y' ? 'green' : 'gray'}
          radius="sm"
          size="sm"
        >
          {item.hook_status === 'Y' ? 'ใช้งาน' : 'ระงับ'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <ActionIcon 
            variant="light" 
            color={themeColor} 
            onClick={() => handleOpenEdit(item)}
            radius="md"
          >
            <IconEdit size="1.1rem" stroke={1.5} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            color="red" 
            onClick={() => handleDelete(item)}
            radius="md"
          >
            <IconTrash size="1.1rem" stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="md">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      
      <Paper 
        withBorder 
        shadow="md" 
        radius="lg" 
        p={0} 
        style={{ 
          overflow: 'hidden', 
          border: 'none',
          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'
        }}
      >
        <Box 
          p="xl" 
          style={{ 
            backgroundColor: getPrimaryColor(),
            color: 'white'
          }}
        >
          <Group justify="space-between">
            <Group>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: '12px', 
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}>
                <IconScale size={28} />
              </div>
              <div>
                <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>ข้อมูลขนาดห่วง/ตะขอ</Title>
                <Text size="xs" style={{ opacity: 0.9, fontWeight: 500 }}>จัดการรายการขนาดห่วงและอุปกรณ์ประกอบสินค้า</Text>
              </div>
            </Group>
            <Button 
              leftSection={<IconPlus size="1.1rem" />} 
              variant="white" 
              color={themeColor}
              onClick={handleOpenAdd}
              radius="md"
              fw={700}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              เพิ่มขนาดห่วง/ตะขอ
            </Button>
          </Group>
        </Box>

        <Box p="xl">
          <Group mb="xl">
            <TextInput
              placeholder="ค้นหาขนาด หรือรายละเอียด..."
              leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              radius="md"
              variant="filled"
            />
          </Group>

          <Table.ScrollContainer minWidth={600}>
            <Table 
              verticalSpacing="md" 
              highlightOnHover
            >
              <Table.Thead>
                <Table.Tr style={{ borderBottom: `2px solid ${getPrimaryColor()}20` }}>
                  <Table.Th style={{ color: getPrimaryColor(), fontWeight: 700 }}>ขนาด</Table.Th>
                  <Table.Th style={{ color: getPrimaryColor(), fontWeight: 700 }}>รายละเอียด</Table.Th>
                  <Table.Th style={{ color: getPrimaryColor(), fontWeight: 700 }}>สถานะ</Table.Th>
                  <Table.Th style={{ color: getPrimaryColor(), fontWeight: 700 }} ta="right">เครื่องมือ</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={4} ta="center" py="xl">
                      <Text c="dimmed" size="sm">ไม่พบข้อมูลขนาดห่วง/ตะขอ</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={700} size="lg" c="white">{editingItem ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}</Text>
        }
        radius="lg"
        size="md"
        centered
        padding={0}
        styles={{
          header: { 
            backgroundColor: getPrimaryColor(), 
            color: 'white',
            padding: '20px 24px',
          },
          close: { 
            color: 'white', 
            hover: { backgroundColor: 'rgba(255,255,255,0.2)' } 
          },
        }}
        withCloseButton={true}
      >
        <Box p="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="ขนาดห่วง/ตะขอ"
                placeholder="เช่น 9, 10, Small, Large"
                required
                {...form.getInputProps('hook_size')}
                radius="md"
              />

              <TextInput
                label="รายละเอียด/คำอธิบาย"
                placeholder="เช่น เบอร์ 9"
                {...form.getInputProps('desc')}
                radius="md"
              />

              <Select
                label="สถานะการใช้งาน"
                data={[
                  { value: 'Y', label: 'ใช้งาน (Active)' },
                  { value: 'N', label: 'ระงับ (Inactive)' },
                ]}
                {...form.getInputProps('hook_status')}
                radius="md"
              />

              <Group justify="flex-end" mt="xl">
                <Button variant="subtle" onClick={close} radius="md" color="gray">ยกเลิก</Button>
                <Button 
                  type="submit" 
                  color={themeColor} 
                  radius="md"
                  px="xl"
                  style={{ backgroundColor: getPrimaryColor() }}
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
