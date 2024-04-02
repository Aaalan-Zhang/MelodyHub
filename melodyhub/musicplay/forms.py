from django import forms
from musicplay.models import Music, UserProfile, ListenTogetherRoom, User
from mutagen.mp3 import MP3


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["avatar", "description"]

    avatar = forms.ImageField(label="", required=False, widget=forms.FileInput())

    description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "placeholder": "Write something about yourself...",
                "rows": "2",
                "cols": "45",
            }
        ),
        required=False,
    )


class MusicUploadForm(forms.ModelForm):
    class Meta:
        model = Music
        fields = ["name", "image", "singer", "description", "file"]

    description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "placeholder": "Write something about this music...",
                "rows": "3",
                "cols": "50",
            }
        ),
        required=False,
    )

    def clean_file(self):
        file = self.cleaned_data.get("file")
        if not file.name.endswith((".mp3", ".wav", ".ogg")):
            raise forms.ValidationError("Unsupported file type.")
        return file


class CreateRoomForm(forms.ModelForm):
    class Meta:
        model = ListenTogetherRoom
        fields = ["name"]
