import React from 'react';

export default function TiendaCliente({ user, setUser, productos }) {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-gray-800 font-sans">
      {/* Barra de navegación de la tienda */}
      <header className="bg-white shadow-xs p-4 flex justify-between items-center px-8 border-b border-gray-100">
        <h1 className="text-2xl font-black text-[#1b4332] uppercase tracking-tighter">🌸 Mi Jardín</h1>
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-gray-600">¡Hola, {user.nombre}! 👋</span>
          <button 
            onClick={() => {
              window.sessionStorage.clear();
              window.localStorage.clear();
              setUser(null);
            }}
            className="text-xs font-black uppercase tracking-wider text-red-500 hover:underline"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Catálogo de productos para comprar */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center border border-gray-100 mb-8">
          <h2 className="text-3xl font-black text-[#1b4332] mb-2">¡Bienvenido a nuestra Tienda en Línea!</h2>
          <p className="text-gray-500 text-sm">Aquí podrás armar tu carrito de compras y adquirir los mejores arreglos florales.</p>
        </div>

        {/* Rejilla de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productos.map(p => (
            <div key={p._id || p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-3xl">🌷</span>
                <h3 className="font-black text-lg text-gray-800 mt-2">{p.nombre}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Disponibles: {p.stock} unidades</p>
              </div>
              <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-xl font-black text-[#d81b60]">${p.precio}</span>
                <button className="bg-[#1b4332] hover:bg-[#081c15] text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-colors">
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}