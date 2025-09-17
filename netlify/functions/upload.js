const https = require('https');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: ''
    };
  }

  try {
    // Parse the incoming JSON data
    const uploadData = JSON.parse(event.body);

    // Validate required fields
    if (!uploadData.files || typeof uploadData.files !== 'object') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing or invalid files data' })
      };
    }

    // Prepare repository_dispatch payload
    const dispatchPayload = {
      event_type: 'shop_data_upload',
      client_payload: {
        files: uploadData.files,
        timestamp: new Date().toISOString(),
        source: 'bodega-script'
      }
    };

    // GitHub repository_dispatch API call
    const githubResponse = await makeGitHubRequest(dispatchPayload);

    if (githubResponse.success) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: 'Upload triggered successfully',
          timestamp: dispatchPayload.client_payload.timestamp
        })
      };
    } else {
      console.error('GitHub API error:', githubResponse.error);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to trigger upload workflow' })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function makeGitHubRequest(payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/repos/Nisugi/bodega/dispatches',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Bodega-Netlify-Function/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}: ${responseData}`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}