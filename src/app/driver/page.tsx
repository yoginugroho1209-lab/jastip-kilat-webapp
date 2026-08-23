"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "../landing.css"; // Reuse aesthetics

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export default function DriverDashboard() {
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);

  const [driverStatus, setDriverStatus] = useState("menunggu_customer");
  const [walletBalance, setWalletBalance] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [showSubModal, setShowSubModal] = useState(false);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    if (!driver || !driver.expires_at) return;
    const interval = setInterval(() => {
      const expiry = new Date(driver.expires_at).getTime();
      const diff = expiry - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        // Let the other useEffect redirect them on next render
        setTimeLeftStr("Waktu Habis");
        window.location.reload();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${hours}j ${minutes}m ${seconds}d`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [driver]);

  useEffect(() => {
    // Auth Guard
    const sessionStr = localStorage.getItem("jastip_driver_session");
    if (!sessionStr) {
      router.push("/driver/login");
      return;
    }
    
    const session = JSON.parse(sessionStr);
    
    // Expiration Check
    if (session.expires_at) {
      const expiry = new Date(session.expires_at).getTime();
      if (Date.now() > expiry) {
        // Expired
        session.status = "accepted";
        localStorage.setItem("jastip_driver_session", JSON.stringify(session));
        router.push("/driver/subscribe");
        return;
      }
    }

    if (session.status === "accepted") {
      router.push("/driver/subscribe");
      return;
    }
    
    // Set initial resting state
    if (session.current_task === 'Istirahat') {
      setIsResting(true);
    }
    
    setDriver(session);

    const handleErr = (msg: any, url: any, line: any, col: any, error: any) => {
      setClientError(`${msg} \n ${error?.stack}`);
      return false;
    };
    window.onerror = handleErr;
    window.addEventListener('unhandledrejection', (event) => {
      setClientError(`Promise Rejection: ${event.reason?.message} \n ${event.reason?.stack}`);
    });
  }, []);

  // Modals
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Timer Logic
  const [countdown, setCountdown] = useState(900); // 15 minutes

  // Session History
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    const hasOrders = orders.filter((o: any) => o.status === "pending").length > 0;
    if (hasOrders && driverStatus === "menunggu_customer" && countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (hasOrders && driverStatus === "menunggu_customer" && countdown === 0) {
      setDriverStatus("mengantri_di_kasir");
    }
  }, [countdown, driverStatus, orders]);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      if (!driver || !driver.id) return;
      
      // Verify driver status first to ensure they aren't terminated/rejected
      const statusRes = await fetch(`/api/drivers?id=${driver.id}`);
      const statusData = await statusRes.json();
      if (statusData && (statusData.status === 'terminated' || statusData.status === 'rejected')) {
        // Kick out with notification
        window.alert('Akun Anda telah dinonaktifkan (Diputus Mitra) oleh Admin. Anda akan segera dikeluarkan.');
        localStorage.removeItem("jastip_driver_session");
        router.push("/driver/login");
        return;
      }
      
      // Sync resting status
      if (statusData && statusData.current_task) {
        const isCurrentlyResting = statusData.current_task === 'Istirahat';
        setIsResting(isCurrentlyResting);
        // Update local session
        const sessionStr = localStorage.getItem("jastip_driver_session");
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.current_task !== statusData.current_task) {
            session.current_task = statusData.current_task;
            localStorage.setItem("jastip_driver_session", JSON.stringify(session));
          }
        }
      }

      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!data || data.error) throw new Error(data?.error || "Error");

      const mappedOrders = data.map((o: any) => {
        let lat = o.dropoff_lat;
        let lng = o.dropoff_lng;
        let cleanAddress = o.dropoff_address || "";
        
        if (cleanAddress.includes('| LAT:')) {
           const latMatch = cleanAddress.match(/LAT:\s*([-\d.]+)/);
           const lngMatch = cleanAddress.match(/LNG:\s*([-\d.]+)/);
           if (latMatch) lat = parseFloat(latMatch[1]);
           if (lngMatch) lng = parseFloat(lngMatch[1]);
           cleanAddress = cleanAddress.split('| LAT:')[0].trim();
        }

        return {
          id: o.id,
          sequence: o.sequence,
          customerName: o.customer_name,
          phone: o.customer_phone,
          address: cleanAddress,
          mapsLink: lat && lng 
            ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
            : `https://maps.google.com/?q=${encodeURIComponent(cleanAddress)}`,
          items: (o.order_items || []).map((i: any) => ({
            id: i.id,
            name: i.menus?.name || 'Unknown',
            options: i.options || '',
            note: i.notes || '',
            qty: i.quantity,
            ordered: i.ordered || false,
            packed: i.packed || false
          })),
          totalMenuPrice: o.total_price || 0,
          deliveryFee: o.delivery_fee,
          platformFee: o.platform_fee || 0,
          status: o.status
        };
      });
      setOrders(mappedOrders);
      setLoadingOrders(false);
    } catch (err) {
      console.error("Failed fetching orders:", err);
      setLoadingOrders(false);
    }
  }, [driver, router]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh orders every 10 seconds (so new customer orders appear)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const activeOrders = orders.filter(o => o.status === "pending");

  // Compute Global Summary
  const globalSummary: Record<string, { name: string, options: string, qty: number }> = {};
  let totalItemsCount = 0;
  activeOrders.forEach(order => {
    order.items.forEach((item: any) => {
      totalItemsCount += item.qty;
      const key = `${item.name}-${item.options}`;
      if (!globalSummary[key]) {
        globalSummary[key] = { name: item.name, options: item.options, qty: 0 };
      }
      globalSummary[key].qty += item.qty;
    });
  });
  const summaryList = Object.values(globalSummary);

  // Compute wallet from delivered orders
  useEffect(() => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const totalEarnings = delivered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    setWalletBalance(totalEarnings);
  }, [orders]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;

    // Validations
    if (newStatus === "menunggu_pesanan") {
      const allOrdered = activeOrders.every(o => o.items.every((i: any) => i.ordered));
      if (!allOrdered) {
        alert("⚠️ Gagal! Masih ada menu yang belum diceklis 'DIPESAN' (Ceklis Kuning).");
        return;
      }
    }

    if (newStatus === "mengantar_pesanan") {
      const allPacked = activeOrders.every(o => o.items.every((i: any) => i.packed));
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

      // Update all active order statuses via API
      const statusMap: Record<string, string> = {
        menunggu_customer: 'pending',
        mengantri_di_kasir: 'cooking',
        menunggu_pesanan: 'cooking',
        mengantar_pesanan: 'on_the_way'
      };

      const apiStatus = statusMap[newStatus];
      if (apiStatus) {
        activeOrders.forEach(order => {
          fetch(`/api/orders/${order.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: apiStatus })
          }).catch(err => console.error("Failed to update order status:", err));
        });
      }
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
        items: o.items.map((item: any) => item.id === itemId ? { ...item, [type]: !item[type] } : item)
      };
    }));
  };

  const openProofModal = (id: string) => {
    setSelectedOrderId(id);
    setProofModalOpen(true);
  };

  const submitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const orderToFinish = orders.find(o => o.id === selectedOrderId);
    if (!orderToFinish) return;

    // Update order status to delivered via API
    try {
      await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' })
      });
    } catch (err) {
      console.error("Failed to mark delivered:", err);
    }

    // Update local state
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

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const orderToCancel = orders.find(o => o.id === selectedOrderId);

    // Create refund via API
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderId,
          reason: `${reportReason}: ${reportDescription}`,
          amount: orderToCancel?.totalMenuPrice || 0
        })
      });
      const refundData = await res.json();
      const refundCode = refundData.id ? refundData.id.slice(0, 8).toUpperCase() : "REF-" + Math.floor(Math.random() * 9000 + 1000);
      alert(`Laporan terkirim! Kode Refund: ${refundCode}`);
    } catch (err) {
      console.error("Failed to create refund:", err);
      alert("Gagal membuat refund, silakan coba lagi.");
    }

    // Update order status to failed via API
    try {
      await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'failed' })
      });
    } catch (err) {
      console.error("Failed to update order:", err);
    }

    setOrders(prev => prev.map(o => o.id === selectedOrderId ? { ...o, status: "cancelled" } : o));
    setReportIssueModalOpen(false);
    setSelectedOrderId(null);
    setReportReason("");
    setReportDescription("");
  };

  const resetSession = () => {
    // Reset for next session
    setDriverStatus("menunggu_customer");
    setCountdown(900);
    fetchOrders(); // Refresh from backend
  };

  const handleLogout = () => {
    localStorage.removeItem("jastip_driver_session");
    router.push("/driver/login");
  };

  if (!driver) return null; // Wait for auth guard

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '120px' }}>
      {clientError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'red', color: 'white', zIndex: 9999, padding: '20px', whiteSpace: 'pre-wrap' }}>
          <h3>CLIENT ERROR DETECTED</h3>
          {clientError}
        </div>
      )}
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          Jastip<span>Driver</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowSubModal(true)} className="btn btn-primary" style={{ border: 'none', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>Langganan Saya</button>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ border: 'none' }}>Logout</button>
        </div>
      </nav>

      <section className="order-section fade-in visible" style={{ paddingTop: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Dashboard Operasional</h2>
            <p>Halo {driver.name}, kelola pesanan dan rute pengantaran Anda di sini.</p>
            {!loadingOrders && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                🔄 Auto-refresh setiap 10 detik • {activeOrders.length} pesanan aktif
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Toggle Ready / Istirahat */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: isResting ? 'var(--text-secondary)' : '#4ade80', fontWeight: isResting ? 'normal' : 'bold' }}>Ready</span>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  checked={isResting}
                  onChange={async (e) => {
                    const resting = e.target.checked;
                    setIsResting(resting);
                    
                    // Update local storage so it persists on refresh
                    if (driver) {
                      const updatedDriver = { ...driver, current_task: resting ? 'Istirahat' : 'Ready' };
                      setDriver(updatedDriver);
                      localStorage.setItem("jastip_driver_session", JSON.stringify(updatedDriver));
                    }
                    
                    // Update backend status real-time
                    try {
                      await fetch('/api/drivers', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: driver.id,
                          current_task: resting ? 'Istirahat' : 'Ready'
                        })
                      });
                    } catch (err) {
                      console.error("Failed to update status", err);
                    }

                    alert(resting ? "Anda sekarang berstatus ISTIRAHAT. Daftar orderan disembunyikan." : "Anda sekarang READY. Menunggu pesanan masuk...");
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span className="slider round" style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: isResting ? '#ffbd2e' : '#4ade80', 
                  transition: '.4s', borderRadius: '24px' 
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: isResting ? '28px' : '4px', bottom: '4px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                  }}></span>
                </span>
              </label>
              <span style={{ fontSize: '0.9rem', color: isResting ? '#ffbd2e' : 'var(--text-secondary)', fontWeight: isResting ? 'bold' : 'normal' }}>Istirahat</span>
            </div>
          </div>
        </div>

        {/* Subscription Modal */}
        {showSubModal && (
          <div className="modal-overlay" style={{ zIndex: 100 }}>
            <div className="modal-content glass-card fade-in visible" style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div className="modal-header">
                <h3 style={{ color: 'white' }}>Detail Langganan</h3>
                <button className="btn-close" onClick={() => setShowSubModal(false)}>×</button>
              </div>
              
              <div className="modal-body" style={{ padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status Akun</div>
                  <div style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{driver.status === 'active' ? 'Aktif' : 'Pending'}</div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sisa Waktu Langganan</div>
                  <div style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '0.5rem 0' }}>
                    {timeLeftStr || "Tidak Terbatas / Promo"}
                  </div>
                  {driver.expires_at && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Berakhir pada: {new Date(driver.expires_at).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn btn-secondary btn-block" 
                  onClick={() => router.push("/driver/subscribe")}
                  style={{ width: '100%' }}
                >
                  Perpanjang / Pilih Paket Lain
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="order-container glass-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isResting ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,189,46,0.1)', border: '1px solid #ffbd2e', borderRadius: '16px', marginTop: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
              <h3 style={{ color: '#ffbd2e', marginBottom: '0.5rem' }}>Anda Sedang Istirahat</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Geser tombol "Ready" di atas untuk kembali bekerja dan memuat data pesanan.</p>
            </div>
          ) : (
            <>
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
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {orders.filter((o: any) => o.status === "pending").length > 0 
                          ? 'Otomatis berangkat dalam' 
                          : 'Menunggu orderan masuk...'}
                      </span><br/>
                      <strong style={{ fontSize: '1.5rem', color: '#ffbd2e' }}>
                        {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                      </strong>
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
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Peta Rute Pengantaran (Tembalang)</h4>
                    <RouteMap points={activeOrders.map(o => ({ id: o.id, sequence: o.sequence }))} />
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

                {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                <p>Memuat pesanan dari server...</p>
              </div>
            ) : activeOrders.length === 0 ? (
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
                {activeOrders.map((order) => (
                  <div key={order.id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>

                    {/* Order Header */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: '#ffbd2e', color: '#000', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }}>Titik {order.sequence}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kode Plastik/Pesanan</p>
                          <span style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}</span>
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
                        <a href={order.mapsLink} target="_blank" rel="noreferrer" className="btn btn-primary pulse" style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#38bdf8', color: '#000', fontWeight: 'bold' }}>
                          🧭 Mulai Navigasi
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
                          {order.items.map((item: any) => (
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
          </>
          )}
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
                Pesanan <strong>{typeof selectedOrderId === 'string' ? selectedOrderId.slice(0, 8) : selectedOrderId}</strong> mewajibkan foto bukti (makanan ditaruh di rak/pagar).
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
                Jika terjadi insiden (menu habis total, ban bocor) yang membuat pesanan <strong>{typeof selectedOrderId === 'string' ? selectedOrderId.slice(0, 8) : selectedOrderId}</strong> tidak bisa dipenuhi, lapor di sini untuk membuat kode refund.
              </p>
              <form onSubmit={handleReportIssue}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Pilih Kendala</label>
                  <select required value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', outline: 'none' }}>
                    <option value="" style={{ color: 'black' }}>-- Pilih Kendala --</option>
                    <option value="sold_out" style={{ color: 'black' }}>Menu Kosong / Habis Total di Resto</option>
                    <option value="vehicle_issue" style={{ color: 'black' }}>Kendala Kendaraan (Mogok/Bocor)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white', display: 'block', marginBottom: '0.5rem' }}>Keterangan</label>
                  <textarea required rows={2} value={reportDescription} onChange={e => setReportDescription(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}></textarea>
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
