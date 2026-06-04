import React, { useState } from 'react';

export default function Login({ setUser, API_BASE_URL, fondoJardin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
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
        
        if (rememberMe) {
          window.localStorage.setItem('user', JSON.stringify(u));
        } else {
          window.sessionStorage.setItem('user', JSON.stringify(u));
        }
        
        setUser(u);
      } else {
        setError(d.mensaje || "Email o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error en el login:", err);
      setError("No se pudo conectar con el servidor de la floristería.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo de pantalla completa */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `url(${fondoJardin})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }} 
      />
      
      {/* Contenedor o Tarjeta Blanca Estilo Vidrio/Opaco */}
      <form 
        className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-white/20" 
        onSubmit={handleLogin}
      >
        {/* Icono de la Flor */}
        <div className="flex justify-center mb-4 text-6xl select-none">🌸</div>
        
        {/* Títulos principales */}
        <h2 className="text-4xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Floristería</h2>
        <p className="text-xs font-bold text-gray-500 mb-8 tracking-wide">¡El jardín de tus sueños está a un paso!</p>
        
        {/* Mensaje de Error Integrado en el Diseño */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Campos de entrada de datos */}
        <div className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Correo electrónico" 
            required 
            disabled={loading}
            className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-400 transition-all disabled:opacity-60" 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Contraseña" 
              required 
              disabled={loading}
              className="w-full p-4 pr-12 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-400 transition-all disabled:opacity-60" 
            />
            {/* Botón interactivo para alternar visibilidad de contraseña (Ojo) */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Opción para recordar sesión (Se integra armónicamente al diseño limpio) */}
          <div className="flex items-center justify-start px-1 py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500 font-bold text-xs">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-lg accent-[#d81b60] cursor-pointer"
              />
              <span>Recordarme en este dispositivo</span>
            </label>
          </div>
          
          {/* Botón Principal */}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-[#d81b60] text-white p-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-4 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando...</span>
              </>
            ) : (
              <span>Entrar al Jardín</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}