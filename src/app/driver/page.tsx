"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../landing.css"; // Reuse aesthetics

export default function DriverDashboard() {
  const [driverStatus, setDriverStatus] = useState("menunggu_customer");
  const [walletBalance, setWalletBalance] = useState(150000);
  
  // Modals
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Timer Logic
  const [countdown, setCountdown] = useState(15); // 15 seconds for demo purposes
  
  // Session History
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (driverStatus === "menunggu_customer" && countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (driverStatus === "menunggu_customer" && countdown === 0) {
      setDriverStatus("mengantri_di_kasir");
    }
  }, [countdown, driverStatus]);

  const [orders, setOrders] = useState([
    {
      id: "JK-84712",
      customerName: "Reza Rahadian",
      phone: "081234567890",
      address: "Kos Warna Kuning Jl. Banjarsari No 10, ditaruh di atas gerbang hitam",
      mapsLink: "https://maps.app.goo.gl/example1",
      items: [
        { id: "i1", name: "Mie Hompimpa", options: "Level 2", note: "Pedas sedang", qty: 2, ordered: false, packed: false },
        { id: "i2", name: "Udang Keju", options: "", note: "", qty: 1, ordered: false, packed: false }
      ],
      totalMenuPrice: 32000,
      deliveryFee: 7000,
      status: "pending" 
    },
    {
      id: "JK-91283",
      customerName: "Anya Geraldine",
      phone: "089876543210",
      address: "Apartemen Mutiara Tower B, Titip Resepsionis",
      mapsLink: "https://maps.app.goo.gl/example2",
      items: [
        { id: "i3", name: "Mie Suit", options: "", note: "Jangan pakai daun bawang", qty: 1, ordered: false, packed: false },
        { id: "i4", name: "Thai Tea", options: "Dingin", note: "", qty: 1, ordered: false, packed: false }
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
        { id: "i5", name: "Mie Gacoan", options: "Level 0", note: "", qty: 3, ordered: false, packed: false },
        { id: "i6", name: "Es Gobak Sodor", options: "", note: "", qty: 3, ordered: false, packed: false }
      ],
      totalMenuPrice: 63000,
      deliveryFee: 9000, 
      status: "pending"
    }
  ]);

  const activeOrders = orders.filter(o => o.status === "pending");

  // Compute Global Summary
  const globalSummary: Record<string, { name: string, options: string, qty: number }> = {};
  let totalItemsCount = 0;
  activeOrders.forEach(order => {
    order.items.forEach(item => {
      totalItemsCount += item.qty;
      const key = `${item.name}-${item.options}`;
      if (!globalSummary[key]) {
        globalSummary[key] = { name: item.name, options: item.options, qty: 0 };
      }
      globalSummary[key].qty += item.qty;
    });
  });
  const summaryList = Object.values(globalSummary);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    // Validations
    if (newStatus === "menunggu_pesanan") {
      const allOrdered = activeOrders.every(o => o.items.every(i => i.ordered));
      if (!allOrdered) {
        alert("⚠️ Gagal! Masih ada menu yang belum diceklis 'DIPESAN' (Ceklis Kuning).");
        return;
      }
    }
    
    if (newStatus === "mengantar_pesanan") {
      const allPacked = activeOrders.every(o => o.items.every(i => i.packed));
      if (!allPacked) {
        alert("⚠️ Gagal! Masih ada menu yang belum diceklis 'DIBUNGKUS' (Ceklis Biru).");
        return;
      }
    }
    
    // Double Verification
    const statusLabels: Record<string, string> = {
      menunggu_customer: "Open Jastip (Menunggu Customer)",
      mengantri_di_kasir: "Mengantri di Kasir",
      menunggu_pesanan: "Menunggu Pesanan Dibungkus",
      mengantar_pesanan: "Dalam Perjalanan Mengantar"
    };

    const statusOrder = ["menunggu_customer", "mengantri_di_kasir", "menunggu_pesanan", "mengantar_pesanan"];
    const currentIndex = statusOrder.indexOf(driverStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex < currentIndex) {
      alert("⚠️ Gagal! Anda tidak bisa kembali ke tahap sebelumnya.");
      return;
    }
    if (newIndex > currentIndex + 1) {
      alert("⚠️ Gagal! Harap selesaikan tahap secara berurutan, tidak bisa diloncati.");
      return;
    }
    
    if (window.confirm(`Anda yakin ingin pindah ke tahap:\n"${statusLabels[newStatus]}"?\n\nPastikan tugas sebelumnya sudah beres!`)) {
      setDriverStatus(newStatus);
    }
  };

  const toggleItemState = (orderId: string, itemId: string, type: 'ordered' | 'packed') => {
    // Only allow toggling if in the correct state
    if (type === 'ordered' && driverStatus !== 'mengantri_di_kasir') return;
    if (type === 'packed' && driverStatus !== 'menunggu_pesanan') return;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        items: o.items.map(item => item.id === itemId ? { ...item, [type]: !item[type] } : item)
      };
    }));
  };

  const openProofModal = (id: string) => {
    setSelectedOrderId(id);
    setProofModalOpen(true);
  };

  const submitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    
    const orderToFinish = orders.find(o => o.id === selectedOrderId);
    if (!orderToFinish) return;

    // Remove from active orders and add to wallet
    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: "delivered" } : o));
    setWalletBalance(prev => prev + orderToFinish.deliveryFee);
    
    // Check if session is finished
    const remaining = orders.filter(o => o.status === "pending" && o.id !== selectedOrderId);
    if (remaining.length === 0) {
      setSessionHistory(prev => [{
        batchId: "BATCH-" + Math.floor(Math.random()*9000 + 1000),
        date: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        totalEarnings: orders.reduce((sum, o) => sum + (o.status === "pending" ? o.deliveryFee : 0) + (o.id === selectedOrderId ? o.deliveryFee : 0), 0),
        ordersCount: orders.length
      }, ...prev]);
    }

    setProofModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    alert(`Laporan terkirim! Kode Refund: REF-${Math.floor(Math.random() * 9000) + 1000}`);
    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: "cancelled" } : o));
    setReportIssueModalOpen(false);
    setSelectedOrderId(null);
  };

  const resetSession = () => {
    // Reset dummy data for next session
    setDriverStatus("menunggu_customer");
    setCountdown(15);
    setOrders(prev => prev.map(o => ({
      ...o, 
      status: "pending", 
      items: o.items.map(i => ({...i, ordered: false, packed: false})) 
    })));
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
          
          {/* Header Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Dompet Hari Ini</p>
              <h3 style={{ fontSize: '2rem', color: '#4ade80' }}>Rp {walletBalance.toLocaleString('id-ID')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Pencairan otomatis setiap 23:00</p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Update Status Anda</p>
              
              {/* Show countdown if Menunggu Customer */}
              {driverStatus === "menunggu_customer" && (
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '8px', textAlign: 'center', marginBottom: '10px', border: '1px solid #ffbd2e' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Otomatis berangkat dalam</span><br/>
                  <strong style={{ fontSize: '1.5rem', color: '#ffbd2e' }}>00:{countdown.toString().padStart(2, '0')}</strong>
                </div>
              )}

              <select 
                value={driverStatus}
                onChange={handleStatusChange}
                style={{ 
                  width: '100%', padding: '12px', fontSize: '1rem',
                  background: driverStatus === 'menunggu_customer' ? 'rgba(74, 222, 128, 0.2)' :
                              driverStatus === 'mengantri_di_kasir' ? 'rgba(255, 189, 46, 0.2)' :
                              driverStatus === 'menunggu_pesanan' ? 'rgba(56, 189, 248, 0.2)' :
                              'rgba(168, 85, 247, 0.2)',
                  color: driverStatus === 'menunggu_customer' ? '#4ade80' :
                         driverStatus === 'mengantri_di_kasir' ? '#ffbd2e' :
                         driverStatus === 'menunggu_pesanan' ? '#38bdf8' :
                         '#a855f7',
                  border: '1px solid currentColor', borderRadius: '8px', outline: 'none', fontWeight: 'bold'
                }}
              >
                <option value="menunggu_customer" style={{ color: 'black' }} disabled={["mengantri_di_kasir", "menunggu_pesanan", "mengantar_pesanan"].includes(driverStatus)}>🟢 Open Jastip (Menunggu)</option>
                <option value="mengantri_di_kasir" style={{ color: 'black' }} disabled={["menunggu_pesanan", "mengantar_pesanan"].includes(driverStatus)}>🟡 Mengantri di Kasir</option>
                <option value="menunggu_pesanan" style={{ color: 'black' }} disabled={["mengantar_pesanan"].includes(driverStatus)}>🔵 Menunggu Pesanan Dibungkus</option>
                <option value="mengantar_pesanan" style={{ color: 'black' }}>🟣 Dalam Perjalanan Mengantar</option>
              </select>
            </div>
          </div>

          {activeOrders.length > 0 && (
            <>
              {/* Route Map Preview */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>Peta Rute Pengantaran (Preview)</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '1rem 0' }}>
                  <div style={{ position: 'absolute', height: '4px', background: 'var(--glass-border)', left: '20px', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }}></div>
                  
                  <div style={{ zIndex: 1, textAlign: 'center', background: '#222', padding: '8px', borderRadius: '50%', border: '2px solid #ff5f56' }}>
                    🏪
                  </div>
                  
                  {activeOrders.map((order, idx) => (
                    <div key={order.id} style={{ zIndex: 1, textAlign: 'center', background: '#222', padding: '8px 12px', borderRadius: '50px', border: '2px solid #ffbd2e' }}>
                      <strong style={{ color: 'white', fontSize: '0.9rem' }}>T{idx + 1}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <span>Resto (Mie Gacoan)</span>
                  <span>Titik Terakhir</span>
                </div>
              </div>

              {/* Global Menu Summary */}
              <div style={{ background: 'rgba(255, 189, 46, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 189, 46, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 189, 46, 0.3)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ color: '#ffbd2e', margin: 0 }}>📋 Rekap Belanjaan Kasir</h4>
                  <span style={{ background: '#ffbd2e', color: 'black', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Total: {totalItemsCount} Item</span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, columnCount: 2, columnGap: '2rem' }}>
                  {summaryList.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', breakInside: 'avoid' }}>
                      <div>
                        <strong style={{ color: 'white' }}>{item.name}</strong>
                        {item.options && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.options}</span>}
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>{item.qty}x</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Active Batch Order List */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ color: 'white' }}>Batch Pengantaran Aktif</h3>
              <span style={{ background: 'rgba(255, 189, 46, 0.2)', color: '#ffbd2e', padding: '4px 12px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {activeOrders.length}/5 Titik Tersisa
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="fade-in visible" style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: 'white' }}>Sesi Pengantaran Selesai!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Anda telah menyelesaikan semua titik pengantaran dengan sukses.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-secondary" onClick={() => alert("Anda Offline. Selamat Beristirahat!")}>☕ Istirahat/Offline</button>
                  <button className="btn btn-primary" onClick={resetSession}>🛵 Mulai Sesi Baru</button>
                </div>

                {/* Session History */}
                {sessionHistory.length > 0 && (
                  <div style={{ marginTop: '3rem', textAlign: 'left' }}>
                    <h4 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Histori Sesi Hari Ini</h4>
                    {sessionHistory.map((hist, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{hist.batchId}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hist.date} • {hist.ordersCount} Titik</div>
                        </div>
                        <div style={{ color: '#4ade80', fontWeight: 'bold' }}>+ Rp {hist.totalEarnings.toLocaleString('id-ID')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeOrders.map((order, idx) => (
                  <div key={order.id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    
                    {/* Order Header */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#ffbd2e', color: '#000', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Titik {idx + 1}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kode Plastik/Pesanan</p>
                          <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>{order.id}</span>
                        </div>
                      </div>
                      <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>+ Rp {order.deliveryFee.toLocaleString('id-ID')}</span>
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

                    {/* Strict Flow Items List */}
                    {driverStatus !== "menunggu_customer" && (
                      <div style={{ padding: '0 1rem 1rem 1rem' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Daftar Belanjaan</p>
                        
                        {/* Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <div>ITEM</div>
                          <div style={{ textAlign: 'center' }}>DIPESAN</div>
                          <div style={{ textAlign: 'center' }}>BUNGKUS</div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {order.items.map((item) => (
                            <li key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px', gap: '10px', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                              
                              <div style={{ opacity: item.packed ? 0.4 : 1 }}>
                                <strong style={{ color: 'white', fontSize: '1rem' }}>{item.qty}x {item.name}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  {item.options && <span style={{ marginRight: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>{item.options}</span>}
                                  {item.note && <i style={{ color: '#ffbd2e' }}>"{item.note}"</i>}
                                </div>
                              </div>

                              {/* Dipesan Checkbox */}
                              <div 
                                onClick={() => toggleItemState(order.id, item.id, 'ordered')}
                                style={{
                                  width: '30px', height: '30px', margin: '0 auto', borderRadius: '6px', border: '2px solid #ffbd2e',
                                  background: item.ordered ? '#ffbd2e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: driverStatus === 'mengantri_di_kasir' ? 'pointer' : 'not-allowed',
                                  opacity: driverStatus === 'mengantri_di_kasir' || item.ordered ? 1 : 0.2
                                }}>
                                {item.ordered && <span style={{ color: 'black', fontWeight: 'bold' }}>✓</span>}
                              </div>

                              {/* Dibungkus Checkbox */}
                              <div 
                                onClick={() => toggleItemState(order.id, item.id, 'packed')}
                                style={{
                                  width: '30px', height: '30px', margin: '0 auto', borderRadius: '6px', border: '2px solid #38bdf8',
                                  background: item.packed ? '#38bdf8' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: driverStatus === 'menunggu_pesanan' ? 'pointer' : 'not-allowed',
                                  opacity: driverStatus === 'menunggu_pesanan' || item.packed ? 1 : 0.2
                                }}>
                                {item.packed && <span style={{ color: 'black', fontWeight: 'bold' }}>✓</span>}
                              </div>

                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons (Strict) */}
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', display: 'flex', gap: '1rem' }}>
                      {driverStatus === "mengantar_pesanan" && (
                        <button 
                          className="btn btn-primary pulse" 
                          style={{ flex: 1, background: '#4ade80', color: '#000' }}
                          onClick={() => openProofModal(order.id)}
                        >
                          📸 Selesai Diantar (Upload)
                        </button>
                      )}
                      
                      {driverStatus !== "menunggu_customer" && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ flex: driverStatus === "mengantar_pesanan" ? '0 0 auto' : '1', background: 'rgba(255, 95, 86, 0.1)', color: '#ff5f56', border: '1px solid rgba(255, 95, 86, 0.3)' }}
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setReportIssueModalOpen(true);
                          }}
                        >
                          ⚠️ Kendala
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upload Proof Modal */}
      {proofModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content glass-card fade-in visible" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ color: '#4ade80' }}>Upload Bukti Antar</h3>
              <button className="btn-close" onClick={() => setProofModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Pesanan <strong>{selectedOrderId}</strong> mewajibkan foto bukti (makanan ditaruh di rak/pagar). 
              </p>

              <form onSubmit={submitProof}>
                <div style={{ 
                  width: '100%', height: '150px', background: 'rgba(0,0,0,0.3)', border: '2px dashed var(--glass-border)', 
                  borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.5rem', cursor: 'pointer'
                }} onClick={() => alert("Simulasi membuka Kamera HP...")}>
                  <span style={{ fontSize: '3rem' }}>📷</span>
                  <span style={{ color: '#4ade80', fontWeight: 'bold', marginTop: '10px' }}>Ketuk untuk Ambil Foto</span>
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Catatan Pengantaran (Opsional)</label>
                  <textarea placeholder="Misal: Ditaruh di rak sepatu sebelah kiri pintu..." rows={2} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#4ade80', color: 'black' }}>Kirim Bukti & Selesai</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                Jika terjadi insiden (menu habis total, ban bocor) yang membuat pesanan <strong>{selectedOrderId}</strong> tidak bisa dipenuhi, lapor di sini untuk membuat kode refund.
              </p>
              <form onSubmit={handleReportIssue}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Pilih Kendala</label>
                  <select required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', outline: 'none' }}>
                    <option value="" style={{ color: 'black' }}>-- Pilih Kendala --</option>
                    <option value="sold_out" style={{ color: 'black' }}>Menu Kosong / Habis Total di Resto</option>
                    <option value="vehicle_issue" style={{ color: 'black' }}>Kendala Kendaraan (Mogok/Bocor)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Keterangan</label>
                  <textarea required rows={2} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#ff5f56' }}>Kirim Laporan Batal</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
