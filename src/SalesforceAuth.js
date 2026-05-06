const SF_LOGIN_URL = process.env.REACT_APP_SF_LOGIN_URL;
const CLIENT_ID = process.env.REACT_APP_SF_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SF_REDIRECT_URI;

const generateCodeVerifier = () => {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ('0' + dec.toString(16)).slice(-2)).join('');
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const loginWithSalesforce = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem('code_verifier', codeVerifier);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  const authUrl = `${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  window.location.href = authUrl;
};

export const getTokenFromCode = async (code) => {
  const codeVerifier = sessionStorage.getItem('code_verifier');
  console.log('Calling Render server...');
  const response = await fetch('https://sf-validation-server.onrender.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
    }),
  });
  const data = await response.json();
  return data;
};