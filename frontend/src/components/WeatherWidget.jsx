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
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return false;
    return staticMode;
  });
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  // Calendar states
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Gelecekte backend'den çekilecek verinin birebir simülasyonu (7 günlük)
    const baseTime = new Date();
    baseTime.setHours(0,0,0,0);
    const mockForecast = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(baseTime);
      d.setDate(d.getDate() + i);
      d.setHours(12,0,0,0); // Öğlen vakti havası
      return {
        temperature: 15 + Math.random() * 5,
        windspeed: 10 + Math.random() * 5,
        weathercode: [0, 1, 3, 45, 51, 71, 95][Math.floor(Math.random() * 7)],
        time: d.toISOString()
      };
    });

    const mockApiResponse = {
      message: "Hava durumu getirildi",
      location: { latitude: 39.9208, longitude: 32.8541 },
      weather: mockForecast[0],
      forecast: mockForecast
    };
    
    setWeatherData(mockApiResponse.weather);
    setForecastData(mockApiResponse.forecast);
    
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

  // Seçili tarihe ait hava durumunu bul
  let activeWeather = weatherData;
  if (selectedDate && forecastData) {
    const selectedForecast = forecastData.find(f => {
      const fd = new Date(f.time);
      fd.setHours(0,0,0,0);
      return fd.getTime() === selectedDate;
    });
    if (selectedForecast) activeWeather = selectedForecast;
  }

  const activeTime = new Date(activeWeather.time);
  const dateStr = activeTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const dayStr = activeTime.toLocaleDateString('tr-TR', { weekday: 'long' }).toUpperCase();
  const temp = `${Math.round(activeWeather.temperature)}°`;
  const windInfo = `RÜZGAR: ${Math.round(activeWeather.windspeed)} km/s`;
  
  const { icon, desc } = getWeatherDetails(activeWeather.weathercode);

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
          <button 
            className="weather-toggle-btn" 
            onClick={() => setExpanded(!expanded)} 
            title="Takvimi Aç/Kapat"
          >
            {expanded ? '↑' : '↓'}
          </button>
      </div>

      {expanded && (
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
              
              const maxForecastTime = new Date(todayMs);
              maxForecastTime.setDate(maxForecastTime.getDate() + 6);
              const isFutureOutsideForecast = dateTime > maxForecastTime.getTime();
              
              const isSelectable = !isPast && !isFutureOutsideForecast;

              let cls = 'cal-cell';
              if (!isSelectable) cls += ' cal-cell--disabled';
              else cls += ' cal-cell--selectable';

              if (isSelected) cls += ' cal-cell--selected';
              if (isToday) cls += ' cal-cell--today-indicator';

              const handleClick = () => {
                if (!staticMode) return; // Sadece kombin modunda gün seçilebilir
                if (!isSelectable) return;
                setSelectedDate(dateTime);
              };

              let dayForecast = null;
              if (forecastData && forecastData.length > 0) {
                dayForecast = forecastData.find(f => {
                   const fd = new Date(f.time);
                   fd.setHours(0,0,0,0);
                   return fd.getTime() === dateTime;
                });
              }
              const dayIcon = dayForecast ? getWeatherDetails(dayForecast.weathercode).icon : null;

              return (
                <div key={i} className={cls} onClick={handleClick}>
                  <span className="cal-date-number">{date.getDate()}</span>
                  {dayIcon && <span className="cal-day-icon">{dayIcon}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
