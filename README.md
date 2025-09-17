# GemStone IV Player Shop Browser

An automated web application for browsing GemStone IV player shop inventories with real-time data updates.

## Features

- 🔍 Advanced search and filtering
- 🏪 Multi-town shop data
- ⚡ Real-time data updates via GitHub Actions
- 🌐 Free hosting on GitHub Pages
- 📱 Responsive design

## How It Works

1. **Data Updates**: Commit JSON files to trigger automatic website updates
2. **GitHub Actions**: Automatically converts JSON to JavaScript modules
3. **GitHub Pages**: Serves the website with global CDN

## Usage

### Updating Data

Simply commit and push updated JSON files:

```bash
git add *.json
git commit -m "Update shop data"
git push
```

The website will automatically update within 1-2 minutes.

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