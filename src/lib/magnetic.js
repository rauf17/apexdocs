export function initMagneticButtons() {
  const applyMagnetic = () => {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      // Prevent multiple listeners
      if (btn.dataset.magneticInit) return;
      btn.dataset.magneticInit = 'true';

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        const v = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - v;
        
        // Max transform of 6px
        const maxMovement = 6;
        const moveX = (x / h) * maxMovement;
        const moveY = (y / v) * maxMovement;
        
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  };

  // Run once
  applyMagnetic();

  // Re-run occasionally to catch newly mounted buttons (like after lazy load or route changes)
  const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (let m of mutations) {
      if (m.addedNodes.length > 0) shouldRun = true;
    }
    if (shouldRun) {
      setTimeout(applyMagnetic, 100);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
