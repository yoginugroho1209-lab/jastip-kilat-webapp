"use client";

import { useState } from "react";
import Link from "next/link";
import "../landing.css";

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock Data: Menus
  const [menus, setMenus] = useState([
    { id: "m1", category: "Makanan", name: "Mie Suit", price: 10000, isAvailable: true },
    { id: "m2", category: "Makanan", name: "Mie Hompimpa", price: 10000, isAvailable: true },
    { id: "m3", category: "Makanan", name: "Mie Gacoan", price: 10000, isAvailable: true },
    { id: "m4", category: "Dimsum", name: "Udang Rambutan", price: 9000, isAvailable: true },
    { id: "m5", category: "Dimsum", name: "Udang Keju", price: 9000, isAvailable: false },
    { id: "m6", category: "Minuman", name: "Es Gobak Sodor", price: 9000, isAvailable: true },
  ]);

  // Mock Data: Drivers
  const [drivers, setDrivers] = useState([
    { id: "d1", name: "Budi Santoso", phone: "08123456789", vehicle: "H 1234 AB (Vario)", status: "active", currentTask: "Mengantar ke Titik 3" },
    { id: "d2", name: "Andi Wijaya", phone: "08198765432", vehicle: "H 9999 XX (Beat)", status: "active", currentTask: "Mengantri di Kasir" },
    { id: "d3", name: "Siti Rahma", phone: "08556677889", vehicle: "H 5555 YY (Scoopy)", status: "pending", currentTask: "-" },
  ]);

  // Mock Data: Refunds
  const [refunds, setRefunds] = useState([
    { id: "REF-4821", date: "22 Ags, 14:30", customer: "Reza Rahadian", amount: 32000, reason: "Menu Habis Total", resolved: false },
    { id: "REF-9122", date: "22 Ags, 11:15", customer: "Anya Geraldine", amount: 45000, reason: "Driver Pecah Ban", resolved: true },
  ]);

  // Global Stats
  const platformFeePerItem = 500;
  const totalItemsSold = 420; // Dummy
  const grossRevenue = totalItemsSold * platformFeePerItem;

  const toggleMenu = (id: string) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  const approveDriver = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: "active" } : d));
  };

  const resolveRefund = (id: string) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, resolved: true } : r));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="fade-in visible">
            <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Ringkasan Eksekutif</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '1.5rem', borderRadius: '16px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pendapatan Platform</h4>
                <h2 style={{ color: '#4ade80', fontSize: '2.5rem', margin: 0 }}>Rp {grossRevenue.toLocaleString('id-ID')}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Dari total {totalItemsSold} item terjual (Rp500/item)</p>
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
                          onClick={() => toggleMenu(m.id)}
                          style={{
                            background: m.isAvailable ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 95, 86, 0.2)',
                            color: m.isAvailable ? '#4ade80' : '#ff5f56',
                            border: `1px solid ${m.isAvailable ? '#4ade80' : '#ff5f56'}`,
                            padding: '6px 12px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
                          }}>
                          {m.isAvailable ? '🟢 Tersedia' : '🔴 Habis (Sold Out)'}
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
              {drivers.filter(d => d.status === "pending").map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 189, 46, 0.05)', border: '1px solid rgba(255, 189, 46, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: 'white' }}>{d.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>WA: {d.phone} • Kendaraan: {d.vehicle}</p>
                  </div>
                  <button onClick={() => approveDriver(d.id)} className="btn btn-primary" style={{ background: '#4ade80', color: 'black' }}>✔️ Terima & Aktifkan</button>
                </div>
              ))}
              {drivers.filter(d => d.status === "pending").length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Tidak ada pendaftar baru.</p>}
            </div>

            <h4 style={{ color: '#38bdf8', marginBottom: '1rem' }}>Live Monitor Driver Aktif</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {drivers.filter(d => d.status === "active").map(d => (
                <div key={d.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'white' }}>{d.name}</h3>
                    <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>On Duty</span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Motor: {d.vehicle}</p>
                  <p style={{ margin: 0, color: '#ffbd2e', fontWeight: 'bold' }}>📍 {d.currentTask}</p>
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
              {refunds.map(r => (
                <div key={r.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  background: r.resolved ? 'rgba(255,255,255,0.02)' : 'rgba(255, 95, 86, 0.05)', 
                  border: `1px solid ${r.resolved ? 'var(--glass-border)' : 'rgba(255, 95, 86, 0.3)'}`, 
                  padding: '1.5rem', borderRadius: '12px',
                  opacity: r.resolved ? 0.6 : 1
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: '#222', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{r.id}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'white' }}>Pelanggan: {r.customer}</h4>
                    <p style={{ margin: 0, color: r.resolved ? 'var(--text-secondary)' : '#ff5f56' }}>Kendala: {r.reason} (Nilai: Rp {r.amount.toLocaleString('id-ID')})</p>
                  </div>
                  
                  {r.resolved ? (
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Refund Selesai</span>
                  ) : (
                    <button onClick={() => resolveRefund(r.id)} className="btn btn-primary" style={{ background: '#ff5f56' }}>Selesaikan Manual (WA)</button>
                  )}
                </div>
              ))}
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
            { id: 'drivers', label: '🛵 Mitra Driver' },
            { id: 'refunds', label: '⚠️ Resolusi & Refund' },
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
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
            Kembali ke Web Publik
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
