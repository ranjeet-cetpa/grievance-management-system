import * as React from 'react';
import {
  Activity,
  LayoutGrid,
  View,
  Kanban,
  Hourglass,
  Users,
  LogOut,
  BadgeAlert,
  Hotel,
  UserRoundCog,
  UserRoundPen,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { environment } from '@/config';
import { setEmployeesData } from '@/features/employee/employeeSlice';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionItem, removeSessionItem } from '@/lib/helperFunction';
import { setUnits } from '@/features/unit/unitSlice';
import { logo } from '@/assets/image/images';
import { Button } from './ui/button';
import { resetUser } from '@/features/user/userSlice';
import { Separator } from '@radix-ui/react-separator';
import { useNavigate } from 'react-router';
import { RootState } from '@/app/store';
import useUserRoles from '@/hooks/useUserRoles';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isHOD, isAddressal, isCommittee } = useUserRoles();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { isNodalOfficer, isSuperAdmin, isAdmin, isUnitCGM } = useUserRoles();
  const hasAccess = isNodalOfficer || isSuperAdmin || isAdmin || isUnitCGM;
  const canViewRedressalGrievances =
    isNodalOfficer || isSuperAdmin || isAdmin || isUnitCGM || isHOD || isAddressal || isCommittee;

  const navMainItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutGrid,
    },
    {
      title: 'My Grievances',
      url: '/grievances',
      icon: BadgeAlert,
    },
    canViewRedressalGrievances && {
      title: 'Redress Grievances',
      url: '/redressal-grievances',
      icon: UserRoundPen,
    },
  ].filter(Boolean);

  const dispatch = useDispatch();
  const isAuthenticated = getSessionItem('token');
  const fetchData = async () => {
    try {
      const response = await fetch(`${environment.orgHierarchy}/Organization/GetOrganizationHierarchy`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      const result = data.data;
      dispatch(setEmployeesData(result));

      const units = result.map((employee: any) => ({
        unitName: employee.unitName,
        unitId: employee.unitId,
      }));

      const toSentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      const uniqueUnits = Object.values(
        units.reduce((acc, curr) => {
          const unitId = curr.unitId;
          if (!acc[unitId]) {
            acc[unitId] = { ...curr, unitName: toSentenceCase(curr.unitName) };
          }
          return acc;
        }, {} as Record<number, { unitName: string; unitId: number }>)
      );
      dispatch(setUnits(uniqueUnits));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);
  const handleLogout = () => {
    removeSessionItem('token');
    dispatch(resetUser());
    window.location.href = environment.logoutUrl;
  };
  return (
    <Sidebar collapsible="icon" {...props} className="">
      <SidebarHeader className="flex flex-row justify-between items-center py-4 px-4">
        <img
          src={logo}
          className={`transition-all object-contain ${state === 'collapsed' ? 'w-14 h-10' : 'w-full h-12'}`}
        />
      </SidebarHeader>
      <SidebarContent className="flex justify-between">
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {hasAccess && (
            <SidebarMenuButton
              onClick={() => navigate('/admin-dashboard')}
              asChild
              tooltip={'Manage Organization'}
              className={`transition-all text-black cursor-pointer duration-300  active:bg-primary [&>svg]:size-7 ease-in-out hover:bg-primary hover:text-white h-full w-full active:text-white`}
            >
              <div className={`flex items-center gap-2`}>
                <Hotel size={24} />
                <span>Manage Organization</span>
              </div>
            </SidebarMenuButton>
          )}
          <Separator />

          <SidebarMenuButton
            onClick={handleLogout}
            asChild
            tooltip={'Exit'}
            className={`transition-all cursor-pointer duration-300  active:bg-primary [&>svg]:size-7 ease-in-out hover:bg-primary hover:text-white h-full w-full`}
          >
            <div className={`flex items-center gap-2`}>
              <LogOut size={24} />
              <span>Exit</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
