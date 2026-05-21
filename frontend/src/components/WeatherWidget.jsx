import { useState, useEffect } from 'react';
import api from '../api/axios';
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

export default function WeatherWidget({ staticMode = false, onWeatherSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecasts, setForecasts] = useState({});

  // Calendar states
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const { data } = await api.get('/weather/forecast?lat=41.0082&lon=28.9784&days=7');
        const forecastMap = {};
        let todayMs = new Date().setHours(0,0,0,0);
        
        data.forecast.forEach(day => {
          const d = new Date(day.date);
          d.setHours(0,0,0,0);
          forecastMap[d.getTime()] = {
            temperature: day.temperatureMax,
            windspeed: day.windspeedMax,
            weathercode: day.weathercode,
            time: day.date
          };
        });

        const currentRes = await api.get('/weather?lat=41.0082&lon=28.9784');
        if (currentRes.data.weather) {
            const today = new Date(currentRes.data.weather.time);
            today.setHours(0,0,0,0);
            todayMs = today.getTime();
            forecastMap[todayMs] = currentRes.data.weather;
        }

        setForecasts(forecastMap);
        
        const initialDateMs = forecastMap[todayMs] ? todayMs : Object.keys(forecastMap)[0];
        
        setViewYear(new Date(Number(initialDateMs)).getFullYear());
        setViewMonth(new Date(Number(initialDateMs)).getMonth());
        
        if (staticMode) {
          setSelectedDate(Number(initialDateMs));
        }
        setWeatherData(forecastMap[initialDateMs]);
        
        if (onWeatherSelect && forecastMap[initialDateMs]) {
          onWeatherSelect(forecastMap[initialDateMs]);
        }
        
      } catch (err) {
        console.error('Hava durumu alınamadı:', err);
      }
    };
    fetchForecast();
  }, [staticMode, onWeatherSelect]);

  if (!weatherData) return null; // Veri yüklenene kadar boş

  // O anki tarihi 'bugün' olarak baz alıyoruz
  const todayTime = new Date();
  todayTime.setHours(0,0,0,0);
  const todayMs = todayTime.getTime();

  const selectedTime = new Date(weatherData.time);
  const dateStr = selectedTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const dayStr = selectedTime.toLocaleDateString('tr-TR', { weekday: 'long' }).toUpperCase();
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
              
              // Max limit is 6 days after today (total 7 days)
              const maxDateMs = todayMs + (6 * 24 * 60 * 60 * 1000);
              const isFutureLimit = dateTime > maxDateMs;
              
              const isSelected = selectedDate === dateTime;

              let cls = 'cal-cell';
              if (isPast || isFutureLimit) cls += ' cal-cell--past';
              else cls += ' cal-cell--selectable';

              if (isSelected) cls += ' cal-cell--selected';
              if (isToday) cls += ' cal-cell--today-indicator';

              const handleClick = () => {
                if (!staticMode) return; // Sadece kombin modunda gün seçilebilir
                if (isPast || isFutureLimit) return; // Geçmiş veya 7 günden sonrası seçilemez
                setSelectedDate(dateTime);
                const w = forecasts[dateTime];
                if (w) {
                  setWeatherData(w);
                  if (onWeatherSelect) onWeatherSelect(w);
                }
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
