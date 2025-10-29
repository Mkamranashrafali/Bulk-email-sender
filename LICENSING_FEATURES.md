# Smart Mail Pro - Licensing System Documentation

## Overview
Smart Mail Pro now includes a comprehensive free trial and pro licensing system with a clean, modern dark-themed interface.

## Features Implemented

### 1. Welcome Banner
- **App Name**: "Smart Mail Pro"
- **Tagline**: "Turn your CSV into personalized emails — fast & easy."
- Displays on the welcome screen with smooth animations

### 2. Free Plan (3-Day Trial)
**Limitations:**
- Send up to 20 emails maximum
- Preview enabled (can view personalized emails)
- No variable mapping (Pro feature)
- No send-pending status tracking (Pro feature)

**Visual Indicators:**
- "3-Day Free Trial" badge
- Email counter showing usage (e.g., "5/20 emails")
- Warning indicators when approaching limit
- Error indicators when limit reached

### 3. Pro Plan
**Features:**
- ✓ Unlimited email sending
- ✓ Full variable mapping
- ✓ Complete status tracking
- ✓ All premium features unlocked

**Visual Indicators:**
- "Pro Plan" label with special styling
- "∞ Unlimited" email indicator
- Green checkmark on upgrade button

### 4. Upgrade Button
- Always visible in header on every screen
- Shows "Go Pro ✨" for free users
- Shows "Pro Active ✓" for pro users
- Animated sparkle effect
- Smooth hover and click animations
- Glowing effect matching the dark theme

### 5. License Activation Screen
**Components:**
- Simple, centered design
- "Enter License Key" input field
- "Activate Pro 🔑" button
- Visual benefits display (4 key features)
- Error message for invalid keys
- Success message on activation

**License Key:**
- Hardcoded key: `activate@`
- Instant activation
- Persists across sessions

### 6. User Experience Flow

**Free User Journey:**
1. Welcome screen shows both Free and Pro plans
2. Start with free trial
3. See usage counter in header
4. Receive warnings when trying Pro features
5. Get upgrade prompts with direct links
6. Redirected to activation screen
7. Easy activation with license key

**Pro User Journey:**
1. Activate license key
2. All features unlocked
3. No usage limits
4. Full variable mapping
5. Complete status tracking

### 7. Visual Design
- Maintains dark theme consistency
- Smooth transitions between screens
- Glassmorphism effects
- Neon glow accents
- Responsive layout
- Clean, minimal clutter
- Modern card-based design

### 8. Restrictions Enforcement

**Free Users Cannot:**
- Map custom variables (Step 3)
- Track detailed send status (Step 5)
- Send more than 20 emails
- Continue after trial expires

**When Restricted:**
- Feature becomes locked with overlay
- "🔒 Pro Feature" badge appears
- Warning message displayed
- Upgrade link provided
- Can still preview and navigate

### 9. Smart Notifications
- Auto-dismissing warning banners (5 seconds)
- Contextual upgrade prompts
- Real-time limit warnings
- Color-coded status indicators
- Smooth fade animations

### 10. Data Persistence
All licensing data is saved:
- Pro status
- License key
- Trial start date
- Emails sent count
- All user preferences

## Color Scheme
- **Primary Accent**: #00BFFF (Cyan blue)
- **Secondary Accent**: #2196F3 (Blue)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)
- **Background**: Dark gradient with subtle glow effects

## Testing the System

### To Test Free Plan:
1. Open extension
2. Start free trial
3. Try uploading CSV (works)
4. Create template (works)
5. Try variable mapping (locked - shows upgrade prompt)
6. Preview emails (works)
7. Try status tracking (shows warning)

### To Test Pro Activation:
1. Click "Go Pro" button (always visible in header)
2. Enter license key: `activate@`
3. Click "Activate Pro"
4. See success message
5. Automatically redirected to app
6. Header shows "Pro Active"
7. All features unlocked

### To Test Limits:
1. Use free plan
2. Watch email counter increase
3. Approach 20 email limit
4. See warning colors
5. Try to exceed limit
6. Get blocked with upgrade prompt

## Future Enhancements (Optional)
- Multiple license key support
- Online license validation
- Subscription management
- Usage analytics
- Email templates library
- Team collaboration features

## License Key
**Current Key**: `activate@`
(This can be easily changed in the `activateLicense()` function in script.js)

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-29  
**Status**: Production Ready
