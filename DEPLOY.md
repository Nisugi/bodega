# Netlify Deployment Instructions

This guide shows how to deploy the Netlify function that handles API uploads for the bodega script.

## Quick Deploy to Netlify

### 1. Fork and Connect Repository
1. Fork this repository to your GitHub account
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Choose "GitHub" and select your forked repository
5. Build settings will be automatically detected from `netlify.toml`

### 2. Configure Environment Variables
1. In Netlify dashboard, go to "Site settings" → "Environment variables"
2. Add a new variable:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: Your GitHub Personal Access Token (see below)

### 3. Create GitHub Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "Bodega Netlify Upload"
4. Select scopes:
   - ✅ `repo` (for repository_dispatch)
   - ✅ `workflow` (for triggering workflows)
5. Generate token and copy it
6. Paste into Netlify environment variable (step 2)

### 4. Deploy
1. Click "Deploy site" in Netlify
2. Wait for build to complete
3. Your function will be available at: `https://YOUR-SITE-NAME.netlify.app/api/upload`

### 5. Update bodega.lic
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
4. Set environment variable: `netlify env:set GITHUB_TOKEN your_token_here`

## Testing

Test your deployment:
```bash
curl -X POST https://YOUR-SITE-NAME.netlify.app/api/upload \
  -H "Content-Type: application/json" \
  -d '{"files":{"test.json":"{\"test\":true}"}}'
```

You should see a workflow trigger in GitHub Actions.

## Security Notes

- The GitHub token is stored securely in Netlify environment variables
- Never commit tokens to the repository
- The token only needs `repo` and `workflow` scopes
- Consider using a dedicated bot account for the token

## Troubleshooting

**Function not working?**
1. Check Netlify function logs in dashboard
2. Verify environment variable is set
3. Ensure GitHub token has correct permissions

**Workflow not triggering?**
1. Check that repository_dispatch is enabled in workflow file
2. Verify token has `repo` and `workflow` scopes
3. Look at GitHub Actions logs for errors

## Fallback

If the API fails, bodega.lic automatically falls back to the gist/issue method, so uploads will still work even if Netlify is down.