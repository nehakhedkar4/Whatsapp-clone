from django.urls import path
from chat import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('chat/',views.chatfunct),
    # path('whatsapp/',views.whatsappFun, name='whatsapp'),
    path('chat/',views.newFun, name='chat'),
    path('chat/<int:id>',views.newFun, name='chat'),
    path('chat/<str:username>',views.newFun, name='chat'),
    path('',views.login, name='login'),
    path('logout/',views.logout, name='logout'),
    path('register/',views.register, name='register'),
    path('verifyOtp/',views.verifyOtp, name='verifyOtp'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
