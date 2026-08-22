"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_DRIVERS, MOCK_MENUS, Driver, Menu } from "../data/mock";
import "../landing.css"; // Reuse the same styles for now

interface CartItem extends Menu {
  quantity: number;
}

export default function OrderPage() {
  // Order States
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

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
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          Jastip<span>Kilat</span>
        </div>
        <div className="nav-links">
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </nav>

      <section id="order-section" className="order-section fade-in visible">
        <div className="section-header">
          <h2>Mulai Pesananmu</h2>
          <p>Pilih driver yang sedang siap antre, dan pesan menu favoritmu sekarang.</p>
        </div>

        <div className="order-container glass-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {!selectedDriver ? (
            <div className="driver-selection fade-in visible">
              <h3>Driver Siap Antar</h3>
              <div className="driver-grid">
                {MOCK_DRIVERS.map((driver) => (
                  <div 
                    key={driver.id} 
                    className={`driver-card ${driver.status !== 'menunggu_customer' ? 'disabled' : ''}`}
                    onClick={() => driver.status === 'menunggu_customer' && setSelectedDriver(driver)}
                  >
                    <div className="driver-header">
                      <div className="driver-info">
                        <h4>{driver.name}</h4>
                        <span className="rating">⭐ {driver.rating}</span>
                      </div>
                      <span className={`status-badge ${driver.status === 'menunggu_customer' ? 'ready' : 'busy'}`}>
                        {driver.status === 'menunggu_customer' ? 'Menunggu Customer' : 
                         driver.status === 'mengantar_pesanan' ? 'Mengantar Pesanan' : 
                         driver.status === 'mengantri_di_kasir' ? 'Mengantri di Kasir' : 
                         'Menunggu Pesanan'}
                      </span>
                    </div>
                    <div className="driver-details">
                      <p>📍 {driver.restoName}</p>
                      {driver.status === 'menunggu_customer' && (
                        <p>⏱️ Akan mengantri di kasir dalam : {driver.eta}</p>
                      )}
                      <div className="slot-bar">
                        <div className="slot-progress" style={{ width: `${(driver.slotsFilled / driver.maxSlots) * 100}%` }}></div>
                      </div>
                      <p className="slot-text">Slot Terisi: {driver.slotsFilled}/{driver.maxSlots}</p>
                    </div>
                    {driver.status === 'menunggu_customer' && (
                      <button className="btn btn-primary w-full mt-4">Pilih Driver Ini</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="menu-selection fade-in visible">
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
          <div className="modal-content glass-card fade-in visible">
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
    </div>
  );
}
