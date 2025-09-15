import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Filler } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const getISODate = (date) => date.toISOString().split('T')[0];
function OrdersChart() {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [endDate, setEndDate] = useState(getISODate(new Date()));
  const [startDate, setStartDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 30); return getISODate(date); });
  useEffect(() => {
    const fetchOrdersByDate = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://xeno-internship-project.onrender.com/api/dashboard/orders-by-date', { params: { startDate, endDate } });
        const orders = response.data;
        const countsByDate = {};
        orders.forEach(order => { const date = getISODate(new Date(order.created_at)); countsByDate[date] = (countsByDate[date] || 0) + 1; });
        const labels = Object.keys(countsByDate).sort();
        const data = labels.map(label => countsByDate[label]);
        setChartData({ labels, datasets: [{ label: 'Orders per Day', data: data, borderColor: '#bb86fc', backgroundColor: 'rgba(187, 134, 252, 0.2)', fill: true, }], });
      } catch (error) { console.error("Error fetching orders by date:", error); } 
      finally { setLoading(false); }
    };
    fetchOrdersByDate();
  }, [startDate, endDate]);
  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Orders Over Time' } }, scales: { y: { ticks: { color: '#e0e0e0' }, grid: { color: '#333' } }, x: { ticks: { color: '#e0e0e0' }, grid: { color: '#333' } } } };
  return (
    <div className="chart-container">
      <h2>Orders by Date</h2>
      <div className="date-filters">
        <label>Start Date:<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
        <label>End Date:<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
      </div>
      {loading ? <p>Loading chart...</p> : ( chartData.labels && chartData.labels.length > 0 ? <Line options={chartOptions} data={chartData} /> : <p>No orders found for the selected date range.</p> )}
    </div>
  );
}
export default OrdersChart;