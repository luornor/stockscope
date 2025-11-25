from django.conf import settings


ACCESS_NAME = 'access'
REFRESH_NAME = 'refresh'


def set_jwt_cookies(response, access_token: str, refresh_token: str):
    secure = settings.SESSION_COOKIE_SECURE
    domain = settings.JWT_COOKIE_DOMAIN
    samesite = settings.JWT_COOKIE_SAMESITE


    # access
    response.set_cookie(
    ACCESS_NAME, access_token, httponly=True, secure=secure,
    samesite=samesite, domain=domain, max_age=60*60
    )
    # refresh
    response.set_cookie(
    REFRESH_NAME, refresh_token, httponly=True, secure=secure,
    samesite=samesite, domain=domain, max_age=60*60*24*14
    )


def clear_jwt_cookies(response):
    for name in (ACCESS_NAME, REFRESH_NAME):
        response.delete_cookie(name, domain=settings.JWT_COOKIE_DOMAIN, samesite=settings.JWT_COOKIE_SAMESITE)