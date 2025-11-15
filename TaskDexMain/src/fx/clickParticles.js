// src/fx/clickParticles.js
export function initClickParticles() {
  const PARTICLE_COUNT = 12;
  const DURATION = 1000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function spawnParticles(x, y) {
    if (reduceMotion) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement("div");
      particle.className = "click-particle";

      const angle = Math.random() * 2 * Math.PI;
      const distance = 40 + Math.random() * 20;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      document.body.appendChild(particle);

      particle.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 }
        ],
        {
          duration: DURATION,
          easing: "cubic-bezier(.22, .61, .36, 1)"
        }
      );

      setTimeout(() => particle.remove(), DURATION);
    }
  }

  // Listen for clicks anywhere on the document
  document.addEventListener(
    "click",
    (e) => {
      spawnParticles(e.clientX, e.clientY);
    },
    true // capturing phase
  );
}
