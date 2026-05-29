const marker = document.querySelector("#marker");
const effectRoot = document.querySelector("#effect-root");
const particleField = document.querySelector("#particle-field");
const pulseRing = document.querySelector("#pulse-ring");
const statusText = document.querySelector("#status");

let markerVisible = false;
let activationTimer = null;
let effectActivated = false;

const ACTIVATION_DELAY = 2000;

const RING_COUNT = 7;
const PARTICLES_PER_RING = 28;
const MAX_HEIGHT = 1.8;
const BASE_RADIUS = 0.18;
const RADIUS_STEP = 0.07;

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
      const baseZ = 0.03 + ringIndex * 0.04;
      const size = randomBetween(0.006, 0.016);

      particle.setAttribute("radius", size);
      particle.setAttribute("color", "#FFFFFF");
      particle.setAttribute("opacity", randomBetween(0.45, 0.95).toFixed(2));
      particle.setAttribute("transparent", "true");

      particleField.appendChild(particle);

      particleData.push({
        element: particle,
        angle: angle,
        radius: ringRadius,
        orbitSpeed: randomBetween(0.18, 0.42) * (ringIndex % 2 === 0 ? 1 : -1),
        riseSpeed: randomBetween(0.08, 0.18),
        z: baseZ,
        waveOffset: randomBetween(0, Math.PI * 2),
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
    particle.angle += particle.orbitSpeed * 0.012;
    particle.z += particle.riseSpeed * 0.006;

    if (particle.z > MAX_HEIGHT) {
      particle.z = 0.03;
    }

    const breathingRadius =
      particle.radius + Math.sin(time * 1.2 + particle.waveOffset) * 0.018;

    const x = Math.cos(particle.angle) * breathingRadius;
    const y = Math.sin(particle.angle) * breathingRadius;
    const z =
      particle.z + Math.sin(time * 1.6 + particle.waveOffset) * 0.03;

    particle.element.object3D.position.set(x, y, z);

    const opacity =
      0.45 + Math.sin(time * particle.shimmerSpeed + particle.waveOffset) * 0.28;

    particle.element.setAttribute("opacity", Math.max(0.18, opacity).toFixed(2));
  });
}

function activateEffect() {
  if (!markerVisible || effectActivated) return;

  console.log("Image target effect activated.");

  effectActivated = true;
  effectRoot.setAttribute("visible", "true");

  statusText.textContent = "图案已激活：白色粒子正在环绕上升";

  createParticles();

  pulseRing.setAttribute("scale", "1.15 1.15 1.15");
  pulseRing.setAttribute("opacity", "0.28");

  pulseRing.setAttribute(
    "animation__rotate",
    `
      property: rotation;
      to: 0 0 360;
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

  pulseRing.removeAttribute("animation__rotate");
  pulseRing.setAttribute("scale", "1 1 1");
  pulseRing.setAttribute("opacity", "0.28");
}

marker.addEventListener("targetFound", () => {
  console.log("Image target found.");

  markerVisible = true;
  statusText.textContent = "已识别到图案，正在激活……";

  clearTimeout(activationTimer);

  activationTimer = setTimeout(() => {
    activateEffect();
  }, ACTIVATION_DELAY);
});

marker.addEventListener("targetLost", () => {
  console.log("Image target lost.");

  markerVisible = false;
  statusText.textContent = "图案丢失，请重新对准识别图案";

  clearTimeout(activationTimer);
  resetEffect();
});