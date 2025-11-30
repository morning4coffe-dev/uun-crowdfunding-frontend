import { useState } from 'react';
import { Bell, Search, Home, Compass, PlusCircle, User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface HeaderProps {
  userRole: string;
}

export function Header({ userRole }: HeaderProps) {
  const { user, logout } = useAuth();
  // Dev helper exposed by AuthContext - toggles founder role locally
  const { toggleFounder } = useAuth() as any;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Component will unmount after logout, no need for cleanup
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    if (trimmed.length === 0) {
      navigate('/discover', { state: { focusSearch: true } });
      return;
    }

    navigate('/discover', {
      state: {
        presetSearch: trimmed,
        focusSearch: true,
      },
    });
    setSearchTerm('');
  };

  const handleCompactSearch = () => {
    navigate('/discover', { state: { focusSearch: true } });
  };

  const getTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/discover')) return 'Discover';
    if (pathname.startsWith('/create')) return 'Create Project';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/admin')) return 'Admin Panel';
    if (pathname.startsWith('/projects/')) return 'Project';
    return 'FundIt';
  };

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
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="w-full mx-auto px-4 py-4 flex items-center justify-between gap-6 sm:max-w-7xl sm:px-6">
        <div className="flex items-center gap-8">
          <h1
            className="text-primary text-xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
          >
            FundIt
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => {
              const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  isActive
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects"
                className="pl-10 pr-4 py-2 w-64 bg-white/80 border border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
          </form>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            onClick={handleCompactSearch}
            aria-label="Search projects"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Button
            type="button"
            onClick={() => navigate('/create')}
            className="hidden md:inline-flex bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Launch
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Dev: toggle founder role quickly (only visible in dev) */}
              {process.env.NODE_ENV !== 'production' && toggleFounder && (
                <DropdownMenuItem onClick={toggleFounder} className="text-sm">
                  <span className="mr-2">🏗️</span>
                  <span>Toggle Founder (dev)</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              {(userRole === 'admin' || userRole === 'both') && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-2 md:hidden">
        <h2 className="text-gray-600">{getTitle()}</h2>
        <form onSubmit={handleSearchSubmit} className="mt-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search projects"
              className="pl-12 pr-4 py-3 bg-white border border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
