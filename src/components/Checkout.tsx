import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CreditCard, AlertCircle, CheckCircle2, Shield, X } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import client from '../api/client';
import { usePayment } from '../context/PaymentContext';
import { CreateContributionRequest, CreateContributionResponse } from '../types/api';
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

export function Checkout(props: CheckoutProps) {
  const { stripePromise } = usePayment();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const createContribution = async () => {
      try {
        const payload: CreateContributionRequest = {
          projectId: props.projectId,
          rewardId: props.rewardId,
          amount: props.amount,
          currency: props.currency,
        };

        const response = await client.post<CreateContributionResponse>('/contributions', payload);

        if (isMounted) {
          setClientSecret(response.data.clientSecret);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    createContribution();

    return () => {
      isMounted = false;
    };
  }, [props.projectId, props.rewardId, props.amount, props.currency]);

  if (isLoading) {
    return (
      <CheckoutModal onClose={props.onClose} isProcessing={true}>
        <CheckoutHeader projectTitle={props.projectTitle} onClose={props.onClose} isProcessing={true} />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Initializing payment...</span>
        </div>
      </CheckoutModal>
    );
  }

  if (error) {
    return (
      <CheckoutModal onClose={props.onClose} isProcessing={false}>
        <CheckoutHeader projectTitle={props.projectTitle} onClose={props.onClose} isProcessing={false} />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={props.onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </CheckoutModal>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

interface CheckoutFormProps extends CheckoutProps {}

function CheckoutForm({
  projectId,
  projectTitle,
  rewardId,
  rewardTitle,
  amount,
  currency,
  onClose,
  onSuccess,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/contributions`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setPaymentStatus('failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        setPaymentStatus('processing');
      } else {
        setError('Payment failed. Please try again.');
        setPaymentStatus('failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CheckoutModal onClose={onClose} isProcessing={isProcessing}>
      <CheckoutHeader projectTitle={projectTitle} onClose={onClose} isProcessing={isProcessing} />

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

        {/* Stripe Payment Element */}
        {paymentStatus !== 'succeeded' && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />
          </div>
        )}

        {/* Payment Status Messages */}
        {paymentStatus === 'succeeded' && (
          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
              Payment successful! Thank you for your support.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Badge */}
        {paymentStatus === 'idle' && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure payment powered by Stripe</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || isProcessing || paymentStatus === 'succeeded'}
            className="flex-1"
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
      </form>
    </CheckoutModal>
  );
}

// Reusable Modal Wrapper
function CheckoutModal({
  children,
  onClose,
  isProcessing
}: {
  children: React.ReactNode;
  onClose: () => void;
  isProcessing: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Header Component
function CheckoutHeader({
  projectTitle,
  onClose,
  isProcessing
}: {
  projectTitle: string;
  onClose: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="relative bg-primary text-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Complete Payment</h2>
            <p className="text-white/70 text-sm truncate max-w-[200px]">{projectTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
