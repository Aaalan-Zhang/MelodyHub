document.querySelectorAll('.play-btn').forEach(function (button) {
    button.addEventListener('click', function () {
        var audioPlayer = document.getElementById('audio-player');
        var currentSong = document.getElementById('currentSong');
        var playStatusBar = document.getElementById('play-status-bar');
        var playPauseButton = document.querySelector('.play');
        audioPlayer.src = this.dataset.src;
        currentSong.textContent = this.parentElement.querySelector('.music-title').textContent + ' - ' + this.parentElement.querySelector('.music-artist').textContent;
        audioPlayer.play();
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
        playStatusBar.style.display = 'block';
    });
});