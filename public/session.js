$(document).ready(function() {
	let HOST = location.origin.replace(/^http/, 'ws')
	const ws = new WebSocket(HOST);
    window.ws = ws;
    const wsSend = function(eventX, type, bool) {
    	eventX && eventX.preventDefault();
    	let sendObj = {};
    	sendObj[type] = document.getElementById(type).value || bool;
    	ws.send( JSON.stringify(sendObj) );
    }

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
    window.wsListenerFunctionCreate = wsListenerFunctionCreate;
    ws.onmessage = wsListenerFunctionCreate();

    // fast login
    setTimeout(()=>ws.send(JSON.stringify({editName: 'dts', password: '123'})), 200);
    setTimeout(()=>ws.send(JSON.stringify({getCash: true})), 400);
    setTimeout(()=>ws.send(JSON.stringify({getTableCash: 300})), 600);
    setTimeout(()=>ws.send(JSON.stringify({joinTable: true})), 800);

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


            