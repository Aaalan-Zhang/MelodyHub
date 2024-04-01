const syncScheme = window.location.protocol === "https:" ? "wss" : "ws";
const syncSocket = new WebSocket(`${syncScheme}://${window.location.host}/ws${window.location.pathname}`);


document.addEventListener('DOMContentLoaded', () => {
    const musicBar = document.getElementById('music-bar');
    const isHost = musicBar.getAttribute('isHost');

    if (isHost) {
        processHostSync();
    }
});

function processHostSync() {
    console.log('Host is connected');
    const musicBar = document.getElementById('music-bar');

    const sendEvent = (type, content) => {
        syncSocket.send(JSON.stringify({ 'msg_type': type, 'msg_content': content }));
    };

    ['playing', 'pause', 'volumechange'].forEach(event => {
        musicBar.addEventListener(event, () => {
            let content;
            switch (event) {
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
        if (data.msg_type === 'sync_request_from_participant') {
            sendEvent('sync_response_from_host', {
                'volume': musicBar.volume,
                'is_paused': musicBar.paused,
                'cur_time': musicBar.currentTime,
                'cur_src': musicBar.getAttribute('src')
            });
        }
    };
}

function startListening(element) {
        if (element.innerHTML === "Start Listening") {
            processParticipantSync(syncSocket);
            document.getElementById('music-bar').muted = false;
            element.innerHTML = "Stop Listening";
        } else if (element.innerHTML === "Stop Listening") {
            document.getElementById('music-bar').pause()
            element.innerHTML = "Start Listening"; 
        }
}


function processParticipantSync() {
    syncSocket.onopen = function() {
        console.log('Participant is connected');
        syncSocket.send(JSON.stringify({ 'msg_type': 'sync_request_from_participant', 'msg_content': ''}));
    };

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
                console.log(msg_content);
                console.log(cur_time);
                musicBar.setAttribute("src", cur_src);
                // musicBar.load();
                musicBar.currentTime = cur_time;
                musicBar.volume = volume;
                musicBar.play();
                if (is_paused) musicBar.pause();
                break;
        }
    };
}
