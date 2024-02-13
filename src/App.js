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
    Target: 0, // Default target percentage
    CurrentStatus: '',
    CriteriaMet: ''
  });

  //Function to fetch SLA response compliance
  const fetchResponseSLACompliance = () => {
    // Validation if needed
    if (isNaN(responseSLA.Target)) {
      alert('Please enter a valid threshold percentage for Response SLA.');

    }

    setLoading(true);
    // Assuming your backend can handle this endpoint
    axios.post('http://localhost:8000/api/check-threshold', {
      threshold: responseSLA.Target,
      start_date: customStartDate,
      end_date: customEndDate,
      durationType: durationType
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
  const fetchSLACompliance = (startDate, endDate, target, durationType) => {
    // Only proceed if target is a number
    if (isNaN(target)) {
      alert('Please enter a valid threshold percentage.');
      return;
    }
    //TODO keep the url in a config file
    setLoading(true);
    axios.post('http://localhost:8000/api/check-threshold', {
      threshold: target,
      start_date: startDate,
      end_date: endDate,
      durationType: durationType
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
    Target: 0, // Default target percentage for response SLA
    CurrentStatus: '',
    CriteriaMet: ''
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

  const handleDurationChange = (event) => {
    setDurationType(event.target.value); // Get the selected duration type
  };

  const handleSubmit = (event, type) => {
    console.log("line 116")
    event.preventDefault();
    if (type === 'resolution') {
      fetchSLACompliance(customStartDate, customEndDate, resolutionSLA.Target, durationType);
    } else if (type === 'response') {
      fetchResponseSLACompliance(customStartDate, customEndDate, responseSLA.Target, durationType);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="SLA Validator" className="App-logo" />
        <h1>SLA Validator</h1>
      </header>
      <form onSubmit={handleSubmit} className="sla-form">

        <div className="form-group duration">
          <label htmlFor="duration" className="input-label">Duration</label>
          <select id="duration" name="duration" value={durationType} onChange={handleDurationChange}>
            <option value="current_month">Current Month</option>
            <option value="custom_date_range">Custom Date Range</option>
          </select>
        </div>
        {durationType === 'custom_date_range' && (
          <div className="custom-date">
            <div className="form-group">
              <label htmlFor="custom_start_date" className="input-label">Start Date</label>
              <input
                type="date"
                id="custom_start_date"
                name="custom_start_date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group custom-end-date">
              <label htmlFor="custom_end_date" className="input-label">End Date</label>
              <input
                type="date"
                id="custom_end_date"
                name="custom_end_date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>KPI</th>
              <th>Target (%)</th>
              <th>Check Threshold</th>
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
              <td>
                <button variant="contained"
                  onClick={(e) => handleSubmit(e, 'resolution')}
                  disabled={loading}
                >
                  Compute
                </button>
              </td>
              <td>{resolutionSLA.CurrentStatus}</td>
              <td className={resolutionSLA.CriteriaMet === 'Yes' ? 'yes' : 'no' }>{resolutionSLA.CriteriaMet}</td>
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
              <td>
                <button variant="contained"
                  onClick={(e) => handleSubmit(e, 'response')}
                  disabled={loading}
                >
                  Compute
                </button>
              </td>
              <td>{responseSLA.CurrentStatus}</td>
              <td className={responseSLA.CriteriaMet === 'Yes' ? 'yes' : 'no' }>{responseSLA.CriteriaMet}</td>
            </tr>
          </tbody>
        </table>
      </form>
      {/* {thresholdBreached && <div className="result">{thresholdBreached}</div>} */}
    </div>
  );
}

export default App;