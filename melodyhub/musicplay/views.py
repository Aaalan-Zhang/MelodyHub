from django.http import HttpResponse
from django.shortcuts import redirect, render, resolve_url, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from mutagen.mp3 import MP3

from melodyhub.settings import BASE_DIR, MUSICPLAY_USERS, MUSICPLAY_TITLE
from .models import UserProfile, Music, ListenTogetherRoom, Playlist
from .forms import ProfileForm, MusicUploadForm, CreateRoomForm

import hashlib
import os

import time


def _known_user_check(action_function):
    def my_wrapper_function(request, *args, **kwargs):
        if "title" not in request.session:
            request.session["title"] = MUSICPLAY_TITLE

        if "picture" not in request.session:
            request.session["picture"] = request.user.social_auth.get(
                provider="google-oauth2"
            ).extra_data["picture"]

        if isinstance(MUSICPLAY_USERS, str):
            if request.user.email.endswith(MUSICPLAY_USERS):
                return action_function(request, *args, **kwargs)
            message = f"You must use an e-mail address ending with {MUSICPLAY_USERS}"
            return render(request, "musicplay/main-page.html", {"message": message})
        else:
            assert isinstance(MUSICPLAY_USERS, list)
            for pattern in MUSICPLAY_USERS:
                if request.user.email == pattern:
                    return action_function(request, *args, **kwargs)
            message = "You're not authorized to use this application"
            return render(request, "musicplay/main-page.html", {"message": message})

    return my_wrapper_function


@login_required
@_known_user_check
def main_action(request):
    request.session["title"] = "Main Page"
    return render(request, "musicplay/main-page.html", {"message": "Hello"})


@login_required
def my_profile(request):
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    music = Music.objects.filter(user=request.user).order_by("-upload_time")
    request.session["title"] = "My Profile"
    music_upload_form = MusicUploadForm()
    profile_form = ProfileForm(instance=user_profile)
    return render(
        request,
        "musicplay/my-profile.html",
        {
            "user_profile": user_profile,
            "music": music,
            "music_upload_form": music_upload_form,
            "profile_form": profile_form,
        },
    )


@login_required
def upload_profile(request):
    if request.method == "POST":
        profile = UserProfile.objects.get(user=request.user)
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect(reverse("musicplay:my_profile"))


@login_required
def upload_music(request):
    if request.method == "POST":
        music = Music(user=request.user, upload_time=timezone.now())
        form = MusicUploadForm(request.POST, request.FILES, instance=music)
        if form.is_valid():
            form.save()
            music_file = request.FILES.get('file')
            audio = MP3(music_file)
            music.length = int(audio.info.length)
            music.save()
        return redirect(reverse("musicplay:my_profile"))


@login_required
def delete_music(request, song_id):
    if request.method == "POST":
        song = get_object_or_404(Music, id=song_id)
        if request.user == song.user:
            song.delete()
            return redirect(reverse("musicplay:my_profile"))


@login_required
def playlist_detail(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id)
    musics = playlist.musics.all()
    return render(request, 'playlist_detail.html', {
        'playlist': playlist,
        'musics': musics,
    })


@login_required
def listen_together(request):
    error = ""
    myListenTogetherRooms = ListenTogetherRoom.objects.filter(creator=request.user)
    hasRoom = (len(myListenTogetherRooms) >= 1)
    if request.method == 'POST':
        form = CreateRoomForm(request.POST)
        if form.is_valid():
            random_data = os.urandom(16)
            hash_object = hashlib.sha256()
            hash_object.update(random_data)
            hash = hash_object.hexdigest()

            link = hash[:16]

            newRoom = ListenTogetherRoom(
                name=form.cleaned_data['name'],
                room_id=link,
                creator=request.user
            )
            newRoom.save()
            return redirect(reverse('musicplay:inside_room', args=[link]))

    context = {'form': CreateRoomForm(), 'error': error, 'hasRoom': hasRoom, 'rooms': myListenTogetherRooms}
    return render(request, 'ListenTogether/create.html', context)

@login_required
def inside_room(request, key):

    context = {}
    thisRoom = get_object_or_404(ListenTogetherRoom, room_id=key)
    context = {'room': thisRoom}
    context['isHost'] = (thisRoom.creator.id == request.user.id)
    return render(request, 'ListenTogether/listen.html', context)