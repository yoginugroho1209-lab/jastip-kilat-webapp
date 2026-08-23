"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../landing.css";

export default function DriverRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/drivers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name,
          phone,
          vehicle: `${vehicle} | EMAIL: ${email}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Pendaftaran gagal. Nomor WA mungkin sudah terdaftar.");
      }

      // Show success screen instead of redirecting
      setIsSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <div className="glass-card bounce-in" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>Data Berhasil Terkirim!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Tahap selanjutnya, Anda <strong>wajib</strong> mengirimkan foto dokumen pendukung (KTP, SIM C, dan STNK) ke WhatsApp Admin untuk proses verifikasi.
          </p>
          <a 
            href={`https://wa.me/6285624251767?text=Halo%20Admin,%20saya%20${name}%20sudah%20mengisi%20form%20pendaftaran%20driver.%20Berikut%20saya%20lampirkan%20dokumen%20KTP,%20SIM,%20dan%20STNK%20saya:`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary pulse"
            style={{ display: 'block', width: '100%', background: '#4ade80', color: 'black', marginBottom: '1rem' }}
          >
            Kirim Berkas via WhatsApp ➔
          </a>
          <Link href="/" className="btn btn-secondary" style={{ display: 'block', width: '100%' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="background-effects">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
        <Link href="/driver/login" className="btn btn-secondary">← Kembali ke Login</Link>
      </div>

      <div className="glass-card bounce-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(90deg, #4ade80, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Daftar Mitra Jastip
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Lengkapi data di bawah untuk bergabung.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 95, 86, 0.1)', border: '1px solid #ff5f56', color: '#ff5f56', padding: '10px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Nama Lengkap</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Nomor WhatsApp</label>
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Alamat Email (Gmail)</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
              placeholder="Contoh: budi@gmail.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Jenis & Plat Kendaraan</label>
            <input 
              type="text" 
              required 
              value={vehicle} 
              onChange={(e) => setVehicle(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
              placeholder="Contoh: Honda Beat (H 1234 AB)"
            />
          </div>

          <div style={{ background: 'rgba(255, 189, 46, 0.05)', borderLeft: '4px solid #ffbd2e', padding: '12px', borderRadius: '0 8px 8px 0', marginBottom: '2rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Syarat Dokumen:</strong> Setelah mendaftar, Anda wajib mengirimkan foto <strong>KTP, SIM C, dan STNK</strong> asli ke WhatsApp Admin untuk proses verifikasi.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary pulse" 
            style={{ width: '100%', background: '#4ade80', color: '#000', opacity: loading ? 0.7 : 1, marginBottom: '1rem' }}
          >
            {loading ? "Memproses..." : "Daftar & Lanjut Kirim Berkas"}
          </button>
        </form>
      </div>
    </div>
  );
}
