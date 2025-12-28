(function () {
  "use strict";

  const DESTS = Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : [];
  const CFG = window.GEOZIM_CONFIG || {};

  const esc = (s) =>
    (s ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const norm = (s) => (s || "").toString().trim();
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const uniqSorted = (arr) => uniq(arr).sort((a, b) => String(a).localeCompare(String(b)));

  function slugify(s) {
    return norm(s)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function utmParams(extra = {}) {
    const a = (CFG.analytics || {});
    const base = {
      utm_source: a.utmSource || "geotourism",
      utm_medium: a.utmMedium || "affiliate",
      utm_campaign: a.utmCampaign || "stays"
    };
    return { ...base, ...extra };
  }

  function buildUrl(base, params) {
    const u = new URL(base);
    Object.entries(params || {}).forEach(([k, v]) => {
      const sv = String(v ?? "").trim();
      if (sv) u.searchParams.set(k, sv);
    });
    return u.toString();
  }

  function bookingAffiliateUrl(searchText, contentId) {
    const aff = CFG.affiliate || {};
    const base = aff.hotelSearchBaseUrl || "https://www.booking.com/searchresults.html";
    const p = {
      ...(aff.hotelAffiliateParams || {}), 
      ...utmParams({ utm_content: contentId || "" }),
      ss: searchText
    };
    return buildUrl(base, p);
  }

  function getAfricaRegions() {
    const regs = uniqSorted(DESTS.map(d => d.africaRegion));
    return regs.filter(r => norm(r));
  }

  function destinationsByAfricaRegion() {
    const map = new Map();
    for (const d of DESTS) {
      const ar = norm(d.africaRegion);
      if (!ar) continue;
      if (!map.has(ar)) map.set(ar, []);
      map.get(ar).push(d);
    }
    return map;
  }

  function pickHeroForRegion(region, list) {
    const withImg = list.filter(d => norm(d.heroImage));
    if (!withImg.length) return "";
    const iconic = withImg.find(d => (d.tags || []).map(t => String(t).toLowerCase()).includes("iconic"));
    if (iconic?.heroImage) return iconic.heroImage;
    const unesco = withImg.find(d => (d.tags || []).map(t => String(t).toLowerCase()).includes("unesco"));
    if (unesco?.heroImage) return unesco.heroImage;
    return withImg[0].heroImage;
  }

  function regionCountries(list) {
    return uniqSorted(list.map(d => d.country)).filter(Boolean);
  }

  function regionTopBases(list) {
    return uniqSorted(list.map(d => d.stayHint)).slice(0, 8);
  }

  function defaultRegionMeta(region) {
    return {
      title: `${region} stays guide`,
      intro:
        `A practical accommodation guide for ${region}. Use it to choose a base, understand seasons, and book stays via trusted operators.`,
      seasons: [
        {
          label: "Peak season",
          text:
            "Typically aligns with dry, cooler months and major holiday windows. Expect higher prices and limited availability—book early."
        },
        {
          label: "Shoulder season",
          text:
            "Often the best value: good weather and more choice. Ideal for balancing cost and comfort."
        },
        {
          label: "Low / green season",
          text:
            "Warmer and/or wetter periods can mean better deals. Some roads/activities may be impacted—plan flexibility."
        }
      ],
      whatToWear: [
        "Light layers (cool mornings / warm afternoons in many areas).",
        "Comfortable walking shoes or sandals depending on itinerary.",
        "Sun protection: hat + sunglasses.",
        "A light rain layer in wetter months."
      ],
      packingThisMonth: [
        "Universal adapter + power bank.",
        "Medication basics + small first-aid kit.",
        "Reusable water bottle; consider purification options if going rural.",
        "Copies of bookings and key documents."
      ],
      waterSafety:
        "Water safety varies significantly by city, hotel standard, and rural areas. For most travelers, bottled or filtered water is the lowest-risk choice outside reputable hotels.",
      languages:
        "Languages vary by country. Check the countries list below and confirm common languages for your specific destinations.",
      currencies:
        "Currencies vary by country. Confirm the local currency for each country and carry redundancy (card + cash) for smoother travel.",
      faq: [
        { q: "Is the local water safe?", a: "It varies by location and accommodation standard. Use bottled or filtered water outside reputable hotels, especially when traveling rural." },
        { q: "What should I pack for this month?", a: "Pack light layers, sun protection, comfortable footwear, and a rain layer if your travel window overlaps wetter months." },
        { q: "How far in advance should I book?", a: "For peak season and popular hubs, book 4–12 weeks ahead; longer for premium resorts or major holidays." }
      ]
    };
  }

  function regionMeta(region) {
    const meta = CFG.stays?.regionsMeta?.[region];
    return meta ? meta : defaultRegionMeta(region);
  }

  function icon(name) {
    switch (name) {
      case "pin":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case "hotel":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 22V3h10v19" stroke="currentColor" stroke-width="2"/>
          <path d="M14 12h6v10" stroke="currentColor" stroke-width="2"/>
          <path d="M7 6h4M7 9h4M7 12h4M7 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case "calendar":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3v3M17 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 8h16" stroke="currentColor" stroke-width="2"/>
          <path d="M6 5h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case "info":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 10v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      default:
        return "";
    }
  }

  function injectStaysStylesOnce() {
    if (document.getElementById("gt-stays-styles")) return;
    const style = document.createElement("style");
    style.id = "gt-stays-styles";
    style.textContent = `
      .stays-wrap { padding: 16px; }
      .stays-head { display:flex; justify-content:space-between; align-items:flex-end; gap:14px; flex-wrap:wrap; }
      .stays-title { margin:0; font-size:28px; letter-spacing:-0.02em; }
      .stays-sub { margin:8px 0 0 0; color: rgba(255,255,255,0.72); max-width: 820px; }

      .stays-controls { display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end; }
      .stays-field label { display:block; font-size:12px; color: rgba(255,255,255,0.70); margin-bottom:6px; }
      .stays-input {
        min-width: 220px;
        padding:10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.92);
        outline:none;
        appearance: none;
      }
      .stays-input::placeholder { color: rgba(255,255,255,0.55); }
      .stays-input:focus {
        border-color: rgba(147,197,253,0.55);
        box-shadow: 0 0 0 4px rgba(59,130,246,0.18);
      }
      .stays-select {
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
      .stays-select option { background: #0f172a; color: rgba(255,255,255,0.92); }

      .stays-grid { margin-top: 14px; display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }
      .stays-card {
        border-radius: 18px; overflow:hidden;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
        box-shadow: 0 18px 50px rgba(0,0,0,0.35);
        cursor: pointer;
      }
      .stays-media { position:relative; height: 150px; background-size: cover; background-position: center; }
      .stays-overlay { position:absolute; inset:0; background: linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.10)); }
      .stays-top { position:absolute; left:14px; right:14px; bottom:12px; }
      .stays-name { font-weight: 900; font-size: 16px; color: rgba(255,255,255,0.95); }
      .stays-meta { margin-top:4px; color: rgba(255,255,255,0.72); font-size: 13px; }

      .stays-body { padding: 12px 14px 14px 14px; }
      .stays-desc { color: rgba(255,255,255,0.74); font-size: 13px; line-height: 1.35; }
      .stays-chiprow { margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; }
      .stays-chip {
        font-size: 12px;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.85);
      }
      .stays-actions { margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap; }
      .stays-btn {
        border-radius: 999px; padding: 10px 12px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.92);
        cursor: pointer;
      }
      .stays-btnPrimary { background: rgba(59,130,246,0.35); border-color: rgba(59,130,246,0.55); }

      .stays-detail { margin-top: 14px; display:grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; }
      @media (max-width: 920px) { .stays-detail { grid-template-columns: 1fr; } }

      .stays-panel {
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.08);
        box-shadow: 0 18px 50px rgba(0,0,0,0.35);
        padding: 14px;
      }

      .stays-h2 { margin:0; font-size: 18px; font-weight: 900; color: rgba(255,255,255,0.95); }
      .stays-muted { color: rgba(255,255,255,0.72); }
      .stays-hr { height:1px; background: rgba(255,255,255,0.12); margin: 12px 0; border:0; }

      .stays-list { margin: 10px 0 0 0; padding-left: 18px; color: rgba(255,255,255,0.78); }
      .stays-kv { display:grid; gap:10px; }
      .stays-kvRow { padding: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.08); }
      .stays-k { font-weight: 900; color: rgba(255,255,255,0.92); display:flex; gap:8px; align-items:center; }
      .stays-v { margin-top:6px; color: rgba(255,255,255,0.72); font-size: 13px; }

      .stays-faq { margin-top: 10px; display:flex; flex-direction:column; gap:10px; }
      .stays-faqItem { padding: 10px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.08); }
      .stays-q { font-weight: 900; color: rgba(255,255,255,0.92); }
      .stays-a { margin-top:6px; color: rgba(255,255,255,0.72); font-size: 13px; }
    `;
    document.head.appendChild(style);
  }

  function renderRegionCards(root, regionsMap, state) {
    const regions = getAfricaRegions();
    const q = (state.q || "").toLowerCase();
    const filtered = regions.filter(r => !q || r.toLowerCase().includes(q));

    const cards = filtered.map(region => {
      const list = regionsMap.get(region) || [];
      const hero = pickHeroForRegion(region, list);
      const countries = regionCountries(list);
      const bases = regionTopBases(list);

      const meta = regionMeta(region);

      return `
        <article class="stays-card" data-open-region="${esc(region)}" role="button" tabindex="0" aria-label="Open ${esc(region)} stay guide">
          <div class="stays-media" style="${hero ? `background-image:url('${esc(hero)}')` : ""}">
            <div class="stays-overlay"></div>
            <div class="stays-top">
              <div class="stays-name">${esc(region)}</div>
              <div class="stays-meta">${esc(countries.length)} countries • ${esc(list.length)} destinations</div>
            </div>
          </div>

          <div class="stays-body">
            <div class="stays-desc">${esc(meta.intro || "")}</div>

            <div class="stays-chiprow">
              ${bases.slice(0, 4).map(b => `<span class="stays-chip">${esc(b)}</span>`).join("")}
              ${countries.slice(0, 3).map(c => `<span class="stays-chip">${esc(c)}</span>`).join("")}
            </div>

            <div class="stays-actions">
              <button class="stays-btn stays-btnPrimary" type="button" data-book-region="${esc(region)}">${icon("hotel")} Book now</button>
              <button class="stays-btn" type="button" data-open-region="${esc(region)}">${icon("info")} View guide</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    root.innerHTML = `
      <section class="stays-wrap">
        <div class="stays-head">
          <div>
            <h1 class="stays-title">Book Hotels</h1>
            <p class="stays-sub">
              Choose a region, understand seasons and what to pack, then book stays using our partner links.
            </p>
          </div>

          <div class="stays-controls">
            <div class="stays-field">
              <label>Africa region</label>
              <select id="staysRegionJump" class="stays-input stays-select">
                <option value="">All regions</option>
                ${regions.map(r => `<option value="${esc(r)}"${state.region === r ? " selected" : ""}>${esc(r)}</option>`).join("")}
              </select>
            </div>

            <div class="stays-field">
              <label>Search</label>
              <input id="staysSearch" class="stays-input" type="search" placeholder="Search region (East Africa, Southern Africa…)" value="${esc(state.q)}" />
            </div>
          </div>
        </div>

        <div class="stays-grid" id="staysGrid">
          ${cards || `<div class="stays-panel"><div class="stays-h2">No regions found</div><div class="stays-muted">Check that your destinations include <code>africaRegion</code>.</div></div>`}
        </div>
      </section>
    `;
  }

  function renderRegionDetail(root, region, list) {
    const meta = regionMeta(region);
    const hero = pickHeroForRegion(region, list);
    const countries = regionCountries(list);
    const bases = regionTopBases(list);

    const bookingSearch = `${region} hotels`;
    const bookUrl = bookingAffiliateUrl(bookingSearch, `stays-${slugify(region)}`);

    const lang = meta.languages || defaultRegionMeta(region).languages;
    const curr = meta.currencies || defaultRegionMeta(region).currencies;

    root.innerHTML = `
      <section class="stays-wrap">
        <div class="stays-head">
          <div>
            <h1 class="stays-title">${esc(region)} — Stays Guide</h1>
            <p class="stays-sub">${esc(meta.intro || "")}</p>
          </div>

          <div class="stays-controls">
            <button class="stays-btn" type="button" id="staysBack">${icon("pin")} Back to regions</button>
            <a class="stays-btn stays-btnPrimary" href="${esc(bookUrl)}" target="_blank" rel="noopener">${icon("hotel")} Book now</a>
          </div>
        </div>

        <div class="stays-detail">
          <div class="stays-panel">
            <div class="stays-media" style="border-radius: 16px; height: 220px; ${hero ? `background-image:url('${esc(hero)}')` : ""}">
              <div class="stays-overlay" style="border-radius: 16px;"></div>
              <div class="stays-top" style="bottom: 14px;">
                <div class="stays-name" style="font-size:18px;">${esc(meta.title || `${region} stays guide`)}</div>
                <div class="stays-meta">${esc(countries.length)} countries • Suggested bases: ${esc(bases.slice(0, 4).join(", ") || "varies")}</div>
              </div>
            </div>

            <hr class="stays-hr" />

            <div class="stays-kv">
              <div class="stays-kvRow">
                <div class="stays-k">${icon("calendar")} Seasons</div>
                <div class="stays-v">
                  ${(meta.seasons || []).map(s => `<div><strong>${esc(s.label)}:</strong> ${esc(s.text)}</div>`).join("<br/>")}
                </div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} What to wear</div>
                <div class="stays-v">
                  <ul class="stays-list">
                    ${(meta.whatToWear || []).map(x => `<li>${esc(x)}</li>`).join("")}
                  </ul>
                </div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} Packing checklist</div>
                <div class="stays-v">
                  <ul class="stays-list">
                    ${(meta.packingThisMonth || []).map(x => `<li>${esc(x)}</li>`).join("")}
                  </ul>
                </div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} Water safety</div>
                <div class="stays-v">${esc(meta.waterSafety || "")}</div>
              </div>
            </div>

            <div class="stays-actions" style="margin-top:14px;">
              <a class="stays-btn stays-btnPrimary" href="${esc(bookUrl)}" target="_blank" rel="noopener">${icon("hotel")} Book now on Booking.com</a>
              <span class="stays-muted" style="font-size:12px;">Affiliate disclosure: links may earn a commission at no extra cost to you.</span>
            </div>
          </div>

          <div class="stays-panel">
            <div class="stays-h2">Region essentials</div>
            <div class="stays-muted" style="margin-top:6px;">Use this to choose a base and reduce friction.</div>

            <hr class="stays-hr" />

            <div class="stays-kv">
              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} Countries in this region</div>
                <div class="stays-v">${countries.length ? esc(countries.join(", ")) : "—"}</div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("pin")} Suggested bases (from your dataset)</div>
                <div class="stays-v">${bases.length ? esc(bases.join(", ")) : "—"}</div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} Languages</div>
                <div class="stays-v">${esc(lang)}</div>
              </div>

              <div class="stays-kvRow">
                <div class="stays-k">${icon("info")} Currencies</div>
                <div class="stays-v">${esc(curr)}</div>
              </div>
            </div>

            <hr class="stays-hr" />

            <div class="stays-h2" style="font-size:16px;">FAQ</div>
            <div class="stays-faq">
              ${(meta.faq || []).map(item => `
                <div class="stays-faqItem">
                  <div class="stays-q">${esc(item.q)}</div>
                  <div class="stays-a">${esc(item.a)}</div>
                </div>
              `).join("")}
            </div>

            <div class="stays-actions" style="margin-top:14px;">
              <a class="stays-btn stays-btnPrimary" href="${esc(bookUrl)}" target="_blank" rel="noopener">${icon("hotel")} Book now</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }


  function mountStays(rootSelector = "#view") {
    injectStaysStylesOnce();

    const root = document.querySelector(rootSelector);
    if (!root) {
      console.warn("[Stays] Root container not found:", rootSelector);
      return;
    }

    const regionsMap = destinationsByAfricaRegion();
    const regions = Array.from(regionsMap.keys());
    if (!regions.length) {
      root.innerHTML = `
        <section class="stays-wrap">
          <div class="stays-panel">
            <div class="stays-h2">Book Hotels</div>
            <div class="stays-muted" style="margin-top:8px;">
              No <code>africaRegion</code> fields found in your dataset. Add <code>africaRegion</code> to destinations to enable this screen.
            </div>
          </div>
        </section>
      `;
      return;
    }

    const state = { region: "", q: "" };

    function openRegion(region) {
      state.region = region;
      const list = regionsMap.get(region) || [];
      renderRegionDetail(root, region, list);

      const back = document.getElementById("staysBack");
      if (back) back.addEventListener("click", () => {
        state.region = "";
        render();
      });
    }

    function render() {
      renderRegionCards(root, regionsMap, state);

      const regionJump = document.getElementById("staysRegionJump");
      const search = document.getElementById("staysSearch");

      if (regionJump) {
        regionJump.addEventListener("change", () => {
          const v = regionJump.value;
          if (v) openRegion(v);
        });
      }

      if (search) {
        search.addEventListener("input", () => {
          state.q = search.value || "";
          render();
        });
      }

      root.querySelectorAll("[data-open-region]").forEach((el) => {
        const region = el.getAttribute("data-open-region");
        const open = () => openRegion(region);

        el.addEventListener("click", (e) => {
          if (e.target.closest("button[data-book-region]")) return;
          open();
        });

        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        });
      });

      root.querySelectorAll("button[data-book-region]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const region = btn.getAttribute("data-book-region");
          const url = bookingAffiliateUrl(`${region} hotels`, `stays-${slugify(region)}`);
          window.open(url, "_blank", "noopener,noreferrer");
        });
      });
    }

    render();
  }

  window.GeoTourism = window.GeoTourism || {};
  window.GeoTourism.mountStays = mountStays;
})();
