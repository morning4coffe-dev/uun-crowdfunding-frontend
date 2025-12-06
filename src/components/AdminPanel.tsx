import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2, FileText, Users, Package } from 'lucide-react';
import { Project } from '../App';
import client from '../api/client';
import { mapApiProjectToUiProject } from '../utils/mappers';
import { AuditLogViewer } from './AuditLogViewer';
import { UserManagement } from './UserManagement';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'audit'>('projects');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    activeProjects: 0,
  });

  const fetchStats = async () => {
    try {
      const response = await client.get('/admin/stats');
      setStats({
        totalProjects: response.data.projects.total,
        pendingProjects: response.data.projects.pending,
        activeProjects: response.data.projects.active,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/projects';
      let params: any = { limit: 50 };

      if (filter === 'pending') {
        endpoint = '/admin/projects/pending';
      } else if (filter !== 'all') {
        params.status = filter;
      } else {
        // For 'all', we might need a custom admin endpoint or just fetch active for now
        // as public API defaults to active.
        // Let's just fetch active for 'all' to avoid confusion or empty list
        params.status = 'active'; 
      }

      const response = await client.get(endpoint, { params });
      setProjects(response.data.data.map(mapApiProjectToUiProject));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const handleApprove = async (projectId: string) => {
    if (!confirm('Are you sure you want to approve this project?')) return;
    try {
      await client.post(`/admin/projects/${projectId}/publish`);
      alert(`Project approved!`);
      fetchProjects();
      fetchStats();
    } catch (error: any) {
      alert(`Failed to approve project: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReject = async (projectId: string) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (!reason) return;
    try {
      await client.post(`/admin/projects/${projectId}/reject`, { reason });
      alert(`Project rejected.`);
      fetchProjects();
      fetchStats();
    } catch (error: any) {
      alert(`Failed to reject project: ${error.response?.data?.message || error.message}`);
    }
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending Review',
      value: stats.pendingProjects,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Active Campaigns',
      value: stats.activeProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Admin Panel</h2>
        <p className="text-gray-600">Manage projects, users, and system activity</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { id: 'projects' as const, label: 'Projects', icon: Package },
            { id: 'users' as const, label: 'Users', icon: Users },
            { id: 'audit' as const, label: 'Audit Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600">{stat.label}</p>
                      <p className="mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
            {(['pending', 'active', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Projects List */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700">Project</th>
                      <th className="px-6 py-3 text-left text-gray-700">Creator</th>
                      <th className="px-6 py-3 text-left text-gray-700">Category</th>
                      <th className="px-6 py-3 text-left text-gray-700">Goal</th>
                      <th className="px-6 py-3 text-left text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <div className="text-gray-900">{project.title}</div>
                              <p className="text-gray-600 line-clamp-1">
                                {project.shortDescription}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{project.creator}</td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          ${project.fundingGoal.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full ${
                              project.status === 'pending' || project.status === 'pendingApproval'
                                ? 'bg-orange-100 text-orange-700'
                                : project.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(project.status === 'pending' || project.status === 'pendingApproval') ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(project.id)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleReject(project.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoading && projects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No projects found</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && <UserManagement />}

      {activeTab === 'audit' && <AuditLogViewer />}
    </div>
  );
}
