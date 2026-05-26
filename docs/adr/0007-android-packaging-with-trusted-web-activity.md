# Android packaging with Trusted Web Activity

TreeTales packages its Android app as a Bubblewrap-generated Trusted Web
Activity around the production PWA at `https://treetales.ramdhani.me/`. We
choose this over Capacitor, PWABuilder-only generation, or a custom Android
WebView because TreeTales is already an installable PWA with browser-local
storage, and the Android artifact should preserve that runtime instead of
forking the product into a separate native surface.

## Considered Options

- Bubblewrap Trusted Web Activity: selected because it creates a normal Android
  project for an existing PWA, supports Digital Asset Links verification, and
  keeps the deployed web app as the user-facing runtime.
- PWABuilder-only generation: rejected as the source of truth because it hides
  too much of the packaging state outside the repository. PWABuilder may still
  be useful for comparison or troubleshooting.
- Capacitor: rejected for the first Android package because TreeTales does not
  need native APIs yet, and the current TanStack Start and Cloudflare deployment
  shape is better represented as a verified web origin than as bundled static
  WebView assets.
- Custom Android WebView: rejected because it would create Android maintenance
  surface without solving a current product need.

## Consequences

- The Android package identity is `me.ramdhani.treetales`.
- The launcher label remains `TreeTales`.
- The generated Android project lives in `android-twa/` once added.
- `public/manifest.json` remains the source of truth for web/PWA install
  metadata. `android-twa/twa-manifest.json` owns Android-only wrapper metadata,
  including package id, app version, fallback behavior, and TWA-specific
  settings.
- Shared app name, icon, and theme metadata must stay manually aligned until
  TreeTales adds a manifest generation step.
- Release signing material is stored outside git and supplied to GitHub Actions
  through repository secrets.
- `public/.well-known/assetlinks.json` must publish the release-key SHA-256
  fingerprint so Android can verify that `me.ramdhani.treetales` is allowed to
  open `https://treetales.ramdhani.me/` as a Trusted Web Activity.
- The first Android workflow builds and uploads signed APK and AAB artifacts
  only. Google Play publishing is a later decision.
