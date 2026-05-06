export const getValidationRules = async (accessToken, instanceUrl) => {
  const response = await fetch(
    `http://localhost:5000/api/validation-rules?accessToken=${accessToken}&instanceUrl=${encodeURIComponent(instanceUrl)}`
  );
  const data = await response.json();
  return data.records;
};

export const toggleValidationRule = async (accessToken, instanceUrl, ruleId, isActive) => {
  const response = await fetch(
    `http://localhost:5000/api/validation-rules/${ruleId}?accessToken=${accessToken}&instanceUrl=${encodeURIComponent(instanceUrl)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: isActive }),
    }
  );
  const data = await response.json();
  return data.success;
};