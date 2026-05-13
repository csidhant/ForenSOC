"""
Utility functions for hashing and evidence verification in ForenSOC.
"""

import hashlib
from pathlib import Path


def calculate_sha256(file_path: str) -> str:
    """
    Calculate SHA256 hash of a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        SHA256 hash as hex string
    """
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def calculate_md5(file_path: str) -> str:
    """
    Calculate MD5 hash of a file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        MD5 hash as hex string
    """
    md5_hash = hashlib.md5()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            md5_hash.update(byte_block)
    return md5_hash.hexdigest()


def verify_hash(file_path: str, sha256_hash: str, md5_hash: str = None) -> dict:
    """
    Verify file hash integrity.
    
    Args:
        file_path: Path to the file
        sha256_hash: Expected SHA256 hash
        md5_hash: Expected MD5 hash (optional)
        
    Returns:
        Dictionary with verification results
    """
    calculated_sha256 = calculate_sha256(file_path)
    sha256_match = calculated_sha256 == sha256_hash
    
    md5_match = True
    if md5_hash:
        calculated_md5 = calculate_md5(file_path)
        md5_match = calculated_md5 == md5_hash
    
    return {
        "integrity_status": "Verified" if (sha256_match and md5_match) else "Tampered",
        "sha256_match": sha256_match,
        "md5_match": md5_match,
    }


def get_file_size(file_path: str) -> int:
    """Get file size in bytes."""
    return Path(file_path).stat().st_size


def calculate_file_hash(file_path: str, algorithm: str = "sha256") -> str:
    """
    Calculate hash of a file using the given algorithm.

    Args:
        file_path: Path to the file
        algorithm: "sha256" or "md5"

    Returns:
        Hex digest string
    """
    algo = algorithm.lower()
    if algo == "md5":
        return calculate_md5(file_path)
    return calculate_sha256(file_path)
