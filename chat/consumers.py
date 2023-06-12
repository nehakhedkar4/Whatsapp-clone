from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class MyAsyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('Connect')

    async def receive_json(self, content, **kwargs):
        print("Recieved")

    async def disconnect(self, event):
        print("Disconnect")