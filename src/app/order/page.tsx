"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_DRIVERS, MOCK_MENUS, Driver, Menu } from "../data/mock";
import "../landing.css"; // Reuse the same styles

interface CartItem extends Menu {
  cartItemId: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  note: string;
}

export default function OrderPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  // API Data States
  const [apiDrivers, setApiDrivers] = useState<Driver[]>([]);
  const [apiMenus, setApiMenus] = useState<Menu[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
    setHasActiveOrder(localStorage.getItem("jastip_active_order") === "true");
    const history = JSON.parse(localStorage.getItem("jastip_history") || "[]");
    
    if (history.length === 0) {
      const dummy = [
        { id: "JK-98213", date: "21 Agu 2026, 12:30", driver: "Andi Wijaya", status: "Selesai", rating: 5, total: 45000 }
      ];
      localStorage.setItem("jastip_history", JSON.stringify(dummy));
      setOrderHistory(dummy);
    } else {
      setOrderHistory(history);
    }

    // Fetch API Data
    Promise.all([
      fetch('/api/drivers').then(r => r.json()),
      fetch('/api/menus').then(r => r.json())
    ]).then(([driversData, menusData]) => {
      // Map API drivers to UI format
      const mappedDrivers = (driversData || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        rating: 5.0,
        status: d.status === 'pending' ? 'menunggu_customer' : d.status,
        restoName: "Mie Gacoan Setiabudi",
        eta: "14:59",
        slotsFilled: 2,
        maxSlots: 5
      }));
      setApiDrivers(mappedDrivers);

      // Map API menus to UI format (add dummy options for Makanan)
      const mappedMenus = (menusData || []).filter((m:any) => m.is_available).map((m: any) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        category: m.category,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        options: m.category === 'Makanan' ? [
          { id: 'level', name: 'Level Pedas', choices: ['Level 1', 'Level 2', 'Level 3'] }
        ] : []
      }));
      setApiMenus(mappedMenus);
      setLoadingData(false);
    }).catch(err => {
      console.error(err);
      setApiDrivers(MOCK_DRIVERS); // fallback
      setApiMenus(MOCK_MENUS); // fallback
      setLoadingData(false);
    });

  }, []);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"cart" | "qris">("cart");
  
  // Customize Modal States
  const [activeCustomizeMenu, setActiveCustomizeMenu] = useState<Menu | null>(null);
  const [customizeOptions, setCustomizeOptions] = useState<Record<string, string>>({});
  const [customizeNote, setCustomizeNote] = useState("");

  // Checkout Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerMapsLink, setCustomerMapsLink] = useState("");

  const openCustomizeModal = (menu: Menu) => {
    setActiveCustomizeMenu(menu);
    setCustomizeNote("");
    // Set default options to first choice
    const defaults: Record<string, string> = {};
    menu.options?.forEach(opt => {
      defaults[opt.id] = opt.choices[0];
    });
    setCustomizeOptions(defaults);
  };

  const closeCustomizeModal = () => {
    setActiveCustomizeMenu(null);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    setPaymentStep("cart"); // Reset payment step when closed
  };

  const confirmAddToCart = () => {
    if (!activeCustomizeMenu) return;

    const optionsString = JSON.stringify(customizeOptions);
    const cartItemId = `${activeCustomizeMenu.id}_${optionsString}_${customizeNote}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        ...activeCustomizeMenu, 
        cartItemId, 
        quantity: 1, 
        selectedOptions: customizeOptions,
        note: customizeNote
      }];
    });

    closeCustomizeModal();
  };

  const addExistingCartItem = (cartItemId: string) => {
    setCart((prev) => prev.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.cartItemId !== cartItemId);
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalMenuPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = 7000;
  const platformFee = 500 * totalItems;
  const totalPrice = totalMenuPrice + deliveryFee + platformFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep("qris");
  };

  const simulatePaymentSuccess = async () => {
    // Send POST to /api/orders
    const orderPayload = {
      customer_name: customerName || "Customer Guest",
      customer_phone: customerPhone || "08000000000",
      dropoff_address: customerAddress || "Tembalang",
      delivery_fee: deliveryFee,
      sequence: 1, // hardcode for now
      items: cart.map(c => ({
        menu_id: c.id,
        quantity: c.quantity,
        notes: `${JSON.stringify(c.selectedOptions)} - ${c.note}`
      }))
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (e) {
      console.error("Order creation failed", e);
    }

    localStorage.setItem("jastip_active_order", "true");
    localStorage.setItem("jastip_last_total", totalPrice.toString());
    setCart([]);
    setIsCheckoutOpen(false);
    setSelectedDriver(null);
    setPaymentStep("cart");
    router.push("/tracking");
  };

  if (!mounted || loadingData) return <div style={{paddingTop: '100px', textAlign: 'center', color: 'white'}}>Memuat...</div>;

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
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </nav>

      <section id="order-section" className="order-section fade-in visible">
        <div className="section-header">
          <h2>Mulai Pesananmu</h2>
          <p>Pilih driver yang sedang siap antre, dan pesan menu favoritmu sekarang.</p>
        </div>

        {/* ACTIVE ORDER BANNER */}
        <div style={{ maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>
          {hasActiveOrder ? (
            <div className="glass-card bounce-in" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 189, 46, 0.05)', border: '1px solid rgba(255, 189, 46, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '2rem', animation: 'float 3s ease-in-out infinite' }}>🛵</div>
                <div>
                  <h4 style={{ color: '#ffbd2e', margin: '0 0 4px 0' }}>Pesanan Sedang Diproses</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Driver: Budi Santoso</p>
                </div>
              </div>
              <Link href="/tracking" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#ffbd2e', color: '#000' }}>
                Lacak Pesanan ➔
              </Link>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>💤</div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>Belum ada pesanan aktif</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Pesanan yang sedang dikerjakan driver akan muncul di sini.</p>
              </div>
            </div>
          )}
        </div>

        <div className="order-container glass-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {!selectedDriver ? (
            <div className="driver-selection fade-in visible">
              <h3>Driver Siap Antar</h3>
              <div className="driver-grid">
                {apiDrivers.map((driver) => (
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
              
              {/* ORDER HISTORY */}
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Riwayat Pesanan</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orderHistory.map((hist, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{hist.id}</span>
                        <h4 style={{ margin: '4px 0' }}>Driver: {hist.driver}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{hist.date}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '4px' }}>{hist.status}</span>
                        <div style={{ color: '#ffbd2e', fontSize: '0.9rem' }}>
                          {"★".repeat(hist.rating)}{"☆".repeat(5 - hist.rating)}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '0.9rem' }}>Rp {hist.total?.toLocaleString('id-ID') || '0'}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
              
              <div className="menu-note glass-card" style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  💡 <strong>Catatan:</strong> Harga menu sudah termasuk pajak restoran (PB1) dan pembulatan kasir. Tidak ada markup harga (100% harga asli).
                </p>
              </div>

              {["Makanan", "Dimsum", "Minuman"].map(category => (
                <div key={category} className="menu-category-section" style={{ marginBottom: '3rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--accent-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    {category}
                  </h3>
                  <div className="menu-grid">
                    {apiMenus.filter(menu => menu.category === category).map((menu) => {
                      return (
                        <div key={menu.id} className="menu-card">
                          <div className="menu-icon">{menu.image}</div>
                          <div className="menu-details">
                            <h4>{menu.name}</h4>
                            <p>{menu.description}</p>
                            <strong className="price">Rp {menu.price.toLocaleString('id-ID')}</strong>
                          </div>
                          <div className="menu-actions" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-add w-full" onClick={() => openCustomizeModal(menu)}>+ Tambah Pesanan</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {cart.length > 0 && !isCheckoutOpen && !activeCustomizeMenu && (
        <div className="floating-cart bounce-in" onClick={() => setIsCheckoutOpen(true)} style={{ zIndex: 90 }}>
          <div className="cart-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {totalItems} Item <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginLeft: '6px' }}>• Lihat Detail Pesanan</span>
            </span>
            <span className="cart-total" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <button className="btn btn-primary">Checkout ➔</button>
        </div>
      )}

      {/* Customize Menu Modal */}
      {activeCustomizeMenu && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in visible">
            <div className="modal-header">
              <h3>Custom Pesanan</h3>
              <button className="btn-close" onClick={closeCustomizeModal}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem' }}>{activeCustomizeMenu.image}</div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{activeCustomizeMenu.name}</h4>
                  <strong style={{ color: 'var(--accent-primary)' }}>Rp {activeCustomizeMenu.price.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {activeCustomizeMenu.options && activeCustomizeMenu.options.map(opt => (
                <div key={opt.id} className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', color: 'white' }}>{opt.name}</label>
                  <select 
                    value={customizeOptions[opt.id] || ''} 
                    onChange={e => setCustomizeOptions({...customizeOptions, [opt.id]: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', outline: 'none' }}
                  >
                    {opt.choices.map(choice => (
                      <option key={choice} value={choice} style={{ color: 'black' }}>{choice}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ fontWeight: 'bold', color: 'white' }}>Catatan Khusus (Opsional)</label>
                <textarea 
                  placeholder="Misal: Jangan pakai daun bawang, pedas dikit aja..." 
                  value={customizeNote} 
                  onChange={e => setCustomizeNote(e.target.value)}
                  rows={3}
                ></textarea>
              </div>

              <button className="btn btn-primary btn-block" onClick={confirmAddToCart}>
                Tambahkan ke Keranjang - Rp {activeCustomizeMenu.price.toLocaleString('id-ID')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content glass-card fade-in visible">
            <div className="modal-header">
              <h3>{paymentStep === "cart" ? "Keranjang & Checkout" : "Pembayaran QRIS"}</h3>
              <button className="btn-close" onClick={closeCheckoutModal}>×</button>
            </div>
            
            <div className="modal-body">
              {paymentStep === "cart" ? (
                <>
                  <div className="order-summary">
                <div className="summary-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                  {["Makanan", "Dimsum", "Minuman"].map(category => {
                    const itemsInCategory = cart
                      .filter(item => item.category === category)
                      .sort((a, b) => a.name.localeCompare(b.name));
                    
                    if (itemsInCategory.length === 0) return null;
                    
                    return (
                      <div key={category} style={{ marginBottom: '1rem' }}>
                        <h5 style={{ color: 'var(--accent-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '8px', fontSize: '1rem' }}>{category}</h5>
                        <ul style={{ listStyle: 'none' }}>
                          {itemsInCategory.map(item => (
                            <li key={item.cartItemId} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px dashed rgba(255,255,255,0.05)', padding: '10px 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <span style={{ color: 'white', fontWeight: 'bold' }}>{item.name}</span>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {Object.entries(item.selectedOptions).map(([k, v]) => <span key={k} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>{v}</span>)}
                                    {item.note && <span style={{ display: 'block', marginTop: '4px', fontStyle: 'italic' }}>"{item.note}"</span>}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', display: 'block' }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                  <div className="qty-controls" style={{ marginTop: '8px', padding: '2px 6px' }}>
                                    <button className="btn-qty" onClick={() => removeCartItem(item.cartItemId)} style={{ width: '20px', height: '20px', fontSize: '1rem' }}>-</button>
                                    <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                                    <button className="btn-qty" onClick={() => addExistingCartItem(item.cartItemId)} style={{ width: '20px', height: '20px', fontSize: '1rem' }}>+</button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="summary-fees" style={{ marginTop: '1rem' }}>
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

              <form className="checkout-form" onSubmit={handleCheckout} style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'white' }}>Data Pengiriman (Tanpa Registrasi)</h4>
                
                <div className="menu-note glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', borderLeft: '4px solid #ff5f56', background: 'rgba(255, 95, 86, 0.05)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ⚠️ <strong>Kebijakan Pengantaran Cepat:</strong> Driver <strong>tidak akan menunggu</strong> Anda keluar. Pesanan akan langsung ditaruh sesuai instruksi alamat Anda. Tuliskan detail alamat dan titik taruh selengkap mungkin. Risiko karena detail alamat yang tidak jelas di luar tanggung jawab driver.
                  </p>
                </div>

                <div className="form-group">
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nama Lengkap (Misal: Budi Kos)" />
                </div>
                <div className="form-group">
                  <input 
                    type="tel" 
                    required 
                    value={customerPhone} 
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                      setCustomerPhone(onlyNums);
                    }} 
                    placeholder="No. WhatsApp (081234...)" 
                  />
                </div>
                <div className="form-group">
                  <input type="url" required value={customerMapsLink} onChange={e => setCustomerMapsLink(e.target.value)} placeholder="Link Google Maps" />
                </div>
                <div className="form-group">
                  <textarea required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Alamat Terlengkap & Titik Taruh (Misal: Kos Kuning Jl. Banjarsari No 10, tolong ditaruh di gerbang hitam / titip satpam)" rows={3}></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-block">Bayar via QRIS Sekarang</button>
              </form>
              </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem' }}>
                    {/* Dummy QR Code using CSS squares */}
                    <div style={{ width: '200px', height: '200px', background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 20px 20px', border: '10px solid white' }}></div>
                  </div>
                  <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Scan untuk Membayar</h4>
                  <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Otomatis verifikasi setelah pembayaran berhasil.
                  </p>
                  <button className="btn btn-primary btn-block pulse" onClick={simulatePaymentSuccess}>
                    [Simulasi] Anggap Pembayaran Berhasil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
