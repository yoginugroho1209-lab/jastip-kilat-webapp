"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState(0);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Scroll Animation Observer
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el) => observer.observe(el));

    // Cleanup observer on unmount
    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    // Tracking Demo Mockup Animation
    const interval = setInterval(() => {
      setCurrentNode((prev) => (prev + 1) % 2); // 2 nodes in the demo
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          Jastip<span>Kilat</span>
        </div>
        <div className="nav-links">
          <a href="#features">Fitur</a>
          <a href="https://wa.me/6285624251767" target="_blank" rel="noopener noreferrer">Bantuan (085624251767)</a>
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#portals">Portal</a>
          <Link href="/order" className="btn btn-primary nav-btn">
            Pesan Sekarang
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <div className="badge">🚀 Khusus Area Tembalang & Banyumanik</div>
          <h1>
            Jastip Makanan <span className="highlight">Tanpa Markup Harga.</span>
          </h1>
          <p>
            Nikmati Mie Gacoan Setiabudi dengan harga asli kasir resto. Ongkir transparan, live tracking multi-titik, tanpa ribet chat manual.
          </p>
          <div className="hero-buttons">
            <Link href="/order" className="btn btn-primary">
              Mulai Pesan
            </Link>
            <a href="#how-it-works" className="btn btn-secondary">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="glass-card mockup">
            <div className="mockup-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mockup-body">
              <div className="tracking-demo">
                <div className="route">
                  <div className={`node ${currentNode === 0 ? "active" : ""}`}>
                    <div className="icon">🍜</div>
                    <div className="info">
                      <strong>Mie Gacoan Setiabudi</strong>
                      <span>Sedang Dimasak</span>
                    </div>
                  </div>
                  <div className="line"></div>
                  <div className={`node ${currentNode === 1 ? "active" : ""}`}>
                    <div className="icon">📍</div>
                    <div className="info">
                      <strong>Kos Tembalang</strong>
                      <span>Menunggu Pengantaran</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="features">
        <div className="section-header fade-in">
          <h2>Kenapa Memilih JastipKilat?</h2>
          <p>Berhenti bayar lebih. Kami hadirkan solusi yang menguntungkanmu.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card fade-in delay-1">
            <div className="feature-icon">💰</div>
            <h3>Harga Asli Kasir</h3>
            <p>
              Tidak ada markup bersembunyi seperti aplikasi food delivery lain. Kamu bayar sesuai harga asli resto.
            </p>
          </div>
          <div className="feature-card fade-in delay-2">
            <div className="feature-icon">🚚</div>
            <h3>Ongkir Transparan</h3>
            <p>
              Sistem batching order kami memungkinkan biaya ongkir dibagi secara efisien. Flat Rp 7.000 untuk 3.5km pertama.
            </p>
          </div>
          <div className="feature-card fade-in delay-3">
            <div className="feature-icon">🗺️</div>
            <h3>Live Tracking</h3>
            <p>
              Pantau pesananmu secara real-time. Tidak perlu registrasi ribet, langsung tahu kapan makanan tiba.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="section-header fade-in">
          <h2>Cara Kerja</h2>
          <p>Pesan makanan favoritmu hanya dalam 3 langkah mudah.</p>
        </div>
        <div className="steps-container">
          <div className="step fade-in delay-1">
            <div className="step-number">1</div>
            <h3>Pilih Driver</h3>
            <p>Lihat daftar driver yang sedang siap atau tunggu driver membuka antrean (Sesi Siap).</p>
          </div>
          <div className="step-line fade-in delay-1"></div>
          <div className="step fade-in delay-2">
            <div className="step-number">2</div>
            <h3>Bayar QRIS</h3>
            <p>Selesaikan pembayaran aman via QRIS. Uang aman di sistem sebelum diteruskan ke driver.</p>
          </div>
          <div className="step-line fade-in delay-2"></div>
          <div className="step fade-in delay-3">
            <div className="step-number">3</div>
            <h3>Lacak Pesanan</h3>
            <p>Dapatkan link live tracking. Makananmu akan diantar sesuai urutan rute terdekat.</p>
          </div>
        </div>
      </section>

      <section id="portals" className="pricing">
        <div className="section-header fade-in">
          <h2>Pilih Akses Anda</h2>
          <p>Satu platform terintegrasi untuk seluruh ekosistem JastipKilat.</p>
        </div>
        <div className="features-grid" style={{ marginTop: '2rem' }}>
          <Link href="/order" className="feature-card fade-in delay-1" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon" style={{ fontSize: '3rem', color: 'var(--accent-primary)' }}>🍔</div>
            <h3>Pelanggan</h3>
            <p>Pesan makanan favorit Anda tanpa markup harga dan lacak driver secara real-time.</p>
            <div className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Pesan Sekarang</div>
          </Link>
          
          <Link href="/driver/login" className="feature-card fade-in delay-2" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon" style={{ fontSize: '3rem', color: '#ffbd2e' }}>🛵</div>
            <h3>Mitra Driver</h3>
            <p>Mulai terima pesanan, kelola pendapatan, dan tarik penghasilan harian Anda.</p>
            <div className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%', borderColor: '#ffbd2e', color: '#ffbd2e' }}>Portal Driver</div>
          </Link>
        </div>
      </section>

      <section id="cta" className="cta fade-in">
        <div className="cta-content glass-card">
          <h2>Lapar? Pesan Sekarang.</h2>
          <p>Jangan tunggu lama. Pesan Mie Gacoan sekarang tanpa perlu khawatir harga melonjak.</p>
          <Link href="/order" className="btn btn-primary pulse">
            Mulai Pesan
          </Link>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div 
            className="footer-logo"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                router.push('/founder');
                return;
              }
              
              tapCountRef.current += 1;
              if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
              
              if (tapCountRef.current >= 5) {
                tapCountRef.current = 0;
                router.push('/founder');
              } else {
                tapTimeoutRef.current = setTimeout(() => {
                  tapCountRef.current = 0;
                }, 500); // reset if taps are more than 500ms apart
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            Jastip<span>Kilat</span>
          </div>
          <p 
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                router.push('/founder');
              }
            }}
            style={{ cursor: 'text' }}
            title="Copyright 2026"
          >
            &copy; 2026 JastipKilat. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
