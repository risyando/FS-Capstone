"""Regenerate partner SVG logos with better visibility on dark backgrounds."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

PARTNERS = [
    {"name": "DBS Foundation", "color": "#e31837"},
    {"name": "Dicoding",       "color": "#2d9cdb"},
    {"name": "Google",         "color": "#4285f4"},
    {"name": "Tokopedia",      "color": "#42b549"},
    {"name": "Gojek",          "color": "#00aa13"},
    {"name": "Bukalapak",      "color": "#e31e52"},
    {"name": "Shopee",         "color": "#ee4d2d"},
    {"name": "Traveloka",      "color": "#0194f3"},
]

SVG_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
  <rect width="200" height="80" rx="10" fill="{color}" opacity="0.22"/>
  <rect x="1" y="1" width="198" height="78" rx="9" fill="none" stroke="{color}" stroke-width="2.5" opacity="0.7"/>
  <text x="100" y="50" text-anchor="middle"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="20" font-weight="800"
        fill="{color}" opacity="1"
        letter-spacing="0.5">{name}</text>
</svg>'''

def main():
    app = create_app()
    with app.app_context():
        logo_dir = os.path.join(app.static_folder, "uploads", "partners")
        os.makedirs(logo_dir, exist_ok=True)

        for p in PARTNERS:
            fname = p["name"].lower().replace(" ", "_") + ".svg"
            fpath = os.path.join(logo_dir, fname)
            svg = SVG_TEMPLATE.format(color=p["color"], name=p["name"])
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(svg)
            print(f"  Updated: {fname}")

        print(f"Done! {len(PARTNERS)} SVGs regenerated.")

if __name__ == "__main__":
    main()
