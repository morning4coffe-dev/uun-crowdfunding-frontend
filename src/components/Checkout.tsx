import { useState } from 'react';
import { X, Loader2, CreditCard, AlertCircle, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import client from '../api/client';
import { CreateContributionRequest, CreateContributionResponse, ContributionStatus } from '../types/api';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

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
      setPaymentStatus('polling');
      await simulatePaymentAndPoll(contribution._id);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePaymentAndPoll = async (contribId: string) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        const statusResponse = await client.get(`/contributions/${contribId}/status`);
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
      } catch (err: any) {
        console.error('Failed to check contribution status:', err);
      }
    }

    setPaymentStatus('idle');
    setError('Payment is taking longer than expected. Please check your contribution history.');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}
    >
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary to-purple-600 text-white p-6">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Complete Your Pledge</h2>
              <p className="text-white/80 text-sm">Support "{projectTitle}"</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Pledge Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Reward</span>
              <span className="font-medium text-gray-900 dark:text-white">{rewardTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currency.toUpperCase()} {amount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-primary">
                {currency.toUpperCase()} {amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Status Messages */}
          {paymentStatus === 'succeeded' && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
                Payment successful! Thank you for your support. 🎉
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'polling' && (
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                Processing your payment securely...
              </AlertDescription>
            </Alert>
          )}

          {/* Security Badge */}
          {paymentStatus === 'idle' && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure payment powered by Stripe</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
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
            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : paymentStatus === 'succeeded' ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed!
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
