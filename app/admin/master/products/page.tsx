'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Select,
  Badge,
  Grid,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconPackage,
  IconChevronRight,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useProductStore } from '@/store/productStore';
import { useProductGroupStore } from '@/store/productGroupStore';
import { useUnitStore } from '@/store/unitStore';
import { productSchema } from '@/lib/validations/product';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const { data: session } = useSession();
  const { 
    products, 
    isLoading, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    currentPage, 
    setCurrentPage 
  } = useProductStore();
  const { productGroups, fetchProductGroups } = useProductGroupStore();
  const { units, fetchUnits } = useUnitStore();
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchProductGroups();
    fetchUnits();
  }, [fetchProducts, fetchProductGroups, fetchUnits]);

  // ดึงโทนสีตามรูปแบบหน้า Partner Types (Vivid & Deep Palette)
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

  const form = useForm({
    initialValues: {
      product_code: '',
      product_name: '',
      product_group: '',
      supplier_code: '',
      stock_status: 'N',
      sale_price: 0,
      purchase_price: 0,
      cloth_face: 0,
      product_unit: '',
      type_price: 'UNIT',
      product_status: 'Y',
      product_lower: 0,
      width_start: 0,
      width_end: 0,
      item_kg: 0,
      item_type: '',
    },
    validate: zodResolver(productSchema),
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.reset();
    setModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingItem(product);
    form.setValues({
      product_code: product.product_code,
      product_name: product.product_name || '',
      product_group: product.product_group || '',
      supplier_code: product.supplier_code || '',
      stock_status: product.stock_status || 'N',
      sale_price: Number(product.sale_price) || 0,
      purchase_price: Number(product.purchase_price) || 0,
      cloth_face: Number(product.cloth_face) || 0,
      product_unit: product.product_unit || '',
      type_price: product.type_price || 'UNIT',
      product_status: product.product_status || 'Y',
      product_lower: Number(product.product_lower) || 0,
      width_start: Number(product.width_start) || 0,
      width_end: Number(product.width_end) || 0,
      item_kg: Number(product.item_kg) || 0,
      item_type: product.item_type || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      uuid: editingItem?.uuid,
      created_by: session?.user?.name || 'system',
      updated_by: session?.user?.name || 'system',
    };

    try {
      let success = false;
      if (editingItem) {
        success = await updateProduct(payload);
      } else {
        success = await addProduct(payload);
      }

      if (success) {
        notifications.show({
          title: 'สำเร็จ',
          message: editingItem ? 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว' : 'เพิ่มข้อมูลสินค้าเรียบร้อยแล้ว',
          color: 'green',
        });
        setModalOpen(false);
      }
    } catch (error) {
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
        <Group gap='xs'>
          <IconAlertCircle size={20} color='red' />
          <Text fw={700}>ยืนยันการลบข้อมูล</Text>
        </Group>
      ),
      children: (
        <Text size='sm'>
          คุณต้องการลบข้อมูลสินค้านี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถเรียกคืนได้
        </Text>
      ),
      labels: { confirm: 'ลบข้อมูล', cancel: 'ยกเลิก' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      centered: true,
      onConfirm: async () => {
        const success = await deleteProduct(uuid);
        if (success) {
          notifications.show({
            title: 'สำเร็จ',
            message: 'ลบข้อมูลสินค้าเรียบร้อยแล้ว',
            color: 'green',
          });
        }
      },
    });
  };

  const filteredData = useMemo(() => {
    return products.filter(
      (item: any) =>
        item.product_code.toLowerCase().includes(search.toLowerCase()) ||
        (item.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.product_group || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.product_group_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const productGroupData = productGroups.map(pg => ({ value: pg.code, label: pg.name }));
  const unitData = units.map(u => ({ value: u.unitname, label: u.unitname }));

  const rows = currentData.map((product: any, index: number) => (
    <motion.tr 
      key={product.uuid} 
      className='mantine-Table-tr hover-row-lux'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Table.Td>
        <Text size='sm' fw={500}>{product.product_code}</Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Text size='sm' fw={600}>{product.product_name}</Text>
          <Text size='xs' c='dimmed'>{product.product_group_name || product.product_group}</Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size='sm' fw={600} c={getPrimaryColor()}>
          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(product.sale_price)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant='light' color='gray' size='sm'>{product.product_unit}</Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={product.product_status === 'Y' ? 'green' : 'red'} variant='dot'>
          {product.product_status === 'Y' ? 'ปกติ' : 'ซ่อน'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap='xs' justify='flex-end'>
          <Tooltip label='แก้ไข'>
            <ActionIcon
              variant='subtle'
              color={getPrimaryColor()}
              onClick={() => handleEdit(product)}
              radius='md'
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='ลบ'>
            <ActionIcon
              variant='subtle'
              color='red'
              onClick={() => handleDelete(product.uuid)}
              radius='md'
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </motion.tr>
  ));

  return (
    <Container size='xl' py='lg'>
      <style jsx global>{`
        .hover-row-lux:hover {
          background-color: ${getPrimaryColor()}05 !important;
          transform: translateY(-1px);
        }
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
      
      <Stack gap='md'>
        <Breadcrumbs separator={<IconChevronRight size={12} stroke={1.5} />}>
          <Anchor href='/admin' size='xs' c='dimmed'>Dashboard</Anchor>
          <Text size='xs' c='dimmed'>Master Data</Text>
          <Text size='xs' fw={700} c={getPrimaryColor()}>สินค้าและบริการ</Text>
        </Breadcrumbs>

        <Group justify='space-between' align='flex-end'>
          <Box>
            <Title order={3} fw={900} style={{ fontSize: '24px' }}>จัดการสินค้าและบริการ</Title>
            <Text size='xs' c='dimmed'>บริหารจัดการข้อมูลสินค้า ราคา และหน่วยนับในระบบ</Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} />}
            radius='xl'
            onClick={handleOpenAdd}
            style={{ backgroundColor: getPrimaryColor(), fontWeight: 700 }}
          >
            เพิ่มสินค้าใหม่
          </Button>
        </Group>

        <Paper withBorder radius='lg' shadow='xs' p='md'>
          <Group mb='md'>
            <TextInput
              placeholder='ค้นหารหัส หรือชื่อสินค้า...'
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              radius='md'
            />
          </Group>

          <Table verticalSpacing='sm' withRowBorders>
            <Table.Thead style={{ backgroundColor: getPrimaryColor() }}>
              <Table.Tr>
                <Table.Th style={{ color: 'white', fontWeight: 700 }}>รหัสสินค้า</Table.Th>
                <Table.Th style={{ color: 'white', fontWeight: 700 }}>ชื่อสินค้า / กลุ่ม</Table.Th>
                <Table.Th style={{ color: 'white', fontWeight: 700 }}>ราคาขาย</Table.Th>
                <Table.Th style={{ color: 'white', fontWeight: 700 }}>หน่วย</Table.Th>
                <Table.Th style={{ color: 'white', fontWeight: 700 }}>สถานะ</Table.Th>
                <Table.Th style={{ color: 'white', fontWeight: 700, textAlign: 'right' }}>จัดการ</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Table.Tr key={i}>
                    <Table.Td colSpan={6}><Skeleton height={40} radius='md' /></Table.Td>
                  </Table.Tr>
                ))
              ) : filteredData.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} align='center' py='xl'>
                    <Text c='dimmed'>ไม่พบข้อมูลสินค้า</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {rows}
                </AnimatePresence>
              )}
            </Table.Tbody>
          </Table>

          {totalPages > 0 && (
            <Group justify='center' py='md' style={{ borderTop: '1px solid #f1f3f5' }}>
              <Pagination 
                total={totalPages} 
                value={currentPage} 
                onChange={setCurrentPage}
                radius='xl'
                size='sm'
                withEdges
              />
            </Group>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap='xs'>
            <IconPackage size={20} color={getPrimaryColor()} />
            <Text fw={700}>{editingItem ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}</Text>
          </Group>
        }
        radius='lg'
        size='xl'
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap='md'>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label='กลุ่มสินค้า'
                  placeholder='เลือกกลุ่มสินค้า'
                  data={productGroupData}
                  required
                  searchable
                  clearable
                  {...form.getInputProps('product_group')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label='ร้านค้าที่ซื้อ'
                  placeholder='คู่ค้า/Supplier'
                  {...form.getInputProps('supplier_code')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label='รหัสสินค้า'
                  placeholder='กรอกรหัสสินค้า'
                  required
                  {...form.getInputProps('product_code')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <TextInput
                  label='ชื่อสินค้า/บริการ'
                  placeholder='กรอกชื่อสินค้า'
                  {...form.getInputProps('product_name')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='ราคาขาย'
                  placeholder='0.00'
                  min={0}
                  {...form.getInputProps('sale_price')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='ราคาซื้อ'
                  placeholder='0.00'
                  min={0}
                  {...form.getInputProps('purchase_price')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='หน้าผ้า'
                  placeholder='0.00'
                  min={0}
                  {...form.getInputProps('cloth_face')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label='หน่วยสินค้า'
                  placeholder='เลือกหน่วย'
                  data={unitData}
                  required
                  searchable
                  {...form.getInputProps('product_unit')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label='ประเภทราคา'
                  data={[
                    { value: 'SET', label: 'ราคาเป็นชุด/set' },
                    { value: 'UNIT', label: 'ราคาเป็นชิ้น/เมตร' },
                  ]}
                  {...form.getInputProps('type_price')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label='สถานะสต็อก'
                  data={[
                    { value: 'Y', label: 'เก็บ' },
                    { value: 'N', label: 'ไม่เก็บ' },
                  ]}
                  {...form.getInputProps('stock_status')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label='สถานะ'
                  data={[
                    { value: 'Y', label: 'ปกติ' },
                    { value: 'N', label: 'ซ่อน' },
                  ]}
                  {...form.getInputProps('product_status')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='ขั้นต่ำสินค้า'
                  min={0}
                  {...form.getInputProps('product_lower')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='Motor กว้างเริ่ม'
                  min={0}
                  {...form.getInputProps('width_start')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='ถึงความกว้าง'
                  min={0}
                  {...form.getInputProps('width_end')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label='รองรับ นน. (kg.)'
                  min={0}
                  {...form.getInputProps('item_kg')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label='ชนิด'
                  placeholder='เลือกชนิด'
                  data={[
                    { value: 'REMOTE', label: 'Remote Control' },
                    { value: 'WIRED', label: 'Wired Control' },
                  ]}
                  clearable
                  {...form.getInputProps('item_type')}
                />
              </Grid.Col>
            </Grid>

            <Group justify='flex-end' mt='md'>
              <Button variant='subtle' onClick={() => setModalOpen(false)} radius='xl'>
                ยกเลิก
              </Button>
              <Button
                type='submit'
                radius='xl'
                style={{ backgroundColor: getPrimaryColor(), color: '#fff' }}
              >
                บันทึกข้อมูล
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
