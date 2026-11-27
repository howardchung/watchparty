"""Validate the bundled launcher catalog without installing or changing a device."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
ANDROID = "{http://schemas.android.com/apk/res/android}"
RES = ROOT / "androidApp/src/main/res"
source = (ROOT / "domain/src/commonMain/kotlin/top/roomio/domain/launcher/LauncherIconController.kt").read_text()
entries = re.findall(r'([A-Z_]+)\("([A-Za-z]+)", 0x([0-9A-F]{6})\)', source)
assert len(entries) == 24
manifest = ET.parse(ROOT / "androidApp/src/main/AndroidManifest.xml").getroot()
app = manifest.find("application")
aliases = app.findall("activity-alias")
assert len(aliases) == 24
assert len({alias.get(ANDROID + "name") for alias in aliases}) == 24
activities = {a.get(ANDROID + "name"): a for a in app.findall("activity")}
assert ".LauncherActivity" in activities
activity = activities[".AppActivity"]
assert activity.get(ANDROID + "enabled", "true") == "true"
assert not activity.findall(f'.//category[@{ANDROID}name="android.intent.category.LAUNCHER"]')
assert activity.findall(f'.//action[@{ANDROID}name="android.intent.action.VIEW"]')
colors = {item.get("name"): item.text for item in ET.parse(RES / "values/launcher_icon_colors.xml").getroot()}
enabled = []
for key, suffix, hex_color in entries:
    slug = key.lower()
    alias = next(a for a in aliases if a.get(ANDROID + "name") == "${applicationId}.launcher." + suffix)
    assert alias.get(ANDROID + "targetActivity") == ".LauncherActivity"
    assert alias.get(ANDROID + "exported") == "true"
    assert alias.get(ANDROID + "icon") == "@mipmap/ic_launcher_" + slug
    assert alias.findall(f'.//category[@{ANDROID}name="android.intent.category.LAUNCHER"]')
    if alias.get(ANDROID + "enabled") == "true":
        enabled.append(key)
    assert colors["launcher_" + slug] == "#" + hex_color
    adaptive = ET.parse(RES / f"mipmap-anydpi-v26/ic_launcher_{slug}.xml").getroot()
    assert adaptive.find("background").get(ANDROID + "drawable") == "@color/launcher_" + slug
    for tag in ("foreground", "monochrome"):
        resource = adaptive.find(tag).get(ANDROID + "drawable").replace("@drawable/", "")
        assert (RES / f"drawable/{resource}.xml").exists()
    legacy = ET.parse(RES / f"mipmap-anydpi/ic_launcher_{slug}.xml").getroot()
    assert legacy.tag == "vector"
    assert legacy.find("path").get(ANDROID + "fillColor") == "#" + hex_color
assert enabled == ["BASIL"]
print("Verified 24 launcher colors, aliases, adaptive/legacy resources, default, and invite-link activity.")
