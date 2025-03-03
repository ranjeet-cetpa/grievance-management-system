import RoleManagement from '@/components/RoleManagement';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

const ManageRoles = () => {
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Manage Roles</CardTitle>
            </div>
            <Button
              onClick={() => {
                setCreateRoleOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Role
            </Button>
          </div>
        </CardHeader>

        <div className="p-4">
          <RoleManagement createRoleOpen={createRoleOpen} setCreateRoleOpen={setCreateRoleOpen} />
        </div>
      </Card>
    </div>
  );
};

export default ManageRoles;
