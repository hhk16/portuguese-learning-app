"""Make the Capacitor app an Android TV app: leanback launcher + banner, no touchscreen needed, landscape, microphone."""
import re, sys
p = sys.argv[1]
s = open(p).read()
feats = ('<uses-feature android:name="android.software.leanback" android:required="false" />\n'
         '    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n'
         '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n'
         '    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\n')
s = s.replace("<application", feats + "    <application", 1)
s = s.replace("<application", '<application android:banner="@drawable/banner"', 1)
s = re.sub(r"<activity", '<activity android:screenOrientation="landscape"', s, count=1)
s = s.replace('<category android:name="android.intent.category.LAUNCHER" />',
              '<category android:name="android.intent.category.LAUNCHER" />\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />', 1)
open(p, "w").write(s)
print("patched", p)
