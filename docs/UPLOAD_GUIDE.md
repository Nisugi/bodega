# Automated Shop Data Updates

The bodega script supports automatic upload of shop data to the GitHub repository. Players can contribute data updates that will be automatically processed and merged.

## Zero Setup Required! 🎉

**No authentication needed**: The bodega script includes built-in API access, so any player can upload data immediately without creating accounts or tokens.

## How It Works

1. **Run the bodega script** with the `--upload` option
2. **API upload** sends your JSON data directly to GitHub Actions (supports files up to 25MB)
3. **Automated processing** validates and merges data within 1-2 minutes
4. **Smart duplicate detection** prevents uploading the same data using SHA256 file hashing
5. **Fallback system** uses GitHub Gists if the API is unavailable
6. **Website updates** reflect your contributions with detailed timestamps

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
;bodega --parser --shop="Silverwood Manor" --save --upload
```


### Test Run (No Upload)
```bash
;bodega --parser --dry-run
```

## What Happens When You Upload

1. **API Upload**: Your JSON files are sent directly to GitHub Actions (up to 25MB each)

2. **Automatic Processing**: GitHub Actions will:
   - Validate the JSON format and structure
   - Check for conflicts with recent updates using file hashing
   - Auto-merge valid data with detailed timestamps

3. **Website Update**: The website automatically updates with your data showing per-town update times

4. **Fallback System**: If the API is unavailable, the script automatically falls back to creating GitHub Gists with your data

## Status Messages

After running the script, you'll see messages like:

**API Upload (Primary):**
```
[upload] Starting upload process...
[upload] Preparing wehnimers_landing.json for upload
[upload] Preparing mist_harbor.json for upload
[upload] API upload successful
[upload] Upload complete! 2 uploaded, 0 skipped
```

**Fallback Upload (If API Unavailable):**
```
[upload] Starting upload process...
[upload] API upload failed, falling back to gist method
[upload] Creating gist with 2 file(s)...
[upload] Gist created: https://gist.github.com/abc123...
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

1. **View the website** at: `https://nisugi.github.io/bodega/`
2. **Browse your data** using Browse mode (Town → Shop → Room → Items)
3. **Check timestamps** in the live news ticker showing when each town was last updated
4. **Share specific items** using the direct URL linking feature

## Troubleshooting

### Upload Failed
- Check your internet connection
- Verify you're running the updated bodega script
- API uploads are processed automatically via GitHub Actions

### Data Not Appearing
- Wait 1-2 minutes for automatic deployment
- API uploads are processed and merged automatically
- Refresh the website

## Performance & Limits

### API Uploads (Primary Method)
- **File size**: Up to 25MB per file
- **No rate limits**: Direct processing via GitHub Actions
- **Speed**: Immediate processing, 1-2 minute website updates

### Fallback System (Gists)
- **GitHub API**: 5,000 requests per hour (shared bot account)
- **File size**: Up to 8MB per file
- **Rate usage**: 1 request per upload (gist creation only)

The API-first system provides the best performance for regular users.


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