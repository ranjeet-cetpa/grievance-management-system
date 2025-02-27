import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UploadIcon, PlusCircle, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import React, { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';

// Schema for form validation
const formSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  attachment: z.array(z.instanceof(File)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateGrievance = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Categories and subcategories data (you can replace with API data)
  const categories = [
    { id: 'workplace', name: 'Workplace' },
    { id: 'compensation', name: 'Compensation' },
    { id: 'harassment', name: 'Harassment' },
    { id: 'discrimination', name: 'Discrimination' },
    { id: 'other', name: 'Other' },
  ];

  const subcategoriesByCategory = {
    workplace: [
      { id: 'environment', name: 'Work Environment' },
      { id: 'safety', name: 'Safety Concerns' },
      { id: 'equipment', name: 'Equipment Issues' },
    ],
    compensation: [
      { id: 'salary', name: 'Salary Issues' },
      { id: 'benefits', name: 'Benefits Issues' },
      { id: 'leaves', name: 'Leave Policy' },
    ],
    harassment: [
      { id: 'verbal', name: 'Verbal Harassment' },
      { id: 'physical', name: 'Physical Harassment' },
      { id: 'bullying', name: 'Workplace Bullying' },
    ],
    discrimination: [
      { id: 'gender', name: 'Gender Discrimination' },
      { id: 'racial', name: 'Racial Discrimination' },
      { id: 'age', name: 'Age Discrimination' },
    ],
    other: [
      { id: 'communication', name: 'Communication Issues' },
      { id: 'management', name: 'Management Issues' },
      { id: 'other', name: 'Other' },
    ],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      subcategory: '',
      title: '',
      description: '',
      attachment: [],
    },
  });

  // Watch category to update subcategories
  const selectedCategory = form.watch('category');

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
  function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      // Log the form data to console
      console.log('Grievance Data:', {
        ...data,
        attachments: selectedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      });

      toast.success('Grievance submitted successfully');
      setIsLoading(false);
      setOpen(false);
      form.reset();
      setSelectedFiles([]);
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
            }}
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Create New Grievance
          </Button>
        </DialogTrigger>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()} // Prevents closing on outside click
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:w-2/3 p-6 max-w-none overflow-y-auto sm:max-h-[95vh] h-[calc(100vh-40px)]"
        >
          <h2 className="text-xl font-semibold mb-4">Submit a Grievance</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('subcategory', ''); // Reset subcategory when category changes
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subcategory */}
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory &&
                              subcategoriesByCategory[selectedCategory]?.map((subcategory) => (
                                <SelectItem key={subcategory.id} value={subcategory.id}>
                                  {subcategory.name}
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
