import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import OrgChart2 from './OrgChart2';
import NonCorporateOfficeChart from './NonCorporateOfficeChart';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { extractUniqueUnits } from '@/lib/helperFunction';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OrganizationChart = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);
  const [selectedUnit, setSelectedUnit] = useState(396);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <Heading type={4}>Organization Chart</Heading>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Unit">
                  {selectedUnit === 396
                    ? 'Corporate Office'
                    : unitsDD.find((unit) => unit.unitId === selectedUnit)?.unitName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Units</SelectLabel>
                  {unitsDD.map((unit) => (
                    <SelectItem key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {selectedUnit === 396 ? <OrgChart2 /> : <NonCorporateOfficeChart unitId={selectedUnit} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationChart;
