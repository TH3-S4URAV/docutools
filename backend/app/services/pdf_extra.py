import io
import json
import zipfile
from pathlib import Path
from typing import Union, Dict, Any, List
import pymupdf

def extract_images_from_pdf(file_path: Union[str, Path], output_dir: Union[str, Path]) -> Dict[str, Any]:
    """Extract all embedded raster images from PDF and package into a ZIP with a metadata summary."""
    doc = pymupdf.open(str(file_path))
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    base_stem = Path(file_path).stem

    extracted_info = []
    saved_files = []

    try:
        img_counter = 1
        for page_idx, page in enumerate(doc):
            image_list = page.get_images(full=True)
            for img_info in image_list:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                if not base_image:
                    continue

                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]

                img_filename = f"{base_stem}_img_{img_counter}_p{page_idx + 1}.{image_ext}"
                img_path = out_dir / img_filename

                with open(img_path, "wb") as f:
                    f.write(image_bytes)

                saved_files.append(str(img_path))
                extracted_info.append({
                    "id": img_counter,
                    "page": page_idx + 1,
                    "filename": img_filename,
                    "format": image_ext.upper(),
                    "width": width,
                    "height": height,
                    "size_bytes": len(image_bytes)
                })
                img_counter += 1

        if not saved_files:
            return {
                "total_images": 0,
                "file_path": None,
                "message": "No embedded images found in this PDF document."
            }

        # Package into ZIP archive
        zip_path = out_dir / f"{base_stem}_extracted_images.zip"
        with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
            for sf in saved_files:
                zf.write(sf, arcname=Path(sf).name)
            # Include JSON manifest inside ZIP
            manifest_bytes = json.dumps(extracted_info, indent=2).encode('utf-8')
            zf.writestr("images_manifest.json", manifest_bytes)

        return {
            "total_images": len(saved_files),
            "file_path": str(zip_path),
            "images": extracted_info
        }
    finally:
        doc.close()
