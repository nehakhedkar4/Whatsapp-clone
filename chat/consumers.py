from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import *
from django.db.models import Q

class MyAsyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('Connect')

        user1_id = self.scope['url_route']['kwargs']['user1_id']
        user2_id = self.scope['url_route']['kwargs']['user2_id']

        self.sent_by = self.scope['url_route']['kwargs']['user1_id']

        if user1_id > user2_id:
            self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user2_id']}_{self.scope['url_route']['kwargs']['user1_id']}"
        else:
            self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user1_id']}_{self.scope['url_route']['kwargs']['user2_id']}"

        print(self.chat_room,"=======================chat room")

        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    async def receive_json(self, content, **kwargs):
        print("Recieved", content)

        # DB
        first_user = await database_sync_to_async(MyUser.objects.get)(id=int(content['sent_by']))
        second_user = await database_sync_to_async(MyUser.objects.get)(id=int(content['send_to']))
        # thread = await database_sync_to_async(
        #     Thread.objects.filter(first_user=content['sent_by'], second_user=content['send_to']).exists)()

        thread = await database_sync_to_async(Thread.objects
        .filter(
            Q(first_user=content['sent_by'], second_user=content['send_to']) |
            Q(first_user=content['send_to'], second_user=content['sent_by'])
        )
        .exists)()

        # print(thread,"==============>>>>>thread")

        if thread:
            try:
                thread_instance = await database_sync_to_async(Thread.objects.get)(first_user=content['sent_by'], second_user=content['send_to'])
                # print(thread_instance,"===============>>>>>>>>>>>>>>>thread_instance if block")
            except Thread.DoesNotExist:
                thread_instance = await database_sync_to_async(Thread.objects.get)(first_user=content['send_to'], second_user=content['sent_by'])
                # print(thread_instance,"===============>>>>>>>>>>>>>>>thread_instance if block")
 
                                                           
        else:
            thread_n = await database_sync_to_async(Thread.objects.create)(first_user=first_user, second_user=second_user)
            thread_instance = await database_sync_to_async(Thread.objects.get)(id=thread_n.id)
            # print(thread_instance,"===============>>>>>>>>>>>>>>>thread_instance else block")

        await database_sync_to_async(ChatMessage.objects.create)(thread=thread_instance,user=first_user,message=content['message'],chat_room=self.chat_room)
            

        await self.channel_layer.group_send(self.chat_room , {
            'type' : 'neha_chat',
            'message' : content['message'],
            'sent_by' : content['sent_by'],
            'send_to' : content['send_to'],
        })
    async def neha_chat(self,event):
        # print(event,"=================event")
        await self.send_json({
            'message' : event['message'],
            'sent_by' : event['sent_by'],
            'send_to' : event['send_to'],
            })

    async def disconnect(self, event):
        print("Disconnect")
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)