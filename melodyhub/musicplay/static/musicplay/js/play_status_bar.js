var audioPlayer = document.getElementById('audio-player');
var playPauseButton = document.getElementById('play-pause-button');
var progressBar = document.getElementById('progress-bar');
var currentTimeDisplay = document.getElementById('current-time');
var totalTimeDisplay = document.getElementById('total-time');
var volumeControl = document.getElementById('volume-control');

volumeControl.addEventListener('input', function () {
    audioPlayer.volume = volumeControl.value;
});

// Update the progress bar and time display every time the audio time updates
audioPlayer.addEventListener('timeupdate', function () {
    var progress = audioPlayer.currentTime / audioPlayer.duration * 100;
    progressBar.value = progress;

    var currentTime = formatTime(audioPlayer.currentTime);
    var totalTime = formatTime(audioPlayer.duration);
    currentTimeDisplay.textContent = currentTime;
    totalTimeDisplay.textContent = totalTime;
});

// Seek when the progress bar is dragged
progressBar.addEventListener('input', function () {
    var time = progressBar.value / 100 * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

// Format time in seconds to MM:SS
function formatTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    if (seconds < 10) seconds = '0' + seconds;
    return minutes + ':' + seconds;
}

playPauseButton.addEventListener('click', function () {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.classList.remove('play');
        playPauseButton.classList.add('pause');
    } else {
        audioPlayer.pause();
        playPauseButton.classList.remove('pause');
        playPauseButton.classList.add('play');
    }
});
progressBar.value = 0;
volumeControl.value = 1;
