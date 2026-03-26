const canvas = document.getElementById("fireworksCanvas");
const replayButton = document.getElementById("replayButton");

if (canvas) {
  const context = canvas.getContext("2d");
  const rockets = [];
  const particles = [];
  const trails = [];
  const palette = ["#ffd166", "#ff6b6b", "#7dd3fc", "#c084fc", "#86efac", "#f9a8d4", "#fef08a"];

  let width = window.innerWidth;
  let height = window.innerHeight;
  let launchInterval = 0;

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
    const targetY = height * (0.12 + Math.random() * 0.35);

    rockets.push({
      x: originX,
      y: height + 10,
      targetX,
      targetY,
      speed: 4 + Math.random() * 1.8,
      color: randomColor(),
      reached: false
    });
  };

  const explode = (x, y, color) => {
    const count = 42 + Math.floor(Math.random() * 18);

    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 1.2 + Math.random() * 4.6;

      particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        gravity: 0.028 + Math.random() * 0.026,
        friction: 0.985,
        alpha: 1,
        life: 66 + Math.random() * 26,
        size: 1.8 + Math.random() * 2.2,
        color
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

      if (distance < rocket.speed || rocket.reached) {
        rocket.reached = true;
        explode(rocket.x, rocket.y, rocket.color);
        rockets.splice(index, 1);
        continue;
      }

      const velocityX = (dx / distance) * rocket.speed;
      const velocityY = (dy / distance) * rocket.speed;

      rocket.x += velocityX;
      rocket.y += velocityY;
      addTrail(rocket.x, rocket.y, rocket.color, 2.4);

      context.fillStyle = rocket.color;
      context.beginPath();
      context.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
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
      particle.alpha = Math.max(particle.life / 92, 0);

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

  const drawSkyGlow = () => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    gradient.addColorStop(1, "rgba(5, 8, 22, 0.02)");

    context.globalAlpha = 1;
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  };

  const animate = () => {
    context.clearRect(0, 0, width, height);
    drawSkyGlow();
    updateTrails();
    updateRockets();
    updateParticles();
    context.globalAlpha = 1;
    window.requestAnimationFrame(animate);
  };

  const startShow = () => {
    window.clearInterval(launchInterval);

    for (let index = 0; index < 5; index += 1) {
      window.setTimeout(() => launchRocket(width * (0.15 + Math.random() * 0.7)), index * 220);
    }

    launchInterval = window.setInterval(() => {
      const rocketCount = 1 + Math.floor(Math.random() * 2);

      for (let index = 0; index < rocketCount; index += 1) {
        launchRocket(width * (0.1 + Math.random() * 0.8));
      }
    }, 680);
  };

  resizeCanvas();
  startShow();
  animate();

  replayButton?.addEventListener("click", () => {
    rockets.length = 0;
    particles.length = 0;
    trails.length = 0;
    startShow();
  });

  canvas.addEventListener("click", (event) => {
    explode(event.clientX, event.clientY, randomColor());
  });

  window.addEventListener("resize", resizeCanvas);
}
