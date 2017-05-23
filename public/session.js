document.addEventListener("DOMContentLoaded", (e)=> { 
	// const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  const ws = new WebSocket('wss://backdoorpoker-dev.us-west-1.elasticbeanstalk.com');
  // const ws = new WebSocket('ws://127.0.0.1');
  window.ws = ws;
  const wsSend = function(event, type, booleanValue) {
  	event.preventDefault();
  	ws.send( JSON.stringify({ [type]: document.getElementById(type).value || booleanValue }) );
  }

  let wsCreateListener = (pokerSetState)=> {
      let logNumber = 0;
      return listener = (update)=> {
          update = JSON.parse(update.data);
          console.log(`update(${logNumber++}): `,update);
          (pokerSetState) && pokerSetState(update);
          if ('joinTableInvite' in update) {
            let loadPokerScript = document.createElement('script');
            loadPokerScript.setAttribute('type', 'text/javascript');
            loadPokerScript.setAttribute('src', 'bundle.js');
            document.getElementById('room').appendChild(loadPokerScript);
            document.getElementById('forms-container').remove(document.getElementById('forms'));
          }
      };
  }; 
  window.wsCreateListener = wsCreateListener;
  ws.onmessage = wsCreateListener();
  ws.onopen = ()=>console.log("Opening a connection...");
  ws.onerror = (error)=>console.log("Connection error = ", error);
  ws.onclose = ()=>console.log("Connection closed...");

  // fast login
  setTimeout(()=>ws.send(JSON.stringify({editName: 'dts', password: '123'})), 3800);
  // setTimeout(()=>ws.send(JSON.stringify({getCash: true})), 2000);
  // setTimeout(()=>ws.send(JSON.stringify({getTableCash: 300})), 2200);
  // setTimeout(()=>ws.send(JSON.stringify({joinTable: true})), 2400);

	document.getElementById('nameButton').submit((event)=>wsSend(event, 'editName'));
	document.getElementById('passwordButton').submit((event)=>wsSend(event, 'password'));
	document.getElementById('messageButton').submit((event)=>wsSend(event, 'message'));
	document.getElementById('getCashButton').submit((event)=>wsSend(event, 'getCash', true));
	document.getElementById('getTableCashButton').submit((event)=>wsSend(event, 'getTableCash', true));
	document.getElementById('joinTableButton').submit((event)=>wsSend(event, 'joinTable', true));
	document.getElementById('logoutButton').submit((event)=>wsSend(event, 'logout', true));
});


            