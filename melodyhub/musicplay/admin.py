from django.contrib import admin
from .models import Music, UserProfile, ListenTogetherRoom, PlaylistMusic, Playlist

# Register your models here.
admin.site.register(Music)
admin.site.register(UserProfile)
admin.site.register(ListenTogetherRoom)
admin.site.register(PlaylistMusic)
admin.site.register(Playlist)
