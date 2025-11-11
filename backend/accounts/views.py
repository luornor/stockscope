# Create your views here.
from __future__ import annotations
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_GET
from django.conf import settings
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .auth import build_auth_url, exchange_code_for_tokens, verify_id_token
from .utils import set_jwt_cookies, clear_jwt_cookies, ACCESS_NAME, REFRESH_NAME


User = get_user_model()


@require_GET
def google_login(request):
    next_url = request.GET.get('next') or settings.FRONTEND_APP_URL + '/auth/success'
    request.session['oauth_next'] = next_url # minimal state
    redirect_uri = request.build_absolute_uri(reverse('accounts:google_callback'))
    url = build_auth_url(redirect_uri, state='')
    return HttpResponseRedirect(url)


@require_GET
def google_callback(request):
    code = request.GET.get('code')
    if not code:
        return HttpResponseBadRequest('Missing code')
        redirect_uri = request.build_absolute_uri(reverse('accounts:google_callback'))
    try:
        token_payload = exchange_code_for_tokens(code, redirect_uri)
        idinfo = verify_id_token(token_payload['id_token'])
        email = idinfo.get('email')
    if not email:
        return HttpResponseBadRequest('No email from Google')
    # Create or get user (Google‑only; no password login)
    user, created = User.objects.get_or_create(username=email, defaults={'email': email})
    if created:
        user.set_unusable_password()
        user.save()
    # Issue JWTs
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    response = HttpResponseRedirect(request.session.pop('oauth_next', settings.FRONTEND_APP_URL + '/auth/success'))
    set_jwt_cookies(response, access, str(refresh))
    return response
    except Exception as e:
        return HttpResponseBadRequest(str(e))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return JsonResponse({'email': u.email, 'username': u.username})


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh(request):
    from rest_framework_simplejwt.tokens import RefreshToken
    token = request.COOKIES.get(REFRESH_NAME)
    if not token:
        return JsonResponse({'error': 'no refresh cookie'}, status=401)
    try:
        new = RefreshToken(token)
        access = str(new.access_token)
        response = JsonResponse({'ok': True})
        set_jwt_cookies(response, access, str(new))
        return response
    except Exception:
        return JsonResponse({'error': 'invalid refresh token'}, status=401)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    response = JsonResponse({'ok': True})
    clear_jwt_cookies(response)
    return response