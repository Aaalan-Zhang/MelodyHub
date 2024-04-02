from django.contrib.auth.models import User
from django.db import models
from django.utils.timezone import now


# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(
        upload_to="user_avatars/",
        blank=True,
        default="default_avatar/avatar.png",
    )
    description = models.TextField(
        blank=True
    )
    registration_time = models.DateTimeField(auto_now_add=True)
    total_favorites = models.IntegerField(default=0)
    total_not_favorites = models.IntegerField(default=0)


class Music(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="uploaded_music"
    )
    name = models.CharField(max_length=255)
    singer = models.CharField(max_length=255)
    image = models.ImageField(upload_to="music_images/", blank=True)
    description = models.TextField()
    file = models.FileField(upload_to="music_files/")
    upload_time = models.DateTimeField(auto_now_add=True)
    length = models.IntegerField(help_text="Length of the song in seconds", default=0)
    favorites_count = models.IntegerField(default=0)
    not_favorites_count = models.IntegerField(default=0)


class MusicComment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="music_comments"
    )
    music = models.ForeignKey(Music, on_delete=models.CASCADE, related_name="comments")
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class MusicFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_music")
    music = models.ForeignKey(Music, on_delete=models.CASCADE, related_name="likes")
    like = models.BooleanField(
        default=True
    )  # True for favorite, False for not favorite

    class Meta:
        unique_together = ("user", "music")


class Playlist(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    musics = models.ManyToManyField(Music, related_name="playlists")
    picture = models.ImageField(upload_to="playlist_pictures/", null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_favorites = models.BooleanField(default=False)  # To distinguish "My Favorites"
    is_recent = models.BooleanField(default=False)  # To distinguish "Recent" playlist


class ListenTogetherRoom(models.Model):
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="listen_together_rooms"
    )
    name = models.CharField(max_length=30, null=True, blank=True)
    current_music = models.ForeignKey(
        Music, on_delete=models.SET_NULL, null=True, blank=True
    )
    room_id = models.CharField(max_length=255, unique=True)
    participants = models.ManyToManyField(
        User, related_name="joined_listen_together_rooms"
    )
    created_at = models.DateTimeField(auto_now_add=True)


class EmailConfirmation(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    confirmation_token = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=now)

    def is_expired(self):
        return (now() - self.created_at).days > 1  # Example: 1 day to expire
