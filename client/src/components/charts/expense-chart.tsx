import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

// Type definitions for window.Chart
declare global {
  interface Window {
    Chart: any;
  }
}

export default function ExpenseChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: expenseData = [] } = useQuery<{ category: string; amount: number }[]>({
    queryKey: ["/api/dashboard/expense-breakdown"],
  });

  useEffect(() => {
    if (canvasRef.current && expenseData.length > 0 && window.Chart) {
      const ctx = canvasRef.current.getContext('2d');
      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const colors = [
        'hsl(var(--primary))',
        'hsl(var(--success))',
        'hsl(var(--warning))',
        'hsl(var(--error))'
      ];

      chartRef.current = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: expenseData.map((item: { category: string; amount: number }) => item.category),
          datasets: [{
            data: expenseData.map((item: { category: string; amount: number }) => item.amount),
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 4
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
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ₺${value.toLocaleString('tr-TR')} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [expenseData]);

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
      data-testid="expense-chart"
      className="w-full h-full"
    />
  );
}
