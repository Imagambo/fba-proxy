export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-API-Type,x-js-key-name,x-js-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint, ...params } = req.query;
  const url = new URL('https://developer.junglescout.com/api/' + (endpoint || ''));
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const keyName = req.headers['x-js-key-name'] || '';
  const apiKey = req.headers['x-js-api-key'] || '';

  const headers = {
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json',
    'Authorization': `${keyName}:${apiKey}`,
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