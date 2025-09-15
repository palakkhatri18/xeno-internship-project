import React, { useState, useEffect } from 'react';
import axios from 'axios';
function TopCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const response = await axios.get('https://xeno-internship-project.onrender.com');
        setCustomers(response.data);
      } catch (error) { console.error("Error fetching top customers:", error); } 
      finally { setLoading(false); }
    };
    fetchTopCustomers();
  }, []);
  if (loading) { return <h2>Loading Top Customers...</h2>; }
  return (
    <div className="list-container">
      <h2>Top 5 Customers by Spend</h2>
      <ol>{customers.map((customer) => (<li key={customer.shopify_id}><span>{customer.first_name} {customer.last_name}</span><span>₹{parseFloat(customer.total_spent).toFixed(2)}</span></li>))}</ol>
    </div>
  );
}
export default TopCustomers;