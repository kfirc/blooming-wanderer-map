import React, { useState, useEffect } from 'react';
import { Map, Palette, Satellite, Mountain } from 'lucide-react';
import { MapStyle } from '../types/BloomReport';
import { mapStyles, categoryLabelsHebrew, MapStyleHebrew } from '../utils/mapStyles';
import CategoryButton from './ui/CategoryButton';
import { SlidePanel } from './ui/slide-panel';

interface MapStyleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

const MapStyleSidebar: React.FC<MapStyleSidebarProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onStyleChange
}) => {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MapStyle['category']>('standard');

  const filteredStyles = mapStyles.filter(style => style.category === activeCategory);

  const handleStyleSelect = (style: MapStyleHebrew) => {
    onStyleChange(style);
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="סגנונות מפה"
      side="right"
      width="w-full md:w-96"
      closeButtonPosition="responsive"
      backdrop={true}
      backdropBlur={true}
      zIndex={50}
    >
      {/* Category filters */}
      <div className="p-4 border-b border-gray-100">
        {/* Fixed category buttons layout for proper RTL flow */}
        <div className="flex gap-1 flex-wrap justify-start" dir="rtl">
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <CategoryButton
              key={category}
              label={categoryLabelsHebrew[category as keyof typeof categoryLabelsHebrew]}
              icon={Icon}
              isActive={activeCategory === category}
              gradient={categoryColors[category as keyof typeof categoryColors]}
              onClick={() => setActiveCategory(category as MapStyle['category'])}
            />
          ))}
        </div>
      </div>

      {/* Style grid */}
      <div className="p-4 h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
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
                  group relative p-4 rounded-xl border-2 text-right
                  transition-all duration-300 ease-out
                  transform hover:scale-[1.02] hover:-translate-y-1
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
                <div className="relative mb-3 overflow-hidden rounded-lg">
                  <img
                    src={style.preview}
                    alt={`${style.nameHebrew} preview`}
                    className={`
                      w-full h-20 object-cover transition-all duration-300
                      ${isHovered ? 'scale-110' : ''}
                      ${isActive ? 'opacity-90' : 'opacity-100'}
                    `}
                  />
                  
                  {/* Category icon overlay */}
                  <div className={`
                    absolute top-2 left-2 p-1.5 rounded-md
                    ${isActive ? 'bg-white/20' : 'bg-black/20'}
                    transition-all duration-200
                    ${isHovered ? 'scale-110' : ''}
                  `}>
                    <CategoryIcon className={`
                      w-4 h-4 ${isActive ? 'text-white' : 'text-white'}
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
                    font-semibold text-base mb-2 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'}
                  `}>
                    {style.nameHebrew}
                  </h4>
                  <p className={`
                    text-sm leading-relaxed transition-colors duration-200
                    ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'}
                  `}>
                    {style.descriptionHebrew}
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
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </SlidePanel>
  );
};

export default MapStyleSidebar; 