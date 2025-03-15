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

const unitsDD = [
  {
    unitId: '396',
    unitName: 'Corporate office',
  },
  {
    unitId: '395',
    unitName: 'Ahmedabad',
  },
  {
    unitId: '397',
    unitName: 'Ambala',
  },
  {
    unitId: '390',
    unitName: 'Tundla',
  },
  {
    unitId: '402',
    unitName: 'Prayagraj(W)',
  },
  {
    unitId: '391',
    unitName: 'Jaipur',
  },
  {
    unitId: '401',
    unitName: 'Ajmer',
  },
  {
    unitId: '399',
    unitName: 'Noida',
  },
  {
    unitId: '392',
    unitName: 'Prayagraj(E)',
  },
  {
    unitId: '398',
    unitName: 'Meerut',
  },
  {
    unitId: '400',
    unitName: 'Kolkatta',
  },
];

const OrganizationChart = () => {
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const [selectedUnit, setSelectedUnit] = useState('396');
  const [isTableView, setIsTableView] = useState(true);

  return (
    <div className="p-2">
      <Card className="rounded-md mt-2 mx-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <Heading type={4}>Grievance Organization</Heading>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="view-mode" checked={isTableView} onCheckedChange={setIsTableView} />
                <Label htmlFor="view-mode">{isTableView ? 'Table View' : 'Chart View'}</Label>
              </div>
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
              {selectedUnit === '396' ? (
                <TableViewCorporateOffice />
              ) : (
                <TableViewNonCorporateOffice unitId={selectedUnit} />
              )}
            </div>
          ) : selectedUnit === '396' ? (
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
