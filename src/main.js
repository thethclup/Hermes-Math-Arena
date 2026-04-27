// src/main.js
import { connectHermes } from './agent/HermesSocketClient.js';

// small helper to wire the socket to UI
const socket = connectHermes({ onStep: (step) => {
  console.log('[Main] received step', step);
  if (window.animationDirector && typeof window.animationDirector.playStep === 'function'){
    window.animationDirector.playStep(step);
  }
}});

// simple UI wiring — expects #solveBtn and #problemInput in DOM
document.addEventListener('DOMContentLoaded', () => {
  const solveBtn = document.getElementById('solveBtn');
  const problemInput = document.getElementById('problemInput');
  if (solveBtn && problemInput){
    solveBtn.addEventListener('click', () => {
      const q = problemInput.value || 'Prove triangle angle sum';
      if (socket && socket.readyState === WebSocket.OPEN){
        socket.send(q);
      }else{
        console.warn('Socket not open. Reconnecting or start backend first.');
      }
    });
  }
});
