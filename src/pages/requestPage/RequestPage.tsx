import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router';
import axiosInstance from '@/services/axiosInstance';
import { environment } from '@/config';
import toast from 'react-hot-toast';
import SiteHeader from '@/components/site-header';

interface ResolutionResponse {
  isAccepted: boolean;
  rejectionReason?: string;
}

const RequestPage = () => {
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const token = useParams();
  console.log(token.token[token.token.length - 1], 'this is token . .. ');

  const isAcceptedLink = token.token[token.token.length - 1] === '$';

  const handleAccept = async () => {
    try {
      setIsSubmitting(true);
      const response: ResolutionResponse = {
        isAccepted: true,
      };

      const verificationResponse = await axiosInstance.get(
        `/Grievance/VerifyResolutionLink?resolutionLink=${token.token}&comment=${''}`
      );

      if (verificationResponse.data.statusCode === 200) {
        toast.success('Resolution verified and accepted successfully!');
        setSubmitStatus({
          type: 'success',
          message: 'Resolution verified and accepted successfully!',
        });
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
    if (!showRejectionReason) {
      setShowRejectionReason(true);
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      setSubmitStatus({
        type: 'error',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response: ResolutionResponse = {
        isAccepted: false,
        rejectionReason: rejectionReason.trim(),
      };

      const verificationResponse = await axiosInstance.get(
        `/Grievance/VerifyResolutionLink?resolutionLink=${token.token}&comment=${encodeURIComponent(rejectionReason)}`
      );

      if (verificationResponse.data.statusCode === 200) {
        toast.success('Resolution rejected successfully!');
        setSubmitStatus({
          type: 'success',
          message: 'Resolution rejected successfully!',
        });
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

  return (
    <div className="container  mx-auto py-10">
      <SiteHeader showtoggle={false} />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Grievance Resolution Response</CardTitle>
          <CardDescription>
            Please review the resolution for your grievance and provide your response below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitStatus.type && (
            <Alert variant={submitStatus.type === 'error' ? 'destructive' : 'default'} className="mb-6">
              {submitStatus.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{submitStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {showRejectionReason && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Please provide the reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={`h-32 ${!rejectionReason.trim() && 'border-red-500'}`}
                />
                {/* {!rejectionReason.trim() && (
                  <p className="text-sm text-red-500">Please provide a reason for rejection</p>
                )} */}
              </div>
            )}

            <div className="flex justify-end gap-4">
              {isAcceptedLink && (
                <Button variant="default" onClick={handleAccept} disabled={isSubmitting || showRejectionReason}>
                  Accept Resolution
                </Button>
              )}
              {!isAcceptedLink && (
                <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                  {showRejectionReason ? 'Submit Rejection' : 'Reject Resolution'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestPage;
