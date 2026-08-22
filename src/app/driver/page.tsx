"use client";

import { useState } from "react";
import Link from "next/link";
import "../landing.css"; // Reuse the same aesthetics

export default function DriverDashboard() {
  const [isReady, setIsReady] = useState(false);
  const [walletBalance, setWalletBalance] = useState(150000);
  
  // Modals
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Mock Active Batch Orders
  const [orders, setOrders] = useState([
    {
      id: "JK-84712",
      customerName: "Reza Rahadian",
      phone: "081234567890",
      address: "Kos Warna Kuning Jl. Banjarsari No 10, ditaruh di atas gerbang hitam",
      mapsLink: "https://maps.app.goo.gl/example1",
      items: [
        { name: "Mie Hompimpa", options: "Level 2", note: "Pedas sedang", qty: 2 },
        { name: "Udang Keju", options: "", note: "", qty: 1 }
      ],
      totalMenuPrice: 32000,
      deliveryFee: 7000,
      status: "pending" // pending -> delivered
    },
    {
      id: "JK-91283",
      customerName: "Anya Geraldine",
      phone: "089876543210",
      address: "Apartemen Mutiara Tower B, Titip Resepsionis",
      mapsLink: "https://maps.app.goo.gl/example2",
      items: [
        { name: "Mie Suit", options: "", note: "Jangan pakai daun bawang", qty: 1 },
        { name: "Thai Tea", options: "Dingin", note: "", qty: 1 }
      ],
      totalMenuPrice: 20000,
      deliveryFee: 7000,
      status: "pending"
    },
    {
      id: "JK-55319",
      customerName: "Raditya Dika",
      phone: "085566778899",
      address: "Jl. Ngesrep Timur V No 45, rumah pagar putih",
      mapsLink: "https://maps.app.goo.gl/example3",
      items: [
        { name: "Mie Gacoan", options: "Level 0", note: "", qty: 3 },
        { name: "Es Gobak Sodor", options: "", note: "", qty: 3 }
      ],
      totalMenuPrice: 63000,
      deliveryFee: 9000, // Distance > 3.5km example
      status: "pending"
    }
  ]);

  const activeOrders = orders.filter(o => o.status === "pending");

  const markAsDelivered = (id: string) => {
    const orderToFinish = orders.find(o => o.id === id);
    if (!orderToFinish) return;

    // Update order status
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "delivered" } : o));
    
    // Add delivery fee to wallet
    setWalletBalance(prev => prev + orderToFinish.deliveryFee);
    
    alert(`Pesanan ${id} Selesai!\nRp ${orderToFinish.deliveryFee.toLocaleString('id-ID')} masuk ke dompet Anda.`);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    
    // Simulate issue reporting and refund code generation
    alert(`Laporan terkirim!\nPesanan ${selectedOrderId} telah dibatalkan.\nKode Refund Customer: REF-${Math.floor(Math.random() * 9000) + 1000}`);
    
    // Remove the order from active list (simulating cancellation)
    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: "cancelled" } : o));
    setReportIssueModalOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '120px' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          Jastip<span>Driver</span>
        </div>
        <div className="nav-links">
          <Link href="/" className="btn btn-secondary">Homepage</Link>
        </div>
      </nav>

      <section className="order-section fade-in visible" style={{ paddingTop: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h2>Dashboard Operasional</h2>
          <p>Halo Budi Santoso, kelola pesanan dan rute pengantaran Anda di sini.</p>
        </div>

        <div className="order-container glass-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Dashboard Header: Wallet & Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Dompet Hari Ini</p>
              <h3 style={{ fontSize: '2rem', color: '#4ade80' }}>Rp {walletBalance.toLocaleString('id-ID')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Pencairan otomatis ke Rekening setiap 23:00</p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Status Sesi</p>
              <button 
                className={`btn ${isReady ? 'btn-primary' : 'btn-secondary'} pulse`}
                onClick={() => setIsReady(!isReady)}
                style={{ width: '100%', fontSize: '1.1rem', background: isReady ? '#ffbd2e' : 'rgba(255,255,255,0.1)', color: isReady ? '#000' : 'white' }}
              >
                {isReady ? '🟢 Siap Menerima Pesanan' : '🔴 Sibuk / Istirahat'}
              </button>
            </div>
          </div>

          {/* Active Batch Order List */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ color: 'white' }}>Batch Pengantaran Aktif</h3>
              <span style={{ background: 'rgba(255, 189, 46, 0.2)', color: '#ffbd2e', padding: '4px 12px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {activeOrders.length}/5 Titik Terisi
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <h4>Tidak ada pesanan aktif</h4>
                <p>Nyalakan status "Siap" untuk mulai menerima order.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeOrders.map((order, idx) => (
                  <div key={order.id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    
                    {/* Order Header */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ background: '#ffbd2e', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '8px' }}>
                          Titik {idx + 1}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{order.id}</span>
                      </div>
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+ Rp {order.deliveryFee.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Customer Info & Address */}
                    <div style={{ padding: '1rem 1rem 0 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{order.customerName}</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📞 {order.phone}</p>
                        </div>
                        <a href={order.mapsLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🗺️ Buka Maps
                        </a>
                      </div>
                      
                      <div style={{ background: 'rgba(255, 189, 46, 0.05)', borderLeft: '4px solid #ffbd2e', padding: '12px', borderRadius: '0 8px 8px 0', marginBottom: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                          <strong>Instruksi Drop-off:</strong><br/>
                          {order.address}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div style={{ padding: '0 1rem 1rem 1rem' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Daftar Belanjaan</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {order.items.map((item, i) => (
                          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <div>
                              <strong style={{ color: 'white' }}>{item.qty}x {item.name}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {item.options && <span style={{ marginRight: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>{item.options}</span>}
                                {item.note && <i>"{item.note}"</i>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', display: 'flex', gap: '1rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, background: '#4ade80', color: '#000' }}
                        onClick={() => markAsDelivered(order.id)}
                      >
                        ✓ Selesai Diantar
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ background: 'rgba(255, 95, 86, 0.1)', color: '#ff5f56', border: '1px solid rgba(255, 95, 86, 0.3)' }}
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setReportIssueModalOpen(true);
                        }}
                      >
                        ⚠️ Kendala
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Report Issue Modal */}
      {reportIssueModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content glass-card fade-in visible">
            <div className="modal-header">
              <h3 style={{ color: '#ff5f56' }}>Laporkan Kendala</h3>
              <button className="btn-close" onClick={() => setReportIssueModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Jika terjadi insiden (menu habis total, ban bocor, kecelakaan) yang membuat pesanan <strong>{selectedOrderId}</strong> tidak bisa dipenuhi, silakan lapor di sini. Sistem akan membuatkan kode refund untuk pelanggan.
              </p>

              <form onSubmit={handleReportIssue}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Pilih Jenis Kendala</label>
                  <select required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', outline: 'none' }}>
                    <option value="" style={{ color: 'black' }}>-- Pilih Kendala --</option>
                    <option value="sold_out" style={{ color: 'black' }}>Menu Kosong / Habis Total di Resto</option>
                    <option value="vehicle_issue" style={{ color: 'black' }}>Kendala Kendaraan (Mogok/Bocor)</option>
                    <option value="customer_unreachable" style={{ color: 'black' }}>Alamat Tidak Ditemukan / Salah Titik</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Keterangan Tambahan</label>
                  <textarea required placeholder="Misal: Mie Gacoan level 1-4 habis semua, sudah ditunggu 30 menit..." rows={3} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setReportIssueModalOpen(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ff5f56' }}>Kirim Laporan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
