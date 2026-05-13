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
    } catch (err) {
      console.error("API Get Error:", err);
      return null;
    }
  },
  post: async (endpoint, body, isFormData = false) => {
    const options = {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    };
    if (!isFormData) options.headers = { 'Content-Type': 'application/json' };
    
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || `Error en POST ${endpoint}`);
    return data;
  },
  patch: async (endpoint, body) => {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  delete: async (endpoint) => {
    const user = JSON.parse(window.sessionStorage.getItem('user'));
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user?.token}` }
    });
    return res.json();
  }
};

// --- FORMATEADORES ---
const formatCOP = (val) => {
  const numero = Number(val) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(numero);
};

// --- COMPONENTES DE DISEÑO ---
const StatCard = ({ title, value, growth, icon, color, bg, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-105">
    <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
      <i className={`bi ${icon}`}></i>
    </div>
    <div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black text-gray-800 tracking-tighter">
            {isCurrency ? formatCOP(value) : value}
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full 
            ${String(growth).includes('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
          {growth}
        </span>
      </div>
    </div>
  </div>
);

// 🛠️ ARREGLO 1: Corrección del error .slice() en el ID del pedido
const RecentOrder = ({ id, customer, status, price }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <i className="bi bi-person-fill"></i>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 leading-none mb-1">
          #{String(id || '0').toUpperCase()}
        </p>
        <p className="text-sm font-black text-gray-700">
          {String(customer || "Cliente").slice(0, 20)}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-gray-800">{formatCOP(price)}</p>
      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter 
        ${status === 'completado' || status === 'Entregado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        {status || 'pendiente'}
      </span>
    </div>
  </div>
);

const InputEstilizado = ({ type = "text", placeholder, value, onChange, icon }) => (
  <div className="relative w-full">
    {icon && <i className={`bi ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400`}></i>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full ${icon ? 'pl-12' : 'px-8'} py-4 rounded-full bg-gray-100 border border-gray-300 text-center outline-none focus:bg-white focus:ring-2 focus:ring-[#d81b60]/20 transition-all text-gray-700 font-bold`}
      required
    />
  </div>
);

