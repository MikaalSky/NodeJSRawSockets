var ws = require("ws").Server;
var wss = new ws({port:3000});
var clients = [];
wss.on("connection", function(socket){
	console.log("connection");
	var pingBegin = Date.now();
	var lastPing = 0;
	clients.push(socket);
	var myIndex = clients.length-1;
	socket.on("message", function(message){
		if(message == 1){
			lastPing = Date.now() - pingBegin;
			socket.send(JSON.stringify({"header":"clientPing","body":lastPing}))
			return;
		}
		try{
			var data = JSON.parse(message);
			switch(data.header){
				case "tests":
					console.log(data.body);
				break;
				case "typing":
					for(var i in clients){
						if(i != myIndex){
							try{
							clients[i].send(JSON.stringify({"header":"typingReceive","body":data.body}))
							}catch(e){}
						}
					}
				break;
			}
		}catch(e){
			socket.send(JSON.stringify({"header":"error","body":"invalid json"}))
			console.warn(e);
		}
	})
	var pingInterval = setInterval(function() {
		socket.send(0);
		pingBegin = Date.now();
	},1000)
	socket.on("close", function(rc, desc){
		console.log("BEGIN DISCONNECT");
		console.log(rc);
		console.log(desc);
		console.log("END DISCONNECT")
		clearInterval(pingInterval);
		clients.splice(myIndex,1);
	})
	socket.on("error", function(error) {
		console.log(error);
	})
})
console.log("listening on 3000")