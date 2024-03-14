import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import logo from './sla-validator-logo.png';
import nagarroIcon from './nag-icon.svg';
import graphIcon from './graph-img.svg';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, LabelList, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './App.css';
import urlConfig from './url_config.json';
import SettingsForm from './SettingsForm';
import SettingsIcon from './configure-icon.svg';
import tableIcon from './table-icon.svg';



function App() {
  const [monthlyData, setMonthlyData] = useState(null);
  // const RESOLUTION_WARNING_PERCENTAGE = urlConfig.RESOLUTION_WARNING_PERCENTAGE;
  // const RESPONSE_WARNING_PERCENTAGE = urlConfig.RESPONSE_WARNING_PERCENTAGE;
  const [selectedProject, setSelectedProject] = useState('TIC');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // Index to track current month
  const [showGraph, setShowGraph] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Dummy project list
  const projects = ['TIC', 'ES', 'Project 3'];

  const saveSettingsToBackend = async (settings) => {
    try {
      const response = await axios.put(urlConfig.backendSettingsURL, settings);
      console.log('Settings saved:', response.data);
      // Add logic to update the state or inform the user of the success
      setShowSettings(false); // This will close the settings form
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSettingsView = () => {
    setShowSettings(!showSettings); // Toggle visibility of the SettingsForm
  };

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
    // Fetch data for the new project,yet to complete
  };

  const navigateTimePeriod = (direction) => {
    if (direction === 'previous') {
      setCurrentMonthIndex((prevIndex) => prevIndex - 6);
    } else if (direction === 'next') {
      setCurrentMonthIndex((prevIndex) => prevIndex + 6);
    }
  };
  function convertDataToChartFormat(resolutionData, responseData) {
    // This is a placeholder function,need to replace it with real logic
    return resolutionData.map((item, index) => ({
      monthYear: item[0],
      resolutionSLA: item[1],
      responseSLA: responseData[index][1],
    }));
  }

  const handleGraphLayoutClick = () => {
    setShowGraph(!showGraph); // Toggle between showing the graph and the table
  };

  // Checks if there is data available for the previous period
  const hasPreviousData = () => {
    // Assuming the resolutionData is sorted in descending order of months
    return currentMonthIndex > 0;
  };

  // Checks if there is data available for the next period
  const hasNextData = () => {
    // Assuming the resolutionData is sorted in descending order of months
    const lastDataIndex = resolutionData.length - 1;
    const maxMonthIndex = lastDataIndex - (lastDataIndex % 6);
    return currentMonthIndex < maxMonthIndex;
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

  const getStyleForPercentage = (percentage, actualTarget, internalTarget) => {
    percentage = parseFloat(percentage);
    actualTarget = parseFloat(actualTarget);
    internalTarget = parseFloat(internalTarget);
    //console.log(`Percentage: ${percentage}, Actual Target: ${actualTarget}, Internal Target: ${internalTarget}`);

    if (percentage < actualTarget) {
      return { color: 'red' };
    }

    // Check if percentage is between the actual target and the internal target
    else if (percentage >= actualTarget && percentage < internalTarget) {
      return { color: 'orange' };
    }

    // If none of the above, return green
    else {
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
  function ColorCodeNote() {
    if (!monthlyData) {
      return <p>Loading...</p>;
    }

    return (
      <div className="color-code-note">
        <div>
          <span className="color-indicator" style={{ backgroundColor: '#2F9E44' }}>
          </span>
          Above internal threshold | Resolution: {monthlyData.resolution_sla_compliance.internalResolutionTarget}%, Response: {monthlyData.response_sla_compliance.internalResponseTarget}%
        </div>
        <div>
          <span className="color-indicator" style={{ backgroundColor: '#F09D2E' }}>
          </span>
          Between actual and internal threshold
        </div>
        <div>
          <span className="color-indicator" style={{ backgroundColor: '#EF4A5F' }}>
          </span>
          Below actual threshold | Resolution: {monthlyData.resolution_sla_compliance.actualResolutionTarget}% , Response: {monthlyData.response_sla_compliance.actualResponseTarget}%
        </div>
      </div>
    );
  }



  // Slice the data to display only the current 6 months based on currentMonthIndex
  const slicedResolutionData = resolutionData.slice(currentMonthIndex, currentMonthIndex + 6);
  const slicedResponseData = responseData.slice(currentMonthIndex, currentMonthIndex + 6);

  // preparing chart data
  const chartData = convertDataToChartFormat(slicedResolutionData, slicedResponseData);

  // const CustomLabel = (props) => {
  //   const { x, y, stroke, value } = props;

  //   return (
  //     <text x={x} y={y - 10} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
  //       {`${value.toFixed(2)}%`}
  //     </text>
  //   );
  // };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-and-title">
          <img src={nagarroIcon} alt="Nagarro Icon" className="n-icon" />
          <div className="dashboard-label">Dashboard</div>
        </div>
        {/* other navigation links if any here */}
        <div className="settings-container">
          <button className="settings-icon" onClick={toggleSettingsView}>
            <img src={SettingsIcon} alt="Settings" />
          </button>
        </div>
      </header>

      {showSettings ? (
        // Render the settings form when showSettings is true
        <SettingsForm
          onSaveSettings={saveSettingsToBackend}
          onBackToTable={toggleSettingsView}
          selectedProject={selectedProject} // Pass the selected project as a prop
        />

      ) : (
        // Render the main dashboard view (graph or table) when showSettings is false
        <div className='sub-app'>
          <h1 className='penaltyProtection'>P3 – Proactive Penalty Protection</h1>
          <div className="controls">
            <div className='left-section'>
              <label>Project: </label>
              <select value={selectedProject} onChange={handleProjectChange}>
                {projects.map(project => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="graph-icon" onClick={handleGraphLayoutClick}>
                <img src={showGraph ? tableIcon : graphIcon} alt={showGraph ? "Table Layout" : "Graph Layout"} />
              </button>

              <button
                className="prev-button"
                onClick={() => navigateTimePeriod('previous')}
                disabled={!hasPreviousData()} // Disable button when there is no previous data
              >
                Next 6 Months &gt;
              </button>
              <button
                className="next-button"
                onClick={() => navigateTimePeriod('next')}
                disabled={!hasNextData()} // Disable button when there is no next data
              >
                &lt; Previous 6 Months
              </button>
              {/* {hasPreviousData() && (
              <button className="prev-button" onClick={() => navigateTimePeriod('previous')}>
                Next 6 Months &gt;
              </button>
            )}
            {hasNextData() && (
              <button onClick={() => navigateTimePeriod('next')}>
                &lt; Previous 6 Months
              </button>
            )} */}
            </div>
          </div>

          {selectedProject === 'TIC' ? (
            showGraph ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="transparent" // Hide vertical lines
                    fill="rgba(196, 200, 209, 0.24)"
                  />
                  <XAxis dataKey="monthYear" tickFormatter={formatMonthYear} />
                  <YAxis domain={['auto', 'auto']} padding={{ top: 20 }} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine
                    y={parseFloat(monthlyData.resolution_sla_compliance.internalResolutionTarget)}
                    stroke="#8884d8"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine
                    y={parseFloat(monthlyData.response_sla_compliance.internalResponseTarget)}
                    stroke="#82ca9d"
                    strokeDasharray="3 3"
                  />
                  <Line type="monotone" dataKey="resolutionSLA" stroke="#8884d8" activeDot={{ r: 8 }} >
                    <LabelList dataKey="resolutionSLA" position="top" style={{ fill: 'blue' }} formatter={(value) => `${value}%`} />
                    {/* <LabelList content={<CustomLabel />} /> */}
                  </Line>
                  <Line type="monotone" dataKey="responseSLA" stroke="#82ca9d" >
                    <LabelList dataKey="responseSLA" position="top" style={{ fill: 'green' }} formatter={(value) => `${value}%`} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="data-and-note-container">
                <div className="data-container">
                  <table>
                    <thead className='tableHeader'>
                      <tr className='tableRow'>
                        <th className="kpi-column">KPI</th>
                        <th>Target (%)</th>
                        {/* Render placeholders for the maximum number of months */}
                        {Array.from({ length: 6 }, (_, i) => (
                          <th key={i}>
                            {slicedResolutionData[i] ? formatMonthYear(slicedResolutionData[i][0]) : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td className="kpi-column">{monthlyData.resolution_sla_compliance.KPI}</td>
                        <td className='target'>{monthlyData.resolution_sla_compliance.actualResolutionTarget}%</td>
                        {/* Use Array.from to ensure that we always render 6 cells */}
                        {Array.from({ length: 6 }, (_, i) => (
                          <td key={i} style={slicedResolutionData[i] ? getStyleForPercentage(
                            slicedResolutionData[i][1],
                            monthlyData.resolution_sla_compliance.actualResolutionTarget,
                            monthlyData.resolution_sla_compliance.internalResolutionTarget
                          ) : {}}>
                            {slicedResolutionData[i] ? `${slicedResolutionData[i][1].toFixed(2)}%` : ''}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="kpi-column">{monthlyData.response_sla_compliance.KPI}</td>
                        <td className='target'>{monthlyData.response_sla_compliance.actualResponseTarget}%</td>
                        {Array.from({ length: 6 }, (_, i) => (
                          <td key={i} style={slicedResponseData[i] ? getStyleForPercentage(
                            slicedResponseData[i][1],
                            monthlyData.response_sla_compliance.actualResponseTarget,
                            monthlyData.response_sla_compliance.internalResponseTarget
                          ) : {}}>
                            {slicedResponseData[i] ? `${slicedResponseData[i][1].toFixed(2)}%` : ''}
                          </td>
                        ))}
                      </tr>
                    </tbody>

                  </table>
                </div>
                <ColorCodeNote />
              </div>
            )
          ) : (
            <p>No data available for the selected project</p>
          )}
        </div>
      )}
    </div>
  );


}

export default App;
