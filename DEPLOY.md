# Netlify Deployment Instructions

This guide shows how to deploy the Netlify function that handles API uploads for the bodega script.

## Quick Deploy to Netlify

### 1. Fork and Connect Repository
1. Fork this repository to your GitHub account
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Choose "GitHub" and select your forked repository
5. Build settings will be automatically detected from `netlify.toml`

### 2. Deploy
1. Click "Deploy site" in Netlify
2. Wait for build to complete
3. Your function will be available at: `https://YOUR-SITE-NAME.netlify.app/api/upload`

### 3. Update bodega.lic
1. Edit the `API_ENDPOINTS` array in bodega.lic:
   ```ruby
   API_ENDPOINTS = [
     "https://YOUR-SITE-NAME.netlify.app/api/upload",
   ]
   ```
2. Commit and push the updated script

## Alternative: Manual Deploy

If you prefer not to connect GitHub:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `netlify deploy --prod --dir .`

## Testing

Test your deployment:
```bash
curl -X POST https://YOUR-SITE-NAME.netlify.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{"files":{"test.json":"{\"test\":true}"}}'
```

You should see a workflow trigger in GitHub Actions.

## Security Notes

- No tokens or authentication required for basic functionality
- API endpoint handles data processing without credentials

## Troubleshooting

**Function not working?**
1. Check Netlify function logs in dashboard
2. Verify the function is deployed correctly
3. Test the endpoint directly

**Upload issues?**
1. Check GitHub Actions logs for processing errors
2. Verify API endpoint is reachable
3. Confirm data format is valid JSON

## Fallback

If the API fails, bodega.lic automatically falls back to the gist method, so uploads will still work even if Netlify is down.