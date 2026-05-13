import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

// CONFIGURACIÓN DE TU BACKEND EN RENDER
const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

// Formateador de moneda (Pesos Colombianos)
const formatCOP = (val) => new Intl.NumberFormat('es-CO', { 
  style: 'currency', 
  currency: 'COP', 
  minimumFractionDigits: 0 
}).format(Number(val) || 0);

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(window.sessionStorage.getItem('user')) || null);
  const [stats, setStats] = useState({ 
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] 
  });

  // Función para traer datos del servidor
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      if (data) {
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
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // --- VISTA DE LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Fondo con imagen de flores (Como en tu captura) */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1920')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(4px) brightness(0.8)'
          }}
        />
        
        {/* Tarjeta de Login */}
        <form 
          className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: e.target[0].value, password: e.target[1].value })
              });
              const d = await res.json();
              if (d.token) {
                const u = { nombre: d.nombre, token: d.token };
                window.sessionStorage.setItem('user', JSON.stringify(u));
                setUser(u);
              } else {
                alert("Email o contraseña incorrectos");
              }
            } catch (err) {
              alert("Error al conectar con el servidor");
            }
          }}
        >
          <div className="flex justify-center mb-4 text-[#d81b60] text-4xl">🌸</div>
          <h2 className="text-4xl font-black text-[#1b4332] mb-1 uppercase tracking-tighter">Floristería</h2>
          <p className="text-[10px] font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">Panel de Gestión</p>
          
          <div className="space-y-4">
            <input type="email" placeholder="Correo electrónico" required className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-pink-200 transition-all font-semibold" />
            <input type="password" placeholder="Contraseña" required className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-pink-200 transition-all font-semibold" />
            <button className="w-full bg-[#d81b60] text-white p-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] hover:scale-[1.02] active:scale-95 transition-all mt-4">
              Entrar al Jardín
            </button>
          </div>
          
          <p className="mt-8 text-xs text-gray-400 font-medium">¿Olvidaste tu contraseña?</p>
        </form>
      </div>
    );
  }

  // --- VISTA DE DASHBOARD (Inicio de Admin) ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-[#1b4332] text-white flex flex-col shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">FLORISTERÍA</h1>
          <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Gestión Profesional</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 cursor-pointer">
            <span className="text-lg">🏠</span> <span className="font-bold">Inicio</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl opacity-50 hover:bg-white/5 transition-all cursor-not-allowed">
            <span className="text-lg">👥</span> <span className="font-bold">Personal</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl opacity-50 hover:bg-white/5 transition-all cursor-not-allowed">
            <span className="text-lg">📦</span> <span className="font-bold">Inventario</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl opacity-50 hover:bg-white/5 transition-all cursor-not-allowed">
            <span className="text-lg">💐</span> <span className="font-bold">Pedidos</span>
          </div>
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-black">
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="text-sm font-black leading-none">{user.nombre || 'Admin'}</p>
              <p className="text-[10px] text-green-400 font-bold uppercase">Administrador</p>
            </div>
          </div>
          <button 
            onClick={() => { window.sessionStorage.clear(); setUser(null); }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all font-bold text-sm"
          >
            🚪 Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h2 className="text-5xl font-black text-[#1b4332] tracking-tighter">¡Bienvenido, {user.nombre}!</h2>
          <p className="text-gray-400 font-bold mt-2">Aquí tienes el resumen del jardín para hoy.</p>
        </header>

        {/* Tarjetas de Estadísticas (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { lab: 'Pedidos Totales', val: stats.pedidosCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { lab: 'Ventas Totales', val: formatCOP(stats.ventasTotal), color: 'text-pink-600', bg: 'bg-pink-50' },
            { lab: 'En Inventario', val: stats.inventario, color: 'text-orange-600', bg: 'bg-orange-50' },
            { lab: 'Personal', val: stats.personal, color: 'text-blue-600', bg: 'bg-blue-50' }
          ].map((item, idx) => (
            <div key={idx} className={`${item.bg} p-6 rounded-[2.5rem] border border-white shadow-sm`}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{item.lab}</p>
              <h3 className={`text-2xl font-black ${item.color}`}>{item.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico Principal */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest">Ventas de los últimos 7 días</h4>
               <span className="text-[10px] font-bold text-gray-400">Últimos 7 días ▼</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{d:'Lun',v:0}, {d:'Hoy',v:stats.ventasTotal}]}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:'bold', fill:'#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de Pedidos Recientes (María García Fix) */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest">Pedidos Recientes</h4>
              <button className="text-[9px] font-black text-pink-500 uppercase">Ver Todos</button>
            </div>
            
            <div className="space-y-6">
              {stats.pedidosLista.length > 0 ? stats.pedidosLista.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</div>
                    <div>
                      {/* SOLUCIÓN AL ERROR DE MARÍA GARCÍA: USAMOS SUBSTRING SEGURO */}
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                        #{String(p.id || i).substring(0, 5)}
                      </p>
                      <p className="text-sm font-black text-gray-700">
                        {p.cliente || 'Consumidor Final'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">{formatCOP(p.total)}</p>
                    <p className="text-[8px] font-bold text-orange-400 uppercase">Pendiente</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-10 font-bold">No hay pedidos hoy</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}