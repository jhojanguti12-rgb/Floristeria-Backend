import React, { useState, useEffect } from 'react';

const Personal = ({ user, API_BASE_URL }) => {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el modal y el formulario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'empleado'
  });
  const [guardando, setGuardando] = useState(false);

  // 🌟 NUEVO: Estados para alternar la visibilidad de las contraseñas
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);

  useEffect(() => {
    fetchPersonal();
  }, []);

  // Al cerrar o abrir el modal, reiniciamos la visibilidad a oculto por seguridad
  useEffect(() => {
    if (!mostrarModal) {
      setVerPassword(false);
      setVerConfirmPassword(false);
    }
  }, [mostrarModal]);

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
        console.error("Error al obtener personal:", data.error);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value
    });
  };

  const contrasenasCoinciden = nuevoUsuario.password === nuevoUsuario.confirmPassword;
  const mostrarErrorContrasena = nuevoUsuario.confirmPassword.length > 0 && !contrasenasCoinciden;

  const handleRegistrarEmpleado = async (e) => {
    e.preventDefault();
    
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.confirmPassword) {
      alert("⚠️ Por favor, rellena todos los campos.");
      return;
    }

    if (!contrasenasCoinciden) {
      alert("❌ Las contraseñas no coinciden. Verifica antes de guardar.");
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
        body: JSON.stringify({
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          password: nuevoUsuario.password,
          rol: nuevoUsuario.rol
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Usuario registrado exitosamente en el equipo.");
        setMostrarModal(false);
        setNuevoUsuario({ nombre: '', email: '', password: '', confirmPassword: '', rol: 'empleado' });
        fetchPersonal();
      } else {
        alert(data.mensaje || "No se pudo registrar al usuario.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al intentar registrar.");
    } finally {
      setGuardando(false);
    }
  };

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
        fetchPersonal();
      } else {
        alert("No se pudo eliminar al empleado.");
      }
    } catch (error) {
      console.error(error);
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
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Equipo de Trabajo</h2>
          <p className="text-gray-400 font-bold text-xs mt-1">Lista de empleados y administradores de la floristería.</p>
        </div>
        <button 
          onClick={() => setMostrarModal(true)} 
          className="bg-[#42a5f5] hover:bg-[#1e88e5] text-white font-black text-xs uppercase tracking-widest p-4 px-6 rounded-full shadow-lg transition-all"
        >
          + Registrar Empleado
        </button>
      </div>

      {/* Tabla de Personal */}
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

      {/* MODAL DE NUEVO PERSONAL */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Encabezado del Modal */}
            <div className="bg-[#1b4332] p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Nuevo Personal</h3>
                <p className="text-emerald-200/80 text-[11px] font-bold mt-0.5">Asigna credenciales seguras y roles al equipo.</p>
              </div>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-emerald-100 hover:text-white font-black text-xl bg-black/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleRegistrarEmpleado} className="p-8 space-y-6">
              
              {/* Sección 1: Datos de Identificación */}
              <div>
                <span className="text-[#1b4332] font-black text-[11px] uppercase tracking-wider block mb-3 border-b border-gray-100 pb-1">📋 Datos de Identificación</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input 
                      type="text"
                      name="nombre"
                      autoComplete="off"
                      value={nuevoUsuario.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-[#42a5f5] text-gray-800 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Correo Electrónico</label>
                    <input 
                      type="email"
                      name="email"
                      autoComplete="off"
                      value={nuevoUsuario.email}
                      onChange={handleInputChange}
                      placeholder="juan@floristeria.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-[#42a5f5] text-gray-800 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Seguridad y Permisos */}
              <div>
                <span className="text-[#1b4332] font-black text-[11px] uppercase tracking-wider block mb-3 border-b border-gray-100 pb-1">🔐 Seguridad y Permisos</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Campo Contraseña con Ojo Interactiva */}
                  <div>
                    <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Contraseña</label>
                    <div className="relative">
                      <input 
                        type={verPassword ? "text" : "password"} // 🌟 Tipo dinámico
                        name="password"
                        value={nuevoUsuario.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className={`w-full bg-gray-50 border rounded-xl p-3 pr-10 text-sm font-semibold outline-none transition-all ${mostrarErrorContrasena ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#42a5f5]'}`}
                        required
                      />
                      {/* Botón Ojo */}
                      <button
                        type="button"
                        onClick={() => setVerPassword(!verPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm p-1 focus:outline-none"
                        title={verPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                      >
                        {verPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {/* Campo Confirmar Contraseña con Ojo Interactiva */}
                  <div>
                    <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <input 
                        type={verConfirmPassword ? "text" : "password"} // 🌟 Tipo dinámico
                        name="confirmPassword"
                        value={nuevoUsuario.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repite la contraseña"
                        className={`w-full bg-gray-50 border rounded-xl p-3 pr-10 text-sm font-semibold outline-none transition-all ${mostrarErrorContrasena ? 'border-red-400 focus:border-red-500' : nuevoUsuario.confirmPassword && contrasenasCoinciden ? 'border-emerald-400 focus:border-emerald-500' : 'border-gray-200 focus:border-[#42a5f5]'}`}
                        required
                      />
                      {/* Botón Ojo */}
                      <button
                        type="button"
                        onClick={() => setVerConfirmPassword(!verConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm p-1 focus:outline-none"
                        title={verConfirmPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
                      >
                        {verConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Mensajes de Validación */}
                {mostrarErrorContrasena && (
                  <p className="text-red-500 font-bold text-xs mt-2 animate-pulse">
                    ❌ Las contraseñas no coinciden. Inténtalo de nuevo.
                  </p>
                )}
                {nuevoUsuario.confirmPassword && contrasenasCoinciden && (
                  <p className="text-emerald-600 font-bold text-xs mt-2">
                    ✅ ¡Perfecto! Las contraseñas coinciden.
                  </p>
                )}
              </div>

              {/* Sección 3: Rol del sistema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">Asignar Rol Corporativo</label>
                  <select 
                    name="rol"
                    value={nuevoUsuario.rol}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-black uppercase text-gray-700 outline-none focus:border-[#42a5f5]"
                  >
                    <option value="empleado">⚙️ Empleado.</option>
                    <option value="admin">👑 Administrador.</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || (nuevoUsuario.confirmPassword.length > 0 && !contrasenasCoinciden)}
                  className="bg-[#1b4332] hover:bg-[#153426] text-white font-black text-xs uppercase tracking-widest p-3.5 px-8 rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {guardando ? "Registrando..." : "Guardar Registro"}
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