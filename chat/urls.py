from django.urls import path
from chat import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('chat/',views.chatfunct),
    path('',views.login, name='login'),
    path('register/',views.register, name='register'),
    path('verifyOtp/',views.verifyOtp, name='verifyOtp'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
