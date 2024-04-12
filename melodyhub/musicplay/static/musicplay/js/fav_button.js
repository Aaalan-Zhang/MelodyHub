const favButtons = document.querySelectorAll('.fav-btn');

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

async function fetchFavoriteStatus(userId, musicId) {
    const response = await fetch(`get_favorite_status/?user_id=${userId}&music_id=${musicId}`);
    if (!response.ok) throw new Error('Failed to fetch favorite status');
    return await response.json();
}

async function toggleFavorite(btn, userId, musicId) {
    const action = btn.classList.toggle('active') ? 'increment' : 'decrement';
    btn.style.backgroundColor = action === 'increment' ? 'red' : 'gray';

    const response = await fetch('update_favorites/', {
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
