from django.http import HttpResponse
from django.shortcuts import redirect, render, resolve_url, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.utils import timezone

from melodyhub.settings import BASE_DIR, MUSICPLAY_USERS, MUSICPLAY_TITLE
from .models import UserProfile, Music

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
    return render(request, "musicplay/main-page.html", {"message": "Hello"})


@login_required
def my_profile(request):
    user_profile, created = UserProfile.objects.get_or_create(user=request.user)
    music = Music.objects.filter(user=request.user).order_by("-upload_time")

    return render(
        request, "musicplay/my-profile.html", {"user_profile": user_profile, "music": music}
    )

@login_required
def upload_music(request):
    pass