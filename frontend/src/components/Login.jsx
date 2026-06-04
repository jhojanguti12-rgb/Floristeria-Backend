import React, { useState } from 'react';

export default function Login({ setUser, API_BASE_URL, fondoJardin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    // Validación básica en cliente
    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const d = await res.json();
      
      if (res.ok && d.token) {
        const u = { nombre: d.nombre || 'Administrador', token: d.token };
        // Guardamos en la sesión del navegador
        window.sessionStorage.setItem('user', JSON.stringify(u));
        // Actualizamos el estado global en App.jsx para darle acceso
        setUser(u);
      } else {
        alert(d.mensaje || "Email o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en el login:", err);
      alert("No se pudo conectar con el servidor de la floristería.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo difuminado del jardín */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `url(${fondoJardin})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }} 
      />
      
      {/* Formulario de acceso */}
      <form 
        className="relative z-10 bg-white/90 backdrop-blur-xs p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center" 
        onSubmit={handleLogin}
      >
        <div className="flex justify-center mb-4 text-6xl select-none">🌸</div>
        <h2 className="text-4xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Floristería</h2>
        <p className="text-xs font-bold text-gray-500 mb-8 tracking-wide">¡El jardín de tus sueños está a un paso!</p>
        
        <div className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Correo electrónico" 
            required 
            className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            required 
            className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" 
          />
          
          <button 
            disabled={loading} 
            className="w-full bg-[#d81b60] text-white p-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-4 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar al Jardín'}
          </button>
        </div>
      </form>
    </div>
  );
}