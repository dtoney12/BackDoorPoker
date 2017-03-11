
var session = {
	init: function() {
		return function() {
			$(document).ready(function() {
				var HOST = location.origin.replace(/^http/, 'ws')
				var ws = new WebSocket(HOST);
				var el = document.getElementById('server-time');
				var pokerObj = {
			      name: 'RandomPerson',
			      joinTable: 'false',
			      rejoinWaitTimer: 0,
			      sitOutNext: false,
			      quitYesOrNo: false,
			      turn: false,
			      token: null,
			      bootPlayer: false,
			      bootPlayerTimer: 0,
			      bet: 0,
			      newBet: 0,
			      message: ''
			    };
			    var pokerObj = window.pokerObj;

				ws.onmessage = function (msg) {
					pokerObj = JSON.parse(msg.data);
					console.log(pokerObj);
					el.innerHTML = 'Server time: ' + pokerObj.time;
					window.setTableState(pokerObj);
				};

				$('#send').submit(function(event) {
					event.preventDefault();
					pokerObj.message = $('#message').val();
					console.log(pokerObj.message);
					ws.send(pokerObj.message);
				});

			});
		};
	}
};

session.init()();
