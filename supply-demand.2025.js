

(function () {
  "use strict";

 
  const SD2025 = {
    meta: {
      title: "Supply & Demand",
      subtitle: "2025 snapshot dataset with regional filters and a demand heat map.",
      badge: "Data: 2025 snapshot",
      note:
        "This page uses a 2025 compiled snapshot (offline dataset).The numbers will be updated.",
      updated: "2025",
    },

    regions: {
      All: {
        kpis: {
          demandIndex: 74,
          supplyIndex: 66,
          avgDailyRateIndex: 71,
          occupancyIndex: 68,
          seasonalityPeak: "Jul–Oct + Dec",
          topDrivers: ["Safari", "Beach", "City breaks", "Culture/heritage"],
        },
        narrative: {
          demand:
            "Demand remains concentrated in iconic wildlife circuits, high-connectivity capitals, and established coastal destinations. Bookings and search behavior tend to spike around school holidays and the dry season windows.",
          supply:
            "Supply growth is uneven: stronger around major gateways and established park circuits; thinner in remote regions where access, inventory, and operator capacity remain constraints.",
          pricing:
            "Pricing tends to clear at higher levels in peak dry months and holiday periods; shoulder seasons provide better value while maintaining strong experiences in many areas.",
        },
      },

      "North Africa": {
        kpis: {
          demandIndex: 70,
          supplyIndex: 73,
          avgDailyRateIndex: 69,
          occupancyIndex: 71,
          seasonalityPeak: "Oct–Apr",
          topDrivers: ["City breaks", "Culture/heritage", "Desert routes", "Coast"],
        },
        countries: [
          { name: "Morocco", demandIndex: 78, supplyIndex: 75, adrIndex: 72, occupancyIndex: 73 },
          { name: "Egypt", demandIndex: 76, supplyIndex: 77, adrIndex: 70, occupancyIndex: 72 },
          { name: "Tunisia", demandIndex: 64, supplyIndex: 70, adrIndex: 62, occupancyIndex: 66 },
          { name: "Algeria", demandIndex: 54, supplyIndex: 58, adrIndex: 55, occupancyIndex: 52 },
        ],
        narrative: {
          demand:
            "Demand skews toward city + heritage circuits and winter sun travel. Interest rises in cooler months, with strong performance for short-stay itineraries and combined culture + coast trips.",
          supply:
            "Inventory density is relatively higher in established city/coastal markets, enabling competitive pricing, more variety, and better last-minute availability than many other African regions.",
          pricing:
            "Rates strengthen in peak winter windows and around major festivals/holiday weeks; shoulder months offer solid value for similar experiences.",
        },
      },

      "West Africa": {
        kpis: {
          demandIndex: 60,
          supplyIndex: 55,
          avgDailyRateIndex: 63,
          occupancyIndex: 57,
          seasonalityPeak: "Nov–Mar",
          topDrivers: ["Business travel", "Culture", "City breaks", "Festivals"],
        },
        countries: [
          { name: "Ghana", demandIndex: 68, supplyIndex: 60, adrIndex: 65, occupancyIndex: 61 },
          { name: "Senegal", demandIndex: 64, supplyIndex: 58, adrIndex: 62, occupancyIndex: 59 },
          { name: "Nigeria", demandIndex: 62, supplyIndex: 52, adrIndex: 70, occupancyIndex: 55 },
          { name: "Côte d’Ivoire", demandIndex: 58, supplyIndex: 54, adrIndex: 60, occupancyIndex: 56 },
        ],
        narrative: {
          demand:
            "Demand mixes business gateways with cultural/festival travel. Peaks cluster around drier months and major events. Travelers tend to prioritize reliable logistics and centrally located stays.",
          supply:
            "Supply is concentrated in capital/business districts. Outside core hubs, inventory and standardized quality can be thinner, increasing the value of curated selections and trusted operators.",
          pricing:
            "Pricing tightens in event weeks and business-heavy periods; value improves in quieter weeks where availability increases.",
        },
      },

      "Central Africa": {
        kpis: {
          demandIndex: 52,
          supplyIndex: 44,
          avgDailyRateIndex: 66,
          occupancyIndex: 49,
          seasonalityPeak: "Dec–Feb + Jun–Aug (varies by corridor)",
          topDrivers: ["Rainforest/parks", "Business travel", "Adventure"],
        },
        countries: [
          { name: "Cameroon", demandIndex: 54, supplyIndex: 48, adrIndex: 62, occupancyIndex: 50 },
          { name: "Gabon", demandIndex: 50, supplyIndex: 40, adrIndex: 70, occupancyIndex: 46 },
          { name: "DR Congo", demandIndex: 46, supplyIndex: 38, adrIndex: 66, occupancyIndex: 42 },
          { name: "Congo", demandIndex: 44, supplyIndex: 36, adrIndex: 64, occupancyIndex: 41 },
        ],
        narrative: {
          demand:
            "Demand is niche and corridor-dependent, driven by rainforest experiences, select parks, and business travel. Travelers often require higher trust and clearer operational guidance.",
          supply:
            "Supply can be capacity-constrained outside major hubs, with fewer standardized options. Well-positioned inventory tends to capture premium rates.",
          pricing:
            "Limited supply plus higher operational costs can elevate pricing, especially for remote experiences and peak access windows.",
        },
      },

      "East Africa": {
        kpis: {
          demandIndex: 80,
          supplyIndex: 68,
          avgDailyRateIndex: 77,
          occupancyIndex: 73,
          seasonalityPeak: "Jun–Oct + Dec–Feb",
          topDrivers: ["Safari", "Beach", "Honeymoons", "Adventure"],
        },
        countries: [
          { name: "Kenya", demandIndex: 82, supplyIndex: 70, adrIndex: 78, occupancyIndex: 74 },
          { name: "Tanzania", demandIndex: 84, supplyIndex: 66, adrIndex: 80, occupancyIndex: 75 },
          { name: "Uganda", demandIndex: 62, supplyIndex: 52, adrIndex: 70, occupancyIndex: 58 },
          { name: "Rwanda", demandIndex: 66, supplyIndex: 50, adrIndex: 74, occupancyIndex: 60 },
        ],
        narrative: {
          demand:
            "Demand concentrates in flagship safari circuits and beach add-ons. Strong seasonal peaks align with dry-season travel and holiday windows, with premium willingness-to-pay for iconic wildlife experiences.",
          supply:
            "Supply is robust in established circuits but still constrained for premium lodges/camps in peak months. Advance booking remains important for high-demand parks.",
          pricing:
            "Dynamic pricing is pronounced in peak safari windows; shoulder season can offer meaningful value while preserving core experiences.",
        },
      },

      "Southern Africa": {
        kpis: {
          demandIndex: 76,
          supplyIndex: 63,
          avgDailyRateIndex: 74,
          occupancyIndex: 70,
          seasonalityPeak: "May–Oct + Dec",
          topDrivers: ["Safari", "Road trips", "City breaks", "Falls/landmarks"],
        },
        countries: [
          { name: "South Africa", demandIndex: 78, supplyIndex: 78, adrIndex: 72, occupancyIndex: 71 },
          { name: "Zimbabwe", demandIndex: 60, supplyIndex: 46, adrIndex: 66, occupancyIndex: 58 },
          { name: "Botswana", demandIndex: 72, supplyIndex: 44, adrIndex: 86, occupancyIndex: 68 },
          { name: "Namibia", demandIndex: 66, supplyIndex: 48, adrIndex: 74, occupancyIndex: 62 },
        ],
        narrative: {
          demand:
            "Demand clusters around safari circuits, iconic landmarks, and self-drive routes. Travelers respond strongly to clear routing, reliable suppliers, and seasonal guidance.",
          supply:
            "Supply is deep in major hubs and established routes, but premium safari inventory is limited and sells out early in peak months.",
          pricing:
            "Premium safari inventory supports high ADR during peak windows; value improves in shoulder periods and in less saturated corridors.",
        },
      },
    },
  };

  const norm = (s) => (s || "").toString().trim();
  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function pctBar(label, value) {
    const v = clamp(Number(value) || 0, 0, 100);
    return `
      <div class="sd-barRow">
        <div class="sd-barLabel">${esc(label)}</div>
        <div class="sd-barTrack"><div class="sd-barFill" style="width:${v}%"></div></div>
        <div class="sd-barVal">${v}</div>
      </div>
    `;
  }

  function kpiCard(title, value, sub) {
    return `
      <div class="sd-kpi card glass">
        <div class="sd-kpiTitle">${esc(title)}</div>
        <div class="sd-kpiValue">${esc(value)}</div>
        <div class="sd-kpiSub muted">${esc(sub || "")}</div>
      </div>
    `;
  }

  function sparkline(values) {
    const w = 220,
      h = 70,
      pad = 6;
    const arr = (values || []).map(Number).filter(Number.isFinite);
    if (!arr.length) return "";
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const scaleX = (i) => pad + (i * (w - pad * 2)) / (arr.length - 1 || 1);
    const scaleY = (v) => {
      if (max === min) return h / 2;
      const t = (v - min) / (max - min);
      return pad + (1 - t) * (h - pad * 2);
    };
    const d = arr
      .map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(2)} ${scaleY(v).toFixed(2)}`)
      .join(" ");
    return `
      <svg class="sd-spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Trend line">
        <path d="${d}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"></path>
      </svg>
    `;
  }

 
  function hotspotScoreFromDestination(d) {
    const tags = (d.tags || []).map((x) => String(x).toLowerCase());
    const type = String(d.type || "").toLowerCase();
    const name = String(d.name || "").toLowerCase();

    let s = 45; 

    if (tags.includes("iconic")) s += 18;
    if (tags.includes("unesco")) s += 14;
    if (tags.includes("safari")) s += 12;
    if (tags.includes("beach")) s += 10;
    if (tags.includes("city")) s += 8;
    if (tags.includes("adventure")) s += 8;
    if (tags.includes("remote")) s += 5;

    if (type.includes("safari")) s += 10;
    if (type.includes("heritage")) s += 8;
    if (type.includes("nature")) s += 6;
    if (type.includes("island")) s += 8;

    if (name.includes("falls")) s += 6;
    if (name.includes("national park")) s += 6;
    if (name.includes("pyramids")) s += 8;
    if (name.includes("mount")) s += 5;

    const b = String(d.estimatedBudget || "");
    if (b.includes("$$")) s += 4;
    if (b.includes("$$$")) s += 2;

    return clamp(Math.round(s), 20, 98);
  }

  function buildHotspotsFromDestinations(destinations, region) {
    const dests = (destinations || []).filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));
    const scoped =
      region && region !== "All" ? dests.filter((d) => String(d.africaRegion || "") === region) : dests;

    const ranked = scoped
      .map((d) => ({
        label: d.name, 
        region: d.africaRegion || "—",
        score: hotspotScoreFromDestination(d),
        lat: d.lat,
        lng: d.lng,
        country: d.country || "",
        type: d.type || "",
      }))
      .sort((a, b) => b.score - a.score);

    return ranked.slice(0, 18);
  }

  function renderHeatMap(hotspots) {
    const withCoords = (hotspots || []).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));

    if (!withCoords.length) {
      return `
        <div class="card glass sd-heatCard">
          <div class="sd-cardTitle">Demand heat map (hotspots)</div>
          <div class="muted sd-cardSub">No coordinates available for the current filter.</div>
        </div>
      `;
    }

    const lats = withCoords.map((x) => x.lat);
    const lngs = withCoords.map((x) => x.lng);
    const minLat = Math.min(...lats),
      maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs),
      maxLng = Math.max(...lngs);

    const isSmall = window.matchMedia("(max-width: 820px)").matches;
    const labelLimit = isSmall ? 8 : 14;

    const byScore = withCoords.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    const labelSet = new Set(byScore.slice(0, labelLimit).map((x) => x.label));

    const points = withCoords.map((x) => {
      const px = (x.lng - minLng) / (maxLng - minLng || 1);
      const py = 1 - (x.lat - minLat) / (maxLat - minLat || 1);

      const score = clamp(x.score || 0, 0, 100);
      const size = 10 + (score / 100) * 18;
      const alpha = 0.28 + (score / 100) * 0.45;

      return { ...x, px, py, size, alpha, score };
    });

    const dots = points
      .map((p) => {
        const showLabel = labelSet.has(p.label);
        return `
          <div class="sd-dot"
            style="
              left:${(p.px * 100).toFixed(3)}%;
              top:${(p.py * 100).toFixed(3)}%;
              width:${p.size}px;
              height:${p.size}px;
              opacity:${p.alpha};
            "
            data-tip="${esc(p.label)}|${esc(p.region)}|${esc(p.country || "")}|${esc(p.type || "")}|${esc(
          p.score
        )}"
          ></div>

          ${
            showLabel
              ? `
            <div class="sd-dotLabel"
              style="
                left:${(p.px * 100).toFixed(3)}%;
                top:${(p.py * 100).toFixed(3)}%;
              "
            >${esc(p.label)}</div>
          `
              : ""
          }
        `;
      })
      .join("");

    return `
      <div class="card glass sd-heatCard">
        <div class="sd-heatHead">
          <div>
            <div class="sd-cardTitle">Demand heat map (hotspots)</div>
            <div class="muted sd-cardSub">
              Hotspots are derived from your <code>data.js</code> destination names (exact match) — 2025 snapshot scoring.
            </div>
          </div>
          <div class="sd-legend">
            <span class="sd-legendDot"></span>
            <span class="muted">Higher score = larger hotspot</span>
          </div>
        </div>

        <div class="sd-heatWrap" id="sdHeatWrap">
          <div class="sd-heatBg"></div>
          ${dots}
          <div class="sd-tooltip" id="sdHeatTip" aria-hidden="true"></div>
        </div>

        <div class="sd-heatFoot muted">
          Labels show the top hotspots for readability. Hover any dot to see full details.
        </div>
      </div>
    `;
  }

  function injectStylesOnce() {
    if (document.getElementById("sd-2025-styles")) return;

    const style = document.createElement("style");
    style.id = "sd-2025-styles";
    style.textContent = `
      .sd-wrap { padding: 16px; }
      .sd-hero { display:flex; gap:14px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
      .sd-title { margin:0; font-size: 28px; letter-spacing:-0.02em; }
      .sd-sub { margin-top:8px; color: rgba(255,255,255,0.76); max-width: 820px; }
      .sd-badge { display:inline-flex; align-items:center; gap:10px; padding: 8px 12px; border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(8, 13, 25, 0.35);
        color: rgba(255,255,255,0.92);
        font-weight: 700;
        backdrop-filter: blur(10px);
      }

      .sd-tabsRow { margin-top: 14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .sd-pill {
        border-radius: 999px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,0.20);
        background: rgba(0,0,0,0.22);
        color: rgba(255,255,255,0.92);
        cursor: pointer;
        font-weight: 800;
      }
      .sd-pill:hover { background: rgba(255,255,255,0.12); }
      .sd-pill.is-on {
        background: rgba(59,130,246,0.35);
        border-color: rgba(59,130,246,0.65);
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      }

      .sd-grid { margin-top: 14px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
      .sd-grid2 { margin-top: 14px; display:grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px; }
      @media (max-width: 980px) { .sd-grid2 { grid-template-columns: 1fr; } }

      .sd-cardTitle { font-weight: 900; font-size: 16px; color: rgba(255,255,255,0.95); }
      .sd-cardSub { margin-top:6px; }

      .sd-kpiTitle { font-size: 12px; color: rgba(255,255,255,0.72); font-weight: 800; }
      .sd-kpiValue { font-size: 26px; font-weight: 900; color: rgba(255,255,255,0.96); margin-top: 4px; }
      .sd-kpiSub { margin-top: 6px; }

      .sd-barRow { display:grid; grid-template-columns: 110px 1fr 42px; gap: 10px; align-items:center; margin-top: 10px; }
      .sd-barLabel { color: rgba(255,255,255,0.80); font-weight: 800; font-size: 12px; }
      .sd-barTrack { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.12); overflow:hidden; }
      .sd-barFill { height: 100%; background: rgba(59,130,246,0.75); border-radius: 999px; }
      .sd-barVal { text-align:right; color: rgba(255,255,255,0.78); font-weight: 900; }

      .sd-spark { margin-top: 10px; width: 100%; color: rgba(96,165,250,0.92); }

      .sd-heatCard { position: relative; overflow: hidden; }
      .sd-heatHead { display:flex; justify-content:space-between; gap: 12px; align-items:flex-start; }
      .sd-legend { display:flex; align-items:center; gap: 10px; }
      .sd-legendDot { width: 10px; height: 10px; border-radius: 999px; background: rgba(59,130,246,0.85); box-shadow: 0 0 0 6px rgba(59,130,246,0.18); }

      .sd-heatWrap {
        position: relative;
        height: 320px;
        margin-top: 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(0,0,0,0.26);
        overflow: hidden;
      }
      .sd-heatBg {
        position:absolute; inset:0;
        background:
          radial-gradient(circle at 40% 40%, rgba(59,130,246,0.14), transparent 55%),
          radial-gradient(circle at 70% 60%, rgba(245,158,11,0.12), transparent 60%),
          linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      }
      .sd-dot {
        position:absolute;
        transform: translate(-50%, -50%);
        border-radius: 999px;
        background: rgba(59,130,246,0.85);
        box-shadow: 0 0 0 10px rgba(59,130,246,0.14);
        cursor: pointer;
      }
      .sd-dotLabel{
        position:absolute;
        transform: translate(10px, -50%);
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(8, 13, 25, 0.60);
        color: rgba(255,255,255,0.92);
        font-weight: 900;
        font-size: 12px;
        letter-spacing: -0.01em;
        backdrop-filter: blur(10px);
        pointer-events: none;
        white-space: nowrap;
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sd-tooltip {
        position:absolute;
        pointer-events:none;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(8, 13, 25, 0.75);
        color: rgba(255,255,255,0.92);
        font-weight: 900;
        font-size: 12px;
        backdrop-filter: blur(10px);
        display:none;
        min-width: 190px;
      }
      .sd-heatFoot { margin-top: 10px; }

      .sd-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .sd-table th, .sd-table td { border-top: 1px solid rgba(255,255,255,0.10); padding: 10px 8px; vertical-align: top; }
      .sd-table th { text-align:left; color: rgba(255,255,255,0.82); font-size: 12px; letter-spacing: .02em; text-transform: uppercase; }
      .sd-table td { color: rgba(255,255,255,0.84); font-weight: 700; }

      .sd-scroll { max-height: 420px; overflow: auto; padding-right: 6px; }
      .sd-scroll::-webkit-scrollbar { width: 10px; }
      .sd-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 999px; }
      .sd-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 999px; }
    `;
    document.head.appendChild(style);
  }

  function render(root, destinations) {
    injectStylesOnce();

    const regionKeys = ["All", "North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa"];
    const viewKeys = ["Overview", "Demand", "Supply", "Pricing", "Visuals"];

    const state = {
      region: "All",
      view: "Overview",
    };

    root.innerHTML = `
      <section class="sd-wrap">
        <div class="sd-hero">
          <div>
            <h1 class="sd-title">${esc(SD2025.meta.title)}</h1>
            <div class="sd-sub">${esc(SD2025.meta.subtitle)}</div>
            <div class="muted" style="margin-top:8px;">${esc(SD2025.meta.note)}</div>
          </div>
          <div class="sd-badge">${esc(SD2025.meta.badge)} • Updated ${esc(SD2025.meta.updated)}</div>
        </div>

        <div class="sd-tabsRow" id="sdRegionTabs">
          ${regionKeys
            .map(
              (r, idx) =>
                `<button class="sd-pill ${idx === 0 ? "is-on" : ""}" data-region="${esc(r)}" type="button">${esc(
                  r
                )}</button>`
            )
            .join("")}
        </div>

        <div class="sd-tabsRow" id="sdViewTabs" style="margin-top:10px;">
          ${viewKeys
            .map(
              (v, idx) =>
                `<button class="sd-pill ${idx === 0 ? "is-on" : ""}" data-view="${esc(v)}" type="button">${esc(
                  v
                )}</button>`
            )
            .join("")}
        </div>

        <div id="sdBody" style="margin-top:14px;"></div>
      </section>
    `;

    const body = root.querySelector("#sdBody");
    const regionTabs = root.querySelector("#sdRegionTabs");
    const viewTabs = root.querySelector("#sdViewTabs");

    function regionData() {
      return SD2025.regions[state.region] || SD2025.regions.All;
    }

    function renderOverview() {
      const r = regionData();
      const k = r.kpis || SD2025.regions.All.kpis;

      return `
        <div class="sd-grid">
          ${kpiCard("Demand index", k.demandIndex, "Interest/intent (index 0–100)")}
          ${kpiCard("Supply index", k.supplyIndex, "Inventory depth & availability (index 0–100)")}
          ${kpiCard("ADR index", k.avgDailyRateIndex, "Price level proxy (index 0–100)")}
          ${kpiCard("Occupancy index", k.occupancyIndex, "Utilization proxy (index 0–100)")}
        </div>

        <div class="sd-grid2">
          <div class="card glass">
            <div class="sd-cardTitle">Market summary — ${esc(state.region)}</div>
            <div class="muted sd-cardSub">Planning signal, not a booking guarantee.</div>

            <div style="margin-top:12px;">
              ${pctBar("Demand", k.demandIndex)}
              ${pctBar("Supply", k.supplyIndex)}
              ${pctBar("ADR", k.avgDailyRateIndex)}
              ${pctBar("Occupancy", k.occupancyIndex)}
            </div>

            <div class="muted" style="margin-top:12px;">
              <div><strong>Peak window:</strong> ${esc(k.seasonalityPeak || "—")}</div>
              <div style="margin-top:6px;"><strong>Top demand drivers:</strong> ${esc(
                (k.topDrivers || []).join(", ") || "—"
              )}</div>
            </div>

            ${sparkline([48, 52, 58, 61, 66, 70, 74, 72, 69, 71, 73, 74])}
            <div class="muted" style="margin-top:8px;">Illustrative trend line (index) for on-site charting consistency.</div>
          </div>

          <div class="card glass">
            <div class="sd-cardTitle">What this page is for</div>
            <div class="muted sd-cardSub">Use it to decide what to build, promote, and price.</div>

            <ul class="bullets" style="margin-top:10px;">
              <li>Identify high-demand regions and peak windows.</li>
              <li>Detect inventory constraints (low supply index).</li>
              <li>Prioritize content (hotels, tours, guides) by region.</li>
              <li>Align pricing to seasonality and capacity.</li>
            </ul>

            <div class="disclosure" style="margin-top:12px;">
              <strong>Data label:</strong>
              <span class="muted">“2025 snapshot” means values are compiled for 2025 .</span>
            </div>
          </div>
        </div>
      `;
    }

    function renderDemand() {
      const r = regionData();
      const n = r.narrative || {};
      const k = r.kpis || {};

      const demo = [
        { label: "Leisure", v: 66 },
        { label: "Business", v: 18 },
        { label: "Visiting friends/family", v: 10 },
        { label: "Other", v: 6 },
      ];

      const amenities = [
        { label: "Wi-Fi", v: 92 },
        { label: "Breakfast included", v: 74 },
        { label: "Airport transfer", v: 51 },
        { label: "Pool", v: 46 },
        { label: "All-inclusive", v: 28 },
      ];

      return `
        <div class="sd-grid">
          <div class="card glass">
            <div class="sd-cardTitle">Demand narrative — ${esc(state.region)}</div>
            <div class="muted" style="margin-top:10px;">${esc(n.demand || SD2025.regions.All.narrative.demand)}</div>

            <div class="card" style="margin-top:12px; box-shadow:none; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.12);">
              <div class="sd-cardTitle" style="font-size:14px;">Seasonality notes</div>
              <div class="muted" style="margin-top:8px;">
                Expect peaks around <strong>${esc(k.seasonalityPeak || "regional holidays + dry season")}</strong>. Shoulder periods can offer better value with workable conditions.
              </div>
            </div>
          </div>

          <div class="card glass">
            <div class="sd-cardTitle">Traveler purpose (index split)</div>
            <div class="muted sd-cardSub">Adjust with your analytics when available.</div>

            <div style="margin-top:12px;">
              ${demo.map((x) => pctBar(x.label, x.v)).join("")}
            </div>
          </div>

          <div class="card glass">
            <div class="sd-cardTitle">Preferred amenities (index)</div>
            <div class="muted sd-cardSub">Represents common filter preferences in 2025 snapshot.</div>
            <div style="margin-top:12px;">
              ${amenities.map((x) => pctBar(x.label, x.v)).join("")}
            </div>
          </div>
        </div>
      `;
    }

    function renderSupply() {
      const r = regionData();
      const n = r.narrative || {};

      const dests = (destinations || []).filter((d) => {
        if (state.region === "All") return true;
        return norm(d.africaRegion) === state.region;
      });
      const withCoords = dests.filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));

      return `
        <div class="sd-grid">
          <div class="card glass">
            <div class="sd-cardTitle">Supply narrative — ${esc(state.region)}</div>
            <div class="muted" style="margin-top:10px;">${esc(n.supply || SD2025.regions.All.narrative.supply)}</div>

            <div class="sd-grid" style="margin-top:12px;">
              ${kpiCard("Destinations in dataset", dests.length, "Based on your data.js")}
              ${kpiCard("Map-ready points", withCoords.length, "Has valid lat/lng")}
              ${kpiCard(
                "Coverage ratio",
                `${dests.length ? Math.round((withCoords.length / dests.length) * 100) : 0}%`,
                "Map-ready / total"
              )}
            </div>
          </div>

          <div class="card glass">
            <div class="sd-cardTitle">Infrastructure & integration checklist</div>
            <div class="muted sd-cardSub">Use this to operationalize supply.</div>
            <ul class="bullets" style="margin-top:10px;">
              <li>Inventory: confirm room types, cancellation policies, and seasonal closures.</li>
              <li>Quality: define minimum standards (photos, amenities, contactability).</li>
              <li>Operations: confirm transfer reliability and check-in constraints.</li>
              <li>Distribution: ensure affiliate links are consistent and trackable (UTMs).</li>
            </ul>
          </div>
        </div>
      `;
    }

    function renderPricing() {
      const r = regionData();
      const n = r.narrative || {};
      const k = r.kpis || {};

      return `
        <div class="sd-grid">
          <div class="card glass">
            <div class="sd-cardTitle">Pricing strategy — ${esc(state.region)}</div>
            <div class="muted" style="margin-top:10px;">${esc(n.pricing || SD2025.regions.All.narrative.pricing)}</div>

            <div class="card" style="margin-top:12px; box-shadow:none; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.12);">
              <div class="sd-cardTitle" style="font-size:14px;">Dynamic pricing guidance</div>
              <ul class="bullets" style="margin-top:10px;">
                <li><strong>Peak (${esc(k.seasonalityPeak || "varies")}):</strong> emphasize premium inventory and urgency (“limited camps”, “sell-out months”).</li>
                <li><strong>Shoulder:</strong> push value bundles (hotel + tour) and flexible itineraries.</li>
                <li><strong>Low:</strong> focus on experience-led messaging and safety/logistics clarity.</li>
              </ul>
            </div>
          </div>

          <div class="card glass">
            <div class="sd-cardTitle">Elasticity assumptions (editable)</div>
            <div class="muted sd-cardSub">Replace with your observed conversion curves.</div>
            <div style="margin-top:12px;">
              ${pctBar("High price sensitivity", 55)}
              ${pctBar("Medium sensitivity", 30)}
              ${pctBar("Low sensitivity (premium)", 15)}
            </div>
            <div class="muted" style="margin-top:10px;">
              Practical heuristic: premium safari buyers tolerate higher ADR changes; city breaks respond more strongly to price shifts.
            </div>
          </div>
        </div>
      `;
    }

    function renderVisuals() {
      const region = state.region;
      const r = regionData();

      const hotspots = buildHotspotsFromDestinations(destinations, region);

      const countries = (r.countries || []).slice().sort((a, b) => (b.demandIndex || 0) - (a.demandIndex || 0));

      const table = countries.length
        ? `
          <div class="card glass">
            <div class="sd-cardTitle">Country snapshot — ${esc(region)}</div>
            <div class="muted sd-cardSub">Indices are 0–100 (2025 snapshot). Replace with your exact metrics as available.</div>
            <div class="sd-scroll">
              <table class="sd-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Demand</th>
                    <th>Supply</th>
                    <th>ADR</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  ${countries
                    .map(
                      (c) => `
                    <tr>
                      <td>${esc(c.name)}</td>
                      <td>${esc(c.demandIndex)}</td>
                      <td>${esc(c.supplyIndex)}</td>
                      <td>${esc(c.adrIndex)}</td>
                      <td>${esc(c.occupancyIndex)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
        `
        : `
          <div class="card glass">
            <div class="sd-cardTitle">Country snapshot — ${esc(region)}</div>
            <div class="muted sd-cardSub">No country breakdown for this region in the 2025 snapshot yet.</div>
          </div>
        `;

      return `
        <div class="sd-grid2">
          ${renderHeatMap(hotspots)}
          ${table}
        </div>
      `;
    }

    function renderBody() {
      if (state.view === "Overview") body.innerHTML = renderOverview();
      else if (state.view === "Demand") body.innerHTML = renderDemand();
      else if (state.view === "Supply") body.innerHTML = renderSupply();
      else if (state.view === "Pricing") body.innerHTML = renderPricing();
      else body.innerHTML = renderVisuals();

      const wrap = root.querySelector("#sdHeatWrap");
      const tip = root.querySelector("#sdHeatTip");
      if (wrap && tip) {
        wrap.addEventListener("mousemove", (e) => {
          const dot = e.target.closest(".sd-dot");
          if (!dot) {
            tip.style.display = "none";
            tip.setAttribute("aria-hidden", "true");
            return;
          }
          const parts = (dot.getAttribute("data-tip") || "").split("|");
          const [name, reg, country, type, score] = parts;

          tip.innerHTML = `
            <div style="font-weight:900; font-size:13px;">${esc(name || "")}</div>
            <div class="muted" style="margin-top:2px;">${esc(reg || "")}${country ? " • " + esc(country) : ""}${
            type ? " • " + esc(type) : ""
          }</div>
            <div class="muted" style="margin-top:2px;">Score ${esc(score || "")}</div>
          `;

          const rect = wrap.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          tip.style.left = `${clamp(x + 14, 10, rect.width - 210)}px`;
          tip.style.top = `${clamp(y + 14, 10, rect.height - 90)}px`;
          tip.style.display = "block";
          tip.setAttribute("aria-hidden", "false");
        });

        wrap.addEventListener("mouseleave", () => {
          tip.style.display = "none";
          tip.setAttribute("aria-hidden", "true");
        });
      }
    }

    function setActive(groupEl, attr, value) {
      groupEl.querySelectorAll(".sd-pill").forEach((b) => {
        const v = b.getAttribute(attr);
        b.classList.toggle("is-on", v === value);
      });
    }

    regionTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-region]");
      if (!btn) return;
      state.region = btn.getAttribute("data-region") || "All";
      setActive(regionTabs, "data-region", state.region);
      renderBody();
    });

    viewTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-view]");
      if (!btn) return;
      state.view = btn.getAttribute("data-view") || "Overview";
      setActive(viewTabs, "data-view", state.view);
      renderBody();
    });

    renderBody();
  }

 
  function mountSupplyDemand(rootSelector = "#view") {
    const root = document.querySelector(rootSelector);
    if (!root) {
      console.warn("[SupplyDemand2025] Root container not found:", rootSelector);
      return;
    }
    const destinations = window.DESTINATIONS || [];
    render(root, destinations);
  }

  window.GeoTourism = window.GeoTourism || {};
  window.GeoTourism.mountSupplyDemand = mountSupplyDemand;
})();
