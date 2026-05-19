import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip 
} from 'recharts';

import fondoJardin from './fondo-jardin.jpg';

// CONFIGURACIÓN DE TU BACKEND EN RENDER
const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

const formatCOP = (val) => new Intl.NumberFormat('es-CO', { 
  style: 'currency', 
  currency: 'COP', 
  minimumFractionDigits: 0 
}).format(Number(val) || 0);

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(window.sessionStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio'); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState({ 
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] 
  });

  // 🌟 CORREGIDO: El inventario ahora empieza vacío esperando los productos reales de tu base de datos
  const [productos, setProductos] = useState([]);

  // --- FUNCIÓN PARA CARGAR DATOS DE INICIO Y PRODUCTOS ---
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      // 1. Cargar Estadísticas generales
      const resStats = await fetch(`${API_BASE_URL}/stats`, {
        headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
      });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats({
          inventario: data.inventario || 0,
          personal: data.personal || 0,
          pedidosCount: data.pedidosCount || 0,
          ventasTotal: data.ventasTotal || 0,
          pedidosLista: Array.isArray(data.pedidosLista) ? data.pedidosLista : []
        });
      }

      // 2. Cargar Productos reales desde la Base de Datos
      const resProd = await fetch(`${API_BASE_URL}/productos`, {
        headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
      });
      if (resProd.ok) {
        const listaProd = await resProd.json();
        setProductos(Array.isArray(listaProd) ? listaProd : []);
      }
    } catch (e) {
      console.error("Error cargando datos del servidor:", e);
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
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA PARA AÑADIR PRODUCTO REAL AL BACKEND ---
  const handleAgregarProducto = async (e) => {
    e.preventDefault();
    const nuevoProducto = {
      nombre: e.target[0].value,
      categoria: e.target[1].value,
      stock: Number(e.target[2].value),
      precio: Number(e.target[3].value),
      imagen: e.target[4].value || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=500',
      fechaIngreso: e.target[5].value
    };

    try {
      const res = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (res.ok) {
        // Si el backend lo guarda con éxito, recargamos la lista actualizada
        fetchData();
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.mensaje || "Error al guardar el producto");
      }
    } catch (error) {
      alert("Error de conexión al intentar añadir el producto.");
    }
  };

  // --- 🌟 LÓGICA CONECTADA PARA ELIMINAR DE LA BASE DE DATOS REAL ---
  const handleEliminarProducto = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto permanentemente de la base de datos?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/productos/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          // Si el servidor lo borró correctamente, actualizamos el estado visual de inmediato
          setProductos(productos.filter(p => p.id !== id || p._id !== id));
          fetchData(); // Sincroniza métricas del inicio
        } else {
          alert("El servidor no permitió borrar el producto. Revisa los permisos.");
        }
      } catch (error) {
        alert("Error de conexión al intentar eliminar el producto.");
      }
    }
  };

  // Alertas de frescura basadas en la fecha de ingreso
  const obtenerAlertasFrescura = () => {
    const alertas = [];
    const hoy = new Date();
    productos.forEach(p => {
      if (p.categoria === 'Flores Sueltas' || p.categoria === 'Ramos') {
        const fechaRef = p.fechaIngreso || p.createdAt;
        if (!fechaRef) return;
        const ingreso = new Date(fechaRef);
        const diferenciaDias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
        if (diferenciaDias >= 4) {
          alertas.push({
            id: p.id || p._id,
            mensaje: `${p.nombre} - Verificar lote`,
            detalle: `Registrado hace ${diferenciaDias} días. Riesgo de marchitez.`
          });
        }
      }
    });
    return alertas;
  };

  // Filtrado
  const productosFiltrados = productos.filter(p => {
    const cumpleCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const cumpleBusqueda = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${fondoJardin})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <style>{`@keyframes bE { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(20px); } } .animate-bounce-emoji { animation: bE 2s infinite ease-in-out; }`}</style>
        <form className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center" onSubmit={handleLogin}>
          <div className="flex justify-center mb-4 text-6xl animate-bounce-emoji select-none">🌸</div>
          <h2 className="text-4xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Floristería</h2>
          <p className="text-xs font-bold text-gray-500 mb-8 tracking-wide">¡El jardín de tus sueños está a un paso!</p>
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

  return (
    <div className="min-h-screen bg-[#eef3f7] flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      
      <style>{`
        @media (max-width: 767px) {
          .menu-lateral-adaptable { position: fixed !important; transform: ${menuOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; z-index: 40 !important; height: 100vh !important; }
          .boton-hamburguesa { display: block !important; }
          .contenido-principal { padding-top: 5rem !important; }
        }
        @media (min-width: 768px) {
          .menu-lateral-adaptable { position: static !important; transform: none !important; height: auto !important; }
          .boton-hamburguesa { display: none !important; }
        }
      `}</style>
      
      <button onClick={() => setMenuOpen(!menuOpen)} className="boton-hamburguesa hidden fixed top-4 left-4 z-50 bg-[#1b4332] text-white p-3 rounded-2xl shadow-lg text-xl">
        {menuOpen ? '✖️' : '☰'}
      </button>

      {menuOpen && <div onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-30 transition-all" />}

      <aside className="menu-lateral-adaptable w-64 bg-[#1b4332] text-white flex flex-col shadow-2xl inset-y-0 left-0 transition-transform duration-300 ease-in-out flex-shrink-0">
        <div className="p-8 pt-20 md:pt-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Floristería</h1>
          <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Gestión Profesional</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div onClick={() => { setActiveTab('inicio'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'inicio' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">🏠</span> <span>Inicio</span>
          </div>
          <div onClick={() => { setActiveTab('inventario'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'inventario' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">📦</span> <span>Inventario</span>
          </div>
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-black text-white uppercase">{user.nombre?.charAt(0)}</div>
            <div>
              <p className="text-sm font-black leading-none">{user.nombre}</p>
              <p className="text-[10px] text-green-400 font-bold uppercase mt-1">Administrador</p>
            </div>
          </div>
          <button onClick={() => { window.sessionStorage.clear(); setUser(null); }} className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all font-bold text-sm">🚪 Salir</button>
        </div>
      </aside>

      <main className="contenido-principal flex-1 p-6 md:p-10 overflow-y-auto w-full">
        
        {activeTab === 'inicio' && (
          <div>
            <header className="mb-8">
              <h2 className="text-3xl md:text-5xl font-black text-[#1b4332] tracking-tighter">¡Bienvenido, {user.nombre}!</h2>
              <p className="text-gray-400 font-bold mt-1">Resumen de hoy.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-white shadow-xs">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Pedidos</p>
                <h3 className="text-2xl font-black text-emerald-600">{stats.pedidosCount}</h3>
              </div>
              <div className="bg-pink-50 p-6 rounded-[2.5rem] border border-white shadow-xs">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Ventas</p>
                <h3 className="text-2xl font-black text-pink-600">{formatCOP(stats.ventasTotal)}</h3>
              </div>
              <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-white shadow-xs">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Stock</p>
                <h3 className="text-2xl font-black text-orange-600">{stats.inventario}</h3>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-white shadow-xs">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Personal</p>
                <h3 className="text-2xl font-black text-blue-600">{stats.personal}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-xs border border-gray-100 overflow-hidden">
                <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest mb-6">Ventas Semanales</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{d:'L',v:0}, {d:'M',v:0}, {d:'X',v:0}, {d:'J',v:0}, {d:'V',v:0}, {d:'S',v:0}, {d:'Hoy',v:stats.ventasTotal}]}>
                      <defs><linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:'bold', fill:'#94a3b8'}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorV)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] shadow-xs border border-gray-100">
                <h4 className="font-black text-[#1b4332] uppercase text-xs tracking-widest mb-6">Pedidos Recientes</h4>
                <div className="space-y-4">
                  {stats.pedidosLista.length > 0 ? stats.pedidosLista.map((p, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase">#{String(p.id || p._id).substring(0,5)}</p>
                        <p className="text-sm font-black text-gray-700">{p.cliente}</p>
                      </div>
                      <p className="text-sm font-black text-emerald-600">{formatCOP(p.total)}</p>
                    </div>
                  )) : <p className="text-center text-gray-400 text-xs font-bold py-10">No hay pedidos registrados</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 📦 PESTAÑA DE INVENTARIO CONECTADO --- */}
        {activeTab === 'inventario' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Inventario de Flores</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Todas', 'Flores Sueltas', 'Ramos', 'Plantas', 'Insumos'].map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => setFiltroCategoria(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filtroCategoria === cat ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      [ {cat} ]
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Buscar flor o producto..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-3 px-5 rounded-full bg-white border border-gray-200 text-sm font-medium outline-none focus:ring-2 ring-emerald-200 w-full md:w-64 shadow-xs"
                />
                <button onClick={() => setShowModal(true)} className="bg-[#f06292] hover:bg-[#ec407a] text-white font-black text-xs uppercase tracking-widest p-4 px-6 rounded-full shadow-lg flex-shrink-0">
                  + Añadir Producto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productosFiltrados.length > 0 ? productosFiltrados.map((prod) => {
                  let badgeColor = 'bg-emerald-500';
                  let badgeText = 'Disponible';
                  if (prod.stock === 0) { badgeColor = 'bg-gray-400'; badgeText = 'Agotado'; }
                  else if (prod.stock <= 5) { badgeColor = 'bg-orange-500'; badgeText = 'Stock Bajo'; }

                  const prodId = prod._id || prod.id;

                  return (
                    <div key={prodId} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="relative h-44 bg-gray-100">
                        <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                        <span className={`absolute top-3 right-3 text-[10px] text-white font-black uppercase px-3 py-1 rounded-full ${badgeColor}`}>
                          [ {badgeText} ]
                        </span>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-gray-800 text-lg leading-tight mb-1">{prod.nombre}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.categoria}</p>
                          <p className="text-xs text-gray-500 font-bold mt-2">Stock: <span className="text-gray-700 font-black">[{prod.stock} und]</span></p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-50">
                          <span className="text-xl font-black text-[#1b4332]">{formatCOP(prod.precio)}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEliminarProducto(prodId)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-all">🗑️ Eliminar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-bold text-sm">Tu inventario está vacío.</p>
                    <p className="text-gray-300 text-xs mt-1">Usa el botón "+ Añadir Producto" para registrar tus flores reales.</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xs h-fit space-y-4">
                <h4 className="font-black text-[#1b4332] text-xs uppercase tracking-widest flex items-center gap-2">
                  ⚠️ Alertas de Frescura
                </h4>
                <div className="space-y-3">
                  {obtenerAlertasFrescura().length > 0 ? obtenerAlertasFrescura().map((alerta) => (
                    <div key={alerta.id} className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100 text-xs">
                      <p className="font-black text-orange-700 mb-1">🔸 {alerta.mensaje}</p>
                      <p className="text-gray-500 font-semibold leading-snug">{alerta.detalle}</p>
                    </div>
                  )) : (
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs">
                      <p className="font-black text-emerald-700">✅ Todo Fresco</p>
                      <p className="text-gray-400 font-medium mt-1">Ninguna flor supera el tiempo crítico en vitrina.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* --- MODAL FORMULARIO REAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <h3 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter mb-5">Agregar Nueva Flor</h3>
            
            <form onSubmit={handleAgregarProducto} className="space-y-4 text-xs font-bold text-gray-500">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Nombre del Producto *</label>
                <input type="text" required placeholder="Ej. Tulipanes Holandeses" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Categoría *</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200 bg-white">
                  <option value="Flores Sueltas">Flores Sueltas</option>
                  <option value="Ramos">Ramos</option>
                  <option value="Plantas">Plantas</option>
                  <option value="Insumos">Insumos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Cantidad Inicial *</label>
                  <input type="number" required min="0" placeholder="45" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Precio Unitario ($) *</label>
                  <input type="number" required min="0" placeholder="5000" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Enlace / URL de la Foto (Color)</label>
                <input type="url" placeholder="https://images.unsplash.com/photo-..." className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Fecha de Ingreso *</label>
                <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="p-3 px-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 uppercase font-black tracking-wider text-[10px]">Cancelar</button>
                <button type="submit" className="p-3 px-6 rounded-full bg-[#1b4332] hover:bg-[#112a1f] text-white uppercase font-black tracking-wider text-[10px]">Guardar en Inventario</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}