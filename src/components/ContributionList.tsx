import { useState, useEffect } from 'react';
import {
  Loader2,
  DollarSign,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Filter,
  Search
} from 'lucide-react';
import client from '../api/client';
import { Contribution, ContributionStatus, Project as ApiProject } from '../types/api';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ContributionDetail } from './ContributionDetail';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function ContributionList() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | 'all'>('all');

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

  const getStatusConfig = (status: ContributionStatus) => {
    const configs: Record<ContributionStatus, {
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon: any;
      label: string;
      bgColor: string;
      textColor: string;
    }> = {
      [ContributionStatus.INITIATED]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Initiated',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
      },
      [ContributionStatus.PENDING]: {
        variant: 'secondary',
        icon: Clock,
        label: 'Pending',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-400',
      },
      [ContributionStatus.SUCCEEDED]: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Succeeded',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-400',
      },
      [ContributionStatus.FAILED]: {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Failed',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-400',
      },
      [ContributionStatus.REFUNDED]: {
        variant: 'outline',
        icon: AlertCircle,
        label: 'Refunded',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-400',
      },
    };

    return configs[status];
  };

  const getStatusBadge = (status: ContributionStatus) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.bgColor} ${config.textColor} border-0`}>
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

  const getProjectImage = (contribution: Contribution): string | null => {
    if (typeof contribution.projectId === 'object') {
      const project = contribution.projectId as ApiProject;
      return project.images?.[0] || null;
    }
    return null;
  };

  const handleRefreshAfterUpdate = () => {
    fetchContributions();
    setSelectedContribution(null);
  };

  // Filter contributions
  const filteredContributions = contributions.filter(c => {
    const matchesSearch = searchTerm === '' ||
      getProjectTitle(c).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalAmount = contributions
    .filter(c => c.status === ContributionStatus.SUCCEEDED)
    .reduce((sum, c) => sum + c.amount, 0);

  const successfulCount = contributions.filter(c => c.status === ContributionStatus.SUCCEEDED).length;
  const pendingCount = contributions.filter(c => c.status === ContributionStatus.PENDING).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading your contributions...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Contributions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your project contributions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-0 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Contributed</p>
                  <p className="text-3xl font-bold text-primary">${totalAmount.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Successful</p>
                  <p className="text-3xl font-bold text-green-600">{successfulCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-0 animate-slide-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contributions..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(['all', ...Object.values(ContributionStatus)] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap transition-all duration-200 ${statusFilter === status ? 'scale-105' : 'hover:scale-105'
                  }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Contributions List */}
        {filteredContributions.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-10 h-10 text-gray-400" />
              </div>
              <CardTitle className="mb-2 text-center">
                {contributions.length === 0 ? 'No contributions yet' : 'No matching contributions'}
              </CardTitle>
              <CardDescription className="text-center max-w-sm">
                {contributions.length === 0
                  ? 'Start supporting projects to see your contributions here. Every contribution helps bring amazing ideas to life!'
                  : 'Try adjusting your search or filter criteria.'}
              </CardDescription>
              {contributions.length === 0 && (
                <Button className="mt-4 animate-pulse-subtle" onClick={() => window.location.href = '/discover'}>
                  Discover Projects
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContributions.map((contribution, index) => {
              const statusConfig = getStatusConfig(contribution.status);
              const projectImage = getProjectImage(contribution);

              return (
                <Card
                  key={contribution._id}
                  className="cursor-pointer overflow-hidden group animate-slide-up hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                  onClick={() => setSelectedContribution(contribution)}
                >
                  <div className="flex">
                    {/* Project Image */}
                    <div className="hidden sm:block w-32 h-32 bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                      {projectImage ? (
                        <img
                          src={projectImage}
                          alt={getProjectTitle(contribution)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                            {getProjectTitle(contribution)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(contribution.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        {getStatusBadge(contribution.status)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-lg ${statusConfig.bgColor}`}>
                            <span className="text-2xl font-bold text-primary">
                              {contribution.currency.toUpperCase()} {contribution.amount.toLocaleString()}
                            </span>
                          </div>
                          {contribution.paidAt && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Paid {new Date(contribution.paidAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <button className="text-primary hover:text-primary/80 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:translate-x-1">
                          View Details
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator for pending */}
                  {contribution.status === ContributionStatus.PENDING && (
                    <div className="h-1 bg-gray-100 dark:bg-gray-800">
                      <div className="h-full bg-yellow-500 animate-progress-indeterminate"></div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Footer */}
        {contributions.length > 0 && (
          <div className="text-center text-sm text-gray-500 animate-fade-in pt-4">
            Showing {filteredContributions.length} of {contributions.length} contributions
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
