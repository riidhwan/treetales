# Android Packaging

TreeTales is migrating Android releases from a Trusted Web Activity (TWA) to a
bundled Capacitor app. The Android package id remains
`me.ramdhani.treetales`, and the launcher label remains `TreeTales`.

The Capacitor migration decision is recorded in
`docs/adr/0010-android-packaging-with-bundled-capacitor.md`. The first
Capacitor milestone is a compatibility shell only: bundle the existing web app,
keep the browser PWA deployment alive, and defer native gallery picking and
native file storage migration to later slices.

The migration should replace `android-twa/` rather than keep parallel TWA and
Capacitor Android projects. TreeTales should have one Android package source of
truth for `me.ramdhani.treetales` at a time.

The packaging migration parent is tracked in GitHub issue #247. Native gallery
picking (#249) and native app-private Character Illustration file storage (#250)
are standalone follow-up issues; they are not required for the packaging
migration parent to close.

## Ownership

- `public/manifest.json` owns web and PWA install metadata.
- The Capacitor Android project owns native Android wrapper metadata once the
  migration replaces `android-twa/`.
- Shared app name, icon, and theme color must be kept aligned manually until a
  manifest generation step exists.
- Android release signing keys never belong in git.

## One-time release keystore

Create one release keystore for `me.ramdhani.treetales` and keep it stable.
Do not generate a new keystore for each CI run, because changing the key changes
the Android app identity and breaks Digital Asset Links verification.

Use the alias `treetales-release`:

```sh
keytool -genkeypair \
  -alias treetales-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -keystore /tmp/treetales-release.keystore
```

Choose strong passwords for the keystore and key. Store the temporary keystore
somewhere outside the repository while setting up secrets, then remove the local
copy after the secret has been saved and tested.

## GitHub Secrets

The Android artifact workflow expects these repository secrets:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Release keystore password |
| `ANDROID_KEY_PASSWORD` | Release key password |
| `ANDROID_KEY_ALIAS` | `treetales-release` |

On Linux, create the base64 value with:

```sh
base64 -w 0 /tmp/treetales-release.keystore
```

Set the secrets through the GitHub repository settings UI. Do not paste the
base64 keystore value into an issue, pull request, commit, or chat transcript.

## Workflow behavior

The first Android workflow is manual only. It should run through
`workflow_dispatch`, read committed Android version metadata from the Capacitor
Android project, and upload both signed artifacts:

- signed APK for direct install and smoke testing,
- signed AAB for future Google Play upload.

The workflow should verify the web app before packaging:

```sh
npm run lint
npm run test
npm run test:coverage
npm run build
```

It should build Android artifacts from the committed Capacitor Android project
where possible. Capacitor and native plugin versions should be pinned by
package and lock files; CI should not install floating latest native tooling.

Google Play publishing is out of scope for the first Android workflow.

## APK smoke test

Before treating a built artifact as releasable:

1. Install the signed APK on an Android device or emulator.
2. Launch `TreeTales`.
3. Confirm it opens from packaged app assets without requiring
   `https://treetales.ramdhani.me/`.
4. Confirm the mobile PWA install choice does not appear inside the APK.
5. Confirm the dashboard loads.
6. Create a Story.
7. Add an Intro Chapter.
8. Add a Character.
9. Import a Character Illustration using the existing web picker.
10. Relaunch the app and confirm the Story, Chapter, Character, and Character
    Illustration persist in Android app-local data.
11. Turn network off, relaunch, and confirm the packaged app shell can still
    open.
12. Run normal browser web verification separately so the PWA path is not
    regressed.

TreeTales does not support cross-device offline sync. The Android package should
not imply data sync beyond the app-local persistence model.
