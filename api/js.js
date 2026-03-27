export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { endpoint, ...rest } = req.query;
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

    const jsUrl = new URL(`https://developer.junglescout.com/api/${endpoint}`);
    Object.entries(rest).forEach(([k, v]) => jsUrl.searchParams.append(k, v));

    const auth = req.headers['authorization'] || '';
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
    res.status(response.status).setHeader('Content-Type', 'application/json').send(text);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
