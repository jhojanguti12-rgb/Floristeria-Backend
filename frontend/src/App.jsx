import React from 'react';

export default function App() {
  console.log("Intentando renderizar App..."); // Mira si esto sale en la consola (F12)
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #2d6a4f, #1b4332)',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem' }}>🌸 Sistema Floristería</h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>Si ves esto, el problema eran los componentes complejos.</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
      >
        RECARGAR PÁGINA
      </button>
    </div>
  );
}