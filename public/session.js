document.addEventListener("DOMContentLoaded", function(e) { 
  const ws = new WebSocket(location.origin.replace(/^http/, 'ws'));
  window.ws = ws;
  let wsCreateListener = function(pokerSetState) {
      let logNumber = 0;
      return listener = function(update) {
          update = JSON.parse(update.data);
          (pokerSetState) && pokerSetState(update);
      };
  }; 

  window.wsCreateListener = wsCreateListener;
  ws.onmessage = wsCreateListener();
  ws.onopen = function() { console.log("Opening a connection...") };
  ws.onerror = function(error) { console.log("Connection error = ", error) };
  ws.onclose = function() { console.log("Connection closed...") };

  let loadPokerScript = document.createElement('script');
  loadPokerScript.setAttribute('type', 'text/javascript');
  loadPokerScript.setAttribute('src', 'bundle.js');
  document.getElementById('room').appendChild(loadPokerScript);
});
