from django.urls import re_path
from musicplay import consumers

websocket_urlpatterns = [
    re_path(r'^ws/listentogether/(?P<token>\w+)/', consumers.SyncConsumer.as_asgi()),
]