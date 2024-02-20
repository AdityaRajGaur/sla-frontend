import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './sla-validator-logo.png';
import './App.css';

function App() {
  const [monthlyData, setMonthlyData] = useState(null); // Start with null
  const RESOLUTION_WARNING_PERCENTAGE = 92; // Default value for resolution warning
  const RESPONSE_WARNING_PERCENTAGE = 97; // Default value for response warning

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

  const formatMonth = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short' }) + ' ' + year;
  };

  if (!monthlyData) {
    return <p>Loading data...</p>;
  }

  const getStyleForPercentage = (percentage, defaultTarget, warningPercentage) => {
    if (percentage < defaultTarget) {
      return { color: 'red' }; // Less than default target
    } else if (percentage >=  defaultTarget & percentage < warningPercentage) {
      return { color: 'orange' }; // Between default target and warning
    } else {
      return { color: 'green' }; // Greater than warning
    }
  };

  const resolutionMonths = Object.keys(monthlyData.resolution_sla_compliance?.MonthlyCompliance || {});
  const responseMonths = Object.keys(monthlyData.response_sla_compliance?.MonthlyCompliance || {});


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="SLA Validator" className="App-logo" />
        <h1>P3 – Proactive Penalty Protection</h1>
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
              <td key={monthYear} style={getStyleForPercentage(
                monthlyData.resolution_sla_compliance?.MonthlyCompliance[monthYear],
                monthlyData.resolution_sla_compliance?.DefaultTarget,
                RESOLUTION_WARNING_PERCENTAGE
              )}>
                {monthlyData.resolution_sla_compliance?.MonthlyCompliance[monthYear]?.toFixed(2) ?? 'N/A'}%
              </td>
            ))}
          </tr>
          <tr>
            <td>{monthlyData.response_sla_compliance?.KPI}</td>
            <td>{monthlyData.response_sla_compliance?.DefaultTarget}</td>
            {resolutionMonths.map(monthYear => (
              <td key={monthYear} style={getStyleForPercentage(
                monthlyData.response_sla_compliance?.MonthlyCompliance[monthYear],
                monthlyData.response_sla_compliance?.DefaultTarget,
                RESPONSE_WARNING_PERCENTAGE
              )}>
                {monthlyData.response_sla_compliance?.MonthlyCompliance[monthYear]?.toFixed(2) ?? 'N/A'}%
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;