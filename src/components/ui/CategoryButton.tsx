import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CategoryButtonProps {
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  gradient: string;
  onClick: () => void;
  className?: string;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  label,
  icon: Icon,
  isActive = false,
  gradient,
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${isActive 
          ? `bg-gradient-to-r ${gradient} text-white shadow-md` 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
};

export default CategoryButton; 