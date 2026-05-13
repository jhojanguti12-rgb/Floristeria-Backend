import React, { useState, useEffect, useCallback } from 'react';

// --- CONFIGURACIÓN ---
const API_BASE_URL = 'https://floristeria-api-v2.onrender.com/api';

const formatCOP = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(Number(val) || 0);
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = window.sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [stats, setStats] = useState({
    inventario: 0, personal: 0, pedidosCount: 0, ventasTotal: 0, pedidosLista: []
  });

  const [cargando, setCargando] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      console.log("Datos recibidos:", data);

      if (data) {
        setStats({
          inventario: data.inventario || 0,
          personal: data.personal || 0,
          pedidosCount: data.pedidosCount || 0,
          ventasTotal: data.ventasTotal || 0,
          pedidosLista: Array.isArray(data.pedidosLista) ? data.pedidosLista : []
        });
      }
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        const userData = { rol: data.rol, nombre: data.nombre, token: data.token };
        window.sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        alert("Error: " + (data.mensaje || "Credenciales inválidas"));
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '300px' }}>
          <h2 style={{ textAlign: 'center', color: '#2d6a4f' }}>LOGIN</h2>
          <input type="email" placeholder="Email" style={{ width: '100%', marginBottom: '10px', padding: '10px' }} required />
          <input type="password" placeholder="Pass" style={{ width: '100%', marginBottom: '20px', padding: '10px' }} required />
          <button style={{ width: '100%', padding: '10px', background: '#d81b60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>ENTRAR</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2d6a4f', margin: 0 }}>🌸 Panel Floristería</h1>
          <button onClick={() => { window.sessionStorage.clear(); setUser(null); }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Salir</button>
        </div>

        {cargando ? <p>Cargando datos...</p> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '15px' }}>
                <small>PEDIDOS</small>
                <h2 style={{ margin: 0 }}>{stats.pedidosCount}</h2>
              </div>
              <div style={{ padding: '20px', background: '#fce4ec', borderRadius: '15px' }}>
                <small>VENTAS TOTALES</small>
                <h2 style={{ margin: 0 }}>{formatCOP(stats.ventasTotal)}</h2>
              </div>
            </div>

            <h3>Últimos Pedidos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.pedidosLista.length > 0 ? stats.pedidosLista.map((p, i) => (
                <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>#{String(p.id).substring(0, 5)}</strong> - {String(p.cliente || 'Anónimo')}
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#2d6a4f' }}>{formatCOP(p.total)}</span>
                </div>
              )) : <p>No hay pedidos recientes</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}