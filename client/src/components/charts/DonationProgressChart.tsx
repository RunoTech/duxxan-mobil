import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonationProgressChartProps {
  current: number;
  goal: number;
  title?: string;
}

const COLORS = ['#F59E0B', '#E5E7EB'];

const DonationProgressChart = memo(({ current, goal, title }: DonationProgressChartProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);

  const data = [
    { name: 'Toplanan', value: current, percentage: percentage.toFixed(1) },
    { name: 'Kalan', value: remaining, percentage: (100 - percentage).toFixed(1) }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-yellow-600 dark:text-yellow-400">
            {data.value.toLocaleString()} USDT ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span className="text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {percentage.toFixed(1)}% tamamlandı
        </p>
      </div>
    </div>
  );
});

DonationProgressChart.displayName = 'DonationProgressChart';

export default DonationProgressChart;