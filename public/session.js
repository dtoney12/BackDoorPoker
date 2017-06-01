document.addEventListener("DOMContentLoaded", (e)=> { 
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  window.ws = ws;
  const wsSend = function(event, type, booleanValue) {
    event.preventDefault();
    ws.send( JSON.stringify({ [type]: document.getElementById(type).value || booleanValue }) );
  }

  let wsCreateListener = (pokerSetState)=> {
      return listener = (update)=> {
          update = JSON.parse(update.data);
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
  loadPokerScript.setAttribute('src', 'script.js');
  document.getElementById('room').appendChild(loadPokerScript);
});
