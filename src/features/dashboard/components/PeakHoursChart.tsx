import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Card from '@/components/ui/Card.tsx';
import type { PeakHourBreakdown } from '@/features/orders/types/order.types.ts';
import { useThemeContext } from "@/app/providers/ThemeContext.ts";

interface Props {
  data: PeakHourBreakdown[];
}

export const PeakHoursChart: React.FC<Props> = ({ data }) => {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  const series = [{
    name: 'Orders',
    data: data.map(d => d.count)
  }];
  
  const labels = data.map(d => `${String(d.hour).padStart(2, '0')}:00`);

  const options: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, foreColor: isDark ? '#94a3b8' : '#64748b' },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: '50%' }
    },
    dataLabels: { enabled: false },
    xaxis: { 
      categories: labels,
      labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
    },
    yaxis: {
      labels: { style: { colors: isDark ? '#94a3b8' : '#64748b' } }
    },
    colors: ['#8b5cf6'],
    grid: { borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };

  return (
    <Card variant="dashboard" className="p-6 flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Peak Hours</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Busiest time of day based on order volume.</p>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No data available</div>
      ) : (
        <div className="flex-1">
          <Chart options={options} series={series} type="bar" width="100%" height={300} />
        </div>
      )}
    </Card>
  );
};

export default PeakHoursChart;
