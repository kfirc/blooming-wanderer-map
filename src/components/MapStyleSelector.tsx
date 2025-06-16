import React, { useState, useRef, useEffect } from 'react';
import { MapStyle } from '../types/BloomReport';
import { mapStyles } from '../utils/mapStyles';
import { ChevronDown, Map, Palette, Satellite, Mountain } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: MapStyle) => void;
}

const categoryIcons = {
  standard: Map,
  artistic: Palette,
  satellite: Satellite,
  terrain: Mountain,
};

const categoryColors = {
  standard: 'from-blue-500 to-blue-600',
  artistic: 'from-purple-500 to-pink-600', 
  satellite: 'from-green-500 to-emerald-600',
  terrain: 'from-amber-500 to-orange-600',
};

const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ currentStyle, onStyleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MapStyle['category'] | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentStyleData = mapStyles.find(style => style.id === currentStyle) || mapStyles[0];
  
  const filteredStyles = activeCategory === 'all' 
    ? mapStyles 
    : mapStyles.filter(style => style.category === activeCategory);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStyleSelect = (style: MapStyle) => {
    onStyleChange(style);
    setIsOpen(false);
    setHoveredStyle(null);
  };

  const CategoryIcon = categoryIcons[currentStyleData.category];

  return (
    <TooltipProvider>
      <div className="relative" ref={dropdownRef}>
        {/* Main trigger button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className={`
                group relative overflow-hidden rounded-xl border-2 border-white/20 
                bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl
                transition-all duration-300 ease-out
                ${isOpen ? 'scale-105 shadow-xl' : 'hover:scale-102'}
                p-2 min-w-[60px] h-12
              `}
            >
              {/* Animated background gradient */}
              <div className={`
                absolute inset-0 bg-gradient-to-r ${categoryColors[currentStyleData.category]}
                opacity-0 group-hover:opacity-10 transition-opacity duration-300
              `} />
              
              {/* Content */}
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <CategoryIcon className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200" />
                  {/* Pulse effect on hover */}
                  <div className={`
                    absolute inset-0 rounded-full bg-gradient-to-r ${categoryColors[currentStyleData.category]}
                    opacity-0 group-hover:opacity-20 scale-150 
                    transition-all duration-500 ease-out group-hover:scale-100
                  `} />
                </div>
                
                <ChevronDown className={`
                  w-4 h-4 text-gray-600 transition-all duration-300 ease-out
                  ${isOpen ? 'rotate-180 text-gray-800' : 'group-hover:text-gray-800'}
                `} />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/90 text-white text-sm">
            <p>Current: {currentStyleData.name}</p>
            <p className="text-xs opacity-75">{currentStyleData.description}</p>
          </TooltipContent>
        </Tooltip>

        {/* Dropdown panel */}
        <div className={`
          absolute top-14 right-0 z-50 w-80 
          transform transition-all duration-300 ease-out origin-top-right
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
        `}>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Styles</h3>
              
              {/* Category filters */}
              <div className="flex gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${activeCategory === 'all' 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  All
                </button>
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category as MapStyle['category'])}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200 capitalize
                      ${activeCategory === category 
                        ? `bg-gradient-to-r ${categoryColors[category as keyof typeof categoryColors]} text-white shadow-md` 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-3 h-3" />
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Style grid */}
            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {filteredStyles.map((style, index) => {
                  const isActive = style.id === currentStyle;
                  const isHovered = hoveredStyle === style.id;
                  const CategoryIcon = categoryIcons[style.category];
                  
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStyleSelect(style)}
                      onMouseEnter={() => setHoveredStyle(style.id)}
                      onMouseLeave={() => setHoveredStyle(null)}
                      className={`
                        group relative p-3 rounded-xl border-2 text-left
                        transition-all duration-300 ease-out
                        transform hover:scale-105 hover:-translate-y-1
                        ${isActive 
                          ? `border-gradient bg-gradient-to-br ${categoryColors[style.category]} text-white shadow-lg` 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        ...(isOpen && { animation: 'slideInUp 0.3s ease-out forwards' })
                      }}
                    >
                      {/* Background animation */}
                      {!isActive && (
                        <div className={`
                          absolute inset-0 rounded-xl bg-gradient-to-br ${categoryColors[style.category]}
                          opacity-0 transition-opacity duration-300
                          ${isHovered ? 'opacity-5' : ''}
                        `} />
                      )}
                      
                      {/* Preview image */}
                      <div className="relative mb-2 overflow-hidden rounded-lg">
                        <img
                          src={style.preview}
                          alt={`${style.name} preview`}
                          className={`
                            w-full h-12 object-cover transition-all duration-300
                            ${isHovered ? 'scale-110' : ''}
                            ${isActive ? 'opacity-90' : 'opacity-100'}
                          `}
                        />
                        
                        {/* Category icon overlay */}
                        <div className={`
                          absolute top-1 right-1 p-1 rounded-md
                          ${isActive ? 'bg-white/20' : 'bg-black/20'}
                          transition-all duration-200
                          ${isHovered ? 'scale-110' : ''}
                        `}>
                          <CategoryIcon className={`
                            w-3 h-3 ${isActive ? 'text-white' : 'text-white'}
                          `} />
                        </div>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute inset-0 border-2 border-white/30 rounded-lg" />
                        )}
                      </div>
                      
                      {/* Text content */}
                      <div className="relative">
                        <h4 className={`
                          font-semibold text-sm mb-1 transition-colors duration-200
                          ${isActive ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'}
                        `}>
                          {style.name}
                        </h4>
                        <p className={`
                          text-xs leading-relaxed transition-colors duration-200
                          ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'}
                        `}>
                          {style.description}
                        </p>
                      </div>

                      {/* Hover effect border */}
                      {isHovered && !isActive && (
                        <div className={`
                          absolute inset-0 rounded-xl border-2 bg-gradient-to-br ${categoryColors[style.category]}
                          opacity-20 transition-opacity duration-300
                        `} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </TooltipProvider>
  );
};

export default MapStyleSelector; 