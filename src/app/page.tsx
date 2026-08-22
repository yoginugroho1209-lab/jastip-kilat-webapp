"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_DRIVERS, MOCK_MENUS, Driver, Menu } from "./data/mock";

interface CartItem extends Menu {
  quantity: number;
}

export default function Home() {
  const [currentNode, setCurrentNode] = useState(0);
  
  // Order States
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

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
  }, [selectedDriver]); // Re-run observer when view changes

  useEffect(() => {
    // Tracking Demo Mockup Animation
    const interval = setInterval(() => {
      setCurrentNode((prev) => (prev + 1) % 2); // 2 nodes in the demo
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = (menu: Menu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...menu, quantity: 1 }];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menuId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === menuId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== menuId);
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalMenuPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 7000;
  const platformFee = 500 * totalItems;
  const totalPrice = totalMenuPrice + deliveryFee + platformFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pesanan Berhasil Dibuat!\nNama: ${customerName}\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}\n(Mockup Only - Belum tersambung ke backend)`);
    setCart([]);
    setIsCheckoutOpen(false);
    setSelectedDriver(null);
  };

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
          <a href="#order-section" className="btn btn-primary nav-btn">
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
            <a href="#order-section" className="btn btn-primary">
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

      <section id="order-section" className="order-section fade-in">
        <div className="section-header">
          <h2>Mulai Pesananmu</h2>
          <p>Pilih driver yang sedang siap antre, dan pesan menu favoritmu sekarang.</p>
        </div>

        <div className="order-container glass-card">
          {!selectedDriver ? (
            <div className="driver-selection fade-in">
              <h3>Driver Siap Antar</h3>
              <div className="driver-grid">
                {MOCK_DRIVERS.map((driver) => (
                  <div 
                    key={driver.id} 
                    className={`driver-card ${driver.status === 'busy' ? 'disabled' : ''}`}
                    onClick={() => driver.status === 'ready' && setSelectedDriver(driver)}
                  >
                    <div className="driver-header">
                      <div className="driver-info">
                        <h4>{driver.name}</h4>
                        <span className="rating">⭐ {driver.rating}</span>
                      </div>
                      <span className={`status-badge ${driver.status}`}>
                        {driver.status === 'ready' ? 'Siap Antar' : 'Sesi Penuh'}
                      </span>
                    </div>
                    <div className="driver-details">
                      <p>📍 {driver.restoName}</p>
                      <p>⏱️ Estimasi: {driver.eta}</p>
                      <div className="slot-bar">
                        <div className="slot-progress" style={{ width: `${(driver.slotsFilled / driver.maxSlots) * 100}%` }}></div>
                      </div>
                      <p className="slot-text">Slot Terisi: {driver.slotsFilled}/{driver.maxSlots}</p>
                    </div>
                    {driver.status === 'ready' && (
                      <button className="btn btn-primary w-full mt-4">Pilih Driver Ini</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="menu-selection fade-in">
              <div className="menu-header">
                <button className="btn-back" onClick={() => setSelectedDriver(null)}>
                  ← Kembali ke Daftar Driver
                </button>
                <div className="active-driver-info">
                  <h3>Pesan dari {selectedDriver.restoName}</h3>
                  <p>Driver: {selectedDriver.name} (Sisa slot: {selectedDriver.maxSlots - selectedDriver.slotsFilled})</p>
                </div>
              </div>
              
              <div className="menu-grid">
                {MOCK_MENUS.map((menu) => {
                  const cartItem = cart.find(item => item.id === menu.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  
                  return (
                    <div key={menu.id} className="menu-card">
                      <div className="menu-icon">{menu.image}</div>
                      <div className="menu-details">
                        <h4>{menu.name}</h4>
                        <p>{menu.description}</p>
                        <strong className="price">Rp {menu.price.toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="menu-actions">
                        {qty === 0 ? (
                          <button className="btn btn-add" onClick={() => addToCart(menu)}>+ Tambah</button>
                        ) : (
                          <div className="qty-controls">
                            <button className="btn-qty" onClick={() => removeFromCart(menu.id)}>-</button>
                            <span>{qty}</span>
                            <button className="btn-qty" onClick={() => addToCart(menu)}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {cart.length > 0 && !isCheckoutOpen && (
        <div className="floating-cart bounce-in" onClick={() => setIsCheckoutOpen(true)}>
          <div className="cart-info">
            <span className="cart-count">{totalItems} Item</span>
            <span className="cart-total">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <button className="btn btn-primary">Checkout ➔</button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in">
            <div className="modal-header">
              <h3>Checkout Pesanan</h3>
              <button className="btn-close" onClick={() => setIsCheckoutOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-summary">
                <h4>Ringkasan Pesanan</h4>
                <ul className="summary-list">
                  {cart.map(item => (
                    <li key={item.id}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </li>
                  ))}
                </ul>
                <div className="summary-fees">
                  <div className="fee-row">
                    <span>Ongkos Kirim (Flat)</span>
                    <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="fee-row">
                    <span>Platform Fee (Rp 500/item)</span>
                    <span>Rp {platformFee.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="summary-total">
                  <strong>Total Bayar</strong>
                  <strong>Rp {totalPrice.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <form className="checkout-form" onSubmit={handleCheckout}>
                <h4>Data Pengiriman (Tanpa Registrasi)</h4>
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Misal: Budi Kos" />
                </div>
                <div className="form-group">
                  <label>No. WhatsApp</label>
                  <input type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="08123456789" />
                </div>
                <div className="form-group">
                  <label>Alamat Lengkap (Kos/Rumah)</label>
                  <textarea required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Misal: Kos Warna Kuning, Jl. Banjarsari No 10..." rows={3}></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-block">Bayar via QRIS Sekarang</button>
              </form>
            </div>
          </div>
        </div>
      )}

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
