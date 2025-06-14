
import React from 'react';

interface MonthlyIntensityChartProps {
  monthlyData: number[]; // Array of 12 values (0-1) representing intensity for each month
  bloomStartMonth?: number;
  bloomEndMonth?: number;
}

const MonthlyIntensityChart: React.FC<MonthlyIntensityChartProps> = ({ 
  monthlyData, 
  bloomStartMonth = 1, 
  bloomEndMonth = 12 
}) => {
  const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
  const width = 200;
  const height = 40;
  const padding = 10;
  
  // Create SVG path for the intensity line
  const createPath = () => {
    const points = monthlyData.map((intensity, index) => {
      const x = padding + (index * (width - 2 * padding)) / 11;
      const y = height - padding - (intensity * (height - 2 * padding));
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Get color based on intensity (red to green gradient)
  const getColor = (intensity: number) => {
    const red = Math.floor(255 * (1 - intensity));
    const green = Math.floor(255 * intensity);
    return `rgb(${red}, ${green}, 0)`;
  };

  // Create gradient definition
  const createGradient = () => {
    return monthlyData.map((intensity, index) => (
      <stop 
        key={index}
        offset={`${(index / 11) * 100}%`}
        stopColor={getColor(intensity)}
      />
    ));
  };

  // Get season emojis
  const getSeasonEmojis = () => {
    const seasons = [];
    if (bloomStartMonth <= 3 || bloomEndMonth >= 12) seasons.push('❄️'); // Winter
    if ((bloomStartMonth <= 5 && bloomEndMonth >= 3) || (bloomStartMonth <= 3 && bloomEndMonth >= 3)) seasons.push('🌸'); // Spring
    if (bloomStartMonth <= 8 && bloomEndMonth >= 6) seasons.push('☀️'); // Summer
    if (bloomStartMonth <= 11 && bloomEndMonth >= 9) seasons.push('🍂'); // Fall
    return seasons;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Intensity Chart */}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${bloomStartMonth}-${bloomEndMonth}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {createGradient()}
            </linearGradient>
          </defs>
          
          {/* Background grid lines */}
          {months.map((_, index) => (
            <line
              key={index}
              x1={padding + (index * (width - 2 * padding)) / 11}
              y1={padding}
              x2={padding + (index * (width - 2 * padding)) / 11}
              y2={height - padding}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Intensity line */}
          <path
            d={createPath()}
            fill="none"
            stroke={`url(#gradient-${bloomStartMonth}-${bloomEndMonth})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {monthlyData.map((intensity, index) => (
            <circle
              key={index}
              cx={padding + (index * (width - 2 * padding)) / 11}
              cy={height - padding - (intensity * (height - 2 * padding))}
              r="3"
              fill={getColor(intensity)}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
        
        {/* Month labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1" style={{ width: width }}>
          {months.map((month, index) => (
            <span key={index} className="text-center" style={{ width: '16px' }}>
              {month}
            </span>
          ))}
        </div>
      </div>
      
      {/* Season emojis */}
      <div className="flex space-x-1">
        {getSeasonEmojis().map((emoji, index) => (
          <span key={index} className="text-lg">
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MonthlyIntensityChart;
