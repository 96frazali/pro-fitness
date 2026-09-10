# Pro Fitness Play Store release handoff

This project is configured for the Android package `com.repwise.fitness`, version `1.0.2` / version code `3`, and targets Android API 36.

## 1. Create and protect the upload key

Create the key once. Keep the `.jks` file and both passwords in a password manager or encrypted backup. Every future Pro Fitness update must be signed with this same upload key.

```powershell
./scripts/create-upload-key.ps1
```

The script securely prompts for the certificate details and passwords, then writes `android/keystore.properties` and the ignored upload key. Never commit, email, or lose them.

For this prepared production build, the account owner can also use `./scripts/create-upload-key.ps1 -Automatic` to create a strong local key and credentials without printing the password. Back up the resulting `.jks` file and `keystore.properties` together in an encrypted location.

## 2. Build the signed upload bundle

From the repository root:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
npm run android:bundle
```

The upload file is created at:

`android/app/build/outputs/bundle/release/app-release.aab`

The build intentionally refuses to create a release artifact until private signing credentials are configured. This prevents accidental debug-signed or unsigned uploads.

## 3. Complete Play Console setup

1. Create or open the app with package name `com.repwise.fitness`.
2. Set the app type to App, category to Health & Fitness, and use the support email `numlfrazali@gmail.com`.
3. Publish `public/privacy-policy.html` on a public HTTPS URL and enter that exact URL in Play Console's Privacy policy field. The in-app privacy summary already includes the same policy and support contact.
4. Use `docs/STORE_LISTING.md` for the title and store copy. Upload a 512 × 512 icon, feature graphic, and genuine device screenshots.
5. Complete App content: privacy policy, Data safety, ads declaration, target audience, content rating, and reviewer access notes.
6. Upload the signed `.aab` to Internal testing first, test on real phones, then use a closed test before production when required by the developer account.
7. Enable Play App Signing during the first upload and keep the upload key in your secure backup.

Use `docs/PLAY_CONSOLE_DECLARATIONS.md` for the verified answers that match
this local-first release. It must be updated before a build adds Firebase,
accounts, analytics, ads, Health Connect records, or cloud sync.

## Release checks already covered in the app

- API 36 target; Android App Bundle build task.
- No ads, analytics SDK, account backend, or cloud sync in this release.
- Profile, workout, nutrition, measurement, and progress-photo data stays on the device unless the person explicitly exports it.
- Export and delete-local-data controls are available in Profile.
- Backup is disabled so private local data is not silently copied into device backups.
- Notifications are configured only when the person enables workout reminders.

## Important external items

Only the account owner can complete developer verification, host the final privacy-policy URL, accept Play App Signing, answer policy declarations, and publish the release. Review all final declarations against the exact build you upload.
