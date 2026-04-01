let timeLeft;
let timerId = null;
let currentRound = 1;
let isPaused = true;
let isSuddenDeath = false;
let isPrepMode = false; // Nueva variable de control
let currentTheme = 'mk';

const STATUS_TEXTS = {
    mk: { waiting: "⚔️ PREPARANDO DUELO...", running: "💥 ¡DUELO EN CURSO!", end: "RONDA TERMINADA" },
    op: { waiting: "🌊 LEVANTEN ANCLAS...", running: "🏴‍☠️ ¡EN BUSCA DEL ONE PIECE!", end: "RONDA TERMINADA" },
    pk: { waiting: "🏟️ PREPARANDO EL ESTADIO...", running: "⚡ ¡ATRÁPALOS YA!", end: "RONDA TERMINADA" },
    db: { waiting: "☄️ REUNIENDO KI...", running: "🐉 ¡DESATA TU PODER!", end: "RONDA TERMINADA" }
};

const themeSelect = document.getElementById('theme-select');
const timerDisplay = document.getElementById('timer-display');
const roundDisplay = document.getElementById('round-display');
const durationSelect = document.getElementById('duration-select');
const statusMsg = document.getElementById('status-msg');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const finalMsg = document.getElementById('final-msg');
const progressBar = document.getElementById('progress-bar');
const fsBtn = document.getElementById('fullscreen-btn');
const prepBtn = document.getElementById('prep-btn');

function playSfx(tipo) {
    const audio = document.getElementById(`audio-${currentTheme}-${tipo}`);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Cálculo de barra de progreso proporcional al modo actual
    let totalSecs;
    if (isPrepMode) {
        totalSecs = 120;
    } else if (isSuddenDeath) {
        totalSecs = 300;
    } else {
        const val = durationSelect.value;
        totalSecs = val.includes('s') ? parseInt(val) : parseFloat(val) * 60;
    }

    const percentage = (timeLeft / totalSecs) * 100;
    if (progressBar) progressBar.style.width = `${percentage}%`;

    // Alerta visual últimos 20 segundos
    if (timeLeft <= 20 && timeLeft > 0) {
        timerDisplay.classList.add('timer-alerta');
    } else {
        timerDisplay.classList.remove('timer-alerta');
    }

    // Fin del tiempo
   if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(timerId);
        timerId = "finished";
        
        if (isPrepMode) {
            statusMsg.textContent = "¡PREPARACIÓN TERMINADA! INICIEN RONDA";
        } else {
            // Esto oculta el 00:00 y muestra el mensaje temático
            timerDisplay.style.display = 'none'; 
            finalMsg.classList.add('show-final');
            playSfx('end');
            statusMsg.textContent = "REPORTEN SUS RESULTADOS";
        }
    }
}

function startTimer() {
    if (isPaused) {
        // Si el usuario da "INICIAR RONDA" estando en modo PREPARACIÓN:
        if (isPrepMode) {
            isPrepMode = false;
            roundDisplay.textContent = `RONDA ${currentRound}`;
            resetTimer(); // Esto carga el tiempo del select (45 min)
        }

        if (!timerId || timerId === "finished") {
            playSfx(`start-${currentRound}`);
        }

        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        statusMsg.textContent = STATUS_TEXTS[currentTheme].running;
        
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                if (timeLeft === 20 && !isPrepMode) playSfx('20sec');
                updateDisplay();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    isSuddenDeath = false;
    isPrepMode = false;
    
    timerDisplay.classList.remove('hide-time', 'timer-alerta');
    finalMsg.classList.remove('show-final');
    
    const rawValue = durationSelect.value;
    timeLeft = Math.round(parseFloat(rawValue) * 60);
    
    updateDisplay();
    
    startBtn.disabled = false;
    startBtn.textContent = "INICIAR RONDA";
    statusMsg.textContent = STATUS_TEXTS[currentTheme].waiting;
}

// Botón Preparación Mesas
prepBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    isPrepMode = true;
    isSuddenDeath = false;

    timeLeft = 120; // 2 minutos exactos
    roundDisplay.textContent = "PREPARACIÓN";
    statusMsg.textContent = "🪑 BUSQUEN SUS MESAS...";
    
    timerDisplay.classList.remove('hide-time', 'timer-alerta');
    finalMsg.classList.remove('show-final');
    
    updateDisplay();
    startBtn.disabled = false;
    startBtn.textContent = "SALTAR A RONDA";
});

// Eventos de botones
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', () => {
    isPaused = true;
    clearInterval(timerId);
    timerId = null;
    startBtn.disabled = false;
    startBtn.textContent = "REANUDAR";
    statusMsg.textContent = "PAUSADO";
});

document.getElementById('reset-btn').addEventListener('click', resetTimer);

document.getElementById('next-round-btn').addEventListener('click', () => {
    if (currentRound < 6) {
        currentRound++;
        roundDisplay.textContent = `RONDA ${currentRound}`;
        resetTimer();
    }
});

document.getElementById('sudden-death-btn').addEventListener('click', () => {
    isSuddenDeath = true;
    isPrepMode = false;
    timeLeft = 300; 
    playSfx('sudden');
    updateDisplay();
    startTimer();
});

fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
        fsBtn.textContent = "Minimizar";
    } else {
        document.exitFullscreen();
        fsBtn.textContent = "⛶ Pantalla Completa";
    }
});

themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    document.body.setAttribute('data-theme', currentTheme);
    resetTimer();
});

// Inicialización
resetTimer();