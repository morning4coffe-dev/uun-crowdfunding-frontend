import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { User, Reward } from '../App';
import client from '../api/client';
import { ProjectCategory, Project as ApiProject } from '../types/api';

interface CreateProjectProps {
  user: User;
}

export function CreateProject({ user }: CreateProjectProps) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const isEditMode = Boolean(projectId);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingProject, setExistingProject] = useState<ApiProject | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    shortDescription: '',
    description: '',
    fundingGoal: '',
    duration: '30',
    imageUrl: '',
  });
  const [rewards, setRewards] = useState<Partial<Reward>[]>([]);

  useEffect(() => {
    if (isEditMode && projectId) {
      fetchProject(projectId);
    }
  }, [projectId, isEditMode]);

  const fetchProject = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await client.get(`/projects/${id}`);
      const project: ApiProject = response.data;
      
      // Check if user owns this project
      const ownerId = typeof project.ownerId === 'string' ? project.ownerId : project.ownerId._id;
      if (ownerId !== user.id && user.role !== 'admin') {
        alert('You do not have permission to edit this project');
        navigate('/');
        return;
      }

      // Populate form with existing data
      setExistingProject(project);
      setFormData({
        title: project.title,
        category: project.category.charAt(0).toUpperCase() + project.category.slice(1).toLowerCase(),
        shortDescription: project.shortDescription,
        description: project.description,
        fundingGoal: project.targetAmount.toString(),
        duration: '30', // Cannot change deadline in edit mode
        imageUrl: project.images[0] || '',
      });

      // Map rewards
      setRewards(
          project.rewards.map((r) => ({
            id: r.id,
            title: r.title,
            price: r.price,
            description: r.description,
            estimatedDelivery: '', // Not stored in backend
          }))
      );
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      alert('Failed to load project for editing');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = Object.values(ProjectCategory).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());

  const handleAddReward = () => {
    setRewards([
      ...rewards,
      {
        id: `reward-${Date.now()}`,
        title: '',
          price: 0,
        description: '',
        estimatedDelivery: '',
      },
    ]);
  };

  const handleRemoveReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const handleRewardChange = (index: number, field: string, value: any) => {
    const newRewards = [...rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setRewards(newRewards);
  };

  const handleSubmit = async () => {
    // Client-side validation to prevent invalid payloads reaching the API
    const errors: string[] = [];
    if (!formData.title || formData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (!formData.shortDescription || formData.shortDescription.trim().length < 10) {
      errors.push('Short description must be at least 10 characters');
    }
    if (!formData.description || formData.description.trim().length < 50) {
      errors.push('Description must be at least 50 characters');
    }
    const parsedFunding = parseFloat(formData.fundingGoal || '');
    if (isNaN(parsedFunding) || parsedFunding <= 0) {
      errors.push('Funding goal must be a positive number');
    }

    if (errors.length > 0) {
      alert(`Please fix the following errors:\n- ${errors.join('\n- ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Double-check client-side that the user has permission to create
      // Note: backend role name is 'founder' — frontend `user.role` maps to 'creator',
      // so check both possibilities to be safe.
      if (user.role !== 'creator' && user.role !== 'admin') {
        throw new Error('You need the Founder role to create a project.');
      }

      if (isEditMode && projectId) {
        // EDIT MODE: Update existing project
        const projectPayload = {
          title: formData.title,
          shortDescription: formData.shortDescription,
          description: formData.description,
          category: formData.category.toLowerCase(),
          targetAmount: parseFloat(formData.fundingGoal),
          images: formData.imageUrl ? [formData.imageUrl] : [],
        };

        await client.patch(`/projects/${projectId}`, projectPayload);

        // Update rewards (simplified: we don't handle reward deletion here)
        // In a full implementation, you'd sync rewards properly
        for (const reward of rewards) {
          if (reward.id && reward.id.startsWith('reward-')) {
            // New reward
            await client.post(`/projects/${projectId}/rewards`, {
              title: reward.title,
              description: reward.description,
              price: reward.price,
              limit: null,
            });
          }
          // For existing rewards, would need PATCH endpoint
        }

        // Optionally resubmit for approval if it's a draft
        if (existingProject?.status === 'draft') {
          await client.post(`/projects/${projectId}/submit`);
          alert('Project updated and submitted for review!');
        } else {
          alert('Project updated successfully!');
        }
      } else {
        // CREATE MODE: Create new project
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + parseInt(formData.duration));

        const projectPayload = {
          title: formData.title,
          shortDescription: formData.shortDescription,
          description: formData.description,
          category: formData.category.toLowerCase(),
          targetAmount: parseFloat(formData.fundingGoal),
          deadlineAt: deadline.toISOString(),
          images: formData.imageUrl ? [formData.imageUrl] : [],
        };

        const projectRes = await client.post('/projects', projectPayload);
        const newProjectId = projectRes.data._id;

        // Add Rewards
        for (const reward of rewards) {
          await client.post(`/projects/${newProjectId}/rewards`, {
            title: reward.title,
            description: reward.description,
            price: reward.price,
            limit: null,
          });
        }

        // Submit for Approval
        await client.post(`/projects/${newProjectId}/submit`);

        alert('Project submitted for review! An administrator will review it soon.');
      }

      navigate('/');
    } catch (error: any) {
      console.error('Failed to save project:', error);
      alert(`Failed to save project: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">
          {isLoading ? 'Loading project...' : isEditMode ? 'Updating your project...' : 'Creating your project...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Warning for non-founders */}
      {user.role !== 'creator' && user.role !== 'admin' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need the <strong>Founder</strong> role to create a project. 
                Please contact an administrator to upgrade your account, or the submission will fail.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s === step
                  ? 'bg-primary text-white'
                  : s < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 space-y-6">
        {step === 1 && (
          <>
            <div>
              <h2 className="mb-2">{isEditMode ? 'Edit Project Basics' : 'Project Basics'}</h2>
              <p className="text-gray-600">
                {isEditMode ? 'Update the essential details about your project' : 'Start with the essential details about your project'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a clear, compelling title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief tagline (max 100 characters)"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project in detail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Cover Image URL</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500">
                    Provide a direct URL to your project cover image.
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="mb-2">Funding Details</h2>
              <p className="text-gray-600">Set your funding goal and campaign duration</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-gray-700">Funding Goal (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    placeholder="10000"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Campaign Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2">Reward Tiers</h2>
                <p className="text-gray-600">Create rewards to incentivize backers</p>
              </div>
              <button
                onClick={handleAddReward}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Reward
              </button>
            </div>

            <div className="space-y-4">
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rewards added yet. Click "Add Reward" to create one.
                </div>
              ) : (
                rewards.map((reward, index) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Reward {index + 1}</span>
                      <button
                        onClick={() => handleRemoveReward(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-gray-600">Pledge Amount ($)</label>
                        <input
                          type="number"
                          value={reward.price || ''}
                          onChange={(e) =>
                            handleRewardChange(index, 'price', parseFloat(e.target.value))
                          }
                          placeholder="25"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-gray-600">Estimated Delivery</label>
                        <input
                          type="text"
                          value={reward.estimatedDelivery || ''}
                          onChange={(e) =>
                            handleRewardChange(index, 'estimatedDelivery', e.target.value)
                          }
                          placeholder="Jan 2026"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-gray-600">Reward Title</label>
                      <input
                        type="text"
                        value={reward.title || ''}
                        onChange={(e) => handleRewardChange(index, 'title', e.target.value)}
                        placeholder="Early Bird Special"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-gray-600">Description</label>
                      <textarea
                        value={reward.description || ''}
                        onChange={(e) => handleRewardChange(index, 'description', e.target.value)}
                        placeholder="What backers will receive..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            // Disable submit for users who are not founders/admins
            (() => {
              const canCreate = user.role === 'creator' || user.role === 'admin';
              return (
                <button
                  onClick={() => canCreate && handleSubmit()}
                  disabled={!canCreate || isSubmitting}
                  title={canCreate ? 'Submit project for review' : 'You need the Founder role to create a project.'}
                  className={`bg-primary text-white px-6 py-2 rounded-lg transition-colors ${
                    !canCreate || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                  }`}
                >
                  Submit for Review
                </button>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
