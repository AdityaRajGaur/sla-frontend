import React, { useState } from 'react';

const SettingsForm = ({ onSaveSettings, onBackToTable , selectedProject }) => {
  const [internalResolutionTarget, setInternalResolutionTarget] = useState('');
  const [internalResponseTarget, setInternalResponseTarget] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Call the onSaveSettings function prop with the new settings values
    onSaveSettings({ internalResolutionTarget, internalResponseTarget });
  };

  return (
    <div>
       <h2>Settings for Project: {selectedProject}</h2>
    <form onSubmit={handleSubmit} style={{ margin: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="internalResolutionTarget" style={{ marginRight: '10px' }}>
          Internal Resolution Target (%):
        </label>
        <input
          id="internalResolutionTarget"
          type="text"
          value={internalResolutionTarget}
          onChange={(e) => setInternalResolutionTarget(e.target.value)}
          required
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="internalResponseTarget" style={{ marginRight: '10px' }}>
          Internal Response Target (%):
        </label>
        <input
          id="internalResponseTarget"
          type="text"
          value={internalResponseTarget}
          onChange={(e) => setInternalResponseTarget(e.target.value)}
          required
        />
      </div>
      <button type="submit" style={{ marginRight: '10px' }}>
        Save
      </button>
      <button type="button" onClick={onBackToTable}>
        Cancel
      </button>
    </form>
    </div>
  );
};

export default SettingsForm;
