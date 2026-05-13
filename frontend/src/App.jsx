import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(val) || 0);

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(window.sessionStorage.getItem('user')) || null);
  const [stats, setStats] = useState({ inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      if (data) setStats({ ...data, pedidosLista: Array.isArray(data.pedidosLista) ? data.pedidosLista : [] });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b4332] p-4">
        <form className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md animate__animated animate__fadeIn" onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: e.target[0].value, password: e.target[1].value })
          });
          const d = await res.json();
          if (d.token) {
            const u = { nombre: d.nombre, token: d.token };
            window.sessionStorage.setItem('user', JSON.stringify(u));
            setUser(u);
          } else { alert("Error al entrar"); }
        }}>
          <h2 className="text-3xl font-black text-[#2d6a4f] mb-6 text-center uppercase tracking-tighter">Floristería</h2>
          <input type="email" placeholder="Email" className="w-full p-4 mb-3 rounded-2xl bg-gray-100 border-none font-bold" />
          <input type="password" placeholder="Pass" className="w-full p-4 mb-6 rounded-2xl bg-gray-100 border-none font-bold" />
          <button className="w-full bg-[#d81b60] text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-200">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white p-8 flex flex-col">
        <h1 className="text-2xl font-black italic mb-10 tracking-tighter">FLORISTERÍA</h1>
        <nav className="flex-1 space-y-4 font-bold text-green-200">
          <div className="text-white bg-white/10 p-3 rounded-xl">Inicio</div>
        </nav>
        <button onClick={() => { window.sessionStorage.clear(); setUser(null); }} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl font-bold transition-all text-sm">Cerrar Sesión</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-[#2d6a4f]">¡Hola, {user.nombre}!</h1>
          <p className="text-gray-400 font-bold">Resumen de tu jardín hoy</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { t: 'Pedidos', v: stats.pedidosCount, c: 'text-green-600', bg: 'bg-green-50' },
            { t: 'Ventas', v: formatCOP(stats.ventasTotal), c: 'text-pink-600', bg: 'bg-pink-50' },
            { t: 'Stock', v: stats.inventario, c: 'text-orange-600', bg: 'bg-orange-50' },
            { t: 'Personal', v: stats.personal, c: 'text-blue-600', bg: 'bg-blue-50' }
          ].map((s, i) => (
            <div key={i} className={`${s.bg} p-6 rounded-[2.5rem] border border-white shadow-sm`}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{s.t}</p>
              <h3 className={`text-2xl font-black ${s.c}`}>{s.v}</h3>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 h-80">
            <h3 className="font-black text-[#2d6a4f] mb-4 uppercase text-xs">Ventas Semanales</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{n:'L', v:0}, {n:'V', v:stats.ventasTotal}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="n" hide />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#2d6a4f" fill="#2d6a4f" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-[#2d6a4f] mb-6 uppercase text-xs">Pedidos Recientes</h3>
            <div className="space-y-4">
              {stats.pedidosLista.map((p, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <div>
                    {/* EL ARREGLO MAESTRO ESTÁ AQUÍ: USAMOS STRING Y SUBSTRING */}
                    <p className="text-[9px] font-black text-gray-300">#{String(p.id || i).toUpperCase().substring(0,6)}</p>
                    <p className="text-sm font-black text-gray-700">{String(p.cliente || 'Cliente')}</p>
                  </div>
                  <p className="font-black text-green-700">{formatCOP(p.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}