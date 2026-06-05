"""Regenerate partner SVG logos with better dark-theme visibility."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

PARTNERS = [
    {"name": "DBS Foundation", "color": "#e31837", "abbr": "DBS"},
    {"name": "Dicoding",       "color": "#2d9cdb", "abbr": "DC"},
    {"name": "Google",         "color": "#4285f4", "abbr": "G"},
    {"name": "Tokopedia",      "color": "#42b549", "abbr": "TKP"},
    {"name": "Gojek",          "color": "#00aa13", "abbr": "GJK"},
    {"name": "Bukalapak",      "color": "#e31e52", "abbr": "BL"},
    {"name": "Shopee",         "color": "#ee4d2d", "abbr": "SPE"},
    {"name": "Traveloka",      "color": "#0194f3", "abbr": "TVL"},
]

# Better SVG template: white background with colored text – clearly visible on dark UIs
SVG_TEMPLATE = '''\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <rect width="200" height="60" rx="10" fill="#ffffff"/>
  <rect x="1" y="1" width="198" height="58" rx="9" fill="none" stroke="{color}" stroke-width="2"/>
  <text x="100" y="38" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="17" font-weight="800"
        fill="{color}"
        letter-spacing="1">{name}</text>
</svg>'''

LOGO_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "static", "uploads", "partners"
)

def regen():
    os.makedirs(LOGO_DIR, exist_ok=True)
    for p in PARTNERS:
        fname = p["name"].lower().replace(" ", "_") + ".svg"
        fpath = os.path.join(LOGO_DIR, fname)
        svg = SVG_TEMPLATE.format(color=p["color"], name=p["name"])
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(svg)
        print(f"  [OK] Updated: {fname}")
    print(f"\nDone! {len(PARTNERS)} SVG files updated in {LOGO_DIR}")

if __name__ == "__main__":
    regen()
