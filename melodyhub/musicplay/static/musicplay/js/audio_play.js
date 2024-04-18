document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        var audioPlayer = document.getElementById('audio-player');
        var currentSong = document.getElementById('currentSong');
        var playStatusBar = document.getElementById('play-status-bar');
        var playPauseButton = document.querySelector('.play');
        var musicCover = document.getElementById('music-cover');
        audioPlayer.src = this.dataset.src;
        currentSong.textContent = this.parentElement.parentElement.querySelector('.music-title').textContent + ' - ' + this.parentElement.parentElement.querySelector('.music-artist').textContent;
        musicCover.src = this.dataset.cover;
        audioPlayer.play();
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
        playStatusBar.style.display = 'block';

        fetch('/update_played_musics/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: `user_id=${this.dataset.userId}&music_id=${this.dataset.musicId}`
        });
    });
});
