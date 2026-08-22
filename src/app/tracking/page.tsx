"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../landing.css";

export default function TrackingPage() {
  const [currentNode, setCurrentNode] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    // Simulate progression of order
    const interval = setInterval(() => {
      setCurrentNode((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 5000); // Progress every 5 seconds for simulation

    return () => clearInterval(interval);
  }, []);

  const statuses = [
    { icon: "🛒", title: "Pesanan Diterima", desc: "Driver telah menerima pesanan Anda" },
    { icon: "🍜", title: "Sedang Dimasak", desc: "Mie Gacoan sedang disiapkan oleh resto" },
    { icon: "🛵", title: "Dalam Perjalanan", desc: "Driver sedang menuju titik antar" },
    { icon: "📍", title: "Pesanan Tiba", desc: "Silakan ambil pesanan Anda" },
  ];

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
        </div>

        <div className="order-container glass-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Simulated Map Area */}
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
              <h4 style={{ fontSize: '1.2rem', margin: '4px 0' }}>Budi Santoso</h4>
              <p style={{ fontSize: '0.9rem', color: '#ffbd2e' }}>⭐ 4.8</p>
            </div>
            <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
              💬 Chat (Coming Soon)
            </button>
          </div>

          {/* Post-Delivery Rating Section */}
          {currentNode === 3 && (
            <div className="post-delivery fade-in visible" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Pesanan Telah Tiba!</h3>
              
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Bukti Pengantaran:</p>
                <div style={{ width: '100%', maxWidth: '300px', height: '200px', background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)', margin: '0 auto', borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '3rem' }}>📷</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>[Mockup Foto Makanan di Gerbang]</span>
                </div>
              </div>

              {!ratingSubmitted ? (
                <div className="rating-form">
                  <h4 style={{ marginBottom: '1rem', color: 'white' }}>Beri Penilaian untuk Budi Santoso</h4>
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
                    className={`btn btn-primary w-full ${rating === 0 ? 'disabled' : ''}`} 
                    disabled={rating === 0}
                    onClick={() => setRatingSubmitted(true)}
                  >
                    Kirim Penilaian
                  </button>
                </div>
              ) : (
                <div className="rating-success fade-in visible" style={{ padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <h4 style={{ color: 'white' }}>Terima kasih atas penilaian Anda!</h4>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Ulasan Anda sangat membantu Jastip Kilat menjadi lebih baik.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
