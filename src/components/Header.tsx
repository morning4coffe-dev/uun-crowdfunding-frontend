import React, { useEffect, useState } from 'react';
import { Search, Home, Compass, PlusCircle, User, Shield, LogOut, Moon, Sun } from 'lucide-react';
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
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  userRole?: string;
}

export function Header({ userRole }: HeaderProps) {
  const { user, logout, toggleFounder } = useAuth() as any;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isWide, setIsWide] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 700 : true);
  const { theme, setTheme } = useSettings();

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        navigate('/login');
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      navigate('/discover', { state: { focusSearch: true } });
      return;
    }
    navigate('/discover', { state: { presetSearch: trimmed, focusSearch: true } });
    setSearchTerm('');
  };

  const handleCompactSearch = () => navigate('/discover', { state: { focusSearch: true } });

  const navItems: { path: string; icon: any; label: string }[] = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (userRole === 'admin' || userRole === 'both') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white dark:bg-background shadow-sm">
      <div className="w-full mx-auto px-4 py-2 md:py-3 flex items-center justify-between gap-3 md:gap-6 sm:max-w-7xl sm:px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">


            <h1 className="text-primary text-lg md:text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>FundIt</h1>
          </div>

          {isWide && (
            <nav className="hidden md:flex max-[700px]:hidden items-center gap-8">
              {navItems.map((item) => {
                const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 ${isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isWide ? (
            <form onSubmit={handleSearchSubmit} className="hidden md:block max-[700px]:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects"
                className="pl-10 pr-4 py-2 w-64 bg-white/80 dark:bg-card/80 border border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            </form>
          ) : null}

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden" onClick={handleCompactSearch} aria-label="Search projects">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          

          <Button type="button" onClick={() => navigate('/create')} className="hidden md:inline-flex bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Launch
          </Button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-gray-700" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </button>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">{user?.firstName?.[0] || 'U'}</div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-96 p-5 bg-white/95 shadow-2xl rounded-2xl border border-gray-100"
              >
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">{user?.firstName?.[0] || 'U'}</div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold leading-tight">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[18rem]">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <div className="my-3 h-px bg-gray-100" />

                {process.env.NODE_ENV !== 'production' && toggleFounder && (
                  <DropdownMenuItem onClick={toggleFounder} className="text-sm py-3 px-2 rounded-lg hover:bg-gray-50">
                    <span className="mr-3">🏗️</span>
                    <span>Toggle Founder (dev)</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => navigate('/profile')} className="py-3 px-2 rounded-lg hover:bg-gray-50">
                  <User className="mr-3 h-5 w-5 text-gray-600" />
                  <span>View profile</span>
                </DropdownMenuItem>

                {(userRole === 'admin' || userRole === 'both') && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="py-3 px-2 rounded-lg hover:bg-gray-50">
                    <Shield className="mr-3 h-5 w-5 text-gray-600" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}

                <div className="my-2 h-px bg-gray-100" />

                <DropdownMenuItem
                  onSelect={(e: React.SyntheticEvent) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600 cursor-pointer py-3 px-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-600" />
                  <span className="font-medium">{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile panel removed — navigation hidden on small screens */}
    </header>
  );
}
