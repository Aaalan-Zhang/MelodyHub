from django.shortcuts import redirect, render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.utils import timezone
from mutagen.mp3 import MP3
from mutagen.id3 import APIC

from melodyhub.settings import MUSICPLAY_USERS, MUSICPLAY_TITLE
from .models import UserProfile, Music, ListenTogetherRoom, Playlist
from .forms import ProfileForm, MusicUploadForm, CreateRoomForm
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
import hashlib
import os
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


@login_required
def get_favorite_status(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        music_id = request.GET.get('music_id')

        user_profile = UserProfile.objects.get(user__id=user_id)
        music = Music.objects.get(id=music_id)

        is_favorite = music in user_profile.favorites.all()

        return JsonResponse({'is_favorite': is_favorite})
    else:
        return JsonResponse({'status': 'error'})

@csrf_exempt
def update_favorites(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        music_id = request.POST.get('music_id')
        action = request.POST.get('action')

        user_profile = UserProfile.objects.get(user__id=user_id)
        music = Music.objects.get(id=music_id)

        if action == 'increment':
            user_profile.total_favorites += 1
            music.favorites_count += 1
            user_profile.favorites.add(music)
        elif action == 'decrement':
            user_profile.total_favorites -= 1
            music.favorites_count -= 1
            user_profile.favorites.remove(music)

        user_profile.save()
        music.save()

        return JsonResponse({'status': 'ok'})
    else:
        return JsonResponse({'status': 'error'})


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


def register(request):
    if request.method == "GET":
        context = {"form": UserCreationForm()}
        return render(request, "login/register.html", context)

    form = UserCreationForm(request.POST)
    try:
        new_user = form.save()

        new_user = authenticate(
            username=form.cleaned_data["username"],
            password=form.cleaned_data["password1"],
        )
        login(request, new_user)

        profile = UserProfile(user=new_user)
        profile.save()

        return redirect(reverse("musicplay:home"))
    except Exception as e:
        context = {"form": form, "error": e}
        return render(request, "login/register.html", context)


def log_out(request):
    logout(request)
    return render(request, "login/logout.html")


def log_in(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return redirect(reverse("musicplay:home"))
        else:
            form = UserCreationForm()
            context = {"form": form}
            return render(request, "login/login.html", context)

    else:
        user = authenticate(
            request,
            username=request.POST.get("username"),
            password=request.POST.get("password1"),
        )
        try:
            login(request, user)
            return redirect(reverse("musicplay:home"))
        except:
            form = UserCreationForm()
            context = {
                "form": form,
                "error": "Username or Password is incorrect. Please try again.",
            }
            return render(request, "login/login.html", context)


# @_known_user_check
@login_required
def main_action(request):
    try:
        google_auth = request.user.social_auth.get(provider="google-oauth2")
        request.session["picture"] = google_auth.extra_data.get("picture", "")
    except:
        user_profile_img = get_object_or_404(UserProfile, user=request.user).avatar.url
        request.session["picture"] = user_profile_img

    user = request.user

    favorite_playlist, created_fav = Playlist.objects.get_or_create(
        user=user,
        is_favorites=True,
        defaults={
            "name": "My Favorites",
            "description": "Your favorite musics.",
        },
    )

    recent_playlist, created_rec = Playlist.objects.get_or_create(
        user=user,
        is_recent=True,
        defaults={
            "name": "Recent",
            "description": "Recently played musics.",
        },
    )

    request.session["title"] = "Main Page"
    query = request.GET.get("q", "")
    songs = Music.objects.filter(name__icontains=query).order_by("-upload_time")
    # all_music = Music.objects.all().order_by("-upload_time")
    return render(
        request,
        "musicplay/main-page.html",
        {
            "message": "Welcome to MelodyHub",
            "songs": songs,
            "favorite_playlist": favorite_playlist,
            "recent_playlist": recent_playlist,
            'user_id': request.user.id, # added for AJAX
        },
    )


@login_required
def my_profile(request):
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    musics = Music.objects.filter(user=request.user).order_by("-upload_time")
    request.session["title"] = "My Profile"

    if request.method == "POST":
        profile_form = ProfileForm(request.POST, request.FILES, instance=user_profile)
        if profile_form.is_valid():
            profile_form.save()
            profile_form = ProfileForm(instance=user_profile)

        music = Music(user=request.user, upload_time=timezone.now())
        music_upload_form = MusicUploadForm(request.POST, request.FILES, instance=music)
        if music_upload_form.is_valid():
            music_upload_form.save()
            music_file = request.FILES.get("file")
            audio = MP3(music_file)
            music.length = int(audio.info.length)
            music.save()
            music_upload_form = MusicUploadForm()
    else:
        profile_form = ProfileForm(instance=user_profile)
        music_upload_form = MusicUploadForm()

    return render(
        request,
        "musicplay/my-profile.html",
        {
            "user_profile": user_profile,
            "musics": musics,
            "music_upload_form": music_upload_form,
            "profile_form": profile_form,
        },
    )


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
    request.session["title"] = "Playlist"
    return render(
        request,
        "musicplay/playlist_detail.html",
        {
            "playlist": playlist,
            "musics": musics,
        },
    )


@login_required
def listen_together(request):
    request.session["title"] = "ListenTogether"
    myListenTogetherRooms = ListenTogetherRoom.objects.filter(creator=request.user)
    hasRoom = len(myListenTogetherRooms) >= 1
    everyRoom = ListenTogetherRoom.objects.all()
    if request.method == "POST":
        form = CreateRoomForm(request.POST)
        if form.is_valid():
            random_data = os.urandom(16)
            hash_object = hashlib.sha256()
            hash_object.update(random_data)
            hash = hash_object.hexdigest()

            link = hash[:16]

            newRoom = ListenTogetherRoom(
                name=form.cleaned_data["name"], room_id=link, creator=request.user
            )
            newRoom.save()
            return redirect(reverse("musicplay:inside_room", args=[link]))

    context = {
        "form": CreateRoomForm(),
        "hasRoom": hasRoom,
        "rooms": myListenTogetherRooms,
        "allRooms": everyRoom,
    }
    return render(request, "ListenTogether/create.html", context)


@login_required
def inside_room(request, token):
    context = {}
    thisRoom = get_object_or_404(ListenTogetherRoom, room_id=token)
    context = {'room': thisRoom, 'user': request.user}
    context['isHost'] = (thisRoom.creator.id == request.user.id)
    response = render(request, 'ListenTogether/listen.html', context)
    # response['Accept-Ranges'] = 'bytes'
    return response

@login_required
def rooms_json(request):
    rooms = ListenTogetherRoom.objects.all().values('room_id', 'name')
    return JsonResponse(list(rooms), safe=False)

@login_required
def lt_search(request):
    query = request.GET.get("q", "")
    music_tracks = Music.objects.filter(name__icontains=query).order_by("-upload_time")
    data = [{
        'user_id': track.user.id,
        'id': track.id,
        'name': track.name,
        'image_url': track.image.url if track.image else None,  # Ensure image is handled correctly
        'singer': track.singer,
        'file_url': track.file.url,
        'upload_time': track.upload_time,
        'length': track.length
    } for track in music_tracks]
    # data = list(songs.values('name', 'singer', 'image', 'file', 'upload_time', 'length')) 
    return JsonResponse(data, safe=False)
