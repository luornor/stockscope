from rest_framework_simplejwt.authentication import JWTAuthentication
from .utils import ACCESS_NAME


class CookieJWTAuthentication(JWTAuthentication):
    """Read JWT from HttpOnly cookies by default (fallback to Authorization header)."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(ACCESS_NAME)
        else:
            raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        
        return self.get_user(validated_token), validated_token
    
    
    