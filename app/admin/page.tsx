'use client';

import { Title, Grid, Paper, Text, Group, Box, Badge, Table } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { IconUserPlus, IconReceipt2, IconCoin, IconArrowUpRight } from '@tabler/icons-react';

const chartData = [
  { date: 'Mar 1', App: 2890, Tablet: 2338 },
  { date: 'Mar 2', App: 2756, Tablet: 2103 },
  { date: 'Mar 3', App: 3322, Tablet: 2194 },
  { date: 'Mar 4', App: 3470, Tablet: 2108 },
  { date: 'Mar 5', App: 3475, Tablet: 1812 },
  { date: 'Mar 6', App: 3129, Tablet: 1726 },
  { date: 'Mar 7', App: 3490, Tablet: 1982 },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', amount: '$120.00', status: 'Completed' },
  { id: 'ORD-002', customer: 'Jane Smith', amount: '$85.50', status: 'Pending' },
  { id: 'ORD-003', customer: 'Bob Johnson', amount: '$210.00', status: 'Shipped' },
  { id: 'ORD-004', customer: 'Alice Brown', amount: '$45.00', status: 'Cancelled' },
];

const StatsCard = ({ title, value, icon: Icon, diff }: any) => (
  <Paper withBorder p="md" radius="md">
    <Group justify="space-between">
      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
        {title}
      </Text>
      <Icon size="1.4rem" stroke={1.5} color="var(--mantine-color-blue-filled)" />
    </Group>

    <Group align="flex-end" gap="xs" mt="sm">
      <Text size="xl" fw={700}>
        {value}
      </Text>
      <Text c={diff > 0 ? 'teal' : 'red'} fz="sm" fw={500}>
        <span>{diff}%</span>
        <IconArrowUpRight size="1rem" stroke={1.5} />
      </Text>
    </Group>

    <Text fz="xs" c="dimmed" mt={7}>
      Compared to previous month
    </Text>
  </Paper>
);

export default function AdminDashboard() {
  return (
    <Box>
      <Title order={2} mb="xl">Analytics Overview</Title>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatsCard title="Revenue" value="$13,456" icon={IconCoin} diff={12} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatsCard title="New Orders" value="188" icon={IconReceipt2} diff={-3} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StatsCard title="New Customers" value="45" icon={IconUserPlus} diff={18} />
        </Grid.Col>
      </Grid>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="lg">Revenue Statistics</Title>
            <Box style={{ width: '100%', minWidth: 0 }}>
              <AreaChart
                h={300}
                data={chartData}
                dataKey="date"
                series={[
                  { name: 'App', color: 'blue.6' },
                  { name: 'Tablet', color: 'cyan.6' },
                ]}
                curveType="linear"
                withXAxis
                withYAxis
              />
            </Box>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Title order={4} mb="lg">Recent Orders</Title>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentOrders.map((order) => (
                  <Table.Tr key={order.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{order.id}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        variant="light" 
                        color={order.status === 'Completed' ? 'green' : order.status === 'Pending' ? 'orange' : order.status === 'Cancelled' ? 'red' : 'blue'}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" ta="right">{order.amount}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
