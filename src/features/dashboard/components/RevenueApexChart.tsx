import React from "react";
import Chart from "react-apexcharts";
import type {ApexOptions} from "apexcharts";
import Card from "@/components/ui/Card.tsx";
import {useThemeContext} from "@/app/providers/ThemeContext.ts";
import {formatCurrency} from "@/core/utils/formatters.ts";

export interface RevenueApexChartProps {
    categories: string[];
    revenueSeries: number[];
    orderSeries: number[];
}

export const RevenueApexChart: React.FC<RevenueApexChartProps> = ({
    categories,
    revenueSeries,
    orderSeries,
}) => {
    const {theme} = useThemeContext();
    const isDark = theme === "dark";

    const options: ApexOptions = {
        chart: {
            type: "area",
            toolbar: {show: false},
            background: "transparent",
            fontFamily: "inherit",
        },
        colors: ["#d97706", "#0284c7"],
        dataLabels: {enabled: false},
        stroke: {
            curve: "smooth",
            width: 2.5,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: isDark ? 0.35 : 0.45,
                opacityTo: 0.05,
                stops: [0, 95, 100],
            },
        },
        xaxis: {
            categories,
            labels: {
                style: {
                    colors: isDark ? "#94a3b8" : "#64748b",
                    fontSize: "11px",
                    fontWeight: 600,
                },
            },
            axisBorder: {show: false},
            axisTicks: {show: false},
        },
        yaxis: [
            {
                title: {
                    text: "Revenue (IDR)",
                    style: {color: isDark ? "#94a3b8" : "#64748b", fontSize: "11px"},
                },
                labels: {
                    style: {colors: isDark ? "#94a3b8" : "#64748b", fontSize: "11px"},
                    formatter: (val) => formatCurrency(val),
                },
            },
            {
                opposite: true,
                title: {
                    text: "Orders Count",
                    style: {color: isDark ? "#94a3b8" : "#64748b", fontSize: "11px"},
                },
                labels: {
                    style: {colors: isDark ? "#94a3b8" : "#64748b", fontSize: "11px"},
                    formatter: (val) => `${val} orders`,
                },
            },
        ],
        grid: {
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            strokeDashArray: 4,
        },
        tooltip: {
            theme: isDark ? "dark" : "light",
            y: {
                formatter: (val, {seriesIndex}) =>
                    seriesIndex === 0 ? formatCurrency(val) : `${val} orders`,
            },
        },
        legend: {
            labels: {colors: isDark ? "#f8fafc" : "#0f172a"},
            position: "top",
            horizontalAlign: "right",
        },
    };

    const series = [
        {name: "Revenue (IDR)", data: revenueSeries},
        {name: "Orders Count", data: orderSeries},
    ];

    return (
        <Card variant="dashboard" className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                Revenue & Orders Trend
            </h3>
            <div className="w-full h-80">
                <Chart options={options} series={series} type="area" height="100%" />
            </div>
        </Card>
    );
};

export default RevenueApexChart;
