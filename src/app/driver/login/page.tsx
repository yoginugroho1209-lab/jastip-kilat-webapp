"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../landing.css";

export default function DriverLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem("jastip_saved_phone");
    const savedPin = localStorage.getItem("jastip_saved_pin");
    if (savedPhone && savedPin) {
      setPhone(savedPhone);
      setPin(savedPin);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/drivers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          phone,
          pin
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Terjadi kesalahan.");
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("jastip_saved_phone", phone);
        localStorage.setItem("jastip_saved_pin", pin);
      } else {
        localStorage.removeItem("jastip_saved_phone");
        localStorage.removeItem("jastip_saved_pin");
      }

      // Save session to local storage
      localStorage.setItem("jastip_driver_session", JSON.stringify(data.driver));

      // Redirect based on status
      if (data.driver.status === "accepted") {
        router.push("/driver/subscribe");
      } else {
        router.push("/driver");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <Link href="/" className="btn btn-secondary">← Kembali ke Beranda</Link>
      </div>

      <div className="glass-card bounce-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Portal Driver
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Login khusus Mitra Terverifikasi</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 95, 86, 0.1)', border: '1px solid #ff5f56', color: '#ff5f56', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Nomor WhatsApp Terdaftar</label>
            <input 
              type="tel" 
              required 
              value={phone} 
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
              placeholder="Contoh: 081234567890"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>PIN (4 Angka)</label>
            <input 
              type="password" 
              required 
              maxLength={4}
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', letterSpacing: '5px' }}
              placeholder="Masukkan 4 Angka PIN"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="rememberMe" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }}>
              Ingat Saya (Auto-fill)
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary pulse" 
            style={{ width: '100%', background: '#38bdf8', color: '#000', opacity: loading ? 0.7 : 1, marginBottom: '1rem' }}
          >
            {loading ? "Memeriksa..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Belum terdaftar sebagai Mitra?
          </p>
          <Link 
            href="/driver/register" 
            className="btn btn-secondary w-full"
            style={{ display: 'block', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid #4ade80' }}
          >
            Daftar Menjadi Mitra
          </Link>
        </div>
      </div>
    </div>
  );
}
