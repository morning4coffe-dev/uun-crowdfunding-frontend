export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  favorites?: string[];
  stats: {
    totalContributed: number;
    totalProjectsOwned: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  limit: number | null;
  backersCount: number;
}

export enum ProjectCategory {
  TECHNOLOGY = 'technology',
  DESIGN = 'design',
  ART = 'art',
  MUSIC = 'music',
  FILM = 'film',
  GAMES = 'games',
  PUBLISHING = 'publishing',
  FOOD = 'food',
  FASHION = 'fashion',
  OTHER = 'other',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pendingApproval',
  ACTIVE = 'active',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export interface Project {
  _id: string;
  ownerId: string | { _id: string; firstName: string; lastName: string };
  title: string;
  shortDescription: string;
  description: string;
  category: ProjectCategory;
  images: string[];
  targetAmount: number;
  currency: string;
  status: ProjectStatus;
  stats: {
    currentAmount: number;
    backerCount: number;
  };
  rewards: Reward[];
  publishedAt: string | null;
  deadlineAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fundingProgress: number;
  isFunded: boolean;
}

export enum ContributionStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  GOPAY = 'gopay',
}

export interface PaymentInfo {
  provider: PaymentProvider;
  intentId: string;
  chargeId?: string;
  raw?: {
    method?: string;
    brand?: string;
    last4?: string;
    [key: string]: unknown;
  };
}

export interface Contribution {
  _id: string;
  userId: string | null;
  projectId: string | Project;
  rewardId: string | null;
  amount: number;
  currency: string;
  status: ContributionStatus;
  payment?: PaymentInfo;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContributionRequest {
  projectId: string;
  rewardId?: string | null;
  amount: number;
  currency: string;
}

export interface CreateContributionResponse {
  contribution: Contribution;
  clientSecret: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}
