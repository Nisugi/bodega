# Bodega: Fix File System Structure and Update CLAUDE.md

## Objective
Ensure the two-stage data pipeline is properly set up and documented by creating the missing raw directory and updating CLAUDE.md to accurately document the symbolic link approach.

## Discovery: The System Already Works!
After investigation, the system is **already correctly implemented** using a symbolic link:

**How it works:**
1. `automation/bin/setup-environment` (line 82) creates symlink: `automation/lich/bodega -> docs/data`
2. bodega.lic saves to `automation/lich/bodega/` (default location)
3. When `--raw-only` flag is used, bodega.lic adds `raw/` prefix to filename (line 1625)
4. bodega.lic writes to: `automation/lich/bodega/raw/wehnimers_landing.json`
5. Through symlink, this becomes: `docs/data/raw/wehnimers_landing.json` ✓
6. processor.rb reads from: `docs/data/raw/` ✓
7. Everything aligns perfectly!

## Problem Summary
1. **Missing Directory**: `docs/data/raw/` doesn't exist in the repository (needs .gitkeep)
2. **Undocumented**: CLAUDE.md doesn't explain the symbolic link approach
3. **Incomplete Docs**: CLAUDE.md has incorrect file paths and missing flag documentation

## Implementation Plan

### Step 1: Create Raw Data Directory Structure

**Create directory and tracking file:**
- Create `docs/data/raw/.gitkeep` to ensure the directory is tracked in git
- This empty file ensures git commits the directory even when no raw files exist

### Step 2: Verify Symbolic Link Setup (No Code Changes Needed!)

**File**: `automation/bin/setup-environment` (lines 67-83)

**What it does:**
```bash
# Creates symlink: automation/lich/bodega -> docs/data
DATA_DIR="$(pwd)/docs/data"
BODEGA_LINK="automation/lich/bodega"
ln -s "$DATA_DIR" "$BODEGA_LINK"
```

**How it enables the two-stage architecture:**
- bodega.lic saves to its default location: `automation/lich/bodega/`
- With `--raw-only` flag, bodega.lic adds `raw/` prefix (line 1625)
- Files are written to: `automation/lich/bodega/raw/*.json`
- Symlink makes this: `docs/data/raw/*.json` (exactly where processor.rb expects!)
- bodega.lic even creates the raw/ subdirectory automatically (line 1628)

**Verification:**
- setup-environment is called by GitHub Actions (automation.yml line 71) ✓
- No changes needed - the system already works correctly!

### Step 3: Update CLAUDE.md Documentation

**File**: `CLAUDE.md`

#### 3.1 Fix File Path References

**Lines 36-41 - Key Scripts section:**
- Change: `scripts/bodega.lic`
- To: `automation/lich/scripts/bodega.lic`

**Lines 62-74 - Web Application section:**
- Update component paths from `docs/search.js` to `docs/assets/js/components/search.js`
- Update core system paths to include `docs/assets/js/core/` prefix
- Update config path to include `docs/assets/js/config/` prefix

#### 3.2 Add Flag Documentation Section

**Insert after line 122** (after two-stage automation flow example):

```markdown
### Command Line Flags Explained

**bodega.lic flags:**
- `--parser`: Enables parsing mode (required to scan shops and generate data)
- `--raw-only`: Saves raw SHOP INSPECT output without in-game extraction
  - Automatically adds `raw/` prefix to output filename
  - Example: saves to `automation/lich/bodega/raw/wehnimers_landing.json`
  - Through symlink, becomes `docs/data/raw/wehnimers_landing.json`
  - Extraction happens server-side via processor.rb instead
- `--smart`: Only inspects new/changed items by comparing with existing data
  - Dramatically faster: 2-3 minutes vs 65 minutes for full scan
  - Loads previous scan results from raw files to detect changes
  - Automatically removes deleted items from output
- `--save`: Write results to filesystem (required for persistence)
- `--dry-run`: Run scan but only print to frontend (testing only)

**Scan type behavior:**
- **Smart scan**: Only inspects items with new/changed IDs (2-3 min)
- **Full scan**: Inspects all items regardless of cache (65 min)
  - At 8 AM UTC: Runs smart scan first, then full scan
  - Other times: Runs smart scan only
```

#### 3.3 Update Two-Stage Architecture Description

**Replace lines 48-59** (Stage 1 and Stage 2 descriptions) with:

