import { Mail, MapPin, Calendar, Edit2, CreditCard, Bell, LogOut, Shield, Moon, Sun, TrendingUp, Folder, Heart, Loader2 } from 'lucide-react';
import { User } from '../App';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useSettings } from '../context/SettingsContext';
import client from '../api/client';
import { Contribution, ContributionStatus, Project as ApiProject } from '../types/api';

interface UserProfileProps {
  user: User;
}

interface Activity {
  id: string;
  type: 'contribution' | 'project_created' | 'project_updated';
  title: string;
  projectTitle: string;
  amount?: number;
  currency?: string;
  date: string;
}

export function UserProfile({ user }: UserProfileProps) {
  const { user: authUser, logout, checkAuth } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, setTheme, notificationSettings, updateNotificationSettings, location, setLocation } = useSettings();
  const navigate = useNavigate();

  // Edit Profile state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (authUser) {
      setEditForm({
        firstName: authUser.firstName,
        lastName: authUser.lastName
      });
    }
  }, [authUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await client.patch('/users/me', editForm);
      await checkAuth();
      toast.success('Profile updated successfully');
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Real data states
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [totalPledged, setTotalPledged] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoadingStats(true);
    try {
      // Fetch contributions and projects in parallel
      const [contribResponse, projectsResponse] = await Promise.all([
        client.get('/users/me/contributions'),
        client.get('/users/me/projects'),
      ]);

      const contribData = contribResponse.data.data || [];
      const projectsData = projectsResponse.data.data || [];

      setContributions(contribData);
      setProjects(projectsData);

      // Calculate total pledged from successful contributions
      const total = contribData
        .filter((c: Contribution) => c.status === ContributionStatus.SUCCEEDED)
        .reduce((sum: number, c: Contribution) => sum + c.amount, 0);
      setTotalPledged(total);

      // Build recent activity from contributions and projects
      const recentActivities: Activity[] = [];

      // Add contributions as activities
      contribData.slice(0, 5).forEach((c: Contribution) => {
        const projectTitle = typeof c.projectId === 'object'
          ? (c.projectId as ApiProject).title
          : 'Unknown Project';

        recentActivities.push({
          id: c._id,
          type: 'contribution',
          title: `Backed "${projectTitle}"`,
          projectTitle,
          amount: c.amount,
          currency: c.currency,
          date: c.createdAt,
        });
      });

      // Add projects as activities
      projectsData.slice(0, 3).forEach((p: ApiProject) => {
        recentActivities.push({
          id: p._id,
          type: 'project_created',
          title: `Created "${p.title}"`,
          projectTitle: p.title,
          date: p.createdAt,
        });
      });

      // Sort by date
      recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(recentActivities.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogoutAndNavigate = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      navigate('/login');
    }
  };

  const handleFakePaymentManage = () => {
    toast.info('Payment methods are managed during checkout for this demo.');
  };

  const handleLocationSave = () => {
    toast.success('Location updated');
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'both':
        return 'Creator & Backer';
      case 'admin':
        return 'Administrator';
      case 'founder':
        return 'Creator';
      case 'backer':
        return 'Backer';
      default:
        return role;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'contribution':
        return <Heart className="w-3 h-3" />;
      case 'project_created':
        return <Folder className="w-3 h-3" />;
      case 'project_updated':
        return <Edit2 className="w-3 h-3" />;
      default:
        return <TrendingUp className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0 animate-scale-in">
            <span className="text-3xl">{user.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="mb-1">{user.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {getRoleDisplay(user.role)}
              </span>
              {(user.role === 'admin' || user.role === 'both') && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-slide-up group"
          onClick={() => navigate('/contributions')}
          style={{ animationDelay: '0.1s' }}
        >
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          ) : (
            <>
              <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-200">
                {projects.length}
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Folder className="w-4 h-4" />
                Projects Created
              </p>
            </>
          )}
        </div>
        <div
          className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-slide-up group"
          onClick={() => navigate('/contributions')}
          style={{ animationDelay: '0.2s' }}
        >
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          ) : (
            <>
              <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-200">
                {contributions.filter(c => c.status === ContributionStatus.SUCCEEDED).length}
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Projects Backed
              </p>
            </>
          )}
        </div>
        <div
          className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-slide-up group"
          onClick={() => navigate('/contributions')}
          style={{ animationDelay: '0.3s' }}
        >
          {isLoadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          ) : (
            <>
              <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-200">
                {totalPledged.toLocaleString()}
              </div>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Pledged
              </p>
            </>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <h3>Account Settings</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Theme</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          <button
            type="button"
            onClick={handleFakePaymentManage}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-gray-900">Payment Methods</div>
                <p className="text-gray-600">Manage your cards and payment options</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <div className="px-6 py-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <div className="text-gray-900 mb-1">Notifications</div>
                <p className="text-gray-600 mb-3">Configure your notification preferences</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailBackedProjects}
                      onChange={(e) => updateNotificationSettings({ emailBackedProjects: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary transition-all duration-200"
                    />
                    <span className="group-hover:text-primary transition-colors">Email updates about backed projects</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailCreatedProjects}
                      onChange={(e) => updateNotificationSettings({ emailCreatedProjects: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary transition-all duration-200"
                    />
                    <span className="group-hover:text-primary transition-colors">Email updates about your own projects</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notificationSettings.productUpdates}
                      onChange={(e) => updateNotificationSettings({ productUpdates: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary transition-all duration-200"
                    />
                    <span className="group-hover:text-primary transition-colors">Product news and feature updates</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex items-start gap-3 border-t border-gray-200">
            <MapPin className="w-5 h-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <div className="text-gray-900 mb-1">Location</div>
              <p className="text-gray-600 mb-3">Update your address and region</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="flex-1 rounded-lg rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleLocationSave} className="hover:scale-105 h-9 transition-transform duration-200">
                  Save
                </Button>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors text-red-600">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Sign Out</div>
                    <p className="text-red-600/80">Sign out from your account</p>
                  </div>
                </div>
                <span className="text-red-400">›</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogoutAndNavigate} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 className="mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        {isLoadingStats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity yet</p>
            <p className="text-sm mt-1">Start backing or creating projects!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0 animate-slide-up hover:bg-gray-50 dark:hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                onClick={() => navigate('/contributions')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'contribution' ? 'bg-pink-100 text-pink-600' :
                    activity.type === 'project_created' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                  }`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>{getRelativeTime(activity.date)}</span>
                    {activity.amount && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">
                          {activity.currency?.toUpperCase()} {activity.amount.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
