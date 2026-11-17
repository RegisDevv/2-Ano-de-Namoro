// =========================================================
// 1. PORTAL DE ENTRADA (Alohomora - index.html)
// =========================================================
const unlockBtn = document.getElementById("unlockBtn");
const passInput = document.getElementById("passInput");
const loginBox = document.getElementById("loginBox");
const chaptersMenu = document.getElementById("chaptersMenu");
const loginError = document.getElementById("loginError");

if (sessionStorage.getItem("unlocked") === "true" && loginBox && chaptersMenu) {
  loginBox.classList.add("hidden");
  chaptersMenu.classList.remove("hidden");
}

if (unlockBtn && passInput) {
  const checkPass = () => {
    const val = passInput.value.trim().toLowerCase();
    if (val === "1711" || val === "17/11" || val === "alohomora") {
      sessionStorage.setItem("unlocked", "true");
      sessionStorage.setItem("musicPlaying", "true");
      loginBox.classList.add("hidden");
      chaptersMenu.classList.remove("hidden");

      // Já inicia a música na estante assim que destranca
      const audioEl = document.getElementById("bgMusic");
      const btnEl = document.getElementById("musicBtn");
      if (audioEl) {
        if (audioEl.currentTime < 10) audioEl.currentTime = 10;
        audioEl.play().then(() => {
          if (btnEl) btnEl.textContent = "⏸ Pausar Música";
        }).catch(() => {});
      }
    } else {
      loginError.style.display = "block";
    }
  };
  unlockBtn.addEventListener("click", checkPass);
  passInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkPass();
  });
}

function startMusicSession() {
  sessionStorage.setItem("musicPlaying", "true");
}

// =========================================================
// 2. MÚSICA CONTÍNUA (Pulando os primeiros 10 segundos)
// =========================================================
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const INTRO_SKIP = 11; // Segundos iniciais que serão pulados

if (music && musicBtn) {
  const savedTime = parseFloat(sessionStorage.getItem("musicTime") || "0");
  // Se estiver começando do zero (ou antes dos 10s), já pula direto para 10s
  const startAt = savedTime > INTRO_SKIP ? savedTime : INTRO_SKIP;

  const setInitialTime = () => {
    music.currentTime = startAt;
  };

  if (music.readyState >= 1) {
    setInitialTime();
  } else {
    music.addEventListener("loadedmetadata", setInitialTime, { once: true });
  }

  // Quando a música repetir (loop), pula os 10s iniciais novamente
  music.addEventListener("timeupdate", () => {
    if (music.currentTime < INTRO_SKIP && !music.paused) {
      music.currentTime = INTRO_SKIP;
    }
  });

  if (sessionStorage.getItem("musicPlaying") === "true") {
    music.play().then(() => {
      musicBtn.textContent = "⏸ Pausar Música";
    }).catch(() => {
      musicBtn.textContent = "🎵 Tocar Música";
    });
  }

  setInterval(() => {
    if (!music.paused) sessionStorage.setItem("musicTime", music.currentTime);
  }, 500);

  musicBtn.addEventListener("click", () => {
    if (music.paused) {
      if (music.currentTime < INTRO_SKIP) music.currentTime = INTRO_SKIP;
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
// 3. CRONÔMETRO EM TEMPO REAL (Desde 17/11/2024)
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
// 4. SISTEMA DE VIRAR PÁGINAS 3D REALISTA (1.6s + Sombra)
// =========================================================
const bookContainer = document.querySelector(".parchment-book");
const pages = document.querySelectorAll(".book-page");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageIndicator = document.getElementById("pageIndicator");

if (pages.length > 0 && prevPageBtn && nextPageBtn) {
  let currentPage = 0;
  let isTurning = false;
  const totalPages = pages.length;
  const TURN_DURATION = 1600; // 1.6 segundos para virar a folha com calma

  function updateControls() {
    pageIndicator.textContent = `Página ${currentPage + 1} de ${totalPages}`;
    prevPageBtn.disabled = currentPage === 0 || isTurning;
    nextPageBtn.disabled = currentPage === totalPages - 1 || isTurning;
  }

  function turnPage(direction) {
    if (isTurning) return;
    const nextIndex = currentPage + direction;
    if (nextIndex < 0 || nextIndex >= totalPages) return;

    isTurning = true;
    updateControls();

    const currentEl = pages[currentPage];
    const nextEl = pages[nextIndex];

    if (bookContainer) {
      bookContainer.classList.remove("casting-shadow");
      void bookContainer.offsetWidth; // Reinicia a animação de sombra
      bookContainer.classList.add("casting-shadow");
    }

    if (direction === 1) {
      // Revela a página seguinte por baixo e dobra a folha atual por cima
      nextEl.classList.add("active");
      currentEl.classList.remove("active");
      currentEl.classList.add("turning-next");

      setTimeout(() => {
        currentEl.classList.remove("turning-next");
        if (bookContainer) bookContainer.classList.remove("casting-shadow");
        currentPage = nextIndex;
        isTurning = false;
        updateControls();
      }, TURN_DURATION);
    } else {
      // Desdobra a folha anterior da esquerda para a direita por cima da atual
      nextEl.classList.add("turning-prev");

      setTimeout(() => {
        currentEl.classList.remove("active");
        nextEl.classList.remove("turning-prev");
        nextEl.classList.add("active");
        if (bookContainer) bookContainer.classList.remove("casting-shadow");
        currentPage = nextIndex;
        isTurning = false;
        updateControls();
      }, TURN_DURATION);
    }
  }

  prevPageBtn.addEventListener("click", () => turnPage(-1));
  nextPageBtn.addEventListener("click", () => turnPage(1));
  updateControls();
}

// =========================================================
// 5. CARROSSEL DENTRO DAS PÁGINAS
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

// =========================================================
// 6. PARTÍCULAS DE MAGIA DOURADAS (Lumos)
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

  const particles = Array.from({ length: 65 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2.2 + 0.8,
    speed: Math.random() * 0.45 + 0.15,
  }));

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.fillStyle = "#d4af37";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.y -= p.speed; // Flutuam para cima como fagulhas de feitiço
      if (p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}