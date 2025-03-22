import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Heading from '@/components/ui/heading';
import OrgChart2 from './OrgChart2';
import NonCorporateOfficeChart from './NonCorporateOfficeChart';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableViewCorporateOffice from '@/components/TableViewCorporateOffice';
import TableViewNonCorporateOffice from '@/components/TableViewNonCorporateOffice';
import { extractUniqueUnits } from '@/lib/helperFunction';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const OrganizationChart = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);

  const [selectedUnit, setSelectedUnit] = useState('396');
  const [isTableView, setIsTableView] = useState(true);
  const unitsDD = extractUniqueUnits(employeeList);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <Heading type={4}>Grievance Organization</Heading>
            <div className="flex items-center gap-6">
              <ToggleGroup
                type="single"
                className={`${
                  isTableView ? 'border border-gray-100  shadow-sm' : ''
                }  bg-white flex items-center gap-0  transition-colors duration-200 ease-in-out hover:bg-gray-100`}
                value={isTableView ? 'table' : 'chart'}
                onValueChange={(value) => setIsTableView(value === 'table')}
              >
                <ToggleGroupItem value="chart" aria-label="Chart View" className="px-4">
                  Chart
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table View" className="px-4">
                  Table
                </ToggleGroupItem>
              </ToggleGroup>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Unit">
                    {selectedUnit === '396'
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isTableView ? (
            <div className="p-4">
              {selectedUnit == '396' ? (
                <TableViewCorporateOffice />
              ) : (
                <TableViewNonCorporateOffice unitId={selectedUnit} />
              )}
            </div>
          ) : selectedUnit == '396' ? (
            <OrgChart2 />
          ) : (
            <NonCorporateOfficeChart unitId={Number(selectedUnit)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationChart;
