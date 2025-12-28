(() => {
  "use strict";

  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Destination rendering (progressive enhancement)
  const listEl = document.querySelector("[data-destinations]");
  const searchEl = document.querySelector("[data-dest-search]");
  const countEl = document.querySelector("[data-dest-count]");

  const DESTS = Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : [];

  function render(list) {
    if (!listEl) return;
    listEl.innerHTML = list.map(d => `
      <article class="card dest-card">
        <h3>${escapeHtml(d.name)}</h3>
        <div class="meta">${escapeHtml(d.country)} • ${escapeHtml(d.region)}</div>
        <p>${escapeHtml(d.description)}</p>
      </article>
    `).join("");
    if (countEl) countEl.textContent = String(list.length);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  if (listEl && DESTS.length) {
    render(DESTS);
    if (searchEl) {
      const handler = () => {
        const q = searchEl.value.trim().toLowerCase();
        const filtered = !q ? DESTS : DESTS.filter(d => {
          const hay = `${d.name} ${d.country} ${d.region} ${d.description} ${(d.highlights||[]).join(" ")}`.toLowerCase();
          return hay.includes(q);
        });
        render(filtered);
      };
      searchEl.addEventListener("input", handler);
    }
  }
})();
