from pathlib import Path
import json, re

BASE = "https://rwesiklaundry-lgtm.github.io/rwesik-laundry-website"
OG_IMAGE = BASE + "/assets/outlet-rwesik-hq.webp"

PAGES = {
    "index.html": {
        "title": "Rwesik Laundry Pati | Laundry Bergaransi & Antar Jemput",
        "description": "Rwesik Laundry Pati melayani laundry kiloan, satuan, sepatu, bed cover, tas, koper, karpet dan antar-jemput. Satu mesin satu customer. Buka setiap hari 08.00–20.00.",
        "url": BASE + "/",
    },
    "layanan.html": {
        "title": "Layanan Laundry Pati | Rwesik Laundry",
        "description": "Layanan Rwesik Laundry Pati: cuci setrika, cuci lipat, setrika saja, cuci sepatu, bed cover, tas, koper, boneka, karpet, pakaian satuan dan dry cleaning.",
        "url": BASE + "/layanan.html",
    },
    "harga.html": {
        "title": "Daftar Harga Laundry Pati | Rwesik Laundry",
        "description": "Lihat daftar harga Rwesik Laundry Pati untuk laundry kiloan, cuci sepatu, bed cover, tas, koper, boneka, karpet, pakaian satuan dan dry cleaning.",
        "url": BASE + "/harga.html",
    },
    "sepatu.html": {
        "title": "Cuci Sepatu Pati Mulai Rp25.000 | Rwesik Laundry",
        "description": "Cuci sepatu di Rwesik Laundry Pati mulai Rp25.000. Tersedia Fast Clean, Deep Clean, Leather/Suede, Rewhitening dan Unyellowing sesuai kondisi sepatu.",
        "url": BASE + "/sepatu.html",
    },
    "garansi.html": {
        "title": "Laundry Bergaransi di Pati | Rwesik Laundry",
        "description": "Ketentuan garansi Rwesik Laundry Pati untuk pakaian rusak atau hilang serta pengerjaan ulang atau uang kembali untuk hasil yang tidak sesuai ketentuan.",
        "url": BASE + "/garansi.html",
    },
}

BUSINESS_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "DryCleaningOrLaundry",
    "name": "Rwesik Laundry",
    "url": BASE + "/",
    "image": OG_IMAGE,
    "telephone": "+6282231187316",
    "description": "Laundry bergaransi di Pati yang melayani laundry kiloan, satuan, sepatu, perlengkapan rumah tangga, dan antar-jemput.",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. Syeh Jangkung No. 77",
        "addressLocality": "Pati",
        "addressRegion": "Jawa Tengah",
        "addressCountry": "ID"
    },
    "openingHoursSpecification": [{
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "20:00"
    }],
    "sameAs": [
        "https://www.instagram.com/rwesiklaundrypati/",
        "https://www.tiktok.com/@rwesiklaundrypati"
    ]
}


def clean_existing(s):
    patterns = [
        r'\s*<meta\s+name="description"[^>]*>',
        r'\s*<meta\s+name="robots"[^>]*>',
        r'\s*<link\s+rel="canonical"[^>]*>',
        r'\s*<meta\s+property="og:[^"]+"[^>]*>',
        r'\s*<meta\s+name="twitter:[^"]+"[^>]*>',
        r'\s*<script\s+type="application/ld\+json"\s+id="rwesik-localbusiness">.*?</script>',
    ]
    for pat in patterns:
        s = re.sub(pat, '', s, flags=re.I | re.S)
    return s


def apply_meta(path, data, include_schema=False):
    p = Path(path)
    s = p.read_text(encoding="utf-8")
    s = clean_existing(s)
    s = re.sub(r'<title>.*?</title>', f'<title>{data["title"]}</title>', s, count=1, flags=re.I | re.S)

    meta = f'''\n<meta name="description" content="{data['description']}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<link rel="canonical" href="{data['url']}">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="Rwesik Laundry">\n<meta property="og:locale" content="id_ID">\n<meta property="og:title" content="{data['title']}">\n<meta property="og:description" content="{data['description']}">\n<meta property="og:url" content="{data['url']}">\n<meta property="og:image" content="{OG_IMAGE}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="{data['title']}">\n<meta name="twitter:description" content="{data['description']}">\n<meta name="twitter:image" content="{OG_IMAGE}">'''
    if include_schema:
        schema = json.dumps(BUSINESS_SCHEMA, ensure_ascii=False, separators=(",", ":"))
        meta += f'\n<script type="application/ld+json" id="rwesik-localbusiness">{schema}</script>'

    s = s.replace('</head>', meta + '\n</head>', 1)
    p.write_text(s, encoding="utf-8")


for name, data in PAGES.items():
    apply_meta(name, data, include_schema=(name == "index.html"))

lastmod = "2026-08-12"
urls = [
    (BASE + "/", "1.0"),
    (BASE + "/layanan.html", "0.9"),
    (BASE + "/harga.html", "0.9"),
    (BASE + "/sepatu.html", "0.8"),
    (BASE + "/garansi.html", "0.7"),
]
entries = "\n".join(
    f"  <url><loc>{url}</loc><lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq><priority>{priority}</priority></url>"
    for url, priority in urls
)
sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{entries}\n</urlset>\n'''
Path("sitemap.xml").write_text(sitemap, encoding="utf-8")

robots = f'''User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n'''
Path("robots.txt").write_text(robots, encoding="utf-8")

print("SEO metadata, sitemap, and robots.txt generated.")
