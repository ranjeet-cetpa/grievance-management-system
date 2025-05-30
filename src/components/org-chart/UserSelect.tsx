import React from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';

interface Employee {
  empId: number;
  empCode: string;
  empName: string | null;
  department: string;
  designation: string;
  unitName: string;
  unitId: number;
}

interface UserSelectProps {
  employees: Employee[];
  value: { userCode: string; userDetail: string }[];
  onChange: (value: { userCode: string; userDetail: string }[]) => void;
  isMulti?: boolean;
  label?: string;
}

const UserSelect: React.FC<UserSelectProps> = ({ employees, value, onChange, isMulti = false, label }) => {
  const options = employees?.map((emp) => ({
    value: emp.empCode,
    label: `${emp.empCode}- ${emp.empName || 'NA'} `,
  }));

  const handleChange = (selectedOptions: any) => {
    if (isMulti) {
      const selectedUsers = selectedOptions.map((option: any) => ({
        userCode: option.value,
        userDetail: option.label.split(' (')[0],
      }));
      onChange(selectedUsers);
    } else {
      onChange([
        {
          userCode: selectedOptions.value,
          userDetail: selectedOptions.label.split(' (')[0],
        },
      ]);
    }
  };

  const currentValue = value.map((v) => ({
    value: v.userCode,
    label: `${v.userDetail} (${employees?.find((e) => e.empCode === v.userCode)?.department || ''})`,
  }));

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <Select
        options={options}
        value={isMulti ? currentValue : currentValue[0]}
        onChange={handleChange}
        isMulti={isMulti}
        placeholder="Select employee(s)..."
        className="basic-multi-select"
        classNamePrefix="select"
        isClearable={!isMulti}
      />
    </div>
  );
};

export default UserSelect;
