import { useMemo } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ProjectDiscovery } from './components/ProjectDiscovery';
import { ProjectDetail } from './components/ProjectDetail';
import { CreateProject } from './components/CreateProject';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { ContributionList } from './components/ContributionList';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Loader2 } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import type { ReactNode } from 'react';

export interface Reward {
  id: string;
  title: string;
  amount: number;
  description: string;
  backerCount: number;
  estimatedDelivery: string;
}

export interface Project {
  id: string;
  title: string;
  creator: string;
  creatorId: string;
  description: string;
  shortDescription: string;
  category: string;
  image: string;
  video?: string;
  currentFunding: number;
  fundingGoal: number;
  backerCount: number;
  daysLeft: number;
  status: 'draft' | 'pending' | 'active' | 'funded' | 'ended';
  rewards: Reward[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'creator' | 'backer' | 'admin' | 'both';
  createdProjects: string[];
  backedProjects: string[];
  stats?: {
    totalContributed: number;
    totalProjectsOwned: number;
  };
}

export default function App() {
  const { user, isLoading } = useAuth();

  const mappedUser = useMemo(() => {
    if (!user) {
      return null;
    }

    let role: User['role'] = 'backer';
    if (user.roles.includes('admin')) {
      role = 'admin';
    } else if (user.roles.includes('founder')) {
      role = 'creator';
    }

    return {
      id: user._id,
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      role,
      createdProjects: [],
      backedProjects: [],
      stats: user.stats,
    } satisfies User;
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {mappedUser ? (
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route element={<AppLayout user={mappedUser} />}>
            <Route index element={<DashboardRoute user={mappedUser} />} />
            <Route path="discover" element={<ProjectDiscovery />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="create" element={<CreateProject user={mappedUser} />} />
            <Route path="projects/:projectId/edit" element={<CreateProject user={mappedUser} />} />
            <Route path="profile" element={<UserProfile user={mappedUser} />} />
            <Route path="contributions" element={<ContributionList />} />
            <Route
              path="admin"
              element={
                <RequireAdmin userRole={mappedUser.role}>
                  <AdminPanel />
                </RequireAdmin>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
}

function DashboardRoute({ user }: { user: any }) {
  const navigate = useNavigate();

  const handleCreate = () => navigate('/create');
  const handleViewProject = (projectId: string) => navigate(`/projects/${projectId}`);

  return <Dashboard user={user} onCreate={handleCreate} onViewProject={handleViewProject} />;
}

function AppLayout({ user }: { user: User }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header userRole={user.role} />
      <main className="w-full">
        <Outlet />
      </main>
      <BottomNav userRole={user.role} />
    </div>
  );
}

function RequireAdmin({ userRole, children }: { userRole: User['role']; children: ReactNode }) {
  if (userRole !== 'admin' && userRole !== 'both') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
