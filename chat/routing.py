from django.urls import path
from .consumers import MyAsyncConsumer

websocket_urlpatterns = [
    path('ws/async/<int:user1_id>/<int:user2_id>', MyAsyncConsumer.as_asgi())
]