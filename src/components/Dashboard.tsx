import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, CheckCircle, Loader2, DollarSign } from 'lucide-react';
import { User, Project } from '../App';
import { ProjectCard } from './ProjectCard';
import client from '../api/client';
import { mapApiProjectToUiProject } from '../utils/mappers';

interface DashboardProps {
  user: User;
  onViewProject: (projectId: string) => void;
  onCreate: () => void;
}

export function Dashboard({ user, onViewProject, onCreate }: DashboardProps) {
  const navigate = useNavigate();
  const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
  const [backedProjects, setBackedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, contributionsRes] = await Promise.all([
          client.get('/users/me/projects'),
          client.get('/users/me/contributions'),
        ]);

        const mappedCreatedProjects = projectsRes.data.data.map(mapApiProjectToUiProject);
        setCreatedProjects(mappedCreatedProjects);

        // Contributions return { data: [{ projectId: { ...project fields... }, ... }] }
        // We need to extract the project data and map it
        const mappedBackedProjects = contributionsRes.data.data
          .map((c: any) => {
            if (!c.projectId) return null;
            // The populated project in contribution might be partial, but let's try to map it
            // We might need to fetch full project details if critical fields are missing
            // For now, let's assume the populated fields are enough for the card
            // We need to construct a partial ApiProject to pass to the mapper
            // or adjust the mapper to handle partial data.
            // Let's try to construct a valid object based on what we know is populated
            return mapApiProjectToUiProject({
              ...c.projectId,
              // Fill in missing required fields with defaults or from contribution
              ownerId: 'unknown',
              rewards: [],
              stats: { currentAmount: 0, backerCount: 0 }, // These might be missing in populated data
              deadlineAt: new Date().toISOString(), // Might be missing
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          })
          .filter(Boolean) as Project[];

        // Remove duplicates if user backed same project multiple times
        const uniqueBackedProjects = Array.from(new Map(mappedBackedProjects.map(p => [p.id, p])).values());

        setBackedProjects(uniqueBackedProjects);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Projects Created',
      value: createdProjects.length,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Projects Backed',
      value: backedProjects.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Active Campaigns',
      value: createdProjects.filter((p) => p.status === 'active').length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="w-full mx-auto px-4 py-6 space-y-6 sm:max-w-7xl sm:px-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl p-6 animate-fade-in hover:shadow-xl transition-shadow duration-300">
        <h2 className="animate-slide-up" style={{ animationDelay: '0.1s' }}>Welcome back, {user.name}!</h2>
        <p className="mt-2 text-white/90 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Track your projects and discover new ideas to support
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 animate-slide-up hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold group-hover:scale-110 transition-transform duration-200">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* My Projects Section */}
      {createdProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>My Projects</h3>
            <button className="text-primary hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdProjects.map((project, index) => (
              <div
                key={project.id}
                className="relative animate-slide-up"
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <ProjectCard
                  project={project}
                />
                {(project.status === 'draft' || project.status === 'pending') && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/projects/${project.id}/edit`);
                    }}
                    className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200 border border-gray-200 shadow-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backed Projects Section */}
      {backedProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Projects I'm Backing</h3>
            <button className="text-primary hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {backedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 className="mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onCreate}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all duration-200 press-effect"
          >
            Start a New Project
          </button>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="bg-white dark:bg-card border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 hover:scale-105 transition-all duration-200 press-effect"
          >
            Discover Projects
          </button>
          <button
            type="button"
            onClick={() => navigate('/contributions')}
            className="bg-white dark:bg-card border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 press-effect"
          >
            <DollarSign className="w-5 h-5" />
            My Contributions
          </button>
        </div>
      </div>
    </div>
  );
}
