export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { endpoint, marketplace = 'us', asin_value, start_date, end_date, ...rest } = req.query;

    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint query param required' });
    }

    const jsUrl = new URL(`https://developer.junglescout.com/api/${endpoint}`);
    jsUrl.searchParams.set('marketplace', marketplace);

    if (asin_value) jsUrl.searchParams.set('filter[asins]', asin_value);
    if (start_date) jsUrl.searchParams.set('filter[start_date]', start_date);
    if (end_date) jsUrl.searchParams.set('filter[end_date]', end_date);

    Object.entries(rest).forEach(([k, v]) => jsUrl.searchParams.set(k, v));

    const auth = req.headers['authorization'] || req.headers['x-auth'] || '';

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

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
