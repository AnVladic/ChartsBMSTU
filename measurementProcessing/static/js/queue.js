/*var ws_protocol = 'ws://'
if (window.location.protocol == 'https:') {
    ws_protocol = 'wss://'
}


socket = new WebSocket(ws_protocol + window.location.host + '/group/' + 'myname' + '/')

socket.onopen = function(event) {
    console.log('open')
    socket.send(JSON.stringify({
        'type': 'putUserInLine',
        'text': 'hi',
    }))
}

socket.onmessage = function(event) {
    var data = JSON.parse(event.data)
    console.log(data)
}*/
