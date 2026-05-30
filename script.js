document.addEventListener('DOMContentLoaded', () => {
    // Referencje UI i logiki aplikacji
    const calculationType = document.getElementById('calculationType');
    const distanceInput = document.getElementById('distance');
    const speedInput = document.getElementById('speed');
    const timeHInput = document.getElementById('time_h');
    const timeMInput = document.getElementById('time_m');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultDiv = document.getElementById('result');

    // Referencje dla nowego UI
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const btnFontDecrease = document.getElementById('btn-font-decrease');
    const btnFontIncrease = document.getElementById('btn-font-increase');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const metaThemeColor = document.getElementById('meta-theme-color');
    const quickActionBtns = document.querySelectorAll('.quick-btn');

    // ==========================================
    // LOGIKA UI / UX (Design System)
    // ==========================================

    // Dynamiczna typografia (skalowanie od 12px do 26px)
    let currentFontSize = parseInt(localStorage.getItem('cpdFontSize')) || 16;
    
    function updateFontSize() {
        if (currentFontSize < 12) currentFontSize = 12;
        if (currentFontSize > 26) currentFontSize = 26;
        htmlElement.style.fontSize = `${currentFontSize}px`;
        localStorage.setItem('cpdFontSize', currentFontSize);
    }

    btnFontDecrease.addEventListener('click', () => {
        currentFontSize -= 2;
        updateFontSize();
    });

    btnFontIncrease.addEventListener('click', () => {
        currentFontSize += 2;
        updateFontSize();
    });

    updateFontSize(); // Inicjalizacja

    // Zarządzanie motywem jasny/ciemny
    let isDarkMode = localStorage.getItem('cpdTheme') === 'dark';

    function applyTheme() {
        if (isDarkMode) {
            bodyElement.classList.add('dark-theme');
            bodyElement.classList.remove('light-theme');
            themeIcon.textContent = 'light_mode';
            metaThemeColor.setAttribute('content', '#0f172a');
        } else {
            bodyElement.classList.remove('dark-theme');
            bodyElement.classList.add('light-theme');
            themeIcon.textContent = 'dark_mode';
            metaThemeColor.setAttribute('content', '#f8fafc');
        }
    }

    btnThemeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('cpdTheme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    });

    applyTheme(); // Inicjalizacja

    // Szybkie akcje dodawania czasu
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (timeHInput.disabled) return; // Zablokowane jeśli liczymy czas

            const addH = parseInt(btn.getAttribute('data-add-h')) || 0;
            const addM = parseInt(btn.getAttribute('data-add-m')) || 0;

            let currentH = parseInt(timeHInput.value) || 0;
            let currentM = parseInt(timeMInput.value) || 0;

            currentM += addM;
            currentH += addH;

            // Przeliczenie minut na godziny w razie przekroczenia 59
            if (currentM >= 60) {
                currentH += Math.floor(currentM / 60);
                currentM = currentM % 60;
            }

            timeHInput.value = currentH;
            timeMInput.value = currentM;
        });
    });


    // ==========================================
    // ORYGINALNA LOGIKA BIZNESOWA APLIKACJI
    // ==========================================

    function updateFormState() {
        const selectedValue = calculationType.value;
        
        distanceInput.disabled = false;
        speedInput.disabled = false;
        timeHInput.disabled = false;
        timeMInput.disabled = false;

        if (selectedValue === 'distance') {
            distanceInput.disabled = true;
            distanceInput.value = '';
        } else if (selectedValue === 'speed') {
            speedInput.disabled = true;
            speedInput.value = '';
        } else if (selectedValue === 'time') {
            timeHInput.disabled = true;
            timeMInput.disabled = true;
            timeHInput.value = '';
            timeMInput.value = '';
        }
        resultDiv.textContent = '';
    }
    
    function formatTime(decimalHours) {
        if (isNaN(decimalHours) || decimalHours < 0) return "";
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        
        let parts = [];
        if (hours > 0) parts.push(`${hours} godz.`);
        if (minutes > 0) parts.push(`${minutes} min.`);
        
        return parts.join(' i ') || "0 min.";
    }

    function calculate() {
        const type = calculationType.value;
        const distance = parseFloat(distanceInput.value);
        const speed = parseFloat(speedInput.value);
        
        const hours = parseFloat(timeHInput.value) || 0;
        const minutes = parseFloat(timeMInput.value) || 0;
        const timeInHours = hours + (minutes / 60);

        let resultText = '';

        try {
            if (type === 'distance') {
                if (isNaN(speed) || isNaN(timeInHours)) throw new Error('Wprowadź poprawne wartości dla prędkości i czasu.');
                if (speed < 0 || hours < 0 || minutes < 0) throw new Error('Wartości nie mogą być ujemne.');
                const result = speed * timeInHours;
                resultText = `Odległość: <strong>${result.toFixed(2)} km</strong>`;
            } else if (type === 'speed') {
                if (isNaN(distance) || isNaN(timeInHours)) throw new Error('Wprowadź poprawne wartości dla odległości i czasu.');
                if (distance < 0 || hours < 0 || minutes < 0) throw new Error('Wartości nie mogą być ujemne.');
                if (timeInHours === 0) throw new Error('Czas nie może wynosić zero.');
                const result = distance / timeInHours;
                resultText = `Prędkość: <strong>${result.toFixed(2)} km/h</strong>`;
            } else if (type === 'time') {
                if (isNaN(distance) || isNaN(speed)) throw new Error('Wprowadź poprawne wartości dla odległości i prędkości.');
                if (distance < 0 || speed < 0) throw new Error('Wartości nie mogą być ujemne.');
                if (speed === 0) throw new Error('Prędkość nie może wynosić zero.');
                const resultInHours = distance / speed;
                resultText = `Czas podróży: <strong>${formatTime(resultInHours)}</strong>`;
            }
            resultDiv.innerHTML = resultText;
        } catch (error) {
            resultDiv.innerHTML = `<span class="error-text">Błąd: ${error.message}</span>`;
        }
    }

    function resetForm() {
        distanceInput.value = '';
        speedInput.value = '';
        timeHInput.value = '';
        timeMInput.value = '';
        resultDiv.innerHTML = '';
        updateFormState();
    }

    calculationType.addEventListener('change', updateFormState);
    calculateBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', resetForm);
    
    updateFormState();
});

// Rejestracja Service Workera dla funkcji PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker zarejestrowany pomyślnie z zakresem: ', registration.scope);
            })
            .catch(err => {
                console.log('Rejestracja ServiceWorker nie powiodła się: ', err);
            });
    });
}