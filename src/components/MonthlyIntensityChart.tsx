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

const monthNames = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

// Helper to get x position for a month index, RTL (right=Jan, left=Dec)
const getX = (index: number) => width - padding - (index * (width - 2 * padding)) / 11;

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
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [tooltip, setTooltip] = React.useState<{x: number, y: number, month: string, intensity: number} | null>(null);

  // Get the current month (0-based, Jan=0)
  const currentMonth = new Date().getMonth();

  // Add keyframes for pulse animation (POC: inline <style> tag)
  // This will only be injected once per component instance
  const pulseStyle = `
    @keyframes pulse-opacity {
      0% { opacity: 0; r: 6; }
      50% { opacity: 1; r: 12; }
      100% { opacity: 0; r: 6; }
    }
  `;

  const handleMouseOver = (index: number, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    const month = monthNames[index];
    const intensity = monthlyData[index];
    const svg = (e.target as SVGElement).ownerSVGElement;
    const pt = svg?.createSVGPoint();
    if (pt) {
      pt.x = e.clientX;
      pt.y = e.clientY;
      const screenCTM = svg.getScreenCTM();
      if (screenCTM) {
        const loc = pt.matrixTransform(screenCTM.inverse());
        setTooltip({ x: loc.x, y: loc.y, month, intensity });
      }
    }
    setHovered(index);
  };
  const handleMouseOut = () => {
    setHovered(null);
    setTooltip(null);
  };

  // Tooltip X/Y for hovered month
  const tooltipX = hovered !== null ? getX(hovered) - 60 : 0;
  const tooltipY = 0;

  return (
    <div className="flex flex-col items-center space-y-2 relative" dir="rtl">
      {/* Inline style for pulse animation */}
      <style>{pulseStyle}</style>
      {/* Intensity Chart */}
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${bloomStartMonth}-${bloomEndMonth}`} x1="100%" y1="0%" x2="0%" y2="0%">
              {monthlyData.map((intensity, index) => (
                <stop 
                  key={index}
                  offset={`${(index / 11) * 100}%`}
                  stopColor={getColor(intensity)}
                />
              ))}
            </linearGradient>
          </defs>
          {/* Background grid lines */}
          {[...Array(12)].map((_, index) => (
            <line
              key={index}
              x1={getX(index)}
              y1={padding}
              x2={getX(index)}
              y2={height - padding}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          {/* Intensity line */}
          <path
            d={`M ${monthlyData.map((intensity, index) => `${getX(index)},${height - padding - (intensity * (height - 2 * padding))}`).join(' L ')}`}
            fill="none"
            stroke={`url(#gradient-${bloomStartMonth}-${bloomEndMonth})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Month hover rects */}
          {monthlyData.map((_, index) => (
            <rect
              key={index}
              x={getX(index) - (width - 2 * padding) / 24}
              y={padding}
              width={(width - 2 * padding) / 12}
              height={height - 2 * padding}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {/* Data points */}
          {monthlyData.map((intensity, index) => (
            <g key={index}>
              {/* Glowing effect for current month */}
              {index === currentMonth && (
                <circle
                  cx={getX(index)}
                  cy={height - padding - (intensity * (height - 2 * padding))}
                  r="6"
                  fill="#facc15"
                  opacity="0.5"
                  aria-hidden="true"
                  style={{
                    animation: 'pulse-opacity 1.5s ease-in-out infinite',
                  }}
                />
              )}
              <circle
                cx={getX(index)}
                cy={height - padding - (intensity * (height - 2 * padding))}
                r="3"
                fill={getColor(intensity)}
                stroke="white"
                strokeWidth="1"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>
        {/* Tooltip as absolutely positioned div */}
        {hovered !== null && (
          <div
            style={{
              position: 'absolute',
              left: Math.max(0, Math.min(width - 120, getX(hovered) - 60)),
              top: 0,
              width: 120,
              height: 44,
              pointerEvents: 'none',
              zIndex: 10,
            }}
            className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-black shadow-lg text-center whitespace-pre-line"
          >
            {monthlyData[hovered] > 0
              ? `פורח ב${monthNames[hovered]}`
              : `אינו פורח ב${monthNames[hovered]}`}
          </div>
        )}
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
