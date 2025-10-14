import React from 'react';

// Simple Bar Chart Component
export const BarChart = ({ data, title, color = '#7B3F00' }) => {
  // Handle both Chart.js format and simple array format
  let chartData = [];
  
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }
  
  // If data is in Chart.js format (has labels and datasets)
  if (data.labels && data.datasets && data.datasets[0]) {
    chartData = data.labels.map((label, index) => ({
      label: label,
      value: data.datasets[0].data[index] || 0
    }));
  } 
  // If data is already in simple array format
  else if (Array.isArray(data)) {
    chartData = data;
  }
  // If data is not in expected format, return empty state
  else {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">Invalid data format</div>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">No data to display</div>
      </div>
    );
  }
  
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 truncate mr-3">
              {item.label}
            </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color
                  }}
                >
                <span className="text-white text-xs font-medium">
                  {item.value}
                </span>
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// Simple Pie Chart Component
export const PieChart = ({ data, title }) => {
  // Handle both Chart.js format and simple array format
  let chartData = [];
  
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }
  
  // If data is in Chart.js format (has labels and datasets)
  if (data.labels && data.datasets && data.datasets[0]) {
    chartData = data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0].data[index] || 0
    }));
  } 
  // If data is already in simple array format
  else if (Array.isArray(data)) {
    chartData = data;
  }
  // If data is not in expected format, return empty state
  else {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">Invalid data format</div>
      </div>
    );
  }
  
  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  let cumulativePercentage = 0;
  
  const colors = [
    '#7B3F00', '#D6A77A', '#8B4513', '#CD853F', 
    '#A0522D', '#DEB887', '#F4A460', '#D2691E'
  ];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage * 3.6;
              const endAngle = (cumulativePercentage + percentage) * 3.6;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              cumulativePercentage += percentage;
          
          return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7B3F00]">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-[#7B3F00]">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component
export const LineChart = ({ data, title, color = '#7B3F00' }) => {
  // Handle both Chart.js format and simple array format
  let chartData = [];
  
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }
  
  // If data is in Chart.js format (has labels and datasets)
  if (data.labels && data.datasets && data.datasets[0]) {
    chartData = data.labels.map((label, index) => ({
      label: label,
      value: data.datasets[0].data[index] || 0
    }));
  } 
  // If data is already in simple array format
  else if (Array.isArray(data)) {
    chartData = data;
  }
  // If data is not in expected format, return empty state
  else {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">Invalid data format</div>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
        <div className="text-center text-gray-500">No data to display</div>
      </div>
    );
  }
  
  const maxValue = Math.max(...chartData.map(item => item.value));
  const minValue = Math.min(...chartData.map(item => item.value));
  const range = maxValue - minValue;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4">{title}</h3>
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="40"
              y1={y * 2}
              x2="380"
              y2={y * 2}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={chartData.map((item, index) => {
              const x = 40 + (index * 340) / (chartData.length - 1);
              const y = 200 - ((item.value - minValue) / range) * 160;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {chartData.map((item, index) => {
            const x = 40 + (index * 340) / (chartData.length - 1);
            const y = 200 - ((item.value - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {chartData.map((item, index) => {
            const x = 40 + (index * 340) / (chartData.length - 1);
          return (
              <text
                key={index}
                x={x}
                y="195"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {item.label}
              </text>
          );
        })}
        </svg>
      </div>
    </div>
  );
};

// Summary Card Component
export const SummaryCard = ({ title, value, icon, color = '#7B3F00', change }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-[#7B3F00]">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↗' : '↘'} {Math.abs(change)}% from last month
            </p>
          )}
      </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
      </div>
      </div>
    </div>
  );
};

// Export all components
export default {
  BarChart,
  PieChart,
  LineChart,
  SummaryCard
};
