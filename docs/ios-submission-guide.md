# Finityo — iOS App Store Submission Guide

## Prerequisites

- **Mac** with macOS 13+ (Ventura or later)
- **Xcode 15+** installed from the Mac App Store
- **Apple Developer Account** ($99/year) — [developer.apple.com](https://developer.apple.com)
- **Node.js 18+** and npm installed
- Project exported to GitHub from Lovable

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/debt-navigator-quest.git
cd debt-navigator-quest
npm install
```

---

## Step 2 — Build the Web App

```bash
npm run build
```

Verify `dist/` folder exists with `index.html`.

---

## Step 3 — Add iOS Platform

If the `ios/` folder doesn't exist yet:

```bash
npx cap add ios
```

---

## Step 4 — Sync Web → Native

Run this **every time** you pull new changes:

```bash
npx cap sync ios
```

This copies `dist/` into the native iOS project and updates native dependencies.

---

## Step 5 — Open in Xcode

```bash
npx cap open ios
```

This opens `ios/App/App.xcworkspace` in Xcode.

---

## Step 6 — Configure Signing

1. In Xcode, select the **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your **Team** (your Apple Developer account)
5. Set **Bundle Identifier** to: `com.finityo.debtquest`

---

## Step 7 — Set App Version

1. In Xcode, select the **App** target
2. Go to **General** tab
3. Set **Version** (e.g., `1.0.0`)
4. Set **Build** (e.g., `1`)

---

## Step 8 — App Icons

1. In Xcode, open `Assets.xcassets` → `AppIcon`
2. Drag your 1024×1024 icon into the slot
3. Xcode will auto-generate all required sizes

If you don't have an icon yet, you can add one later — but it's **required** for App Store submission.

---

## Step 9 — Build for Release

1. In Xcode menu: **Product → Scheme → Edit Scheme**
2. Set **Run** configuration to **Release**
3. Select destination: **Any iOS Device (arm64)**
4. **Product → Build** (⌘B)

Fix any build errors before proceeding.

---

## Step 10 — Create Archive

1. Select destination: **Any iOS Device (arm64)**
2. **Product → Archive**
3. Wait for the archive to complete
4. The **Organizer** window opens automatically

---

## Step 11 — Upload to App Store Connect

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Click **Upload**
5. Wait for processing (can take 5-30 minutes)

---

## Step 12 — App Store Connect Setup

Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

1. **My Apps → + → New App**
2. Fill in:
   - **Name**: Finityo — Debt Freedom Engine
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.finityo.debtquest
   - **SKU**: finityo-debt-v1

---

## Step 13 — App Store Listing

Fill in the listing details (see `docs/APP_STORE_LISTING.md` for copy):

- **Subtitle**: Plan, track, and eliminate your debt
- **Description**: Full description from listing doc
- **Keywords**: debt payoff, snowball, avalanche, etc.
- **Category**: Finance
- **Content Rating**: 4+
- **Support URL**: https://finityo.app/support
- **Privacy Policy URL**: https://finityo.app/privacy

---

## Step 14 — Screenshots

Required sizes (at minimum):
- **6.7" iPhone** (1290×2796) — iPhone 15 Pro Max
- **6.5" iPhone** (1284×2778) — iPhone 14 Plus
- **5.5" iPhone** (1242×2208) — iPhone 8 Plus (if supporting older devices)

Take screenshots of:
1. Dashboard with KPI cards
2. Debts list
3. Plan page with monthly breakdown
4. Timeline with milestones
5. Scenarios comparison

---

## Step 15 — Privacy Declarations

In App Store Connect → **App Privacy**:

- Select **Data Not Collected**
- No tracking, no analytics, no third-party SDKs in current version

See `docs/PERMISSIONS_AND_PRIVACY.md` for details.

---

## Step 16 — Submit for Review

1. Select your uploaded build in App Store Connect
2. Fill in all required fields
3. Answer the export compliance question (typically "No" for encryption)
4. Click **Submit for Review**

Review typically takes 24-48 hours.

---

## Ongoing Updates

For each new version:

```bash
git pull
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Then increment the build number in Xcode and repeat steps 10-16.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank white screen | Check `capacitor.config.ts` — ensure `webDir: 'dist'` and build exists |
| Signing errors | Verify Apple Developer membership is active and team is selected |
| Build fails | Run `npx cap sync ios` again, then clean build (⌘⇧K) |
| App rejected | Read rejection reason carefully — most common: missing privacy policy URL |

---

## Switch to Offline Mode (Recommended for Production)

For App Store submission, update `capacitor.config.ts` to serve from the bundled `dist/` instead of the live URL:

```typescript
const config: CapacitorConfig = {
  appId: 'com.finityo.debtquest',
  appName: 'Finityo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};
```

This ensures the app works fully offline without depending on a remote server.
