const canvas = document.getElementById("fireworksCanvas");
const replayButton = document.getElementById("replayButton");
const confettiButton = document.getElementById("confettiButton");
const openSurpriseButton = document.getElementById("openSurpriseButton");
const wishOutput = document.getElementById("wishOutput");
const musicToggle = document.getElementById("musicToggle");
const birthdayMusic = document.getElementById("birthdayMusic");
const panels = Array.from(document.querySelectorAll(".panel"));
const wishCards = Array.from(document.querySelectorAll(".wish-card"));
const navButtons = Array.from(document.querySelectorAll("[data-next], [data-prev]"));

const showPanel = (panelName) => {
  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === panelName);
  });

  if (panelName === "video" && birthdayMusic) {
    birthdayMusic.pause();

    if (musicToggle) {
      musicToggle.textContent = "播放音乐";
    }
  }
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = button.getAttribute("data-next");
    const prev = button.getAttribute("data-prev");
    showPanel(next || prev || "intro");
  });
});

wishCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (wishOutput) {
      wishOutput.textContent = card.dataset.wish || "";
    }
  });
});

if (musicToggle && birthdayMusic) {
  musicToggle.addEventListener("click", async () => {
    try {
      if (birthdayMusic.paused) {
        await birthdayMusic.play();
        musicToggle.textContent = "暂停音乐";
      } else {
        birthdayMusic.pause();
        musicToggle.textContent = "播放音乐";
      }
    } catch (error) {
      musicToggle.textContent = "音乐无法播放";
    }
  });
}

