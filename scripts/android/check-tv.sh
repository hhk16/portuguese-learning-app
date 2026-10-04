#!/usr/bin/env bash
# The emulator action runs each script line in a separate shell; keep state here.
set -u
native_tv_test_status=0
gradle -p android-tv :app:connectedDebugAndroidTest -Pandroid.injected.androidTest.leaveApksInstalledAfterRun=true --no-daemon || native_tv_test_status=$?
mkdir -p native-tv-screenshots
adb pull /sdcard/Android/data/pt.partyportugues.tv/files/screenshots native-tv-screenshots/ || true
adb shell dumpsys gfxinfo pt.partyportugues.tv > native-tv-screenshots/frames.txt || true
adb logcat -b crash -d > native-tv-screenshots/crashes.txt || true
exit "$native_tv_test_status"
