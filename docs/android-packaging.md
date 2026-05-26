# Android Packaging

TreeTales packages Android releases as a Trusted Web Activity (TWA) around the
production PWA at `https://treetales.ramdhani.me/`. The Android package id is
`me.ramdhani.treetales`, and the launcher label is `TreeTales`.

The TWA packaging decision is recorded in
`docs/adr/0007-android-packaging-with-trusted-web-activity.md`.

## Ownership

- `public/manifest.json` owns web and PWA install metadata.
- `android-twa/twa-manifest.json` owns Android wrapper metadata after the
  generated project is added.
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

## Digital Asset Links

Extract the release-key SHA-256 fingerprint from the same keystore used for CI
signing:

```sh
keytool -list -v \
  -keystore /tmp/treetales-release.keystore \
  -alias treetales-release
```

The fingerprint must be published from:

```text
https://treetales.ramdhani.me/.well-known/assetlinks.json
```

The follow-up Android package slice adds
`public/.well-known/assetlinks.json` with the real release-key fingerprint. Its
entry must bind the production origin to package `me.ramdhani.treetales`.

If a signed APK opens with visible browser Custom Tab UI instead of the
full-screen TWA surface, first check that:

- the deployed `assetlinks.json` contains the release-key SHA-256 fingerprint,
- the package name is exactly `me.ramdhani.treetales`,
- the APK was signed with the matching release keystore, and
- the app opens `https://treetales.ramdhani.me/`.

## Workflow behavior

The first Android workflow is manual only. It should run through
`workflow_dispatch`, read committed Android version metadata from the generated
project, and upload both signed artifacts:

- signed APK for direct install and smoke testing,
- signed AAB for future Google Play upload.

The workflow should verify the web app before packaging:

```sh
npm run lint
npm run test
npm run test:coverage
npm run build
```

It should build Android artifacts from the committed generated Gradle project
where possible. Bubblewrap should be pinned for project generation and updates;
CI should not install a floating latest Bubblewrap version.

Google Play publishing is out of scope for the first Android workflow.

## APK smoke test

Before treating a built artifact as releasable:

1. Install the signed APK on an Android device or emulator.
2. Launch `TreeTales`.
3. Confirm it opens `https://treetales.ramdhani.me/` in full-screen TWA UI, not
   visible Custom Tab browser UI.
4. Confirm the install-choice prompt does not appear inside the APK.
5. Confirm the dashboard loads.
6. Create a Story, add an Intro Chapter, relaunch the app, and confirm the
   browser-local data persists.
7. Turn network off, relaunch, and confirm the cached shell can load well
   enough to reach the app's offline-resilient surface.

TreeTales does not support cross-device offline sync. The Android package should
not imply data sync beyond the existing browser-local persistence model.
