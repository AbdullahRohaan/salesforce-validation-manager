export const getValidationRules = async (accessToken, instanceUrl) => {
  const response = await fetch(
    `https://dashboard.render.com/web/srv-d7th92q8qa3s73c4f3ug/deploys/dep-d7th9328qa3s73c4f4p0?r=2026-05-06%4010%3A13%3A36%7E2026-05-06%4010%3A18%3A07/api/validation-rules?accessToken=${accessToken}&instanceUrl=${encodeURIComponent(instanceUrl)}`
  );
  const data = await response.json();
  return data.records;
};

export const toggleValidationRule = async (accessToken, instanceUrl, ruleId, isActive) => {
  const response = await fetch(
    `https://dashboard.render.com/web/srv-d7th92q8qa3s73c4f3ug/deploys/dep-d7th9328qa3s73c4f4p0?r=2026-05-06%4010%3A13%3A36%7E2026-05-06%4010%3A18%3A07/api/validation-rules/${ruleId}?accessToken=${accessToken}&instanceUrl=${encodeURIComponent(instanceUrl)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: isActive }),
    }
  );
  const data = await response.json();
  return data.success;
};