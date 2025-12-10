import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  Share2,
  Heart,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { Project } from '../App';
import client from '../api/client';
import { mapApiProjectToUiProject } from '../utils/mappers';
import { Checkout } from './Checkout';
import { useAuth } from '../context/AuthContext';
import type { Project as ApiProject } from '../types/api';
import { toast } from 'sonner';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [apiProject, setApiProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setApiProject(null);
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await client.get(`/projects/${projectId}`);
        const apiData = response.data;
        setApiProject(apiData);
        setProject(mapApiProjectToUiProject(apiData));
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/discover');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title,
          text: project?.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-6">This project may have been removed or doesn't exist.</p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to projects
        </button>
      </div>
    );
  }

  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;
  const isFunded = fundingPercentage >= 100;

  const handlePledge = () => {
    if (!user) {
      toast.error('Please sign in to back this project');
      navigate('/login');
      return;
    }
    if (selectedReward) {
      setShowCheckout(true);
    } else {
      toast.info('Please select a reward tier first');
      document.getElementById('rewards-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckoutSuccess = async () => {
    if (projectId) {
      try {
        const response = await client.get(`/projects/${projectId}`);
        const apiData = response.data;
        setApiProject(apiData);
        setProject(mapApiProjectToUiProject(apiData));
      } catch (error) {
        console.error('Failed to refresh project:', error);
      }
    }
  };

  const getSelectedRewardDetails = () => {
    if (!selectedReward || !apiProject) return null;
    return apiProject.rewards.find((r) => r.id === selectedReward);
  };

  const isRewardSoldOut = (reward: any) => {
    if (!reward.limit) return false;
    return reward.backersCount >= reward.limit;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${isFavorited
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all duration-200 hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 dark:bg-card/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            {project.category}
          </span>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 animate-slide-up">
              {project.title}
            </h1>
            <p className="text-white/90 text-sm max-w-2xl wrap-anywhere" style={{ animationDelay: '0.1s' }}>
              {project.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>

        {/* Funding Card */}
        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {fundingPercentage.toFixed(0)}% funded
              </span>
              {isFunded && (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium animate-pulse-subtle">
                  <CheckCircle2 className="w-4 h-4" />
                  Funded!
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(fundingPercentage, 100)}%`,
                  background: isFunded
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between gap-2 mb-5 py-4 border-y border-gray-100 dark:border-gray-700">
            <div className="flex-1 text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                ${project.currentFunding.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">of ${project.fundingGoal.toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {project.backerCount}
              </div>
              <p className="text-xs text-gray-500">backers</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {project.daysLeft}
              </div>
              <p className="text-xs text-gray-500">days left</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handlePledge}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl text-lg md:text-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 press-effect"
            style={{ minHeight: 56 }}
          >
            {selectedReward ? (
              <>
                Continue to Checkout
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Back this project
              </>
            )}
          </button>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-4 bg-white dark:bg-card rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {project.creator.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Created by {project.creator}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Launched {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            About this project
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line wrap-anywhere">
            {project.description}
          </p>
        </div>

        {/* Rewards Section */}
        <div id="rewards-section" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Select your reward
          </h2>

          {apiProject && apiProject.rewards.length === 0 && (
            <div className="bg-white dark:bg-card rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reward tiers available yet</p>
            </div>
          )}

          {apiProject && apiProject.rewards.map((reward, index) => {
            const soldOut = isRewardSoldOut(reward);
            const remaining = reward.limit ? reward.limit - reward.backersCount : null;
            const isSelected = selectedReward === reward.id;

            return (
              <div
                key={reward.id}
                onClick={() => { if (!soldOut) setSelectedReward(reward.id); }}
                className={`relative bg-white dark:bg-card rounded-2xl p-6 md:p-7 border-2 transition-all duration-300 animate-slide-up ${soldOut
                  ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                  : isSelected
                    ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02] cursor-pointer'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md cursor-pointer'
                  }`}
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                {/* Selected Indicator */}
                {isSelected && !soldOut && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Sold Out Overlay */}
                {soldOut && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Sold Out
                  </div>
                )}

                {/* Low Stock Warning */}
                {!soldOut && remaining !== null && remaining <= 10 && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse-subtle">
                    Only {remaining} left!
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Price Badge */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500 uppercase">{reward.currency}</span>
                    <span className="text-3xl md:text-4xl font-bold text-primary">{reward.price}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg md:text-xl">
                      {reward.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 wrap-anywhere">
                      {reward.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {reward.backersCount} backers
                      </span>
                      {reward.limit && (
                        <span className="text-gray-400">
                          {reward.limit - reward.backersCount} of {reward.limit} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continue Button */}
          {selectedReward && !isRewardSoldOut(getSelectedRewardDetails()!) && (
            <button
              onClick={handlePledge}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl text-lg md:text-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 animate-fade-in press-effect"
              style={{ minHeight: 56 }}
            >
              Continue with {getSelectedRewardDetails()?.currency.toUpperCase()} {getSelectedRewardDetails()?.price} pledge
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedReward && apiProject && (
        <Checkout
          projectId={apiProject._id}
          projectTitle={apiProject.title}
          rewardId={selectedReward}
          rewardTitle={getSelectedRewardDetails()?.title || 'Selected Reward'}
          amount={getSelectedRewardDetails()?.price || 0}
          currency={getSelectedRewardDetails()?.currency || 'usd'}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
