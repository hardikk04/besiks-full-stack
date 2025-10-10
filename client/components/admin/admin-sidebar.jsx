"use client";
import {
  IconDashboard,
  IconShoppingCart,
  IconPackage,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconTags,
  IconTruck,
  IconCreditCard,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { AdminNavMain } from "@/components/admin/admin-nav-main";
import { AdminNavSecondary } from "@/components/admin/admin-nav-secondary";
import { AdminNavUser } from "@/components/admin/admin-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useGetMeQuery } from "@/features/customer/customerApi";

const adminData = {
  user: {
    name: "Admin User",
    email: "admin@store.com",
    // avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconPackage,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconTags,
    },
    {
      title: "Discount",
      url: "/admin/discount",
      icon: IconTags,
    },
  ],

  quickActions: [
    {
      name: "Shipping",
      url: "/admin/shipping",
      icon: IconTruck,
    },
    {
      name: "Payments",
      url: "/admin/payments",
      icon: IconCreditCard,
    },
  ],
};

export function AdminSidebar({ ...props }) {
  const { data: userData, isLoading: isUserDataLoading } = useGetMeQuery();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Besiks Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={adminData.navMain} />
        <AdminNavSecondary
          items={adminData.quickActions}
          title="Quick Actions"
        />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
