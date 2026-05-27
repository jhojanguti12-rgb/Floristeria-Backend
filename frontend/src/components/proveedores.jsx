import React, { useState, useEffect } from 'react';

export default function Proveedores({ user, API_BASE_URL }) {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    
    // Estado para el formulario (Crear / Editar)
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        contacto_nombre: ''
    });

    // 🔑 OBTENER EL TOKEN AUTOMÁTICAMENTE
    const token = user?.token || localStorage.getItem('token');

    // Cargar proveedores desde la API (Con Token)
    const fetchProveedores = async () => {
        try {
            setLoading(true);
            // 🛠️ CORREGIDO: Se removió /api porque API_BASE_URL ya lo incluye
            const res = await fetch(`${API_BASE_URL}/proveedores`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            const data = await res.json();
            setProveedores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando proveedores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProveedores();
    }, []);

    // Guardar o Actualizar Proveedor (Con Token)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre || !form.telefono) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        // 🛠️ CORREGIDO: Se removió /api en ambas opciones de URL
        const url = editingId 
            ? `${API_BASE_URL}/proveedores/${editingId}` 
            : `${API_BASE_URL}/proveedores`;
        
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                fetchProveedores();
                closeModal();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Hubo un error al guardar el proveedor.");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    // Eliminar proveedor (Con Token)
    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
            try {
                // 🛠️ CORREGIDO: Se removió /api de la ruta de eliminación
                const res = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                });
                if (res.ok) {
                    fetchProveedores();
                } else {
                    alert("No se pudo eliminar el proveedor.");
                }
            } catch (error) {
                console.error("Error eliminando:", error);
            }
        }
    };

    // Abrir modal para Editar
    const openEditModal = (prov) => {
        setEditingId(prov.id);
        setForm({
            nombre: prov.nombre,
            telefono: prov.telefono,
            contacto_nombre: prov.contacto_nombre || ''
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setForm({ nombre: '', telefono: '', contacto_nombre: '' });
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Encabezado del Módulo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1E3E2B] tracking-tight">GESTIÓN DE PROVEEDORES</h1>
                    <p className="text-gray-500 text-sm mt-1">Administra los distribuidores de flores e insumos de la floristería.</p>
                </div>
                <button 
                    onClick={() => setModalOpen(true)}
                    className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
                >
                    <span>➕</span> Registrar Proveedor
                </button>
            </div>

            {/* Listado / Tabla */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-medium">Cargando proveedores...</div>
                ) : proveedores.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-medium">No hay proveedores registrados todavía.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="p-5">Nombre de la Empresa</th>
                                    <th className="p-5">Teléfono</th>
                                    <th className="p-5">Contacto Asesor</th>
                                    <th className="p-5 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                                {proveedores.map((prov) => (
                                    <tr key={prov.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 font-bold text-[#1E3E2B]">{prov.nombre}</td>
                                        <td className="p-5 font-medium text-gray-600">{prov.telefono}</td>
                                        <td className="p-5">
                                            {prov.contacto_nombre ? (
                                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    👤 {prov.contacto_nombre}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">No asignado</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center items-center gap-3">
                                                <button 
                                                    onClick={() => openEditModal(prov)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(prov.id)}
                                                    className="text-red-600 hover:text-red-800 font-semibold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Registro / Edición */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 relative">
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-2xl font-bold text-[#1E3E2B] mb-2">
                            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h3>
                        <p className="text-gray-400 text-xs mb-6">Ingresa la información comercial del distribuidor de flores.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre de la Empresa *</label>
                                <input 
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                                    placeholder="Ej. Distribuidora Rosas de Colombia"
                                    className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-[#2E7D32] transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Teléfono de Contacto *</label>
                                <input 
                                    type="text"
                                    value={form.telefono}
                                    onChange={(e) => setForm({...form, telefono: e.target.value})}
                                    placeholder="Ej. 3123456789"
                                    className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-[#2E7D32] transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre del Asesor (Opcional)</label>
                                <input 
                                    type="text"
                                    value={form.contacto_nombre}
                                    onChange={(e) => setForm({...form, contacto_nombre: e.target.value})}
                                    placeholder="Ej. Carlos Mendoza"
                                    className="w-full border border-gray-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-[#2E7D32] transition-colors"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="w-1/2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-3 rounded-2xl shadow-lg shadow-green-900/10 transition-all"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}