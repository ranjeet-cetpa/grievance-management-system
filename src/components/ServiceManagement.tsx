import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactSelect from 'react-select';
import { RootState } from '@/app/store';
import { CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Info, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { extractUniqueUnits } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import logger from '@/lib/logger';
import toast from 'react-hot-toast';
import Loader from './ui/loader';

interface ServiceManagementProps {
  createServiceOpen: boolean;
  setCreateServiceOpen: (open: boolean) => void;
}

interface Group {
  id: number | string;
  groupName: string;
  // ... other group properties
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ createServiceOpen, setCreateServiceOpen }) => {
  const [services, setServices] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [expandedServices, setExpandedServices] = useState({});
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const unitsDD = extractUniqueUnits(employeeList);

  const [formData, setFormData] = useState({
    id: '0',
    name: '',
    description: '',
    parentServiceId: '0',
    groupId: '',
    isParentService: true,
  });

  // Add new state for service hierarchy
  const [serviceHierarchy, setServiceHierarchy] = useState([]);

  // Function to transform services into hierarchical structure
  const buildServiceHierarchy = (services, parentId = null) => {
    return services
      .filter((service) => service.parentServiceId === parentId && service.isActive)
      .map((service) => ({
        ...service,
        children: buildServiceHierarchy(services, service.id),
      }));
  };

  // Update services effect to build hierarchy
  useEffect(() => {
    if (services.length > 0) {
      const hierarchy = buildServiceHierarchy(services);
      setServiceHierarchy(hierarchy);
    }
  }, [services]);

  // Function to render service options recursively with unlimited nesting
  const renderServiceOptions = (services, level = 0, parentPath = '') => {
    return services.map((service) => {
      const childServices = getChildServices(service.id);
      const currentPath = parentPath ? `${parentPath} > ${service.serviceName}` : service.serviceName;

      return (
        <SelectGroup key={service.id}>
          <SelectItem value={service.id.toString()}>
            <div style={{ paddingLeft: `${level * 16}px` }} className="flex items-center gap-2 min-w-[300px]">
              <div
                className={`h-5 w-5 ${
                  level === 0 ? 'rounded-full bg-blue-600' : 'rounded-md bg-blue-500'
                } flex items-center justify-center`}
              >
                <Settings size={12} className="text-white" />
              </div>
              <span className="text-sm font-medium">{currentPath}</span>
            </div>
          </SelectItem>
          {childServices.length > 0 && (
            <div className="pl-4">{renderServiceOptions(childServices, level + 1, currentPath)}</div>
          )}
        </SelectGroup>
      );
    });
  };

  // Handle service type change
  const handleServiceTypeChange = (isParent) => {
    setFormData((prev) => ({
      ...prev,
      isParentService: isParent,
      parentServiceId: isParent ? '0' : prev.parentServiceId,
    }));
  };

  const formatEmployeeForSelect = (employee) => {
    const option = {
      value: employee.empCode.toString(),
      label: `${employee.empName ?? 'Unnamed'} ${employee.empCode ? `(${employee.empCode})` : ''} ${
        employee.designation ? `- ${employee.designation}` : ''
      } ${employee.department ? `| ${employee.department}` : ''}`,
      original: employee,
    };
    return option;
  };

  const formattedEmployeeList = employeeList?.map(formatEmployeeForSelect);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/Admin/GetServiceMasterList');
      if (response?.data?.statusCode === 200) {
        const data = response?.data?.data;
        logger.log('Services data:', data);
        setServices(data || []);
      } else {
        toast.error('Failed to fetch services');
        setServices([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
      setServices([]);
      setLoading(false);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      const response = await axiosInstance.get('/Admin/GetGroupMasterList');
      const data = await response?.data?.data;
      if (response?.data?.statusCode === 200) {
        setGroups(data || []);
      } else {
        toast.error('Failed to fetch groups');
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
      setGroups([]);
    }
  };

  // Update useEffect to fetch both services and groups
  useEffect(() => {
    fetchServices();
    fetchGroups();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle service creation
  const handleSaveService = async () => {
    if (!formData.name || !formData.groupId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const serviceData = {
        id: parseInt(formData.id) || 0,
        serviceName: formData.name,
        serviceDescription: formData.description,
        parentServiceId: formData.isParentService ? '0' : formData.parentServiceId,
        groupId: formData.groupId,
        userCode: user?.EmpCode,
      };

      const response = await axiosInstance.post('/Admin/AddUpdateServiceMaster', serviceData);

      if (response.data?.statusCode === 200) {
        toast.success(formData.id === '0' ? 'New service created successfully' : 'Service updated successfully');
        await fetchServices();
      } else {
        toast.error(formData.id === '0' ? 'Error in creating new service' : 'Error in updating service');
      }

      resetForm();
      setCreateServiceOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(formData.id === '0' ? 'Failed to create service' : 'Failed to update service');
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: '0',
      name: '',
      description: '',
      parentServiceId: '0',
      groupId: '',
      isParentService: true,
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setCreateServiceOpen(false);
    resetForm();
  };

  // Show service details
  const showServiceDetailsHandler = (service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  // Toggle expanded state for a service
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  // Get child services for a parent
  const getChildServices = (parentId) => {
    return services.filter((service) => service.parentServiceId === parentId && service.isActive);
  };

  // Filter parent services
  const parentServices = services.filter((service) => !service.parentServiceId && service.isActive);

  // Get all child services recursively
  const getAllChildServices = (parentId) => {
    const directChildren = services.filter((service) => service.parentServiceId === parentId && service.isActive);
    return directChildren.map((child) => ({
      ...child,
      children: getAllChildServices(child.id),
    }));
  };

  // Render service row recursively
  const renderServiceRow = (service, level = 0) => {
    const childServices = getAllChildServices(service.id);
    const hasChildren = childServices.length > 0;

    return (
      <React.Fragment key={service.id}>
        <TableRow
          className={`
            hover:bg-gray-50 
            transition-colors 
            ${level > 0 ? 'bg-blue-25/40' : ''}
            ${level > 1 ? 'bg-blue-25/70' : ''}
          `}
        >
          <TableCell className="w-[40px]">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
                onClick={() => toggleServiceExpansion(service.id)}
              >
                {expandedServices[service.id] ? (
                  <ChevronDown size={16} className="text-blue-600" />
                ) : (
                  <ChevronRight size={16} className="text-blue-600" />
                )}
              </Button>
            )}
          </TableCell>
          <TableCell className="font-medium text-gray-800">
            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center gap-2">
              <div
                className={`
                  ${level === 0 ? 'h-7 w-7 rounded-full bg-blue-600' : ''}
                  ${level === 1 ? 'h-6 w-6 rounded-lg bg-blue-500' : ''}
                  ${level >= 2 ? 'h-5 w-5 rounded-md bg-blue-400' : ''}
                  flex items-center justify-center text-white text-xs
                `}
              >
                <Settings size={level === 0 ? 16 : level === 1 ? 14 : 12} />
              </div>
              <span className={`${level > 0 ? 'text-sm' : ''}`}>{service.serviceName}</span>
            </div>
          </TableCell>
          <TableCell className={`text-gray-600 ${level > 0 ? 'text-sm' : ''}`}>{service.serviceDescription}</TableCell>
          <TableCell className={`text-gray-600 ${level > 0 ? 'text-sm' : ''}`}>
            {service.groupMaster?.groupName || 'Not Assigned'}
          </TableCell>
          <TableCell className={`text-gray-600 ${level > 0 ? 'text-sm' : ''}`}>
            {new Date(service.createdDate).toLocaleDateString('en-GB')}
          </TableCell>
          <TableCell className="text-center">
            <div className="flex justify-center items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`
                  rounded-full hover:bg-blue-100 
                  ${level === 0 ? 'h-8 w-8' : 'h-7 w-7'} 
                  p-0
                `}
                onClick={() => showServiceDetailsHandler(service)}
              >
                <Info size={level === 0 ? 16 : 14} className="text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  rounded-full hover:bg-blue-100 
                  ${level === 0 ? 'h-8 w-8' : 'h-7 w-7'}
                  p-0
                `}
                onClick={() => {
                  setFormData({
                    id: service.id.toString(),
                    name: service.serviceName,
                    description: service.serviceDescription,
                    parentServiceId: service.parentServiceId?.toString() || '0',
                    groupId: service.groupMasterId?.toString() || '',
                    isParentService: !service.parentServiceId,
                  });
                  setCreateServiceOpen(true);
                }}
              >
                <Edit size={level === 0 ? 16 : 14} className="text-blue-600" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {expandedServices[service.id] && childServices.map((child) => renderServiceRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <CardContent className="p-6">
      {loading && <Loader />}

      {/* Create Service Dialog */}
      <Dialog open={createServiceOpen} onOpenChange={setCreateServiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{formData.id === '0' ? 'Create New Service' : 'Edit Service'}</DialogTitle>
            <DialogDescription>
              {formData.id === '0' ? 'Add a new service to the system' : 'Edit existing service'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-medium">
                Service Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter service name"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-medium">Service Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="parentService"
                    name="serviceType"
                    checked={formData.isParentService}
                    onChange={() => handleServiceTypeChange(true)}
                    className="mr-2"
                  />
                  <Label htmlFor="parentService">Parent Service</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="childService"
                    name="serviceType"
                    checked={!formData.isParentService}
                    onChange={() => handleServiceTypeChange(false)}
                    className="mr-2"
                  />
                  <Label htmlFor="childService">Child Service</Label>
                </div>
              </div>
            </div>

            {!formData.isParentService && (
              <div className="grid gap-2">
                <Label htmlFor="parentServiceId" className="font-medium">
                  Select Parent Service
                </Label>
                <Select
                  value={formData.parentServiceId}
                  onValueChange={(value) => handleInputChange({ target: { name: 'parentServiceId', value } })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service to create child under" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[500px]">{renderServiceOptions(parentServices)}</SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="groupId" className="font-medium">
                Group <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => handleInputChange({ target: { name: 'groupId', value } })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Groups</SelectLabel>
                    {groups
                      .filter((group) => group.isActive)
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.groupName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose} className="border-gray-300 hover:bg-gray-100">
              Cancel
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={!formData.name || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading
                ? formData.id === '0'
                  ? 'Creating...'
                  : 'Updating...'
                : formData.id === '0'
                ? 'Create Service'
                : 'Update Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary">
              <TableHead className="w-12 text-white"></TableHead>
              <TableHead className="text-white font-medium">Service Name</TableHead>
              <TableHead className="text-white font-medium">Description</TableHead>
              <TableHead className="text-white font-medium">Group</TableHead>
              <TableHead className="text-white font-medium">Created Date</TableHead>
              <TableHead className="text-white font-medium w-24 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{parentServices.map((service) => renderServiceRow(service))}</TableBody>
        </Table>
      </div>

      {/* Service Details Dialog */}
      {showServiceDetails && selectedService && (
        <Dialog open={showServiceDetails} onOpenChange={setShowServiceDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Service Details</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                  <Settings size={14} />
                </div>
                <span className="font-medium text-blue-800">{selectedService.serviceName}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="mt-1 text-gray-600">{selectedService.serviceDescription}</p>
                </div>

                <div>
                  <Label className="font-medium">Group</Label>
                  <p className="mt-1 text-gray-600">{selectedService.groupMaster?.groupName || 'Not Assigned'}</p>
                </div>

                <div>
                  <Label className="font-medium">Created Date</Label>
                  <p className="mt-1 text-gray-600">
                    {new Date(selectedService.createdDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowServiceDetails(false)}
                className="border-gray-300 hover:bg-gray-100"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </CardContent>
  );
};

export default ServiceManagement;
