const syncScheme = window.location.protocol === "https:" ? "wss" : "ws";
const syncSocket = new WebSocket(`${syncScheme}://${window.location.host}/ws${window.location.pathname}`);


document.addEventListener('DOMContentLoaded', () => {
    const musicBar = document.getElementById('music-bar');
    const isHost = musicBar.getAttribute('isHost');

    if (isHost === 'True') {
        processHostSync();
        console.log('Host is connected');
    }
    else {
        syncSocket.onopen = function() {
            console.log('Participant is connected');
        };
        // processParticipantSync(syncSocket);
    }
});

function processHostSync() {
    const musicBar = document.getElementById('music-bar');

    ['playing', 'pause', 'volumechange'].forEach(event => {
        musicBar.addEventListener(event, () => {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_response_from_host', 
                  'msg_content': 
                    {
                        'volume': musicBar.volume,
                        'is_paused': musicBar.paused,
                        'cur_time': musicBar.currentTime,
                        'cur_src': musicBar.getAttribute('src'),
                    }
                }
            ));
        });
    });

    syncSocket.onmessage = function(event) {
        let response = JSON.parse(event.data);
        if (response.msg_type === 'sync_request_from_participant') {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_response_from_host', 
                  'msg_content': 
                    {
                        'volume': musicBar.volume,
                        'is_paused': musicBar.paused,
                        'cur_time': musicBar.currentTime,
                        'cur_src': musicBar.getAttribute('src'),
                    }
                }
            ));
        }
    };
}

function startListening(element) {
        processParticipantSync(syncSocket);
        if (element.innerHTML === "Start Listening") {
            document.getElementById('music-bar').muted = false;
            element.innerHTML = "Stop Listening";
        } else if (element.innerHTML === "Stop Listening") {
            document.getElementById('music-bar').muted = true;
            document.getElementById('music-bar').pause()
            element.innerHTML = "Start Listening"; 
        }
}

function processParticipantSync(syncSocket) {
	if (syncSocket.readyState === WebSocket.OPEN) {
		syncSocket.send(JSON.stringify(
			{ 'msg_type' : 'sync_request_from_participant', 'msg_content': ''}));
	}

    syncSocket.onmessage = (e) => {
        const { msg_type, msg_content } = JSON.parse(e.data);
        const musicBar = document.getElementById('music-bar');

        switch (msg_type) {
            case 'sync_response_from_host':
                const { volume, is_paused, cur_time, cur_src } = msg_content;
                // musicBar.load();
                console.log(msg_content);
                console.log('message', cur_time);
                musicBar.setAttribute('src', cur_src);
                if (musicBar.readyState >= 2) {
                    musicBar.currentTime = cur_time;
                } else {
                    musicBar.addEventListener('loadedmetadata', () => {
                        musicBar.currentTime = cur_time;
                    }, { once: true });
                }
                musicBar.volume = volume;
                musicBar.play();
                console.log('playing', musicBar.currentTime);
                if (is_paused) musicBar.pause();
                break;
        }
    };
}
