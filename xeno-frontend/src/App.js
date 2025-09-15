import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TopCustomers from './TopCustomers';
import OrdersChart from './OrdersChart';
function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('https://xeno-internship-project.onrender.com');
        setSummary(response.data);
      } catch (error) { console.error("Error fetching summary data:", error); } 
      finally { setLoading(false); }
    };
    fetchSummary();
  }, []);
  if (loading) { return <div className="App"><h1>Loading Dashboard...</h1></div>; }
  if (!summary) { return <div className="App"><h1>Error: Could not load summary data.</h1></div>; }
  return (
    <div className="App">
      <h1>Shopify Insights Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card"><h2>Total Revenue</h2><p>₹{parseFloat(summary.totalRevenue).toFixed(2)}</p></div>
        <div className="stat-card"><h2>Total Orders</h2><p>{summary.totalOrders}</p></div>
        <div className="stat-card"><h2>Total Customers</h2><p>{summary.totalCustomers}</p></div>
      </div>
      <div className="bottom-section">
        <TopCustomers />
        <OrdersChart />
      </div>
    </div>
  );
}
export default App;