from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import *
from django.db.models import Q

class MyAsyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('Connect')

        if '/group' in self.scope['path']:
            self.chat_room = f"group_id_{self.scope['url_route']['kwargs']['group_id']}"
            print(self.chat_room,"=====================grp name")
        else:
            print('No')
            user1_id = self.scope['url_route']['kwargs']['user1_id']
            user2_id = self.scope['url_route']['kwargs']['user2_id']

            self.sent_by = self.scope['url_route']['kwargs']['user1_id']

            if user1_id > user2_id:
                self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user2_id']}_{self.scope['url_route']['kwargs']['user1_id']}"
            else:
                self.chat_room = f"chat_room_{self.scope['url_route']['kwargs']['user1_id']}_{self.scope['url_route']['kwargs']['user2_id']}"


        await self.channel_layer.group_add(self.chat_room, self.channel_name)
        await self.accept()

    async def receive_json(self, content, **kwargs):
        print("Recieved", content)

        if content['message_to'] == 'group':

            group_inst = await database_sync_to_async(Group.objects.get)(id=self.scope['url_route']['kwargs']['group_id'])
            sender = await database_sync_to_async(MyUser.objects.get)(id=int(content['sender']))
            msg = await database_sync_to_async(GroupChat.objects.create)(group_name=group_inst,sender=sender,message=content['message'])

            await self.channel_layer.group_send(self.chat_room, {
                'type' : 'group_chat',
                'message' : content['message'],
                'sender' : sender.username,
                'sender_id' : sender.id,
                'from' : 'group',
            })

        else:

            # DB
            first_user = await database_sync_to_async(MyUser.objects.get)(id=int(content['sent_by']))
            second_user = await database_sync_to_async(MyUser.objects.get)(id=int(content['send_to']))

            thread = await database_sync_to_async(Thread.objects
            .filter(
                Q(first_user=content['sent_by'], second_user=content['send_to']) |
                Q(first_user=content['send_to'], second_user=content['sent_by'])
            )
            .exists)()


            if thread:
                try:
                    thread_instance = await database_sync_to_async(Thread.objects.get)(first_user=content['sent_by'], second_user=content['send_to'])
                except Thread.DoesNotExist:
                    thread_instance = await database_sync_to_async(Thread.objects.get)(first_user=content['send_to'], second_user=content['sent_by'])
    
                                                            
            else:
                thread_n = await database_sync_to_async(Thread.objects.create)(first_user=first_user, second_user=second_user)
                thread_instance = await database_sync_to_async(Thread.objects.get)(id=thread_n.id)

            await database_sync_to_async(ChatMessage.objects.create)(thread=thread_instance,user=first_user,message=content['message'],chat_room=self.chat_room)
                

            await self.channel_layer.group_send(self.chat_room , {
                'type' : 'neha_chat',
                'message' : content['message'],
                'sent_by' : content['sent_by'],
                'send_to' : content['send_to'],
                'from' : 'chat',
            })

    async def neha_chat(self,event):
        await self.send_json({
            'message' : event['message'],
            'sent_by' : event['sent_by'],
            'send_to' : event['send_to'],
            'from' : event['from'],
            })
        
    async def group_chat(self,event):
        await self.send_json({
            'message' : event['message'],
            'sender' : event['sender'],
            'from' : event['from'],
            'sender_id' : event['sender_id'],
            })

    async def disconnect(self, event):
        print("Disconnect")
        await self.channel_layer.group_discard(self.chat_room, self.channel_name)