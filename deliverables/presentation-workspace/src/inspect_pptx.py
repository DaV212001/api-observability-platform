import json
import re
import zipfile
from pathlib import Path


pptx_path = Path("output/API_Observability_Platform_Presentation.pptx").resolve()
report_path = Path("scratch/python-pptx-quality.json").resolve()

with zipfile.ZipFile(pptx_path) as archive:
    names = archive.namelist()
    slides = sorted(
        [name for name in names if re.match(r"ppt/slides/slide\d+\.xml$", name)],
        key=lambda name: int(re.search(r"(\d+)", name).group(1)),
    )
    media = [name for name in names if name.startswith("ppt/media/")]

    zero_byte_media = []
    invalid_png_media = []
    placeholder_slides = []
    png_magic = b"\x89PNG\r\n\x1a\n"

    for name in media:
        data = archive.read(name)
        if not data:
            zero_byte_media.append(name)
        if name.lower().endswith(".png") and not data.startswith(png_magic):
            invalid_png_media.append(name)

    for index, name in enumerate(slides, 1):
        xml = archive.read(name).decode("utf-8", "ignore")
        if re.search(r"Slide Number|Click to add|Lorem ipsum|Replace with|TODO|TBD|sldNum", xml, re.I):
            placeholder_slides.append(index)

report = {
    "slide_count": len(slides),
    "media_count": len(media),
    "zero_byte_media": zero_byte_media,
    "invalid_png_media": invalid_png_media,
    "placeholder_slides": placeholder_slides,
    "failures": [],
}

if not slides:
    report["failures"].append("No slide XML parts found.")
if zero_byte_media:
    report["failures"].append("Zero-byte media found.")
if invalid_png_media:
    report["failures"].append("Invalid PNG media found.")
if placeholder_slides:
    report["failures"].append("Placeholder/debug text found.")

report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
