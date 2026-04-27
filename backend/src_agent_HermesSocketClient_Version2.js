// src/agent/HermesSocketClient.js
export function connectHermes({url = 'ws://localhost:8000/ws', onStep} = {}){
  const socket = new WebSocket(url);

  socket.addEventListener('open', () => {
    console.log('[HermesSocket] connected to', url);
  });

  socket.addEventListener('message', (event) => {
    try{
      const step = JSON.parse(event.data);
      if (typeof onStep === 'function') onStep(step);
      // also expose globally for legacy code
      if (window.animationDirector && typeof window.animationDirector.playStep === 'function'){
        window.animationDirector.playStep(step);
      }
    }catch(e){
      console.warn('[HermesSocket] invalid step', e);
    }
  });

  socket.addEventListener('close', () => {
    console.log('[HermesSocket] closed');
  });

  socket.addEventListener('error', (err) => {
    console.error('[HermesSocket] error', err);
  });

  return socket;
}