import React, { useState } from 'react';

export default function Login({ setUser, API_BASE_URL, fondoJardin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // 📌 Alertas integradas en la UI
  const [showPassword, setShowPassword] = useState(false); // 📌 Ver contraseña
  const [rememberMe, setRememberMe] = useState(false); // 📌 Recordar usuario

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    
    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    if (!email || !password) {
      setError("Por favor, completa todos los campos requeridos.");
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
        
        // 📌 UX: Decidir almacenamiento según la preferencia del usuario
        if (rememberMe) {
          window.localStorage.setItem('user', JSON.stringify(u));
        } else {
          window.sessionStorage.setItem('user', JSON.stringify(u));
        }
        
        setUser(u);
      } else {
        setError(d.mensaje || "El correo o la contraseña no coinciden.");
      }
    } catch (err) {
      console.error("Error en el login:", err);
      setError("No pudimos conectar con el servidor. Revisa tu conexión a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo del jardín */}
      <div 
        className="absolute inset-0 z-0 scale-105 filter blur-[2px]" 
        style={{ 
          backgroundImage: `url(${fondoJardin})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }} 
      />
      
      {/* Tarjeta del Formulario */}
      <form 
        className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md transition-all duration-300 border border-white/50" 
        onSubmit={handleLogin}
      >
        {/* Isotipo animado */}
        <div className="flex justify-center mb-3 text-6xl select-none animate-bounce duration-1000">🌸</div>
        <h2 className="text-4xl font-black text-[#1b4332] mb-1 uppercase tracking-tighter">Floristería</h2>
        <p className="text-xs font-bold text-gray-400 mb-6 tracking-wide">Panel de Administración</p>
        
        {/* 📌 Contenedor de Errores Amigable para el Usuario */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-left flex items-start gap-2 animate-fade-in">
            <span className="text-sm">⚠️</span>
            <p className="leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4 text-left">
          {/* Input de Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email" 
              disabled={loading}
              placeholder="ejemplo@floristerua.com" 
              required 
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-300 transition-all disabled:opacity-50" 
            />
          </div>

          {/* Input de Contraseña con Ojo */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                disabled={loading}
                placeholder="••••••••" 
                required 
                className="w-full p-4 pr-12 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-300 transition-all disabled:opacity-50" 
              />
              {/* Botón del Ojo */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* 📌 Checkbox "Recordarme" */}
          <div className="flex items-center justify-between pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none group text-gray-500 font-bold text-xs">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-lg accent-[#d81b60] cursor-pointer transition-all"
              />
              <span className="group-hover:text-gray-700 transition-colors">Mantener sesión iniciada</span>
            </label>
          </div>
          
          {/* Botón de Envío Dinámico */}
          <button 
            disabled={loading} 
            className="w-full bg-[#d81b60] hover:bg-[#ad1457] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-lg shadow-pink-100 hover:shadow-xl transition-all duration-200 mt-2 disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando...</span>
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