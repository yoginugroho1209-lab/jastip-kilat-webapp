"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase/client";
import "../landing.css";

export default function TrackingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeOrdersList, setActiveOrdersList] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showComplaintBtn, setShowComplaintBtn] = useState(false);

  // Map backend status to tracking node index
  const getNodeFromStatus = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'cooking': return 1;
      case 'on_the_way': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentNode = orderData ? getNodeFromStatus(orderData.status) : 0;

  // Fetch order data from API
  const fetchOrder = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data && !data.error) {
        setOrderData(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setLoading(false);
    }
  }, []);

  const fetchActiveOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/history`); // Since history returns all, we can filter client side or backend
      const data = await res.json();
      if (Array.isArray(data)) {
        const active = data.filter(o => ['pending', 'cooking', 'on_the_way'].includes(o.status));
        setActiveOrdersList(active);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  // Load order ID from localStorage and fetch
  useEffect(() => {
    const savedId = localStorage.getItem("jastip_active_order_id");
    if (savedId) {
      setOrderId(savedId);
      fetchOrder(savedId);
    } else {
      fetchActiveOrders();
    }
  }, [fetchOrder, fetchActiveOrders]);

  // Fallback Polling + Real-time updates via Supabase
  useEffect(() => {
    // Fallback polling
    const interval = setInterval(() => {
      if (orderId) fetchOrder(orderId);
      else fetchActiveOrders();
    }, 10000);

    // Realtime channel
    const channelId = orderId ? `tracking_order_${orderId}` : `tracking_all_active`;
    const filter = orderId 
      ? { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }
      : { event: '*', schema: 'public', table: 'orders' };

    const channel = supabase.channel(channelId)
      .on('postgres_changes', filter as any, payload => {
        if (orderId) fetchOrder(orderId);
        else fetchActiveOrders();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchOrder, fetchActiveOrders]);

  useEffect(() => {
    if (orderData && orderData.created_at) {
      // 2 hours in ms = 2 * 60 * 60 * 1000 = 7200000
      const orderTime = new Date(orderData.created_at).getTime();
      if (Date.now() - orderTime > 7200000) {
        setShowComplaintBtn(true);
      } else {
        setShowComplaintBtn(false);
      }
    }
  }, [orderData]);

  const statuses = [
    { icon: "🛒", title: "Pesanan Diterima", desc: "Driver telah menerima pesanan Anda" },
    { icon: "🍜", title: "Sedang Dimasak", desc: "Mie Gacoan sedang disiapkan oleh resto" },
    { icon: "🛵", title: "Dalam Perjalanan", desc: "Driver sedang menuju titik antar" },
    { icon: "📍", title: "Pesanan Tiba", desc: "Silakan ambil pesanan Anda" },
  ];

  // Get driver name and items from real order data
  const driverName = orderData?.driver_name || "Driver";
  const orderItems = orderData?.order_items || [];
  const totalPrice = orderData?.total_price || (typeof window !== 'undefined' ? parseInt(localStorage.getItem("jastip_last_total") || "0") : 0);

  const handleFinishOrder = async () => {
    setRatingSubmitted(true);

    const finalRating = rating > 0 ? rating : 5;

    // Update rating via API
    if (orderId) {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: finalRating })
        });
      } catch (err) {
        console.error("Failed to submit rating:", err);
      }
    }

    // Clean up local storage
    localStorage.removeItem("jastip_active_order_id");
    localStorage.removeItem("jastip_last_total");

    // Redirect back after 2 seconds
    setTimeout(() => {
      router.push("/order");
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', textAlign: 'center', color: 'white', minHeight: '100vh' }}>
        <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <p>Memuat data pesanan...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{ paddingTop: '100px', textAlign: 'center', color: 'white', minHeight: '100vh' }}>
        <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <nav className="navbar">
          <div className="logo">Jastip<span>Kilat</span></div>
          <div className="nav-links">
            <Link href="/order" className="btn btn-secondary">Kembali ke Order</Link>
          </div>
        </nav>
        
        {activeOrdersList.length > 0 ? (
          <div style={{ paddingTop: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'left', padding: '0 20px' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Pilih Pesanan yang Sedang Diproses</h3>
            {activeOrdersList.map(order => (
              <div 
                key={order.id} 
                className="glass-card" 
                style={{ padding: '1.5rem', marginBottom: '1rem', cursor: 'pointer', border: '1px solid var(--accent-primary)' }}
                onClick={() => {
                  setOrderId(order.id);
                  setLoading(true);
                  fetchOrder(order.id);
                  localStorage.setItem("jastip_active_order_id", order.id);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-primary)' }}>Order: {order.id.slice(0,8)}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Driver: {order.driver_name || 'Menunggu'}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'white' }}>Rp {order.total_price.toLocaleString('id-ID')}</p>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>➔</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ paddingTop: '80px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3>Tidak ada pesanan aktif</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Silakan buat pesanan terlebih dahulu.</p>
            <Link href="/order" className="btn btn-primary">Pesan Sekarang</Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '120px' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          Jastip<span>Kilat</span>
        </div>
        <div className="nav-links">
          <Link href="/order" className="btn btn-secondary">Kembali ke Order</Link>
        </div>
      </nav>

      <section className="order-section fade-in visible" style={{ paddingTop: '2rem' }}>
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h2>Live Tracking</h2>
          <p>Lacak pesanan Anda secara real-time</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            🔄 Auto-refresh setiap 5 detik • Order: {typeof orderId === 'string' ? orderId.slice(0, 8) : orderId}
          </p>
        </div>

        <div className="order-container glass-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Simulated Map Area (Only visible after cooking) */}
          {currentNode >= 2 ? (
            <div style={{
              width: '100%',
              height: '250px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', opacity: 0.1, fontSize: '150px' }}>🗺️</div>
              <div className="bounce-in" style={{ zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '50px', border: '1px solid var(--accent-primary)' }}>
                <span style={{ fontSize: '1.2rem' }}>{statuses[currentNode].icon} {statuses[currentNode].title}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>{statuses[currentNode].icon}</div>
              <h4 style={{ color: 'white' }}>Driver Sedang Memproses Pesanan</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Map Live Tracking akan muncul setelah driver mulai mengantar.</p>
            </div>
          )}

          {/* Order Items Summary */}
          {orderItems.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'white' }}>Detail Pesanan Anda</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {orderItems.map((item: any) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                    <div>
                      <strong style={{ color: 'white' }}>{item.quantity}x {item.menus?.name || 'Menu'}</strong>
                      {item.notes && <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{item.notes}"</p>}
                    </div>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                      Rp {((item.menus?.price || 0) * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: 'white' }}>Total</strong>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>Rp {totalPrice.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="tracking-demo" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'white' }}>Status Pesanan</h4>
            <div className="route">
              {statuses.map((status, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={`node ${index <= currentNode ? "active" : ""}`}>
                    <div className="icon" style={{ opacity: index <= currentNode ? 1 : 0.5 }}>{status.icon}</div>
                    <div className="info">
                      <strong style={{ color: index <= currentNode ? 'white' : 'var(--text-secondary)' }}>{status.title}</strong>
                      <span>{status.desc}</span>
                    </div>
                  </div>
                  {index < statuses.length - 1 && (
                    <div className="line" style={{ background: index < currentNode ? 'var(--accent-primary)' : 'var(--glass-border)' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Driver Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Driver Anda</p>
              <h4 style={{ fontSize: '1.2rem', margin: '4px 0' }}>{driverName}</h4>
              <p style={{ fontSize: '0.9rem', color: '#ffbd2e' }}>⭐ 4.8</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Alamat Drop-off</p>
              <p style={{ fontSize: '0.9rem', color: 'white', margin: 0 }}>{orderData.dropoff_address}</p>
            </div>
          </div>

          {/* Laporkan Kendala Button */}
          {currentNode < 3 && orderData?.driver_id && showComplaintBtn && (
            <div style={{ textAlign: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '8px' }}
                onClick={async () => {
                  const reason = prompt("Silakan masukkan keluhan/kendala Anda (misal: Driver tidak bisa dihubungi lebih dari 2 jam):");
                  if (reason) {
                    try {
                      // Send notification/update driver log logic
                      const res = await fetch(`/api/drivers?id=${orderData.driver_id}`);
                      const driver = await res.json();
                      if (driver && driver.id) {
                        await fetch('/api/drivers', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: driver.id,
                            vehicle: (driver.vehicle || '') + ` | LAPORAN: ${reason}`
                          })
                        });
                        alert("Laporan berhasil dikirim ke Admin. Kami akan segera menindaklanjuti.");
                      }
                    } catch (err) {
                      console.error("Gagal mengirim laporan:", err);
                      alert("Terjadi kesalahan saat mengirim laporan.");
                    }
                  }
                }}
              >
                ⚠️ Laporkan Kendala (Terlalu Lama)
              </button>
            </div>
          )}

          {/* Post-Delivery Rating Section */}
          {currentNode === 3 && (
            <div className="post-delivery fade-in visible" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Pesanan Telah Tiba!</h3>

              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Bukti Pengantaran:</p>
                <div style={{ width: '100%', maxWidth: '300px', height: '200px', background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)', margin: '0 auto', borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '3rem' }}>📷</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>[Foto bukti dari Driver]</span>
                </div>
              </div>

              {!ratingSubmitted ? (
                <div className="rating-form">
                  <h4 style={{ marginBottom: '1rem', color: 'white' }}>Beri Penilaian untuk {driverName}</h4>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '2rem', cursor: 'pointer', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        style={{ color: (hoveredRating || rating) >= star ? '#ffbd2e' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <textarea placeholder="Ceritakan alasan penilaian Anda (Opsional)..." rows={3} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}></textarea>
                  </div>
                  <button
                    className={`btn btn-primary w-full`}
                    onClick={handleFinishOrder}
                  >
                    Kirim Penilaian & Selesai
                  </button>
                  <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Jika dikosongkan, driver otomatis mendapat bintang 5.
                  </p>
                </div>
              ) : (
                <div className="rating-success fade-in visible" style={{ padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h4 style={{ color: 'white' }}>Terima kasih atas penilaian Anda!</h4>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Anda akan dialihkan kembali...</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
