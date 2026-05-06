const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/oauth/token', async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.REACT_APP_SF_CLIENT_ID);
    params.append('client_secret', process.env.REACT_APP_SF_CLIENT_SECRET);
    params.append('redirect_uri', process.env.REACT_APP_SF_REDIRECT_URI);
    params.append('code', req.body.code);
    params.append('code_verifier', req.body.code_verifier);

    const response = await axios.post(
      `${process.env.REACT_APP_SF_LOGIN_URL}/services/oauth2/token`,
      params
    );
    res.json(response.data);
  } catch (error) {
    console.error('Token error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/api/validation-rules', async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.query;
    const response = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/query?q=SELECT+Id,ValidationName,Active,Description,EntityDefinition.QualifiedApiName+FROM+ValidationRule+WHERE+EntityDefinition.QualifiedApiName='Account'`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Rules error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.patch('/api/validation-rules/:id', async (req, res) => {
  try {
    const { accessToken, instanceUrl } = req.query;
    const { id } = req.params;
    const { active } = req.body;

    // First get the full metadata of the rule
    const getResponse = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const existingMetadata = getResponse.data.Metadata;

    // Then update with full metadata
    await axios.patch(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${id}`,
      { Metadata: { ...existingMetadata, active } },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Toggle error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(5000, () => console.log('Proxy server running on port 5000'));