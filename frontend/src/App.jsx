import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

// CONFIGURACIÓN DE TU BACKEND EN RENDER (Ajustada para conectar de forma directa)
const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

const formatCOP = (val) => new Intl.NumberFormat('es-CO', { 
  style: 'currency', 
  currency: 'COP', 
  minimumFractionDigits: 0 
}).format(Number(val) || 0);

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(window.sessionStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ 
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] 
  });

  // --- FUNCIÓN PARA CARGAR DATOS ---
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/stats`, {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          inventario: data.inventario || 0,
          personal: data.personal || 0,
          pedidosCount: data.pedidosCount || 0,
          ventasTotal: data.ventasTotal || 0,
          pedidosLista: Array.isArray(data.pedidosLista) ? data.pedidosLista : []
        });
      }
    } catch (e) {
      console.error("Error cargando estadísticas:", e);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const d = await res.json();

      if (res.ok && d.token) {
        const u = { nombre: d.nombre || 'Administrador', token: d.token };
        window.sessionStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      } else {
        alert(d.mensaje || "Email o contraseña incorrectos");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor. Verifica que el Backend esté encendido en Render.");
    } finally {
      loading(false);
    }
  };

  // --- VISTA DE LOGIN MÁGICO MODIFICADA ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* 1. Fondo de pantalla usando tu imagen local de la carpeta public */}
        <div className="absolute inset-0 z-0" style={{
            backgroundImage: "url('/fondo-jardin.jpg')",
            backgroundSize: 'cover', 
            backgroundPosition: 'center'
          }}
        />
        
        {/* Estilos inyectados rápidamente solo para animar el rebote del Emoji */}
        <style>{`
          @keyframes bounceEmoji {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(20px); }
          }
          .animate-bounce-emoji {
            animation: bounceEmoji 2s infinite ease-in-out;
          }
        `}</style>

        <form className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center" onSubmit={handleLogin}>
          
          {/* 2. EMOJI DE FLOR SALTARTÍN CON CONTROL DE VELOCIDAD */}
          <div className="flex justify-center mb-4 text-6xl animate-bounce-emoji select-none">
            🌸
          </div>
          
          <h2 className="text-4xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Floristería</h2>
          
          {/* 3. CAMBIO DE FRASE: Quitamos "Panel de Gestión" / "Panel Administrativo" */}
          <p className="text-xs font-bold text-gray-500 mb-8 tracking-wide">
            ¡El jardín de tus sueños está a un paso!
          </p>
          
          <div className="space-y-4">
            <input type="email" placeholder="Correo electrónico" required className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 transition-all font-semibold" />
            <input type="password" placeholder="Contraseña" required className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 transition-all font-semibold" />
            <button disabled={loading} className="w-full bg-[#d81b60] text-white p-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:bg-gray-400">
              {loading ? 'Entrando...' : 'Entrar al Jardín'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- VISTA DE DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      <aside className="w-64 bg-[#1b4332] text-white flex flex-col shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Floristería</h1>
          <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Gestión Profesional</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 cursor-pointer">
            <span className="text-lg">🏠</span> <span className="font-bold">Inicio</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl opacity-50 hover:bg-white/5 transition-all cursor-not-allowed">
            <span className="text-lg">📦</span> <span className="font-bold">Inventario</span>
          </div>
        </nav>
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-black text-white">
              {user.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black leading-none">{user.nombre}</p>
              <p className="text-[10px] text-green-400 font-bold uppercase mt-1">Administrador</p>
            </div>
          </div>
          <button onClick={() => { window.sessionStorage.clear(); setUser(null); }} className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all font-bold text-sm">
            🚪 Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-5xl font-black text-[#1b4332] tracking-tighter">¡Bienvenido, {user.nombre}!</h2>
          <p className="text-gray-400 font-bold mt-2">Resumen de hoy.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-white shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Pedidos</p>
              <h3 className="text-2xl font-black text-emerald-600">{stats.pedidosCount}</h3>
            </div>
            <div className="bg-pink-50 p-6 rounded-[2.5rem] border border-white shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Ventas</p>
              <h3 className="text-2xl font-black text-pink-600">{formatCOP(stats.ventasTotal)}</h3>
            </div>
            <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-white shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Stock</p>
              <h3 className="text-2xl font-black text-orange-600">{stats.inventario}</h3>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-white shadow-sm">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Personal</p>
              <h3 className="text-2xl font-black text-blue-600">{stats.personal}</h3>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
             <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest mb-8">Ventas Semanales</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{d:'L',v:0}, {d:'M',v:0}, {d:'X',v:0}, {d:'J',v:0}, {d:'V',v:0}, {d:'S',v:0}, {d:'Hoy',v:stats.ventasTotal}]}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:'bold', fill:'#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest mb-8">Pedidos Recientes</h4>
            <div className="space-y-6">
              {stats.pedidosLista.length > 0 ? stats.pedidosLista.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-300 uppercase">#{String(p.id).substring(0,5)}</p>
                    <p className="text-sm font-black text-gray-700">{p.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">{formatCOP(p.total)}</p>
                  </div>
                </div>
              )) : <p className="text-center text-gray-400 text-sm font-bold py-10">No hay pedidos registrados</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}