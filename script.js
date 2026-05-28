const marker = document.querySelector("#marker");
const effectRoot = document.querySelector("#effect-root");
const particleField = document.querySelector("#particle-field");
const pulseRing = document.querySelector("#pulse-ring");
const statusText = document.querySelector("#status");

let markerVisible = false;
let activationTimer = null;
let effectActivated = false;

const PARTICLE_COUNT = 180;
const ACTIVATION_DELAY = 2000;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  particleField.innerHTML = "";

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement("a-sphere");

    const angle = randomBetween(0, Math.PI * 2);

    // 扩大粒子扩散范围
    const startRadius = randomBetween(0.05, 0.25);
    const endRadius = randomBetween(2.2, 5.5);

    const startX = Math.cos(angle) * startRadius;
    const startZ = Math.sin(angle) * startRadius;

    const endX = Math.cos(angle) * endRadius;
    const endZ = Math.sin(angle) * endRadius;

    // 增加高度范围，让粒子不仅贴着 marker，而是充满更大的空间
    const startY = randomBetween(0.05, 0.35);
    const endY = randomBetween(0.4, 3.5);

    // 粒子大小略微变化，但全部保持白色
    const size = randomBetween(0.012, 0.04);

    // 扩散时间稍微拉长，让画面更像空间弥散
    const duration = randomBetween(2600, 5200);
    const delay = randomBetween(0, 1100);

    particle.setAttribute("radius", size);
    particle.setAttribute("color", "#FFFFFF");
    particle.setAttribute("opacity", randomBetween(0.45, 0.95).toFixed(2));
    particle.setAttribute("transparent", "true");

    particle.setAttribute("position", `${startX} ${startY} ${startZ}`);

    particle.setAttribute(
      "animation__spread",
      `
        property: position;
        from: ${startX} ${startY} ${startZ};
        to: ${endX} ${endY} ${endZ};
        dur: ${duration};
        delay: ${delay};
        easing: easeOutCubic;
        loop: true
      `
    );

    particle.setAttribute(
      "animation__fade",
      `
        property: opacity;
        from: 0.95;
        to: 0;
        dur: ${duration};
        delay: ${delay};
        easing: easeOutQuad;
        loop: true
      `
    );

    particleField.appendChild(particle);
  }
}

function activateEffect() {
  if (!markerVisible || effectActivated) return;

  console.log("Particle effect activated.");

  effectActivated = true;
  effectRoot.setAttribute("visible", "true");

  statusText.textContent = "图案已激活：粒子正在扩散";

  createParticles();

  pulseRing.setAttribute(
    "animation__scale",
    `
      property: scale;
      from: 0.4 0.4 0.4;
      to: 3.2 3.2 3.2;
      dur: 1800;
      easing: easeOutQuad;
      loop: true
    `
  );

  pulseRing.setAttribute(
    "animation__opacity",
    `
      property: opacity;
      from: 0.5;
      to: 0;
      dur: 1800;
      easing: easeOutQuad;
      loop: true
    `
  );
}

function resetEffect() {
  effectActivated = false;
  effectRoot.setAttribute("visible", "false");
  particleField.innerHTML = "";

  pulseRing.removeAttribute("animation__scale");
  pulseRing.removeAttribute("animation__opacity");
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