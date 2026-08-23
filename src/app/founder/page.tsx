"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../utils/supabase/client";
import "../landing.css";

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [phoneInput, setPhoneInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States
  const [menus, setMenus] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAllData = useCallback(async () => {
    try {
      const [menusData, driversData, refundsData, statsData, ordersData] = await Promise.all([
        fetch('/api/menus').then(res => res.json()),
        fetch('/api/drivers').then(res => res.json()),
        fetch('/api/refunds').then(res => res.json()),
        fetch('/api/stats').then(res => res.json()),
        fetch('/api/orders/history').then(res => res.json())
      ]);
      setMenus(Array.isArray(menusData) ? menusData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setRefunds(Array.isArray(refundsData) ? refundsData : []);
      setStats(statsData && !statsData.error ? statsData : null);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if previously authenticated
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem("jastip_founder_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
        fetchAllData();
      } else {
        setLoading(false);
      }
    }
  }, [fetchAllData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/founder/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, pin: pinInput })
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("jastip_founder_auth", "true");
        fetchAllData();
      } else {
        setPinError(true);
      }
    } catch (err) {
      setPinError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("jastip_founder_auth");
    setActiveTab("overview");
  };

  // Real stats from API
  const platformFeePerItem = stats?.platformFeePerItem || 500;
  const totalItemsSold = stats?.totalItemsSold || 0;
  const grossRevenue = stats?.grossRevenue || 0;

  const toggleMenu = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setMenus(prev => prev.map(m => m.id === id ? { ...m, is_available: !currentStatus } : m));
    await fetch('/api/menus', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_available: !currentStatus })
    });
  };

  const approveDriver = async (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: "active" } : d));
    await fetch('/api/drivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'active' })
    });
  };

  const rejectDriver = async (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" } : d));
    await fetch('/api/drivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' })
    });
  };

  const terminateDriver = async (id: string) => {
    if (confirm("Hati-hati! Apakah Anda yakin ingin memutus kemitraan dengan driver ini? Driver tidak akan bisa login lagi.")) {
      setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: "terminated" } : d));
      await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'terminated' })
      });
    }
  };

  const resolveRefund = async (id: string) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, resolved: true } : r));
    await fetch('/api/refunds', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: true })
    });
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <div className="glass-card fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Founder Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Verifikasi ketat untuk Admin Utama.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Nomor WhatsApp Admin" 
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', 
                border: `1px solid ${pinError ? 'var(--accent-primary)' : 'var(--glass-border)'}`, 
                background: 'rgba(255,255,255,0.05)', color: 'white', 
                marginBottom: '1rem'
              }}
              autoFocus
            />
            <input 
              type="password" 
              placeholder="Masukkan 6-Digit PIN" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={{ 
                width: '100%', padding: '12px', borderRadius: '8px', 
                border: `1px solid ${pinError ? 'var(--accent-primary)' : 'var(--glass-border)'}`, 
                background: 'rgba(255,255,255,0.05)', color: 'white', 
                marginBottom: '1rem', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' 
              }}
              maxLength={6}
            />
            {pinError && <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>Nomor WA atau PIN Salah!</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>
          
          <Link href="/" style={{ display: 'block', marginTop: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="fade-in visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Ringkasan Eksekutif</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🔄 Auto-refresh 30 detik</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pendapatan Platform</h4>
                <h2 style={{ color: '#4ade80', fontSize: '2.5rem', margin: 0 }}>Rp {grossRevenue.toLocaleString('id-ID')}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Dari total {totalItemsSold} item terjual (Rp{platformFeePerItem}/item)</p>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Driver Mengaspal</h4>
                <h2 style={{ color: '#38bdf8', fontSize: '2.5rem', margin: 0 }}>{drivers.filter(d => d.status === 'active').length} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>Orang</span></h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sedang melayani pesanan</p>
              </div>

              <div style={{ background: 'rgba(255, 95, 86, 0.1)', border: '1px solid #ff5f56', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tiket Kendala Menunggu</h4>
                <h2 style={{ color: '#ff5f56', fontSize: '2.5rem', margin: 0 }}>{refunds.filter(r => !r.resolved).length} <span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>Kasus</span></h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Butuh proses manual ke WA</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Order</p>
                <h3 style={{ color: 'white', fontSize: '1.8rem', margin: '0.5rem 0 0 0' }}>{stats?.totalOrders || 0}</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Order Aktif</p>
                <h3 style={{ color: '#ffbd2e', fontSize: '1.8rem', margin: '0.5rem 0 0 0' }}>{stats?.activeOrders || 0}</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Order Selesai</p>
                <h3 style={{ color: '#4ade80', fontSize: '1.8rem', margin: '0.5rem 0 0 0' }}>{stats?.completedOrders || 0}</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Ongkir Terkumpul</p>
                <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0.5rem 0 0 0' }}>Rp {(stats?.totalDeliveryFees || 0).toLocaleString('id-ID')}</h3>
              </div>
            </div>

            {/* Recent Orders */}
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Pesanan Terbaru</h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Customer</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Driver</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((o: any) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', color: 'white' }}>{o.customer_name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{o.driver_name || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: o.status === 'delivered' ? 'rgba(74, 222, 128, 0.2)' :
                                      o.status === 'failed' || o.status === 'cancelled' ? 'rgba(255, 95, 86, 0.2)' :
                                      'rgba(255, 189, 46, 0.2)',
                          color: o.status === 'delivered' ? '#4ade80' :
                                 o.status === 'failed' || o.status === 'cancelled' ? '#ff5f56' :
                                 '#ffbd2e',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                        }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#4ade80', fontWeight: 'bold' }}>
                        Rp {(o.total_price || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "menus":
        return (
          <div className="fade-in visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Manajemen Ketersediaan Menu</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Sync langsung ke Halaman Customer</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Kategori</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nama Menu</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Harga Beli</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status (Tersedia?)</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', color: 'white' }}>{m.category}</td>
                      <td style={{ padding: '1rem', color: 'white', fontWeight: 'bold' }}>{m.name}</td>
                      <td style={{ padding: '1rem', color: '#4ade80' }}>Rp {m.price.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => toggleMenu(m.id, m.is_available)}
                          style={{
                            background: m.is_available ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 95, 86, 0.2)',
                            color: m.is_available ? '#4ade80' : '#ff5f56',
                            border: `1px solid ${m.is_available ? '#4ade80' : '#ff5f56'}`,
                            padding: '6px 12px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
                          }}>
                          {m.is_available ? '🟢 Tersedia' : '🔴 Habis (Sold Out)'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "drivers":
        return (
          <div className="fade-in visible">
            <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Manajemen Mitra Driver</h2>

            <h4 style={{ color: '#ffbd2e', marginBottom: '1rem' }}>Menunggu Verifikasi (Pendaftar Baru)</h4>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
              {drivers.filter(d => d.status === "pending").map(d => {
                const vehicleStr = d.vehicle || '';
                const hasEmail = vehicleStr.includes('| EMAIL:');
                const cleanVehicle = hasEmail ? vehicleStr.split('| EMAIL:')[0].trim() : vehicleStr;
                const email = hasEmail ? vehicleStr.split('| EMAIL:')[1].trim() : '';

                return (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 189, 46, 0.05)', border: '1px solid rgba(255, 189, 46, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: 'white' }}>{d.name}</h3>
                      <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)' }}>WA: {d.phone} {email && `• Email: ${email}`}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Kendaraan: {cleanVehicle}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                          href={`https://wa.me/${d.phone}?text=Halo%20${d.name},%20saya%20Admin%20JastipKilat.%20Terkait%20berkas%20pendaftaran%20Anda...`} 
                          target="_blank" rel="noreferrer" 
                          className="btn btn-secondary" 
                          style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid #4ade80', padding: '6px 12px', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}
                        >
                          💬 Chat WA
                        </a>
                        {email && (
                          <a 
                            href={`mailto:${email}?subject=Pendaftaran%20Mitra%20JastipKilat%20Diterima!&body=Halo%20${d.name},%0A%0ASelamat!%20Berkas%20pendaftaran%20mitra%20Anda%20telah%20memenuhi%20persyaratan%20dan%20kami%20terima.%0A%0ABerikut%20adalah%20akses%20login%20akun%20Anda:%0A-%20ID%20Driver:%20${d.id}%0A-%20Nama:%20${d.name}%0A-%20No%20WhatsApp:%20${d.phone}%0A-%20PIN:%201234%0A%0ASilakan%20login%20di%20Aplikasi%20JastipKilat.%0A%0ATerima%20kasih,%0AAdmin%20JastipKilat`} 
                            target="_blank" rel="noreferrer" 
                            className="btn btn-secondary" 
                            style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px 12px', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}
                          >
                            📧 Kirim Email (PIN)
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => rejectDriver(d.id)} className="btn btn-primary" style={{ background: 'rgba(255, 95, 86, 0.1)', color: '#ff5f56', border: '1px solid #ff5f56', flex: 1, padding: '8px' }}>❌ Tolak</button>
                        <button onClick={() => approveDriver(d.id)} className="btn btn-primary" style={{ background: '#4ade80', color: 'black', flex: 2, padding: '8px' }}>✔️ Terima & Aktifkan</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {drivers.filter(d => d.status === "pending").length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Tidak ada pendaftar baru.</p>}
            </div>

            <h4 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Live Monitor Driver Aktif</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {drivers.filter(d => d.status === "active").map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'white' }}>{d.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>On Duty</span>
                      <button 
                        onClick={() => terminateDriver(d.id)} 
                        style={{ background: 'rgba(255, 95, 86, 0.1)', color: '#ff5f56', border: '1px solid #ff5f56', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }} 
                        title="Putus Mitra (Hapus Akses)"
                      >
                        🗑️ Putus
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Motor: {d.vehicle}</p>
                  <p style={{ margin: 0, color: '#ffbd2e', fontWeight: 'bold' }}>📍 {d.currentTask || 'Standby'}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "refunds":
        return (
          <div className="fade-in visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Pusat Resolusi & Refund</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Tiket keluhan pelanggan/driver</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {refunds.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Belum ada tiket refund.</p>
              ) : refunds.map(r => {
                const customerPhone = r.orders?.customer_phone;
                const driverPhone = r.orders?.drivers?.phone;
                const driverName = r.orders?.drivers?.name;
                const customerName = r.orders?.customer_name;

                return (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: r.resolved ? 'rgba(255,255,255,0.02)' : 'rgba(255, 95, 86, 0.05)',
                  border: `1px solid ${r.resolved ? 'var(--glass-border)' : 'rgba(255, 95, 86, 0.3)'}`,
                  padding: '1.5rem', borderRadius: '12px',
                  opacity: r.resolved ? 0.6 : 1
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#222', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {typeof r.id === 'string' ? r.id.slice(0, 8) : r.id}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Order ID: {typeof r.order_id === 'string' ? r.order_id.slice(0, 8) : r.order_id}</h4>
                    <p style={{ margin: '0 0 8px 0', color: r.resolved ? 'var(--text-secondary)' : '#ff5f56' }}>Kendala: {r.reason} (Nilai: Rp {(r.amount || 0).toLocaleString('id-ID')})</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {customerPhone && (
                         <a href={`https://wa.me/${customerPhone}`} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                           📱 WA Cust: {customerName || customerPhone}
                         </a>
                      )}
                      {driverPhone && (
                         <a href={`https://wa.me/${driverPhone}`} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                           🛵 WA Driver: {driverName || driverPhone}
                         </a>
                      )}
                    </div>
                  </div>

                  {r.resolved ? (
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Refund Selesai</span>
                  ) : (
                    <button onClick={() => resolveRefund(r.id)} className="btn btn-primary" style={{ background: '#ff5f56', padding: '8px 16px' }}>✔️ Tandai Selesai</button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: '#111', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(90deg, #ffbd2e, #ff5f56)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Jastip<span style={{ fontWeight: 300 }}>Admin</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>HQ Pusat Kendali</p>
        </div>

        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'overview', label: '📊 Ringkasan Eksekutif' },
            { id: 'menus', label: '🍜 Manajemen Menu' },
            { id: 'drivers', label: '🛵 Mitra Driver', badge: drivers.filter(d => d.status === 'pending').length },
            { id: 'refunds', label: '⚠️ Resolusi & Refund', badge: refunds.filter(r => !r.resolved).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(255, 189, 46, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#ffbd2e' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? '#ffbd2e' : 'transparent'}`,
                cursor: 'pointer', fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span>{tab.label}</span>
              {tab.badge ? (
                <span style={{
                  background: tab.id === 'refunds' ? '#ff5f56' : '#ffbd2e',
                  color: 'black',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
            Kembali ke Web Publik
          </Link>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px 15px', textAlign: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer' }}
          >
            🚪 Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
                <p>Memuat Data dari Supabase...</p>
             </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </main>
    </div>
  );
}
