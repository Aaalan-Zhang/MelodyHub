const syncScheme = window.location.protocol === "https:" ? "wss" : "ws";
const syncSocket = new WebSocket(`${syncScheme}://${window.location.host}/ws${window.location.pathname}`);


document.addEventListener('DOMContentLoaded', () => {
    let musicBar = document.getElementById('music-bar');
    let isHost = musicBar.getAttribute('isHost');

    if (isHost === 'True') {
        processHostSync();
        console.log('Host is connected');
    }
    else {
        musicBar.removeAttribute('controls');
        syncSocket.onopen = function() {
            console.log('Participant is connected');
            processParticipantSync(syncSocket);
            syncSocket.send(JSON.stringify(
                { 'msg_type' : 'sync_chat_request_from_participant', 'msg_content': ''}
            ));
        };
        // processParticipantSync(syncSocket);
    }
});

function processHostSync() {
    let musicBar = document.getElementById('music-bar');
    ['playing', 'pause', 'volumechange'].forEach(event => {
        musicBar.addEventListener(event, () => {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_music_response_from_host', 
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
        if (response.msg_type === 'sync_music_request_from_participant') {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_music_response_from_host', 
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
        else if (response.msg_type === 'sync_chat_request_from_participant') {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_chat_response_from_host', 
                  'msg_content': 
                    {
                        'chat': document.getElementById('chat-box').innerHTML,
                    }
                }
            ));
        }
    };
}

function startListening(element) {
        if (element.innerHTML === "Start Listening") {
            // processParticipantSync(syncSocket);
            syncSocket.send(JSON.stringify(
                { 'msg_type' : 'sync_music_request_from_participant', 'msg_content': ''}
            ));
            // document.getElementById('music-bar').muted = false;
            element.innerHTML = "Stop Listening";
        } else if (element.innerHTML === "Stop Listening") {
            document.getElementById('music-bar').pause()
            element.innerHTML = "Start Listening"; 
        }
}

function processParticipantSync(syncSocket) {
	if (syncSocket.readyState === WebSocket.OPEN) {
		syncSocket.send(JSON.stringify(
			{ 'msg_type' : 'sync_music_request_from_participant', 'msg_content': ''}
        ));
		syncSocket.send(JSON.stringify(
			{ 'msg_type' : 'sync_chat_request_from_participant', 'msg_content': ''}
        ));
	}

    syncSocket.onmessage = (e) => {
        const { msg_type, msg_content } = JSON.parse(e.data);
        let musicBar = document.getElementById('music-bar');

        switch (msg_type) {
            case 'sync_music_response_from_host':
                const { volume, is_paused, cur_time, cur_src } = msg_content;
                if (is_paused || document.getElementById('participantCtrl').innerHTML === "Start Listening") {
                    musicBar.pause();
                } else {
                    musicBar.setAttribute('src', cur_src);
                    musicBar.load();
                    if (musicBar.readyState >= 2) {
                        musicBar.currentTime = cur_time;
                    } else {
                        musicBar.addEventListener('loadedmetadata', () => {
                            musicBar.currentTime = cur_time;
                        }, { once: true });
                    }
                    musicBar.volume = volume;
                    musicBar.play();
                }
                break;
        }
    };
}
