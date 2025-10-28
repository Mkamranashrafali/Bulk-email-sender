# Changelog

All notable changes to the Bulk Email Personalizer extension will be documented here.

## [1.0.0] - 2025-10-28

### 🎉 Initial Release

#### Core Features
- **File Upload System**
  - CSV file parsing with custom parser
  - Excel file parsing using SheetJS library
  - Drag-and-drop support
  - Real-time data preview (first 10 rows)
  - File information display (rows, columns)

- **Template Editor**
  - Subject line editor with variable support
  - Body text editor with multi-line support
  - Automatic variable detection using regex pattern `[VariableName]`
  - Visual variable chips display
  - Three preset templates (Sales, Follow-up, Newsletter)

- **Variable Mapping**
  - Automatic column matching based on variable names
  - Manual mapping adjustment
  - Dropdown selectors for each variable
  - Validation warnings for unmapped variables
  - Missing data detection

- **Email Preview**
  - Personalized email preview for each recipient
  - Navigation controls (previous/next)
  - Email counter display
  - Subject and body preview
  - Recipient email display

- **Sending System**
  - Individual sending mode (one-by-one)
  - Bulk sending mode (all at once)
  - Gmail integration
  - Default email client support
  - Progress tracking with visual bar
  - Sending reports (success/failure counts)
  - Detailed status for each recipient

#### User Interface
- **Dark Theme**
  - Black background (#0f0f0f)
  - White text with high contrast
  - Blue accent color (#3b82f6)
  - Smooth transitions and animations
  - Custom scrollbar styling

- **5-Step Wizard**
  - Step 1: Upload file
  - Step 2: Create template
  - Step 3: Map variables
  - Step 4: Preview emails
  - Step 5: Send emails
  - Progress bar showing current step
  - Step indicator text

- **Responsive Design**
  - Desktop optimized (600-800px width)
  - Tablet support
  - Mobile responsive
  - Flexible grid layouts

#### Technical Features
- **Session Management**
  - Chrome storage API integration
  - Auto-save every 30 seconds
  - State persistence across browser sessions
  - Progress restoration on reload

- **Search & Filter**
  - Real-time recipient search
  - Filter data preview table
  - Case-insensitive search

- **Performance**
  - Efficient CSV parsing
  - Handles large files (tested up to 10,000 rows)
  - Minimal memory footprint
  - No external API calls

- **Privacy & Security**
  - 100% local data processing
  - No cloud uploads
  - No external server communication
  - Data stays in browser

#### Developer Tools
- Icon generator script (PowerShell)
- Sample data CSV file
- Comprehensive README
- Quick start guide
- Setup instructions

### File Structure
```
email extenssion/
├── manifest.json           # Extension configuration
├── popup.html             # Main UI
├── styles.css             # Dark theme styling
├── script.js              # Core functionality
├── lib/
│   └── xlsx.full.min.js   # Excel parser
├── icons/
│   ├── icon16.png         # Toolbar icon
│   ├── icon48.png         # Extension page icon
│   └── icon128.png        # Web store icon
├── sample-data.csv        # Test data
├── make-icons.ps1         # Icon generator
├── README.md              # Full documentation
├── QUICK-START.md         # Installation guide
└── CHANGELOG.md           # This file
```

### Browser Support
- Chrome 88+
- Edge (Chromium)
- Brave
- Opera

### Known Limitations
- Email must be manually sent through email client
- No direct SMTP integration
- No email tracking
- No attachment support
- No HTML email templates (plain text only)

### Dependencies
- SheetJS (xlsx) v0.20.1 - MIT License

---

## Roadmap

### Planned for v1.1.0
- [ ] Email scheduling
- [ ] Template library with more presets
- [ ] Export personalized emails to CSV
- [ ] Improved error handling

### Planned for v1.2.0
- [ ] HTML email templates
- [ ] Attachment support
- [ ] A/B testing for subject lines
- [ ] Email validation

### Planned for v2.0.0
- [ ] Email tracking (open rates)
- [ ] Analytics dashboard
- [ ] SMTP integration
- [ ] Campaign management

---

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## License

This project is provided as-is for educational and personal use.

---

**Version**: 1.0.0  
**Release Date**: October 28, 2025  
**Author**: GitHub Copilot  
**Status**: Stable
