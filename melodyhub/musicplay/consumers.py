from channels.generic.websocket import AsyncWebsocketConsumer
import json
class MusicSyncConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        channel_name = self.scope['url_route']['kwargs']['key']
        self.group_name = 'room_%s' % channel_name

        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name, self.channel_name
        )

    async def receive(self, **kwargs):
        text_data = kwargs['text_data']
        json_data = json.loads(text_data)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'sync',
                'msg_type': json_data['msg_type'],
                'msg_content': json_data['msg_content']
            }
        )

    async def sync(self, event):
        await self.send(text_data=json.dumps({
            'msg_type': event['msg_type'],
            'msg_content': event['msg_content']
        }))