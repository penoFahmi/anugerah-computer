import { Link } from '@inertiajs/react';
import { 
    Activity, 
    CircleDollarSign, 
    LayoutDashboard, 
    MessageCircle, 
    Package, 
    ShoppingCart, 
    Users, 
    UserRoundCog, 
    Wrench
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
    },
    {
        title: 'Antrean Servis',
        href: '/services',
        icon: Wrench,
        items: [
            { title: 'Servis & cek ', href: '/services' },
            { title: 'Status', href: '/services/history' },
            { title: 'Klaim & Garansi Servis', href: '/services/warranty' },
        ],
    },
    {
        title: 'Penjualan',
        href: '#',
        icon: ShoppingCart,
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
    },
    {
        title: 'Keuangan',
        href: '#',
        icon: CircleDollarSign,
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
    },
    {
        title: 'WhatsApp Gateway',
        href: '/config/wa',
        icon: MessageCircle,
    },
    {
        title: 'Log & Webhook',
        href: '#',
        icon: Activity,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
