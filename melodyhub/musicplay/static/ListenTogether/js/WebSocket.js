const syncScheme = window.location.protocol === "https:" ? "wss" : "ws";
const syncSocket = new WebSocket(`${syncScheme}://${window.location.host}/ws${window.location.pathname}`);

document.addEventListener('DOMContentLoaded', () => {
    const musicBar = document.getElementById('music-bar');
    const isHost = musicBar.getAttribute('data-isHost') === "True";

    if (isHost) {
        processHostSync();
    }
});

function processHostSync() {
    const musicBar = document.getElementById('music-bar');

    const sendEvent = (type, content) => {
        syncSocket.send(JSON.stringify({ 'msg_type': type, 'msg_content': content }));
    };

    console.log('Host is connected');

    ['seeked', 'loadstart', 'pause', 'playing', 'volumechange'].forEach(event => {
        musicBar.addEventListener(event, () => {
            let content = '';
            switch (event) {
                case 'seeked':
                    content = musicBar.currentTime;
                    break;
                case 'loadstart':
                    content = musicBar.getAttribute('src');
                    break;
                case 'pause':
                case 'playing':
                    content = event;
                    break;
                case 'volumechange':
                    content = musicBar.volume;
                    break;
            }
            sendEvent(event, content);
        });
    });

    syncSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.msg_type === 'sync_all_request') {
            sendEvent('sync_all_response', {
                'volume': musicBar.volume,
                'is_paused': musicBar.paused,
                'cur_time': musicBar.currentTime,
                'cur_src': musicBar.getAttribute('src')
            });
        }
    };
}

function start_playing(cur) {
    // Accessing the data-isHost attribute value
    var isHost = document.getElementById('music-bar').getAttribute('data-isHost');

    if (isHost === "False") {
        // Checking the current innerHTML of the passed element and updating it accordingly
        if (cur.innerHTML === "Start Listening") {
            processParticipantSync(); // Assuming process_participant_sync is defined elsewhere
            document.getElementById('music-bar').muted = false; // Unmuting the music-bar
            cur.innerHTML = "Stop Listening"; // Updating the button text to "Stop"
        } else if (cur.innerHTML === "Stop Listening") {
            document.getElementById('music-bar').muted = true; // Muting the music-bar
            cur.innerHTML = "Start Listening"; // Updating the button text to "Start"
        }
    }
}


function processParticipantSync() {
    syncSocket.onopen = function() {
        console.log('Participant is connected');
        syncSocket.send(JSON.stringify({ 'msg_type': 'sync_all_request', 'msg_content': 'None' }));
    };

	if (syncSocket.readyState === WebSocket.OPEN) {
		syncSocket.send(JSON.stringify(
			{ 'msg_type' : 'sync_all_request', 'msg_content': 'None' }));
	}

    syncSocket.onmessage = (e) => {
        const { msg_type, msg_content } = JSON.parse(e.data);
        console.log(msg_type);
        const musicBar = document.getElementById('music-bar');

        switch (msg_type) {
            case 'loadstart_src':
                musicBar.setAttribute("src", msg_content);
                musicBar.load();
                musicBar.play();
                break;
            case 'seeked_time':
                musicBar.currentTime = msg_content;
                break;
            case 'play_status':
                msg_content === 'play' ? musicBar.play() : musicBar.pause();
                break;
            case 'volume_change':
                musicBar.volume = msg_content;
                break;
            case 'sync_all_response':
                const { volume, is_paused, cur_time, cur_src } = msg_content;
                console.log(msg_content);
                console.log(cur_time);
                // musicBar.setAttribute("src", cur_src);
                // musicBar.load();
                musicBar.currentTime = cur_time;
                musicBar.volume = volume;
                musicBar.play();
                if (is_paused) musicBar.pause();
                break;
            case 'close_studio':
                if (syncSocket.readyState === WebSocket.OPEN) {
                    musicBar.pause();
                    musicBar.muted = true;
                    const startBtn = document.getElementById('start-btn');
                    startBtn.innerHTML = "The studio has been closed.";
                    startBtn.disabled = true;
                    syncSocket.close();
                }
                break;
        }
    };
}
