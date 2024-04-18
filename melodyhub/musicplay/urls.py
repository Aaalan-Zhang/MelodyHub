"""
URL configuration for melodyhub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from musicplay import views

urlpatterns = [
    path('', views.main_action, name='home'),
    path('my_profile', views.my_profile, name='my_profile'),
    path('music_detail/<int:song_id>/', views.music_detail, name='music_detail'),
    path('delete_music/<int:song_id>/', views.delete_music, name='delete_music'),
    path('listentogether/create', views.listen_together, name='listen_together'),
    path('listentogether/<slug:token>/', views.inside_room, name='inside_room'),
    path('register', views.register, name='register'),
    path('login', views.log_in, name='login'),
    path('logout', views.log_out, name='logout'),
    path('favorite_playlist', views.favorite_playlist, name='favorite_playlist'),
    path('recent_playlist', views.recent_playlist, name='recent_playlist'),
    path('update_favorites/', views.update_favorites, name='update_favorites'),
    path('update_profile/', views.update_profile, name='update_profile'),
    path('upload_music/', views.upload_music, name='upload_music'),
    path('update_played_musics/', views.update_played_musics, name='update_played_musics'),
    path('get_favorite_status/', views.get_favorite_status, name='get_favorite_status'),
    path('listentogether/rooms/json/', views.rooms_json, name='rooms_json'),
    path('lt-search/', views.lt_search, name='lt_search'),
]
