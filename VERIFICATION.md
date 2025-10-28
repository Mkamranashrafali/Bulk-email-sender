# ✅ INSTALLATION VERIFICATION

Use this checklist to ensure your Chrome Extension is ready to load.

## Required Files Checklist

### Core Files (REQUIRED)
- [ ] `manifest.json` - Extension configuration
- [ ] `popup.html` - Main interface
- [ ] `styles.css` - Dark theme styling
- [ ] `script.js` - JavaScript functionality

### Library Files (REQUIRED)
- [ ] `lib/xlsx.full.min.js` - Excel file parser

### Icon Files (REQUIRED)
- [ ] `icons/icon16.png` - 16x16 toolbar icon
- [ ] `icons/icon48.png` - 48x48 extension page icon
- [ ] `icons/icon128.png` - 128x128 web store icon

### Documentation Files (OPTIONAL but recommended)
- [ ] `README.md` - Complete documentation
- [ ] `QUICK-START.md` - Quick installation guide
- [ ] `CHANGELOG.md` - Version history
- [ ] `sample-data.csv` - Test data file

## Quick Verification Commands

Run these in PowerShell to verify files exist:

```powershell
# Navigate to extension folder
cd "c:\Users\Lenovo\Desktop\email extenssion"

# Check core files
Test-Path manifest.json
Test-Path popup.html
Test-Path styles.css
Test-Path script.js

# Check library
Test-Path lib\xlsx.full.min.js

# Check icons
Test-Path icons\icon16.png
Test-Path icons\icon48.png
Test-Path icons\icon128.png
```

All commands should return `True`.

## Load Extension Steps

1. **Open Chrome** → Navigate to `chrome://extensions/`

2. **Enable Developer Mode** → Toggle switch in top-right corner

3. **Load Unpacked** → Click button, select folder: `c:\Users\Lenovo\Desktop\email extenssion`

4. **Verify Loaded** → You should see:
   - Extension name: "Bulk Email Personalizer"
   - Version: 1.0.0
   - Icon should be visible
   - No errors shown

5. **Pin to Toolbar** (Optional)
   - Click the puzzle icon in Chrome toolbar
   - Find "Bulk Email Personalizer"
   - Click the pin icon

## Test the Extension

### Quick Test (2 minutes)
1. Click the extension icon (📧)
2. You should see the dark-themed popup
3. "Step 1 of 5" should be displayed
4. Upload area should be visible

### Full Test (5 minutes)
1. **Upload** `sample-data.csv`
2. Preview should show 10 rows
3. Click **"Next Step →"**
4. Enter a simple template:
   ```
   Subject: Test [Name]
   Body: Hi [Name] from [Company]
   ```
5. Variables `[Name]` and `[Company]` should be detected
6. Click **"Next Step →"**
7. Auto-mapping should occur
8. Click **"Next Step →"**
9. Preview should show: "Test John Smith" and "Hi John Smith from TechCorp Industries"
10. Navigate with ← → buttons
11. Click **"Ready to Send →"**
12. You should see recipient list

### If Test Passes ✅
**Congratulations!** Your extension is working perfectly.

### If Test Fails ❌
Check these common issues:

#### Extension won't load
- Verify all required files exist
- Check manifest.json for syntax errors
- Open DevTools (F12) for errors

#### Excel library missing
```powershell
Invoke-WebRequest -Uri "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" -OutFile "lib\xlsx.full.min.js"
```

#### Icons not showing
```powershell
.\make-icons.ps1
```

#### Variables not detecting
- Use exact format: `[VariableName]`
- Ensure square brackets are used
- Check that template has text

## Extension Permissions

When you load the extension, Chrome may ask for permissions:

✅ **Storage** - To save your progress
✅ **Active Tab** - To open Gmail tabs
✅ **Tabs** - To create new email tabs
✅ **Gmail Access** - To integrate with Gmail

All permissions are used for legitimate functionality only.

## File Size Reference

Your extension folder should be approximately:
- **Total size**: ~700 KB - 1 MB
- `xlsx.full.min.js`: ~700 KB
- All other files: < 100 KB

## Troubleshooting Commands

```powershell
# Check if SheetJS is downloaded correctly
(Get-Item "lib\xlsx.full.min.js").Length
# Should return a number > 500000 (bytes)

# List all files
Get-ChildItem -Recurse -File | Select-Object FullName, Length

# Check manifest syntax
Get-Content manifest.json | ConvertFrom-Json
# Should not show errors
```

## Next Steps

Once verified:
1. ✅ Test with your own CSV data
2. ✅ Create custom templates
3. ✅ Customize colors (optional)
4. ✅ Read full documentation in README.md

---

## Support Resources

- **Full Documentation**: README.md
- **Quick Guide**: QUICK-START.md
- **Version History**: CHANGELOG.md
- **Sample Data**: sample-data.csv

---

## Report Card

After verification, your status should be:

| Item | Status |
|------|--------|
| All files present | ✅ |
| Extension loads | ✅ |
| UI appears | ✅ |
| File upload works | ✅ |
| Variables detected | ✅ |
| Preview works | ✅ |
| Ready to use | ✅ |

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0
