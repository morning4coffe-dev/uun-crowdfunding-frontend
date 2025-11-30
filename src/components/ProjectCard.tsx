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
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer block"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full">
          <span className="text-primary">{project.category}</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h4 className="line-clamp-1">{project.title}</h4>
        <p className="text-gray-600 line-clamp-2">{project.shortDescription}</p>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary">${project.currentFunding.toLocaleString()}</span>
            <span className="text-gray-600">
              {fundingPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-gray-600 mt-1">
            of ${project.fundingGoal.toLocaleString()} goal
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{project.backerCount}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{project.daysLeft} days</span>
          </div>
          {fundingPercentage >= 100 && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Funded!</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
