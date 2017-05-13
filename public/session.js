$(document).ready(function() {
	var HOST = location.origin.replace(/^http/, 'ws')
	var ws = new WebSocket(HOST);
    var wsSend = function(eventX, type, bool) {
    	eventX && eventX.preventDefault();
    	let sendObj = {};
    	sendObj[type] = document.getElementById(type).value || bool;
    	sendObj.username = window.username;
    	ws.send( JSON.stringify(sendObj) );
    }
    // $.getScript("bundle.js");
    let wsListenerFunctionCreate = function(setStateCallback) {
        let logNumber = 0;
        let listenerFunction = function (update) {
            update = JSON.parse(update.data);
            console.log(`update(${logNumber++}): `,update);
            if ('joinTableInvite' in update) {
                $.getScript("bundle.js", ()=>{
                    ws.onmessage = wsListenerFunctionCreate((update)=>{
                        window.setTableState(update);
                    });
                });
            }
            if (setStateCallback) setStateCallback(update);
        };
        return listenerFunction;
    }; 
    ws.onmessage = wsListenerFunctionCreate();
    window.ws = ws;
    window.wsListenerFunctionCreate = wsListenerFunctionCreate;


	$('#nameButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'editName');
	});
	$('#passwordButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'password');
	});
	$('#messageButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'message');
	});
	$('#getCashButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'getCash', true);
	});
	$('#getTableCashButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'getTableCash', true);
	});
	$('#joinTableButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'joinTable', true);

	});
	$('#logoutButton').submit(function(event) {
		event.preventDefault();
		wsSend(event, 'logout', true);
	});

});


            