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

### Smart Caching (Recommended)
```bash
# First run or when you want to inspect all items
;bodega --parser --smart --save --upload

# Force full refresh (updates cache)
;bodega --parser --force-full --save --upload

# Custom cache expiry (re-inspect items older than 3 days)
;bodega --parser --smart --cache-max-age=3 --save --upload
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

4. **Fallback System**: If the API is unavailable, the script automatically falls back to:
   - Creating GitHub Gists with your data
   - Creating GitHub Issues referencing the gists
   - Processing via the traditional workflow

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
[upload] Gist created: https://gist.github.com/bodega-uploads-bot/abc123...
[upload] Created issue #42: https://github.com/Nisugi/bodega/issues/42
[upload] Upload complete! 2 uploaded, 0 skipped
```

**Smart Caching Messages:**
```
[cache] Smart caching enabled
[cache] Loaded item cache with 1,245 items
[cache] New item found: 12345
[cache] Using cached data for item: 67890
[cache] Cache cleanup complete: removed 15 stale items
[cache] Saved item cache with 1,230 items
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
5. **Check issue status** at: `https://github.com/Nisugi/bodega/issues` (for fallback uploads only)

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

## Performance & Limits

### API Uploads (Primary Method)
- **File size**: Up to 25MB per file
- **No rate limits**: Direct processing via GitHub Actions
- **Speed**: Immediate processing, 1-2 minute website updates

### Smart Caching Benefits
- **First run**: Normal inspection time, cache is created
- **Subsequent runs**: 5-10x faster execution with `--smart` flag
- **Cache file**: Stored in `lich5/bodega/item_cache.json`
- **Automatic management**: Stale items removed, expired items re-inspected

### Fallback System (Gists)
- **GitHub API**: 5,000 requests per hour (shared bot account)
- **File size**: Up to 8MB per file
- **Rate usage**: 2 requests total per upload (1 gist + 1 issue)

The API-first system with smart caching provides the best performance for regular users.

## Smart Caching Deep Dive

### How Smart Caching Works

Smart caching revolutionizes the bodega scanning process by tracking which items you've already inspected:

1. **Cache Creation**: First run with `--smart` inspects all items and creates `item_cache.json`
2. **Item Tracking**: Cache stores item details, timestamps, and shop locations
3. **Smart Scanning**: Subsequent runs only inspect:
   - New items not in cache
   - Items older than cache expiry (default: 7 days)
   - Items when using `--force-full`
4. **Automatic Cleanup**: Removes items no longer found in any shop

### Cache Management

**Cache File Location**: `lich5/bodega/item_cache.json`

**Manual Cache Operations**:
```bash
# View cache contents (JSON format)
cat lich5/bodega/item_cache.json

# Delete cache to start fresh
rm lich5/bodega/item_cache.json

# Force rebuild cache
;bodega --parser --force-full --save
```

**Cache Configuration**:
- `--cache-max-age=N`: Change expiry from default 7 days
- Cache version tracking for future migrations
- Automatic error recovery if cache is corrupted

### Performance Examples

**Traditional Scanning**:
- 500 items across 10 shops: ~45 minutes
- Every item inspected on every run

**Smart Caching**:
- First run: ~45 minutes (builds cache)
- Subsequent runs: ~5-8 minutes (only new/changed items)
- 90% time savings for established shops

### Troubleshooting Cache Issues

**Cache Not Working**:
- Ensure you're using `--smart` flag
- Check cache file exists: `lich5/bodega/item_cache.json`
- Look for cache log messages during execution

**Cache Corruption**:
- Script automatically detects and rebuilds corrupted cache
- Manual fix: Delete cache file and run with `--smart`

**Items Not Updating**:
- Use `--force-full` to refresh all cached items
- Check `--cache-max-age` setting
- Verify items are still in the same shops

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