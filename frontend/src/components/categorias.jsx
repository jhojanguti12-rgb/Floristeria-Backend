import React, { useState, useEffect } from 'react';

const Categorias = ({ user, API_BASE_URL }) => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // 📝 Estados para controlar la edición en línea
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');

  // 🔄 Cargar las categorías automáticamente cuando el administrador entra a la pestaña
  useEffect(() => {
    fetchCategorias();
  }, []);

  // 📋 1. GET: Consultar la lista de categorías del Backend
  const fetchCategorias = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCategorias(data);
      } else {
        console.error("Error del servidor al traer categorías:", data.error);
      }
    } catch (error) {
      console.error("Error de red al cargar categorías:", error);
    } finally {
      setCargando(false);
    }
  };

  // ➕ 2. POST: Registrar una nueva categoría en MySQL
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: nombre.trim(), descripcion: descripcion.trim() })
      });
      const data = await res.json();

      if (res.ok) {
        // La insertamos en el estado local ordenándola alfabéticamente
        setCategorias([...categorias, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setNombre('');
        setDescripcion('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al crear la categoría:", error);
    }
  };

  // ✏️ Activar el modo edición cargando los valores actuales de la fila
  const iniciarEdicion = (cat) => {
    setEditandoId(cat.id);
    setEditNombre(cat.nombre);
    setEditDescripcion(cat.descripcion || '');
  };

  // ❌ Cancelar el modo edición y vaciar variables
  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditDescripcion('');
  };

  // 💾 4. PUT: Actualizar los cambios de la categoría en MySQL
  const handleActualizarCategoria = async (id) => {
    if (!editNombre.trim()) {
      alert("El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: editNombre.trim(), descripcion: editDescripcion.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        // Actualizamos de inmediato en el estado local de React
        setCategorias(categorias.map(cat => 
          cat.id === id ? { ...cat, nombre: editNombre.trim(), descripcion: editDescripcion.trim() } : cat
        ).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        
        // Salimos del modo edición
        cancelarEdicion();
      } else {
        alert(`Error al actualizar: ${data.error || 'No se pudo editar'}`);
      }
    } catch (error) {
      console.error("Error de red al actualizar la categoría:", error);
      alert("Hubo un error de conexión con el servidor.");
    }
  };

  // 🗑️ 3. DELETE: Eliminar una categoría permanentemente
  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría? Recuerda que afectará los filtros del inventario.")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (res.ok) {
        // La removemos de la lista en pantalla instantáneamente
        setCategorias(categorias.filter(cat => cat.id !== id));
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest animate-pulse">
        ⏳ Cargando catálogo de categorías...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div>
        <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Categorías de Flores</h2>
        <p className="text-gray-400 font-bold text-xs mt-1">Organiza tu vitrina en colecciones de temporada, ramos fúnebres, buchones o fechas especiales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario para Agregar Nueva Categoría (Izquierda) */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-xs h-fit">
          <h3 className="text-lg font-black text-[#1b4332] uppercase tracking-tight mb-4">Nueva Colección</h3>
          <form onSubmit={handleCrearCategoria} className="space-y-4 text-xs font-bold text-gray-500">
            <div>
              <label className="block mb-1 uppercase tracking-wider">Nombre de la Categoría: *</label>
              <input 
                type="text" 
                placeholder="Ej. Ramos Buchones o Condolencias" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200"
              />
            </div>

            <div>
              <label className="block mb-1 uppercase tracking-wider">Descripción Breve</label>
              <textarea 
                placeholder="Explica qué tipo de arreglos o flores lleva esta categoría..." 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows="3"
                className="w-full p-3 rounded-xl border border-gray-200 outline-none text-gray-700 font-semibold focus:ring-2 ring-emerald-200 resize-none"
              />
            </div>

            <button type="submit" className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white p-4 rounded-full font-black uppercase tracking-widest mt-2 shadow-md transition-all">
              ➕ Crear Categoría
            </button>
          </form>
        </div>

        {/* Tabla con el Listado de Categorías de la Base de Datos (Derecha) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="uppercase border-b border-gray-100 text-[10px] tracking-widest text-gray-400">
                  <th className="p-4 pl-2">ID</th>
                  <th className="p-4">Nombre de Colección</th>
                  <th className="p-4">Descripción</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {categorias.length > 0 ? categorias.map((cat) => {
                  const isEditing = editandoId === cat.id;
                  
                  return (
                    <tr key={cat.id} className={`transition-colors ${isEditing ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="p-4 pl-2 font-black text-[#1b4332]">#{cat.id}</td>
                      
                      {/* Celda del Nombre */}
                      <td className="p-4 font-black">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="p-2 border border-emerald-300 rounded-lg outline-none bg-white font-semibold text-gray-800 w-full focus:ring-2 ring-emerald-200 text-xs"
                          />
                        ) : (
                          <span className="text-gray-800">{cat.nombre}</span>
                        )}
                      </td>
                      
                      {/* Celda de la Descripción */}
                      <td className="p-4 text-xs font-medium max-w-xs">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editDescripcion}
                            onChange={(e) => setEditDescripcion(e.target.value)}
                            placeholder="Añadir descripción..."
                            className="p-2 border border-emerald-300 rounded-lg outline-none bg-white text-gray-600 w-full focus:ring-2 ring-emerald-200 text-xs"
                          />
                        ) : (
                          <span className={cat.descripcion ? "text-gray-400" : "italic opacity-40"}>
                            {cat.descripcion || "Sin descripción aportada"}
                          </span>
                        )}
                      </td>
                      
                      {/* Acciones Inteligentes */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => handleActualizarCategoria(cat.id)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-all bg-emerald-100 px-2.5 py-1 rounded-md"
                              >
                                💾 Guardar
                              </button>
                              <button 
                                onClick={cancelarEdicion}
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-all bg-gray-100 px-2.5 py-1 rounded-md"
                              >
                                ❌ Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => iniciarEdicion(cat)}
                                className="text-xs font-bold text-gray-400 hover:text-[#2d6a4f] transition-all inline-flex items-center gap-1"
                              >
                                ✏️ Editar
                              </button>
                              <span className="text-gray-200">|</span>
                              <button 
                                onClick={() => handleEliminarCategoria(cat.id)}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-all inline-flex items-center gap-1"
                              >
                                🗑️ Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400 font-bold">
                      No hay categorías registradas aún en tu base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categorias;