import React, { useState, useEffect, useCallback } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip 
} from 'recharts';

import fondoJardin from './fondo-jardin.jpg';

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

  // 🌟 ESTADOS NUEVOS PARA PERSONAL
  const [empleados, setEmpleados] = useState([]);
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);

  const [stats, setStats] = useState({ 
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: [] 
  });

  const [productos, setProductos] = useState([]);
  const [imagenArchivo, setImagenArchivo] = useState(null);
const [showModalEditar, setShowModalEditar] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  // EXTRACCIÓN DINÁMICA DE CATEGORÍAS
  const categoriasExistentes = [
    'Todas', 
    ...new Set(
      productos
        .map(p => p.nombre_categoria || p.categoria || p.category || '')
        .map(cat => cat.trim()) 
        .filter(cat => cat.length > 0) 
    )
  ];

  // 🌟 FUNCIÓN NUEVA: TRAER LA LISTA DE EMPLEADOS DESDE TU API
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

  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
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

  // CARGAR TODO AL CAMBIAR O INICIAR SESIÓN
  useEffect(() => {
    if (user) {
      fetchData();
      fetchEmpleados();
    }
  }, [user, fetchData, fetchEmpleados]);

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

    // Detectamos el ID correcto (id o _id)
    const idTarget = productoEditando.id || productoEditando._id;

    if (!idTarget) {
      alert("Error: El producto no tiene un identificador válido para editar.");
      return;
    }

    try {
      // Tomamos el valor de la categoría asegurando que no vaya vacío
      const categoriaTexto = productoEditando.categoria || productoEditando.nombre_categoria || productoEditando.category || '';

      const res = await fetch(`${API_BASE_URL}/flores/${idTarget}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: productoEditando.nombre,
          categoria: categoriaTexto,
          nombre_categoria: categoriaTexto, // Enviamos ambos por si tu backend lee uno u otro
          stock: Number(productoEditando.stock),
          precio: Number(productoEditando.precio)
        }),
      });

      if (res.ok) {
        // Actualizamos el estado local en React inmediatamente
        setProductos(prevProductos =>
          prevProductos.map(p => 
            String(p.id || p._id) === String(idTarget) ? { ...p, ...productoEditando, categoria: categoriaTexto, nombre_categoria: categoriaTexto } : p
          )
        );
        
        setShowModalEditar(false);
        setProductoEditando(null);
        alert('¡Flor actualizada correctamente!');
        
        // Refrescamos la tabla/mosaico de flores
        if (typeof fetchData === 'function') {
          fetchData();
        }
      } else {
        // Si el backend responde un error, intentamos leer qué dice para no mostrar "Error desconocido"
        const errorData = await res.json().catch(() => ({}));
        alert(`No se pudo actualizar en la base de datos: ${errorData.mensaje || errorData.error || 'Verifica los campos o los permisos del usuario.'}`);
      }
    } catch (error) {
      console.error("Error de red al intentar actualizar:", error);
      alert('Hubo un error de red al intentar conectar con el servidor de Render.');
    }
  };

  // 🌟 FUNCIÓN NUEVA: ENVIAR FORMULARIO DE NUEVO EMPLEADO AL BACKEND
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
        fetchEmpleados(); // Refresca la tabla automáticamente
        fetchData(); // Refresca los contadores de las tarjetas de arriba
      } else {
        alert(respuesta.mensaje || "Error al registrar empleado.");
      }
    } catch (error) {
      alert("Error de red al intentar registrar al empleado.");
    }
  };

  // 🌟 FUNCIÓN NUEVA: ELIMINAR UN TRABAJADOR DE LA BASE DE DATOS
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
          detalle: `Registrado hace ${diferenciaDias} días. Riesgo de marchitez.`
        });
      }
    });
    return alertas;
  };

  const productosFiltrados = productos.filter(p => {
    const pCat = p.nombre_categoria || p.categoria || p.category || '';
    const cumpleCategoria = filtroCategoria === 'Todas' || pCat.trim() === filtroCategoria;
    const cumpleBusqueda = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return cumpleCategoria && cumpleBusqueda;
  });

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
          
          {/* 🌟 ENLACE DE NAVEGACIÓN NUEVO EN EL MENÚ LATERAL */}
          <div onClick={() => { setActiveTab('personal'); setMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeTab === 'personal' ? 'bg-white/10 border border-white/10 font-bold' : 'opacity-60 hover:bg-white/5'}`}>
            <span className="text-lg">🧑‍💼</span> <span>Personal</span>
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

        {activeTab === 'inventario' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Inventario de Flores</h2>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {categoriasExistentes.map((cat) => (
                    <button 
                      key={cat} 
                      onClick={() => setFiltroCategoria(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${filtroCategoria === cat ? 'bg-[#1b4332] text-white border-[#1b4332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {cat}
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
                  
                  // ✅ Lógica limpia: usa la foto de la base de datos o una fija de respaldo
           

        // ✅ Lógica ultra limpia: Usa la URL directa de Cloudinary o la foto de respaldo si no hay imagen
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
                            // ✅ Cambiado para que no dependa de la función vieja y muestre el respaldo estático
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
                        
                        <div className="flex gap-3">
                          {/* ✏️ BOTÓN EDITAR */}
                          <button 
                            onClick={() => {
                              setProductoEditando(prod);
                              setShowModalEditar(true);
                            }} 
                            className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-all flex items-center gap-1"
                          >
                            ✏️ Editar
                          </button>

                          {/* 🗑️ BOTÓN ELIMINAR */}
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

        {/* 🌟 VISTA NUEVA: INTERFAZ COMPLETA DE PERSONAL */}
        {activeTab === 'personal' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Equipo de Trabajo</h2>
                <p className="text-gray-400 font-bold text-xs mt-1">Lista de empleados y administradores de la floristería.</p>
              </div>
              <button onClick={() => setShowModalEmpleado(true)} className="bg-[#42a5f5] hover:bg-[#1e88e5] text-white font-black text-xs uppercase tracking-widest p-4 px-6 rounded-full shadow-lg self-start sm:self-auto">
                + Registrar Empleado
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xs overflow-hidden p-6 md:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-gray-500">
                  <thead>
                    <tr className="uppercase border-b border-gray-100 text-[10px] tracking-widest text-gray-400">
                      <th className="p-4 pl-2">Nombre</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Cargo / Rol</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {empleados.length > 0 ? empleados.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-2 font-black text-gray-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black uppercase text-xs">
                            {emp.nombre?.charAt(0)}
                          </div>
                          {emp.nombre}
                        </td>
                        <td className="p-4 font-medium text-gray-500">{emp.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${emp.rol === 'admin' ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {emp.rol}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleEliminarEmpleado(emp.id)} 
                            className="text-xs font-bold text-gray-400 hover:text-red-500 transition-all uppercase"
                          >
                            🗑️ Dar de Baja
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-gray-400 font-bold">
                          No hay personal administrativo registrado actualmente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL FORMULARIO: AGREGAR FLOR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            
            {/* Botón para cerrar el modal */}
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
                  list="categorias-sugeridas" 
                  placeholder="Escribe para buscar o crea una nueva..." 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                />
                <datalist id="categorias-sugeridas">
                  {categoriasExistentes
                    .filter(cat => cat !== 'Todas' && cat.trim() !== '')
                    .map((cat, index) => (
                      <option key={index} value={cat} />
                    ))
                  }
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Cantidad Inicial *</label>
                  <input type="number" name="stock" required min="0" placeholder="45" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Precio Unitario ($) *</label>
                  <input type="number" name="precio" required min="0" placeholder="5000" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Subir Foto desde tu Computador</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImagenArchivo(e.target.files[0])} 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-gray-50 text-gray-700 font-semibold focus:ring-2 ring-emerald-200 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#1b4332] file:text-white"
                />
              </div>

              <button type="submit" className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white p-4 rounded-full font-black uppercase tracking-widest mt-4 shadow-md transition-all">
                Guardar Flor en la Nube
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORMULARIO: REGISTRAR EMPLEADO */}
      {showModalEmpleado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            <button onClick={() => setShowModalEmpleado(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold">✖️</button>
            <h3 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter mb-5">Registrar Personal</h3>
            
            <form onSubmit={handleCrearEmpleado} className="space-y-4 text-xs font-bold text-gray-500">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Nombre Completo *</label>
                <input type="text" name="emp_nombre" required placeholder="Ej. Jhojan Pérez" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider">Correo Electrónico *</label>
                <input type="email" name="emp_email" required placeholder="empleado@floristeriva.com" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider">Contraseña de Acceso *</label>
                <input type="password" name="emp_password" required placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider">Rol / Cargo *</label>
                <select name="emp_rol" className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white text-gray-700 font-semibold focus:ring-2 ring-emerald-200">
                  <option value="vendedor">Vendedor / Personal</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#42a5f5] hover:bg-[#1e88e5] text-white p-4 rounded-full font-black uppercase tracking-widest mt-4 shadow-md transition-all">
                Registrar Empleado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 NUEVO MODAL FORMULARIO: EDITAR PRODUCTO EXISTENTE */}
      {showModalEditar && productoEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl relative">
            
            {/* Botón para cerrar el modal */}
            <button 
              onClick={() => { setShowModalEditar(false); setProductoEditando(null); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
            >
              ✖️
            </button>

            <h3 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter mb-5">Editar Flor</h3>
            
            <form onSubmit={handleActualizarProducto} className="space-y-4 text-xs font-bold text-gray-500">
              <div>
                <label className="block mb-1 uppercase tracking-wider">Nombre del Producto *</label>
                <input 
                  type="text" 
                  value={productoEditando.nombre || ''} 
                  onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})}
                  required 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Categoría *</label>
                <input 
                  type="text" 
                  value={productoEditando.nombre_categoria || productoEditando.categoria || productoEditando.category || ''} 
                  onChange={(e) => setProductoEditando({...productoEditando, categoria: e.target.value, nombre_categoria: e.target.value})}
                  required 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Stock Actual *</label>
                  <input 
                    type="number" 
                    value={productoEditando.stock ?? 0} 
                    onChange={(e) => setProductoEditando({...productoEditando, stock: e.target.value})}
                    required 
                    min="0" 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Precio Unitario ($) *</label>
                  <input 
                    type="number" 
                    value={productoEditando.precio ?? 0} 
                    onChange={(e) => setProductoEditando({...productoEditando, precio: e.target.value})}
                    required 
                    min="0" 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1b4332] text-white p-4 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-[#123023] mt-4"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}