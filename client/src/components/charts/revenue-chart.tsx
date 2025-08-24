import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Chart } from "chart.js";

// Type definitions for window.Chart
declare global {
  interface Window {
    Chart: any;
  }
}

export default function RevenueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: revenueData = [] } = useQuery<{ month: string; amount: number }[]>({
    queryKey: ["/api/dashboard/revenue-analytics"],
  });

  useEffect(() => {
    if (canvasRef.current && revenueData.length > 0 && window.Chart) {
      const ctx = canvasRef.current.getContext('2d');
      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: revenueData.map((item: { month: string; amount: number }) => item.month),
          datasets: [{
            label: 'Gelir (TRY)',
            data: revenueData.map((item: { month: string; amount: number }) => item.amount),
            borderColor: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'hsl(var(--primary))',
            pointBorderColor: 'hsl(var(--primary))',
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'hsl(var(--primary))',
              borderWidth: 1,
              callbacks: {
                label: function(context: any) {
                  return '₺' + context.parsed.y.toLocaleString('tr-TR');
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: 'hsl(var(--muted-foreground))'
              }
            },
            y: {
              beginAtZero: false,
              grid: {
                color: 'hsl(var(--border))'
              },
              ticks: {
                color: 'hsl(var(--muted-foreground))',
                callback: function(value: any) {
                  return '₺' + (value / 1000000).toFixed(1) + 'M';
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [revenueData]);

  useEffect(() => {
    // Load Chart.js if not already loaded
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      data-testid="revenue-chart"
      className="w-full h-full"
    />
  );
}
