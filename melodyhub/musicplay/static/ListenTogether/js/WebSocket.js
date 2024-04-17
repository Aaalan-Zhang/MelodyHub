const syncScheme = window.location.protocol === "https:" ? "wss" : "ws";
const syncSocket = new WebSocket(`${syncScheme}://${window.location.host}/ws${window.location.pathname}`);
var userName = "";

document.addEventListener('DOMContentLoaded', () => {
    userName = document.getElementById('user-name').value;
    let audio = document.getElementById('music-bar');
    let isHost = audio.getAttribute('isHost');

    if (isHost === 'True') {
        syncSocket.onopen = function() {
            console.log('Host is connected');
            syncSocket.send(JSON.stringify(
                { 'msg_type' : 'sync_chat_request', 'msg_content': `Host ${userName} has joined!` }
            ));
        }
        processHostSync();
        // syncSocket.onclose = function() {
        //     syncSocket.send(JSON.stringify(
        //         { 'msg_type' : 'sync_chat_request', 'msg_content': `Host ${userName} has left!` }
        //     ));
        // }
    }
    else {
        audio.removeAttribute('controls');
        syncSocket.onopen = function() {
            console.log('Participant is connected');
            syncSocket.send(JSON.stringify(
                { 'msg_type' : 'sync_chat_request', 'msg_content': `User ${userName} has joined!` }
            ));
            processParticipantSync(syncSocket);
        };
    }
});

function processHostSync() {
    let audio = document.getElementById('music-bar');
    ['playing', 'pause', 'volumechange', 'seeked'].forEach(event => {
        audio.addEventListener(event, () => {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_music_response_from_host', 
                  'msg_content': 
                    {
                        'volume': audio.volume,
                        'is_paused': audio.paused,
                        'cur_time': audio.currentTime,
                        'cur_src': audio.getAttribute('src'),
                        // 'cur_name': audio.getAttribute('cur-name'),
                    }
                }
            ));
        });
    });

    syncSocket.onmessage = function(event) {
        // callback function, register a event listener
        // will keep listening even if the processHostSync function has finished execution
        let response = JSON.parse(event.data);
        if (response.msg_type === 'sync_music_request_from_participant') {
            syncSocket.send(JSON.stringify(
                { 'msg_type': 'sync_music_response_from_host', 
                  'msg_content': 
                    {
                        'volume': audio.volume,
                        'is_paused': audio.paused,
                        'cur_time': audio.currentTime,
                        'cur_src': audio.getAttribute('src'),
                        // 'cur_name': audio.getAttribute('cur-name'),
                    }
                }
            ));
        }
        else if (response.msg_type === 'sync_chat_request') {
            let message = response.msg_content;
            // if (message.includes("joined")) {
            document.getElementById('chats').innerHTML += (message + "<br>");
            // } else {
                // document.getElementById('chats').innerHTML += (message + "<br>");
            // }
        }
        else if (response.msg_type === 'active_connections') {
            document.getElementById('active-users').innerHTML = response.msg_content;
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

function sendMessage(element) {
    let message = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = "";
    syncSocket.send(JSON.stringify(
        { 'msg_type' : 'sync_chat_request', 'msg_content': `${userName}: ` + message}
    ));

}

function processParticipantSync(syncSocket) {
	if (syncSocket.readyState === WebSocket.OPEN) {
		syncSocket.send(JSON.stringify(
			{ 'msg_type' : 'sync_music_request_from_participant', 'msg_content': ''}
        ));
	}

    syncSocket.onmessage = (e) => {
        const { msg_type, msg_content } = JSON.parse(e.data);
        var audio = document.getElementById('music-bar');
        let cur_playing_source = audio.getAttribute('src');
        let cur_playing_name = audio.getAttribute('cur-name');

        switch (msg_type) {
            case 'sync_music_response_from_host':
                const { volume, is_paused, cur_time, cur_src, cur_name } = msg_content;
                if (is_paused || document.getElementById('participantCtrl').innerHTML === "Start Listening") {
                    audio.muted = true;
                    audio.pause();
                } else {          
                    if (cur_playing_source !== cur_src) {
                        console.log('changing source');
                        audio.setAttribute('src', cur_src);
                        // document.getElementById('music-info').innerHTML = `Now Streaming: ${cur_name}`;
                        audio.load();
                        audio.play();
                        audio.pause();
                        // wait for 1 or 2 seconds to let the audio load
                        // display a message
                        audio.muted = false;
                        audio.volume = volume;
                        audio.currentTime = cur_time;
                        audio.play();    
                    } else {
                        audio.play();
                        audio.pause();
                        audio.muted = false;
                        audio.volume = volume;
                        audio.currentTime = cur_time;
                        audio.play();    
                    }
                }
                break;
            case 'sync_chat_request':
                // if (msg_content.includes("joined")) {
                document.getElementById('chats').innerHTML += (msg_content + "<br>");
                // } else {
                //     document.getElementById('chats').innerHTML += (`${userName}: ` + msg_content + "<br>");
                // }
                break;
            case 'active_connections':
                document.getElementById('active-users').innerHTML = msg_content;
                break;
        }
    };
}
