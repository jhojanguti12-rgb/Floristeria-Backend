import React, { useState } from 'react';

export default function Login({ setUser, API_BASE_URL, fondoJardin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 1. Lógica para el formulario tradicional
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    if (!email || !password) {
      setError("Por favor, rellena todos los campos.");
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
        setError(d.mensaje || "El correo o la contraseña son incorrectos.");
      }
    } catch (err) {
      console.error("Error en la petición de login:", err);
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para inicio de sesión con Google
  const handleGoogleLogin = () => {
    setError(null);
    console.log("Iniciando sesión con Google...");
    // Redirección a la ruta de Google en tu API de Render
    // window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // 3. Función para inicio de sesión con Facebook
  const handleFacebookLogin = () => {
    setError(null);
    console.log("Iniciando sesión con Facebook...");
    // Redirección a la ruta de Facebook en tu API de Render
    // window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo del jardín */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `url(${fondoJardin})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }} 
      />
      
      {/* Tarjeta de Login */}
      <form 
        className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-white/20" 
        onSubmit={handleLogin}
      >
        {/* Isotipo Flor */}
        <div className="flex justify-center mb-4 text-6xl select-none">🌸</div>
        
        {/* Encabezados */}
        <h2 className="text-4xl font-black text-[#1b4332] mb-1 uppercase tracking-tighter">Floristería</h2>
        <p className="text-[11px] font-bold text-gray-400 mb-6 tracking-wide">¡El jardín de tus sueños está a un paso!</p>
        
        {/* Alerta de error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Campos de Entrada */}
        <div className="space-y-4 text-left">
          
          {/* Correo Electrónico */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="ejemplo@floristeria.com" 
              required 
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-[#f0f4f8] border border-transparent outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-300 transition-all disabled:opacity-50" 
            />
          </div>
          
          {/* Contraseña */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="••••••••" 
                required 
                disabled={loading}
                className="w-full p-4 pr-12 rounded-2xl bg-[#f0f4f8] border border-transparent outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700 placeholder-gray-300 transition-all disabled:opacity-50" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Opción Recordarme */}
          <div className="flex items-center justify-start py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500 font-bold text-[11px]">
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-lg accent-[#d81b60] cursor-pointer"
              />
              <span>Recordarme en este dispositivo</span>
            </label>
          </div>
          
          {/* Botón Principal Tradicional */}
          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-[#d81b60] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-2 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 text-sm"
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

          {/* 📌 SECCIÓN DE INICIOS SOCIALES (GOOGLE Y FACEBOOK) */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-wider">o continuar con</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Botón Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl shadow-xs transition-all font-bold text-xs text-gray-700"
            >
              {/* SVG de Google Oficial */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.423.996 15.61 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.79-.085-1.393-.188-1.925H12.24z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* Botón Facebook */}
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] hover:bg-[#166FE5] rounded-2xl shadow-xs transition-all font-bold text-xs text-white"
            >
              {/* SVG de Facebook Oficial */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}