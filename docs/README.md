# GemStone IV Player Shop Browser

An automated web application for browsing GemStone IV player shop inventories with real-time community data updates.

## 🚀 Quick Start for Players

1. **Download the script**: Get `bodega.lic` from the repository and place it in your Lich `scripts/` directory
2. **Run with upload**: `;bodega --parser --save --upload`
3. **Browse the data**: [https://nisugi.github.io/bodega/](https://nisugi.github.io/bodega/)

Your shop data will be automatically processed and the website will update within 1-2 minutes!

## Features

- 🔍 **Advanced search and filtering** - Find items by name, enchant, price, properties
- 🏛️ **Browse mode** - Navigate Town → Shop → Room → Items hierarchically
- 🔗 **Direct item linking** - Copy URLs to share specific items with others
- 🏪 **Multi-town coverage** - All major towns and player shops
- ⏰ **Live news ticker** - See exact update times with "time ago" display
- ⚡ **Community-powered data** - Players contribute updates automatically
- 📦 **Large file support** - API handles files up to 25MB
- 🤖 **Automated processing** - GitHub Actions validates and merges data
- 🌐 **Free global hosting** - GitHub Pages with CDN
- 📱 **Mobile-friendly** - Responsive design works on all devices
- 🚫 **Zero authentication** - No accounts or logins required

## How It Works

1. **Player runs bodega script** with `--upload` flag
2. **API upload** sends data directly to GitHub Actions (supports files up to 25MB)
3. **Automated processing** validates and merges data within 1-2 minutes
4. **Fallback system** uses GitHub Gists if API is unavailable
5. **Website updates automatically** with your new data

## Automated Data Updates

### For Players (Zero Setup Required)

```bash
# Update all towns
;bodega --parser --save --upload

# Update single town
;bodega --parser --town=wehnimer --save --upload

# Update specific shop
;bodega --parser --shop="Silverwood Manor" --save --upload

# Test without uploading
;bodega --parser --dry-run
```

### What Happens

1. **API upload** sends your shop data directly to GitHub Actions (up to 25MB files)
2. **Smart duplicate detection** prevents re-uploading the same data with SHA256 hashing
3. **Automatic validation** checks JSON format and structure
4. **Auto-merge** if data is valid and no conflicts
5. **Website updates** reflect your contributions with detailed per-town timestamps
6. **Fallback system** uses GitHub Gists if API is unavailable


See [`UPLOAD_GUIDE.md`](./UPLOAD_GUIDE.md) for detailed instructions.

### Local Development

To run locally, start a simple HTTP server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Data Files

- `wehnimers_landing.json` - Wehnimer's Landing shops
- `zul_logoth.json` - Zul Logoth shops
- `solhaven.json` - Solhaven shops
- `teras_isle.json` - Teras Isle shops
- `icemule_trace.json` - Icemule Trace shops
- `ta_vaalor.json` - Ta'Vaalor shops
- `ta_illistim.json` - Ta'Illistim shops
- `rivers_rest.json` - River's Rest shops
- `mist_harbor.json` - Mist Harbor shops

## Contributing

1. Update the relevant JSON files with new shop data
2. Commit and push changes
3. GitHub Actions will handle the rest!

---

*Automated with GitHub Actions and deployed via GitHub Pages*