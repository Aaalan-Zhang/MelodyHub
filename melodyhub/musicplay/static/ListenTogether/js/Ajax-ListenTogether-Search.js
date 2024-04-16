
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


$(document).ready(function() {
    let audio = document.getElementById('music-bar');
    let isHost = audio.getAttribute('isHost');
    $("#search-input").keyup(function() {
        var query = $(this).val();
        if (query.length >= 1) {  // Trigger search for at least 3 characters
            $.ajax({
                url: '/lt-search/',
                data: {
                    'q': query
                },
                dataType: 'json',
                success: function(data) {
                    $('#search-results').empty();
                    data.forEach(function(song) {
                        var musicCard = $('<div>', { 'class': 'music-card' });
                        musicCard.append($('<img>', { 'src': song.image_url, 'alt': 'Music image' }));
                        var musicInfo = $('<div>', { 'class': 'music-info' });
                        var musicDetails = $('<span>', { 'class': 'music-details' });
                        musicDetails.append($('<div>', { 'class': 'music-title', 'text': song.name }));
                        musicDetails.append($('<div>', { 'class': 'music-artist', 'text': song.singer }));
                        musicInfo.append(musicDetails);
                        musicInfo.append($('<button>', { 'class': 'btn btn-dark', 'id': 'fav-btn', 'data-user-id': song.user_id, 'data-music-id': song.id, 'text': 'Like' }));
                        if (isHost === 'True') {
                            musicInfo.append('<span> </span>')
                            musicInfo.append($('<button>', { 'class': "btn btn-dark", 'id': 'play-btn', 'data-src': song.file_url, 'text': 'Play' }));
                        }
                        musicCard.append(musicInfo);
                        // console.log(document.querySelectorAll('#play-btn')[0].data-src);
                        $('#search-results').append(musicCard);

                        var playButtons = document.querySelectorAll('#play-btn');
                        var favButtons = document.querySelectorAll('#fav-btn');

                        playButtons.forEach(btn => {
                            // console.log('play button');
                            btn.addEventListener("click", function(event) {
                                var newSrc = btn.getAttribute('data-src');
                                // console.log(newSrc);
                                $('#music-bar').attr('src', newSrc);
                                $('#music-bar')[0].load();
                                // document.getElementById('music-info').innerHTML = `Now Streaming: ${song.name}`;
                                $('#music-bar')[0].play();
                            });
                        });
                        favButtons.forEach(favBtn => {
                            const userId = favBtn.dataset.userId;
                            const musicId = favBtn.dataset.musicId;
                        
                            fetchFavoriteStatus(userId, musicId)
                                .then(data => updateButton(favBtn, data))
                                .catch(error => console.error(error));
                        
                                favBtn.addEventListener('click', () => toggleFavorite(favBtn, userId, musicId));
                        });
                    });
                    if (data.length === 0) {
                        $('#search-results').append("No Search Results Found.");
                    }
                }
            });
        } else {
            $('#search-results').empty();
        }
    });
});
