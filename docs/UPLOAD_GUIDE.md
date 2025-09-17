# Automated Shop Data Updates

The bodega script supports automatic upload of shop data to the GitHub repository. Players can contribute data updates that will be automatically processed and merged.

## Zero Setup Required! 🎉

**No authentication needed**: The bodega script includes built-in bot authentication, so any player can upload data immediately without creating accounts or tokens.

## How It Works

1. **Run the bodega script** with the `--upload` option
2. **Script creates GitHub Gists** with your JSON data (supports large files up to 8MB)
3. **GitHub Issues created** referencing the gist for processing (using built-in bot authentication)
4. **GitHub Actions automatically processes** the gist data from issues
5. **Valid data gets merged** and the website updates within 1-2 minutes with detailed timestamps
6. **Smart duplicate detection** prevents uploading the same data using SHA256 file hashing

## Usage Examples

### Update All Towns
```bash
;bodega --parser --save --upload
```

### Update Single Town
```bash
;bodega --parser --town=wehnimer --save --upload
```

### Update Single Shop
```bash
;bodega --parser --shop-id=123 --save --upload
```

### Test Run (No Upload)
```bash
;bodega --parser --dry-run
```

## What Happens When You Upload

1. **Gist Creation**: A GitHub Gist is created with all your JSON files (up to 8MB each):
   `https://gist.github.com/bodega-uploads-bot/[gist-id]`

2. **Issue Creation**: A single GitHub Issue is created referencing the gist:
   `https://github.com/Nisugi/bodega/issues`

3. **Automatic Processing**: GitHub Actions will:
   - Download JSON files from the gist
   - Validate the JSON format and structure
   - Check for conflicts with recent updates using file hashing
   - Auto-merge valid data with detailed timestamps

4. **Website Update**: Once merged, the website automatically updates with your data showing per-town update times

## Status Messages

After running the script, you'll see messages like:

```
[upload] Starting upload process...
[upload] Preparing wehnimers_landing.json for upload
[upload] Preparing mist_harbor.json for upload
[upload] Creating gist with 2 file(s)...
[upload] Gist created: https://gist.github.com/bodega-uploads-bot/abc123...
[upload] Created issue #42: https://github.com/Nisugi/bodega/issues/42
[upload] Upload complete! 2 uploaded, 0 skipped
```

## Automatic Processing

### ✅ Auto-Merged (Happy Path)
- Valid JSON format
- Proper data structure
- No conflicts detected
- Gets merged automatically within 1-2 minutes

### ⚠️ Manual Review Queue
- Potential conflicts detected (multiple updates to same town)
- Unusual data patterns
- Will be reviewed by maintainers

### ❌ Validation Failed
- Invalid JSON format
- Missing required fields
- Will receive error message with details

## Viewing Your Updates

1. **Check gist content** at the URL provided in upload messages
2. **Check issue status** at: `https://github.com/Nisugi/bodega/issues`
3. **View the website** at: `https://nisugi.github.io/bodega/`
4. **Browse your data** using the new Browse mode (Town → Shop → Room)
5. **Check timestamps** in the "Town Updates" section showing when each town was last updated

## Troubleshooting

### No Issues Created
- Check your internet connection
- Verify you're running the updated bodega script
- Issues may be rate limited (max 60/hour per IP)

### Validation Failed
- Check the GitHub issue for error details
- Common issues: malformed JSON, missing fields
- Fix the issue and run the script again

### Data Not Appearing
- Wait 1-2 minutes for automatic deployment
- Check if the issue was auto-merged or needs manual review
- Refresh the website

## Rate Limits

- **GitHub API**: 5,000 requests per hour (shared bot account)
- **Gist creation**: 1 request per upload (regardless of file count)
- **Issue creation**: 1 request per upload
- **Full updates** (9 towns): Uses 2 requests total (1 gist + 1 issue)
- **Single town**: Uses 2 requests total (1 gist + 1 issue)

The new gist-based system is much more efficient and uses fewer API requests. The bot account has generous rate limits that should accommodate the entire community.

## Contributing

This system allows the entire player community to contribute shop data:

- **No registration required**
- **No authentication needed**
- **Automatic validation**
- **Community-maintained database**

Just run your bodega script with `--upload` and you're contributing to the shared shop database!

## Support

If you encounter issues:

1. Check the GitHub issue comments for error details
2. Create a manual issue at: `https://github.com/Nisugi/bodega/issues/new`
3. Include your error messages and what you were trying to do

---

*Happy shopping! 🛒*