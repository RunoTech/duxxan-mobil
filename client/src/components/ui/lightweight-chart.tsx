import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

interface LightweightChartProps {
  type: 'bar' | 'line' | 'doughnut';
  data: ChartData;
  options?: any;
  className?: string;
}

export function LightweightChart({ type, data, options = {}, className = "" }: LightweightChartProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151',
        },
      },
    } : {},
    ...options,
  };

  const chartProps = {
    data,
    options: defaultOptions,
  };

  return (
    <div className={`w-full h-64 ${className}`}>
      {type === 'bar' && <Bar {...chartProps} />}
      {type === 'line' && <Line {...chartProps} />}
      {type === 'doughnut' && <Doughnut {...chartProps} />}
    </div>
  );
}