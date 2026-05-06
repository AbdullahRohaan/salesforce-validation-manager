import React, { useState, useEffect } from 'react';
import { loginWithSalesforce, getTokenFromCode } from './SalesforceAuth';
import { getValidationRules, toggleValidationRule } from './ValidationRules';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [instanceUrl, setInstanceUrl] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code) => {
  setLoading(true);
  try {
    const data = await getTokenFromCode(code);
    if (data.access_token) {
      setAccessToken(data.access_token);
      setInstanceUrl(data.instance_url);
      setMessage('✅ Successfully logged in to Salesforce!');
      window.history.replaceState({}, document.title, '/');
    } else if (data.error === 'invalid_grant') {
      // Code already used, ignore the error if we're already logged in
      window.history.replaceState({}, document.title, '/');
    } else {
      setMessage('❌ Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    window.history.replaceState({}, document.title, '/');
  }
  setLoading(false);
};

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getValidationRules(accessToken, instanceUrl);
      setRules(data);
      setMessage(`✅ Found ${data.length} validation rules.`);
    } catch (error) {
      setMessage('❌ Error fetching rules.');
    }
    setLoading(false);
  };

  const handleToggle = async (ruleId, currentStatus) => {
  setLoading(true);
  try {
    const success = await toggleValidationRule(
      accessToken,
      instanceUrl,
      ruleId,
      !currentStatus
    );
    if (success) {
      setRules(prevRules => prevRules.map((rule) =>
        rule.Id === ruleId ? { ...rule, Active: !currentStatus } : rule
      ));
      setMessage(`✅ Rule updated successfully!`);
    } else {
      setMessage('❌ Failed to update rule.');
    }
  } catch (error) {
    console.error('Toggle error:', error);
    setMessage('❌ Error updating rule.');
  }
  setLoading(false);
};

  const handleToggleAll = async (activate) => {
    setLoading(true);
    try {
      for (const rule of rules) {
        await toggleValidationRule(accessToken, instanceUrl, rule.Id, activate);
      }
      setRules(rules.map((rule) => ({ ...rule, Active: activate })));
      setMessage(`✅ All rules ${activate ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      setMessage('❌ Error updating rules.');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Salesforce Validation Rule Manager</h1>

      {message && <p className="message">{message}</p>}
      {loading && <p>Loading...</p>}

      {!accessToken ? (
        <button onClick={loginWithSalesforce} className="btn login-btn">
          🔐 Login with Salesforce
        </button>
      ) : (
        <div>
          <div className="actions">
            <button onClick={fetchRules} className="btn">
              🔄 Get Validation Rules
            </button>
            <button onClick={() => handleToggleAll(true)} className="btn activate-btn">
              ✅ Enable All
            </button>
            <button onClick={() => handleToggleAll(false)} className="btn deactivate-btn">
              ❌ Disable All
            </button>
          </div>

          {rules.length > 0 && (
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.Id}>
                    <td>{rule.ValidationName}</td>
                    <td>
                      <span className={rule.Active ? 'active' : 'inactive'}>
                        {rule.Active ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(rule.Id, rule.Active)}
                        className={`btn ${rule.Active ? 'deactivate-btn' : 'activate-btn'}`}
                      >
                        {rule.Active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;