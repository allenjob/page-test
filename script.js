const yearElement = document.getElementById("year");
const copyButton = document.getElementById("copyButton");
const copyFeedback = document.getElementById("copyFeedback");
const fireworksButton = document.getElementById("fireworksButton");
const fireworksCanvas = document.getElementById("fireworksCanvas");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (copyButton && copyFeedback) {
  copyButton.addEventListener("click", async () => {
    const copyText = copyButton.dataset.copy || "";

    try {
      await navigator.clipboard.writeText(copyText);
      copyFeedback.textContent = "Copied successfully.";
    } catch (error) {
      copyFeedback.textContent = copyText;
    }
  });
}

if (fireworksButton && fireworksCanvas) {
  const context = fireworksCanvas.getContext("2d");
  const particles = [];
  let animationFrame = 0;
  let launchTimer = 0;
  let autoLaunchCount = 0;

  const palette = ["#ffd166", "#ff7b72", "#7dd3fc", "#c084fc", "#86efac", "#f9a8d4"];

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = document.querySelector(".hero")?.offsetHeight || window.innerHeight;

    fireworksCanvas.width = width * ratio;
    fireworksCanvas.height = height * ratio;
    fireworksCanvas.style.width = `${width}px`;
    fireworksCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const createBurst = (x, y) => {
    const count = 28;

    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 1.5 + Math.random() * 3.5;

      particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 70 + Math.random() * 24,
        alpha: 1,
        size: 2 + Math.random() * 2.5,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }
  };

  const render = () => {
    const width = fireworksCanvas.clientWidth;
    const height = fireworksCanvas.clientHeight;

    context.clearRect(0, 0, width, height);

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];

      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.dy += 0.04;
      particle.dx *= 0.992;
      particle.dy *= 0.992;
      particle.life -= 1;
      particle.alpha = Math.max(particle.life / 94, 0);

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

    context.globalAlpha = 1;
    animationFrame = window.requestAnimationFrame(render);
  };

  const launchAtRandomPosition = () => {
    const width = fireworksCanvas.clientWidth;
    const height = fireworksCanvas.clientHeight;
    const x = width * (0.2 + Math.random() * 0.6);
    const y = height * (0.18 + Math.random() * 0.34);

    createBurst(x, y);
  };

  const runFireworksShow = () => {
    window.clearInterval(launchTimer);
    autoLaunchCount = 0;

    launchAtRandomPosition();

    launchTimer = window.setInterval(() => {
      launchAtRandomPosition();
      autoLaunchCount += 1;

      if (autoLaunchCount >= 5) {
        window.clearInterval(launchTimer);
      }
    }, 420);
  };

  resizeCanvas();
  render();
  runFireworksShow();

  fireworksButton.addEventListener("click", runFireworksShow);

  fireworksCanvas.parentElement?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("a, button")) {
      return;
    }

    createBurst(event.clientX, event.clientY);
  });

  window.addEventListener("resize", resizeCanvas);
}
