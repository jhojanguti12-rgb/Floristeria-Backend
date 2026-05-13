import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- CONFIGURACIÓN DE API ---
const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

const api = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Error en GET ${endpoint}`);
      return await res.json();
    } catch (err) { return null; }
  },
  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  }
};

const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(Number(val) || 0);
};

// --- COMPONENTE DE PEDIDOS (EL CULPABLE DEL ERROR) ---
const RecentOrder = ({ id, customer, status, price }) => {
  // BLINDAJE TOTAL: Convertimos todo a String y verificamos antes de usar slice
  const safeId = id ? String(id) : "0";
  const safeCustomer = customer ? String(customer) : "Cliente";

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <i className="bi bi-person-fill"></i>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 leading-none mb-1">
            #{safeId.length > 0 ? safeId.toUpperCase() : '---'}
          </p>
          <p className="text-sm font-black text-gray-700">
            {safeCustomer.length > 20 ? safeCustomer.substring(0, 20) : safeCustomer}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-gray-800">{formatCOP(price)}</p>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase bg-orange-100 text-orange-700">
          {status || 'pendiente'}
        </span>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, growth, icon, color, bg, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
      <i className={`bi ${icon}`}></i>
    </div>
    <div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-black text-gray-800 tracking-tighter">
        {isCurrency ? formatCOP(value) : value}
      </h4>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(window.sessionStorage.getItem('user')) || null);
  const [seccion, setSeccion] = useState('inicio');
  const [stats, setStats] = useState({
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/stats');
      if (res) {
        setStats({
          inventario: res.inventario || 0,
          personal: res.personal || 0,
          pedidosCount: res.pedidosCount || 0,
          ventasTotal: res.ventasTotal || 0,
          pedidosLista: Array.isArray(res.pedidosLista) ? res.pedidosLista : []
        });
      }
    } catch (err) { console.error("Error cargando stats"); }
  }, []);

  useEffect(() => {
    if (user && seccion === 'inicio') fetchDashboardData();
  }, [user, seccion, fetchDashboardData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/usuarios/login', { email: e.target[0].value, password: e.target[1].value });
      if (res.token) {
        const userData = { rol: res.rol, nombre: res.nombre, token: res.token };
        window.sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else { alert("Error al entrar"); }
    } catch (err) { alert("Credenciales incorrectas"); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-12 rounded-[5rem] shadow-2xl w-full max-w-md text-center">
          <h1 className="text-4xl font-black text-[#2d6a4f] mb-8 uppercase">Entrar</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full p-4 rounded-full bg-gray-100 font-bold border outline-none" required />
            <input type="password" placeholder="Pass" className="w-full p-4 rounded-full bg-gray-100 font-bold border outline-none" required />
            <button className="w-full bg-[#d81b60] text-white font-black py-4 rounded-full uppercase tracking-widest">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-64 bg-[#1b4332] text-white p-6 flex flex-col">
        <h1 className="text-2xl font-black italic mb-10">FLORISTERÍA</h1>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setSeccion('inicio')} className="w-full text-left p-3 rounded-xl hover:bg-white/10 font-bold">Inicio</button>
        </nav>
        <button onClick={() => { window.sessionStorage.clear(); setUser(null); }} className="p-3 bg-red-500/20 rounded-xl font-bold">Salir</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <header>
            <h1 className="text-4xl font-black text-[#2d6a4f]">¡Hola, {String(user.nombre || 'Usuario').split(' ')[0]}!</h1>
            <p className="text-gray-400 font-bold">Resumen del negocio</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Pedidos" value={stats.pedidosCount} icon="bi-bag" color="text-green-600" bg="bg-green-50" />
            <StatCard title="Ventas" value={stats.ventasTotal} icon="bi-cash" color="text-pink-600" bg="bg-pink-50" isCurrency />
            <StatCard title="Stock" value={stats.inventario} icon="bi-flower1" color="text-orange-600" bg="bg-orange-50" />
            <StatCard title="Personal" value={stats.personal} icon="bi-people" color="text-blue-600" bg="bg-blue-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border h-[400px]">
              <h3 className="font-black text-[#2d6a4f] mb-4 uppercase">Ventas</h3>
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={[{d:'L', v:0}, {d:'M', v:stats.ventasTotal}]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="d" />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="v" stroke="#2d6a4f" fill="#2d6a4f" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border overflow-hidden">
              <h3 className="font-black text-[#2d6a4f] mb-6 uppercase text-sm">Pedidos Recientes</h3>
              <div className="space-y-2">
                {stats.pedidosLista.length > 0 ? (
                  stats.pedidosLista.map((p, i) => (
                    <RecentOrder key={i} id={p.id} customer={p.cliente || p.nombre} status={p.status} price={p.total} />
                  ))
                ) : (
                  <p className="text-center text-gray-400 font-bold py-10">Sin pedidos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}