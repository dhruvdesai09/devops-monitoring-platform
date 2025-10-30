import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/metrics`),
        axios.get(`${BACKEND_URL}/api/stats`)
      ]);
      setMetrics(metricsRes.data.slice(0, 20));
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const prepareChartData = () => {
    const grouped = {};
    metrics.forEach(m => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      if (!grouped[time]) grouped[time] = { time };
      grouped[time][m.metric_name] = m.value;
    });
    return Object.values(grouped).reverse();
  };

  if (loading) return <div className='loading'>Loading...</div>;

  return (
    <div className='App'>
      <header>
        <h1>Real-Time Monitoring Dashboard</h1>
      </header>

      <div className='stats-grid'>
        {stats.map(stat => (
          <div key={stat.metric_name} className='stat-card'>
            <h3>{stat.metric_name.replace(/_/g, ' ').toUpperCase()}</h3>
            <div className='stat-value'>{parseFloat(stat.avg_value).toFixed(2)}%</div>
            <div className='stat-details'>
              <span>Max: {parseFloat(stat.max_value).toFixed(2)}</span>
              <span>Min: {parseFloat(stat.min_value).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='chart-container'>
        <h2>Metrics Over Time</h2>
        <LineChart width={1000} height={400} data={prepareChartData()}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='time' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type='monotone' dataKey='cpu_usage' stroke='#8884d8' />
          <Line type='monotone' dataKey='memory_usage' stroke='#82ca9d' />
          <Line type='monotone' dataKey='disk_usage' stroke='#ffc658' />
        </LineChart>
      </div>
    </div>
  );
}

export default App;
