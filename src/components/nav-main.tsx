import { type LucideIcon } from 'lucide-react';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { NavLink } from 'react-router';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <NavLink to={item.url} onClick={() => setOpenMobile(false)}>
              {({ isActive }) => (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`transition-all duration-300 hover:bg-primary active:bg-primary [&>svg]:size-7 ease-in-out ${
                    isActive ? 'bg-primary text-primary hover:text-white h-full w-full' : ' hover:text-white  h-full'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary text-white hover:text-white h-full w-full'
                        : 'hover:bg-primary hover:text-white active:text-white  h-full'
                    }`}
                  >
                    {item.icon && <item.icon size={24} />}
                    <span className={isActive ? 'font-bold' : 'font-normal'}>{item.title}</span>
                  </div>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
