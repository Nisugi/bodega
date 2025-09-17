# Automated Shop Data Updates

The bodega script now supports automatic upload of shop data to the GitHub repository without requiring any authentication. Any player can contribute data updates that will be automatically processed and merged.

## How It Works

1. **Run the bodega script** with the `--upload` option
2. **Script creates GitHub issues** with your JSON data
3. **GitHub Actions automatically processes** the issues
4. **Valid data gets merged** and the website updates within 1-2 minutes

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

1. **Issue Creation**: For each JSON file generated, an issue is created at:
   `https://github.com/Nisugi/bodega/issues`

2. **Automatic Processing**: GitHub Actions will:
   - Validate the JSON format and structure
   - Check for conflicts with recent updates
   - Auto-merge valid data or queue for manual review

3. **Website Update**: Once merged, the website automatically updates with your data

## Status Messages

After running the script, you'll see messages like:

```
[upload] Uploading wehnimers_landing.json...
[upload] Created GitHub issue for wehnimers_landing.json
[upload] Created issue #42: https://github.com/Nisugi/bodega/issues/42
[upload] Upload complete!
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

1. **Check issue status** at: `https://github.com/Nisugi/bodega/issues`
2. **View the website** at: `https://nisugi.github.io/bodega/`
3. **Browse your data** using the new Browse mode (Town → Shop → Room)

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

- **GitHub API**: 60 requests per hour per IP address
- **Full updates** (9 towns): Uses 9 requests
- **Single town**: Uses 1 request

If you hit rate limits, wait an hour or focus on specific towns/shops.

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