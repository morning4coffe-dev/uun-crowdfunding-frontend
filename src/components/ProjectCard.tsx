import { Clock, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../App';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const fundingPercentage = (project.currentFunding / project.fundingGoal) * 100;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="bg-white dark:bg-card rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer block group hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-primary text-sm font-medium">{project.category}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 space-y-3">
        <h4 className="line-clamp-1 group-hover:text-primary transition-colors duration-200">{project.title}</h4>
        <p className="text-gray-600 line-clamp-2">{project.shortDescription}</p>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary font-semibold">${project.currentFunding.toLocaleString()}</span>
            <span className="text-gray-600 text-sm">
              {fundingPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-gray-600 mt-1 text-sm">
            of ${project.fundingGoal.toLocaleString()} goal
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{project.backerCount} backers</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{project.daysLeft} days</span>
          </div>
          {fundingPercentage >= 100 && (
            <div className="flex items-center gap-1 text-green-600 animate-pulse-subtle">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Funded!</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
