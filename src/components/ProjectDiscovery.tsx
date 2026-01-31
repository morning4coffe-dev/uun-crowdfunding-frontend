import { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Clock, Compass, SearchX, Sparkles } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import client from '../api/client';
import { mapApiProjectToUiProject } from '../utils/mappers';
import { Project } from '../App';
import { ProjectCategory } from '../types/api';

export function ProjectDiscovery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [sortBy, setSortBy] = useState('popular');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = ['all', ...Object.values(ProjectCategory).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())];

  const sortOptions = [
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'funded', label: 'Most Funded', icon: Star },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          status: selectedStatus,
          limit: 50,
        };

        if (selectedCategory !== 'all') {
          params.category = selectedCategory.toLowerCase();
        }

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        switch (sortBy) {
          case 'popular':
            params.sortBy = 'stats.backerCount';
            params.sortOrder = 'desc';
            break;
          case 'newest':
            params.sortBy = 'createdAt';
            params.sortOrder = 'desc';
            break;
          case 'funded':
            params.sortBy = 'stats.currentAmount';
            params.sortOrder = 'desc';
            break;
        }

        const response = await client.get('/projects', { params });
        setProjects(response.data.data.map(mapApiProjectToUiProject));
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [debouncedSearch, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">Discover Projects</h1>
          </div>
          <p className="text-white/80 max-w-2xl mb-6">
            Explore innovative ideas and help bring them to life. Find projects you're passionate about and make a difference.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-card text-gray-900 dark:text-white rounded-2xl border-0 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Category Pills */}
          <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 w-full lg:w-auto pb-2 lg:pb-0">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedCategory === category
                      ? 'bg-primary text-white shadow-md scale-105'
                      : 'bg-white dark:bg-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary'
                    }`}
                >
                  {category === 'all' ? '✨ All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort & Status */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="active">🟢 Active</option>
              <option value="successful">🏆 Successful</option>
              <option value="pendingApproval">⏳ Pending</option>
              <option value="failed">❌ Failed</option>
            </select>

            {/* Sort Options */}
            <div className="flex bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${sortBy === option.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isLoading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500">Discovering amazing projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your search or filters to discover more amazing projects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
