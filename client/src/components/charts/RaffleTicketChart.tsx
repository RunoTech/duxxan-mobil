import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RaffleTicketChartProps {
  data: {
    name: string;
    tickets: number;
    value: number;
  }[];
  title?: string;
}

const RaffleTicketChart = memo(({ data, title }: RaffleTicketChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-yellow-600 dark:text-yellow-400">
            Bilet: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-green-600 dark:text-green-400">
            Değer: {payload[1]?.value?.toLocaleString()} USDT
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="tickets" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

RaffleTicketChart.displayName = 'RaffleTicketChart';

export default RaffleTicketChart;