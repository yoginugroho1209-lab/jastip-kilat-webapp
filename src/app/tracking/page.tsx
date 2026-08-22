"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../landing.css";

export default function TrackingPage() {
  const [currentNode, setCurrentNode] = useState(0);

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
            <button className="btn btn-primary" onClick={() => alert("Simulasi membuka WhatsApp Driver...")}>
              💬 Chat Driver
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
