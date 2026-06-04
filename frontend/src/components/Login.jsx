import React, { useState } from 'react';

export default function Login({ setUser, API_BASE_URL, fondoJardin }) {
  // 'login' | 'register' | 'forgot'
  const [vistaActual, setVistaActual] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Enviar Formulario de Login Tradicional
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const email = e.target.elements.email.value.trim();
    const password = e.target.elements.password.value;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const d = await res.json();
      
      if (res.ok && d.token) {
        // Guardamos el usuario y su rol (admin o cliente)
        const u = { 
          nombre: d.nombre || 'Usuario', 
          token: d.token, 
          rol: d.rol || 'cliente' // 📌 El backend debe devolver el rol
        };
        window.sessionStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      } else {
        setError(d.mensaje || "Correo o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Enviar Formulario de Registro de Nuevo Cliente
  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setLoading(true);

    const nombre = e.target.elements.regNombre.value.trim();
    const email = e.target.elements.regEmail.value.trim();
    const password = e.target.elements.regPassword.value;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol: 'cliente' })
      });
      const d = await res.json();

      if (res.ok) {
        setMensajeExito("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
        setVistaActual('login');
      } else {
        setError(d.mensaje || "No se pudo crear la cuenta.");
      }
    } catch (err) {
      setError("Error de red al intentar registrarse.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Enviar Formulario de Recuperación de Contraseña
  const handleRecuperarClave = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setLoading(true);

    const email = e.target.elements.forgotEmail.value.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setMensajeExito("Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.");
        setVistaActual('login');
      } else {
        const d = await res.json();
        setError(d.mensaje || "El correo ingresado no está registrado.");
      }
    } catch (err) {
      setError("Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Logins Sociales (Llamadas a tu Backend u OAuth)
  const handleSocialLogin = (provider) => {
    console.log(`Iniciando sesión con ${provider}...`);
    // window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${fondoJardin})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-white/20">
        <div className="flex justify-center mb-3 text-6xl select-none">🌸</div>
        <h2 className="text-4xl font-black text-[#1b4332] mb-1 uppercase tracking-tighter">Floristería</h2>
        
        {/* Alertas Reutilizables de Error y Éxito */}
        {error && <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">{error}</div>}
        {mensajeExito && <div className="my-3 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-xs font-bold">{mensajeExito}</div>}

        {/* ================= VISTA 1: INICIAR SESIÓN ================= */}
        {vistaActual === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-4">
            <p className="text-[11px] font-bold text-gray-400 mb-4 text-center tracking-wide">¡El jardín de tus sueños está a un paso!</p>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Correo Electrónico</label>
              <input type="email" name="email" placeholder="ejemplo@correo.com" required className="w-full p-4 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Contraseña</label>
                <button type="button" onClick={() => setVistaActual('forgot')} className="text-[10px] font-black text-[#d81b60] uppercase tracking-wider hover:underline">¿La olvidaste?</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required className="w-full p-4 pr-12 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#d81b60] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-2 text-sm disabled:bg-gray-400">
              {loading ? 'Verificando...' : 'Entrar al Jardín'}
            </button>

            {/* Separador Social */}
            <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-200"></div><span className="mx-3 text-gray-400 text-[10px] font-black uppercase">o entrar con</span><div className="flex-grow border-t border-gray-200"></div></div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl font-bold text-xs text-gray-700 shadow-xs"><svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.423.996 15.61 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.814 11.57-11.79 0-.79-.085-1.393-.188-1.925H12.24z"/></svg>Google</button>
              <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] text-white rounded-2xl font-bold text-xs shadow-xs"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Facebook</button>
            </div>

            <p className="text-center text-xs font-bold text-gray-500 pt-4">¿No tienes cuenta? <button type="button" onClick={() => setVistaActual('register')} className="text-[#d81b60] font-black hover:underline">Regístrate aquí</button></p>
          </form>
        )}

        {/* ================= VISTA 2: REGISTRO DE USUARIOS ================= */}
        {vistaActual === 'register' && (
          <form onSubmit={handleRegistro} className="space-y-4 text-left mt-4">
            <p className="text-[11px] font-bold text-gray-400 mb-4 text-center tracking-wide">Crea tu cuenta de cliente para empezar a comprar</p>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Nombre Completo</label>
              <input type="text" name="regNombre" placeholder="Tu nombre" required className="w-full p-4 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Correo Electrónico</label>
              <input type="email" name="regEmail" placeholder="ejemplo@correo.com" required className="w-full p-4 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Contraseña segura</label>
              <input type="password" name="regPassword" placeholder="Mínimo 6 caracteres" required className="w-full p-4 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1b4332] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#081c15] mt-2 text-sm disabled:bg-gray-400">
              {loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}
            </button>

            <p className="text-center text-xs font-bold text-gray-500 pt-2">¿Ya tienes cuenta? <button type="button" onClick={() => setVistaActual('login')} className="text-[#d81b60] font-black hover:underline">Inicia Sesión</button></p>
          </form>
        )}

        {/* ================= VISTA 3: RECUPERAR CONTRASEÑA ================= */}
        {vistaActual === 'forgot' && (
          <form onSubmit={handleRecuperarClave} className="space-y-4 text-left mt-4">
            <p className="text-[11px] font-bold text-gray-400 mb-4 text-center tracking-wide">Introduce tu correo y te ayudaremos a restablecer tu acceso</p>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1.5 ml-1">Tu Correo de Registro</label>
              <input type="email" name="forgotEmail" placeholder="ejemplo@correo.com" required className="w-full p-4 rounded-2xl bg-[#f0f4f8] outline-none focus:ring-2 ring-pink-200 font-semibold text-gray-700" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#d81b60] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-2 text-sm disabled:bg-gray-400">
              {loading ? 'Enviando...' : 'Recuperar Contraseña'}
            </button>

            <p className="text-center text-xs font-bold text-gray-500 pt-2"><button type="button" onClick={() => setVistaActual('login')} className="text-gray-400 font-black hover:text-gray-600 underline uppercase tracking-wider text-[10px]">Volver al Login</button></p>
          </form>
        )}

      </div>
    </div>
  );
}