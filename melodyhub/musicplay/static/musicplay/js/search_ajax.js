
async function fetchFavoriteStatus(userId, musicId) {
    const response = await fetch(`/get_favorite_status/?user_id=${userId}&music_id=${musicId}`);
    if (!response.ok) throw new Error('Failed to fetch favorite status');
    return await response.json();
}

async function toggleFavorite(btn, userId, musicId) {
    const action = btn.classList.toggle('active') ? 'increment' : 'decrement';
    btn.style.backgroundColor = action === 'increment' ? 'red' : 'gray';

    const response = await fetch('/update_favorites/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: `user_id=${userId}&music_id=${musicId}&action=${action}`
    });

    if (!response.ok) throw new Error('Failed to update favorite status');
    return await response.json();
}

function updateButton(btn, data) {
    btn.style.backgroundColor = data.is_favorite ? 'red' : 'gray';
    btn.classList.toggle('active', data.is_favorite);
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}


$(document).ready(function () {
    $("#search-input").keyup(function () {
        var query = $(this).val();
        var url = query.length >= 1 ? '/lt-search/' : '/get-all-songs/';
        $.ajax({
            url: url,
            data: {
                'q': query
            },
            dataType: 'json',
            success: function (data) {
                $('#search-results').empty();
                data.forEach(function (song) {
                    var musicCard = $('<div>', { 'class': 'music-card' });
                    musicCard.append($('<img>', { 'src': song.image_url, 'alt': 'Music image' }));
                    var musicInfo = $('<div>', { 'class': 'music-info' });
                    var musicDetails = $('<span>', { 'class': 'music-details' });
                    musicDetails.append($('<a>', {
                        'class': 'music-title',
                        'text': song.name,
                        'href': '/music_detail/' + song.id,
                        'style': 'color: black;'
                    }));
                    musicDetails.append($('<div>', { 'class': 'music-artist', 'text': song.singer }));
                    musicInfo.append(musicDetails);
                    musicInfo.append($('<button>', { 'class': 'fav-btn', 'data-user-id': song.user_id, 'data-music-id': song.id, 'id': 'fav-btn', 'text': '🤍' }));
                    musicInfo.append($('<button>', { 'class': 'play-btn', 'data-user-id': song.user_id, 'data-src': song.file_url, 'data-music-id': song.id, 'data-cover': song.image_url, 'id': 'play-btn', 'text': '▶' }));
                    musicCard.append(musicInfo);
                    $('#search-results').append(musicCard);
                });

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
                        // playPauseButton.classList.remove('play');
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
                var favButtons = document.querySelectorAll('#fav-btn');
                favButtons.forEach(favBtn => {
                    const userId = favBtn.dataset.userId;
                    const musicId = favBtn.dataset.musicId;

                    fetchFavoriteStatus(userId, musicId)
                        .then(data => updateButton(favBtn, data))
                        .catch(error => console.error(error));

                    favBtn.addEventListener('click', () => toggleFavorite(favBtn, userId, musicId));
                });
                if (data.length === 0) {
                    $('#search-results').append("No Search Results Found.");
                }
            }
        });
    }).keyup();
});
