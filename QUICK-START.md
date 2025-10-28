# 🚀 QUICK START GUIDE

## Step-by-Step Installation (5 minutes)

### 1. Verify Files ✓
Make sure you have:
- ✅ `manifest.json`
- ✅ `popup.html`
- ✅ `styles.css`
- ✅ `script.js`
- ✅ `lib/xlsx.full.min.js` (Excel parser)
- ✅ `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`

### 2. Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top-right corner)
4. Click **"Load unpacked"**
5. Select the `email extenssion` folder
6. ✅ Extension loaded!

### 3. First Test Run (2 minutes)

#### A. Click the extension icon (📧) in Chrome toolbar

#### B. Upload Sample Data
- Use the provided `sample-data.csv` file
- Or create your own CSV with these columns:
  ```
  Name, Email, Company, Industry, Position
  ```

#### C. Create a Template (Step 2)
Try this sales template:
```
Subject: Quick question about [Company]

Body:
Hi [Name],

I noticed that [Company] is in the [Industry] sector, and I thought you might be interested in how we've helped similar companies streamline their operations.

As a [Position], would you be open to a 15-minute call this week?

Best regards,
[Your Name]
```

#### D. Map Variables (Step 3)
The extension will auto-match:
- `[Name]` → Name column
- `[Company]` → Company column
- `[Industry]` → Industry column
- `[Position]` → Position column
- `[Email]` → Email column

#### E. Preview (Step 4)
Navigate through emails to see personalization

#### F. Send Test (Step 5)
1. Choose **Individual Mode**
2. Select **Gmail**
3. Click **"Start Sending"**
4. First email will open in Gmail compose window

---

## Common Issues & Fixes

### ❌ Extension won't load
**Fix:** Make sure `xlsx.full.min.js` is in the `lib` folder
```powershell
# Download it with:
Invoke-WebRequest -Uri "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js" -OutFile "lib\xlsx.full.min.js"
```

### ❌ Icons not showing
**Fix:** Run the icon generator again
```powershell
.\make-icons.ps1
```

### ❌ Variables not replacing
**Fix:** Use exact format `[VariableName]` with square brackets

### ❌ Gmail not opening
**Fix:** 
1. Allow pop-ups for the extension
2. Check permissions in `chrome://extensions/`

---

## Usage Tips

### 💡 Best Practices
1. **Start small**: Test with 3-5 emails first
2. **Always preview**: Check Step 4 before sending
3. **Use meaningful variables**: `[FirstName]` is better than `[N]`
4. **Personalize beyond name**: Use company, industry, etc.

### 📝 Template Examples

**Follow-up Email:**
```
Subject: Following up - [Company]

Hi [Name],

I wanted to follow up on my previous message about [Topic].

Are you available for a quick call on [Date]?

Best,
[Your Name]
```

**Event Invitation:**
```
Subject: You're invited: [EventName] on [Date]

Dear [Name],

[Company] is invited to our exclusive [EventName] event.

Date: [Date]
Location: [Location]

RSVP: [Link]
```

---

## Features at a Glance

| Feature | Description |
|---------|-------------|
| 📁 File Upload | CSV & Excel support |
| ✍️ Templates | Unlimited custom templates |
| 🔗 Auto-mapping | Smart variable detection |
| 👁️ Preview | See personalized emails |
| 📧 Send Modes | Individual or Bulk |
| 🎨 Dark Theme | Modern, professional UI |
| 💾 Auto-save | Progress saved automatically |
| 🔒 Privacy | 100% local processing |

---

## Next Steps

1. ✅ Load extension
2. ✅ Test with sample data
3. ✅ Create your first campaign
4. 📖 Read full README.md for advanced features
5. 🎨 Customize colors in styles.css (optional)

---

## Need Help?

1. Check README.md for detailed docs
2. Look for errors in Chrome DevTools (F12)
3. Verify all files are present
4. Check permissions in `chrome://extensions/`

---

**🎉 You're ready to send personalized emails at scale!**

*Remember: Always preview before sending & respect recipient privacy*
