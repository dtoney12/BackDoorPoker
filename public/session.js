
var session = {
	init: function() {
		return function() {
			$(document).ready(function() {
				var HOST = location.origin.replace(/^http/, 'ws')
				var ws = new WebSocket(HOST);
				var el = document.getElementById('server-time');
				var pokerObj = {};
			    var submitButton = function(eventX, type, bool) {
			    	eventX.preventDefault();
			    	pokerObj[type] = document.getElementById(type).value || bool;
			    	pokerObj.update = type;
					ws.send( JSON.stringify(pokerObj) );
			    }

				ws.onmessage = function (msg) {
					pokerObj = JSON.parse(msg.data);
					el.innerHTML = 'Server time: ' + pokerObj.time;
					window.setTableState(pokerObj);
				};

				$('#nameButton').submit(function(event) {
					submitButton(event, 'name');
				});
				$('#passwordButton').submit(function(event) {
					submitButton(event, 'password');
				});
				$('#messageButton').submit(function(event) {
					submitButton(event, 'message');
				});
				$('#getCashButton').submit(function(event) {
					submitButton(event, 'getCash', true);
				});
				$('#logOutButton').submit(function(event) {
					submitButton(event, 'logOut');
				});
				$('#joinTableButton').submit(function(event) {
					submitButton(event, 'joinTable', true);
				});
				$('#turnButton').submit(function(event) {
					submitButton(event, 'turnButton', true);
				});
				$('#rejoinWaitTimerButton').submit(function(event) {
					submitButton(event, 'rejoinWaitTimer');
				});

			});
		};
	}
};

session.init()();
