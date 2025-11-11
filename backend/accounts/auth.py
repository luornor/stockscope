import requests
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from django.conf import settings


GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'


SCOPES = 'openid email profile'


def build_auth_url(redirect_uri, state):
    from urllib.parse import urlencode
    params = {
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': redirect_uri,
            'scope': SCOPES,
            'access_type': 'offline',
            'include_granted_scopes': 'true',
            'prompt': 'consent',
            'state': state or '',
            }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def exchange_code_for_tokens(code, redirect_uri):
    data = {
            'code': code,
            'client_id': settings.GOOGLE_OAUTH_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH_CLIENT_SECRET,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
            }
    r = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=10)
    r.raise_for_status()
    return r.json() # contains access_token, id_token, refresh_token (maybe)


def verify_id_token(idtoken):
    return id_token.verify_oauth2_token(idtoken, grequests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID)