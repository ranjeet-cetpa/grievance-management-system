import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { environment } from '@/config';
import toast from 'react-hot-toast';

const GrievanceResolutionDialog = ({
  fetchGrievanceDetails,
  isOpen,
  onClose,
  grievanceId,
  isAccepted = true,
  resolutionLink,
  onResolutionSubmitted,
  resolutionData,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null,
    message: '',
  });
  useEffect(() => {
    console.log(resolutionData, 'this is resolution data');
  }, [resolutionData]);
  const handleAccept = async () => {
    try {
      setIsSubmitting(true);

      const verificationResponse = await axiosInstance.get(
        `/Grievance/VerifyResolutionLink?resolutionLink=${resolutionData?.acceptLink}&comment=${''}`
      );

      if (verificationResponse.data.statusCode === 200) {
        toast.success('Resolution verified and accepted successfully!');
        setSubmitStatus({
          type: 'success',
          message: 'Resolution verified and accepted successfully!',
        });
        await fetchGrievanceDetails();
        onResolutionSubmitted(true);
        onClose();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      toast.error('Failed to submit response. Please try again.');
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit response. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for your appeal.');
      setSubmitStatus({
        type: 'error',
        message: 'Please provide a reason for your appeal.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const verificationResponse = await axiosInstance.get(
        `/Grievance/VerifyResolutionLink?resolutionLink=${resolutionData?.rejectLink}&comment=${encodeURIComponent(
          rejectionReason
        )}`
      );

      if (verificationResponse.data.statusCode === 200) {
        toast.success('Appeal Submitted Successfully!');
        setSubmitStatus({
          type: 'success',
          message: 'Appeal submitted successfully!',
        });
        await fetchGrievanceDetails();
        onResolutionSubmitted(false, rejectionReason);
        onClose();
      } else {
        throw new Error('Verification failed');
      }

      console.log(resolutionData?.rejectLink);
      console.log(grievanceId);
      console.log(isAccepted);
      console.log(rejectionReason);
    } catch (error) {
      toast.error('Failed to submit response. Please try again.');
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit response. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the rejection reason when the dialog is closed or opened
  React.useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setSubmitStatus({ type: null, message: '' });
    }
  }, [isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{isAccepted ? 'Accept Resolution' : 'Appeal'}</AlertDialogTitle>
          <AlertDialogDescription>
            {isAccepted
              ? 'Are you sure you want to accept this resolution?'
              : 'Please provide a reason for your appeal.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {submitStatus.type && (
          <Alert variant={submitStatus.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            {submitStatus.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        {!isAccepted && (
          <div className="space-y-2">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className={`h-32 ${!rejectionReason.trim() && submitStatus.type === 'error' ? 'border-red-500' : ''}`}
              disabled={isSubmitting || submitStatus.type === 'success'}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting || submitStatus.type === 'success'}>Cancel</AlertDialogCancel>

          {isAccepted ? (
            <Button variant="default" onClick={handleAccept} disabled={isSubmitting || submitStatus.type === 'success'}>
              {isSubmitting ? 'Processing...' : 'Accept Resolution'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || submitStatus.type === 'success'}
            >
              {isSubmitting ? 'Processing...' : 'Submit Appeal'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GrievanceResolutionDialog;
