export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-API-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  const url = new URL('https://developer.junglescout.com/api/' + (endpoint || ''));
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers = {
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json',
    'Authorization': req.headers['authorization'] || '',
    'X-API-Type': 'junglescout'
  };

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  });

  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
```
