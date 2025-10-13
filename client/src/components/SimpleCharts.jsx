import React from 'react';

// Simple Bar Chart Component (without Chart.js)
export const SimpleBarChart = ({ data, title, color = '#7B3F00' }) => {
  if (!data || !data.labels || !data.datasets) return null;
  
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4 text-center">{title}</h3>
      <div className="space-y-3">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600 truncate">{label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    transition: 'width 0.5s ease-in-out'
                  }}
                >
                  <span className="text-white text-xs font-semibold">{value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Pie Chart Component (without Chart.js)
export const SimplePieChart = ({ data, title }) => {
  if (!data || !data.labels || !data.datasets) return null;
  
  const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-semibold text-[#7B3F00] ml-auto">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Simple Line Chart Component (without Chart.js)
export const SimpleLineChart = ({ data, title }) => {
  if (!data || !data.labels || !data.datasets) return null;
  
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  const range = maxValue - minValue;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-[#7B3F00] mb-4 text-center">{title}</h3>
      <div className="h-64 flex items-end justify-between space-x-1">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const height = range > 0 ? ((value - minValue) / range) * 200 + 20 : 20;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-[#7B3F00] rounded-t"
                style={{ height: `${height}px` }}
                title={`${label}: ${value}`}
              ></div>
              <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Summary Cards Component
export const SummaryCards = ({ chartData }) => {
  const totalOrders = chartData.orderStatusDistribution?.datasets[0]?.data?.reduce((a, b) => a + b, 0) || 0;
  const totalSpiceTypes = chartData.salesBySpiceType?.labels?.length || 0;
  const activeCustomers = chartData.customerOrderFrequency?.labels?.length || 0;
  const completedOrders = chartData.orderStatusDistribution?.datasets[0]?.data?.[2] || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-2">Total Orders</h3>
        <p className="text-3xl font-bold text-[#5C2C00]">{totalOrders}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-2">Spice Types</h3>
        <p className="text-3xl font-bold text-[#5C2C00]">{totalSpiceTypes}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-2">Active Customers</h3>
        <p className="text-3xl font-bold text-[#5C2C00]">{activeCustomers}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg font-semibold text-[#7B3F00] mb-2">Completed Orders</h3>
        <p className="text-3xl font-bold text-[#5C2C00]">{completedOrders}</p>
      </div>
    </div>
  );
};
