import { Mail, MapPin, Calendar, Edit2, CreditCard, Bell, LogOut, Shield, Moon, Sun } from 'lucide-react';
import { User } from '../App';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
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
import { toast } from 'sonner';
import { useSettings } from '../context/SettingsContext';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, setTheme, notificationSettings, updateNotificationSettings, location, setLocation } = useSettings();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Component will unmount after logout, no need for cleanup
  };

  const navigate = useNavigate();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
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
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">{user.stats?.totalProjectsOwned ?? user.createdProjects.length}</div>
          <p className="text-gray-600">Projects Created</p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">{user.stats?.totalContributed ?? user.backedProjects.length}</div>
          <p className="text-gray-600">Projects Backed</p>
        </div>
        <div className="bg-white dark:bg-card rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">$0</div>
          <p className="text-gray-600">Total Pledged</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <h3>Account Settings</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Theme</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailBackedProjects}
                      onChange={(e) => updateNotificationSettings({ emailBackedProjects: e.target.checked })}
                    />
                    <span>Email updates about backed projects</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailCreatedProjects}
                      onChange={(e) => updateNotificationSettings({ emailCreatedProjects: e.target.checked })}
                    />
                    <span>Email updates about your own projects</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notificationSettings.productUpdates}
                      onChange={(e) => updateNotificationSettings({ productUpdates: e.target.checked })}
                    />
                    <span>Product news and feature updates</span>
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
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleLocationSave}>
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
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-gray-900">Backed "Smart Garden System"</p>
              <p className="text-gray-600">2 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-gray-900">Updated "Eco-Friendly Water Bottle"</p>
              <p className="text-gray-600">5 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-gray-900">Launched "AI Photography App"</p>
              <p className="text-gray-600">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
