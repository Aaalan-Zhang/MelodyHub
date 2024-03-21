from django import forms
from .models import Music, UserProfile
from mutagen.mp3 import MP3

class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'description']

    avatar = forms.FileField(label="Avatar", required=False)
    def clean_avatar(self):
        avatar = self.cleaned_data.get("avatar")
        if avatar:
            content_type = avatar.content_type
            if not content_type.startswith("image"):
                raise forms.ValidationError("Only image files are allowed.")
        return avatar

class MusicUploadForm(forms.ModelForm):
    class Meta:
        model = Music
        fields = ['name', 'image', 'description', 'file']

    def clean_file(self):
        file = self.cleaned_data.get('file')
        if not file.name.endswith(('.mp3', '.wav', '.ogg')):
            raise forms.ValidationError('Unsupported file type.')
        return file