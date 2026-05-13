"""Save an uploaded multipart file under UPLOAD_DIR / case_id."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import Settings


async def save_uploaded_file(
    settings: Settings,
    case_id: int,
    file: UploadFile,
) -> tuple[str, str, int]:
    """
    Returns (absolute_stored_path, original_filename, size_bytes).
    """
    upload_root = Path(settings.UPLOAD_DIR).resolve()
    case_dir = upload_root / str(case_id)
    case_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "upload.bin"
    suffix = Path(original_name).suffix[:32]
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    dest_path = case_dir / stored_name

    max_size = settings.MAX_UPLOAD_SIZE
    written = 0
    chunk_size = 1024 * 1024

    try:
        with open(dest_path, "wb") as out:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_size:
                    dest_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File exceeds configured maximum upload size",
                    )
                out.write(chunk)
    except HTTPException:
        raise
    except OSError as exc:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store file: {exc}",
        ) from exc

    return str(dest_path), original_name, written
