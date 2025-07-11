import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './DashboardChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = () => {
  // TODO: Replace with actual data from backend API for monthly stock transactions
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Stock In',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Stock Out',
        data: [2, 3, 20, 5, 1, 4],
        backgroundColor: '#EF4444',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Stock Transactions',
      },
    },
  };

  return (
    <div className="dashboard-chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default DashboardChart;