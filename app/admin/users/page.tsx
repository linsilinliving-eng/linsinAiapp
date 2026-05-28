'use client';

import { useEffect, useState } from 'react';
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
  Select,
  Button,
  PasswordInput,
  Box,
  Tooltip,
  Avatar
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useSession } from 'next-auth/react';
import moment from 'moment';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
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

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      role: 'user',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'อีเมลไม่ถูกต้อง'),
      name: (value) => (value.length < 2 ? 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' : null),
      password: (value, values) => {
        if (!editingUser && !value) return 'กรุณาระบุรหัสผ่าน';
        if (value && value.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        return null;
      }
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.error || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
    } catch (error: any) {
      notifications.show({ title: 'ข้อผิดพลาด', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.reset();
    open();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    open();
  };

  const onSave = async (values: typeof form.values) => {
    try {
      const url = editingUser ? '/api/users/edit' : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = editingUser 
        ? { ...values, id: editingUser.id }
        : values;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        notifications.show({ 
          title: 'สำเร็จ', 
          message: editingUser ? 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว' : 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว', 
          color: 'green' 
        });
        close();
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      notifications.show({ title: 'ข้อผิดพลาด', message: error.message, color: 'red' });
    }
  };

  const confirmDelete = (id: number) => {
    modals.openConfirmModal({
      title: 'ลบผู้ใช้งาน',
      children: <Text size="sm">คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานรายนี้?</Text>,
      labels: { confirm: 'ลบ', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/edit?id=${id}`, { method: 'DELETE' });
          if (response.ok) {
            notifications.show({ title: 'ลบแล้ว', message: 'ลบผู้ใช้งานเรียบร้อยแล้ว', color: 'green' });
            fetchUsers();
          }
        } catch (error: any) {
          notifications.show({ title: 'ข้อผิดพลาด', message: error.message, color: 'red' });
        }
      },
    });
  };

  const rows = users.map((user) => (
    <Table.Tr key={user.id} style={{ transition: 'all 0.2s ease' }}>
      <Table.Td>
        <Text size="xs" c="dimmed" fw={700}>#{user.id}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar color={themeColor} radius="xl" size="sm" variant="light">
            {user.name.substring(0, 1).toUpperCase()}
          </Avatar>
          <Box>
            <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>{user.name}</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge 
          variant="dot" 
          color={user.role === 'admin' ? themeColor : 'gray'}
          radius="md"
          px="xs"
        >
          {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานทั่วไป'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="xs" fw={500}>{moment(user.created_at).format('DD/MM/YYYY')}</Text>
          <Text size="10px" c="dimmed">{moment(user.created_at).format('HH:mm น.')}</Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Group gap={8} justify="flex-end">
          <Tooltip label="แก้ไขข้อมูล">
            <ActionIcon variant="light" color="blue" radius="md" onClick={() => handleEdit(user)}>
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="ลบผู้ใช้">
            <ActionIcon variant="light" color="red" radius="md" onClick={() => confirmDelete(user.id)}>
              <IconTrash size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid px="lg">
      <Group justify="space-between" mb={30}>
        <Box>
          <Title order={2} fw={800} style={{ letterSpacing: '-0.5px' }}>จัดการผู้ใช้งาน</Title>
          <Text size="xs" c="dimmed">จัดการสิทธิ์และข้อมูลพยาบาล/พนักงานในระบบ</Text>
        </Box>
        <Button 
          leftSection={<IconUserPlus size={18} />} 
          onClick={handleAdd}
          radius="md"
          size="md"
          style={{ 
            boxShadow: `0 4px 15px ${getPrimaryColor()}33`,
            backgroundColor: getPrimaryColor(),
            color: '#ffffff'
          }}
        >
          เพิ่มผู้ใช้งานใหม่
        </Button>
      </Group>

      <Paper withBorder shadow="xl" radius="lg" p={0} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table verticalSpacing="md" highlightOnHover>
          <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
            <Table.Tr>
              <Table.Th style={{ width: 80, borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ไอดี</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">ข้อมูลผู้ใช้งาน</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">สิทธิ์การใช้งาน</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }}><Text size="11px" fw={700} c="white" tt="uppercase">วันที่บันทึก</Text></Table.Th>
              <Table.Th style={{ borderBottom: 'none' }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{loading ? <Table.Tr><Table.Td colSpan={5}><Skeleton height={40} mt={10} radius="md" /></Table.Td></Table.Tr> : rows}</Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title={editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}>
        <form onSubmit={form.onSubmit(onSave)}>
          <TextInput label="ชื่อ" placeholder="ชื่อ-นามสกุล" required {...form.getInputProps('name')} />
          <TextInput label="อีเมล" placeholder="example@email.com" required mt="md" {...form.getInputProps('email')} />
          <Select 
            label="สิทธิ์" 
            data={[
              { value: 'admin', label: 'ผู้ดูแลระบบ' },
              { value: 'user', label: 'ผู้ใช้งานทั่วไป' }
            ]} 
            mt="md" 
            {...form.getInputProps('role')} 
          />
          <PasswordInput 
            label={editingUser ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"} 
            placeholder="อย่างน้อย 6 ตัวอักษร" 
            required={!editingUser} 
            mt="md" 
            {...form.getInputProps('password')} 
          />
          <Button type="submit" fullWidth mt="xl">
            {editingUser ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มผู้ใช้งาน'}
          </Button>
        </form>
      </Modal>
    </Container>
  );
}