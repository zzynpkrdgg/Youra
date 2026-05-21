import { useState, useEffect } from 'react';
import './WeatherWidget.css';

// WMO Weather codes mapping
const getWeatherDetails = (code) => {
  if (code === 0) return { icon: '☀️', desc: 'AÇIK' };
  if (code === 1 || code === 2 || code === 3) return { icon: '⛅', desc: 'PARÇALI BULUTLU' };
  if (code === 45 || code === 48) return { icon: '🌫️', desc: 'SİSLİ' };
  if (code >= 51 && code <= 67) return { icon: '🌧️', desc: 'YAĞMURLU' };
  if (code >= 71 && code <= 77) return { icon: '❄️', desc: 'KARLI' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', desc: 'SAĞANAK YAĞIŞLI' };
  if (code === 95 || code === 96 || code === 99) return { icon: '⛈️', desc: 'FIRTINALI' };
  return { icon: '🌡️', desc: 'BİLİNMİYOR' };
};

export default function WeatherWidget({ staticMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  // Calendar states
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Gelecekte backend'den çekilecek verinin birebir simülasyonu
    const mockApiResponse = {
      "message": "Hava durumu getirildi",
      "location": { "latitude": 39.9208, "longitude": 32.8541 },
      "weather": {
          "temperature": 16.9,
          "windspeed": 12.7,
          "weathercode": 95,
          "time": "2026-05-21T14:00"
      }
    };
    
    // API çağrısını simüle etmek için küçük bir gecikme eklenebilir ama anında yüklensin
    setWeatherData(mockApiResponse.weather);
    
    // Takvim başlangıcını gelen veriye (veya bugüne) göre ayarla
    const d = new Date(mockApiResponse.weather.time);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    
    // Kombin sayfasında (staticMode) varsayılan olarak bugünü seç
    if (staticMode) {
      const today = new Date(mockApiResponse.weather.time);
      today.setHours(0,0,0,0);
      setSelectedDate(today.getTime());
    }
  }, [staticMode]);

  if (!weatherData) return null; // Veri yüklenene kadar boş

  // O anki tarihi 'bugün' olarak baz alıyoruz
  const todayTime = new Date(weatherData.time);
  todayTime.setHours(0,0,0,0);
  const todayMs = todayTime.getTime();

  const dateStr = todayTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const dayStr = todayTime.toLocaleDateString('tr-TR', { weekday: 'long' }).toUpperCase();
  const temp = `${Math.round(weatherData.temperature)}°`;
  const windInfo = `RÜZGAR: ${weatherData.windspeed} km/s`;
  
  const { icon, desc } = getWeatherDetails(weatherData.weathercode);

  const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
  const monthNames = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];

  // Calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay(); // 0: Sun
    return day === 0 ? 6 : day - 1; // 0: Mon ... 6: Sun
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(viewYear, viewMonth, i));
  }
  // Her zaman 6 haftalık (42 gün) sabit bir alan oluştur ki aydan aya boyut değişmesin
  while (calendarCells.length < 42) {
    calendarCells.push(null);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className={`weather-widget-wrapper ${staticMode ? 'static-mode' : ''}`}>
      <div className="weather-top-bar">
        <div className="weather-info-area">
          <div className="weather-left">
            <span className="weather-icon-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: 'none' }}>{icon}</span>
            <span className="weather-temp">{temp}</span>
          </div>
          <div className="weather-mid">
            {desc} • {windInfo}
          </div>
          <div className="weather-right">
            <div className="weather-date">{dateStr}</div>
            <div className="weather-day">{dayStr}</div>
          </div>
        </div>
        {!staticMode && (
          <button 
            className="weather-toggle-btn" 
            onClick={() => setExpanded(!expanded)} 
            title="Takvimi Aç/Kapat"
          >
            {expanded ? '↑' : '↓'}
          </button>
        )}
      </div>

      {(expanded || staticMode) && (
        <div className="weather-calendar-panel">
          <div className="weather-calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}>{'<'}</button>
            <span className="cal-month-title">{monthNames[viewMonth]} {viewYear}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>{'>'}</button>
          </div>
          <div className="cal-grid">
            {daysOfWeek.map(d => (
              <div key={d} className="cal-header-cell">{d}</div>
            ))}
            {calendarCells.map((date, i) => {
              if (!date) return <div key={i} className="cal-cell cal-cell--empty"></div>;
              
              const dateTime = date.getTime();
              const isToday = dateTime === todayMs;
              const isPast = dateTime < todayMs;
              const isSelected = selectedDate === dateTime;

              let cls = 'cal-cell';
              if (isPast) cls += ' cal-cell--past';
              else cls += ' cal-cell--selectable';

              if (isSelected) cls += ' cal-cell--selected';
              if (isToday) cls += ' cal-cell--today-indicator';

              const handleClick = () => {
                if (!staticMode) return; // Sadece kombin modunda gün seçilebilir
                if (isPast) return;      // Geçmiş seçilemez
                setSelectedDate(dateTime);
              };

              return (
                <div key={i} className={cls} onClick={handleClick}>
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
