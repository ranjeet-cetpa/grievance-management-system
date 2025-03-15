import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, User, Info, ChevronDown, Trash, Trash2 } from 'lucide-react';
import { FlattenedNode } from '@/types/orgChart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useOrgChart } from '@/hooks/useOrgChart';
import axios from 'axios';
import toast from 'react-hot-toast';

const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface CategoriesSectionProps {
  categories: FlattenedNode[];
  onEdit: (node: FlattenedNode) => void;
  onAdd: (node: FlattenedNode) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories, onEdit, onAdd }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<FlattenedNode | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [openAccordion, setOpenAccordion] = React.useState<string | undefined>(undefined);
  const { fetchData } = useOrgChart({
    unitId: '396',
    unitName: 'Corporate Office',
  });

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setIsDeleting(true);
      await axios.get(
        `https://uat.grivance.dfccil.cetpainfotech.com/api/Admin/ActiveInactiveGroup?groupId=${selectedCategory.id}&isActive=false`
      );
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
        {categories.map((node) => (
          <AccordionItem key={node.id} value={node.id.toString()}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">{node.groupName || node.description}</span>
                <div>
                  {' '}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(node);
                      setInfoDialogOpen(true);
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(node);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Complaint Handlers</h4>
                  {node.mappedUser && node.mappedUser.length > 0 ? (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(node)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onAdd(node)}>
                      <User className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {node.mappedUser && node.mappedUser.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    {node.mappedUser.map((user, idx) => (
                      <li key={idx}>{capitalizeWords(user.userDetail)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500 italic">No user assigned</div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader></DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600">{selectedCategory.description || 'No description provided'}</p>
              </div>
              <div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoriesSection;
