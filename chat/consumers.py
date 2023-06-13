from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class MyAsyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('Connect')

        user1_id = self.scope['url_route']['kwargs']['user1_id']
        user2_id = self.scope['url_route']['kwargs']['user2_id']

        self.sent_by = self.scope['url_route']['kwargs']['user1_id']

        if user1_id > user2_id:
            print("bigger")
            self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user2_id']}_{self.scope['url_route']['kwargs']['user1_id']}"
        else:
            self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user1_id']}_{self.scope['url_route']['kwargs']['user2_id']}"

        print(self.chat_room,"=======================chat room")

        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    async def receive_json(self, content, **kwargs):
        print("Recieved", content)

        await self.channel_layer.group_send(self.chat_room , {
            'type' : 'neha_chat',
            'message' : content['message'],
            'sent_by' : content['sent_by'],
        })
    async def neha_chat(self,event):
        print(event,"=================event")
        await self.send_json({
            'message' : event['message'],
            'sent_by' : event['sent_by'],
            })

    async def disconnect(self, event):
        print("Disconnect")
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)