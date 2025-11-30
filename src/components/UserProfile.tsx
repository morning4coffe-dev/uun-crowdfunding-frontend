import { Mail, MapPin, Calendar, Edit2, CreditCard, Bell, LogOut, Shield } from 'lucide-react';
import { User } from '../App';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
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

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Component will unmount after logout, no need for cleanup
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
      <div className="bg-white rounded-xl p-6 border border-gray-200">
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
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">{user.stats?.totalProjectsOwned || user.createdProjects.length}</div>
          <p className="text-gray-600">Projects Created</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">{user.stats?.totalContributed || user.backedProjects.length}</div>
          <p className="text-gray-600">Projects Backed</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-primary mb-1">$0</div>
          <p className="text-gray-600">Total Pledged</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3>Account Settings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-gray-900">Payment Methods</div>
                <p className="text-gray-600">Manage your cards and payment options</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-gray-900">Notifications</div>
                <p className="text-gray-600">Configure your notification preferences</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-gray-900">Location</div>
                <p className="text-gray-600">Update your address and region</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

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
                <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
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
