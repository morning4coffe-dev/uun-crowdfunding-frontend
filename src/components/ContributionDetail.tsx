import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, AlertCircle, CheckCircle2, Clock, CreditCard, RefreshCw } from 'lucide-react';
import client from '../api/client';
import { Contribution, ContributionStatus, Project as ApiProject } from '../types/api';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ContributionDetailProps {
  contributionId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ContributionDetail({ contributionId, onClose, onUpdate }: ContributionDetailProps) {
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchContribution();
  }, [contributionId]);

  const fetchContribution = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get(`/contributions/${contributionId}`);
      setContribution(response.data);
    } catch (err: any) {
      console.error('Failed to fetch contribution:', err);
      setError(err.response?.data?.message || 'Failed to load contribution details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!contribution) return;

    setIsRefunding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await client.post(`/contributions/${contribution._id}/refund`);
      setSuccess(response.data.message || 'Refund request submitted successfully');
      setContribution(response.data.contribution);
      setShowRefundDialog(false);
      
      // Notify parent to refresh list
      if (onUpdate) {
        setTimeout(onUpdate, 2000);
      }
    } catch (err: any) {
      console.error('Refund failed:', err);
      setError(err.response?.data?.message || 'Failed to process refund request');
      setShowRefundDialog(false);
    } finally {
      setIsRefunding(false);
    }
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const variants: Record<ContributionStatus, { variant: any; icon: any; label: string; color: string }> = {
      [ContributionStatus.INITIATED]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Initiated',
        color: 'text-gray-600',
      },
      [ContributionStatus.PENDING]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Pending',
        color: 'text-yellow-600',
      },
      [ContributionStatus.SUCCEEDED]: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Succeeded',
        color: 'text-green-600',
      },
      [ContributionStatus.FAILED]: {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Failed',
        color: 'text-red-600',
      },
      [ContributionStatus.REFUNDED]: {
        variant: 'outline',
        icon: RefreshCw,
        label: 'Refunded',
        color: 'text-blue-600',
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getProjectTitle = (): string => {
    if (!contribution) return 'Unknown Project';
    if (typeof contribution.projectId === 'object') {
      return (contribution.projectId as ApiProject).title;
    }
    return 'Unknown Project';
  };

  const canRequestRefund = () => {
    if (!contribution) return false;
    return contribution.status === ContributionStatus.SUCCEEDED;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Error</CardTitle>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Contribution not found'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <Card className="w-full max-w-2xl my-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">Contribution Details</CardTitle>
                <CardDescription className="mt-2">
                  {getProjectTitle()}
                </CardDescription>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Messages */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Amount and Status */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contribution Amount</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <span className="text-3xl font-bold text-primary">
                      {contribution.currency.toUpperCase()} {contribution.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                {getStatusBadge(contribution.status)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Contribution ID</p>
                <p className="font-mono text-sm">{contribution._id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {new Date(contribution.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {contribution.paidAt && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="font-medium">
                    {new Date(contribution.paidAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {contribution.rewardId && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Reward</p>
                  <p className="font-medium">Selected</p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            {contribution.payment && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-medium capitalize">{contribution.payment.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Intent</span>
                    <span className="font-mono text-sm">{contribution.payment.intentId}</span>
                  </div>
                  {contribution.payment.chargeId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Charge ID</span>
                      <span className="font-mono text-sm">{contribution.payment.chargeId}</span>
                    </div>
                  )}
                  {contribution.payment.raw?.brand && contribution.payment.raw?.last4 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card</span>
                      <span className="font-medium">
                        {contribution.payment.raw.brand} •••• {contribution.payment.raw.last4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 border-t pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {canRequestRefund() && (
              <Button
                variant="destructive"
                onClick={() => setShowRefundDialog(true)}
                disabled={isRefunding}
                className="flex-1"
              >
                {isRefunding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Refund'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to request a refund for this contribution? This action cannot be undone and
              will be subject to review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} className="bg-red-600 hover:bg-red-700">
              Confirm Refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
