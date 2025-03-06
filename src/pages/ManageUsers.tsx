import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import GroupManagement from '@/components/GroupManagement'; // We'll create this component
import RoleManagement from '@/components/RoleManagement'; // You'll implement this later
import DepartmentManagement from '@/components/DepartmentManagement';
import ServiceManagement from '@/components/ServiceManagement';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import useUserRoles from '@/hooks/useUserRoles';

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const { isNodalOfficer, isAdmin, isUnitCGM, isHOD, isAddressal, isCommittee, isSuperAdmin } = useUserRoles();

  return (
    <Card className="mt-4 mx-4 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Manage Services</CardTitle>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex w-full justify-between items-center px-6 pt-4">
          <TabsList className="w-2/3">
            <TabsTrigger className="w-full" value="services">
              Manage Services
            </TabsTrigger>

            <TabsTrigger className="w-full" value="groups">
              Manage Groups
            </TabsTrigger>
            {user?.unitId === '396' && (
              <TabsTrigger className="w-full" value="departments">
                Manage Departments
              </TabsTrigger>
            )}
          </TabsList>

          {activeTab === 'groups' && isSuperAdmin && (
            <Button onClick={() => setCreateGroupOpen(true)}>
              <Plus /> Create Group
            </Button>
          )}

          {activeTab === 'services' && isSuperAdmin && (
            <Button onClick={() => setCreateServiceOpen(true)}>
              <Plus /> Create Service
            </Button>
          )}
        </div>

        <TabsContent value="groups">
          <GroupManagement createGroupOpen={createGroupOpen} setCreateGroupOpen={setCreateGroupOpen} />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>

        <TabsContent value="services">
          <ServiceManagement createServiceOpen={createServiceOpen} setCreateServiceOpen={setCreateServiceOpen} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ManageUsers;
