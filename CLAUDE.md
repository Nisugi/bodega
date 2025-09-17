# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the GemStone IV Player Shop Browser - a static web application that aggregates and displays player shop inventory data from the GemStone IV game. The project consists of a frontend web interface deployed via GitHub Pages and automated data processing infrastructure.

## Architecture

### Frontend Components
- **index.html** - Main web interface with search and browse modes
- **search.js** - SearchEngine class handling item filtering, sorting, and pagination
- **browse.js** - BrowseEngine class for hierarchical town → shop → room → item navigation
- **data-loader.js** - DataLoader class that fetches and processes JSON data from multiple town files
- **style.css** - Responsive styling for the web interface

### Data Processing Infrastructure
- **scripts/bodega.lic** - Ruby/Lich script that runs in GemStone IV via Lich, scans in-game shops and saves data to `lich5/bodega/`
- **netlify/functions/upload.js** - Serverless function handling API uploads (up to 25MB files)
- **.github/workflows/** - GitHub Actions for automated data processing:
  - `api-upload-processor.yml` - Processes direct API uploads
  - `gist-processor.yml` - Processes fallback gist uploads
  - `deploy.yml` - Deploys to GitHub Pages

### Data Files
- **data/*.json** - Town-specific shop inventory data (9 major towns) in this GitHub repository
- **lich5/bodega/*.json** - Local data files created by the bodega.lic script in the Lich environment
- Each JSON file contains shop → room → item hierarchy with prices, descriptions, and metadata

## Development Workflow

### Local Development
```bash
# Start local server for development
python -m http.server 8000
# Then visit http://localhost:8000
```

### Data Structure
Each town JSON file follows this structure:
```
{
  "town_name": {
    "shops": {
      "Shop Name": {
        "rooms": {
          "Room Name": {
            "items": [
              {
                "name": "item name",
                "price": 1000,
                "description": "...",
                "enchant": "+5",
                "properties": ["blessed", "scripted"]
              }
            ]
          }
        }
      }
    }
  }
}
```

### Upload System
- Players run `bodega.lic` script in GemStone IV via Lich with `--upload` flag
- Script scans shops and saves data locally to `lich5/bodega/*.json`
- With `--upload`, data is uploaded via API-first to Netlify function (primary method)
- GitHub Gist fallback if API unavailable
- Automated validation and merging via GitHub Actions updates the repository's `data/` directory

### Key Features
- **Search Mode**: Full-text search with filters for town, price range, enchantment, item properties
- **Browse Mode**: Hierarchical navigation through towns, shops, and rooms
- **Direct Linking**: URLs can link to specific items for sharing
- **Live Updates**: Community-driven data updates with automatic processing
- **Mobile Responsive**: Works on all device sizes

## Common Tasks

### Deploy Changes
Changes to main branch automatically deploy via GitHub Actions to GitHub Pages at https://nisugi.github.io/bodega/

### Process New Shop Data
Shop data is processed automatically when uploaded via the bodega script running in Lich. The script saves data locally to `lich5/bodega/` and uploads to this repository's `/data/` directory via API or gist fallback.

### Debug Data Loading
Check browser console for DataLoader status messages. Data files are loaded asynchronously from `/data/` directory.

### Update Frontend
Modify the respective JavaScript files:
- Search functionality: `search.js`
- Browse functionality: `browse.js`
- Data loading: `data-loader.js`
- Styling: `style.css`

## Important Notes

- This is a static site with no backend database - all data is in JSON files
- No authentication required for data uploads (community-driven)
- `bodega.lic` runs in GemStone IV via Lich, saving data to `lich5/bodega/` locally
- Netlify functions provide API endpoints for shop data submission from Lich to GitHub
- GitHub Actions handle all data validation and merging into the repository's `data/` directory
- Support for files up to 25MB through API upload system
- Fallback to GitHub Gists if API unavailable