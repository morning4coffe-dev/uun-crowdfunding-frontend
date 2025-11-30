import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Star, Clock, Loader2 } from 'lucide-react';
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
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'funded', label: 'Most Funded', icon: Star },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          status: selectedStatus,
          limit: 50, // Fetch more for now
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filter */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="active">Active Projects</option>
          <option value="pendingApproval">Pending Approval</option>
          <option value="draft">Drafts</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4">
        <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <span className="text-gray-600 flex-shrink-0">Sort by:</span>
        <div className="flex gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  sortBy === option.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-gray-600">
        {projects.length} project{projects.length !== 1 ? 's' : ''} found
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No projects found</div>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
