import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const LineChart = ({data}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    renderChart();
    return () => {
      destroyChart();
    };
  }, [data]);

  const renderChart = () => {
    const ctx = chartRef.current.getContext('2d');
    destroyChart();
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.fromts),
        datasets: [{
          label: 'Psum (Avg)',
          data: data.map(item => item.metrics.Psum.avgvalue),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      }
    });
  };

  const destroyChart = () => {
    if (chartRef.current && chartRef.current.destroy) {
      chartRef.current.destroy();
    }
  };


  return <canvas ref={chartRef}></canvas>;
};

export default LineChart;
