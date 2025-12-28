

(function () {
  "use strict";

  
  const SHOP = {
    meta: {
      title: "Shop",
      subtitle:
        "Affiliate booking hub: hotels, tours, flights, rentals, insurance, and essential gear. Replace placeholder links with your affiliate URLs.",
      disclosure:
        "Affiliate links may earn us a commission at no extra cost to you",
    },

    
    categories: [
      {
        id: "hotels",
        title: "Book Hotels",
        icon: "assets/icons/shop/hotel.png",
        heroImage: "assets/images/shop/hotels.jpg",
        description:
          "Compare properties, prices, and cancellation policies across major hotel marketplaces.",
        pros: [
          "Massive inventory and frequent deals",
          "Strong mobile booking UX",
          "Good cancellation filters",
        ],
        cons: [
          "Rates can vary by device/region",
        ],
        partners: [
          { name: "Booking.com", url: "https://example.com/booking-affiliate" },
          { name: "Expedia", url: "https://expedia.com/affiliate/xwVbGNg" },
          { name: "Agoda", url: "https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=-1&hl=en-us" },
          { name: "Klook", url: "https://affiliate.klook.com/redirect?aid=107155&aff_adid=1185013&k_site=https%3A%2F%2Fwww.klook.com%2F" },
        ],
      },

      {
        id: "tours",
        title: "Book Tours",
        icon: "assets/icons/shop/tour.png",
        heroImage: "assets/images/shop/tours.jpg",
        description:
          "Reserve experiences, attraction tickets, day tours, and multi-day activities from trusted platforms.",
        pros: [
          "High-intent buyers convert well",
          "Clear reviews and instant confirmation",
          "Easy upsells (transfers, add-ons)",
        ],
        cons: [
          "Availability changes quickly in peak season",
        ],
        partners: [
          { name: "GetYourGuide", url: "https://www.getyourguide.com?partner_id=NIJZYC8&cmp=share_to_earn" },
          { name: "Viator", url: "https://www.viator.com/?pid=P00282338&mcid=42383&medium=link" },
          { name: "Klook", url: "https://affiliate.klook.com/redirect?aid=107155&aff_adid=1185013&k_site=https%3A%2F%2Fwww.klook.com%2F" },
        ],
      },

      {
        id: "cars",
        title: "Car Rentals",
        icon: "assets/icons/shop/car.png",
        heroImage: "assets/images/shop/cars.jpg",
        description:
          "Find rental cars and compare insurance options, deposits, and policies across aggregators.",
        pros: [
          "Great for self-drive itineraries",
          "Easy comparison across suppliers",
          "Strong demand for airport pickups",
        ],
        cons: [
          "Deposits and insurance terms vary widely",
          "Availability can be limited in remote areas",
        ],
        partners: [
          {
            name: "Discover Cars",
            url: "https://example.com/discovercars-affiliate",
          },
          { name: "Rentalcars", url: "https://example.com/rentalcars-affiliate" },
        ],
      },

      {
        id: "flights",
        title: "Flights",
        icon: "assets/icons/shop/flight.png",
        heroImage: "assets/images/shop/flights.jpg",
        description:
          "Search and compare fares across airlines and OTAs; ideal for route planning and price monitoring.",
        pros: [
          "Fast comparison across many routes",
          "Good for research + intent capture",
          "Scales globally (many markets)",
        ],
        cons: [
          "price models vary by region",
        ],
        partners: [
          { name: "Skyscanner", url: "https://example.com/skyscanner-affiliate" },
          { name: "Kiwi", url: "https://example.com/kiwi-affiliate" },
        ],
      },

      {
        id: "insurance",
        title: "Travel Insurance",
        icon: "assets/icons/shop/insurance.png",
        heroImage: "assets/images/shop/insurance.jpg",
        description:
          "Insurance products for medical cover, cancellations, and higher-risk adventure activities.",
        pros: [
          "High trust-signal content improves conversion",
          "Useful for long trips and adventure travel",
          "Pairs well with logistics content",
        ],
        cons: [
          "Eligibility varies by citizenship/residency",
          "Coverage fine print differs by plan",
        ],
        partners: [
          { name: "Staysure", url: "https://example.com/safetywing-affiliate" },
          {
            name: "World Nomads",
            url: "https://example.com/worldnomads-affiliate",
          },
        ],
      },

      {
        id: "gear",
        title: "Gear & Essentials",
        icon: "assets/icons/shop/gear.png",
        heroImage: "assets/images/shop/gear.jpg",
        description:
          "Packing list essentials: adapters, power banks, daypacks, binoculars, meds kits, and more.",
        pros: [
          "Easy to bundle with itineraries and checklists",
          "Works well with packing-list content",
          "Huge product selection",
        ],
        cons: [
          "some products maybe different that how they look",
        ],
        partners: [
          {
            name: "Amazon ",
            url: "https://www.amazon.co.uk/b?node=59325597031&linkCode=ll2&tag=pxrishuh-21&linkId=da0fb9e8b88fd7a4485c3b7a1a0e9d60&language=en_GB&ref_=as_li_ss_tl",
          },
        ],
      },
    ],
  };

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function injectStylesOnce() {
    if (document.getElementById("shop-affiliates-styles")) return;
    const style = document.createElement("style");
    style.id = "shop-affiliates-styles";
    style.textContent = `
      .shop-wrap { padding: 16px; }
      .shop-hero { display:flex; justify-content:space-between; gap:14px; align-items:flex-start; flex-wrap:wrap; }
      .shop-title { margin:0; font-size: 28px; letter-spacing:-0.02em; }
      .shop-sub { margin-top:8px; color: rgba(255,255,255,0.76); max-width: 900px; }
      .shop-disclosure { margin-top:10px; padding: 10px 12px; border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.14); background: rgba(0,0,0,0.18); color: rgba(255,255,255,0.82);
      }

      .shop-toolbar { margin-top: 14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .shop-chip {
        border-radius: 999px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,0.20);
        background: rgba(0,0,0,0.22);
        color: rgba(255,255,255,0.92);
        cursor:pointer;
        font-weight: 800;
      }
      .shop-chip:hover { background: rgba(255,255,255,0.12); }
      .shop-chip.is-on {
        background: rgba(59,130,246,0.35);
        border-color: rgba(59,130,246,0.65);
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
      }

      .shop-grid { margin-top: 14px; display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; }
      .shop-card { overflow:hidden; position:relative; }
      .shop-cardTop { display:flex; gap:12px; align-items:center; justify-content:space-between; }
      .shop-cardTitle { font-weight: 900; font-size: 18px; color: rgba(255,255,255,0.96); }
      .shop-cardDesc { margin-top:8px; color: rgba(255,255,255,0.78); }

      .shop-heroImg {
        margin-top: 12px;
        height: 160px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.14);
        overflow:hidden;
        background: rgba(0,0,0,0.22);
      }
      .shop-heroImg img { width:100%; height:100%; object-fit:cover; display:block; opacity:0.92; }

      .shop-icon {
        width: 42px; height: 42px; border-radius: 12px;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.14);
        display:flex; align-items:center; justify-content:center;
        flex: 0 0 auto;
        overflow:hidden;
      }
      .shop-icon img { width: 26px; height: 26px; object-fit: contain; display:block; }

      .shop-cols { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
      @media (max-width: 900px) { .shop-cols { grid-template-columns: 1fr; } }

      .shop-list { margin: 0; padding-left: 18px; color: rgba(255,255,255,0.80); }
      .shop-list li { margin: 6px 0; }

      .shop-ctas { display:flex; gap:10px; flex-wrap:wrap; margin-top: 14px; }
      .shop-btn {
        display:inline-flex; align-items:center; gap:10px;
        padding: 10px 12px; border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(0,0,0,0.22);
        color: rgba(255,255,255,0.94);
        text-decoration:none;
        font-weight: 900;
      }
      .shop-btn:hover { background: rgba(255,255,255,0.14); }
      .shop-btnPrimary {
        background: rgba(59,130,246,0.35);
        border-color: rgba(59,130,246,0.65);
      }
      .shop-btnPrimary:hover { background: rgba(59,130,246,0.45); }
      .shop-btn small { opacity:0.8; font-weight:800; }

      .shop-note { margin-top: 12px; color: rgba(255,255,255,0.70); }
      .shop-empty { padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.14); background: rgba(0,0,0,0.18); }
    `;
    document.head.appendChild(style);
  }

  function cardTemplate(c) {
    const primary = c.partners?.[0];
    const otherPartners = (c.partners || []).slice(1);

    return `
      <article class="card glass shop-card" data-card="${esc(c.id)}">
        <div class="shop-cardTop">
          <div style="display:flex; gap:12px; align-items:center;">
            <div class="shop-icon" aria-hidden="true">
              <img src="${esc(c.icon)}" alt="" onerror="this.style.display='none';" />
            </div>
            <div>
              <div class="shop-cardTitle">${esc(c.title)}</div>
              <div class="muted">${esc(c.description)}</div>
            </div>
          </div>
        </div>

        <div class="shop-heroImg" aria-hidden="true">
          <img src="${esc(c.heroImage)}" alt="" onerror="this.style.display='none';" />
        </div>

        <div class="shop-cols">
          <div class="card" style="box-shadow:none; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.12);">
            <div class="muted" style="font-weight:900; margin-bottom:8px;">Pros</div>
            <ul class="shop-list">
              ${(c.pros || []).map((x) => `<li>${esc(x)}</li>`).join("")}
            </ul>
          </div>

          <div class="card" style="box-shadow:none; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.12);">
            <div class="muted" style="font-weight:900; margin-bottom:8px;">Cons</div>
            <ul class="shop-list">
              ${(c.cons || []).map((x) => `<li>${esc(x)}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="shop-ctas">
          ${
            primary
              ? `<a class="shop-btn shop-btnPrimary" href="${esc(primary.url)}" target="_blank" rel="noopener">
                  Open ${esc(primary.name)} <small>↗</small>
                </a>`
              : ""
          }

          ${otherPartners
            .map(
              (p) => `<a class="shop-btn" href="${esc(p.url)}" target="_blank" rel="noopener">
                  ${esc(p.name)} <small>↗</small>
                </a>`
            )
            .join("")}
        </div>

        <div class="shop-note muted">
          Tip: Use deep links per destination (e.g., “Cape Town hotels”) for higher conversion.
        </div>
      </article>
    `;
  }

  function render(root) {
    injectStylesOnce();

    const categories = SHOP.categories.slice();
    const localState = { filter: "all" };

    root.innerHTML = `
      <section class="shop-wrap">
        <div class="shop-hero">
          <div>
            <h1 class="shop-title">${esc(SHOP.meta.title)}</h1>
            <div class="shop-sub">${esc(SHOP.meta.subtitle)}</div>
            <div class="shop-disclosure">${esc(SHOP.meta.disclosure)}</div>
          </div>
        </div>

        <div class="shop-toolbar" id="shopFilters" aria-label="Shop categories">
          <button class="shop-chip is-on" type="button" data-filter="all">All</button>
          ${categories
            .map((c) => `<button class="shop-chip" type="button" data-filter="${esc(c.id)}">${esc(c.title)}</button>`)
            .join("")}
        </div>

        <div class="shop-grid" id="shopGrid"></div>
      </section>
    `;

    const grid = root.querySelector("#shopGrid");
    const filters = root.querySelector("#shopFilters");

    function renderGrid() {
      const list =
        localState.filter === "all"
          ? categories
          : categories.filter((c) => c.id === localState.filter);

      grid.innerHTML = list.length
        ? list.map(cardTemplate).join("")
        : `<div class="shop-empty muted">No items for this filter.</div>`;
    }

    function setActive(filterValue) {
      filters.querySelectorAll(".shop-chip").forEach((b) => {
        b.classList.toggle("is-on", b.getAttribute("data-filter") === filterValue);
      });
    }

    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      localState.filter = btn.getAttribute("data-filter") || "all";
      setActive(localState.filter);
      renderGrid();
    });

    renderGrid();
  }

  function mountShop(outletOrSelector = "#viewOutlet") {
    const root =
      typeof outletOrSelector === "string"
        ? document.querySelector(outletOrSelector)
        : outletOrSelector;

    const resolved = root || document.querySelector("#viewOutlet") || document.querySelector("#view");
    if (!resolved) {
      console.warn("[ShopAffiliates] Root container not found:", outletOrSelector);
      return;
    }
    render(resolved);
  }

  window.GeoTourism = window.GeoTourism || {};

  window.GeoTourism.mountShop = mountShop;

  window.GeoTourism.mountShopAffiliates = mountShop;
})();
