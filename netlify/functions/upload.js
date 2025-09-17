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

    console.log(`Processing upload with ${Object.keys(uploadData.files).length} files`);

    // Create a gist with all the files
    const gistResult = await createGist(uploadData.files);

    if (!gistResult.success) {
      console.error('Failed to create gist:', gistResult.error);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to create gist', details: gistResult.error })
      };
    }

    console.log(`Gist created: ${gistResult.url}`);

    // Trigger repository_dispatch with just the gist URL
    const dispatchPayload = {
      event_type: 'shop_data_upload',
      client_payload: {
        gist_url: gistResult.url,
        gist_id: gistResult.id,
        file_count: Object.keys(uploadData.files).length,
        timestamp: new Date().toISOString(),
        source: uploadData.source || 'bodega-api'
      }
    };

    const dispatchResult = await makeGitHubRequest('/repos/Nisugi/bodega/dispatches', 'POST', dispatchPayload);

    if (dispatchResult.success) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: 'Upload successful via gist',
          gist_url: gistResult.url,
          timestamp: dispatchPayload.client_payload.timestamp
        })
      };
    } else {
      console.error('Failed to trigger workflow:', dispatchResult.error);
      // Still return success since gist was created
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: 'Gist created but workflow trigger failed',
          gist_url: gistResult.url,
          error: dispatchResult.error
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

async function createGist(files) {
  const gistPayload = {
    description: `Bodega shop data upload - ${new Date().toISOString()}`,
    public: false,
    files: {}
  };

  // Add each file to the gist
  for (const [filename, content] of Object.entries(files)) {
    gistPayload.files[filename] = {
      content: typeof content === 'string' ? content : JSON.stringify(content)
    };
  }

  const result = await makeGitHubRequest('/gists', 'POST', gistPayload);

  if (result.success) {
    const gistData = JSON.parse(result.data);
    return {
      success: true,
      url: gistData.html_url,
      id: gistData.id
    };
  } else {
    return {
      success: false,
      error: result.error
    };
  }
}

function makeGitHubRequest(path, method, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Bodega-Netlify-Function/2.0'
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