import { Project as ApiProject } from '../types/api';
import { Project as UiProject } from '../App';

export function mapApiProjectToUiProject(apiProject: ApiProject): UiProject {
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
    currentFunding: apiProject.stats.currentAmount,
    fundingGoal: apiProject.targetAmount,
    backerCount: apiProject.stats.backerCount,
    daysLeft,
    status: apiProject.status.toLowerCase() as any,
    rewards: apiProject.rewards.map((r) => ({
      id: r.id,
      title: r.title,
      amount: r.price,
      description: r.description,
      backerCount: r.backersCount,
      estimatedDelivery: 'Unknown', // Not in API reward model
    })),
    createdAt: apiProject.createdAt,
  };
}
