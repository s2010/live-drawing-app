# live-drawing-app
live drawing canvas application for more than one participants, Every action is broadcasted to all participants in real-time using websocket 

Here are the technologies used :

- websocket for communication. 
- Literally Canvas as HTML5 drawing widget.
- Server side : Node.js
- MongoDB for storage 

## Needed packages

- socket.io for realtime broadcasting
   `$ npm install socket.io`
   
- HTML5 drawing widget
   `$ npm i -S literallycanvas`
   
- MongoDB object modeling tool
   `$ npm i -S mongoose`
   
- allowing it to automatically start on boot for node.js server
   `$ npm i -g forever`
   
-   Node.js body parsing middleware
   `$ npm i -S body-parser`
   
- MongoDB Session Storage for ExpressJS
   `$ npm i -S express-session`
   
- MongoDB session store for Connect
   `$ npm i -S connect-mongo`
   
- Express is a minimal and flexible Node.js web application framework
   `$ npm install express --save`
   
## Try the live demo
   http://bashayer.hijji.info/login
