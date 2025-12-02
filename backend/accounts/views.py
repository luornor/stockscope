from __future__ import annotations
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from .auth import verify_id_token
from .utils import set_jwt_cookies, clear_jwt_cookies, REFRESH_NAME
from django.http import HttpResponse
import json, logging
User = get_user_model()

def health(request):
    return HttpResponse("OK", status=200)


# --- One Tap / GSI ---
logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def google_onetap(request):
    """
    Accepts { id_token } from the Google Identity Services button.
    Verifies with Google, finds/creates the user, sets HttpOnly JWT cookies.
    """
    try:
        # Simple Origin check (extra safety since we skip CSRF token here)
        origin = request.headers.get('Origin')
        allowed = [o.strip() for o in (settings.CORS_ALLOWED_ORIGINS or []) if o.strip()]
        if allowed and origin and origin not in allowed:
            return JsonResponse({"detail":"Invalid origin"}, status=400)

        payload = json.loads(request.body or "{}")
        tok = payload.get("credential")
        if not tok:
            return JsonResponse({"detail":"Missing credential"}, status=400)


        idinfo = verify_id_token(tok)  # validates aud == GOOGLE_OAUTH_CLIENT_ID
        email = idinfo.get('email')
        if not email:
            return JsonResponse({"detail":"No email in id_token"}, status=400)

        user, created = User.objects.get_or_create(username=email, defaults={'email': email})
        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        resp = JsonResponse({'ok': True, 'user': {'email': user.email, 'username': user.username}})
        set_jwt_cookies(resp, access, str(refresh))
        return resp

    except Exception as e:
        return JsonResponse({"detail": str(e)}, status=400)


# --- Authenticated utilities ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return JsonResponse({'email': u.email, 'username': u.username})


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh(request):
    token = request.COOKIES.get(REFRESH_NAME)
    if not token:
        return JsonResponse({'error': 'no refresh cookie'}, status=401)
    try:
        new = RefreshToken(token)
        access = str(new.access_token)
        resp = JsonResponse({'ok': True})
        set_jwt_cookies(resp, access, str(new))
        return resp
    except Exception:
        return JsonResponse({'error': 'invalid refresh token'}, status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    resp = JsonResponse({'ok': True})
    clear_jwt_cookies(resp)
    return resp


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Permanently delete the authenticated user's account
    and clear JWT cookies.
    """
    user = request.user

    # Clear the cookies first
    resp = JsonResponse({"detail": "Account deleted."})
    clear_jwt_cookies(resp)

    # Delete the user from the database
    user.delete()

    return resp
