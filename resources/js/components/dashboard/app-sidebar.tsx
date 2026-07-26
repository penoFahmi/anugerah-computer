import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    CircleDollarSign,
    LayoutDashboard,
    MessageCircle,
    Package,
    ShoppingCart,
    Users,
    UserRoundCog,
    Wrench,
    Store,
    Trash2,
    MessageSquare,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/dashboard/nav-footer';
import { NavMain } from '@/components/dashboard/nav-main';
import { NavUser } from '@/components/dashboard/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['administrator', 'teknisi', 'pegawai'],
    },
    {
        title: 'Transaksi',
        href: '#',
        icon: ShoppingCart,
        roles: ['administrator', 'pegawai'],
        items: [
            { title: 'Kasir (POS)', href: '/sales/pos' },
            { title: 'Pembelian Bekas', href: '/sales/trade-in' },
            { title: 'Pesanan Daring', href: '/sales/online' },
        ],
    },
    {
        title: 'Layanan Servis',
        href: '/services',
        icon: Wrench,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Daftar Antrean', href: '/services' },
            { title: 'Kanban Board', href: '/kanban' },
            { title: 'Klaim Garansi', href: '/garansi' },
        ],
    },
    {
        title: 'Stok & Inventaris',
        href: '#',
        icon: Package,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Katalog Produk', href: '/inventory/products', roles: ['administrator', 'teknisi', 'pegawai'] },
            { title: 'Data Sparepart', href: '/inventory/spareparts', roles: ['administrator', 'teknisi', 'pegawai'] },
            { title: 'Pengadaan Barang', href: '/inventory/procurement', roles: ['administrator'] },
        ],
    },
    {
        title: 'Pelanggan',
        href: '/customers',
        icon: Users,
        roles: ['administrator', 'pegawai'],
    },
    {
        title: 'Keuangan',
        href: '#',
        icon: CircleDollarSign,
        roles: ['administrator'],
        items: [
            { title: 'Arus Kas Harian', href: '/finance/cashflow' },
            { title: 'Laporan Laba Rugi', href: '/finance/profit-loss' },
        ],
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'SDM & Pengguna',
        href: '/pegawai',
        icon: UserRoundCog,
        roles: ['administrator'],
    },
    {
        title: 'Integrasi WhatsApp',
        href: '/config/wa',
        icon: MessageCircle,
        roles: ['administrator'],
    },
    {
        title: 'Pengaturan Toko',
        href: '/settings/store',
        icon: Store,
        roles: ['administrator'],
    },
    {
        title: 'Testimoni',
        href: '/testimonials',
        icon: MessageSquare,
        roles: ['administrator'],
    },
    {
        title: 'Log Sistem',
        href: '/settings/logs',
        icon: Activity,
        roles: ['administrator'],
    },
    {
        title: 'Arsip Data',
        href: '/sampah',
        icon: Trash2,
        roles: ['administrator'],
    },
];

export function AppSidebar() {
    // Ambil data auth dari props yang disediakan oleh Inertia
    const { auth } = usePage().props as any;
    const userRoles = auth.user?.roles || [];

    // Fungsi untuk memeriksa apakah user memiliki salah satu role yang diizinkan
    const hasRole = (allowedRoles?: string[]) => {
        if (!allowedRoles) {
            return true; // Jika tidak ada batasan role, tampilkan
        }

        return allowedRoles.some((role) => userRoles.includes(role));
    };

    // Filter menu berdasarkan role user
    const filteredMainNav = mainNavItems
        .filter((item) => hasRole(item.roles))
        .map((item) => ({
            ...item,
            // Jika ada sub-menu, filter juga sub-menunya
            items: item.items
                ? item.items.filter((sub) => hasRole(sub.roles))
                : undefined,
        }));

    const filteredAdminNav = adminNavItems
        .filter((item) => hasRole(item.roles))
        .map((item) => ({
            ...item,
            items: item.items
                ? item.items.filter((sub) => hasRole(sub.roles))
                : undefined,
        }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainNav} />
            </SidebarContent>

            <SidebarFooter>
                {filteredAdminNav.length > 0 && (
                    <NavFooter items={filteredAdminNav} className="mt-auto" />
                )}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
