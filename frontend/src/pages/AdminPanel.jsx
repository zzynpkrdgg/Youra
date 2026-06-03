import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './AdminPanel.css';

// Dashboard için daha renkli ve canlı palet
const CHART_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#f43f5e', '#06b6d4', '#84cc16'];

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/profile');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Veriler alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: 'red' }}>HATA: {error}</h2>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <div className="admin-container animate-fadein">
        <div className="admin-header">
          <h1 className="admin-title">ADMİN PANELİ</h1>
          <p className="admin-subtitle">Uygulama istatistikleri ve genel bakış</p>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h2 className="admin-card-title">TOPLAM KULLANICI</h2>
            <div className="admin-card-content">
              <span className="admin-stat-number">{stats?.totalUsers || 0}</span>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-card-title">TOPLAM KIYAFET</h2>
            <div className="admin-card-content">
              <span className="admin-stat-number">{stats?.totalClothes || 0}</span>
            </div>
          </div>
          <div className="admin-card">
            <h2 className="admin-card-title">TOPLAM KOMBİN</h2>
            <div className="admin-card-content">
              <span className="admin-stat-number">{stats?.totalOutfits || 0}</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="admin-charts-grid">
          <div className="admin-chart-section">
            <h2 className="admin-card-title">KIYAFET RENK DAĞILIMI</h2>
            <div className="admin-chart-container">
              {stats?.colorDistribution && stats.colorDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.colorDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stats.colorDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} 
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-text)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Yeterli veri yok.</p>
              )}
            </div>
          </div>

          <div className="admin-chart-section">
            <h2 className="admin-card-title">KOMBİN TÜRÜ DAĞILIMI</h2>
            <div className="admin-chart-container">
              {stats?.occasionDistribution && stats.occasionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.occasionDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {stats.occasionDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-text)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Yeterli veri yok.</p>
              )}
            </div>
          </div>
        </div>

        <div className="admin-chart-section">
          <h2 className="admin-card-title">SON 7 GÜNLÜK KAYITLAR</h2>
          <div className="admin-chart-container">
            {stats?.dailyUsers && stats.dailyUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-2)" opacity={0.3} />
                  <XAxis dataKey="_id" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} />
                  <YAxis stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-text)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Yeni Kullanıcı" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', marginTop: '20px' }}>Son 7 gün için kayıtlı kullanıcı bulunamadı.</p>
            )}
          </div>
        </div>

        <div className="admin-chart-section">
          <h2 className="admin-card-title">SON KAYIT OLAN KULLANICILAR</h2>
          <div className="admin-table-container">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kullanıcı Adı</th>
                    <th>Email</th>
                    <th>Kayıt Tarihi ve Saati</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map(u => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', marginTop: '20px' }}>Henüz kullanıcı yok.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
