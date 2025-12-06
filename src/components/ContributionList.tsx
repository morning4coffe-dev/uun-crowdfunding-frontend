import { useState, useEffect } from 'react';
import { Loader2, DollarSign, Calendar, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import client from '../api/client';
import { Contribution, ContributionStatus, Project as ApiProject } from '../types/api';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ContributionDetail } from './ContributionDetail';

export function ContributionList() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    setIsLoading(true);
    try {
      const response = await client.get('/users/me/contributions');
      setContributions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch contributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const variants: Record<ContributionStatus, { variant: any; icon: any; label: string }> = {
      [ContributionStatus.INITIATED]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Initiated',
      },
      [ContributionStatus.PENDING]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Pending',
      },
      [ContributionStatus.SUCCEEDED]: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Succeeded',
      },
      [ContributionStatus.FAILED]: {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Failed',
      },
      [ContributionStatus.REFUNDED]: {
        variant: 'outline',
        icon: AlertCircle,
        label: 'Refunded',
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

  const getProjectTitle = (contribution: Contribution): string => {
    if (typeof contribution.projectId === 'object') {
      return (contribution.projectId as ApiProject).title;
    }
    return 'Unknown Project';
  };

  const handleRefreshAfterUpdate = () => {
    fetchContributions();
    setSelectedContribution(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">My Contributions</h2>
            <p className="text-gray-600 mt-1">
              View and manage your project contributions
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Total: {contributions.length}
          </div>
        </div>

        {contributions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
              <CardTitle className="mb-2">No contributions yet</CardTitle>
              <CardDescription>
                Start supporting projects to see your contributions here
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contributions.map((contribution) => (
              <Card
                key={contribution._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedContribution(contribution)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {getProjectTitle(contribution)}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(contribution.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(contribution.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="text-xl font-semibold text-primary">
                        {contribution.currency.toUpperCase()} {contribution.amount.toLocaleString()}
                      </span>
                    </div>
                    <button className="text-primary hover:underline flex items-center gap-1">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  {contribution.paidAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      Paid on {new Date(contribution.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <ContributionDetail
          contributionId={selectedContribution._id}
          onClose={() => setSelectedContribution(null)}
          onUpdate={handleRefreshAfterUpdate}
        />
      )}
    </>
  );
}
