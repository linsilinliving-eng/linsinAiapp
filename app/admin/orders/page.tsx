'use client';

import { Title, Paper, Group, Stack, Badge, Table, Text, ScrollArea, Box, Select } from '@mantine/core';
import { BarChart } from '@mantine/charts';

const salesData = [
  { month: 'Jan', Sales: 1200, Orders: 800 },
  { month: 'Feb', Sales: 1900, Orders: 1200 },
  { month: 'Mar', Sales: 400, Orders: 600 },
  { month: 'Apr', Sales: 1000, Orders: 400 },
  { month: 'May', Sales: 800, Orders: 1000 },
];

const orders = [
  { id: '#4502', date: '2024-05-01', customer: 'John Doe', total: '$120.00', status: 'Completed', payment: 'Credit Card' },
  { id: '#4503', date: '2024-05-02', customer: 'Jane Smith', total: '$85.50', status: 'Pending', payment: 'PayPal' },
  { id: '#4504', date: '2024-05-02', customer: 'Bob Johnson', total: '$210.00', status: 'Shipped', payment: 'Bank Transfer' },
  { id: '#4505', date: '2024-05-03', customer: 'Alice Brown', total: '$45.00', status: 'Cancelled', payment: 'Credit Card' },
  { id: '#4506', date: '2024-05-04', customer: 'Michael Soft', total: '$320.00', status: 'Completed', payment: 'Stripe' },
];

export default function OrdersPage() {
  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Sales & Orders</Title>
        <Select 
          placeholder="Filter range"
          data={['Last 7 days', 'Last 30 days', 'Last Year']}
          defaultValue="Last 30 days"
        />
      </Group>

      <Paper withBorder p="md" radius="md" mb="xl">
        <Title order={4} mb="lg">Revenue vs Orders</Title>
        <Box style={{ width: '100%', minWidth: 0 }}>
          <BarChart
            h={300}
            data={salesData}
            dataKey="month"
            series={[
              { name: 'Sales', color: 'blue.6' },
              { name: 'Orders', color: 'teal.6' },
            ]}
            tickLine="y"
          />
        </Box>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="lg">Order History</Title>
        <ScrollArea>
          <Table verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order ID</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Payment</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td><Text fw={500}>{order.id}</Text></Table.Td>
                  <Table.Td><Text size="sm">{order.date}</Text></Table.Td>
                  <Table.Td><Text size="sm">{order.customer}</Text></Table.Td>
                  <Table.Td><Text size="sm">{order.payment}</Text></Table.Td>
                  <Table.Td>
                    <Badge 
                      color={order.status === 'Completed' ? 'green' : order.status === 'Pending' ? 'orange' : order.status === 'Cancelled' ? 'red' : 'blue'} 
                      variant="light"
                    >
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right"><Text fw={500}>{order.total}</Text></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Box>
  );
}
