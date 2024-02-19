import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './sla-validator-logo.png';
import './App.css';

function App() {
  const [monthlyData, setMonthlyData] = useState(null); // Start with null

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-sla-compliance/');
        console.log('Data received:', response.data);
        setMonthlyData(response.data);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    };

    fetchMonthlyData();
  }, []);

  // This function converts YYYY-MM to a more readable format, e.g., '2023-09' -> 'Sep 2023'
  const formatMonth = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short' }) + ' ' + year;
  };

  // Wait for the data to be loaded before trying to access it
  if (!monthlyData) {
    return <p>Loading data...</p>;
  }

  // Use optional chaining to safely access MonthlyBreaches
  const resolutionMonths = Object.keys(monthlyData.resolution_sla_compliance?.MonthlyBreaches || {});
  const responseMonths = Object.keys(monthlyData.response_sla_compliance?.MonthlyBreaches || {});

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="SLA Validator" className="App-logo" />
        <h1>SLA Validator</h1>
      </header>

      <table>
        <thead>
          <tr>
            <th>KPI</th>
            <th>Default Target (%)</th>
            {/* Use the larger of the two arrays of months to ensure all months are covered */}
            {resolutionMonths.length > responseMonths.length ? resolutionMonths : responseMonths.map(monthYear => <th key={monthYear}>{formatMonth(monthYear)}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{monthlyData.resolution_sla_compliance?.KPI}</td>
            <td>{monthlyData.resolution_sla_compliance?.DefaultTarget}</td>
            {resolutionMonths.map(monthYear => (
              <td key={monthYear}>
                {monthlyData.resolution_sla_compliance?.MonthlyBreaches[monthYear]?.toFixed(2) ?? 'N/A'}%
              </td>
            ))}
          </tr>
          <tr>
            <td>{monthlyData.response_sla_compliance?.KPI}</td>
            <td>{monthlyData.response_sla_compliance?.DefaultTarget}</td>
            {responseMonths.map(monthYear => (
              <td key={monthYear}>
                {monthlyData.response_sla_compliance?.MonthlyBreaches[monthYear]?.toFixed(2) ?? 'N/A'}%
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
