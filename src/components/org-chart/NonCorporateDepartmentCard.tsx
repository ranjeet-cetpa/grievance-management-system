import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, User, Users } from 'lucide-react';
import { UserDetails } from '@/types/orgChart';

interface NonCorporateDepartmentCardProps {
  departmentName: string;
  mappedUsers: UserDetails[];
  onEdit: () => void;
  onAdd: () => void;
}

const NonCorporateDepartmentCard: React.FC<NonCorporateDepartmentCardProps> = ({
  departmentName,
  mappedUsers,
  onEdit,
  onAdd,
}) => {
  const capitalize = (text: string) => {
    return text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-1 items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{departmentName}</h3>

        {mappedUsers.length > 0 ? (
          <Button variant="ghost" size="sm" className="p-1" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="p-1" onClick={onAdd}>
            <Users className="w-4 h-4" />+
          </Button>
        )}
      </div>
      {departmentName === 'IT' && (
        <p className="mb-2">( IT related grievances will be handled by Corporate Office only )</p>
      )}
      <div>
        <h4 className="font-medium bg-blue-100 text-center mb-3 text-blue-600">Complaint Handlers</h4>
        {mappedUsers.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {mappedUsers.map((user, idx) => (
              <li key={idx} className="text-sm font-medium">
                {capitalize(user.userDetail)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 text-sm p-4 border rounded-md bg-gray-50">
            No users assigned to this department
          </div>
        )}
      </div>
    </div>
  );
};

export default NonCorporateDepartmentCard;
