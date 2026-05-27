import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip 
} from 'recharts';

import fondoJardin from './fondo-jardin.jpg';
import Personal from './components/Personal';
import Pedidos from './components/Pedidos';
import Categorias from './components/categorias';
import Proveedores from './components/Proveedores'; 

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

  // 🌟 ESTADOS PARA PERSONAL Y CATEGORÍAS REALES DE BD
  const [empleados, setEmpleados] = useState([]);
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);
  const [categoriasBD, setCategoriasBD] = useState([]); 

  const [stats, setStats] = useState({ 
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] 
  });

  const [productos, setProductos] = useState([]);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // 🌟 Cargar categorías directamente desde la Base de Datos
  const fetchCategoriasBD = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categorias`);
      if (res.ok) {
        const datos = await res.json();
        setCategoriasBD(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error("Error cargando categorías reales de la BD:", error);
    }
  }, []);

  // 🌟 FUNCIÓN TRABAJADORES
  const fetchEmpleados = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/personal`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const datos = await res.json();
        setEmpleados(Array.isArray(datos) ? datos : []);
      }
    } catch (error) {
      console.error("Error cargando lista de personal:", error);
    }
  }, [user]);

  // 🌟 REFRESH AUTOMÁTICO DE CONTADORES Y TABLA DE PEDIDOS (DASHBOARD)
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      // Agregamos un timestamp para forzar a Render a darnos datos frescos sin caché de navegador
      const resStats = await fetch(`${API_BASE_URL}/stats?t=${new Date().getTime()}`, {
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

      const resProd = await fetch(`${API_BASE_URL}/flores`, {
        headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' }
      });
      if (resProd.ok) {
        const listaProd = await resProd.json();
        setProductos(Array.isArray(listaProd) ? listaProd : []);
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  }, [user]);

  // SINCRO GENERAL AL INICIAR SESIÓN
  useEffect(() => {
    if (user) {
      fetchData();
      fetchEmpleados();
      fetchCategoriasBD(); 
    }
  }, [user, fetchData, fetchEmpleados, fetchCategoriasBD]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

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

  const handlebgAgregarProducto = async (e) => {
    // Alias para compatibilidad de funciones
    handleAgregarProducto(e);
  };

  const handleAgregarProducto = async (e) => {
    e.preventDefault();
    
    const nombreInput = e.target.elements.nombre.value;
    const categoriaInput = e.target.elements.categoria.value;
    const stockInput = e.target.elements.stock.value;
    const precioInput = e.target.elements.precio.value;
    const fechaIngresoInput = e.target.elements.fechaIngreso?.value || new Date().toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('nombre', nombreInput);
    formData.append('categoria', categoriaInput);
    formData.append('stock', Number(stockInput));
    formData.append('precio', Number(precioInput));
    formData.append('fechaIngreso', fechaIngresoInput);

    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/flores/crear`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (res.ok) {
        setImagenArchivo(null); 
        fetchData();
        fetchCategoriasBD(); 
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.mensaje || "Error al guardar el producto");
      }
    } catch (error) {
      alert("Error de conexión al guardar.");
    }
  };

  const handleEliminarProducto = async (idTarget) => {
    if (!idTarget) {
      alert("Error: El producto no tiene un identificador válido.");
      return;
    }

    if (window.confirm("¿Seguro que deseas eliminar este producto permanentemente?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/flores/${idTarget}`, { 
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          setProductos(prevProductos => 
            prevProductos.filter(p => String(p.id || p._id) !== String(idTarget))
          );
          setFiltroCategoria('Todas');
          fetchData(); 
        } else {
          alert("No se pudo eliminar de la base de datos.");
        }
      } catch (error) {
        console.error("Error de red al intentar eliminar:", error);
      }
    }
  };

  const handleActualizarProducto = async (e) => {
    e.preventDefault();
    if (!productoEditando) return;

    const idTarget = productoEditando.id || productoEditando._id;
    if (!idTarget) {
      alert("Error: El producto no tiene un identificador válido.");
      return;
    }

    const datosEnviar = {
      nombre: productoEditando.nombre,
      stock: Number(productoEditando.stock),
      precio: Number(productoEditando.precio)
    };

    try {
      const res = await fetch(`${API_BASE_URL}/productos/${idTarget}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnviar),
      });

      if (res.ok) {
        setProductos(prevProductos =>
          prevProductos.map(p => 
            String(p.id || p._id) === String(idTarget) 
              ? { 
                  ...p, 
                  nombre: productoEditando.nombre,
                  stock: Number(productoEditando.stock),
                  precio: Number(productoEditando.precio)
                } 
              : p
          )
        );
        
        setShowModalEditar(false);
        setProductoEditando(null);
        alert('¡Flor actualizada correctamente en la base de datos!');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al guardar cambios: ${errorData.error || errorData.mensaje || 'Verifica los campos en el backend.'}`);
      }
    } catch (error) {
      console.error("Error de red al intentar actualizar:", error);
      alert('Error de conexión con el servidor de Render.');
    }
  };

  const handleCrearEmpleado = async (e) => {
    e.preventDefault();
    const nombre = e.target.elements.emp_nombre.value;
    const email = e.target.elements.emp_email.value;
    const password = e.target.elements.emp_password.value;
    const rol = e.target.elements.emp_rol.value;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/crear-personal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, password, rol })
      });

      const respuesta = await res.json();

      if (res.ok) {
        alert(respuesta.mensaje || "✅ Empleado registrado correctamente.");
        setShowModalEmpleado(false);
        e.target.reset();
        fetchEmpleados();
        fetchData();
      } else {
        alert(respuesta.mensaje || "Error al registrar empleado.");
      }
    } catch (error) {
      alert("Error de red al intentar registrar al empleado.");
    }
  };

  const handleEliminarEmpleado = async (idEmpleado) => {
    if (window.confirm("¿Estás seguro de que deseas dar de baja a este empleado?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/usuarios/personal/${idEmpleado}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          alert("✅ Empleado eliminado del sistema.");
          fetchEmpleados();
          fetchData();
        } else {
          alert("No se pudo eliminar al empleado.");
        }
      } catch (error) {
        console.error("Error al eliminar personal:", error);
      }
    }
  };

  const obtenerAlertasFrescura = () => {
    const alertas = [];
    const hoy = new Date();
    productos.forEach(p => {
      const fechaRef = p.fecha_ingreso || p.fechaIngreso || p.createdAt;
      if (!fechaRef) return;
      const ingreso = new Date(fechaRef);
      const diferenciaDias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
      if (diferenciaDias >= 4) {
        alertas.push({
          id: p.id || p._id,
          mensaje: `${p.nombre} - Verificar lote`,
          text: `Registrado hace ${diferenciaDias} días. Riesgo de marchitez.`
        });
      }
    });
    return alertas;
  };

  // FILTRADO INTELIGENTE
  const productosFiltrados = productos.filter(p => {
    const pCat = p.nombre_categoria || p.categoria || p.category || '';
    const cumpleCategoria = filtroCategoria === 'Todas' || pCat.trim().toLowerCase() === filtroCategoria.toLowerCase();
    const cumpleBusqueda = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
  });

  // --- RENDERIZADO CONDICIONAL DE LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${fondoJardin})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <form className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center" onSubmit={handleLogin}>
          <div className="flex justify-center mb-4 text-6xl select-none">🌸</div>
          <h2 className="text-4xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Floristería</h2>
          <p className="text-xs font-bold text-gray-500 mb-8 tracking-wide">¡El jardín de tus sueños está a un paso!</p>
          <div className="space-y-4">
            <input type="email" name="email" placeholder="Correo electrónico" required className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold" />
            <input type="password" name="password" placeholder="Contraseña" required className="w-full p-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 ring-pink-200 font-semibold" />
            <button disabled={loading} className="w-full bg-[#d81b60] text-white p-5 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#ad1457] mt-4 disabled:bg-gray-400">
              {loading ? 'Entrando...' : 'Entrar al Jardín'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- RENDERIZADO PANEL DE CONTROL ---
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
          .contenido-principal { padding-top: 0 !important; }
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
          <div onClick={() => { setActiveTab('inicio'); setMenuOpen(false); fetchData(); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'inicio' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">🏠</span> <span>Inicio</span>
          </div>
          <div onClick={() => { setActiveTab('inventario'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'inventario' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">📦</span> <span>Inventario</span>
          </div>
          <div onClick={() => { setActiveTab('personal'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'personal' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">🧑‍💼</span> <span>Personal</span>
          </div>
          <div onClick={() => { setActiveTab('pedidos'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'pedidos' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">🧾</span> <span>Pedidos</span>
          </div>
          <div onClick={() => { setActiveTab('categorias'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'categorias' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">📂</span> <span>Categorías</span>
          </div>
          {/* 🌟 NUEVA PESTAÑA DE PROVEEDORES */}
  <div onClick={() => { setActiveTab('proveedores'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'proveedores' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
    <span className="text-lg">🤝</span> <span>Proveedores</span>
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
                        {/* 🌟 CORREGIDO: Muestra 'nombre' o 'cliente' dinámico del backend sin congelarse */}
                        <p className="text-sm font-black text-gray-700">{p.nombre || p.cliente}</p>
                      </div>
                      <p className="text-sm font-black text-emerald-600">{formatCOP(p.total)}</p>
                    </div>
                  )) : <p className="text-center text-gray-400 text-xs font-bold py-10">No hay pedidos registrados</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventario' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Inventario de Flores</h2>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <button 
                    onClick={() => setFiltroCategoria('Todas')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filtroCategoria === 'Todas' ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    Todas las Flores
                  </button>
                  
                  {categoriasBD.map((cat) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setFiltroCategoria(cat.nombre)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filtroCategoria.toLowerCase() === cat.nombre.toLowerCase() ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {cat.nombre}
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

                  const prodId = prod.id || prod._id;
                  const displayCat = prod.nombre_categoria || prod.categoria || prod.category || 'General';
                  
                  const urlFotoReal = prod.imagen_url || prod.imagen || prod.foto;
                  const imagenSrc = urlFotoReal || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600';

                  return (
                    <div key={prodId} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="relative h-44 bg-gray-50">
                        <img 
                          src={imagenSrc} 
                          alt={prod.nombre} 
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600'; 
                          }} 
                        />
                        <span className={`absolute top-3 right-3 text-[10px] text-white font-black uppercase px-3 py-1 rounded-full ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-gray-800 text-lg leading-tight mb-1">{prod.nombre}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{displayCat}</p>
                          <p className="text-xs text-gray-500 font-bold mt-2">Stock: <span className="text-gray-700 font-black">{prod.stock} und</span></p>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={() => {
                              setProductoEditando(prod);
                              setShowModalEditar(true);
                            }} 
                            className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-all flex items-center gap-1"
                          >
                            ✏️ Editar
                          </button>

                          <button 
                            onClick={() => handleEliminarProducto(prodId)} 
                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-all flex items-center gap-1"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full bg-white p-12 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                    <p className="text-gray-400 font-bold text-sm">No hay productos en esta categoría o tu inventario está vacío.</p>
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
                      <p className="text-gray-500 font-semibold leading-snug">{alerta.text}</p>
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

        {/* 🌟 SECCIÓN COMPONENTES: Inyección de la función re-fetch para limpiar la vista */}
        {activeTab === 'personal' && <Personal user={user} API_BASE_URL={API_BASE_URL} onPersonalCambiado={fetchData} />}
        {activeTab === 'pedidos' && <Pedidos user={user} API_BASE_URL={API_BASE_URL} onPedidoCreado={fetchData} />}
        {activeTab === 'categorias' && <Categorias user={user} API_BASE_URL={API_BASE_URL} onCategoriasCambiadas={fetchCategoriasBD} />}
        {activeTab === 'proveedores' && <Proveedores user={user} API_BASE_URL={API_BASE_URL} />}

      </main>

      {/* MODAL FORMULARIO: AGREGAR FLOR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold">✖️</button>

            <h3 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter mb-5">Agregar Nueva Flor</h3>
            
            <form onSubmit={handleAgregarProducto} className="space-y-4 text-xs font-bold text-gray-500">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Nombre del Producto *</label>
                <input type="text" name="nombre" required placeholder="Ej. Rosa Azul o Girasol Gigante" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Categoría *</label>
                <input 
                  type="text" 
                  name="categoria"
                  required 
                  list="categorias-sugeridas-bd" 
                  placeholder="Selecciona o escribe una colección..." 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                />
                <datalist id="categorias-sugeridas-bd">
                  {categoriasBD.map((cat) => (
                    <option key={cat.id} value={cat.nombre} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Cantidad Inicial *</label>
                  <input type="number" name="stock" required min="0" placeholder="45" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Precio Unitario (COP) *</label>
                  <input type="number" name="precio" required min="0" placeholder="5000" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Fotografía del Lote</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImagenArchivo(e.target.files[0])} 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#1b4332] hover:file:bg-emerald-100" 
                />
              </div>

              <button type="submit" className="w-full bg-[#1b4332] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#2d6a4f] mt-4">
                Guardar en Inventario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUCTO */}
      {showModalEditar && productoEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => { setShowModalEditar(false); setProductoEditando(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
            >
              ✖️
            </button>

            <h3 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter mb-5">Editar Flor</h3>
            
            <form onSubmit={handleActualizarProducto} className="space-y-4 text-xs font-bold text-gray-500">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Nombre del Producto</label>
                <input 
                  type="text" 
                  required
                  value={productoEditando.nombre} 
                  onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Stock Disponible</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={productoEditando.stock} 
                    onChange={(e) => setProductoEditando({...productoEditando, stock: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Precio Unitario (COP)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={productoEditando.precio} 
                    onChange={(e) => setProductoEditando({...productoEditando, precio: e.target.value})}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1b4332] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#2d6a4f] mt-4">
                Actualizar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}