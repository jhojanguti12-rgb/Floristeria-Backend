import React, { useState, useEffect } from 'react';

const Pedidos = ({ user, API_BASE_URL }) => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // 📝 Estados para el Modal de registrar nueva compra/pedido
  const [mostrarModal, setMostrarModal] = useState(false);
  const [listaFloresBD, setListaFloresBD] = useState([]); // Almacena el inventario de la BD
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [dedicatoria, setDedicatoria] = useState('');
  const [itemsSeleccionados, setItemsSeleccionados] = useState([{ id_flor: '', cantidad: 1, precio: 0 }]);

  // 🔄 Cargar la lista de pedidos al montar el componente
  useEffect(() => {
    fetchPedidos();
    fetchInventarioFlores();
  }, []);

  // 📋 1. GET al Backend para obtener la lista de órdenes optimizada para Admin
  const fetchPedidos = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/pedidos/admin/lista`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setPedidos(data);
      } else {
        console.error("Error del servidor:", data.error);
      }
    } catch (error) {
      console.error("Error de red al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  // 💐 Auxiliar: Traer flores disponibles para cargarlas en el selector del modal
  const fetchInventarioFlores = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/flores`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) setListaFloresBD(data);
    } catch (error) {
      console.error("Error al traer catálogo de flores para el formulario:", error);
    }
  };

  // 🔍 2. GET al seleccionar un pedido para traer el desglose de sus flores/arreglos
  const handleSeleccionarPedido = async (pedido) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/admin/detalle/${pedido.id}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${user?.token}` 
        }
      });
      const floresData = await res.json();
      
      if (res.ok) {
        setPedidoSeleccionado({ ...pedido, flores: floresData });
      } else {
        setPedidoSeleccionado({ ...pedido, flores: [] });
      }
    } catch (error) {
      console.error("Error al traer detalles del pedido:", error);
      setPedidoSeleccionado({ ...pedido, flores: [] });
    }
  };

  // ⚙️ 3. PUT al Backend para cambiar el estado logístico de la orden (Select en la tabla)
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos/admin/cambiar-estado/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      const data = await res.json();

      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
        if (pedidoSeleccionado && pedidoSeleccionado.id === id) {
          setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // ➕ Controladores para manejar filas dinámicas de flores en el modal de compras
  const agregarFilaFlor = () => {
    setItemsSeleccionados([...itemsSeleccionados, { id_flor: '', cantidad: 1, precio: 0 }]);
  };

  const eliminarFilaFlor = (index) => {
    if (itemsSeleccionados.length === 1) return;
    setItemsSeleccionados(itemsSeleccionados.filter((_, i) => i !== index));
  };

  const handleCambioFlor = (index, idFlor) => {
    const florEncontrada = listaFloresBD.find(f => f.id === Number(idFlor));
    const nuevasFilas = [...itemsSeleccionados];
    nuevasFilas[index].id_flor = idFlor;
    nuevasFilas[index].precio = florEncontrada ? Number(florEncontrada.precio) : 0;
    setItemsSeleccionados(nuevasFilas);
  };

  const handleCambioCantidad = (index, cant) => {
    const nuevasFilas = [...itemsSeleccionados];
    nuevasFilas[index].cantidad = Math.max(1, Number(cant));
    setItemsSeleccionados(nuevasFilas);
  };

  // 💰 Calcular el total de la compra automáticamente
  const calcularTotalCompra = () => {
    return itemsSeleccionados.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  };

  // 💾 POST: Guardar la nueva venta/pedido en la Base de Datos
  const handleGuardarCompra = async (e) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado al menos una flor válida
    const floresValidas = itemsSeleccionados.filter(item => item.id_flor !== '');
    if (floresValidas.length === 0) {
      alert("Debes seleccionar al menos un tipo de flor para registrar la venta.");
      return;
    }

    const payload = {
      cliente: cliente.trim(),
      telefono_contacto: telefono.trim(),
      direccion_entrega: direccion.trim() || 'Recoge en tienda física',
      dedicatoria: dedicatoria.trim(),
      total: calcularTotalCompra(),
      flores: floresValidas
    };

    try {
// ✅ CÁMBIALO PARA QUE QUEDE ASÍ:
const res = await fetch(`${API_BASE_URL}/pedidos`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${user?.token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

      const data = await res.json();

      if (res.ok) {
        alert("¡Compra y Pedido registrados exitosamente!");
        setMostrarModal(false);
        // Limpiar el formulario
        setCliente(''); setTelefono(''); setDireccion(''); setDedicatoria('');
        setItemsSeleccionados([{ id_flor: '', cantidad: 1, precio: 0 }]);
        // Recargar la tabla principal
        fetchPedidos();
      } else {
        alert(`Error al registrar venta: ${data.error}`);
      }
    } catch (error) {
      console.error("Error de red al guardar compra:", error);
      alert("Hubo un problema de red al procesar la venta.");
    }
  };

  // Filtrar la lista en pantalla según el botón presionado
  const pedidosFiltrados = filtroEstado === 'Todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroEstado);

  if (cargando) {
    return <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest animate-pulse">⏳ Cargando panel de pedidos en tiempo real...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con Botón Flotante de Registro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Gestión de Pedidos</h2>
          <p className="text-gray-400 font-bold text-xs mt-1">Monitorea compras, despacha flores y gestiona las dedicatorias de las tarjetas de regalo.</p>
        </div>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md self-start md:self-center"
        >
          ➕ Registrar Compra / Venta
        </button>
      </div>

      {/* Barra de Filtros por Estado */}
      <div className="flex flex-wrap gap-2">
        {['Todos', 'Pendiente', 'En Preparacion', 'En Camino', 'Entregado'].map((est) => (
          <button
            key={est}
            onClick={() => setFiltroEstado(est)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              filtroEstado === est 
                ? 'bg-[#1b4332] text-white shadow-md' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {est === 'En Preparacion' ? '⚙️ En Preparación' : est === 'En Camino' ? '🚚 En Camino' : est === 'Entregado' ? '✅ Entregado' : est === 'Pendiente' ? '⏳ Pendientes' : '📋 Todos'}
          </button>
        ))}
      </div>

      {/* Contenedor Principal (2 Columnas dinámicas) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Tabla de Pedidos */}
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-xs overflow-hidden ${pedidoSeleccionado ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="uppercase border-b border-gray-100 text-[10px] tracking-widest text-gray-400">
                  <th className="p-4 pl-2">ID Orden</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Estado Logístico</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {pedidosFiltrados.length > 0 ? pedidosFiltrados.map((ped) => (
                  <tr 
                    key={ped.id} 
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${pedidoSeleccionado?.id === ped.id ? 'bg-emerald-50/40' : ''}`}
                    onClick={() => handleSeleccionarPedido(ped)}
                  >
                    <td className="p-4 pl-2 font-black text-[#1b4332]">#{ped.id}</td>
                    <td className="p-4 font-bold text-gray-800">{ped.cliente}</td>
                    <td className="p-4 text-gray-400 text-xs font-medium">
                      {new Date(ped.fecha).toLocaleString()}
                    </td>
                    <td className="p-4 font-black text-gray-900">${Number(ped.total).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        ped.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                        ped.estado === 'En Preparacion' ? 'bg-blue-100 text-blue-700' :
                        ped.estado === 'En Camino' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ped.estado === 'En Preparacion' ? 'En Preparación' : ped.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ped.estado}
                        onChange={(e) => handleCambiarEstado(ped.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-[11px] font-bold text-gray-600 outline-none focus:border-[#1b4332]"
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="En Preparacion">⚙️ En Preparación</option>
                        <option value="En Camino">🚚 En Camino</option>
                        <option value="Entregado">✅ Entregado</option>
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400 font-bold">No hay pedidos registrados en este estado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjeta de Detalles Lateral */}
        {pedidoSeleccionado && (
          <div className="bg-gray-50 border border-gray-200/60 rounded-[2.5rem] p-6 space-y-6 max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1b4332]">Detalle Orden #{pedidoSeleccionado.id}</h3>
                <p className="text-gray-400 text-[11px] font-bold">Información de despacho física</p>
              </div>
              <button 
                onClick={() => setPedidoSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600 font-black text-sm bg-gray-200/50 w-7 h-7 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">📍 Dirección de Entrega</span>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{pedidoSeleccionado.direccion_entrega}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">📞 Teléfono del Destinatario</span>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{pedidoSeleccionado.telefono_contacto}</p>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">💌 Mensaje / Dedicatoria de la Tarjeta:</span>
              <p className="text-xs italic font-semibold text-emerald-900 bg-white p-3 rounded-xl border border-emerald-100/50 shadow-2xs">
                "{pedidoSeleccionado.dedicatoria || 'El cliente no solicitó tarjeta de regalo.'}"
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">💐 Flores incluidas en la orden:</span>
              <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 p-3">
                {pedidoSeleccionado.flores && pedidoSeleccionado.flores.length > 0 ? (
                  pedidoSeleccionado.flores.map((f, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-xs font-bold text-gray-700">
                      <div>
                        <span>{f.nombre}</span>
                        <span className="text-gray-400 font-medium ml-2">x{f.cantidad}</span>
                      </div>
                      <span className="text-gray-900 font-black">${Number(f.precio).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-2 text-center">Buscando productos de la orden...</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-xs font-black text-gray-500 uppercase">Total Cobrado:</span>
              <span className="text-xl font-black text-[#1b4332]">${Number(pedidoSeleccionado.total).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 VENTANA EMERGENTE (MODAL) PARA REGISTRAR NUEVA COMPRA DESDE TIENDA FISICA */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-gray-100 space-y-6 shadow-2xl">
            
            {/* Cabecera del modal */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">Nueva Nota de Venta</h3>
                <p className="text-gray-400 text-xs font-bold">Registra los datos de facturación del cliente.</p>
              </div>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-black bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Formulario Principal */}
            <form onSubmit={handleGuardarCompra} className="space-y-4 text-xs font-bold text-gray-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Nombre del Cliente: *</label>
                  <input 
                    type="text" required placeholder="Ej. Juan Pérez" value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none font-semibold text-gray-700 focus:ring-2 ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider">Teléfono de Contacto: *</label>
                  <input 
                    type="tel" required placeholder="Ej. 3001234567" value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none font-semibold text-gray-700 focus:ring-2 ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Dirección de Despacho (Opcional):</label>
                <input 
                  type="text" placeholder="Ej. Calle 50 #24-12 (O dejar vacío si retira en local)" value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none font-semibold text-gray-700 focus:ring-2 ring-emerald-200"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider">Dedicatoria para la Tarjeta de Regalo:</label>
                <textarea 
                  rows="2" placeholder="Escribe el mensaje emotivo que llevará el arreglo..." value={dedicatoria}
                  onChange={(e) => setDedicatoria(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none font-semibold text-gray-700 focus:ring-2 ring-emerald-200 resize-none"
                />
              </div>

              {/* Sección Dinámica: Lista de Flores a Comprar */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px]">Flores seleccionadas para el arreglo</span>
                  <button 
                    type="button" onClick={agregarFilaFlor}
                    className="text-emerald-700 hover:text-emerald-900 font-black text-xs inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full"
                  >
                    🌿 Agregar otra flor
                  </button>
                </div>

                {itemsSeleccionados.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    
                    {/* Selector de Flor */}
                    <div className="flex-1 min-w-[180px]">
                      <label className="block mb-1 text-[10px] text-gray-400">Seleccionar Producto:</label>
                      <select
                        required value={item.id_flor}
                        onChange={(e) => handleCambioFlor(index, e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 text-xs"
                      >
                        <option value="">-- Elige una flor --</option>
                        {listaFloresBD.map(f => (
                          <option key={f.id} value={f.id}>{f.nombre} (${Number(f.precio).toLocaleString()})</option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div className="w-24">
                      <label className="block mb-1 text-[10px] text-gray-400">Cantidad:</label>
                      <input 
                        type="number" min="1" required value={item.cantidad}
                        onChange={(e) => handleCambioCantidad(index, e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 font-semibold text-gray-700 text-xs text-center bg-white"
                      />
                    </div>

                    {/* Subtotal Individual de la Fila */}
                    <div className="w-24 text-right pr-2">
                      <span className="block text-[10px] text-gray-400 mb-2">Subtotal:</span>
                      <span className="text-xs font-black text-gray-900">${(item.cantidad * item.precio).toLocaleString()}</span>
                    </div>

                    {/* Botón de Remover Fila */}
                    <button
                      type="button" onClick={() => eliminarFilaFlor(index)}
                      className="text-red-400 hover:text-red-600 font-black p-2 bg-white rounded-lg border border-gray-100 hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Panel de Cierre con el Total General */}
              <div className="flex justify-between items-center bg-[#1b4332]/5 p-4 rounded-2xl border border-[#1b4332]/10 mt-6">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Neto a Facturar</span>
                  <span className="text-2xl font-black text-[#1b4332]">${calcularTotalCompra().toLocaleString()}</span>
                </div>
                <button 
                  type="submit"
                  className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-6 py-3 rounded-full font-black uppercase tracking-widest shadow-md transition-all"
                >
                  📥 Guardar Venta
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pedidos;