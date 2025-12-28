

(function () {
  "use strict";

  const CFG = window.GEOZIM_CONFIG || {};

  const REGIONS = [
    "North Africa",
    "West Africa",
    "East Africa",
    "Central Africa",
    "Southern Africa"
  ];

  const REGION_DATA = {
    "North Africa": {
      image: "assets/images/logistics/north-africa.jpg",
      currency: "Egyptian Pound (EGP), Moroccan Dirham (MAD), Tunisian Dinar (TND)",
      power: "Type C & F plugs • 220–240V",
      water: "Bottled water recommended outside major hotels",
      visas: "Many nationalities eligible for visa on arrival or e-visa",
      vaccines: "Routine vaccines; Yellow Fever if arriving from risk countries"
    },
    "West Africa": {
      image: "assets/images/logistics/west-africa.jpg",
      currency: "West African CFA Franc (XOF), Nigerian Naira (NGN)",
      power: "Type D & G plugs • 230V",
      water: "Bottled water strongly recommended",
      visas: "Visas required for most travelers; ECOWAS citizens exempt",
      vaccines: "Yellow Fever certificate often required"
    },
    "East Africa": {
      image: "assets/images/logistics/east-africa.jpg",
      currency: "Kenyan Shilling (KES), Tanzanian Shilling (TZS)",
      power: "Type G plugs • 240V",
      water: "Bottled or filtered water advised",
      visas: "E-visa common (Kenya, Tanzania, Rwanda)",
      vaccines: "Yellow Fever for some borders; malaria precautions"
    },
    "Central Africa": {
      image: "assets/images/logistics/central-africa.jpg",
      currency: "Central African CFA Franc (XAF)",
      power: "Type C & E plugs • 220V",
      water: "Bottled water essential",
      visas: "Visas required in advance for most travelers",
      vaccines: "Yellow Fever mandatory; medical insurance advised"
    },
    "Southern Africa": {
      image: "assets/images/logistics/southern-africa.jpg",
      currency: "South African Rand (ZAR), USD common in some countries",
      power: "Type D, M & G plugs • 230V",
      water: "Hotel water often safe; bottled elsewhere",
      visas: "Visa-free or VOA for many nationalities",
      vaccines: "Routine vaccines; malaria in some regions"
    }
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderRegion(region) {
    const r = REGION_DATA[region];

    return `
      <div class="card glass" style="margin-top:16px;">
        <div class="dest-img" style="min-height:220px;">
          <div class="dest-img__fill" style="background-image:url('${r.image}')"></div>
          <div class="dest-img__shade"></div>
          <div class="dest-img__label"><strong>${region}</strong></div>
        </div>

        <div class="grid grid--2" style="margin-top:14px;">
          <div class="card">
            <strong>Travel documents & entry</strong>
            <ul class="bullets">
              <li><strong>Passport:</strong> 6+ months validity recommended</li>
              <li><strong>Visas:</strong> ${r.visas}</li>
              <li><strong>Digital forms:</strong> Some countries require pre-arrival declarations</li>
              <li><strong>Customs:</strong> Plastic bag bans & import limits apply in some countries</li>
            </ul>
          </div>

          <div class="card">
            <strong>Health & safety</strong>
            <ul class="bullets">
              <li><strong>Vaccines:</strong> ${r.vaccines}</li>
              <li><strong>Insurance:</strong> Medical + evacuation recommended</li>
              <li><strong>Water:</strong> ${r.water}</li>
              <li><strong>Emergency:</strong> Use hotel or lodge for local numbers</li>
            </ul>
          </div>

          <div class="card">
            <strong>Transport & mobility</strong>
            <ul class="bullets">
              <li><strong>Airport transfers:</strong> Hotels or pre-booked taxis preferred</li>
              <li><strong>Public transport:</strong> Limited reliability outside cities</li>
              <li><strong>Driving:</strong> IDP often required for car rental</li>
            </ul>
          </div>

          <div class="card">
            <strong>Money & connectivity</strong>
            <ul class="bullets">
              <li><strong>Currency:</strong> ${r.currency}</li>
              <li><strong>Cards:</strong> Visa widely accepted in cities</li>
              <li><strong>SIM cards:</strong> Available at airports with passport</li>
              <li><strong>Power:</strong> ${r.power}</li>
            </ul>
          </div>
        </div>

        <div class="card" style="margin-top:14px;">
          <strong>Tools & checklists</strong>
          <ul class="bullets">
            <li>Printable packing checklist by climate</li>
            <li>Trip cost estimation worksheet</li>
            <li>Offline maps + emergency locations</li>
          </ul>

          <div class="ctaRow" style="margin-top:12px;">
            <button class="btn btn--primary" data-goto="shop">Get travel guides</button>
            <button class="btn" data-goto="consult">Request trip review</button>
          </div>
        </div>
      </div>
    `;
  }

  function render(container) {
    container.innerHTML = `
      <div class="section-title">
        <h2>Know Before You Go</h2>
        <div class="muted">
          Practical logistics for safe, smooth travel across Africa.
        </div>
      </div>

      <div class="disclosure">
        <strong>Accuracy note:</strong>
        <span class="muted">
          Entry, health, and currency rules change. Always confirm with official sources.
        </span>
      </div>

      ${REGIONS.map(renderRegion).join("")}
    `;
  }

  function mount(selector = "#view") {
    const root = document.querySelector(selector);
    if (!root) return;
    render(root);
  }

  window.GeoTourism = window.GeoTourism || {};
  window.GeoTourism.mountLogistics = mount;
})();
