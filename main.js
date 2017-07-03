const socket = io('https://streamwebrtc.herokuapp.com/');
$('#div_chat').hide();
socket.on('LIST_USER', arrUser => {
    $('#div_chat').show();
    $('#div_register').hide();
    arrUser.forEach(e => {
        const { ten, peerId } = e;
        $('#listUser').append(`<li id="${peerId}">${ten}</li>`)
    }, this);
    socket.on('NEW_USER', user => {
        const { ten, peerId } = user;
        $('#listUser').append(`<li id="${peerId}">${ten}</li>`)
    });
    socket.on('USER_DISCONNECT', peerId => {
        $(`#${peerId}`).remove();
    })
})
socket.on('REGISTER_FAILED', () => {
    alert('Vui long chon user khac');
});
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}
function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
// openStream().then(stream => playStream('localStream', stream));

var peer = new Peer({ key: 'peerjs', host: 'peerwebrtc.herokuapp.com', secure: true, port: 443 });
peer.on('open', id => {
    $('#mypeer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit("USER_REGISTER", { ten: username, peerId: id });
    })
});

$('#btnCall').click(() => {
    const id = $('#remoteID').val();
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
});

peer.on('call', call => {
    openStream().then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream))
    })
})

$('#listUser').on('click', 'li', function () {
    console.log($(this).attr('id'));
    const id = $(this).attr('id');
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
});