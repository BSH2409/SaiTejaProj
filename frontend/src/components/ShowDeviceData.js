import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import moment from 'moment';


const ShowDeviceData = ({ data , operating_load}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  useEffect(() => {
    if (data && data.length > 0) {
      renderChart();
    }
    return () => destroyChart();
  }, [data]);

  const canvasBgColor = {
    id: 'canvasBgColor',
    beforeDraw(chart, args, pluginOptions) {
      const { ctx, chartArea: {top , bottom, left, right, width}, scales: {x,y}}=chart
      bgColors(0,0.1,"rgba(0,255,0,0.1)")
      bgColors(0.1,0.2*operating_load,"rgba(255,255,0,0.1)")
      bgColors(0.2*operating_load,operating_load,"rgba(255,0,0,0.1)")
      function bgColors(low, high, color) {
        ctx.fillStyle = color
        ctx.fillRect(left, y.getPixelForValue(high), width, y.getPixelForValue(low)- y.getPixelForValue(high))
      }
    }
  }
  const renderChart = () => {
    console.log('Rendering chart with data:', data); // Debug: Check data
    if (canvasRef.current) {
      console.log('Canvas ref:', canvasRef.current); // Debug: Verify canvas reference
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        console.log('2D context acquired'); // Debug: Verify context acquisition
        destroyChart(); // Ensure previous chart instances are destroyed
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          },
          plugins: [canvasBgColor],
          data: {
            labels: data.map((item) => moment(parseFloat(item.tots)).format('YYYY-MM-DD HH:mm:ss')),
            datasets: [
              {
                label: 'Psum (Avg)',
                data: data.map((item) => item.metrics.Psum.avgvalue),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 0, // Remove round points
              },
            ],
          },
        });
      } else {
        console.error('Failed to acquire 2D context');
      }
    } else {
      console.error('Canvas ref is not available');
    }
  };

  const destroyChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null; // Clear the reference after destroying
      console.log('Chart instance destroyed'); // Debug: Confirm destruction
    }
  };

  return <canvas ref={canvasRef}></canvas>;
};

export default ShowDeviceData;
