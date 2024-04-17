from channels.generic.websocket import AsyncWebsocketConsumer
import json
import redis
class SyncConsumer(AsyncWebsocketConsumer):
    # active_users = {}

    async def connect(self):
        # self.active_connections += 1
        channel_name = self.scope['url_route']['kwargs']['token']
        self.group_name = 'room_%s' % channel_name

        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )

        await self.accept()
        import redis

        # r = redis.Redis(host='localhost', port=6379, db=0)
        # subscribers = r.execute_command(f'PUBSUB NUMSUB {self.group_name}')
        # print(subscribers[1])
        # session_key = self.scope['session'].session_key

        # if self.group_name not in self.active_users:
        #     self.active_users[self.group_name] = [session_key]
        # elif session_key not in self.active_users[self.group_name]:
        #     self.active_users[self.group_name].append(session_key)
        # print(self.active_users)

        await self.broadcast_active_connections()








    async def disconnect(self, close_code):
        # session_key = self.scope['session'].session_key
        # if self.group_name in self.active_users and \
        #    session_key in self.active_users[self.group_name]:
        #     # Remove my session key from the list
        #     self.active_users[self.group_name] = list(filter(
        #         lambda x: x != session_key,
        #         self.active_users[self.group_name]))
        # self.active_connections -= 1
        await self.broadcast_active_connections()
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

        

    async def receive(self, **kwargs):
        text_data = kwargs['text_data']
        json_data = json.loads(text_data)

        msg_type = json_data['msg_type']

        if msg_type == 'sync_music_request_from_participant' or msg_type == 'sync_music_response_from_host':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'sync_music',
                    'msg_type': json_data['msg_type'],
                    'msg_content': json_data['msg_content']
                }
            )
        elif msg_type == 'sync_chat_request' or msg_type == 'sync_chat_response':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'sync_message',
                    'msg_type': json_data['msg_type'],
                    'msg_content': json_data['msg_content']
                }
            )


    async def sync_message(self, event):
        # print(event['msg_content'])
        await self.send(text_data=json.dumps({
            'msg_type': event['msg_type'],
            'msg_content': event['msg_content']
        }))

    async def sync_music(self, event):
        await self.send(text_data=json.dumps({
            'msg_type': event['msg_type'],
            'msg_content': event['msg_content']
        }))

    async def broadcast_active_connections(self):
        await self.channel_layer.group_send(
                self.group_name,
            {
                'type': 'active_connections_message',
                # 'message': len(self.channel_layer.groups.get(self.group_name, {}))
                # 'message': len(self.active_users[self.group_name])
                'message': 1

            }
        )

    async def active_connections_message(self, event):
        await self.send(text_data=json.dumps({
            'msg_type': 'active_connections',
            'msg_content': f"Current Active Users: {event['message']}"
        }))