from django.urls import path
from .views import google_onetap, me, refresh, logout_view


urlpatterns = [
    path('google/onetap', google_onetap, name='google_onetap'),
    path('me',me,name='me'),
    path('refresh',refresh,name='refresh'),
    path('logout',logout_view,name='logout'),
]
