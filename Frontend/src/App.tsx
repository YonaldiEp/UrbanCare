import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, NavLink } from "react-router-dom";
import { fetchWithAuth } from "./api";

type UserRole = "WARGA" | "PETUGAS" | "ADMIN";

type UserData = {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
};

type Session = {
  token: string;
  user: UserData;
};

type AuthContextValue = {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// ----------------------
// LAYOUT & COMPONENTS
// ----------------------

function PrivatePage({ page, allowedRoles }: { page: ReactNode, allowedRoles?: UserRole[] }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppShell>{page}</AppShell>;
}

function AppShell({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <aside className="panel" style={{ width: '280px', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface-solid)' }}>
        <div className="brand-logo" style={{ marginBottom: '2.5rem', marginTop: '1rem', paddingLeft: '0.5rem' }}>
          <span>Urban<strong>Care</strong></span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <NavLink to="/dashboard" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
            Laporan Publik
          </NavLink>
          
          {session?.user.role === 'WARGA' && (
            <>
              <NavLink to="/create-report" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
                Buat Laporan Baru
              </NavLink>
              <NavLink to="/my-reports" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
                Riwayat Laporanku
              </NavLink>
            </>
          )}

          {(session?.user.role === 'PETUGAS' || session?.user.role === 'ADMIN') && (
            <NavLink to="/admin" className={({isActive}) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start' }}>
              Panel Manajemen Petugas
            </NavLink>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ margin: '0 0 15px 5px', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Masuk sebagai:<br/>
            <strong style={{ color: 'var(--text)' }}>{session?.user.name}</strong><br/>
            <span style={{ fontSize: '0.8rem' }}>({session?.user.role})</span>
          </div>
          <button onClick={logout} className="btn btn-ghost full-width" style={{ color: 'var(--danger)', justifyContent: 'flex-start' }}>
            Keluar Sistem
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

// ----------------------
// PAGES
// ----------------------

function LandingPage() {
  const { session } = useAuth();
  
  return (
    <div className="landing-page">
      <header className="public-header" style={{ maxWidth: '1180px', margin: '1rem auto' }}>
        <div className="brand-logo" style={{ fontSize: '1.3rem' }}>
          Urban<strong>Care</strong>
        </div>
        <div className="public-actions">
          {session ? (
            <Link to="/dashboard" className="btn btn-primary">Buka Dasbor Utama</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Masuk</Link>
              <Link to="/register" className="btn btn-primary">Daftar Akun</Link>
            </>
          )}
        </div>
      </header>

      <section className="landing-section" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Sistem Pelaporan Infrastruktur Kota
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Platform resmi bagi warga untuk melaporkan kerusakan fasilitas umum, masalah lalu lintas, jalan berlubang, hingga kebersihan kota agar segera ditindaklanjuti oleh dinas terkait.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Mulai Melapor</Link>
          <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Lihat Laporan Publik</Link>
        </div>
      </section>

      <section className="landing-section" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pelaporan Mudah</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Warga dapat mengirimkan detail masalah, alamat lengkap, dan kategori kerusakan secara langsung melalui peramban tanpa perlu instalasi aplikasi khusus.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sistem Prioritas Warga</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Setiap laporan publik dapat didukung oleh warga lainnya. Semakin banyak dukungan yang terkumpul, semakin cepat penanganan yang akan dilakukan oleh petugas.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pantauan Transparan</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Status laporan selalu diperbarui oleh petugas dinas dari status "Pending", "Proses", hingga "Selesai". Warga bisa memantau perkembangan laporannya setiap saat.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify({ userId: email, password }) });
      login({ token: data.token, user: data.data });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--body-bg)' }}>
      <div className="panel" style={{ width: '400px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Masuk Sistem UrbanCare</h2>
        
        {error && <div className="status status-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nomor Induk / Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Kata Sandi</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" style={{ marginTop: '1rem', padding: '0.9rem' }}>Masuk</button>
        </form>
        <div style={{ marginTop: "2rem", textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Belum memiliki akun warga? <Link to="/register" style={{ color: 'var(--text)', fontWeight: 600 }}>Buat Akun</Link></p>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WARGA");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify({ userId: email, name, password, role }) });
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--body-bg)' }}>
      <div className="panel" style={{ width: '450px', padding: '2.5rem', margin: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Pendaftaran Akun Baru</h2>
        
        {error && <div className="status status-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>{error}</div>}
        
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Nomor Induk / Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Kata Sandi (Password)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Tipe Pengguna</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="WARGA">Warga Masyarakat</option>
              <option value="PETUGAS">Petugas / Instansi Terkait</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary full-width" style={{ marginTop: '1rem', padding: '0.9rem' }}>Daftarkan Akun</button>
        </form>
        <div style={{ marginTop: "2rem", textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Sudah memiliki akun? <Link to="/login" style={{ color: 'var(--text)', fontWeight: 600 }}>Masuk ke Sistem</Link></p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth("/reports").then(res => setReports(res.data)).catch(console.error);
  }, []);

  const upvote = async (id: number) => {
    try {
      await fetchWithAuth(`/reports/${id}/upvote`, { method: "POST" });
      const res = await fetchWithAuth("/reports");
      setReports(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'SELESAI': return 'status-success';
      case 'PROSES': return 'status-warning';
      case 'DITOLAK': return 'status-danger';
      default: return 'status-info';
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Daftar Laporan Publik</h1>
        <p style={{ color: 'var(--muted)' }}>Laporan kerusakan dan keluhan masyarakat yang masuk ke dalam sistem UrbanCare.</p>
      </div>
      
      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {reports.map(r => (
          <div key={r.id} className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div className="status status-neutral" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{r.category}</div>
              <div className={`status ${getStatusClass(r.status)}`}>{r.status}</div>
            </div>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', lineHeight: 1.4 }}>{r.title}</h3>
            <p style={{ margin: "0 0 1.5rem 0", fontSize: '0.95rem', color: 'var(--muted)', flex: 1, lineHeight: 1.6 }}>{r.description}</p>
            
            <div style={{ fontSize: "0.85rem", color: "var(--text)", background: 'var(--surface-muted)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
              <strong>Lokasi:</strong> {r.address}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Pelapor: <strong style={{ color: 'var(--text)' }}>{r.reporter_name}</strong><br/>
                Tanggal: {new Date(r.created_at).toLocaleDateString()}
              </div>
              <button onClick={() => upvote(r.id)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>
                Beri Dukungan ({r.upvotes})
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {reports.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Belum Ada Laporan Masuk</h3>
          <p style={{ color: 'var(--muted)' }}>Data pelaporan fasilitas publik masih kosong saat ini.</p>
        </div>
      )}
    </div>
  );
}

function CreateReportPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("INFRASTRUKTUR");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/reports", { method: "POST", body: JSON.stringify({ title, category, description, address }) });
      alert("Laporan berhasil diteruskan ke sistem!");
      navigate("/my-reports");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Formulir Pelaporan Baru</h1>
        <p style={{ color: 'var(--muted)' }}>Silakan isi data kerusakan infrastruktur atau fasilitas publik dengan akurat.</p>
      </div>

      <form onSubmit={submit} className="panel" style={{ display: "flex", flexDirection: "column", gap: "1.8rem", padding: '2.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.6rem', fontWeight: 600 }}>Judul Keluhan / Laporan</label>
          <input placeholder="Contoh: Lampu Lalu Lintas Mati di Simpang Lima" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.6rem', fontWeight: 600 }}>Kategori Kerusakan</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="INFRASTRUKTUR">Infrastruktur Jalan & Jembatan</option>
              <option value="KEBERSIHAN">Dinas Kebersihan & Sampah</option>
              <option value="FASILITAS_UMUM">Fasilitas Umum & Ruang Terbuka</option>
              <option value="LALU_LINTAS">Rambu & Lampu Lalu Lintas</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.6rem', fontWeight: 600 }}>Alamat Detail Lokasi</label>
            <input placeholder="Contoh: Jl. Diponegoro KM 2" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.6rem', fontWeight: 600 }}>Deskripsi Kronologi / Keadaan Terkini</label>
          <textarea placeholder="Ceritakan secara detail tingkat kerusakan atau potensi bahaya yang ditimbulkan..." value={description} onChange={e => setDescription(e.target.value)} required rows={6} />
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>Kirim Keluhan ke Dinas</button>
        </div>
      </form>
    </div>
  );
}

function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth("/reports/my-reports").then(res => setReports(res.data)).catch(console.error);
  }, []);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'SELESAI': return 'status-success';
      case 'PROSES': return 'status-warning';
      case 'DITOLAK': return 'status-danger';
      default: return 'status-info';
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Riwayat Laporanku</h1>
        <p style={{ color: 'var(--muted)' }}>Daftar seluruh laporan yang telah Anda serahkan kepada UrbanCare.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {reports.map(r => (
          <div key={r.id} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{r.title}</h3>
              <div className={`status ${getStatusClass(r.status)}`}>{r.status}</div>
            </div>
            
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>{r.description}</p>
            
            <div style={{ display: 'flex', background: 'var(--surface-muted)', padding: '1rem', borderRadius: '4px', gap: '2rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>LOKASI</span>
                <span style={{ fontSize: '0.95rem' }}>{r.address}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>TOTAL DUKUNGAN</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{r.upvotes} Warga</span>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Anda belum memiliki riwayat laporan.</p>
            <Link to="/create-report" className="btn btn-secondary">Mulai Buat Laporan</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchWithAuth("/reports").then(res => setReports(res.data)).catch(console.error);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchWithAuth(`/reports/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      const res = await fetchWithAuth("/reports");
      setReports(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };
  
  const getStatusClass = (status: string) => {
    switch(status) {
      case 'SELESAI': return 'status-success';
      case 'PROSES': return 'status-warning';
      case 'DITOLAK': return 'status-danger';
      default: return 'status-info';
    }
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Manajemen Tindak Lanjut Laporan</h1>
        <p style={{ color: 'var(--muted)' }}>Tinjau dan perbarui perkembangan perbaikan fasilitas secara sistematis.</p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-strong)", background: 'var(--surface-muted)' }}>
              <th style={{ padding: "1.2rem", fontWeight: 600 }}>Informasi Laporan</th>
              <th style={{ padding: "1.2rem", fontWeight: 600 }}>Lokasi & Kategori</th>
              <th style={{ padding: "1.2rem", fontWeight: 600 }}>Prioritas (Dukungan)</th>
              <th style={{ padding: "1.2rem", fontWeight: 600 }}>Status Aktual</th>
              <th style={{ padding: "1.2rem", fontWeight: 600 }}>Aksi Pembaruan</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", transition: 'background 0.2s', ':hover': { background: 'var(--row-hover)' } } as React.CSSProperties}>
                <td style={{ padding: "1.2rem" }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.4rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Pengirim: {r.reporter_name}</div>
                </td>
                <td style={{ padding: "1.2rem" }}>
                  <div style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>{r.address}</div>
                  <div style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--surface-muted-strong)', display: 'inline-block', borderRadius: '4px' }}>{r.category}</div>
                </td>
                <td style={{ padding: "1.2rem", fontSize: '1.1rem', fontWeight: 600 }}>
                  {r.upvotes} Suara
                </td>
                <td style={{ padding: "1.2rem" }}>
                  <div className={`status ${getStatusClass(r.status)}`}>{r.status}</div>
                </td>
                <td style={{ padding: "1.2rem" }}>
                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={{ padding: "0.5rem 1rem", minHeight: 'auto', background: 'var(--surface-solid)' }}>
                    <option value="PENDING">PENDING (Menunggu)</option>
                    <option value="PROSES">PROSES (Dikerjakan)</option>
                    <option value="SELESAI">SELESAI (Rampung)</option>
                    <option value="DITOLAK">DITOLAK (Batal)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>Belum ada entri laporan dalam basis data.</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem("UrbanCare-session");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (newSession: Session) => {
    localStorage.setItem("UrbanCare-session", JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem("UrbanCare-session");
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<PrivatePage page={<DashboardPage />} />} />
        <Route path="/create-report" element={<PrivatePage allowedRoles={['WARGA']} page={<CreateReportPage />} />} />
        <Route path="/my-reports" element={<PrivatePage allowedRoles={['WARGA']} page={<MyReportsPage />} />} />
        <Route path="/admin" element={<PrivatePage allowedRoles={['PETUGAS', 'ADMIN']} page={<AdminPanel />} />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
