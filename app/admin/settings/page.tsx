'use client';

import { Title, Paper, Group, Stack, TextInput, Text, Switch, Button, Divider, Avatar } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function SettingsPage() {
  const handleSave = () => {
    notifications.show({
      title: 'Settings saved',
      message: 'Your preferences have been updated successfully.',
      color: 'blue'
    });
  };

  return (
    <Stack>
      <Title order={2} mb="md">Settings</Title>

      <Paper withBorder p="xl" radius="md">
        <Title order={4} mb="lg">Profile Information</Title>
        <Group mb="xl">
          <Avatar size={80} radius="xl" src={null} color="blue">AD</Avatar>
          <Stack gap={0}>
            <Text fw={500}>Admin User</Text>
            <Text size="sm" c="dimmed">admin@linsirin.com</Text>
            <Button variant="subtle" size="xs" p={0} mt={5}>Change Avatar</Button>
          </Stack>
        </Group>

        <Stack gap="md">
          <Group grow>
            <TextInput label="First Name" defaultValue="Admin" />
            <TextInput label="Last Name" defaultValue="User" />
          </Group>
          <TextInput label="Email Address" defaultValue="admin@linsirin.com" />
        </Stack>
      </Paper>

      <Paper withBorder p="xl" radius="md">
        <Title order={4} mb="lg">Notifications</Title>
        <Stack>
          <Group justify="space-between">
            <Text size="sm">Email notifications on new orders</Text>
            <Switch defaultChecked />
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text size="sm">SMS alerts for high value transactions</Text>
            <Switch />
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text size="sm">Weekly analytics report</Text>
            <Switch defaultChecked />
          </Group>
        </Stack>
      </Paper>

      <Group justify="flex-end">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </Group>
    </Stack>
  );
}
