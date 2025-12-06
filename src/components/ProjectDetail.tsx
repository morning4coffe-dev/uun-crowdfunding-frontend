import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Share2, Heart, MapPin, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Project } from '../App';
import client from '../api/client';
import { mapApiProjectToUiProject } from '../utils/mappers';
import { Checkout } from './Checkout';
import { useAuth } from '../context/AuthContext';
import type { Project as ApiProject } from '../types/api';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [apiProject, setApiProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'rewards' | 'updates'>('about');
  const [showCheckout, setShowCheckout] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <p className="mt-4">Project not found</p>
      </div>
    );
  }

  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;

  const handlePledge = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedReward) {
      setShowCheckout(true);
    } else {
      alert('Please select a reward tier');
    }
  };

  const handleCheckoutSuccess = async () => {
    // Refresh project data to show updated stats
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to projects
      </button>

      {/* Project Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
            {project.category}
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <h1>{project.title}</h1>
        <p className="text-gray-700">{project.shortDescription}</p>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>By {project.creator}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Project Image/Video */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-xl overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Funding Stats */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-primary">${project.currentFunding.toLocaleString()}</div>
            <p className="text-gray-600">pledged of ${project.fundingGoal.toLocaleString()}</p>
          </div>
          <div>
            <div className="text-primary">{project.backerCount}</div>
            <p className="text-gray-600">backers</p>
          </div>
          <div>
            <div className="text-primary">{project.daysLeft}</div>
            <p className="text-gray-600">days to go</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
          ></div>
        </div>

        <button
          onClick={() => {
            if (selectedReward) {
              handlePledge();
            } else {
              const rewardsSection = document.getElementById('rewards-mobile') || document.getElementById('rewards-desktop');
              if (rewardsSection) {
                rewardsSection.scrollIntoView({ behavior: 'smooth' });
                setActiveTab('rewards');
              }
            }
          }}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {selectedReward ? 'Continue to Checkout' : 'Back this project'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {(['about', 'rewards', 'updates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 space-y-4">
          <h3>About this project</h3>
          <p className="text-gray-700">{project.description}</p>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <h3>Choose your reward</h3>
          {apiProject && apiProject.rewards.map((reward) => {
            const soldOut = isRewardSoldOut(reward);
            const remaining = reward.limit ? reward.limit - reward.backersCount : null;
            
            return (
              <div
                key={reward.id}
                onClick={() => !soldOut && setSelectedReward(reward.id)}
                className={`bg-white rounded-xl p-6 border-2 transition-all ${
                  soldOut
                    ? 'border-gray-200 opacity-60 cursor-not-allowed'
                    : selectedReward === reward.id
                    ? 'border-primary shadow-md cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-primary mb-1">
                      Pledge {reward.currency.toUpperCase()} {reward.price} or more
                    </div>
                    <h4>{reward.title}</h4>
                    {soldOut && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                        <AlertCircle className="w-3 h-3" />
                        Sold Out
                      </div>
                    )}
                    {!soldOut && remaining !== null && remaining <= 10 && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-sm">
                        Only {remaining} left!
                      </div>
                    )}
                  </div>
                  {selectedReward === reward.id && !soldOut && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{reward.backersCount} backers</span>
                    {reward.limit && (
                      <span className="text-gray-400">
                        / {reward.limit} total
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {selectedReward && !isRewardSoldOut(getSelectedRewardDetails()!) && (
            <button
              onClick={handlePledge}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue to payment
            </button>
          )}
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="mb-2">No updates yet</h4>
          <p className="text-gray-600">The creator hasn't posted any updates</p>
        </div>
      )}

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
