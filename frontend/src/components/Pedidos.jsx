import React, { useState, useEffect } from 'react';

const Pedidos = ({ user, API_BASE_URL }) => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // 🔄 Cargar la lista de pedidos al montar el componente
  useEffect(() => {
    fetchPedidos();
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
        // Guardamos el pedido en el estado e inyectamos el array de flores que compramos
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
        // Actualizamos la lista local en tiempo real para no recargar la página
        setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
        
        // Si el pedido editado es el que está abierto a la derecha, actualizamos su tarjeta
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

  // Filtrar la lista en pantalla según el botón presionado
  const pedidosFiltrados = filtroEstado === 'Todos' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroEstado);

  if (cargando) {
    return <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest animate-pulse">⏳ Cargando panel de pedidos en tiempo real...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Gestión de Pedidos</h2>
        <p className="text-gray-400 font-bold text-xs mt-1">Monitorea compras, despacha flores y gestiona las dedicatorias de las tarjetas de regalo.</p>
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

        {/* Tarjeta de Detalles Lateral (Aparece al hacer clic en una fila) */}
        {pedidoSeleccionado && (
          <div className="bg-gray-50 border border-gray-200/60 rounded-[2.5rem] p-6 space-y-6 max-h-[80vh] overflow-y-auto">
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

            {/* Datos de Envío */}
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

            {/* Dedicatoria Especial de la Floristería */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">💌 Mensaje / Dedicatoria de la Tarjeta:</span>
              <p className="text-xs italic font-semibold text-emerald-900 bg-white p-3 rounded-xl border border-emerald-100/50 shadow-2xs">
                "{pedidoSeleccionado.dedicatoria || 'El cliente no solicitó tarjeta de regalo.'}"
              </p>
            </div>

            {/* Desglose de Productos Comprados (Traídos dinámicamente) */}
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

            {/* Monto Final */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-xs font-black text-gray-500 uppercase">Total Cobrado:</span>
              <span className="text-xl font-black text-[#1b4332]">${Number(pedidoSeleccionado.total).toLocaleString()}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pedidos;