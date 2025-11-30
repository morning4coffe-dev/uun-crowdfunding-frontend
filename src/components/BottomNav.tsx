import { Home, Compass, PlusCircle, User, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavProps {
  userRole: string;
}

export function BottomNav({ userRole }: BottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (userRole === 'admin' || userRole === 'both') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
