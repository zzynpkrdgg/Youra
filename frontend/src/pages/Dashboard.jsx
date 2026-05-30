import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') fetchDashboard();
  }, [user]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="page-wrapper"><div className="spinner"></div></div>;
  }

  if (!stats) return <div className="page-wrapper">Veri yüklenemedi.</div>;

  const barData = {
    labels: stats.charts.categories.map(c => c.name),
    datasets: [
      {
        label: 'Kıyafet Sayısı',
        data: stats.charts.categories.map(c => c.value),
        backgroundColor: '#ec4899',
      },
    ],
  };

  const pieData = {
    labels: stats.charts.colors.map(c => c.name),
    datasets: [
      {
        label: 'Renk Dağılımı',
        data: stats.charts.colors.map(c => c.value),
        backgroundColor: stats.charts.colors.map(c => c.hex),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-wrapper animate-fadein">
      <div className="dashboard-container">
        <h1 className="dashboard-title">SİSTEM YÖNETİMİ</h1>
        
        {/* Top Stats */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <h3>TOPLAM KULLANICI</h3>
            <span>{stats.stats.totalUsers}</span>
          </div>
          <div className="dashboard-stat-card">
            <h3>TOPLAM KIYAFET</h3>
            <span>{stats.stats.totalClothes}</span>
          </div>
          <div className="dashboard-stat-card">
            <h3>TOPLAM KOMBİN</h3>
            <span>{stats.stats.totalOutfits}</span>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-charts-grid">
          <div className="dashboard-chart-card">
            <h2>KATEGORİ DAĞILIMI</h2>
            <div style={{ width: '100%', height: 300 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          <div className="dashboard-chart-card">
            <h2>RENK DAĞILIMI</h2>
            <div style={{ width: '100%', height: 300 }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="dashboard-table-card">
          <h2>SON KAYIT OLAN KULLANICILAR</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map(u => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
