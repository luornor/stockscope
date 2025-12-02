from .utils import ACCESS_NAME
from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
User = get_user_model()

class CookieJWTAuthentication(BaseAuthentication):
    ACCESS_NAME = ACCESS_NAME
    def authenticate(self, request):
        token = request.COOKIES.get(self.ACCESS_NAME)
        if not token:
            return None  # <- silent: no token

        try:
            at = AccessToken(token)
            uid = at.get("user_id")
            user = User.objects.get(id=uid)
            return (user, None)
        except Exception:
            # IMPORTANT: be silent so AllowAny endpoints (refresh/onetap) still work
            return None
