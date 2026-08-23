"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../landing.css";

export default function DriverSubscribe() {
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);

  useEffect(() => {
    // Auth Guard
    const sessionStr = localStorage.getItem("jastip_driver_session");
    if (!sessionStr) {
      router.push("/driver/login");
      return;
    }
    const session = JSON.parse(sessionStr);
    setDriver(session);
  }, [router]);

  const packages = [
    { id: 'harian', name: 'Paket Harian (Promo)', price: 0, desc: 'Akses narik gratis selama 1 hari (Promo terbatas)', color: '#38bdf8' },
    { id: 'premium', name: 'Premium (Coming Soon)', price: null, desc: 'Fitur ekstra, rute VIP, dan tanpa batas waktu.', color: '#a855f7' }
  ];

  const handleSimulatePayment = async (packageIdToProcess?: string) => {
    const targetPackage = packageIdToProcess || selectedPackage;
    if (!targetPackage || !driver) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/drivers/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver_id: driver.id,
          package_type: targetPackage
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengaktifkan langganan");
      }

      // Update session in local storage
      const newSession = { ...driver, ...data.driver, status: 'active' };
      localStorage.setItem("jastip_driver_session", JSON.stringify(newSession));

      alert(data.message);
      
      // Redirect to dashboard
      router.push("/driver");
      
    } catch (err: any) {
      alert(err.message);
      setIsProcessing(false);
      setShowQRIS(false);
    }
  };

  if (!driver) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛑</div>
        <h1 style={{ color: 'white', marginBottom: '1rem' }}>Akses Dashboard Terkunci</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Halo {driver.name}, status akun Anda saat ini adalah <strong>Pending (Belum Aktif)</strong>.<br/>
          Pilih paket berlangganan di bawah ini untuk mulai menerima orderan pelanggan.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', marginBottom: '3rem' }}>
        {packages.map(pkg => (
          <div 
            key={pkg.id} 
            className="glass-card fade-in visible"
            onClick={() => {
              if (pkg.price === null) {
                // Premium is coming soon, do nothing
                return;
              }
              setSelectedPackage(pkg.id);
              if (pkg.price === 0) {
                // Instan aktif tanpa QRIS jika gratis
                handleSimulatePayment(pkg.id);
              } else {
                setShowQRIS(true);
              }
            }}
            style={{ 
              width: '300px', 
              padding: '2rem', 
              cursor: pkg.price === null ? 'not-allowed' : 'pointer',
              border: selectedPackage === pkg.id ? `2px solid ${pkg.color}` : '1px solid var(--glass-border)',
              transform: selectedPackage === pkg.id ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s',
              opacity: pkg.price === null ? 0.6 : 1
            }}
          >
            <h3 style={{ color: pkg.color, marginBottom: '0.5rem' }}>{pkg.name}</h3>
            <h1 style={{ color: 'white', margin: '0 0 1rem 0' }}>
              {pkg.price === null ? 'SEGERA HADIR' : (pkg.price === 0 ? 'GRATIS' : `Rp ${pkg.price.toLocaleString('id-ID')}`)}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>
              {pkg.desc}
            </p>
            <button className="btn w-full" style={{ background: selectedPackage === pkg.id ? pkg.color : 'rgba(255,255,255,0.1)', color: selectedPackage === pkg.id ? '#000' : 'white' }}>
              {isProcessing && selectedPackage === pkg.id ? 'Memproses...' : (selectedPackage === pkg.id ? 'Terpilih' : 'Pilih Paket')}
            </button>
          </div>
        ))}
      </div>

      {/* Modal QRIS (Simulation) */}
      {showQRIS && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content glass-card fade-in visible" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'white' }}>Pembayaran QRIS</h3>
              <button className="btn-close" onClick={() => setShowQRIS(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem 1rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem' }}>
                <div style={{ width: '200px', height: '200px', background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 20px 20px', border: '10px solid white' }}></div>
              </div>
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Scan untuk Membayar</h4>
              <p style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Rp {(packages.find(p => p.id === selectedPackage)?.price || 0).toLocaleString('id-ID')}
              </p>
              
              <button 
                className="btn btn-primary btn-block pulse" 
                onClick={() => handleSimulatePayment()}
                disabled={isProcessing}
                style={{ background: '#4ade80', color: '#000', opacity: isProcessing ? 0.7 : 1 }}
              >
                {isProcessing ? "Memproses Aktivasi..." : "[Simulasi] Anggap Sudah Bayar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
