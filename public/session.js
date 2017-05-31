document.addEventListener("DOMContentLoaded", (e)=> { 
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  // const ws = new WebSocket('ws://backdoorpoker-dev.us-west-1.elasticbeanstalk.com');
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
          if ('clientReceived' in update) {
            console.log('GOT UPDATE!!!!');
          }
          // console.log(`update(${logNumber++}): `,update);
          (pokerSetState) && pokerSetState(update);
      };
  }; 

  window.wsCreateListener = wsCreateListener;
  ws.onmessage = wsCreateListener();
  ws.onopen = ()=>console.log("Opening a connection...");
  ws.onerror = (error)=>console.log("Connection error = ", error);
  ws.onclose = ()=>console.log("Connection closed...");

  let loadPokerScript = document.createElement('script');
  loadPokerScript.setAttribute('type', 'text/javascript');
  loadPokerScript.setAttribute('src', 'bundle.js');
  document.getElementById('room').appendChild(loadPokerScript);
});
