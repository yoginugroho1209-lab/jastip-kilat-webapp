"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [currentNode, setCurrentNode] = useState(0);
  
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
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#pricing">Biaya</a>
          <a href="#cta" className="btn btn-primary nav-btn">
            Pesan Sekarang
          </a>
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
            <a href="#cta" className="btn btn-primary">
              Mulai Pesan
            </a>
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

      <section id="pricing" className="pricing">
        <div className="pricing-card glass-card fade-in">
          <h2>Struktur Biaya Transparan</h2>
          <ul className="pricing-list">
            <li>
              <span>Harga Menu</span>
              <strong>Sesuai Harga Kasir Resto</strong>
            </li>
            <li>
              <span>Ongkos Kirim (0 - 3.5 km)</span>
              <strong>Rp 7.000 (Flat)</strong>
            </li>
            <li>
              <span>Ongkir Tambahan ({">"} 3.5 km)</span>
              <strong>+Rp 2.000 / km</strong>
            </li>
            <li>
              <span>Platform Fee</span>
              <strong>Rp 500 / item</strong>
            </li>
          </ul>
          <div className="pricing-total">
            <span>Total Bayar</span>
            <strong>Menu + Ongkir + Fee</strong>
          </div>
        </div>
      </section>

      <section id="cta" className="cta fade-in">
        <div className="cta-content glass-card">
          <h2>Lapar? Pesan Sekarang.</h2>
          <p>Jangan tunggu lama. Pesan Mie Gacoan sekarang tanpa perlu khawatir harga melonjak.</p>
          <a href="#" className="btn btn-primary pulse">
            Buka Web App
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-logo">
            Jastip<span>Kilat</span>
          </div>
          <p>&copy; 2026 JastipKilat. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
