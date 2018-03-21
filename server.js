var express = require('express');
var app = express();
var server = require('http').Server(app);
var session = require('express-session')
var bodyParser = require("body-parser")
var Models = require("./models")
var mongoose = require('mongoose');

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

app.set('trust proxy', 1) // trust first proxy

var MongoStore = require('connect-mongo')(session);
var sessionStore = new MongoStore({
	mongooseConnection: mongoose.connection,
	transformId (sessionId) {
                const splits = sessionId && sessionId.split(":")
		if (splits[1]) {
			return  splits[1].split(".")[0]
		}
		return sessionId
	}
})

session = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: sessionStore 
})

app.use(session)

var PORT = 80

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/logout", (req, res) => {
	req.session.destroy()
	res.redirect("/")
})

app.post("/login", (req, res) => {
   if (req.session.user) {
      return res.redirect("/drawing2")
   }
   var username = (req.body.username || "").trim()
   var password = (req.body.password || "").trim()
   if (!username || !password) {
	res.status(400).end("Empty username or password")
	return
   }

   // Query the database by username and password
   Models.User.findOne({ username, password }).then(user => {

	// Username and password were correct
        if (user) {
		// Start the session
		req.session.user = user.toJSON()	
		res.redirect("/drawing2")
	} else {
		// The username/password pair is not correct
		res.status(403).end("Invalid credentials.")
	}
   }).catch(err => {
	// This is an error which we cannot control (e.g. connection error)
        // => Internal Server Error
	res.status(500).end("There was an error.") 
   })
})

// Routing
app.use("/login", (req, res, next) => {
   if (req.session.user) {
      return res.redirect("/drawing2")
   }
   next()
}, express.static(`${__dirname}/public/login.html`))


// Public HTMl
app.use(express.static(`${__dirname}/public`))

// Serve the literallycanvas resources
app.use("/literallycanvas/", express.static(`${__dirname}/node_modules/literallycanvas/lib`))

// Drawing canvas
app.use("/drawing2", function (req, res, next) {
	if (!req.session.user) {
	   return res.redirect("/login")
        }
	next()
}, express.static(`${__dirname}/public/drawing.html`))

// Start the server
server.listen(PORT, function(){
    console.log('listening on port :' + PORT);
})

var allShapes = []

// Listen for websocket connections
var io = require('socket.io')(server);
io.on('connection', function (socket, next) {
  var cookies = parseCookies(socket.request)
  var connect_sid = cookies['connect.sid'];
  if (connect_sid) {
     connect_sid = decodeURIComponent(connect_sid)
    sessionStore.get(connect_sid, function (error, session) {
	if (error) { return next(error) }
	socket.handshake.session = session
	if (session && session.user) {
		  var userInfo = {
                      username: session.user.username
		  }
		  socket.broadcast.emit('user_joined', userInfo);
		  // When the client wants to get all the shapes, emit one by one the shapes by trigger the save Shape (which will draw the shape on the canvas)
		  socket.on("get_shapes", function (data) {
                        allShapes.forEach(c => socket.emit('saveShape', c))
		  })
		  socket.on("shapeSave", function (data) {
			socket.broadcast.emit('saveShape', data, userInfo);

			// Push the current shape in the shapes array and save
			allShapes.push(data)
		  })
		  socket.on("canvas_clear", function () {
			socket.broadcast.emit('canvas_clear', userInfo);
			// Clear the data in the database
			allShapes = []
		  })
        }
    });
  }
});
      