if (canvas) {
  const context = canvas.getContext("2d");
  const rockets = [];
  const particles = [];
  const trails = [];
  const confetti = [];
  const palette = ["#ffd166", "#ff6b6b", "#7dd3fc", "#c084fc", "#86efac", "#f9a8d4", "#fef08a"];
  const lowPowerMode = window.innerWidth < 640;
  const maxParticles = lowPowerMode ? 220 : 360;
  const maxConfetti = lowPowerMode ? 90 : 150;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let launchInterval = 0;
  let animationFrameId = 0;
  let lastFrameTime = 0;

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

  const launchRocket = (originX = Math.random() * width) => {
    const targetX = width * (0.15 + Math.random() * 0.7);
    const targetY = height * (0.1 + Math.random() * 0.32);

    rockets.push({
      x: originX,
      y: height + 10,
      targetX,
      targetY,
      speed: 4 + Math.random() * 2,
      color: randomColor()
    });
  };

  const explode = (x, y, color) => {
    const count = lowPowerMode ? 26 + Math.floor(Math.random() * 10) : 40 + Math.floor(Math.random() * 14);

    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 1.3 + Math.random() * 4.8;

      if (particles.length >= maxParticles) {
        break;
      }

      particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        gravity: 0.03 + Math.random() * 0.03,
        friction: 0.986,
        alpha: 1,
        life: 68 + Math.random() * 26,
        size: 1.8 + Math.random() * 2.4,
        color
      });
    }
  };

  const showerConfetti = () => {
    const piecesToAdd = lowPowerMode ? 45 : 80;

    for (let index = 0; index < piecesToAdd; index += 1) {
      if (confetti.length >= maxConfetti) {
        break;
      }

      confetti.push({
        x: Math.random() * width,
        y: -20 - Math.random() * height * 0.2,
        dx: -1.4 + Math.random() * 2.8,
        dy: 1.6 + Math.random() * 2.4,
        rotation: Math.random() * Math.PI,
        spin: -0.16 + Math.random() * 0.32,
        size: 5 + Math.random() * 7,
        color: randomColor(),
        alpha: 0.8 + Math.random() * 0.2
      });
    }
  };

  const addTrail = (x, y, color, size) => {
    trails.push({
      x,
      y,
      size,
      alpha: 0.45,
      color
    });
  };

  const updateRockets = () => {
    for (let index = rockets.length - 1; index >= 0; index -= 1) {
      const rocket = rockets[index];
      const dx = rocket.targetX - rocket.x;
      const dy = rocket.targetY - rocket.y;
      const distance = Math.hypot(dx, dy);

      if (distance < rocket.speed) {
        explode(rocket.x, rocket.y, rocket.color);
        rockets.splice(index, 1);
        continue;
      }

      rocket.x += (dx / distance) * rocket.speed;
      rocket.y += (dy / distance) * rocket.speed;
      addTrail(rocket.x, rocket.y, rocket.color, 2.5);

      context.fillStyle = rocket.color;
      context.beginPath();
      context.arc(rocket.x, rocket.y, 2.1, 0, Math.PI * 2);
      context.fill();
    }
  };

  const updateParticles = () => {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];

      particle.dx *= particle.friction;
      particle.dy *= particle.friction;
      particle.dy += particle.gravity;
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life -= 1;
      particle.alpha = Math.max(particle.life / 94, 0);

      addTrail(particle.x, particle.y, particle.color, particle.size);

      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }

      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
  };

  const updateTrails = () => {
    for (let index = trails.length - 1; index >= 0; index -= 1) {
      const trail = trails[index];
      trail.alpha -= 0.02;
      trail.size *= 0.985;

      if (trail.alpha <= 0.02 || trail.size <= 0.2) {
        trails.splice(index, 1);
        continue;
      }

      context.globalAlpha = trail.alpha;
      context.fillStyle = trail.color;
      context.beginPath();
      context.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      context.fill();
    }
  };

  const updateConfetti = () => {
    for (let index = confetti.length - 1; index >= 0; index -= 1) {
      const piece = confetti[index];

      piece.x += piece.dx;
      piece.y += piece.dy;
      piece.dy += 0.012;
      piece.rotation += piece.spin;

      if (piece.y > height + 30) {
        confetti.splice(index, 1);
        continue;
      }

      context.save();
      context.globalAlpha = piece.alpha;
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      context.restore();
    }
  };

  const drawSkyGlow = () => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    gradient.addColorStop(1, "rgba(23, 4, 43, 0.02)");

    context.globalAlpha = 1;
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  };

  const animate = (timestamp = 0) => {
    if (timestamp - lastFrameTime < 16) {
      animationFrameId = window.requestAnimationFrame(animate);
      return;
    }

    lastFrameTime = timestamp;
    context.clearRect(0, 0, width, height);
    drawSkyGlow();
    updateTrails();
    updateRockets();
    updateParticles();
    updateConfetti();
    context.globalAlpha = 1;
    animationFrameId = window.requestAnimationFrame(animate);
  };

  const startShow = () => {
    window.clearInterval(launchInterval);

    for (let index = 0; index < (lowPowerMode ? 4 : 6); index += 1) {
      window.setTimeout(() => launchRocket(width * (0.14 + Math.random() * 0.72)), index * 200);
    }

    launchInterval = window.setInterval(() => {
      const rocketCount = lowPowerMode ? 1 : 1 + Math.floor(Math.random() * 2);

      for (let index = 0; index < rocketCount; index += 1) {
        launchRocket(width * (0.1 + Math.random() * 0.8));
      }
    }, 640);
  };

  resizeCanvas();
  showerConfetti();
  startShow();
  animate();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearInterval(launchInterval);
      window.cancelAnimationFrame(animationFrameId);
      return;
    }

    startShow();
    animationFrameId = window.requestAnimationFrame(animate);
  });

  openSurpriseButton?.addEventListener("click", () => {
    showPanel("celebration");
    showerConfetti();
    for (let index = 0; index < 4; index += 1) {
      window.setTimeout(() => launchRocket(width * (0.14 + Math.random() * 0.72)), index * 160);
    }
  });

  replayButton?.addEventListener("click", () => {
    rockets.length = 0;
    particles.length = 0;
    trails.length = 0;
    confetti.length = 0;
    showerConfetti();
    startShow();
  });

  confettiButton?.addEventListener("click", showerConfetti);

  canvas.addEventListener("click", (event) => {
    explode(event.clientX, event.clientY, randomColor());
  });

  window.addEventListener("resize", resizeCanvas);
}
