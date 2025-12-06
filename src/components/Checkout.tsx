import { useState } from 'react';
import { X, Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import client from '../api/client';
import { CreateContributionRequest, CreateContributionResponse, ContributionStatus } from '../types/api';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface CheckoutProps {
  projectId: string;
  projectTitle: string;
  rewardId: string | null;
  rewardTitle: string;
  amount: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function Checkout({
  projectId,
  projectTitle,
  rewardId,
  rewardTitle,
  amount,
  currency,
  onClose,
  onSuccess,
}: CheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'polling' | 'succeeded' | 'failed'>('idle');
  const [contributionId, setContributionId] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const payload: CreateContributionRequest = {
        projectId,
        rewardId,
        amount,
        currency,
      };

      const response = await client.post<CreateContributionResponse>('/contributions', payload);
      const { contribution, clientSecret } = response.data;

      setContributionId(contribution._id);

      // In a real implementation, you would use clientSecret with Stripe or GoPay SDK
      // For now, we'll simulate payment processing and poll for status
      console.log('Payment clientSecret received:', clientSecret);

      // Simulate payment processing (in production, integrate with payment SDK)
      setPaymentStatus('polling');
      await simulatePaymentAndPoll(contribution._id);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePaymentAndPoll = async (contribId: string) => {
    // Poll for contribution status updates (webhook should update it)
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await client.get(`/contributions/${contribId}`);
        const status: ContributionStatus = statusResponse.data.status;

        if (status === ContributionStatus.SUCCEEDED) {
          setPaymentStatus('succeeded');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
          return;
        } else if (status === ContributionStatus.FAILED) {
          setPaymentStatus('failed');
          setError('Payment failed. Please try again.');
          return;
        }
      } catch (err) {
        console.error('Failed to check contribution status:', err);
      }
    }

    // Timeout - payment still pending
    setPaymentStatus('idle');
    setError('Payment is taking longer than expected. Please check your contribution history.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Complete Your Pledge</CardTitle>
              <CardDescription className="mt-2">
                Support "{projectTitle}"
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pledge Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Reward</span>
              <span className="font-medium">{rewardTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">
                {currency.toUpperCase()} {amount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-primary">
                {currency.toUpperCase()} {amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Status Messages */}
          {paymentStatus === 'succeeded' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment successful! Thank you for your support.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'polling' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-800">
                Processing your payment...
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Info */}
          {paymentStatus === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Click below to proceed with payment. You'll be able to use Stripe or GoPay to complete your contribution.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CreditCard className="w-4 h-4" />
                <span>Secure payment processing</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isProcessing || paymentStatus === 'succeeded'}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : paymentStatus === 'succeeded' ? (
              'Completed'
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
