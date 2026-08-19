import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Card from '@/components/ui/Card.tsx';
import type { OrderStatusBreakdown } from '@/features/orders/types/order.types.ts';
import { useThemeContext } from "@/app/providers/ThemeContext.ts";

interface Props {
  data: OrderStatusBreakdown[];
}

export const OrderStatusBreakdownChart: React.FC<Props> = ({ data }) => {
  const { theme } = useThemeContext();
  const isDark = theme === "dark";

  const statusMap: Record<number, string> = {
    0: 'Order Confirmed',
    1: 'In Progress',
    2: 'Completed'
  };
  const colors = ['#f59e0b', '#3b82f6', '#10b981'];

  // Fill in missing statuses with 0 count
  const normalizedData = [0, 1, 2].map(status => {
    const item = data.find(d => d.status === status);
    return {
      status,
      count: item ? item.count : 0
    };
  });

  const series = normalizedData.map(d => d.count);
  const labels = normalizedData.map(d => statusMap[d.status]);

  const options: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', foreColor: isDark ? '#94a3b8' : '#64748b' },
    labels,
    colors,
    legend: { position: 'bottom', labels: { colors: isDark ? '#f8fafc' : '#0f172a' } },
    stroke: { show: isDark, colors: isDark ? ['#0f172a'] : [] },
    dataLabels: { enabled: true },
    plotOptions: {
      pie: {
        donut: { size: '70%' }
      }
    },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };

  return (
    <Card variant="dashboard" className="p-6 flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Order Status</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pipeline of orders in the selected period.</p>
      {series.every(s => s === 0) ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No data available</div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Chart options={options} series={series} type="donut" width="100%" height={300} />
        </div>
      )}
    </Card>
  );
};

export default OrderStatusBreakdownChart;
