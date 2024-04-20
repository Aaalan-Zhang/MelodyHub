from django import forms
from musicplay.models import Music, UserProfile, ListenTogetherRoom, User


class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["avatar", "description"]

    err_msg = {
        "invalid": "Upload a valid image.",
        "invalid_image": "Upload a valid image.",
    }

    avatar = forms.ImageField(
        label="",
        required=False,
        error_messages=err_msg,
        widget=forms.FileInput())

    description = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "placeholder": "Write something about yourself...",
                "rows": "2",
                "cols": "45",
                "style": "resize: none;"
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
                "style": "resize: none;"
            }
        ),
        required=False,
    )

    err_msg = {
        "invalid": "Upload a valid image.",
        "invalid_image": "Upload a valid image.",
    }

    image = forms.ImageField(
        required=False, error_messages=err_msg, widget=forms.FileInput()
    )

    def clean_file(self):
        file = self.cleaned_data.get("file")
        if not file.name.endswith((".mp3")):
            raise forms.ValidationError("Only mp3 is supported.")
        return file

    def clean_singer(self):
        singer = self.cleaned_data.get("singer")
        if not singer:
            singer = "Anonymous"
        return singer

    def clean_description(self):
        description = self.cleaned_data.get("description")
        if not description:
            description = "No description provided."
        return description


class CreateRoomForm(forms.ModelForm):
    class Meta:
        model = ListenTogetherRoom
        fields = ["name"]
