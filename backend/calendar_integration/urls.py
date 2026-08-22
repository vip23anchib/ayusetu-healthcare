from django.urls import path
from .views import GoogleConnectView, GoogleCallbackView

urlpatterns = [
    path('calendar/connect/', GoogleConnectView.as_view(), name='calendar-connect'),
    path('calendar/callback/', GoogleCallbackView.as_view(), name='calendar-callback'),
]
