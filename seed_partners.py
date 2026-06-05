"""Seed partner logos and database records."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import Partner

PARTNERS = [
    {"name": "DBS Foundation", "link": "https://www.dbs.com/foundation", "color": "#e31837", "abbr": "DBS"},
    {"name": "Dicoding", "link": "https://www.dicoding.com", "color": "#2d9cdb", "abbr": "DC"},
    {"name": "Google", "link": "https://careers.google.com", "color": "#4285f4", "abbr": "G"},
    {"name": "Tokopedia", "link": "https://www.tokopedia.com", "color": "#42b549", "abbr": "TKP"},
    {"name": "Gojek", "link": "https://www.gojek.com", "color": "#00aa13", "abbr": "GJK"},
    {"name": "Bukalapak", "link": "https://www.bukalapak.com", "color": "#e31e52", "abbr": "BL"},
    {"name": "Shopee", "link": "https://careers.shopee.co.id", "color": "#ee4d2d", "abbr": "SPE"},
    {"name": "Traveloka", "link": "https://www.traveloka.com", "color": "#0194f3", "abbr": "TVL"},
]

SVG_TEMPLATE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <rect width="200" height="60" rx="10" fill="{color}" opacity="0.15"/>
  <rect x="1" y="1" width="198" height="58" rx="9" fill="none" stroke="{color}" stroke-width="1.5" opacity="0.4"/>
  <text x="100" y="36" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="800" fill="{color}" letter-spacing="1">{name}</text>
</svg>'''

def seed():
    app = create_app()
    with app.app_context():
        logo_dir = os.path.join(app.static_folder, "uploads", "partners")
        os.makedirs(logo_dir, exist_ok=True)

        existing = Partner.query.count()
        if existing > 0:
            print(f"Already {existing} partners, skipping seed.")
            return

        for p in PARTNERS:
            fname = p["name"].lower().replace(" ", "_") + ".svg"
            fpath = os.path.join(logo_dir, fname)
            svg = SVG_TEMPLATE.format(color=p["color"], name=p["name"])
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(svg)
            print(f"  Created logo: {fname}")

            partner = Partner(
                name=p["name"],
                link=p["link"],
                image_path=f"uploads/partners/{fname}",
            )
            db.session.add(partner)

        db.session.commit()
        print(f"Seeded {len(PARTNERS)} partners.")

if __name__ == "__main__":
    seed()
