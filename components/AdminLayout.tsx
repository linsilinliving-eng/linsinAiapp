'use client';

import { 
  AppShell, 
  Burger, 
  Group, 
  Skeleton, 
  Text, 
  ScrollArea, 
  NavLink, 
  ActionIcon,
  useMantineColorScheme,
  Menu,
  ColorSwatch,
  CheckIcon,
  Tooltip,
  Box,
  Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { 
  IconLayoutDashboard, 
  IconSettings, 
  IconUsers, 
  IconPackage, 
  IconSun, 
  IconMoonStars,
  IconShoppingCart,
  IconChartBar,
  IconFileText,
  IconBell,
  IconLogout,
  IconInfoCircle,
  IconTools,
  IconClipboardList,
  IconWallet,
  IconTruck,
  IconHierarchy2,
  IconDatabase,
  IconCurrencyBitcoin,
  IconBuildingBank,
  IconEdit,
  IconPalette,
  IconCircleDot
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';

const THEME_COLORS = [
  { value: 'pink', label: 'ชมพู่', color: '#e292b6' },
  { value: 'blue', label: 'น้ำเงิน', color: '#228be6' },
  { value: 'red', label: 'แดง', color: '#fa5252' },
  { value: 'orange', label: 'ส้ม', color: '#fd7e14' },
  { value: 'green', label: 'เขียว', color: '#40c057' },
];

const navData = [
  { label: 'แดชบอร์ด', icon: IconLayoutDashboard, link: '/admin' },
  { label: 'ฐานข้อมูลลูกค้า', icon: IconUsers, link: '/customers' },
  { label: 'ฐานข้อมูลสินค้า', icon: IconPackage, link: '/products' },
  { label: 'ใบประมาณราคา BOQ', icon: IconClipboardList, link: '/admin/boq' },
  { label: 'กำหนดสูตร BOQ', icon: IconTools, link: '/admin/formula-settings' },
  { label: 'ฟอร์มสินค้า (8 หมวด)', icon: IconEdit, link: '/products/forms' },
  {
    label: 'ระบบประมาณราคา', 
    icon: IconInfoCircle, 
    links: [
      { label: 'ข้อมูล ใบประมาณราคา', link: '/admin/estimation/estimates' },
      { label: 'ข้อมูลใบเสนอราคา', link: '/admin/estimation/quotations' },
      { label: 'ข้อมูลใบงานช่าง', link: '/admin/estimation/technician-jobs' },
      { label: 'ตัวเลือก1. ทึบ, โปร่ง, Backout, ม่านม้วน, มู่ลี่ไม้', link: '/admin/estimation/options-1' },
      { label: 'ตัวเลือก2. จีบ, ลอน, ตาไก่,พับ,แป๊บ,Sunscreen,อื่นๆ', link: '/admin/estimation/options-2' },
      { label: 'ตัวเลือก3. รูปแบบการใช้งาน, ผ่ากลาง, ดึงซ้าย, ดึงขวา', link: '/admin/estimation/options-3' },
      { label: 'ตัวเลือก 4. มี(ไม่มี)กล่อง ดร็อปฝ้า', link: '/admin/estimation/options-4' },
      { label: 'กลุ่ม ม่าน/มู่ลี่/ราง', link: '/admin/estimation/groups' },
      { label: 'ข้อมูล เงื่อนไขการชำระเงิน', link: '/admin/estimation/payment-terms' },
    ] 
  },
  { 
    label: 'ระบบงานขาย', 
    icon: IconShoppingCart, 
    links: [
      { label: 'สรุปข้อมูลใบเสนอราคา', link: '/admin/sales/quotations' },
      { label: 'ข้อมูลใบวางบิล', link: '/admin/sales/billing' },
      { label: 'ข้อมูลใบวางบิล No Vat', link: '/admin/sales/billing-no-vat' },
      { label: 'ข้อมูลใบกำกับภาษี', link: '/admin/sales/tax-invoices' },
      { label: 'ข้อมูลใบเสร็จรับเงิน (Novat)', link: '/admin/sales/receipts-no-vat' },
      { label: 'ข้อมูลใบเสร็จรับเงิน', link: '/admin/sales/receipts' },
      { label: 'ข้อมูลใบสำคัญรับ', link: '/admin/sales/vouchers' },
      { label: 'ข้อมูลรายการหัก ณ ที่จ่าย', link: '/admin/sales/withholding-tax' },
      { label: 'สรุปข้อมูล Project', link: '/admin/sales/projects' },
      { label: 'ข้อมูลลูกค้า/ผู้ว่าจ้าง', link: '/admin/sales/customers' },
    ] 
  },
  {
    label: 'ข้อมูลพื้นฐาน-ปุ่ม-จัดซื้อ PO.',
    icon: IconHierarchy2,
    links: [
      { label: 'ปุ่ม 1.คำอธิบายมู่ลี่ไม้, มู่ลี่อลู อื่นๆ', link: '/admin/base-data/buttons-1' },
      { label: 'ปุ่ม 3.คำอธิบายราง, ผ้าม่าน', link: '/admin/base-data/buttons-3' },
    ]
  },
  {
    label: 'ระบบจัดซื้อจัดจ้าง',
    icon: IconTruck,
    links: [
      { label: 'ข้อมูล ใบสั่งซื้อสินค้า', link: '/admin/purchase/orders' },
      { label: 'ข้อมูล ใบสำคัญจ่าย', link: '/admin/purchase/vouchers' },
      { label: 'รายงานค่าแรงช่าง', link: '/admin/purchase/labor-reports' },
      { label: 'ข้อมูล หัก ณ ที่จ่าย', link: '/admin/purchase/withholding-tax' },
      { label: 'ข้อมูลผู้ขาย/ผู้รับเหมา', link: '/admin/purchase/suppliers' },
    ]
  },
  {
    label: 'ระบบคลังสินค้า',
    icon: IconDatabase,
    links: [
      { label: 'ข้อมูล Stock สินค้า', link: '/admin/inventory/stock' },
      { label: 'รายการสินค้าเคลื่อนไหว', link: '/admin/inventory/movements' },
      { label: 'รายการ Store', link: '/admin/inventory/store' },
    ]
  },
  {
    label: 'ระบบลดหนี้',
    icon: IconFileText,
    links: [
      { label: 'ข้อมูล ใบลดหนี้ / ลูกค้า', link: '/admin/credit-note/customers' },
      { label: 'ข้อมูลใบลดหนี้ / จากคู่ค้า', link: '/admin/credit-note/suppliers' },
    ]
  },
  {
    label: 'ระบบข้อมูลพื้นฐาน',
    icon: IconEdit,
    links: [
      { label: 'ข้อมูล Master ใบงานช่างเย็บผ้า', link: '/admin/master/masterworksheet' },
      { label: 'สถานที่จัดส่ง / DELIVERY TO', link: '/admin/master/deliveryto' },
      { label: 'ข้อมูลสินค้า', link: '/admin/master/products' },
      { label: 'ข้อมูลกลุ่มสินค้า', link: '/admin/master/product-groups' },
      { label: 'ข้อมูลกลุ่มหลัก', link: '/admin/master/main-groups' },
      { label: 'หน่วยสินค้า', link: '/admin/product-units' },
      { label: 'ข้อมูลขนาดห่วง/ตะขอ', link: '/admin/master/hook-sizes' },
      { label: 'ประเภทคู่ค้า', link: '/admin/master/partner-types' },
      { label: 'ประเภทการจ่าย', link: '/admin/master/creditterm' },
      { label: 'รายชื่อธนาคาร', link: '/admin/master/banks' },
      { label: 'ภาษีหัก ณ ที่จ่าย', link: '/admin/master/withholding-tax' },
      { label: 'ข้อมูลบริษัท', link: '/admin/master/company-info' },
      { label: 'ตั้งค่าการพิมพ์เอกสาร', link: '/admin/master/print-settings' },
    ]
  },
  { label: 'ผู้ใช้งาน', icon: IconUsers, link: '/admin/users' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data: session, update } = useSession();

  const currentTheme = (session?.user as any)?.theme_color || 'blue';

  const handleNavClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    router.push(link);
    if (opened) {
      close();
    }
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  useEffect(() => {
    if (!desktopOpened) {
      setOpenMenus({});
    } else {
      // เมื่อกางออก ให้กางเฉพาะอันที่ active อยู่เพียงครั้งเดียวตอนโหลดหน้า
      const activeMenu = navData.find(item => item.links?.some(l => pathname === l.link));
      if (activeMenu) {
        setOpenMenus(prev => {
          // ถ้ามีเมนูเปิดอยู่แล้ว (จากการคลิก) ไม่ต้องไปทับค่าเดิม
          if (Object.keys(prev).length > 0) return prev;
          return { [activeMenu.label]: true };
        });
      }
    }
  }, [desktopOpened]); // เอา pathname ออกจาก dependency เพื่อไม่ให้ reset ทุกครั้งที่เปลี่ยนหน้าหรือ reload/re-render

  const changeTheme = async (color: string) => {
    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_color: color }),
      });

      if (response.ok) {
        await update({ theme_color: color });
        notifications.show({
          title: 'สำเร็จ',
          message: 'เปลี่ยนธีมเรียบร้อยแล้ว',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถเปลี่ยนธีมได้',
        color: 'red',
      });
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: desktopOpened ? 300 : 80,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ActionIcon 
              variant="subtle" 
              onClick={toggleDesktop} 
              visibleFrom="sm" 
              size="lg"
              color="gray"
            >
              <IconLayoutDashboard size="1.4rem" stroke={1.5} />
            </ActionIcon>
            <Text 
              size="lg" 
              fw={800} 
              variant="gradient" 
              gradient={{ from: currentTheme, to: 'cyan', deg: 90 }}
              style={{ letterSpacing: '-0.5px' }}
            >
              บริษัท ลินศิลิน ลิฟวิ่ง จำกัด
            </Text>
          </Group>

          <Group gap="sm">
            <Menu shadow="xl" width={220} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
              <Menu.Target>
                <ActionIcon 
                  variant="light" 
                  size="lg" 
                  radius="md" 
                  title="เลือกสีธีม"
                  color={currentTheme}
                >
                  <IconPalette size="1.4rem" stroke={1.5} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown p="xs">
                <Menu.Label mb={5}>PERSONALIZED THEME</Menu.Label>
                <Group gap={8} p={5}>
                  {THEME_COLORS.map((tc) => (
                    <Tooltip label={tc.label} key={tc.value}>
                      <ColorSwatch 
                        color={tc.color} 
                        size={28} 
                        component="button"
                        onClick={() => changeTheme(tc.value)}
                        style={{ cursor: 'pointer', border: currentTheme === tc.value ? '2px solid #000' : 'none' }}
                      >
                        {currentTheme === tc.value && <CheckIcon style={{ width: 12, height: 12, color: '#fff' }} />}
                      </ColorSwatch>
                    </Tooltip>
                  ))}
                </Group>
              </Menu.Dropdown>
            </Menu>

            <ActionIcon 
              variant="subtle" 
              onClick={() => toggleColorScheme()} 
              title="Toggle color scheme"
              size="lg"
              radius="md"
              color="gray"
            >
              {colorScheme === 'dark' ? <IconSun size="1.4rem" stroke={1.5} /> : <IconMoonStars size="1.4rem" stroke={1.5} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar 
        p="xs" 
        className="lux-navbar-collapse"
      >
        <AppShell.Section grow component={ScrollArea} scrollbars="y" px="xs">
          <style jsx global>{`
            .lux-navbar-collapse {
              width: 80px;
              transition: width 300ms ease;
              background: var(--mantine-color-body);
              z-index: 100;
              border-right: 1px solid var(--mantine-color-default-border);
            }

            .lux-navbar-collapse:hover {
              width: 300px !important;
              box-shadow: var(--mantine-shadow-xl);
            }

            .lux-navbar-collapse:hover .mantine-NavLink-children {
              display: block !important;
            }

            /* แก้ไขพื้นที่ให้ Content ขยายเต็มหน้าจอ */
            .mantine-AppShell-main {
              /* บังคับล้างค่า padding ที่ Mantine กั้นไว้ 300px */
              padding-left: 80px !important; 
              transition: padding-left 300ms ease;
              max-width: 100vw;
            }

            /* ปรับ Container ภายในให้ใช้พื้นที่เต็ม 100% */
            .mantine-AppShell-main > .mantine-Container-root {
              max-width: 100% !important;
              width: 100% !important;
              padding-left: 16px;
              padding-right: 16px;
            }

            .lux-navbar-collapse .mantine-NavLink-label {
              white-space: nowrap;
              overflow: hidden;
            }

            .hover-only-label {
              display: none;
            }

            .lux-navbar-collapse:hover .hover-only-label {
              display: block !important;
            }

            .lux-navbar-collapse:has(.mantine-NavLink-children:hover) {
               width: 300px !important;
            }
          `}</style>
          {navData.map((item) => {
            const isOpened = !!openMenus[item.label];
            const hasActiveChild = item.links?.some(l => pathname === l.link);
            
            return (
              <NavLink
                key={item.label}
                component="div"
                label={(desktopOpened || opened) ? item.label : <div className="hover-only-label">{item.label}</div>}
                leftSection={<item.icon size="1.2rem" stroke={1.5} />}
                active={item.link ? pathname === item.link : hasActiveChild}
                opened={desktopOpened ? isOpened : false}
                onClick={(e) => {
                  if (item.links) {
                    e.preventDefault();
                    if (!desktopOpened) {
                      toggleDesktop();
                      // สั่งให้เมนูที่กดขยายทันทีหลังจากกาง Sidebar
                      setOpenMenus({ [item.label]: true });
                    } else {
                      toggleMenu(item.label);
                    }
                  } else if (item.link) {
                    handleNavClick(e, item.link);
                  }
                }}
                variant="filled"
                color={currentTheme}
                styles={{
                  root: {
                    borderRadius: '12px',
                    marginBottom: '4px',
                    fontWeight: 500,
                    minHeight: '42px',
                    cursor: 'pointer'
                  },
                  children: {
                    paddingLeft: '24px',
                    display: desktopOpened ? undefined : 'none'
                  }
                }}
              >
                {item.links?.map((subItem) => (
                  <NavLink
                    key={subItem.label}
                    component="div"
                    label={subItem.label}
                    active={pathname === subItem.link}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavClick(e, subItem.link);
                    }}
                    variant="subtle"
                    color={currentTheme}
                    styles={{
                      root: {
                        borderRadius: '8px',
                        marginBottom: '2px',
                        minHeight: '38px',
                        cursor: 'pointer'
                      }
                    }}
                  />
                ))}
              </NavLink>
            );
          })}
        </AppShell.Section>
        
        <AppShell.Section p="xs">
          <Paper p="sm" radius="xl" withBorder style={{ 
            background: 'rgba(255,255,255,0.5)', 
            backdropFilter: 'blur(5px)',
            borderStyle: 'dashed' 
          }}>
            <NavLink
              label={desktopOpened ? "ออกจากระบบ" : null}
              leftSection={<IconLogout size="1.2rem" stroke={1.5} />}
              color="red"
              variant="subtle"
              onClick={() => signOut({ callbackUrl: '/login' })}
              styles={{ root: { borderRadius: '10px' } }}
            />
          </Paper>
          <Text size="10px" c="dimmed" ta="center" mt="sm" style={{ letterSpacing: '2px' }}>LINSIRIN CMS v2.0</Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
