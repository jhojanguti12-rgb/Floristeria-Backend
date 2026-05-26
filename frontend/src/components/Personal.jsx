import React, { useState, useEffect } from 'react';

const Personal = ({ user, API_BASE_URL }) => {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para controlar el modal y el formulario de registro
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'empleado' // Rol por defecto en el select
  });
  const [guardando, setGuardando] = useState(false);

  // Carga automáticamente el personal al entrar a la sección
  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${API_BASE_URL}/usuarios/personal`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setEmpleados(data);
      } else {
        console.error("Error del servidor al obtener personal:", data.error);
      }
    } catch (error) {
      console.error("Error de red al cargar personal:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para capturar los datos que escribe el usuario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value
    });
  };

  // Función para enviar el formulario al Backend
  const handleRegistrarEmpleado = async (e) => {
    e.preventDefault(); // Evita que se recargue la página
    
    // Validación básica en el frontend
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password) {
      alert("Por favor, rellena todos los campos.");
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch(`${API_BASE_URL}/usuarios/crear-personal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Usuario registrado exitosamente en el equipo.");
        setMostrarModal(false); // Cerramos el modal flotante
        setNuevoUsuario({ nombre: '', email: '', password: '', rol: 'empleado' }); // Limpiamos formulario
        fetchPersonal(); // Recargamos la tabla al instante
      } else {
        alert(data.mensaje || "No se pudo registrar al usuario.");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("Error de red al intentar registrar.");
    } finally {
      setGuardando(false);
    }
  };

  // Función para eliminar un empleado
  const handleEliminarEmpleado = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas dar de baja a este empleado?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/personal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (res.ok) {
        alert("Empleado dado de baja correctamente.");
        fetchPersonal(); // Recargamos la lista
      } else {
        alert("No se pudo eliminar al empleado.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-12 text-gray-400 font-bold text-sm uppercase tracking-widest">
        ⏳ Cargando Equipo de Trabajo...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Equipo de Trabajo</h2>
          <p className="text-gray-400 font-bold text-xs mt-1">Lista de empleados y administradores de la floristería.</p>
        </div>
        
        {/* Cambiamos el alert por la apertura del modal */}
        <button 
          onClick={() => setMostrarModal(true)} 
          className="bg-[#42a5f5] hover:bg-[#1e88e5] text-white font-black text-xs uppercase tracking-widest p-4 px-6 rounded-full shadow-lg self-start sm:self-auto transition-all"
        >
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
                      {emp.rol || 'personal'}
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

      {/* 🌟 MODAL FLOTANTE INTERACTIVO PARA REGISTRAR EMPLEADOS */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">Nuevo Personal</h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarEmpleado} className="space-y-4">
              <div>
                <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  name="nombre"
                  autocomplete="off" // 👈 Agrega esta línea exacta para eliminar la sugerencia de flores
                  value={nuevoUsuario.nombre}
                  
                  onChange={handleInputChange}
                  placeholder="Ej. Jhojan Alarcón"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-semibold outline-none focus:border-[#42a5f5] text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input 
                  type="email"
                  name="email"
                  autocomplete="off" // 👈 Agrega esta línea exacta para eliminar la sugerencia de flores
                  value={nuevoUsuario.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@floristeria.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-semibold outline-none focus:border-[#42a5f5] text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Contraseña de Acceso</label>
                <input 
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-semibold outline-none focus:border-[#42a5f5] text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Asignar Cargo / Rol</label>
                <select 
                  name="rol"
                  value={nuevoUsuario.rol}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-black uppercase text-gray-700 outline-none focus:border-[#42a5f5]"
                >
                  <option value="empleado">⚙️ Empleado</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#1b4332] hover:bg-[#153426] text-white font-black text-xs uppercase tracking-widest p-3 px-6 rounded-xl shadow-md disabled:opacity-50 transition-all"
                >
                  {guardando ? "Guardando..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;