
async function fetchFavoriteStatus(userId, musicId) {
    console.log(userId, musicId)
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
                        musicInfo.append('<span> </span>')
                        musicInfo.append($('<button>', { 'class': "btn btn-dark", 'data-src': song.file_url, 'text': 'Play' }));
                        musicCard.append(musicInfo);
                        $('#search-results').append(musicCard);

                        var favButtons = document.querySelectorAll('#fav-btn');
                        
                        favButtons.forEach(btn => {
                            const userId = btn.dataset.userId;
                            const musicId = btn.dataset.musicId;
                        
                            // Fetch favorite status and update button appearance
                            fetchFavoriteStatus(userId, musicId)
                                .then(data => updateButton(btn, data))
                                .catch(error => console.error(error));
                        
                            // Toggle favorite status on button click
                            btn.addEventListener('click', () => toggleFavorite(btn, userId, musicId));
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
