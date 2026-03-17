# Finityo — Permissions & Privacy Review

## Device Permissions Required
**None.** The current app requires zero device permissions:
- No camera
- No microphone
- No location
- No contacts
- No push notifications
- No biometrics
- No network access for core functionality

## Future Permissions (if wrapper features are added)
| Feature | Permission | Platform |
|---------|-----------|----------|
| Push notification reminders | Notifications | iOS, Android |
| Biometric app lock | Face ID / Fingerprint | iOS, Android |
| Export to Files | File system access | iOS, Android |

## Privacy Disclosures

### Data Stored Locally
- Debt entries (creditor name, balance, APR, payment amounts)
- Extra payment schedules
- Plan settings (strategy, start date, horizon)
- Computed plan results
- Payment activity log (manual entries)

### Data NOT Collected
- No personally identifiable information (PII)
- No account/login data
- No analytics or telemetry (current version)
- No third-party SDKs that collect data
- No server-side storage

### App Store Privacy Label (Apple)
- **Data Not Collected** — appropriate for current version
- If analytics are added later, update to "Data Used to Track You" or "Data Linked to You" as applicable

### Google Play Data Safety
- **No data shared with third parties**
- **No data collected** — appropriate for current version
- Data stored only on device via localStorage

## App Store Review Notes
- App performs all calculations client-side using JavaScript
- No network requests required for core functionality
- localStorage is the only persistence mechanism
- No financial transactions are processed
- App does not provide financial advice — it is a planning tool
