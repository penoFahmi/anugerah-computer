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
    Trash2,
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
        roles: ['administrator', 'teknisi', 'pegawai'],
    },
    {
        title: 'Antrean Servis',
        href: '/services',
        icon: Wrench,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Servis & cek ', href: '/services' },
            { title: 'Status', href: '/history' },
            { title: 'Klaim & Garansi Servis', href: '/garansi' },
        ],
    },
    {
        title: 'Penjualan',
        href: '#',
        icon: ShoppingCart,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Kasir (POS)', href: '/sales/pos' },
            { title: 'Pembelian Bekas', href: '/sales/trade-in' },
            { title: 'Pesanan Daring', href: '/sales/online' },
        ],
    },
    {
        title: 'Inventaris & Gudang',
        href: '#',
        icon: Package,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Katalog Produk', href: '/inventory/products' },
            { title: 'Stok Sparepart', href: '/inventory/spareparts' },
            { title: 'Pengadaan Barang', href: '/inventory/procurement' },
        ],
    },
    {
        title: 'Manajemen Pelanggan',
        href: '/customers',
        icon: Users,
        roles: ['administrator', 'teknisi', 'pegawai'],
    },
    {
        title: 'Keuangan',
        href: '#',
        icon: CircleDollarSign,
        roles: ['administrator', 'teknisi', 'pegawai'],
        items: [
            { title: 'Arus Kas Harian', href: '/finance/cashflow' },
            { title: 'Laporan Laba Rugi', href: '/finance/income-statement' },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Pegawai',
        href: '/pegawai',
        icon: UserRoundCog,
        roles: ['administrator'],
    },
    {
        title: 'WhatsApp Gateway',
        href: '/config/wa',
        icon: MessageCircle,
        roles: ['administrator'],
    },
    {
        title: 'Log & Webhook',
        href: '#',
        icon: Activity,
        roles: ['administrator', 'pegawai'],
    },
    {
        title: 'Sampah & Arsip',
        href: '/sampah',
        icon: Trash2,
        roles: ['administrator', 'teknisi'],
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

    const filteredFooterNav = footerNavItems.filter((item) =>
        hasRole(item.roles),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
                <NavFooter items={filteredFooterNav} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
