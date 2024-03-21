from django import forms
from .models import Music, UserProfile

class ProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'description']


class MusicUploadForm(forms.ModelForm):
    class Meta:
        model = Music
        fields = ['name', 'image', 'description', 'file', 'length']