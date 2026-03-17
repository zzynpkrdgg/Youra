document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('calendar-modal');
    const btn = document.getElementById('open-calendar');
    const span = document.getElementById('close-calendar');
    const calendarContainer = document.getElementById('calendar-container');
    const monthTitle = document.getElementById('calendar-month-title');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    // Details pane elements
    const detailsPane = document.getElementById('day-details-pane');
    const detailsDateTitle = document.getElementById('details-date-title');
    const detailsWeatherInfo = document.getElementById('details-weather-info');
    const closeDetailsBtn = document.getElementById('close-details');

    // Takvimi açma
    btn.onclick = function() {
        modal.style.display = "block";
        renderMonth(currentMonthIndex);
    }
    
    // Detay panelini kapatma
    closeDetailsBtn.onclick = function() {
        detailsPane.style.display = "none";
    }

    // Takvimi kapatma (çarpı butonu)
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Seçili yıl ve başlangıç ayı (2=Mart)
    const year = 2026;
    let currentMonthIndex = 2; // Başlangıç 17 Mart 2026 olduğu için Mart olarak başlatıyorum
    
    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    // Hava durumu emoji listesi (siyah ikon istendiği için siyah-beyaz olanlar veya genel emojiler)
    // Emojilerin siyah gözükmesi için CSS'te grayscale veya text-shadow ayarlandı.
    const weatherIcons = ["☀️", "🌤️", "☁️", "🌧️", "⛈️", "❄️", "🌬️"];

    const currentDate = new Date(2026, 2, 17); // 17 Mart 2026 referans tarih

    function renderMonth(monthIndex) {
        calendarContainer.innerHTML = ''; // Temizle
        monthTitle.innerText = `${months[monthIndex]} ${year}`;

        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';

        // Gün başlıkları
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerText = day;
            daysGrid.appendChild(dayHeader);
        });

        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        // Boş günler (Ay başından önceki boşluklar)
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty-day';
            daysGrid.appendChild(emptyDay);
        }

        // Günler
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            
            const iterDate = new Date(year, monthIndex, day);
            
            if (iterDate < currentDate) {
                dayDiv.classList.add('past-day');
            }

            const dayNumber = document.createElement('span');
            dayNumber.innerText = day;
            dayDiv.appendChild(dayNumber);

            // Rastgele hava durumu
            const randomWeather = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
            const weatherSpan = document.createElement('span');
            weatherSpan.className = 'weather-icon';
            weatherSpan.innerText = randomWeather;
            // Emoji ikonlarını CSS üzerinden (text modunda siyah yapmak için bir numara)
            weatherSpan.style.filter = "grayscale(100%) brightness(0)"; // Emojileri siyah-beyaz yapıp siyaha dönüştürüyor
            dayDiv.appendChild(weatherSpan);

            dayDiv.onclick = function() {
                // Panele verileri yaz
                detailsDateTitle.innerText = `${day} ${months[monthIndex]} ${year}`;
                detailsWeatherInfo.innerText = `Weather: ${randomWeather}`;
                
                // Paneli göster
                detailsPane.style.display = 'block';
                
                // Panele yumuşak kaydırma yap (10ms gecikme ile DOM render'ı bekliyoruz)
                setTimeout(() => {
                    detailsPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
            };

            daysGrid.appendChild(dayDiv);
        }

        // Boş günler (Ay sonundaki boşluklar - grid'i doldurmak için - 42 hücreye tamamlama)
        const totalCellsOccupied = firstDay + daysInMonth;
        const totalGridCells = Math.ceil(totalCellsOccupied / 7) * 7;
        for (let i = totalCellsOccupied; i < totalGridCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty-day';
            daysGrid.appendChild(emptyDay);
        }

        calendarContainer.appendChild(daysGrid);
    }

    prevBtn.onclick = () => {
        if (currentMonthIndex > 0) {
            currentMonthIndex--;
            renderMonth(currentMonthIndex);
        }
    };

    nextBtn.onclick = () => {
        if (currentMonthIndex < 11) {
            currentMonthIndex++;
            renderMonth(currentMonthIndex);
        }
    };

});
