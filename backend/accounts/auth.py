from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from django.conf import settings

def verify_id_token(idtoken: str):
    """Verify a Google ID token from GSI / One Tap."""
    return id_token.verify_oauth2_token(
        idtoken,
        grequests.Request(),
        settings.GOOGLE_OAUTH_CLIENT_ID
    )
