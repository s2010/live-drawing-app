var socket = io();

var messageClearTimeout = null
function log (message) {
	document.getElementById("log").textContent = message
	clearTimeout(messageClearTimeout)
	messageClearTimeout = setTimeout(function () {
		document.getElementById("log").textContent = ""
	}, 3000)
}


socket.on('user_joined', function (user) {
   log(user.username + " joined! Yay!")
})

socket.on('saveShape', function (shape, user) {
	shape = LC.JSONToShape(shape)
	canvas.saveShape(shape, false)
	if (user) {
		log(user.username + " is drawing")
	}
});

var clearing = false
socket.on('canvas_clear', function (shape, user) {
	clearing = true
	canvas.clear()
	log(user.username + " cleared the canvas")
});


var canvas = LC.init(document.getElementsByClassName('my-drawing')[0], {
	imageURLPrefix: '/literallycanvas/img',
	defaultStrokeWidth: 2,
	strokeWidths: [1, 2, 3, 5, 30],
	onInit: function () {
		socket.emit('get_shapes')
	}
});


canvas.on("shapeSave", function () {
	var data = canvas.getSnapshot().shapes.slice(-1)[0]
	socket.emit("shapeSave", data)
})

canvas.on("clear", function () {
	if (clearing) { 
	  clearing = false
	  return;
   	}
	socket.emit("canvas_clear")
})

