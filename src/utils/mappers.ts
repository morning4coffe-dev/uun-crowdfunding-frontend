import { Project as ApiProject } from '../types/api';
import { Project as UiProject } from '../App';

export function mapApiProjectToUiProject(apiProject: ApiProject): UiProject {
  const stats = apiProject.stats || ({ currentAmount: 0, backerCount: 0 } as any);
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(apiProject.deadlineAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const creatorName = typeof apiProject.ownerId === 'object' 
    ? `${apiProject.ownerId.firstName} ${apiProject.ownerId.lastName}`
    : 'Unknown';

  const creatorId = typeof apiProject.ownerId === 'object'
    ? apiProject.ownerId._id
    : apiProject.ownerId;

  return {
    id: apiProject._id,
    title: apiProject.title,
    creator: creatorName,
    creatorId: creatorId,
    description: apiProject.description,
    shortDescription: apiProject.shortDescription,
    category: apiProject.category,
    image: apiProject.images[0] || 'https://placehold.co/600x400',
    currentFunding: stats.currentAmount,
    fundingGoal: apiProject.targetAmount,
    currency: apiProject.currency || 'CZK',
    backerCount: stats.backerCount,
    daysLeft,
    status: apiProject.status.toLowerCase() as any,
    rewards: apiProject.rewards.map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      currency: r.currency || apiProject.currency || 'CZK',
      description: r.description,
      backerCount: r.backersCount,
      estimatedDelivery: 'Unknown', // Not in API reward model
    })),
    createdAt: apiProject.createdAt,
  };
}