```markdown
**Stage 1: Raw Capture** (`automation/lich/scripts/bodega.lic`)
- In-game scanning via Lich framework
- Always uses `--raw-only` flag to skip in-game extraction
- Saves complete SHOP INSPECT output to `docs/data/raw/*.json`
- Files saved: wehnimers_landing.json, solhaven.json, etc. (one per town)
- Raw files are committed to git for stage 2 processing
- No processing during gameplay (faster, more stable)
- Smart mode compares with existing raw files to skip unchanged items

**Stage 2: Server-Side Processing** (`automation/ruby/processor.rb`)
- Reads raw data from `docs/data/raw/`
- Extracts tags, properties, metadata using `bodega_extractor.rb`
- Generates processed JSON to `docs/data/*.json` (website files)
- Runs incrementally: only processes new/modified raw files
- Website consumes only these processed files
```

#### 3.4 Add File Structure Diagram

**Insert after line 80** (after Data Layer section):

```markdown
### Directory Structure
```
docs/data/
├── raw/                          # Raw SHOP INSPECT output (Stage 1)
│   ├── wehnimers_landing.json   # Raw scan data per town
│   ├── solhaven.json
│   ├── ta_illistim.json
│   └── ... (one file per town)
│
├── wehnimers_landing.json        # Processed data (Stage 2) ← Website uses these
├── solhaven.json
├── ta_illistim.json
├── ... (one file per town)
│
├── removed_items.json            # Centralized removed item tracking
├── added_items.json              # Recently added items (24h window)
├── shop_mapping.json             # Shop ownership and metadata
└── last_updated.txt              # Last scan timestamp
```

**Data Flow:**
- Raw files (stage 1) → Processor (stage 2) → Processed files → Website
- Website never reads raw files, only processed files
- Raw files contain `raw_inspect` arrays for each item
- Processed files contain `details` objects with extracted properties
```

#### 3.5 Update Code Example and Add Symlink Explanation

**Replace lines 107-122** (Two-Stage Automation Flow section) with:

```markdown
### Two-Stage Automation Flow

**Symbolic Link Magic:**
Before the automation runs, `setup-environment` creates a symbolic link:
```bash
ln -s "$(pwd)/docs/data" "automation/lich/bodega"
```
This allows bodega.lic to save to its default location while files appear in docs/data/!

**The headless script orchestrates the two-stage process:**
```ruby
# automation/lich/scripts/headless.lic
scan_type = ENV['BODEGA_SCAN_TYPE'] || (Time.now.hour == 8 ? 'full' : 'smart')

if scan_type == 'full'
  # Stage 1a: Smart scan (captures only new/changed items)
  # Saves to: automation/lich/bodega/raw/town.json
  # Via symlink: docs/data/raw/town.json
  Script.run("bodega", "--parser --raw-only --smart --save")

  # Stage 1b: Full scan (captures everything)
  Script.run("bodega", "--parser --raw-only --save")
else
  # Stage 1: Smart scan only
  Script.run("bodega", "--parser --raw-only --smart --save")
end

# Stage 2: Server-side processing
# automation/bin/process-data calls automation/ruby/processor.rb
# Reads from: docs/data/raw/*.json (where symlink points)
# Writes to: docs/data/*.json (processed files for website)
```
```

#### 3.6 Document Website Behavior

**Insert after line 74** (after Styling line in Web Application section):

```markdown
- **Data Usage**:
  - Website only reads processed JSON from `docs/data/*.json`
  - Website does NOT parse raw SHOP INSPECT text
  - `item.details.raw` field contains original inspection lines for tooltips only
  - All tags, properties, and metadata are pre-extracted by processor.rb
```

### Step 4: Verify Git Tracking

**Verify `.gitignore` doesn't exclude raw files:**
- Current .gitignore does NOT exclude `docs/data/raw/*.json` ✓
- No changes needed to .gitignore

### Step 5: Update Development Workflow Section

**Update lines 193-202** (Testing Data Processing Locally):

Add note at the top:
```markdown
### Testing Data Processing Locally

**Note**: Raw files must exist in `docs/data/raw/` before processing can run.
These are created by the automation scan (stage 1).

```bash
# Process raw data in incremental mode (only new/modified files)
./automation/bin/process-data incremental

# Process all files regardless of modification time
./automation/bin/process-data full

# Force reprocess all files (even if already processed)
./automation/bin/process-data reprocess
```
```

## Files to Modify

1. **CLAUDE.md** - Update 6 sections with path corrections, flag documentation, symbolic link explanation, and architecture clarification
2. **docs/data/raw/.gitkeep** - CREATE new file to ensure directory is tracked in git

**Files NOT Modified** (already correct):
- `automation/lich/scripts/headless.lic` - Already uses correct flags
- `automation/bin/setup-environment` - Already creates symlink correctly
- `automation/lich/scripts/bodega.lic` - Already adds raw/ prefix with --raw-only flag

## Verification Steps

After implementation:
1. Run `git status` - should show `docs/data/raw/.gitkeep` as new file
2. Run automation locally to test: `./automation/bin/run-scan smart`
3. Verify files appear in `docs/data/raw/*.json`
4. Run processing: `./automation/bin/process-data incremental`
5. Verify processed files updated in `docs/data/*.json`
6. Check CLAUDE.md renders correctly with updated paths and code examples

## Risk Assessment

**Low Risk Changes:**
- Creating docs/data/raw/ directory
- Updating CLAUDE.md documentation
- All changes are additive or documentation-only

**Medium Risk Change:**
- Modifying headless.lic path calculation
- **Mitigation**: Path calculation is straightforward and will fail fast if incorrect
- **Fallback**: Can revert to current behavior by removing `--local-dir` flag

## Expected Outcome

- Raw files saved to `docs/data/raw/*.json` and committed to git
- Processor.rb successfully finds and processes raw files
- Two-stage architecture functions as designed
- CLAUDE.md accurately documents the system with correct paths and flag descriptions
- Future Claude instances can work effectively with accurate documentation
