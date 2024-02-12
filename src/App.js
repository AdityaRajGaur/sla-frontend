import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './sla-validator-logo.png';

function App() {
  const [loading, setLoading] = useState(false);
  const [durationType, setDurationType] = useState('current_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [resolutionSLA, setResolutionSLA] = useState({
    KPI: 'Resolution SLA Compliance',
    Target: 90, // Default target percentage
    CurrentStatus: '0.0%',
    CriteriaMet: 'No'
  });

//Function to fetch SLA response compliance
const fetchResponseSLACompliance = () => {
  // Validation if needed
  if (isNaN(responseSLA.Target)) {
    alert('Please enter a valid threshold percentage for Response SLA.');
    return;
  }

  setLoading(true);
  // Assuming your backend can handle this endpoint
  axios.post('http://localhost:8000/api/check-threshold', {
    threshold: responseSLA.Target,
    start_date: customStartDate,
    end_date: customEndDate,
  })
  .then(response => {
    setLoading(false);
    console.log(response)
    setResponseSLA(prevState => ({
      ...prevState,
      CurrentStatus: response.data.response_sla_compliance['Current Status'],
      CriteriaMet: response.data.response_sla_compliance['Criteria met']
    }));
  })
  .catch(error => {
    setLoading(false);
    console.error('Error:', error);
    });
  };


  // Function to fetch SLA Compliance
  const fetchSLACompliance = (startDate, endDate, target) => {
    // Only proceed if target is a number
    if (isNaN(target)) {
      alert('Please enter a valid threshold percentage.');
      return;
    }

    setLoading(true);
    axios.post('http://localhost:8000/api/check-threshold', {
      threshold: target,
      start_date: startDate,
      end_date: endDate,
    })
    .then(response => {
      setLoading(false);
      setResolutionSLA(prevState => ({
        ...prevState,
        CurrentStatus: response.data.resolution_sla_compliance['Current Status'],
        CriteriaMet: response.data.resolution_sla_compliance['Criteria met']
      }));
    }).catch(error => {
      setLoading(false);
      console.error('Error:', error);
    });
  };
  
  // Effect to set the default dates
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const currentDay = today.toISOString().split('T')[0];
    setCustomStartDate(firstDayOfMonth);
    setCustomEndDate(currentDay);
  }, []);

  const [responseSLA, setResponseSLA] = useState({
    KPI: 'Response SLA Compliance',
    Target: 90, // Default target percentage for response SLA
    CurrentStatus: '0.0%',
    CriteriaMet: 'No'
  });

  const handleResponseThresholdChange = (event) => {
    setResponseSLA(prevState => ({
      ...prevState,
      Target: event.target.value === '' ? '' : parseFloat(event.target.value) || ''
    }));
  };
  
  const handleThresholdChange = (event) => {
    setResolutionSLA(prevState => ({
      ...prevState,
      Target: event.target.value === '' ? '' : parseFloat(event.target.value) || ''
    }));
  };


  const handleKeyDown = (event) => {
    console.log("line 63")
    // Check if the Enter key was pressed
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(event);
    }
  };
  const handleDurationChange = (event) => {
    setDurationType(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchSLACompliance(customStartDate, customEndDate, resolutionSLA.Target);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="SLA Validator" className="App-logo" />
        <h1>SLA Validator</h1>
      </header>
      <form onSubmit={handleSubmit} className="sla-form">
        <div className="form-group">
          <label htmlFor="target" className="input-label">Valid Threshold Percentage</label>
          <input
            type="number"
            id="target"
            name="target"
            value={resolutionSLA.Target}
            onChange={handleThresholdChange}
            onKeyDown={handleKeyDown} // Use onKeyDown instead of onKeyPress
             required
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration" className="input-label">Duration</label>
          <select id="duration" name="duration" value={durationType} onChange={handleDurationChange}>
            <option value="current_month">Current Month</option>
            <option value="custom_date_range">Custom Date Range</option>
          </select>
        </div>
        {durationType === 'custom_date_range' && (
          <div className="form-group">
            <label htmlFor="custom_start_date" className="input-label">Custom Start Date</label>
            <input
              type="date"
              id="custom_start_date"
              name="custom_start_date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              required
            />
            <label htmlFor="custom_end_date" className="input-label">Custom End Date</label>
            <input
              type="date"
              id="custom_end_date"
              name="custom_end_date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Checking...' : 'Check Threshold'}
        </button>
        <div className="form-group">
        <label htmlFor="response-target" className="input-label">Response SLA Valid Threshold Percentage</label>
        <input
          type="number"
          id="response-target"
          name="response-target"
          value={responseSLA.Target}
          onChange={handleResponseThresholdChange}
          required
        />
      </div>
      <button onClick={fetchResponseSLACompliance} disabled={loading}>
        {loading ? 'Checking...' : 'Check Response SLA'}
      </button>
      </form>
      <table>
        <thead>
          <tr>
            <th>KPI</th>
            <th>Target (%)</th>
            <th>Current Status</th>
            <th>Criteria met?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{resolutionSLA.KPI}</td>
            <td>
              <input
                type="number"
                value={resolutionSLA.Target}
                onChange={handleThresholdChange}
              />
            </td>
            <td>{resolutionSLA.CurrentStatus}</td>
            <td>{resolutionSLA.CriteriaMet}</td>
          </tr>
          <tr>
            <td>{responseSLA.KPI}</td>
            <td>
              <input
                type="number"
                value={responseSLA.Target}
                onChange={handleResponseThresholdChange}
              />
            </td>
            <td>{responseSLA.CurrentStatus}</td>
            <td>{responseSLA.CriteriaMet}</td>
          </tr>
        </tbody>
      </table>

      {/* {thresholdBreached && <div className="result">{thresholdBreached}</div>} */}
    </div>
  );
}

export default App;
