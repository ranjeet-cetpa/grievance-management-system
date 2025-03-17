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
  parentGroupId: number | null;
  isActive: boolean;
  isServiceCategory: boolean;
  childGroup: GroupMaster[];
}

interface ServiceResponse {
  statusCode: number;
  message: string;
  data: GroupMaster[];
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
  const [services, setServices] = useState<GroupMaster[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const user = useSelector((state: RootState) => state.user);
  console.log('user ', user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const isCorporate = user?.unitId === '396' ? true : false;
        const response = await axiosInstance.get(`/Admin/GetServiceMaster?isCorporate=${isCorporate}`);

        if (response.data.error) {
          throw new Error(response.data.errorDetail || 'Failed to fetch services');
        }

        setServices(response.data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to fetch services');
      }
    };

    fetchServices();
  }, [open, user?.unitId]); // Added user?.unitId as dependency

  // Get services for a specific level based on selected parent
  const getServicesForLevel = (level: number): GroupMaster[] => {
    let currentServices = services;

    for (let i = 0; i < level; i++) {
      const selectedId = selectedCategories[i];
      const selectedService = currentServices.find((s) => s.id === selectedId);
      if (selectedService?.childGroup?.length) {
        currentServices = selectedService.childGroup;
      } else {
        return [];
      }
    }

    return currentServices;
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

  // Handle category selection
  const handleCategorySelect = (value: string, level: number) => {
    const numericValue = parseInt(value);
    const newSelectedCategories = selectedCategories.slice(0, level);
    newSelectedCategories[level] = numericValue;
    setSelectedCategories(newSelectedCategories);

    // Set the serviceId to the last selected category
    form.setValue('serviceId', numericValue);
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
      formData.append('GrievanceMasterId', '0');
      formData.append('title', data.title);
      formData.append('description', data.description);
      // formData.append('serviceId', data.serviceId.toString());

      formData.append('userCode', user.EmpCode || '');
      formData.append('userEmail', findEmployeeDetails(employeeList, user?.EmpCode.toString())?.employee?.empEmail);
      formData.append('TUnitId', user?.unitId);
      formData.append('TGroupId', data.serviceId?.toString());
      formData.append('TDepartment', user?.Department);
      // formData.append('round', '0');
      // formData.append('AssignedUserCode', '');
      // formData.append('AssignedUserDetails', '');
      // Append files
      selectedFiles &&
        selectedFiles.forEach((file) => {
          formData.append('attachments', file);
        });

      // Make API call
      console.log(formData);

      const response = await axiosInstance.post('/Grievance/AddUpdateGrievance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.statusCode === 200) {
        toast.success('Grievance submitted successfully');
        //console.log('Submission response:', response);
        setOpen(false);
        form.reset();
        setSelectedFiles([]);
        setSelectedCategories([]);
        if (refreshGrievances) refreshGrievances();
      } else if (response?.data?.statusCode === 400) {
        toast.error(response?.data?.message);
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
          className="w-[95vw] sm:w-[600px] h-[calc(100vh-12rem)] p-3 max-w-none overflow-y-auto"
        >
          <Form {...form}>
            <form id="grievanceForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div className="space-y-2 pb-14">
                {/* Dynamic Category Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* First Level Category */}
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-sm font-medium mb-0">Primary Category</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => handleCategorySelect(value, 0)}
                            value={selectedCategories[0]?.toString()}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select Primary Category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {services && services.length > 0 ? (
                                services.map((service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.groupName}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1 text-sm text-muted-foreground">No categories available</div>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Render additional category levels if children exist */}
                  {selectedCategories.map((_, index) => {
                    const servicesForLevel = getServicesForLevel(index + 1);
                    if (!servicesForLevel || servicesForLevel.length === 0) return null;

                    return (
                      <FormItem key={index + 1} className="col-span-2">
                        <FormLabel className="text-sm font-medium mb-0">
                          {index === 0 ? 'Sub Category' : `Sub Category ${index + 1}`}
                        </FormLabel>
                        <Select
                          onValueChange={(value) => handleCategorySelect(value, index + 1)}
                          value={selectedCategories[index + 1]?.toString()}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue
                              placeholder={`Select ${index === 0 ? 'Sub Category' : `Sub Category ${index + 1}`}`}
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {servicesForLevel.map((service) => (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                {service.groupName}
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
                      <FormLabel className="text-sm font-medium mb-0">Subject</FormLabel>
                      <FormControl>
                        <Input className="h-8" placeholder="Enter grievance title" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium mb-0 ">Description</FormLabel>
                      <FormControl>
                        <div className="rounded-md  h-[200px]">
                          <ReactQuill
                            style={{ height: '160px' }}
                            placeholder="Enter Description"
                            {...field}
                            onChange={(value) => field.onChange(value)}
                            theme="snow"
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline'],
                                [{ list: 'ordered' }, { list: 'bullet' }],
                              ],
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Attachment */}
                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-1 ">
                        <FormLabel className="text-sm font-medium mb-0">Attachments</FormLabel>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF (max. 10MB)</p>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="flex items-center justify-center h-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <UploadIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Drag & drop or{' '}
                                <label htmlFor="fileInput" className="text-primary cursor-pointer">
                                  browse
                                </label>
                              </p>
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Display Selected Files */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedFiles.map((file, index) => {
                    const fileUrl = URL.createObjectURL(file);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={fileUrl}
                          alt={`preview-${index}`}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="absolute -top-1 -right-1 text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </Form>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t bg-background sticky bottom-0 left-0 right-0 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-8 px-3">
              Cancel
            </Button>
            <Button type="submit" form="grievanceForm" className="h-8 px-3">
              Submit Grievance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGrievance;
