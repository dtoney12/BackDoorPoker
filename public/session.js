
var session = {
	init: function() {
		return function() {
			$(document).ready(function() {
				var HOST = location.origin.replace(/^http/, 'ws')
				var ws = new WebSocket(HOST);
				var el = document.getElementById('server-time');

				ws.onmessage = function (msg) {
					var pokerObj = JSON.parse(msg.data);
					console.log(pokerObj);
					el.innerHTML = 'Server time: ' + pokerObj.time;
					window.setPState(pokerObj);
				};

				$('#send').submit(function(event) {
					event.preventDefault();
					var text = $('#message').val();
					console.log(text);
					ws.send(text);
				});

			});
		};
	}
};

session.init()();
