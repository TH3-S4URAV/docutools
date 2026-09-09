from pathlib import Path
from typing import Union, Optional
import pymupdf

def protect_pdf(file_path: Union[str, Path], output_path: Union[str, Path],
                user_password: str, owner_password: Optional[str] = None,
                allow_print: bool = True, allow_copy: bool = True) -> str:
    """Encrypt a PDF with user/owner password and permission flags."""
    if not user_password:
        raise ValueError("User password is required to protect the PDF.")
    
    doc = pymupdf.open(str(file_path))
    try:
        # Permissions bitmask
        # pymupdf.PDF_PERM_PRINT = 4, pymupdf.PDF_PERM_COPY = 16, pymupdf.PDF_PERM_ANNOTATE = 32
        perm = 0
        if allow_print:
            perm |= pymupdf.PDF_PERM_PRINT
        if allow_copy:
            perm |= pymupdf.PDF_PERM_COPY

        owner_pw = owner_password or user_password

        # Save with AES-256 encryption
        doc.save(
            str(output_path),
            encryption=pymupdf.PDF_ENCRYPT_AES_256,
            user_pw=user_password,
            owner_pw=owner_pw,
            permissions=perm,
            garbage=3,
            deflate=True
        )
        return str(output_path)
    finally:
        doc.close()

def unlock_pdf(file_path: Union[str, Path], output_path: Union[str, Path], password: str) -> str:
    """Decrypt a protected PDF using the provided password and save unencrypted."""
    doc = pymupdf.open(str(file_path))
    try:
        if not doc.is_encrypted:
            # Already unencrypted
            doc.save(str(output_path), garbage=3, deflate=True)
            return str(output_path)

        # Authenticate
        rc = doc.authenticate(password)
        if rc <= 0:
            raise ValueError("Incorrect password. Could not decrypt PDF.")

        # Save without encryption
        doc.save(str(output_path), encryption=pymupdf.PDF_ENCRYPT_NONE, garbage=3, deflate=True)
        return str(output_path)
    finally:
        doc.close()
