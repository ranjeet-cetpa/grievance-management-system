import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UploadIcon, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { findEmployeeDetails } from '@/lib/helperFunction';

interface GroupMaster {
  id: number;
  groupName: string;
  description: string;
  remark: string | null;
  createdBy: number;
  createdDate: string;
  modifyBy: number;
  modifyDate: string;
  isActive: boolean;
}

interface ServiceCategory {
  id: number;
  serviceName: string;
  serviceDescription: string;
  parentServiceId: number | null;
  parentService: ServiceCategory | null;
  groupMasterId: number | null;
  groupMaster: GroupMaster | null;
  remark: string | null;
  createdBy: number;
  createdDate: string;
  modifyBy: number | null;
  modifyDate: string | null;
  isActive: boolean;
  children?: ServiceCategory[];
}

interface ServiceResponse {
  statusCode: number;
  message: string;
  data: ServiceCategory[];
  dataLength: number;
  totalRecords: number;
  error: boolean;
  errorDetail: string | null;
}

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  serviceId: z.number().min(1, 'Service is required'),
  attachment: z.array(z.instanceof(File)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateGrievance = ({ refreshGrievances }: { refreshGrievances?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log(employeeList, 'this is user');
        const response = await axiosInstance.get('/Admin/GetServiceMasterList');
        console.log('Raw API Response:', response);
        console.log('API Response Data:', response.data);
        console.log('API Services:', response.data.data);

        if (response.data.error) {
          throw new Error(response.data.errorDetail || 'Failed to fetch services');
        }

        const organizedServices = organizeServices(response.data.data);

        console.log('Organized Services:', organizedServices);
        console.log(
          'Active Root Services:',
          organizedServices.filter((s) => s.isActive)
        );
        setServices(organizedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to fetch services');
      }
    };

    fetchServices();
  }, [open]); // Only fetch when dialog opens

  // Function to organize services into a hierarchical structure
  const organizeServices = (flatServices) => {
    console.log('Organizing services from:', flatServices);
    const serviceMap = new Map();
    const rootServices = [];

    // First pass: Create map of all services
    flatServices.forEach((service) => {
      // Only include active services
      if (service.isActive) {
        console.log('Adding active service to map:', service);
        serviceMap.set(service.id, { ...service, children: [] });
      }
    });

    // Second pass: Organize into hierarchy
    flatServices.forEach((service) => {
      if (!service.isActive) {
        console.log('Skipping inactive service:', service);
        return;
      }

      const currentService = serviceMap.get(service.id);
      if (service.parentServiceId === null) {
        console.log('Adding root service:', service);
        rootServices.push(currentService);
      } else {
        const parentService = serviceMap.get(service.parentServiceId);
        if (parentService) {
          console.log('Adding child service:', service, 'to parent:', parentService);
          parentService.children = parentService.children || [];
          parentService.children.push(currentService);
        } else {
          console.log('Parent service not found for:', service);
        }
      }
    });

    console.log('Final root services:', rootServices);
    return rootServices;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      serviceId: 0,
      attachment: [],
    },
  });

  // Get services for a specific level based on selected parent
  const getServicesForLevel = (level: number): ServiceCategory[] => {
    let currentServices = services;
    console.log('Getting services for level:', level, 'Current services:', currentServices);

    for (let i = 0; i < level; i++) {
      const selectedId = selectedCategories[i];
      const selectedService = currentServices.find((s) => s.id === selectedId);
      if (selectedService?.children?.length) {
        currentServices = selectedService.children;
      } else {
        return [];
      }
    }

    return currentServices;
  };

  // Handle category selection
  const handleCategorySelect = (value: string, level: number) => {
    const numericValue = parseInt(value);
    const newSelectedCategories = selectedCategories.slice(0, level);
    newSelectedCategories[level] = numericValue;
    setSelectedCategories(newSelectedCategories);

    // Set the serviceId to the last selected category
    form.setValue('serviceId', numericValue);

    console.log('Selected category:', {
      level,
      value: numericValue,
      allCategories: newSelectedCategories,
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prevFiles) => {
        const uniqueFiles = [...prevFiles, ...filesArray].reduce((acc, file) => {
          if (!acc.some((f) => f.name === file.name && f.size === file.size)) {
            acc.push(file);
          }
          return acc;
        }, [] as File[]);

        form.setValue('attachment', uniqueFiles);
        form.trigger('attachment');

        return uniqueFiles;
      });

      e.target.value = '';
    }
  };

  // Remove file
  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  // Form submission
  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      // formData.append('StatusId', '0');
      formData.append('id', '0');
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('serviceId', data.serviceId.toString());
      formData.append('userCode', user.EmpCode || '');
      formData.append('userEmail', findEmployeeDetails(employeeList, user?.EmpCode.toString())?.employee?.empEmail);
      formData.append('AssignedUserCode', 'NA');
      formData.append('AssignedUserDetails', 'NA');
      // Append files
      selectedFiles &&
        selectedFiles.forEach((file) => {
          formData.append('attachments', file);
        });

      // Make API call
      const response = await axiosInstance.post('/Grievance/AddUpdateGrievance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Submission response:', response);
      toast.success('Grievance submitted successfully');
      setOpen(false);
      form.reset();
      setSelectedFiles([]);
      setSelectedCategories([]);
      if (refreshGrievances) {
        refreshGrievances();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit grievance');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {isLoading && <Loader />}
      <Dialog modal={true} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              form.reset();
              setSelectedCategories([]);
            }}
          >
            <Plus className="w-5 h-5 mr-2" /> Create New Grievance
          </Button>
        </DialogTrigger>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:w-2/3 p-6 max-w-none overflow-y-auto sm:max-h-[95vh] h-[calc(100vh-40px)]"
        >
          <h2 className="text-xl font-semibold mb-4">Submit a Grievance</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {/* Dynamic Category Selectors */}
              <div className="space-y-4">
                {/* First Level Category */}
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => handleCategorySelect(value, 0)}
                          value={selectedCategories[0]?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {services && services.length > 0 ? (
                              services.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.serviceName}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                No categories available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Render additional category levels if children exist */}
                {selectedCategories.map((_, index) => {
                  const servicesForLevel = getServicesForLevel(index + 1);
                  if (!servicesForLevel || servicesForLevel.length === 0) return null;

                  return (
                    <FormItem key={index + 1}>
                      <FormLabel>Sub Category {index + 1}</FormLabel>
                      <Select
                        onValueChange={(value) => handleCategorySelect(value, index + 1)}
                        value={selectedCategories[index + 1]?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select Sub Category ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {servicesForLevel.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.serviceName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  );
                })}
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter grievance title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="rounded-md">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="sm:h-60 rounded-lg">
                        <ReactQuill
                          placeholder="Enter detailed description of your grievance"
                          {...field}
                          onChange={(value) => field.onChange(value)}
                          className="quill-editor sm:h-52 border-none rounded-md"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachment */}
              <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      Attachment
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex flex-col items-center gap-2">
                            <UploadIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Drag & drop files or{' '}
                                <label htmlFor="fileInput" className="text-primary cursor-pointer">
                                  browse
                                </label>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Supported formats: PNG, JPG, PDF (max. 10MB)
                              </p>
                            </div>
                          </div>
                        </div>
                        <input
                          id="fileInput"
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          multiple
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-red-500" />
                  </FormItem>
                )}
              />

              {/* Display Selected Files */}
              <div className="mt-4">
                {selectedFiles.map((file, index) => {
                  const fileUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="inline-block mr-4 mb-4">
                      <div className="relative">
                        <img
                          src={fileUrl}
                          alt={`preview-${index}`}
                          className="w-20 h-20 object-cover rounded-md border border-dotted border-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="absolute top-0 right-0 text-white bg-red-500 rounded-md w-5 h-5 flex items-center justify-center"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Grievance</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGrievance;
