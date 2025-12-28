

(() => {
  "use strict";

  const CFG = window.GEOZIM_CONFIG || {};
  const DESTS = Array.isArray(window.DESTINATIONS) ? window.DESTINATIONS : [];
  const hasLeaflet = typeof window.L !== "undefined";

  const WB = {
    base: "https://api.worldbank.org/v2",
    perPage: 20000,
    indicators: {
      arrivals: "ST.INT.ARVL",
      receipts: "ST.INT.RCPT.CD",
      airPax: "IS.AIR.PSGR"
    }
  };

  const UI = {
    regions: ["All", "North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa"],
    views: ["Overview", "Demand", "Supply", "Pricing", "Visuals"]
  };

  function esc(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function uniq(arr) {
    return Array.from(new Set(arr.filter(Boolean)));
  }

  function sum(arr) {
    return arr.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  }

  function fmtNumber(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString();
  }

  function fmtUSD(n) {
    if (!Number.isFinite(n)) return "—";
  
    const abs = Math.abs(n);
    if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }

  function median(values) {
    const v = values.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (!v.length) return NaN;
    const mid = Math.floor(v.length / 2);
    return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function icon(name) {
    
    switch (name) {
      case "trend":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 16l6-6 4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 8v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      case "hotel":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 22V3h10v19" stroke="currentColor" stroke-width="2"/>
          <path d="M14 12h6v10" stroke="currentColor" stroke-width="2"/>
          <path d="M7 6h4M7 9h4M7 12h4M7 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case "plane":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 16l20-8-20-8 4 8-4 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M6 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case "money":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M7 10h.01M17 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      case "map":
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M9 3v15M15 6v15" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      default:
        return "";
    }
  }

  
  function buildCountryIndex() {
 
    const byIso = new Map();

    for (const d of DESTS) {
      const iso2 = d.countryCode;
      const name = d.country;
      const region = d.africaRegion || "Unknown";
      const hasCoords = Number.isFinite(d.lat) && Number.isFinite(d.lng);
      if (!iso2 || !name) continue;

      if (!byIso.has(iso2)) {
        byIso.set(iso2, {
          iso2,
          name,
          region,
          coords: [],
          lat: NaN,
          lng: NaN
        });
      }

      const row = byIso.get(iso2);

      if (row.region === "Unknown" && region !== "Unknown") row.region = region;
      if (row.name !== name) row.name = name;

      if (hasCoords) row.coords.push([d.lat, d.lng]);
    }

 
    for (const row of byIso.values()) {
      if (row.coords.length) {
        const lat = row.coords.reduce((a, c) => a + c[0], 0) / row.coords.length;
        const lng = row.coords.reduce((a, c) => a + c[1], 0) / row.coords.length;
        row.lat = lat;
        row.lng = lng;
      } else {
     
        row.lat = 1.5;
        row.lng = 17.3;
      }
    }

    return byIso;
  }

    function getCache() {
  const c = window.SD_CACHE;
  if (!c || !c.byIso2) return null;
  return c.byIso2;
}


async function fetchIndicatorLatest(indicator, iso2List) {
  const cache = getCache();

  const key =
    indicator === WB.indicators.arrivals ? "arrivals" :
    indicator === WB.indicators.receipts ? "receipts" :
    indicator === WB.indicators.airPax ? "airPax" :
    null;

  try {
    const joined = iso2List.join(";");
    const url = `${WB.base}/country/${joined}/indicator/${indicator}?format=json&per_page=${WB.perPage}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`World Bank API failed (${indicator})`);

    const json = await res.json();
    const rows = Array.isArray(json) ? json[1] : [];
    const latest = new Map();

    for (const r of rows || []) {
      if (!r || !r.country || !r.country.id) continue;
      if (r.value == null) continue;

      const iso2 = r.country.id;
      const year = Number(r.date);
      const val = Number(r.value);

      const prev = latest.get(iso2);
      if (!prev || (Number.isFinite(year) && year > prev.year)) {
        latest.set(iso2, { year, value: val });
      }
    }

   
    if (cache && key) {
      for (const [iso2, v] of latest.entries()) {
        cache[iso2] = cache[iso2] || {};
        cache[iso2][key] = v;
      }
    }

    return latest;
  } catch (e) {
    
    if (!cache || !key) throw e;

    const latest = new Map();
    for (const iso2 of iso2List) {
      const row = cache[iso2];
      if (row && row[key] && row[key].value != null) {
        latest.set(iso2, { year: Number(row[key].year), value: Number(row[key].value) });
      }
    }

    if (!latest.size) throw e;

    return latest;
  }
}


  const state = {
    region: (CFG.supplyDemand?.defaultRegion) || "All",
    view: "Overview",
    dataReady: false,
    err: "",
    kpis: null,
    countries: null,  
    series: null,    
    map: null,
    mapLayer: null
  };


  function injectStyles() {
    if (document.getElementById("sdStyles")) return;

    const css = `
      .sd-head { display:flex; justify-content:space-between; align-items:flex-end; gap:14px; flex-wrap:wrap; }
      .sd-title h2 { margin:0; }
      .sd-sub { color: rgba(255,255,255,0.70); }

      .sd-bar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:12px; }
      .sd-pills { display:flex; gap:10px; flex-wrap:wrap; }

      .sd-pill {
        appearance:none; border:1px solid rgba(255,255,255,0.22);
        background: rgba(255,255,255,0.10);
        color: rgba(255,255,255,0.88);
        padding: 10px 14px;
        border-radius: 999px;
        cursor:pointer;
        font-weight: 650;
        letter-spacing: 0.1px;
        backdrop-filter: blur(10px);
      }
      .sd-pill:hover { background: rgba(255,255,255,0.14); }
      .sd-pill.is-on {
        background: rgba(59,130,246,0.28);
        border-color: rgba(59,130,246,0.55);
        color: #fff;
      }

      .sd-wrap { margin-top:14px; }
      .sd-grid { display:grid; grid-template-columns: 1.15fr 0.85fr; gap:14px; align-items:start; }
      @media (max-width: 980px) { .sd-grid { grid-template-columns: 1fr; } }

      /* Fix the "overlay" issue: enforce scroll and stacking */
      .sd-scroll {
        max-height: 68vh;
        overflow:auto;
        padding-right: 6px;
      }
      .sd-scroll::-webkit-scrollbar { width: 10px; }
      .sd-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 10px; }
      .sd-scroll::-webkit-scrollbar-track { background: transparent; }

      .sd-kpis { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
      @media (max-width: 520px) { .sd-kpis { grid-template-columns: 1fr; } }

      .sd-kpi {
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 18px;
        padding: 14px;
      }
      .sd-kpi .label { color: rgba(255,255,255,0.70); font-weight:650; }
      .sd-kpi .value { font-size: 22px; font-weight: 800; margin-top: 6px; }

      .sd-note {
        margin-top: 10px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 16px;
        padding: 12px;
        color: rgba(255,255,255,0.78);
      }

      .sd-map {
        height: 380px;
        border-radius: 18px;
        overflow:hidden;
        border: 1px solid rgba(255,255,255,0.18);
      }

      .sd-table { width:100%; border-collapse: collapse; margin-top: 10px; }
      .sd-table th, .sd-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.14); }
      .sd-table th { text-align:left; color: rgba(255,255,255,0.70); font-weight: 700; }
      .sd-table td { color: rgba(255,255,255,0.88); }

      .sd-mini { color: rgba(255,255,255,0.70); font-size: 13px; }
      .sd-badge {
        display:inline-flex; align-items:center; gap:8px;
        padding: 8px 10px;
        border-radius: 999px;
        border:1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.85);
        font-weight:650;
      }
    `;

    const style = document.createElement("style");
    style.id = "sdStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderShell(mountEl) {
    mountEl.innerHTML = `
      <div class="section-title sd-head">
        <div class="sd-title">
          <h2>Supply & Demand</h2>
          <div class="sd-sub">Real indicator data (latest available year) with region filters and a demand “heat map”.</div>
        </div>
        <div class="sd-badge" title="Data provider">
          ${icon("trend")} World Bank Open Data
        </div>
      </div>

      <div class="card glass sd-bar">
        <div class="sd-pills" id="sdRegionPills" aria-label="Region filter"></div>
        <div class="sd-pills" id="sdViewPills" aria-label="View tabs"></div>
      </div>

      <div class="sd-wrap" id="sdBody"></div>
    `;

    const rWrap = mountEl.querySelector("#sdRegionPills");
    const vWrap = mountEl.querySelector("#sdViewPills");

    rWrap.innerHTML = UI.regions.map(r => `
      <button class="sd-pill ${r === state.region ? "is-on" : ""}" type="button" data-sd-region="${esc(r)}">${esc(r)}</button>
    `).join("");

    vWrap.innerHTML = UI.views.map(v => `
      <button class="sd-pill ${v === state.view ? "is-on" : ""}" type="button" data-sd-view="${esc(v)}">${esc(v)}</button>
    `).join("");

    rWrap.querySelectorAll("[data-sd-region]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.region = btn.getAttribute("data-sd-region");
        renderBody(mountEl);
        renderShell(mountEl); 
        
      });
    });

    vWrap.querySelectorAll("[data-sd-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.view = btn.getAttribute("data-sd-view");
        renderBody(mountEl);
        renderShell(mountEl);
      });
    });
  }

  function regionCountries() {
    const rows = Array.from(state.countries.values());
    if (state.region === "All") return rows;
    return rows.filter(r => r.region === state.region);
  }

  function computeKPIs(regionRows) {
    const arrivalsVals = regionRows.map(r => r.arrivals?.value).filter(Number.isFinite);
    const receiptsVals = regionRows.map(r => r.receipts?.value).filter(Number.isFinite);
    const airVals = regionRows.map(r => r.airPax?.value).filter(Number.isFinite);

    const arrivalsSum = sum(arrivalsVals);
    const receiptsSum = sum(receiptsVals);
    const airSum = sum(airVals);

    const arrivalsMed = median(arrivalsVals);
    const receiptsMed = median(receiptsVals);

    const spendPerVisitor = (Number.isFinite(receiptsSum) && receiptsSum > 0 && Number.isFinite(arrivalsSum) && arrivalsSum > 0)
      ? (receiptsSum / arrivalsSum)
      : NaN;

    const coverageArr = arrivalsVals.length;
    const coverageRec = receiptsVals.length;
    const coverageAir = airVals.length;

    const yearCandidates = regionRows.flatMap(r => [
      r.arrivals?.year, r.receipts?.year, r.airPax?.year
    ].filter(Number.isFinite));

    const latestYear = yearCandidates.length ? Math.max(...yearCandidates) : NaN;

    return {
      arrivalsSum, receiptsSum, airSum,
      arrivalsMed, receiptsMed,
      spendPerVisitor,
      coverageArr, coverageRec, coverageAir,
      latestYear
    };
  }

  function renderOverview(regionRows) {
    const k = computeKPIs(regionRows);

    return `
      <div class="sd-grid">
        <div class="card glass sd-scroll">
          <div class="section-title">
            <h2>Overview — ${esc(state.region)}</h2>
            <div class="muted">KPIs below are computed from World Bank indicators (latest year per country).</div>
          </div>

          <div class="sd-kpis" style="margin-top:12px;">
            <div class="sd-kpi">
              <div class="label">Demand proxy — arrivals</div>
              <div class="value">${fmtNumber(k.arrivalsSum)}</div>
              <div class="sd-mini">Coverage: ${k.coverageArr} country datapoints</div>
            </div>

            <div class="sd-kpi">
              <div class="label">Demand value — receipts</div>
              <div class="value">${fmtUSD(k.receiptsSum)}</div>
              <div class="sd-mini">Coverage: ${k.coverageRec} country datapoints</div>
            </div>

            <div class="sd-kpi">
              <div class="label">Access / supply proxy — air passengers</div>
              <div class="value">${fmtNumber(k.airSum)}</div>
              <div class="sd-mini">Coverage: ${k.coverageAir} country datapoints</div>
            </div>

            <div class="sd-kpi">
              <div class="label">Spend per visitor (proxy)</div>
              <div class="value">${Number.isFinite(k.spendPerVisitor) ? fmtUSD(k.spendPerVisitor) : "—"}</div>
              <div class="sd-mini">Receipts ÷ arrivals (aggregated)</div>
            </div>
          </div>

          <div class="sd-note">
            <strong>Important:</strong>
            This page uses official macro indicators. Some countries publish with a lag; “latest available year”
            may differ by country and indicator. The module always selects the most recent non-null value per country.
            ${Number.isFinite(k.latestYear) ? `Latest year present in this view: <strong>${k.latestYear}</strong>.` : ""}
          </div>

          <div class="section-title" style="margin-top:14px;">
            <h2>Top countries by arrivals</h2>
            <div class="muted">This ranking is computed from the same dataset used for the map.</div>
          </div>

          ${renderTopTable(regionRows, "arrivals")}
        </div>

        <div class="card glass">
          <div class="section-title">
            <h2>Demand heat map</h2>
            <div class="muted">Circle size reflects arrivals (latest year). Click a country to see values.</div>
          </div>
          <div class="sd-map" id="sdMap"></div>

          <div class="sd-note">
            <div class="sd-mini">
              Tip: If a country has limited destination coordinates in your dataset, the marker uses a fallback centroid.
              Adding more lat/lng destinations improves placement precision.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTopTable(regionRows, metric) {
    const key = metric; 
    const sorted = regionRows
      .filter(r => Number.isFinite(r[key]?.value))
      .slice()
      .sort((a, b) => (b[key].value - a[key].value))
      .slice(0, 12);

    const label =
      key === "arrivals" ? "Arrivals" :
      key === "receipts" ? "Receipts (US$)" :
      "Air passengers";

    const fmt =
      key === "receipts" ? fmtUSD :
      fmtNumber;

    return `
      <table class="sd-table" role="table" aria-label="Top countries">
        <thead><tr><th>Country</th><th>${esc(label)}</th><th>Year</th></tr></thead>
        <tbody>
          ${sorted.map(r => `
            <tr>
              <td>${esc(r.name)}</td>
              <td>${fmt(r[key].value)}</td>
              <td>${esc(r[key].year)}</td>
            </tr>
          `).join("") || `<tr><td colspan="3" class="muted">No data available for this region selection.</td></tr>`}
        </tbody>
      </table>
    `;
  }

  function renderDemand(regionRows) {
    return `
      <div class="sd-grid">
        <div class="card glass sd-scroll">
          <div class="section-title">
            <h2>Demand — ${esc(state.region)}</h2>
            <div class="muted">Arrivals and receipts act as demand and demand-value signals.</div>
          </div>

          <div class="grid grid--2" style="margin-top:12px;">
            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>${icon("trend")} Search interest trends (what to use)</strong>
              <div class="muted" style="margin-top:8px;">
                For truly real-time “interest”, you should connect Google Trends or Google Travel Insights.
                This module stays API-key-free and uses official macro demand signals instead.
              </div>
              <div class="sd-note">
                Recommended: add a “Trends” widget later, but keep this KPI base as your validated backbone.
              </div>
            </div>

            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>Seasonality notes (operational)</strong>
              <ul class="bullets" style="margin-top:8px;">
                <li>Expect peak pricing during school holidays and major events.</li>
                <li>Shoulder windows often maximize value and availability.</li>
                <li>Weather-driven demand spikes vary by micro-region and access.</li>
              </ul>
            </div>
          </div>

          <div class="section-title" style="margin-top:14px;">
            <h2>Top countries by receipts</h2>
            <div class="muted">Receipts are a value signal (not pure volume).</div>
          </div>
          ${renderTopTable(regionRows, "receipts")}

          <div class="section-title" style="margin-top:14px;">
            <h2>Top countries by arrivals</h2>
            <div class="muted">Volume demand signal.</div>
          </div>
          ${renderTopTable(regionRows, "arrivals")}
        </div>

        <div class="card glass">
          <div class="section-title">
            <h2>Preferred amenities</h2>
            <div class="muted">This should come from your own on-site analytics or OTA partner feeds.</div>
          </div>
          <div class="sd-note">
            If you want this to be “real”, you must either:
            <ul class="bullets" style="margin-top:8px;">
              <li>Track filters on your site (Wi-Fi, breakfast, pool, etc.), or</li>
              <li>Pull a partner data feed from an OTA / PMS channel manager.</li>
            </ul>
            This module intentionally avoids fake percentages.
          </div>
        </div>
      </div>
    `;
  }

  function renderSupply(regionRows) {
    return `
      <div class="sd-grid">
        <div class="card glass sd-scroll">
          <div class="section-title">
            <h2>Supply — ${esc(state.region)}</h2>
            <div class="muted">Supply is best measured by inventory (rooms, seats, tour slots). Without paid datasets, we use access proxies.</div>
          </div>

          <div class="grid grid--2" style="margin-top:12px;">
            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>${icon("plane")} Air access proxy</strong>
              <div class="muted" style="margin-top:8px;">
                Air passengers carried approximates the scale of aviation access and transport throughput.
              </div>
            </div>

            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>${icon("hotel")} Inventory capacity (recommended next)</strong>
              <div class="muted" style="margin-top:8px;">
                For real capacity, integrate hotel room inventory by city and tour slot availability via partner APIs.
              </div>
            </div>
          </div>

          <div class="section-title" style="margin-top:14px;">
            <h2>Top countries by air passengers</h2>
            <div class="muted">Access / capacity proxy (latest year).</div>
          </div>
          ${renderTopTable(regionRows, "airPax")}
        </div>

        <div class="card glass">
          <div class="section-title">
            <h2>Infrastructure & regulatory notes</h2>
            <div class="muted">Use as a partner / operator checklist.</div>
          </div>
          <ul class="bullets" style="margin-top:10px;">
            <li>Confirm licensing and insurance for tours and transfers.</li>
            <li>Document emergency and escalation contacts per hub.</li>
            <li>Track airport reliability and on-time performance for critical routes.</li>
            <li>Maintain service SLAs for pick-ups, cancellations, and refunds.</li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderPricing(regionRows) {
    const k = computeKPIs(regionRows);

    return `
      <div class="sd-grid">
        <div class="card glass sd-scroll">
          <div class="section-title">
            <h2>Pricing strategy — ${esc(state.region)}</h2>
            <div class="muted">This section explains the logic behind pricing using your validated KPI base.</div>
          </div>

          <div class="grid grid--2" style="margin-top:12px;">
            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>${icon("money")} Market-clearing price</strong>
              <div class="muted" style="margin-top:8px;">
                When demand exceeds available inventory, prices rise until bookings slow enough that inventory clears.
                Use your occupancy and conversion data to identify the point where additional price reduces volume.
              </div>
            </div>

            <div class="card" style="box-shadow:none; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);">
              <strong>Spend per visitor proxy</strong>
              <div class="muted" style="margin-top:8px;">
                Current view estimate: <strong>${Number.isFinite(k.spendPerVisitor) ? fmtUSD(k.spendPerVisitor) : "—"}</strong>.
                Treat as directional; refine with on-site conversion + OTA rate data.
              </div>
            </div>
          </div>

          <div class="sd-note">
            <strong>How to make this fully “real-time”:</strong>
            connect at least one of:
            <ul class="bullets" style="margin-top:8px;">
              <li>OTA rate calendars (Booking.com partner tools) for ADR and availability</li>
              <li>Channel manager / PMS inventory feeds</li>
              <li>On-site conversion analytics (search → click → affiliate redirect)</li>
            </ul>
          </div>

          <div class="section-title" style="margin-top:14px;">
            <h2>Competitor benchmarking (what to compare)</h2>
            <div class="muted">Benchmarks you can implement next without guesswork:</div>
          </div>
          <ul class="bullets">
            <li>ADR by city, season, and property class</li>
            <li>Occupancy rate by month</li>
            <li>Tour booking lead times and cancellation rates</li>
            <li>Affiliate EPC (earnings per click) by landing page</li>
          </ul>
        </div>

        <div class="card glass">
          <div class="section-title">
            <h2>Quick KPIs</h2>
            <div class="muted">From official indicators in this view.</div>
          </div>

          <div class="sd-kpis" style="margin-top:12px;">
            <div class="sd-kpi">
              <div class="label">Arrivals</div>
              <div class="value">${fmtNumber(k.arrivalsSum)}</div>
            </div>
            <div class="sd-kpi">
              <div class="label">Receipts</div>
              <div class="value">${fmtUSD(k.receiptsSum)}</div>
            </div>
            <div class="sd-kpi">
              <div class="label">Air passengers</div>
              <div class="value">${fmtNumber(k.airSum)}</div>
            </div>
            <div class="sd-kpi">
              <div class="label">Spend/visitor</div>
              <div class="value">${Number.isFinite(k.spendPerVisitor) ? fmtUSD(k.spendPerVisitor) : "—"}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderVisuals(regionRows) {
    return `
      <div class="sd-grid">
        <div class="card glass sd-scroll">
          <div class="section-title">
            <h2>Visuals — ${esc(state.region)}</h2>
            <div class="muted">Heat-map-style view and ranked tables based on official indicators.</div>
          </div>

          <div class="section-title" style="margin-top:14px;">
            <h2>Arrivals (demand) — top countries</h2>
          </div>
          ${renderTopTable(regionRows, "arrivals")}

          <div class="section-title" style="margin-top:14px;">
            <h2>Receipts (value) — top countries</h2>
          </div>
          ${renderTopTable(regionRows, "receipts")}

          <div class="section-title" style="margin-top:14px;">
            <h2>Air passengers (access) — top countries</h2>
          </div>
          ${renderTopTable(regionRows, "airPax")}
        </div>

        <div class="card glass">
          <div class="section-title">
            <h2>Heat map</h2>
            <div class="muted">Same map view, optimized for scanning.</div>
          </div>
          <div class="sd-map" id="sdMap"></div>
          <div class="sd-note">
            <div class="sd-mini">Marker radius is scaled from arrivals to support quick comparison.</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderError(msg) {
    return `
      <div class="section-title">
        <h2>Supply & Demand</h2>
        <div class="muted">Could not load data.</div>
      </div>
      <div class="card glass">
        <strong>Fix</strong>
        <div class="muted" style="margin-top:8px;">${esc(msg)}</div>
        <div class="sd-note">This module requires network access to the World Bank API.</div>
      </div>
    `;
  }

  function renderLoading() {
    return `
      <div class="section-title">
        <h2>Supply & Demand</h2>
        <div class="muted">Loading validated indicator data…</div>
      </div>
      <div class="card glass">
        <div class="muted">Fetching World Bank indicators (latest values by country). This can take a few seconds on first load.</div>
      </div>
    `;
  }

  function renderBody(mountEl) {
    const body = mountEl.querySelector("#sdBody");
    if (!body) return;

    if (state.err) {
      body.innerHTML = renderError(state.err);
      return;
    }

    if (!state.dataReady) {
      body.innerHTML = renderLoading();
      return;
    }

    const regionRows = regionCountries();

    if (state.view === "Overview") body.innerHTML = renderOverview(regionRows);
    else if (state.view === "Demand") body.innerHTML = renderDemand(regionRows);
    else if (state.view === "Supply") body.innerHTML = renderSupply(regionRows);
    else if (state.view === "Pricing") body.innerHTML = renderPricing(regionRows);
    else if (state.view === "Visuals") body.innerHTML = renderVisuals(regionRows);
    else body.innerHTML = renderOverview(regionRows);

    const mapEl = body.querySelector("#sdMap");
    if (mapEl) buildMap(mapEl, regionRows);
  }

  function buildMap(mapEl, regionRows) {
    if (!hasLeaflet) return;

    if (state.map) {
      try { state.map.remove(); } catch (_) {}
      state.map = null;
      state.mapLayer = null;
    }

    state.map = window.L.map(mapEl, { scrollWheelZoom: false });

    // Africa framing
    state.map.setView([1.5, 17.3], 3);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(state.map);

    const vals = regionRows.map(r => r.arrivals?.value).filter(Number.isFinite);
    const maxV = vals.length ? Math.max(...vals) : 1;

    state.mapLayer = window.L.layerGroup().addTo(state.map);

    for (const c of regionRows) {
      const v = c.arrivals?.value;
      if (!Number.isFinite(v)) continue;

      const ratio = v / maxV;
      const radius = clamp(6 + Math.sqrt(ratio) * 28, 6, 34);

      const marker = window.L.circleMarker([c.lat, c.lng], {
        radius,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.35
      }).addTo(state.mapLayer);

      const pop = `
        <strong>${esc(c.name)}</strong><br/>
        <span>Arrivals: ${fmtNumber(c.arrivals?.value)} (${esc(c.arrivals?.year)})</span><br/>
        <span>Receipts: ${fmtUSD(c.receipts?.value)} (${esc(c.receipts?.year)})</span><br/>
        <span>Air pax: ${fmtNumber(c.airPax?.value)} (${esc(c.airPax?.year)})</span>
      `;
      marker.bindPopup(pop);
    }
  }

  async function loadAll() {
    const countryIndex = buildCountryIndex();
    const iso2 = uniq(Array.from(countryIndex.keys()));

    if (!iso2.length) {
      throw new Error("No countryCode values found in DESTINATIONS. Add countryCode (ISO2) to your destinations.");
    }

    const [arrMap, recMap, airMap] = await Promise.all([
      fetchIndicatorLatest(WB.indicators.arrivals, iso2),
      fetchIndicatorLatest(WB.indicators.receipts, iso2),
      fetchIndicatorLatest(WB.indicators.airPax, iso2)
    ]);


    for (const row of countryIndex.values()) {
      row.arrivals = arrMap.get(row.iso2) || null;
      row.receipts = recMap.get(row.iso2) || null;
      row.airPax = airMap.get(row.iso2) || null;
    }

    state.countries = countryIndex;
    state.series = { arrMap, recMap, airMap };
    state.dataReady = true;
  }

  function mount(selector = "#sdMount") {
    const mountEl = (typeof selector === "string") ? document.querySelector(selector) : selector;
    if (!mountEl) return;

    injectStyles();
    renderShell(mountEl);
    renderBody(mountEl);

    loadAll()
      .then(() => {
        state.err = "";
        renderShell(mountEl);
        renderBody(mountEl);
      })
      .catch((e) => {
        state.err = e?.message || String(e);
        renderShell(mountEl);
        renderBody(mountEl);
      });
  }

  // expose
  window.GeoTourism = window.GeoTourism || {};
  window.GeoTourism.mountSupplyDemand = mount;
})();
