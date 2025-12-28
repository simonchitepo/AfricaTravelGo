

(function () {
  "use strict";


  const DEFAULTS = {
    heroPlaceholder: "assets/images/placeholders/itinerary-hero.jpg",
    thumbPlaceholder: "assets/images/placeholders/destination-thumb.jpg"
  };

  function getPlaceholders() {
    const cfg = (window.GEOZIM_CONFIG || window.APP_CONFIG || {});
    const p = (cfg.placeholders || (cfg.assets && cfg.assets.placeholders) || {});
    return {
      hero: typeof p.hero === "string" && p.hero.trim() ? p.hero.trim() : DEFAULTS.heroPlaceholder,
      thumb: typeof p.thumb === "string" && p.thumb.trim() ? p.thumb.trim() : DEFAULTS.thumbPlaceholder
    };
  }

  const norm = (s) => (s || "").toString().trim();

  const slugify = (s) =>
    norm(s)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const uniqBy = (arr, keyFn) => {
    const seen = new Set();
    const out = [];
    for (const item of arr) {
      const k = keyFn(item);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  };

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const esc = (s) =>
    (s ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const isNum = (x) => typeof x === "number" && isFinite(x);

  const normKey = (s) =>
    norm(s)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[’']/g, "'")
      .trim();

  function safeUrl(u) {
    const s = norm(u);
    if (!s) return "";
    if (s === "null" || s === "undefined") return "";
    return s;
  }

  function isValidDestination(d) {
    return !!(d && typeof d === "object" && norm(d.country) && norm(d.name));
  }

  function ensureToastHost() {
    let host = document.getElementById("gt-toastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "gt-toastHost";
      document.body.appendChild(host);
    }
    return host;
  }

  function showToast(message, ms = 2400) {
    try {
      const host = ensureToastHost();
      const el = document.createElement("div");
      el.className = "gt-toast";
      el.innerHTML = `<div class="gt-toastInner">${esc(message)}</div>`;
      host.appendChild(el);

      requestAnimationFrame(() => el.classList.add("is-on"));

      const t = setTimeout(() => {
        el.classList.remove("is-on");
        setTimeout(() => el.remove(), 250);
        clearTimeout(t);
      }, ms);
    } catch (_) {
      alert(message);
    }
  }


  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load script")), { once: true });
        if (existing.getAttribute("data-loaded") === "1") resolve(true);
        return;
      }

      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.defer = true;
      s.setAttribute("data-src", src);
      s.addEventListener(
        "load",
        () => {
          s.setAttribute("data-loaded", "1");
          resolve(true);
        },
        { once: true }
      );
      s.addEventListener("error", () => reject(new Error("Failed to load script")), { once: true });
      document.head.appendChild(s);
    });
  }

  async function ensureJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;

    const CDN = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
    await loadScript(CDN);

    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    if (window.jsPDF) return window.jsPDF;

    throw new Error("jsPDF failed to initialize");
  }


  function indexDestinations(destinations) {
    const byId = new Map();
    const byCountryName = new Map(); 

    const list = Array.isArray(destinations) ? destinations : [];
    for (const d of list) {
      if (!isValidDestination(d)) continue;

      const id = String(d.id || "");
      if (id) byId.set(id, d);

      const c = normKey(d.country);
      const n = normKey(d.name);
      if (c && n) byCountryName.set(`${c}|${n}`, d);
    }
    return { byId, byCountryName };
  }

  function dayTitleToDestinationName(dayTitle) {
    const t = norm(dayTitle);
    if (!t) return "";

    const lower = t.toLowerCase();
    if (lower.startsWith("arrive in ")) return "";
    if (lower.startsWith("depart ")) return "";
    if (lower.includes("buffer") && lower.includes("flex")) return "";

    return t;
  }

  function findDestinationForDay(itin, day, destIndex) {
    const name = dayTitleToDestinationName(day.title);
    if (!name) return null;

    const cKey = normKey(itin.country);
    const nKey = normKey(name);

    const exact = destIndex.byCountryName.get(`${cKey}|${nKey}`);
    if (exact) return exact;

    const core = (itin.destinations || []).find((d) => normKey(d.name) === nKey);
    if (core && core.id) {
      const byId = destIndex.byId.get(String(core.id));
      if (byId) return byId;
    }

    const all = Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : [];
    const loose = all.find((d) => isValidDestination(d) && normKey(d.country) === cKey && normKey(d.name).includes(nKey));
    return loose || null;
  }


  function pdfWrapText(doc, text, x, y, maxWidth, lineHeight) {
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function pdfHeader(doc, title, subtitle) {
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(String(title || "Document"), 14, 18, { maxWidth: pageW - 28 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (subtitle) doc.text(String(subtitle), 14, 24, { maxWidth: pageW - 28 });

    doc.setDrawColor(220);
    doc.line(14, 28, pageW - 14, 28);
  }

  function pdfFooter(doc) {
    const pageCount = doc.getNumberOfPages();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(120);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, pageW - 14, pageH - 10, { align: "right" });
      doc.text("Generated by AfricaTravelGo", 14, pageH - 10);
    }
    doc.setTextColor(0);
  }

  function safeFilename(name) {
    return slugify(name).slice(0, 80) || "download";
  }

  async function downloadItineraryPreviewPDF(itin, previewDaysCount = 3) {
    try {
      showToast("Preparing PDF…", 1400);
      const jsPDF = await ensureJsPDF();
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const destIndex = indexDestinations(window.DESTINATIONS || []);
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const maxW = pageW - marginX * 2;

      const pills = [itin.country, `${itin.duration} days`, ...(itin.tags || [])].filter(Boolean).join(" • ");

      pdfHeader(doc, `${itin.name} — Preview`, pills);

      let y = 34;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      y = pdfWrapText(doc, itin.subtitle || "", marginX, y, maxW, 5) + 2;

      doc.setFontSize(10);
      y = pdfWrapText(doc, `Route: ${itin.route || ""}`, marginX, y, maxW, 5) + 3;

      const previewDays = (itin.days || []).slice(0, previewDaysCount);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Preview day-by-day (first ${previewDaysCount} day(s))`, marginX, y);
      y += 6;

      for (const d of previewDays) {
        if (y > pageH - 30) {
          doc.addPage();
          pdfHeader(doc, `${itin.name} — Preview`, pills);
          y = 34;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        y = pdfWrapText(doc, `Day ${d.day}: ${d.title}`, marginX, y, maxW, 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y = pdfWrapText(doc, d.focus || "", marginX, y + 1, maxW, 4.6);

        const matched = findDestinationForDay(itin, d, destIndex);
        if (matched) {
          const metaParts = [];
          if (matched.type) metaParts.push(matched.type);
          if (matched.region) metaParts.push(matched.region);
          if (matched.bestTime) metaParts.push(`Best time: ${matched.bestTime}`);
          if (matched.estimatedBudget) metaParts.push(`Budget: ${matched.estimatedBudget}`);

          const summary = norm(matched.summary);
          const highlights = (matched.highlights || []).slice(0, 5).filter(Boolean).join(" • ");

          doc.setDrawColor(230);
          doc.setLineWidth(0.4);
          doc.line(marginX, y + 1.5, pageW - marginX, y + 1.5);
          y += 4;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          y = pdfWrapText(doc, `Destination details: ${matched.name}`, marginX, y, maxW, 4.6);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.8);

          if (metaParts.length) y = pdfWrapText(doc, metaParts.join(" • "), marginX, y + 1, maxW, 4.4);
          if (summary) y = pdfWrapText(doc, `Overview: ${summary}`, marginX, y + 1, maxW, 4.4);
          if (highlights) y = pdfWrapText(doc, `Highlights: ${highlights}`, marginX, y + 1, maxW, 4.4);

          if (isNum(matched.lat) && isNum(matched.lng)) {
            y = pdfWrapText(doc, `Coordinates: ${matched.lat.toFixed(4)}, ${matched.lng.toFixed(4)}`, marginX, y + 1, maxW, 4.4);
          }

          y += 4;
        } else {
          y += 5;
        }
      }

      if (y > pageH - 45) {
        doc.addPage();
        pdfHeader(doc, `${itin.name} — Preview`, pills);
        y = 34;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Full PDF (Locked)", marginX, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y = pdfWrapText(
        doc,
        "The full itinerary PDF (all days + full logistics + packing + booking checklist) is coming soon.",
        marginX,
        y,
        maxW,
        5
      );
      y += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Included in the full PDF:", marginX, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const item of (itin.deliverables || [])) {
        if (y > pageH - 20) {
          doc.addPage();
          pdfHeader(doc, `${itin.name} — Preview`, pills);
          y = 34;
        }
        y = pdfWrapText(doc, `• ${item}`, marginX, y, maxW, 5);
      }

      pdfFooter(doc);

      const fname = `${safeFilename(itin.name)}-preview.pdf`;
      doc.save(fname);
    } catch (err) {
      console.error(err);
      showToast("PDF generation failed. Check console for details.");
    }
  }

  async function downloadDestinationSummaryPDF(dest) {
    try {
      showToast("Preparing destination PDF…", 1400);
      const jsPDF = await ensureJsPDF();
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const maxW = pageW - marginX * 2;

      const name = norm(dest.name) || "Destination";
      const subtitleParts = [];
      if (dest.country) subtitleParts.push(dest.country);
      if (dest.region) subtitleParts.push(dest.region);
      if (dest.type) subtitleParts.push(dest.type);

      pdfHeader(doc, `${name} — Summary`, subtitleParts.join(" • "));

      let y = 34;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      if (dest.summary) y = pdfWrapText(doc, dest.summary, marginX, y, maxW, 5) + 3;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Key details", marginX, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const rows = [];
      if (dest.bestTime) rows.push(["Best time", dest.bestTime]);
      if (dest.estimatedBudget) rows.push(["Estimated budget", dest.estimatedBudget]);
      if (dest.stayHint) rows.push(["Stay hint", dest.stayHint]);
      if (isNum(dest.lat) && isNum(dest.lng)) rows.push(["Coordinates", `${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)}`]);

      for (const [k, v] of rows) {
        if (y > pageH - 22) {
          doc.addPage();
          pdfHeader(doc, `${name} — Summary`, subtitleParts.join(" • "));
          y = 34;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${k}:`, marginX, y);
        doc.setFont("helvetica", "normal");
        y = pdfWrapText(doc, String(v), marginX + 36, y, maxW - 36, 5);
        y += 1;
      }

      const highlights = (dest.highlights || []).slice(0, 10).filter(Boolean);
      if (highlights.length) {
        if (y > pageH - 35) {
          doc.addPage();
          pdfHeader(doc, `${name} — Summary`, subtitleParts.join(" • "));
          y = 34;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Highlights", marginX, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        for (const h of highlights) {
          if (y > pageH - 18) {
            doc.addPage();
            pdfHeader(doc, `${name} — Summary`, subtitleParts.join(" • "));
            y = 34;
          }
          y = pdfWrapText(doc, `• ${h}`, marginX, y, maxW, 5);
        }
        y += 2;
      }

      const tags = (dest.tags || []).slice(0, 12).filter(Boolean);
      if (tags.length) {
        if (y > pageH - 28) {
          doc.addPage();
          pdfHeader(doc, `${name} — Summary`, subtitleParts.join(" • "));
          y = 34;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Tags", marginX, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        y = pdfWrapText(doc, tags.join(" • "), marginX, y, maxW, 5);
      }

      pdfFooter(doc);

      const fname = `${safeFilename(name)}-summary.pdf`;
      doc.save(fname);
    } catch (err) {
      console.error(err);
      showToast("PDF generation failed. Check console for details.");
    }
  }

  function scoreDestination(d) {
    const name = norm(d && d.name);
    const tags = ((d && d.tags) || []).map((t) => String(t).toLowerCase());
    const type = String((d && d.type) || "").toLowerCase();

    let score = 0;

    if (tags.includes("iconic")) score += 25;
    if (tags.includes("unesco")) score += 18;
    if (tags.includes("capital")) score += 10;
    if (tags.includes("adventure")) score += 8;
    if (tags.includes("wildlife") || tags.includes("safari")) score += 12;
    if (tags.includes("beach") || tags.includes("coast")) score += 10;
    if (tags.includes("history") || tags.includes("heritage")) score += 8;

    if (type === "city") score += 10;
    if (type === "heritage") score += 12;
    if (type === "safari") score += 14;
    if (type === "nature") score += 12;
    if (type === "beach") score += 12;

    score += clamp(20 - name.length / 3, 0, 8);

    const hasCoords = isNum(d && d.lat) && isNum(d && d.lng);
    if (hasCoords) score += 6;

    return score;
  }

  function countryBuckets(destinations) {
    const buckets = new Map();
    const list = Array.isArray(destinations) ? destinations : [];

    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (!isValidDestination(d)) continue;

      const country = norm(d.country);
      if (!buckets.has(country)) buckets.set(country, []);
      buckets.get(country).push(d);
    }

    return buckets;
  }


  function buildDaysPlan({ picks, totalDays, country }) {
    const days = [];
    const names = picks.map((p) => p.name);
    const highlights = picks.map((p) => (p.highlights && p.highlights[0]) || p.type || "Highlights");

    const hasCity = picks.find((p) => String(p.type || "").toLowerCase() === "city");
    const start = hasCity ? hasCity.name : names[0] || country;

    const bufferEvery = totalDays >= 14 ? 5 : totalDays >= 10 ? 4 : 4;
    let iPick = 0;

    for (let day = 1; day <= totalDays; day++) {
      let title = "";
      let focus = "";

      if (day === 1) {
        title = `Arrive in ${start}`;
        focus = `Airport transfer, check-in, local orientation, light activity.`;
      } else if (day === totalDays) {
        title = `Depart ${start}`;
        focus = `Checkout, last-minute shopping, transfer to airport.`;
      } else if (day % bufferEvery === 0) {
        title = `Buffer & flexibility day`;
        focus = `Rest, weather contingency, optional excursions, travel time.`;
      } else {
        const p = picks[iPick % picks.length];
        title = `${p.name}`;
        const h = (p.highlights && p.highlights.slice(0, 2).join(" • ")) || highlights[iPick % highlights.length];
        focus = `${h || "Key sights"} • local experiences • sunset / nightlife option.`;
        iPick++;
      }

      days.push({ day, title, focus });
    }
    return days;
  }

  function buildItinerary({ country, picks, duration }) {
    const core = picks.slice(0, duration >= 14 ? 8 : duration >= 10 ? 6 : 4);
    const coreNames = core.map((d) => d.name);

    const route = coreNames.slice(0, 3).join(" + ") + (coreNames.length > 3 ? " + …" : "");
    const id = `${slugify(country)}-${duration}-days`;

    const name =
      duration === 7
        ? `${country} Essentials (7 Days)`
        : duration === 10
        ? `${country} Explorer (10 Days)`
        : `${country} Grand Loop (14 Days)`;

    const subtitle =
      duration === 7
        ? `Best for first-timers: highlights + smooth pacing.`
        : duration === 10
        ? `Deeper coverage: balanced culture + nature.`
        : `Comprehensive: adds remote gems + buffer days.`;

    const deliverables = [
      "Full day-by-day plan (PDF-ready)",
      "Booking priorities (hotels + tours)",
      "Packing + documents checklist",
      "Logistics notes (buffers, transfers, seasonality)"
    ];

    const modules = [
      `High-intent booking flow (Hotels + Tours).`,
      `Sellable PDF export (itinerary + checklist + logistics).`,
      `Map-based route planning & discovery.`,
      `Consultation funnel for custom trips.`
    ];

    const days = buildDaysPlan({ picks: core, totalDays: duration, country });

    return {
      id,
      country,
      duration,
      name,
      route,
      subtitle,
      tags: duration === 7 ? ["Starter", "Popular"] : duration === 10 ? ["Balanced", "Premium"] : ["Comprehensive", "Extended"],
      destinations: core.map((d) => ({
        id: d.id,
        name: d.name,
        region: d.region,
        type: d.type,
        lat: d.lat,
        lng: d.lng,
        heroImage: d.heroImage
      })),
      modules,
      deliverables,
      days,
      productRef: `itinerary-${id}`,
      buyLabel: "Unlock full PDF"
    };
  }

 
  function generateItinerariesFromDestinations(destinations) {
    const clean = (Array.isArray(destinations) ? destinations : []).filter(isValidDestination);
    const buckets = countryBuckets(clean);
    const itineraries = [];

    for (const [country, list] of buckets.entries()) {
      const sorted = [...list].sort((a, b) => scoreDestination(b) - scoreDestination(a));

      const byType = new Map();
      for (const d of sorted) {
        const t = norm(d.type).toLowerCase() || "other";
        if (!byType.has(t)) byType.set(t, []);
        byType.get(t).push(d);
      }

      const typeOrder = ["city", "heritage", "nature", "safari", "beach", "other"];
      const interleaved = [];
      let progressed = true;

      while (progressed && interleaved.length < 12) {
        progressed = false;
        for (const t of typeOrder) {
          const arr = byType.get(t) || [];
          if (arr.length) {
            interleaved.push(arr.shift());
            progressed = true;
          }
        }
      }

      const picks = uniqBy(interleaved.length ? interleaved : sorted, (d) => String(d.id || d.name)).slice(0, 12);
      if (picks.length < 3) continue;

      for (const duration of [7, 10, 14]) {
        itineraries.push(buildItinerary({ country, picks, duration }));
      }
    }

    itineraries.sort((a, b) => a.country.localeCompare(b.country) || a.duration - b.duration);
    return itineraries;
  }

  
  function openBuyLink(_itin) {
    showToast("Unlock full PDF: Coming soon.");
    return true;
  }

 
  function renderItinerariesScreen(container, itineraries) {
    const placeholders = getPlaceholders();

    const countries = uniqBy(
      itineraries.map((i) => ({ country: i.country })),
      (x) => x.country
    ).map((x) => x.country);

    container.innerHTML = `
      <section class="gt-section">
        <div class="gt-heroRow">
          <div>
            <h1 class="gt-title">Itineraries</h1>
            <p class="gt-subtitle">Auto-generated templates per country (7, 10, 14 days). Download real preview PDFs and per-destination summary PDFs.</p>
          </div>

          <div class="gt-filters">
            <div class="gt-field">
              <label>Country</label>
              <select id="itinCountry" class="gt-input gt-select">
                <option value="">All countries</option>
                ${countries.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}
              </select>
            </div>

            <div class="gt-field">
              <label>Duration</label>
              <select id="itinDuration" class="gt-input gt-select">
                <option value="">Any</option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="14">14 days</option>
              </select>
            </div>

            <div class="gt-field">
              <label>Search</label>
              <input id="itinSearch" class="gt-input" type="search" placeholder="Search itinerary or destination..." />
            </div>
          </div>
        </div>

        <div class="gt-grid" id="itinGrid"></div>
      </section>
    `;

    const countrySel = container.querySelector("#itinCountry");
    const durSel = container.querySelector("#itinDuration");
    const searchEl = container.querySelector("#itinSearch");
    const grid = container.querySelector("#itinGrid");

    const state = { country: "", duration: "", q: "" };

    const match = (itin) => {
      if (state.country && itin.country !== state.country) return false;
      if (state.duration && String(itin.duration) !== String(state.duration)) return false;

      const q = (state.q || "").toLowerCase();
      if (!q) return true;

      const hay = [itin.name, itin.country, itin.route, itin.subtitle, ...(itin.destinations || []).map((d) => d.name)]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    };

    function pickCardImage(itin) {
      const img = safeUrl((itin.destinations || []).find((d) => d && d.heroImage)?.heroImage);
      return img || placeholders.hero;
    }

    function cardHTML(itin) {
      const img = pickCardImage(itin);
      const chips = (itin.tags || []).slice(0, 3).map((t) => `<span class="gt-chip">${esc(t)}</span>`).join("");

      return `
        <article class="gt-card" data-id="${esc(itin.id)}">
          <div class="gt-cardMedia" style="background-image:url('${esc(img)}')">
            <div class="gt-cardOverlay"></div>
            <div class="gt-cardTop">
              <div class="gt-cardTitle">${esc(itin.name)}</div>
              <div class="gt-cardMeta">${esc(itin.route)}</div>
            </div>
          </div>

          <div class="gt-cardBody">
            <div class="gt-cardDesc">${esc(itin.subtitle)}</div>
            <div class="gt-chipRow">${chips}</div>

            <div class="gt-cardActions">
              <button class="gt-btn gt-btnPrimary" data-action="pdf">Download preview PDF</button>
              <button class="gt-btn gt-btnGhost" data-action="buy">${esc(itin.buyLabel || "Unlock full PDF")}</button>
              <button class="gt-btn gt-btnSoft" data-action="details">Details</button>
            </div>
          </div>
        </article>
      `;
    }

    function renderGrid() {
      const items = itineraries.filter(match);
      if (!items.length) {
        grid.innerHTML = `<div class="gt-empty">No itineraries match your filters.</div>`;
        return;
      }
      grid.innerHTML = items.map(cardHTML).join("");
    }

    function onChange() {
      state.country = countrySel.value;
      state.duration = durSel.value;
      state.q = searchEl.value || "";
      renderGrid();
    }

    countrySel.addEventListener("change", onChange);
    durSel.addEventListener("change", onChange);
    searchEl.addEventListener("input", onChange);

    grid.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const card = e.target.closest(".gt-card");
      if (!card) return;

      const itin = itineraries.find((x) => x.id === card.getAttribute("data-id"));
      if (!itin) return;

      const action = btn.getAttribute("data-action");
      if (action === "pdf") {
        await downloadItineraryPreviewPDF(itin, 3);
      } else if (action === "buy") {
        openBuyLink(itin);
      } else if (action === "details") {
        openItineraryModal(itin);
      }
    });

    renderGrid();
  }

  function openItineraryModal(itin) {
    const placeholders = getPlaceholders();

    const existing = document.querySelector(".gt-modalBackdrop");
    if (existing) existing.remove();

    const previewDaysCount = 3;
    const previewDays = (itin.days || []).slice(0, previewDaysCount);
    const lockedDaysCount = Math.max(0, (itin.days || []).length - previewDaysCount);

    const safeAll = (Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : []).filter(isValidDestination);
    const byId = new Map(safeAll.map((d) => [String(d.id || ""), d]));
    const destFull = (itin.destinations || []).map((d) => byId.get(String(d && d.id || "")) || d || {});

    const backdrop = document.createElement("div");
    backdrop.className = "gt-modalBackdrop";
    backdrop.innerHTML = `
      <div class="gt-modal" role="dialog" aria-modal="true" aria-label="Itinerary preview">
        <div class="gt-modalHeader">
          <div>
            <div class="gt-modalTitle">${esc(itin.name)}</div>
            <div class="gt-modalSub">${esc(itin.country)} • ${esc(itin.duration)} days • ${esc(itin.route)}</div>
          </div>
          <button class="gt-btn gt-btnGhost" data-close="1" type="button">Close</button>
        </div>

        <div class="gt-modalBody">
          <div class="gt-modalCols">
            <div>
              <h3 class="gt-h3">Preview (Free)</h3>
              <div class="gt-days">
                ${previewDays
                  .map(
                    (d) => `
                  <div class="gt-dayRow">
                    <div class="gt-dayNum">Day ${esc(d.day)}</div>
                    <div>
                      <div class="gt-dayTitle">${esc(d.title)}</div>
                      <div class="gt-dayFocus">${esc(d.focus)}</div>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <div class="gt-lockCard" style="margin-top:12px;">
                <div class="gt-lockTitle">Full itinerary is locked</div>
                <div class="gt-lockSub">${esc(lockedDaysCount)} more day(s) + full logistics + packing list + booking checklist.</div>

                <div class="gt-modalActions" style="margin-top:10px;">
                  <button class="gt-btn gt-btnPrimary" data-action="buy" type="button">Unlock full PDF</button>
                  <button class="gt-btn gt-btnGhost" data-action="pdf" type="button">Download preview PDF</button>
                </div>

                <ul class="gt-ul" style="margin-top:10px;">
                  ${(itin.deliverables || []).slice(0, 6).map((m) => `<li>${esc(m)}</li>`).join("")}
                </ul>
              </div>
            </div>

            <div>
              <h3 class="gt-h3">Destinations</h3>
              <div class="gt-miniList">
                ${destFull
                  .map((d) => {
                    const img = safeUrl(d.heroImage) || placeholders.thumb;
                    const meta = [d.type, d.region].filter(Boolean).join(" • ");
                    const did = String(d.id || "");
                    return `
                      <div class="gt-miniItem">
                        <div class="gt-miniThumb" style="background-image:url('${esc(img)}')"></div>
                        <div class="gt-miniGrow">
                          <div class="gt-miniName">${esc(d.name || "Destination")}</div>
                          <div class="gt-miniMeta">${esc(meta)}</div>
                          <div class="gt-miniActions">
                            <button class="gt-btn gt-btnSoft gt-btnXs" data-action="destpdf" data-dest-id="${esc(did)}" type="button">Download summary PDF</button>
                          </div>
                        </div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>

              <h3 class="gt-h3" style="margin-top:14px;">Modules</h3>
              <ul class="gt-ul">
                ${(itin.modules || []).map((m) => `<li>${esc(m)}</li>`).join("")}
              </ul>

              <div class="gt-modalActions">
                <button class="gt-btn gt-btnPrimary" data-action="pdf" type="button">Download preview PDF</button>
                <button class="gt-btn gt-btnGhost" data-action="buy" type="button">Unlock full PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.addEventListener("click", async (e) => {
      if (e.target === backdrop || e.target.closest("[data-close]")) {
        backdrop.remove();
        return;
      }

      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      if (action === "pdf") {
        await downloadItineraryPreviewPDF(itin, 3);
        return;
      }
      if (action === "buy") {
        openBuyLink(itin);
        return;
      }
      if (action === "destpdf") {
        const id = btn.getAttribute("data-dest-id") || "";
        const full = safeAll.find((x) => String(x.id || "") === String(id));
        const stub = (itin.destinations || []).find((x) => String(x.id || "") === String(id));
        const dest = full || stub;
        if (!dest) {
          showToast("Destination not found for PDF.");
          return;
        }
        if (!dest.country && itin.country) dest.country = itin.country;
        await downloadDestinationSummaryPDF(dest);
        return;
      }
    });

    document.body.appendChild(backdrop);
  }


  function injectItineraryStylesOnce() {
    if (document.getElementById("gt-itin-styles")) return;

    const style = document.createElement("style");
    style.id = "gt-itin-styles";

    style.textContent = `
      .gt-section { padding: 16px; }
      .gt-heroRow { display:flex; gap:16px; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; }
      .gt-title { margin:0; font-size: 28px; letter-spacing:-0.02em; }
      .gt-subtitle { margin: 8px 0 0 0; max-width: 720px; color: rgba(255,255,255,0.72); }

      .gt-filters { display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; }
      .gt-field label { display:block; font-size:12px; color: rgba(255,255,255,0.70); margin-bottom:6px; }

      .gt-input {
        min-width: 190px;
        padding:10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.92);
        outline:none;
        appearance: none;
      }
      .gt-input::placeholder { color: rgba(255,255,255,0.55); }
      .gt-input:focus {
        border-color: rgba(147,197,253,0.55);
        box-shadow: 0 0 0 4px rgba(59,130,246,0.18);
      }

      .gt-select {
        padding-right: 38px;
        background-image:
          linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.70) 50%),
          linear-gradient(135deg, rgba(255,255,255,0.70) 50%, transparent 50%);
        background-position:
          calc(100% - 18px) 50%,
          calc(100% - 12px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
      }
      .gt-select option { background: #0f172a; color: rgba(255,255,255,0.92); }

      .gt-grid { margin-top: 14px; display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }

      .gt-card {
        border-radius: 18px;
        overflow:hidden;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
        box-shadow: 0 18px 50px rgba(0,0,0,0.35);
      }
      .gt-cardMedia {
        position:relative; height: 128px;
        background-size: cover; background-position: center;
        background-color: rgba(255,255,255,0.06);
      }
      .gt-cardOverlay { position:absolute; inset:0; background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.10)); }
      .gt-cardTop { position:absolute; left: 14px; right: 14px; bottom: 12px; }
      .gt-cardTitle { font-weight: 800; font-size: 16px; color: rgba(255,255,255,0.95); }
      .gt-cardMeta { margin-top:4px; color: rgba(255,255,255,0.70); font-size: 13px; }

      .gt-cardBody { padding: 12px 14px 14px 14px; }
      .gt-cardDesc { color: rgba(255,255,255,0.74); font-size: 13px; line-height: 1.35; min-height: 34px; }
      .gt-chipRow { margin-top: 10px; display:flex; gap:8px; flex-wrap:wrap; }
      .gt-chip {
        font-size: 12px;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.85);
      }

      .gt-cardActions { margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap; }

      .gt-btn {
        border-radius: 999px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.92);
        cursor: pointer;
      }
      .gt-btnPrimary { background: rgba(59,130,246,0.35); border-color: rgba(59,130,246,0.55); }
      .gt-btnGhost { background: rgba(255,255,255,0.08); }
      .gt-btnSoft  { background: rgba(255,255,255,0.12); }
      .gt-btnXs { padding: 8px 10px; font-size: 12px; }

      .gt-empty { padding: 18px; color: rgba(255,255,255,0.75); border: 1px dashed rgba(255,255,255,0.22); border-radius: 16px; }

      .gt-modalBackdrop {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center;
        z-index: 9999; padding: 16px;
      }
      .gt-modal {
        width: min(980px, 100%);
        max-height: 86vh;
        overflow:auto;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(20,20,24,0.88);
        box-shadow: 0 30px 90px rgba(0,0,0,0.55);
      }
      .gt-modalHeader {
        display:flex; justify-content:space-between;
        gap: 10px; align-items:center;
        padding: 14px;
        border-bottom: 1px solid rgba(255,255,255,0.10);
      }
      .gt-modalTitle { font-weight: 900; font-size: 16px; color: rgba(255,255,255,0.95); }
      .gt-modalSub { margin-top:4px; color: rgba(255,255,255,0.70); font-size: 13px; }
      .gt-modalBody { padding: 14px; }
      .gt-modalCols { display:grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px; }
      @media (max-width: 880px) { .gt-modalCols { grid-template-columns: 1fr; } }

      .gt-h3 { margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.92); }
      .gt-days { display:flex; flex-direction:column; gap: 10px; }
      .gt-dayRow { display:flex; gap: 10px; padding: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.08); }
      .gt-dayNum { width: 74px; font-weight: 800; color: rgba(255,255,255,0.92); }
      .gt-dayTitle { font-weight: 800; color: rgba(255,255,255,0.95); }
      .gt-dayFocus { margin-top:4px; color: rgba(255,255,255,0.72); font-size: 13px; }

      .gt-miniList { display:flex; flex-direction:column; gap: 10px; }
      .gt-miniItem { display:flex; gap: 10px; align-items:flex-start; padding: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.08); }
      .gt-miniThumb { width: 42px; height: 42px; border-radius: 12px; background: rgba(255,255,255,0.10); background-size: cover; background-position: center; border: 1px solid rgba(255,255,255,0.14); flex: 0 0 auto; }
      .gt-miniGrow { flex: 1 1 auto; min-width: 0; }
      .gt-miniName { font-weight: 800; color: rgba(255,255,255,0.92); }
      .gt-miniMeta { margin-top:2px; color: rgba(255,255,255,0.66); font-size: 12px; }
      .gt-miniActions { margin-top: 8px; }

      .gt-ul { margin: 0; padding-left: 16px; color: rgba(255,255,255,0.78); }
      .gt-modalActions { margin-top: 14px; display:flex; gap: 10px; flex-wrap:wrap; }

      .gt-lockCard {
        border-radius: 16px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
      }
      .gt-lockTitle { font-weight: 900; color: rgba(255,255,255,0.92); }
      .gt-lockSub { margin-top: 6px; color: rgba(255,255,255,0.70); font-size: 13px; }

      /* Toast */
      #gt-toastHost {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }
      .gt-toast {
        opacity: 0;
        transform: translateY(6px);
        transition: opacity .18s ease, transform .18s ease;
      }
      .gt-toast.is-on { opacity: 1; transform: translateY(0); }
      .gt-toastInner {
        pointer-events: none;
        border-radius: 14px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(15,23,42,0.92);
        color: rgba(255,255,255,0.92);
        box-shadow: 0 16px 40px rgba(0,0,0,0.45);
        font-size: 13px;
        max-width: 340px;
      }
    `;

    document.head.appendChild(style);
  }

  function mountItineraries(rootSelector = "#view") {
    injectItineraryStylesOnce();

    const root = document.querySelector(rootSelector);
    if (!root) {
      console.warn("[Itineraries] Root container not found:", rootSelector);
      return;
    }

    const raw = Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : [];
    const destinations = raw.filter(isValidDestination);

    if (!destinations.length) {
      root.innerHTML = `
        <section class="gt-section">
          <h1 class="gt-title">Itineraries</h1>
          <div class="gt-empty" style="margin-top:12px;">
            No valid destinations loaded. This screen requires <code>window.DESTINATIONS</code> from <code>/data.js</code>.
            <div style="margin-top:10px; color: rgba(255,255,255,0.70); font-size: 13px;">
              If you recently edited <code>data.js</code>, you likely introduced <code>undefined</code>/<code>null</code> entries or missing <code>country/name</code>.
              Check DevTools Console for errors, and validate your dataset.
            </div>
          </div>
        </section>
      `;
      return;
    }

    const badCount = raw.length - destinations.length;
    if (badCount > 0) {
      console.warn(`[Itineraries] Skipped ${badCount} invalid destination entries in window.DESTINATIONS.`);
    }

    const itineraries = generateItinerariesFromDestinations(destinations);

    window.ITINERARIES = itineraries;
    renderItinerariesScreen(root, itineraries);
  }


  window.GeoTourism = window.GeoTourism || {};
  window.GeoTourism.mountItineraries = mountItineraries;
  window.GeoTourism.generateItinerariesFromDestinations = generateItinerariesFromDestinations;


  window.GeoTourism.downloadDestinationSummaryPDF = downloadDestinationSummaryPDF;
  window.GeoTourism.downloadItineraryPreviewPDF = (itinOrId, previewDaysCount = 3) => {
    const itin =
      typeof itinOrId === "string"
        ? (window.ITINERARIES || []).find((x) => x.id === itinOrId)
        : itinOrId;
    if (!itin) return showToast("Itinerary not found for PDF.");
    return downloadItineraryPreviewPDF(itin, previewDaysCount);
  };


  function autoMountIfNeeded() {
    if (window.__GT_ITIN_MOUNTED__) return;

    const el = document.querySelector("#itinMount") || document.querySelector("#view");
    if (!el) return;

    const html = (el.innerHTML || "").trim();
    if (html && html.length > 50) return;

    window.__GT_ITIN_MOUNTED__ = true;
    mountItineraries(el.id ? `#${el.id}` : "#view");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMountIfNeeded, { once: true });
  } else {
    autoMountIfNeeded();
  }
})();
