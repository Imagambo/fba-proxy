module.exports = async function handler(req, res) {
  const origin = req.headers['origin'] || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-JS-Name,X-JS-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { endpoint, ...rest } = req.query;

    // Claude AI route
    if (endpoint === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(req.body)
      });
      const text = await response.text();
      return res.status(response.status)
        .setHeader('Content-Type', 'application/json')
        .send(text);
    }

    // Jungle Scout route
    const jsUrl = new URL(`https://developer.junglescout.com/api/${endpoint}`);
    Object.entries(rest).forEach(([k, v]) => jsUrl.searchParams.append(k, v));

    const jsName = req.headers['x-js-name'] || '';
    const jsKey  = req.headers['x-js-key']  || '';
    const auth   = jsName && jsKey ? `${jsName}:${jsKey}` : (req.headers['authorization'] || '');

    const response = await fetch(jsUrl.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/vnd.junglescout.v1+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': auth,
        'X-API-Type': 'junglescout'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const text = await response.text();
    res.status(response.status)
      .setHeader('Content-Type', 'application/json')
      .send(text);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
