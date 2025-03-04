import { useEffect } from 'react';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const MultiSelectField = ({ form, employeeList, user, onChange, showLabel = true, selectedEmployees }) => {
  //console.log(selectedEmployees);
  // Transform employeeList to match react-select's expected format
  const options = employeeList
    ?.filter((ele) => Number(ele.unitId) === Number(user.unitId))
    ?.filter(
      (employee) =>
        !selectedEmployees?.some((selectedEmp) => selectedEmp.userId?.toString() === employee.empCode?.toString())
    )
    .map((employee) => ({
      value: employee.empCode,
      label: `${employee.empName} - ${employee.empCode}`,
    }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '36px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 50,
    }),
  };

  return (
    <FormField
      control={form.control}
      name="assignedTo"
      render={({ field }) => (
        <FormItem>
          {showLabel && <FormLabel>Assigned To (Select multiple users)</FormLabel>}
          <FormControl>
            <Controller
              name="assignedTo"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={options}
                  styles={customStyles}
                  value={[]} // Keep the UI empty, so selections are not shown inside Select
                  onChange={(selected) => {
                    const selectedValues = selected.map((option) => option.value);
                    field.onChange(selectedValues); // Update form state
                    onChange && onChange(selectedValues); // Send data to parent
                  }}
                  className="basic-multi-select "
                  classNamePrefix="select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MultiSelectField;