// --- MODALES ---
const ModalProducto = ({ alCerrar, alGuardar }) => {
  const [datos, setDatos] = useState({ nombre: '', precio: '', stock: '', id_categoria: '', color: '' });
  const [foto, setFoto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(Array.isArray(res) ? res : [])).catch(() => setCategorias([]));
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('precio', parseFloat(datos.precio));
    formData.append('stock', parseInt(datos.stock));
    formData.append('id_categoria', parseInt(datos.id_categoria));
    formData.append('color', datos.color);
    if (foto) formData.append('imagen', foto);

    try {
      const user = JSON.parse(window.sessionStorage.getItem('user'));
      const res = await fetch(`${API_BASE_URL}/flores/crear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });
      const resultado = await res.json();
      if (!res.ok) throw new Error(resultado.mensaje || "Error al crear producto");
      alert("🌸 ¡Producto florecido!");
      alGuardar();
      alCerrar();
    } catch (err) { alert("❌ " + err.message); } finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[4rem] shadow-2xl w-full max-w-lg border-4 border-[#2d6a4f]/10">
        <h2 className="text-3xl font-black text-[#2d6a4f] uppercase italic mb-6 text-center">Nueva Planta</h2>
        <form onSubmit={enviar} className="space-y-4">
          <InputEstilizado placeholder="Nombre de la Flor" value={datos.nombre} onChange={e => setDatos({...datos, nombre: e.target.value})} />
          <div className="flex gap-4">
            <input type="number" step="0.01" placeholder="Precio $" className="w-1/2 p-4 rounded-full bg-gray-100 outline-none text-center border font-bold" value={datos.precio} onChange={e => setDatos({...datos, precio: e.target.value})} required />
            <input type="number" placeholder="Stock" className="w-1/2 p-4 rounded-full bg-gray-100 outline-none text-center border font-bold" value={datos.stock} onChange={e => setDatos({...datos, stock: e.target.value})} required />
          </div>
          <select className="w-full p-4 rounded-full bg-gray-100 outline-none font-bold text-gray-500 border text-center" 
            value={datos.id_categoria} onChange={e => setDatos({...datos, id_categoria: e.target.value})} required>
            <option value="">-- Seleccionar Categoría --</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
          <InputEstilizado placeholder="Color" value={datos.color} onChange={e => setDatos({...datos, color: e.target.value})} />
          <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-[2rem] relative bg-gray-50">
            <i className="bi bi-cloud-arrow-up text-2xl text-gray-400"></i>
            <span className="text-[10px] font-black uppercase text-gray-400 mt-1">{foto ? foto.name : 'Subir Foto'}</span>
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFoto(e.target.files[0])} />
          </div>
          <button disabled={enviando} className="w-full bg-[#d81b60] text-white font-black py-5 rounded-full shadow-lg hover:scale-105 transition-all uppercase disabled:opacity-50">
            {enviando ? 'Plantando...' : 'Confirmar Registro'}
          </button>
          <button type="button" onClick={alCerrar} className="w-full text-gray-400 font-bold py-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

const FormularioPersonal = ({ alCerrar, alGuardar }) => {
  const [datos, setDatos] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post('/usuarios', datos);
      alert("🌿 ¡Nuevo miembro registrado!");
      await alGuardar();
      alCerrar();
    } catch (err) { alert("❌ Error: " + err.message); }
    finally { setEnviando(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white/95 p-10 rounded-[4rem] shadow-2xl border border-pink-100 w-full max-w-md text-center">
        <h2 className="text-3xl font-black text-[#2d6a4f] uppercase italic mb-8">Nuevo Jardinero</h2>
        <form onSubmit={enviar} className="space-y-4">
          <InputEstilizado placeholder="Nombre Completo" value={datos.nombre} onChange={e => setDatos({...datos, nombre: e.target.value})} />
          <InputEstilizado type="email" placeholder="Email" value={datos.email} onChange={e => setDatos({...datos, email: e.target.value})} />
          <InputEstilizado type="password" placeholder="Contraseña" value={datos.password} onChange={e => setDatos({...datos, password: e.target.value})} />
          <select className="w-full p-4 rounded-full bg-gray-100 font-bold text-[#2d6a4f] outline-none border text-center" 
            onChange={e => setDatos({...datos, rol: e.target.value})} value={datos.rol}>
            <option value="empleado">🌿 Empleado</option>
            <option value="admin">👑 Administrador</option>
          </select>
          <button disabled={enviando} className="w-full bg-[#d81b60] text-white font-black py-5 rounded-full shadow-lg hover:scale-[1.02] transition-all uppercase disabled:opacity-50">
            {enviando ? 'Guardando...' : 'Registrar'}
          </button>
          <button type="button" onClick={alCerrar} className="w-full text-gray-400 font-bold py-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = window.sessionStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  const [seccion, setSeccion] = useState('inicio');
  const [showForm, setShowForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [data, setData] = useState([]);
  
  const [stats, setStats] = useState({
    inventario: 0,
    personal: 0,
    pedidosCount: 0,
    ventasTotal: 0,
    pedidosLista: []
  });

  const fetchData = useCallback(async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      setData(Array.isArray(response) ? response : []);
    } catch (err) { setData([]); }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/stats');
      if(res) {
        setStats({
          inventario: res.inventario || 0,
          personal: res.personal || 0,
          pedidosCount: res.pedidosCount || 0,
          ventasTotal: res.ventasTotal || 0,
          pedidosLista: Array.isArray(res.pedidosLista) ? res.pedidosLista : (Array.isArray(res.pedidos) ? res.pedidos : [])
        });
      }
    } catch (err) { 
      console.error("Error Dashboard:", err); 
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (seccion === 'inicio') fetchDashboardData();
      if (seccion === 'personal') fetchData('/usuarios');
      if (seccion === 'inventario') fetchData('/flores');
    }
  }, [seccion, fetchData, fetchDashboardData, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/usuarios/login', { email: e.target[0].value, password: e.target[1].value });
      const userData = { rol: res.rol, nombre: res.nombre, token: res.token };
      window.sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) { alert("❌ Credenciales incorrectas"); }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await api.patch(`/flores/estado/${id}`, { activo: !estadoActual });
      fetchData('/flores');
    } catch (err) { alert("Error al cambiar estado"); }
  };

  const logout = () => {
    window.sessionStorage.clear();
    setUser(null);
    setSeccion('inicio');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative font-sans overflow-hidden bg-gray-900">
        <div className="relative z-10 bg-white/95 p-12 rounded-[5rem] shadow-2xl w-full max-w-xl text-center border border-white/50 backdrop-blur-md">
          <div className="text-6xl mb-4 animate-bounce">🌸</div>
          <h1 className="text-5xl font-black text-[#2d6a4f] uppercase tracking-tighter">Floristería</h1>
          <p className="text-[#d81b60] font-bold text-[11px] uppercase tracking-[0.4em] mb-10">Panel de Gestión</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <InputEstilizado type="email" placeholder="Correo electrónico" icon="bi-envelope" />
            <InputEstilizado type="password" placeholder="Contraseña" icon="bi-lock" />
            <button className="w-full bg-[#d81b60] text-white font-black py-5 rounded-full shadow-lg text-xl uppercase tracking-widest hover:bg-[#ad1457] transition-all">Entrar al Jardín</button>
          </form>
        </div>
      </div>
    );
  }

  // 🛠️ ARREGLO 2: Protección total de datos numéricos para el gráfico
  const ventasBase = Number(stats.ventasTotal) || 0;
  const chartData = [
    { d: 'Lun', v: Math.floor(ventasBase * 0.1) },
    { d: 'Mar', v: Math.floor(ventasBase * 0.15) },
    { d: 'Mié', v: Math.floor(ventasBase * 0.4) },
    { d: 'Jue', v: Math.floor(ventasBase * 0.1) },
    { d: 'Vie', v: Math.floor(ventasBase * 0.2) },
    { d: 'Sáb', v: Math.floor(ventasBase * 0.05) },
    { d: 'Dom', v: 0 }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans overflow-hidden">
      <aside className="w-80 bg-[#1b4332] text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="mb-12">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">FLORISTERÍA</h1>
          <div className="h-1 w-12 bg-pink-400 mt-1 rounded-full"></div>
        </div>
        <nav className="flex-1 space-y-3">
          {[
            { id: 'inicio', label: 'Inicio', icon: 'bi-house-door', roles: ['admin', 'empleado'] },
            { id: 'personal', label: 'Personal', icon: 'bi-people', roles: ['admin'] },
            { id: 'inventario', label: 'Inventario', icon: 'bi-flower1', roles: ['admin', 'empleado'] },
            { id: 'pedidos', label: 'Pedidos', icon: 'bi-cart', roles: ['admin', 'empleado'] }
          ].map(item => item.roles.includes(user.rol) && (
            <button key={item.id} onClick={() => setSeccion(item.id)} className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${seccion === item.id ? 'bg-white text-[#2d6a4f] font-black shadow-xl translate-x-2' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}>
              <i className={`bi ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 text-center">
            <button onClick={logout} className="w-full bg-white/10 p-5 rounded-2xl font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">Salir</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
        <div className="w-full max-w-7xl mx-auto">
          {seccion === 'inicio' && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black text-[#2d6a4f] tracking-tighter">
                    ¡Bienvenido{user?.nombre ? `, ${String(user.nombre).split(' ')[0]}` : ''}! 👋
                  </h1>
                  <p className="text-gray-400 font-bold text-sm">Resumen de hoy.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border text-sm font-bold text-gray-500">
                  {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Pedidos" value={stats.pedidosCount} growth="+0%" icon="bi-bag-check" color="text-green-600" bg="bg-green-50" />
                <StatCard title="Ventas Totales" value={stats.ventasTotal} growth="+0%" icon="bi-currency-dollar" color="text-pink-600" bg="bg-pink-50" isCurrency={true} />
                <StatCard title="Inventario" value={stats.inventario} growth="+0%" icon="bi-flower2" color="text-orange-600" bg="bg-orange-50" />
                <StatCard title="Personal" value={stats.personal} growth="Estable" icon="bi-people" color="text-blue-600" bg="bg-blue-50" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                  <h3 className="font-black text-[#2d6a4f] uppercase tracking-tighter mb-8">Ventas Semanales</h3>
                  <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                    {chartData && chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                          <YAxis hide={true} />
                          <Tooltip />
                          <Area type="monotone" dataKey="v" stroke="#2d6a4f" strokeWidth={4} fillOpacity={1} fill="url(#colorVentas)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-3xl">
                        <p className="text-gray-400 font-bold text-xs">Sin datos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-[#2d6a4f] uppercase tracking-tighter text-sm">Pedidos recientes</h3>
                    <button onClick={() => setSeccion('pedidos')} className="text-pink-500 text-[10px] font-black uppercase tracking-widest hover:underline">Ver todos</button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(stats?.pedidosLista) && stats.pedidosLista.length > 0 ? (
                      stats.pedidosLista.slice(0, 5).map((pedido, idx) => (
                        <RecentOrder 
                          key={pedido.id || `p-${idx}`}
                          id={pedido.id}
                          customer={pedido.cliente || pedido.nombre || "Cliente"}
                          status={pedido.status}
                          price={pedido.total}
                        />
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-10 font-bold text-xs uppercase italic">No hay pedidos registrados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {seccion === 'personal' && (
            <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-xl w-full border border-white/50">
                <h2 className="text-3xl font-black text-[#2d6a4f] uppercase italic mb-6">Equipo</h2>
                <div className="overflow-hidden rounded-3xl border bg-white">
                  <table className="w-full text-left">
                    <thead className="bg-[#2d6a4f] text-white uppercase text-xs font-black">
                      <tr><th className="p-5">Nombre</th><th className="p-5">Email</th><th className="p-5">Rol</th></tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {Array.isArray(data) && data.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="p-5 font-bold">{u.nombre}</td>
                          <td className="p-5">{u.email}</td>
                          <td className="p-5 uppercase font-black text-[10px] text-pink-500">{u.rol}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button onClick={() => setShowForm(true)} className="bg-[#d81b60] text-white px-12 py-5 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest">+ Nuevo Jardinero</button>
              {showForm && <FormularioPersonal alCerrar={() => setShowForm(false)} alGuardar={() => fetchData('/usuarios')} />}
            </div>
          )}

          {seccion === 'inventario' && (
            <div className="flex flex-col items-center gap-8 w-full max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-xl w-full border border-white/50">
                <div className="flex justify-between items-center mb-6 px-4">
                  <h2 className="text-3xl font-black text-[#2d6a4f] uppercase italic">Stock</h2>
                  <button onClick={() => setShowProductForm(true)} className="bg-[#2d6a4f] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#1b4332] shadow-lg">+ Gestionar</button>
                </div>
                <div className="overflow-hidden rounded-3xl border bg-white">
                  <table className="w-full text-left">
                    <thead className="bg-[#2d6a4f] text-white uppercase text-[10px] font-black">
                      <tr><th className="p-5">Foto</th><th className="p-5">Nombre</th><th className="p-5">Precio</th><th className="p-5">Stock</th><th className="p-5">Acciones</th></tr>
                    </thead>
                    <tbody className="text-sm">
                      {Array.isArray(data) && data.map(f => (
                        <tr key={f.id} className={`border-b hover:bg-gray-50 transition-all ${!f.activo ? 'opacity-40 grayscale' : ''}`}>
                          <td className="p-3">
                            <img src={f.imagen_url ? `https://floristeria-api-v2.onrender.com${f.imagen_url}` : '/logo192.png'} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-gray-100" alt="flor" />
                          </td>
                          <td className="p-5 font-bold text-gray-700">{f.nombre} <br/><span className="text-[10px] text-gray-400 uppercase">{f.nombre_categoria}</span></td>
                          <td className="p-5 text-[#d81b60] font-black">{formatCOP(f.precio)}</td>
                          <td className="p-5 font-medium">{f.stock} uds</td>
                          <td className="p-5 flex gap-2">
                            <button onClick={() => handleToggleEstado(f.id, f.activo)} className="p-2 rounded-xl text-orange-500 hover:bg-orange-50"><i className={`bi ${f.activo ? 'bi-eye-slash' : 'bi-eye'}`}></i></button>
                            <button onClick={async () => { if(confirm('¿Eliminar flor?')) { await api.delete(`/flores/${f.id}`); fetchData('/flores'); }}} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {showProductForm && <ModalProducto alCerrar={() => setShowProductForm(false)} alGuardar={() => fetchData('/flores')} />}
            </div>
          )}

          {seccion === 'pedidos' && (
            <div className="bg-white/80 p-20 rounded-[4rem] shadow-xl text-center border border-white">
              <h2 className="text-4xl font-black text-[#2d6a4f] uppercase italic">🛒 Próximamente</h2>
              <p className="text-gray-500 font-bold mt-4">Carrito de ventas en desarrollo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}