document.querySelectorAll('.play-btn').forEach(function (button) {
    button.addEventListener('click', function () {
        var audioPlayer = document.getElementById('audio-player');
        var currentSong = document.getElementById('currentSong');
        audioPlayer.src = this.dataset.src;
        currentSong.textContent = this.parentElement.querySelector('.music-title').textContent + ' - ' + this.parentElement.querySelector('.music-artist').textContent;
        audioPlayer.play();
    });
});
