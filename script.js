// =========================================================
// 1. LÓGICA DO PORTAL DE LOGIN (Roda apenas no index.html)
// =========================================================
const unlockBtn = document.getElementById("unlockBtn");
const passInput = document.getElementById("passInput");
const loginBox = document.getElementById("loginBox");
const chaptersMenu = document.getElementById("chaptersMenu");
const loginError = document.getElementById("loginError");

// Se já desbloqueou nesta sessão, mostra os cards direto
if (sessionStorage.getItem("unlocked") === "true" && loginBox && chaptersMenu) {
  loginBox.classList.add("hidden");
  chaptersMenu.classList.remove("hidden");
}

if (unlockBtn && passInput) {
  const checkPass = () => {
    const val = passInput.value.trim();
    // Aceita "1711" ou "17/11" ou vazio se quiser facilitar
    if (val === "1711" || val === "17/11") {
      sessionStorage.setItem("unlocked", "true");
      loginBox.classList.add("hidden");
      chaptersMenu.classList.remove("hidden");
    } else {
      loginError.style.display = "block";
    }
  };

  unlockBtn.addEventListener("click", checkPass);
  passInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkPass();
  });
}

// Marca que o usuário clicou para entrar e libera o autoplay nas páginas seguintes
function startMusicSession() {
  sessionStorage.setItem("musicPlaying", "true");
}

// =========================================================
// 2. MÚSICA CONTÍNUA ENTRE PÁGINAS (ano1.html e ano2.html)
// =========================================================
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

if (music && musicBtn) {
  // Retoma do segundo exato em que estava na outra página
  const savedTime = parseFloat(sessionStorage.getItem("musicTime") || "0");
  if (savedTime > 0) {
    music.currentTime = savedTime;
  }

  // Se estava tocando antes de trocar de página, continua tocando
  if (sessionStorage.getItem("musicPlaying") === "true") {
    music.play().then(() => {
      musicBtn.textContent = "⏸ Pausar Música";
    }).catch(() => {
      musicBtn.textContent = "🎵 Tocar Música";
    });
  }

  // Salva o tempo atual a cada meio segundo
  setInterval(() => {
    if (!music.paused) {
      sessionStorage.setItem("musicTime", music.currentTime);
    }
  }, 500);

  musicBtn.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      sessionStorage.setItem("musicPlaying", "true");
      musicBtn.textContent = "⏸ Pausar Música";
    } else {
      music.pause();
      sessionStorage.setItem("musicPlaying", "false");
      musicBtn.textContent = "🎵 Tocar Música";
    }
  });
}

// =========================================================
// 3. CONTADOR EM TEMPO REAL (Desde 17/11/2024)
// =========================================================
const timerDisplay = document.getElementById("timerDisplay");
if (timerDisplay) {
  const startDate = new Date("2024-11-17T00:00:00");

  function updateCounter() {
    const now = new Date();
    const diff = now - startDate;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timerDisplay.innerHTML = `
      <span><strong>${days}</strong> dias</span>
      <span><strong>${hours}</strong>h</span>
      <span><strong>${minutes}</strong>m</span>
      <span><strong>${seconds}</strong>s</span>
    `;
  }
  setInterval(updateCounter, 1000);
  updateCounter();
}

// =========================================================
// 4. CARROSSEL E REVEAL (Roda nas páginas de história)
// =========================================================
document.querySelectorAll(".carousel").forEach((carousel) => {
  let index = 0;
  const track = carousel.querySelector(".carousel-track");
  if (!track) return;

  const slides = track.querySelectorAll("img");
  const total = slides.length;
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");

  function updateSlide() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function moveSlide(n) {
    index = (index + n + total) % total;
    updateSlide();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => moveSlide(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveSlide(1));

  let autoPlay = setInterval(() => moveSlide(1), 4000);
  carousel.addEventListener("mouseenter", () => clearInterval(autoPlay));
  carousel.addEventListener("mouseleave", () => {
    autoPlay = setInterval(() => moveSlide(1), 4000);
  });
  carousel.addEventListener("touchstart", () => clearInterval(autoPlay), { passive: true });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
// =========================================================
// 5. PARTÍCULAS DE FUNDO (Roda em todas as páginas)
// =========================================================
const canvas = document.getElementById("particlesCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 0.5 + 0.2,
  }));

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.fillStyle = "#b880ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}