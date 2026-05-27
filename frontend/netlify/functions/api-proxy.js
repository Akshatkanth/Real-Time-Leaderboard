const { URL } = require('url');

exports.handler = async (event) => {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'BACKEND_URL is not configured.' }),
    };
  }

  const targetUrl = new URL(event.path.replace(/^\/api/, ''), backendUrl);

  if (event.queryStringParameters) {
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, value);
      }
    }
  }

  const headers = {
    'Content-Type': event.headers['content-type'] || event.headers['Content-Type'] || 'application/json',
  };

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(targetUrl.toString(), {
    method: event.httpMethod,
    headers,
    body: event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD'
      ? event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : event.body
      : undefined,
  });

  const responseBody = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';

  return {
    statusCode: response.status,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
    body: responseBody,
  };
};