# Android packaging with bundled Capacitor

TreeTales will migrate Android packaging from a Trusted Web Activity to a
bundled Capacitor app because future features need native gallery access and
more controlled app-private file storage than the current PWA/TWA runtime can
reliably provide. The first Capacitor milestone is a compatibility shell only:
it bundles the existing web app in the Android package, keeps the separate web
PWA deployment alive, and defers native gallery picking and native file storage
migration to later slices behind explicit capability adapters.

## Considered Options

- Keep the TWA: rejected because the planned native media and file-storage
  features would keep pushing against the browser-origin runtime boundary.
- Remote-url Capacitor shell: rejected because it preserves much of the TWA
  dependency on the deployed origin while adding native-shell maintenance.
- Bundled Capacitor app: selected because the Android app can start from
  packaged assets, gain access to Capacitor plugins, and still share most
  application code with the web/PWA build.

## Consequences

- Android app data is separate from browser/PWA data unless TreeTales later
  adds explicit import/export or sync.
- Platform-specific behavior must live behind capability adapters rather than
  route or component branches.
- The initial Capacitor slice should skip native feature migration and prove the
  existing workflows still run in the bundled Android app.
- The mobile PWA install choice and service worker registration should be
  disabled or skipped inside the Capacitor runtime.
