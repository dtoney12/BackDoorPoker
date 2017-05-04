
var session = {
	init: function() {
		return function() {
			$(document).ready(function() {
				var HOST = location.origin.replace(/^http/, 'ws')
				var ws = new WebSocket(HOST);
				var el = document.getElementById('server-time');
			    var submitButton = function(eventX, type, bool) {
			    	eventX.preventDefault();
			    	let sendObj = {};
			    	sendObj[type] = document.getElementById(type).value || bool;
			    	sendObj.username = window.username;
					ws.send( JSON.stringify(sendObj) );
			    }

				ws.onmessage = function (update) {
					update = JSON.parse(update.data);
					window.setTableState(update);

				};

				$('#nameButton').submit(function(event) {
					submitButton(event, 'editName');
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
				$('#getTableCashButton').submit(function(event) {
					submitButton(event, 'getTableCash', true);
				});
				$('#joinTableButton').submit(function(event) {
					submitButton(event, 'joinTable', true);
				});
				$('#foldButton').submit(function(event) {
					submitButton(event, 'fold', true);
				});
				$('#rejoinWaitTimerButton').submit(function(event) {
					submitButton(event, 'rejoinWaitTimer');
				});
				$('#leaveTableButton').submit(function(event) {
					submitButton(event, 'leaveTable', true);
				});
				$('#logoutButton').submit(function(event) {
					submitButton(event, 'logout', true);
				});

			});
		};
	}
};

session.init()();
