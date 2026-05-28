const marker = document.querySelector("#marker");
const effectRoot = document.querySelector("#effect-root");
const particleField = document.querySelector("#particle-field");
const pulseRing = document.querySelector("#pulse-ring");
const statusText = document.querySelector("#status");

let markerVisible = false;
let activationTimer = null;
let effectActivated = false;

const ACTIVATION_DELAY = 2000;

// 粒子环参数
const RING_COUNT = 8;              // 有多少层粒子环
const PARTICLES_PER_RING = 28;     // 每一圈有多少粒子
const MAX_HEIGHT = 2.5;            // 粒子最高上升高度
const BASE_RADIUS = 0.45;          // 最内圈半径
const RADIUS_STEP = 0.22;          // 每一圈向外扩大的距离

let particleData = [];
let animationStarted = false;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  particleField.innerHTML = "";
  particleData = [];

  for (let ringIndex = 0; ringIndex < RING_COUNT; ringIndex++) {
    const ringRadius = BASE_RADIUS + ringIndex * RADIUS_STEP;

    for (let i = 0; i < PARTICLES_PER_RING; i++) {
      const particle = document.createElement("a-sphere");

      const angle = (Math.PI * 2 * i) / PARTICLES_PER_RING;

      // 每一圈的初始高度略微错开，形成一层层上升的感觉
      const baseY = 0.05 + ringIndex * 0.07;

      const size = randomBetween(0.012, 0.032);

      particle.setAttribute("radius", size);
      particle.setAttribute("color", "#FFFFFF");
      particle.setAttribute("opacity", randomBetween(0.45, 0.95).toFixed(2));
      particle.setAttribute("transparent", "true");

      particleField.appendChild(particle);

      particleData.push({
        element: particle,
        angle: angle,
        radius: ringRadius,

        // 越外圈旋转越慢一点，画面会更自然
        orbitSpeed: randomBetween(0.18, 0.42) * (ringIndex % 2 === 0 ? 1 : -1),

        // 上升速度
        riseSpeed: randomBetween(0.12, 0.26),

        // 初始高度
        y: baseY,

        // 每个粒子的高度相位，让它们不是整齐地一起上下
        waveOffset: randomBetween(0, Math.PI * 2),

        // 透明度闪烁速度
        shimmerSpeed: randomBetween(1.2, 2.8)
      });
    }
  }

  if (!animationStarted) {
    animationStarted = true;
    animateParticles();
  }
}

function animateParticles() {
  requestAnimationFrame(animateParticles);

  if (!effectActivated || !markerVisible) return;

  const time = performance.now() * 0.001;

  particleData.forEach((particle) => {
    // 缓慢旋转
    particle.angle += particle.orbitSpeed * 0.012;

    // 缓慢上升
    particle.y += particle.riseSpeed * 0.006;

    // 到达最高点后回到底部，形成持续循环上升
    if (particle.y > MAX_HEIGHT) {
      particle.y = 0.05;
    }

    // 轻微呼吸感，让粒子不是死板的一圈
    const breathingRadius =
      particle.radius + Math.sin(time * 1.2 + particle.waveOffset) * 0.035;

    const x = Math.cos(particle.angle) * breathingRadius;
    const z = Math.sin(particle.angle) * breathingRadius;

    // 上升过程中附加一点点波浪漂浮
    const y =
      particle.y + Math.sin(time * 1.6 + particle.waveOffset) * 0.06;

    particle.element.object3D.position.set(x, y, z);

    // 轻微闪烁
    const opacity =
      0.45 + Math.sin(time * particle.shimmerSpeed + particle.waveOffset) * 0.28;

    particle.element.setAttribute("opacity", Math.max(0.18, opacity).toFixed(2));
  });
}

function activateEffect() {
  if (!markerVisible || effectActivated) return;

  console.log("Particle effect activated.");

  effectActivated = true;
  effectRoot.setAttribute("visible", "true");

  statusText.textContent = "图案已激活：白色粒子正在环绕上升";

  createParticles();

  // 不再让 pulse-ring 向外爆炸扩散，只保留一个轻微旋转的中心环
  pulseRing.removeAttribute("animation__scale");
  pulseRing.removeAttribute("animation__opacity");

  pulseRing.setAttribute("scale", "1.15 1.15 1.15");
  pulseRing.setAttribute("opacity", "0.32");

  pulseRing.setAttribute(
    "animation__rotate",
    `
      property: rotation;
      to: -90 0 360;
      dur: 4800;
      easing: linear;
      loop: true
    `
  );
}

function resetEffect() {
  effectActivated = false;
  effectRoot.setAttribute("visible", "false");

  particleField.innerHTML = "";
  particleData = [];

  pulseRing.removeAttribute("animation__scale");
  pulseRing.removeAttribute("animation__opacity");
  pulseRing.removeAttribute("animation__rotate");

  pulseRing.setAttribute("scale", "1 1 1");
  pulseRing.setAttribute("opacity", "0.45");
}

marker.addEventListener("markerFound", () => {
  console.log("Hiro marker found.");

  markerVisible = true;
  statusText.textContent = "已识别到图案，正在激活……";

  clearTimeout(activationTimer);

  activationTimer = setTimeout(() => {
    activateEffect();
  }, ACTIVATION_DELAY);
});

marker.addEventListener("markerLost", () => {
  console.log("Hiro marker lost.");

  markerVisible = false;
  statusText.textContent = "图案丢失，请重新对准 Hiro Marker";

  clearTimeout(activationTimer);
  resetEffect();
});