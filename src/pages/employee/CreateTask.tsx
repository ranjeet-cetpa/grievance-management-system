import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { date, z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { CalendarIcon, ChevronLeft, UploadIcon, CircleUser, Circle, PlusCircle, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import React, { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import Heading from '@/components/ui/heading';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Checkbox } from '@/components/ui/checkbox';
import MultiSelectUser from '@/components/MultiSelectUser';
import { findEmployeeDetails } from '@/lib/helperFunction';
import { Badge } from '@/components/ui/badge';
interface SelectedUser {
  empCode: string;
  isPrimary: boolean;
}
const formSchema = z.object({
  heading: z.string().min(1, 'Heading is required'),
  description: z.string().min(1, 'Description is required'),
  attachment: z.array(z.instanceof(File)).optional(),
  task: z.string().min(1, 'Task is required'),
  parentTask: z.string().optional(),
  startedDate: z.date({
    required_error: 'Started Date is Required ',
  }),
  state: z.string().min(1, 'Task State is required'),
  priority: z.string().min(1, 'Priority is required'),
  dueDate: z.date({
    required_error: 'Due Date is Required ',
  }),
});
type FormValues = z.infer<typeof formSchema>;
const CreateTask = ({ refreshTasks }) => {
  const [open, setOpen] = useState(false);
  const [parentTask, setParentTask] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const employeeList = useSelector((state: RootState) => state.employee.employees);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heading: '',
      description: '',
      task: 'task',
      parentTask: '',
      startedDate: today,
      type: 'Public',
      state: 'new',
      priority: 'low',
      dueDate: undefined,
      attachment: [],
    },
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const startDate = form.watch('startedDate');
  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

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

  async function onSubmit(data: FormValues) {
    if (selectedUsers?.length === 0) {
      toast.error('Please select a user to assign the task.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        title: data.heading,
        description: data.description,
        assignedTo: selectedUsers.map((user) => ({
          userId: user.empCode,
          isPrimary: user.isPrimary,
          assignedToUnitId: findEmployeeDetails(employeeList, user?.empCode?.toString())?.employee?.unitId,
        })),
        departmentApprovalRequired: true,
        approvalStatus: 'Pending',
        parentTaskId: Number(data.parentTask),
        isPublicSubtask: data.type === 'Public',
        status: 'new',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        completionDate: null,
        unitId: user.unitId,
        priority: data.priority,
        startDate: data.startedDate ? new Date(data.startedDate).toISOString() : null,
      };

      const response = await axiosInstance.post('/TaskManager/Add', payload);
      if (response.data.statusCode === 200) {
        toast.success('Task Created Successfully');

        setIsLoading(false);
        setOpen(false);
        refreshTasks();
        setSelectedUsers([]);
        form.reset();
        try {
          const formData = new FormData();
          if (data?.attachment && data?.attachment?.length > 0) {
            data.attachment.forEach((file) => {
              formData.append('files', file);
            });
          }
          if (data?.attachment.length === 0) {
            return;
          }
          const responseAttach = await axiosInstance.post(
            `/TaskManager/uploadAttachment?taskId=${response?.data?.data?.generatedTaskId}&uploadedBy=${user?.EmpCode}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          if (responseAttach?.data?.statusCode === 200) {
            refreshTasks();
          }
        } catch (error) {
          console.error('Error uploading attachment:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  }
  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(`/TaskManager/GetTaskByAssignee/${user.EmpCode}`);
      const tasks = response.data;
      setParentTask(tasks.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  useEffect(() => {
    if (user?.EmpCode) {
      getAllTasks();
    }
  }, [user?.EmpCode]);

  const handleSelectedUsers = (newSelectedUsers) => {
    setSelectedUsers((prev) => {
      const newEntries = newSelectedUsers
        .filter((empCode) => !prev.some((user) => user.empCode === empCode))
        .map((empCode) => ({ empCode, isPrimary: true })); // Default isPrimary = false

      return [...prev, ...newEntries]; // Merge new selections
    });
  };
  const handleCheckboxChange = (empCode) => {
    const targetUser = selectedUsers.find((user) => user.empCode === empCode);

    if (!targetUser.isPrimary || (targetUser.isPrimary && selectedUsers.filter((user) => user.isPrimary).length > 1)) {
      // Only allow turning OFF if not the last primary
      setSelectedUsers((prev) =>
        prev.map((user) => (user.empCode === empCode ? { ...user, isPrimary: !user.isPrimary } : user))
      );
    } else {
      toast.error('At least one user must be primary');
    }
  };
  const handleDelete = (empCode) => {
    setSelectedUsers((prev) => prev.filter((user) => user.empCode !== empCode));
  };

  return (
    <div>
      {isLoading && <Loader />}
      <Dialog modal={true} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              form.reset();
            }}
          >
            <PlusCircle className="w-5 h-5" /> <span>Create New Task</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()} // Prevents closing on outside click
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:w-3/4 p-6 max-w-none overflow-y-auto  sm:max-h-[95vh] h-[calc(100vh-40px)]"
        >
          <div className="flex flex-row items-end justify-end mt-4">
            <div className="flex gap-2 ">
              <CircleUser />
              <div className="flex flex-col items-start">
                <Label>{findEmployeeDetails(employeeList, user?.EmpCode)?.employee?.empName || 'Unknown'}</Label>
                <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 sm:grid sm:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-4 flex flex-col">
                <FormField
                  control={form.control}
                  name="heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task heading" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-md">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="rounded-md">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <div className="sm:h-60 rounded-lg">
                            <ReactQuill
                              placeholder="Enter task description"
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
                </div>

                {/* Add Attachment */}
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
                          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary  transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex flex-col items-center gap-2">
                              <UploadIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  Drag & drop files or{' '}
                                  <label htmlFor="fileInput" className="text-primary  cursor-pointer">
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
              </div>

              <div className=" flex flex-col ">
                <div className="grid  grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <MultiSelectUser onChange={handleSelectedUsers} employeeList={employeeList} form={form} user={user} />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="mt-2.5">Start Date</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn('w-full  text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // Normalize time to avoid inconsistencies
                                return date < today; // Disable only past dates, allow today and future dates
                              }}
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                form.setValue('dueDate', null); // Reset due date when start date changes
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    rules={{
                      validate: (value) =>
                        !startDate || (value && value > startDate) || 'Due date must be after start date',
                    }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="mt-2.5">Due Date</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn('w-full  text-left font-normal', !field.value && 'text-muted-foreground')}
                              >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-100" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              disabled={(date) => startDate && date <= startDate}
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility (In case of delegation) </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={'Public'}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Public">Public</SelectItem>
                              <SelectItem value="Private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentTask"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Task (In case of sub task)</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value?.toString()}
                            defaultValue={'Select Parent Task'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Parent Task" />
                            </SelectTrigger>
                            <SelectContent>
                              {parentTask?.map((task) => (
                                <SelectItem key={task.id} value={`${task.id}`}>
                                  {task.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-1/2 mt-5 flex-wrap gap-2 rounded-md p-1 max-h-[150px] overflow-auto">
                  {selectedUsers?.map((user, index) => (
                    <div className="flex flex-row w-full  gap-2 py-1 text-md border rounded-md px-3 items-center  ">
                      <div className={`px-2 py-1 text-sm font-semibold rounded-md  max-w-1/5 truncate`}>
                        {findEmployeeDetails(employeeList, user?.empCode)?.employee?.empName || 'Unknown'}
                      </div>
                      <Label
                        key={index}
                        className="flex items-center gap-2 border-l-2 border-dotted pl-2 border-gray-600"
                      >
                        <Checkbox
                          className="w-4 h-4"
                          checked={user.isPrimary}
                          onCheckedChange={() => handleCheckboxChange(user.empCode)}
                        />

                        <Badge
                          variant="outline"
                          className={user.isPrimary ? 'bg-primary text-white' : 'bg-transparent text-black'}
                        >
                          Primary
                        </Badge>
                        <Trash2
                          className="ml-auto cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(user.empCode)}
                          size={20}
                          strokeWidth={1.25}
                        />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-2 mt-1 gap-2 flex sm:justify-end justify-between">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateTask;
