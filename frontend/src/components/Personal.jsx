import React, { useState, useEffect } from 'react';

const Personal = ({ user, API_BASE_URL }) => {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);

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

  // Función temporal para eliminar (la conectaremos al backend luego)
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
        {/* Luego conectaremos este botón a un modal local */}
        <button 
          onClick={() => alert("Función para registrar empleado próximamente")} 
          className="bg-[#42a5f5] hover:bg-[#1e88e5] text-white font-black text-xs uppercase tracking-widest p-4 px-6 rounded-full shadow-lg self-start sm:self-auto"
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
    </div>
  );
};

export default Personal;