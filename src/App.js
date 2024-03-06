import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import logo from './sla-validator-logo.png';
import './App.css';
import urlConfig from './url_config.json';

function App() {
  const [monthlyData, setMonthlyData] = useState(null);
  const RESOLUTION_WARNING_PERCENTAGE = urlConfig.RESOLUTION_WARNING_PERCENTAGE;
  const RESPONSE_WARNING_PERCENTAGE = urlConfig.RESPONSE_WARNING_PERCENTAGE;
  const [selectedProject, setSelectedProject] = useState('TIC');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // Index to track current month

  // Dummy project list
  const projects = ['TIC', 'ES', 'Project 3'];

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await axios.get(urlConfig.backendURL);
        console.log('Data received:', response.data);
        setMonthlyData(response.data);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    };

    fetchMonthlyData();
  }, []);

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
    // Fetch data for the new project
  };

  const navigateTimePeriod = (direction) => {
    if (direction === 'previous') {
      setCurrentMonthIndex((prevIndex) => prevIndex - 6);
    } else if (direction === 'next') {
      setCurrentMonthIndex((prevIndex) => prevIndex + 6);
    }
  };

  // Use this function to format the monthYear in your JSX
  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1); // Months are 0-indexed in JavaScript Date
    return date.toLocaleDateString('en-GB', {
      year: '2-digit',
      month: 'short',
    }).replace(' ', "'"); // Replace space with apostrophe
  };

  const getStyleForPercentage = (percentage, defaultTarget, warningPercentage) => {
    percentage = parseFloat(percentage);
    defaultTarget = parseFloat(defaultTarget);
    warningPercentage = parseFloat(warningPercentage);

    if (percentage < defaultTarget) {
      return { color: 'red' };
    } else if (percentage < warningPercentage) {
      return { color: 'orange' };
    } else {
      return { color: 'green' };
    }
  };

  if (!monthlyData || !monthlyData.resolution_sla_compliance.MonthlyCompliance || !monthlyData.response_sla_compliance.MonthlyCompliance) {
    return <p>Loading data...</p>;
  }


  const resolutionData = sortDataByMonth(monthlyData.resolution_sla_compliance.MonthlyCompliance);
  const responseData = sortDataByMonth(monthlyData.response_sla_compliance.MonthlyCompliance);

  function sortDataByMonth(data) {
    return Object.entries(data).sort(([monthYearA], [monthYearB]) => new Date(monthYearA) - new Date(monthYearB)).reverse();
  }

  // Slice the data to display only the current 6 months based on currentMonthIndex
  const slicedResolutionData = resolutionData.slice(currentMonthIndex, currentMonthIndex + 6);
  const slicedResponseData = responseData.slice(currentMonthIndex, currentMonthIndex + 6);

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} alt="SLA Validator" className="App-logo" /> */}
        <h1 className='penaltyProtection'>P3 – Proactive Penalty Protection</h1>
      </header>

      <div className="controls">
        <select value={selectedProject} onChange={handleProjectChange}>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>

        <button className="myButton">Dashboard</button>
        <button>Project</button>
        <button>Create</button>
        <button>Graph Layout</button>
        <button onClick={() => navigateTimePeriod('previous')}>Previous 6 Months</button>
        <button onClick={() => navigateTimePeriod('next')}>Next 6 Months</button>
      </div>

      <table>
        <thead classname='tableHeader'>
          <tr classname='tableRow'>
            <th>KPI</th>
            <th>Target (%)</th>
            {slicedResolutionData.map(([monthYear]) => (
          <th key={monthYear}>{formatMonthYear(monthYear)}</th>
        ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{monthlyData.resolution_sla_compliance.KPI}</td>
            <td>{monthlyData.resolution_sla_compliance.DefaultTarget}%</td>
            {slicedResolutionData.map(([monthYear, percentage]) => (
              <td key={monthYear} style={getStyleForPercentage(
                percentage,
                monthlyData.resolution_sla_compliance.DefaultTarget,
                RESOLUTION_WARNING_PERCENTAGE
              )}>
                {percentage.toFixed(2)}%
              </td>
            ))}
          </tr>
          <tr>
            <td>{monthlyData.response_sla_compliance.KPI}</td>
            <td>{monthlyData.response_sla_compliance.DefaultTarget}%</td>
            {slicedResponseData.map(([monthYear, percentage]) => (
              <td key={monthYear} style={getStyleForPercentage(
                percentage,
                monthlyData.response_sla_compliance.DefaultTarget,
                RESPONSE_WARNING_PERCENTAGE
              )}>
                {percentage.toFixed(2)}%
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
