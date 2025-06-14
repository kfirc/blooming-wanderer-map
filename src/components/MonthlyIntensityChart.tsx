import React from 'react';

interface MonthlyIntensityChartProps {
  monthlyData: number[]; // Array of 12 values (0-1) representing intensity for each month
  bloomStartMonth?: number;
  bloomEndMonth?: number;
}

const seasonEmojis = [
  { name: 'חורף', emoji: '❄️' }, // דצמבר, ינואר, פברואר
  { name: 'אביב', emoji: '🌸' }, // מרץ, אפריל, מאי
  { name: 'קיץ', emoji: '☀️' }, // יוני, יולי, אוגוסט
  { name: 'סתיו', emoji: '🍂' }, // ספטמבר, אוקטובר, נובמבר
];

const width = 200;
const height = 40;
const padding = 10;

const createPath = (monthlyData: number[]) => {
  const points = monthlyData.map((intensity, index) => {
    const x = padding + (index * (width - 2 * padding)) / 11;
    const y = height - padding - (intensity * (height - 2 * padding));
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};

const getColor = (intensity: number) => {
  const red = Math.floor(255 * (1 - intensity));
  const green = Math.floor(255 * intensity);
  return `rgb(${red}, ${green}, 0)`;
};

const createGradient = (monthlyData: number[]) => {
  return monthlyData.map((intensity, index) => (
    <stop 
      key={index}
      offset={`${(index / 11) * 100}%`}
      stopColor={getColor(intensity)}
    />
  ));
};

const getSeasonEmojiRow = () => {
  return seasonEmojis.map((season, i) => (
    <React.Fragment key={season.name}>
      {i > 0 && <span className="mx-1">|</span>}
      <span>{season.emoji}</span>
    </React.Fragment>
  ));
};

const MonthlyIntensityChart: React.FC<MonthlyIntensityChartProps> = ({ 
  monthlyData, 
  bloomStartMonth = 1, 
  bloomEndMonth = 12 
}) => {
  const isEmpty = monthlyData.every((v) => v === 0);
  return (
    <div className="flex flex-col items-center space-y-2" dir="rtl">
      {/* Intensity Chart */}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${bloomStartMonth}-${bloomEndMonth}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {createGradient(monthlyData)}
            </linearGradient>
          </defs>
          {/* Background grid lines */}
          {[...Array(12)].map((_, index) => (
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
            d={createPath(monthlyData)}
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
        {/* Season emoji row */}
        <div className="flex justify-between text-xs text-gray-500 mt-1 w-full" style={{ width: width }}>
          {getSeasonEmojiRow()}
        </div>
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs bg-white/80">
            אין נתוני עוצמה להצגה
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyIntensityChart;
