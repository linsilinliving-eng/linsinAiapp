'use client';

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Text,
  Title,
  Button,
  TextInput,
  Textarea,
  Group,
  Stack,
  Divider,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Box,
  SimpleGrid,
  Table,
  ActionIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconBuilding, IconChevronRight, IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { useCompanyStore } from "@/store/companyStore";

interface BankRow {
  uuid: string;
  code: string;
  name: string;
  branch: string;
  bookno: string;
}

export default function CompanyInfoPage() {
  const { data: session } = useSession();
  const { company, isLoading, isSaving, fetchCompany, saveCompany } = useCompanyStore();

  const themeColor = (session?.user as any)?.theme_color || "blue";

  const [banks, setBanks] = useState<BankRow[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const fetchBanks = async () => {
    setBanksLoading(true);
    try {
      const res = await fetch("/api/companybank");
      const data = await res.json();
      setBanks(data);
    } finally {
      setBanksLoading(false);
    }
  };

  const handleBankChange = (uuid: string, field: keyof BankRow, value: string) => {
    setBanks(prev => prev.map(b => b.uuid === uuid ? { ...b, [field]: value } : b));
  };

  const handleBankSave = async (row: BankRow) => {
    await fetch(`/api/companybank/${row.uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, updated_by: session?.user?.name || "system" }),
    });
  };

  const handleBankAdd = async () => {
    const res = await fetch("/api/companybank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "", name: "", branch: "", bookno: "", created_by: session?.user?.name || "system" }),
    });
    if (res.ok) {
      const newRow = await res.json();
      setBanks(prev => [...prev, newRow]);
    }
  };

  const handleBankDelete = (uuid: string) => {
    modals.openConfirmModal({
      title: "ยืนยันการลบ",
      children: <Text size="sm">ต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?</Text>,
      labels: { confirm: "ลบ", cancel: "ยกเลิก" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        await fetch(`/api/companybank/${uuid}`, { method: "DELETE" });
        setBanks(prev => prev.filter(b => b.uuid !== uuid));
        notifications.show({ title: "สำเร็จ", message: "ลบบัญชีธนาคารแล้ว", color: "green" });
      },
    });
  };

  const [form, setForm] = useState({
    uuid: "",
    company_name: "",
    company_taxid: "",
    branch_name: "",
    branch_no: "",
    company_address1: "",
    company_sing: "",
    company_tel: "",
    company_email: "",
    company_fax: "",
    purchase_tel: "",
    purchase_email: "",
    purchase_address: "",
    purchase_confirm: "",
  });

  useEffect(() => {
    fetchCompany();
    fetchBanks();
  }, [fetchCompany]);

  useEffect(() => {
    if (company) {
      setForm({
        uuid: company.uuid || "",
        company_name: company.company_name || "",
        company_taxid: company.company_taxid || "",
        branch_name: company.branch_name || "",
        branch_no: company.branch_no || "",
        company_address1: company.company_address1 || "",
        company_sing: company.company_sing || "",
        company_tel: company.company_tel || "",
        company_email: company.company_email || "",
        company_fax: company.company_fax || "",
        purchase_tel: company.purchase_tel || "",
        purchase_email: company.purchase_email || "",
        purchase_address: company.purchase_address || "",
        purchase_confirm: company.purchase_confirm || "",
      });
    }
  }, [company]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const ok = await saveCompany({
      ...form,
      updated_by: session?.user?.name || "system",
    });

    if (ok) {
      notifications.show({
        title: "สำเร็จ",
        message: "บันทึกข้อมูลบริษัทเรียบร้อยแล้ว",
        color: "green",
      });
    } else {
      notifications.show({
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถบันทึกข้อมูลได้",
        color: "red",
      });
    }
  };

  const breadcrumbs = [
    { title: "หน้าหลัก", href: "/admin" },
    { title: "ระบบข้อมูลพื้นฐาน", href: "#" },
    { title: "ข้อมูลบริษัท", href: "/admin/master/company-info" },
  ];

  return (
    <Container size="xl" py="md">
      <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md">
        {breadcrumbs.map((item, i) =>
          i < breadcrumbs.length - 1 ? (
            <Anchor href={item.href} size="sm" key={i} c={themeColor}>
              {item.title}
            </Anchor>
          ) : (
            <Text size="sm" key={i} c="dimmed">
              {item.title}
            </Text>
          )
        )}
      </Breadcrumbs>

      <Paper shadow="sm" radius="lg" p="xl" withBorder>
        <Box
          mb="xl"
          p="md"
          style={{
            background: `var(--mantine-color-${themeColor}-6)`,
            borderRadius: "12px",
          }}
        >
          <Group>
            <Box
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconBuilding size="1.5rem" color="#fff" stroke={1.5} />
            </Box>
            <div>
              <Title order={3} c="white">ข้อมูลบริษัท</Title>
              <Text size="sm" c="rgba(255,255,255,0.75)">
                จัดการข้อมูลบริษัท และข้อมูลสำหรับเอกสาร
              </Text>
            </div>
          </Group>
        </Box>

        {isLoading ? (
          <Stack>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={40} radius="md" />
            ))}
          </Stack>
        ) : (
          <Stack gap="sm">
            {/* ข้อมูลหลัก */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
              <TextInput
                size="sm"
                label="ชื่อบริษัท *"
                placeholder="ชื่อบริษัท"
                value={form.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
              <TextInput
                size="sm"
                label="รหัสผู้เสียภาษี"
                placeholder="รหัสผู้เสียภาษี"
                value={form.company_taxid}
                onChange={(e) => handleChange("company_taxid", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
              <TextInput
                size="sm"
                label="ชื่อสาขา"
                placeholder="ชื่อสาขา"
                value={form.branch_name}
                onChange={(e) => handleChange("branch_name", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
            </SimpleGrid>

            <TextInput
              size="sm"
              label="ที่อยู่"
              placeholder="ที่อยู่"
              value={form.company_address1}
              onChange={(e) => handleChange("company_address1", e.target.value)}
              styles={{ input: { borderRadius: "8px" } }}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                size="sm"
                label="ผู้มีอำนาจลงนาม"
                placeholder="ผู้มีอำนาจลงนาม"
                value={form.company_sing}
                onChange={(e) => handleChange("company_sing", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
              <TextInput
                size="sm"
                label="เบอร์โทร"
                placeholder="เบอร์โทร"
                value={form.company_tel}
                onChange={(e) => handleChange("company_tel", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
              <TextInput
                size="sm"
                label="E-mail"
                placeholder="E-mail"
                value={form.company_email}
                onChange={(e) => handleChange("company_email", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
              <TextInput
                size="sm"
                label="Fax"
                placeholder="Fax"
                value={form.company_fax}
                onChange={(e) => handleChange("company_fax", e.target.value)}
                styles={{ input: { borderRadius: "8px" } }}
              />
            </SimpleGrid>

            <Divider
              label={
                <Text fw={600} size="sm">
                  ข้อมูลรายงานใบสั่งซื้อ
                </Text>
              }
              labelPosition="left"
              my="xs"
            />

            <TextInput
              size="sm"
              label="เบอร์โทรใบสั่งซื้อ"
              placeholder="เบอร์โทรใบสั่งซื้อ"
              value={form.purchase_tel}
              onChange={(e) => handleChange("purchase_tel", e.target.value)}
              styles={{ input: { borderRadius: "8px" } }}
            />
            <Textarea
              size="sm"
              label="E-mail ใบสั่งซื้อ"
              placeholder="E-mail ใบสั่งซื้อ"
              value={form.purchase_email}
              onChange={(e) => handleChange("purchase_email", e.target.value)}
              autosize
              minRows={2}
              styles={{ input: { borderRadius: "8px" } }}
            />
            <TextInput
              size="sm"
              label="ที่อยู่ใบสั่งซื้อ"
              placeholder="ที่อยู่ใบสั่งซื้อ"
              value={form.purchase_address}
              onChange={(e) => handleChange("purchase_address", e.target.value)}
              styles={{ input: { borderRadius: "8px" } }}
            />
            <TextInput
              size="sm"
              label="ยืนยันใบสั่งซื้อ"
              placeholder="ยืนยันใบสั่งซื้อ"
              value={form.purchase_confirm}
              onChange={(e) => handleChange("purchase_confirm", e.target.value)}
              styles={{ input: { borderRadius: "8px" } }}
            />

            <Group mt="md">
              <Button
                leftSection={<IconDeviceFloppy size="1rem" stroke={1.5} />}
                color={themeColor}
                radius="md"
                loading={isSaving}
                onClick={handleSubmit}
              >
                บันทึกข้อมูล
              </Button>
            </Group>

            {company?.updated_at && (
              <Text size="xs" c="dimmed" mt="xs">
                อัปเดตล่าสุด: {company.updated_at} โดย {company.updated_by}
              </Text>
            )}

            <Divider my="md" />

            {/* ตารางบัญชีธนาคาร */}
            <Group justify="space-between" mb="sm">
              <Text fw={600} size="sm">บัญชีธนาคารของบริษัท</Text>
              <Button
                leftSection={<IconPlus size="0.9rem" />}
                size="xs"
                radius="md"
                color={themeColor}
                onClick={handleBankAdd}
              >
                เพิ่มบัญชี
              </Button>
            </Group>

            {banksLoading ? (
              <Skeleton height={120} radius="md" />
            ) : (
              <Table withTableBorder withColumnBorders striped highlightOnHover styles={{ th: { whiteSpace: 'nowrap' } }}>
                <Table.Thead style={{ background: `var(--mantine-color-${themeColor}-6)` }}>
                  <Table.Tr>
                    <Table.Th style={{ width: 50, color: '#fff' }}>#</Table.Th>
                    <Table.Th style={{ width: 140, color: '#fff' }}>ชื่อย่อ</Table.Th>
                    <Table.Th style={{ color: '#fff' }}>ชื่อธนาคาร</Table.Th>
                    <Table.Th style={{ color: '#fff' }}>สาขา</Table.Th>
                    <Table.Th style={{ color: '#fff' }}>เลขบัญชีธนาคาร</Table.Th>
                    <Table.Th style={{ width: 60 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {banks.map((row, index) => (
                    <Table.Tr key={row.uuid}>
                      <Table.Td ta="center">{index + 1}</Table.Td>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={row.code}
                          onChange={(e) => handleBankChange(row.uuid, "code", e.target.value)}
                          onBlur={() => handleBankSave(row)}
                          styles={{ input: { borderRadius: '6px' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={row.name}
                          onChange={(e) => handleBankChange(row.uuid, "name", e.target.value)}
                          onBlur={() => handleBankSave(row)}
                          styles={{ input: { borderRadius: '6px' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={row.branch}
                          onChange={(e) => handleBankChange(row.uuid, "branch", e.target.value)}
                          onBlur={() => handleBankSave(row)}
                          styles={{ input: { borderRadius: '6px' } }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <TextInput
                          size="xs"
                          value={row.bookno}
                          onChange={(e) => handleBankChange(row.uuid, "bookno", e.target.value)}
                          onBlur={() => handleBankSave(row)}
                          styles={{ input: { borderRadius: '6px' } }}
                        />
                      </Table.Td>
                      <Table.Td ta="center">
                        <ActionIcon
                          color="red"
                          variant="filled"
                          size="sm"
                          radius="md"
                          onClick={() => handleBankDelete(row.uuid)}
                        >
                          <IconTrash size="0.9rem" />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
