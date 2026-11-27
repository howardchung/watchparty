# watchparty native client

Run Gradle commands from this directory. On Windows use `gradlew.bat`.

## Android client

Open this directory in Android Studio and run the androidApp configuration on a device or emulator. To assemble a debug APK from the command line, run `./gradlew :androidApp:assembleDebug`. The APK is written to `androidApp/build/outputs/apk/debug/androidApp-debug.apk`.

## Desktop

Run the desktop client with `./gradlew :desktopApp:run`.

## Backend configuration

Guest sessions and product APIs use `https://watchparty.top`. No external authentication
configuration is required. Debug Android builds and desktop builds can override the
origin through `roomio.backendUrl`; Android accepts that extra only in debug builds.
Credentials belong to that exact backend origin and are kept in the platform secure store.

### Android identity

The Android application ID is `top.watchparty.app`, following reverse-domain naming
for `watchparty.top`. The Kotlin namespace remains `top.roomio.app.androidApp`.
Android treats this ID as a separate application from previous releases: installation
does not replace the old app or migrate its local guest identity and preferences.

### Android invite links

Room invites use `https://watchparty.top/?invite=CODE`. Android handles cold and warm
`ACTION_VIEW` launches and shows the room preview; entry requires tapping Join.
Loading, offline/error retry, full, and ended states use the same preview flow.

Publish `clients/web/public/.well-known/assetlinks.json` with the website before expecting
automatic Android App Links routing. It trusts the existing release certificate
only, not debug keys. Both the current application ID and the previous released ID
are associated so existing installations retain invite-link support. Verify the public
endpoint returns JSON over HTTPS without a redirect, then run `adb shell pm verify-app-links --re-verify top.watchparty.app`
and `adb shell pm get-app-links top.watchparty.app` on a release installation.
If Play App Signing is introduced, add its application signing certificate fingerprint.
To test handler delivery without domain verification, use:

```sh
adb shell am start -W -a android.intent.action.VIEW \
  -d 'https://watchparty.top/?invite=ABCD2345' -p top.watchparty.app
```
