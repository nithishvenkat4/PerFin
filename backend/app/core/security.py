"""Security utilities: password hashing (PBKDF2-HMAC-SHA256) and JWT token generation/validation."""

import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from typing import Any, Dict, Optional
import jwt

from app.core.config import settings

ALGORITHM = "HS256"
DEFAULT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a cryptographically secure random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    key_b64 = base64.b64encode(key).decode("ascii")
    return f"pbkdf2:sha256:100000${salt_b64}${key_b64}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored PBKDF2 hash."""
    if not hashed_password or not hashed_password.startswith("pbkdf2:sha256:"):
        return False
    try:
        header, salt_b64, key_b64 = hashed_password.split("$")
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_key = base64.b64decode(key_b64.encode("ascii"))
        actual_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(expected_key, actual_key)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Encodes a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=DEFAULT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a signed JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
