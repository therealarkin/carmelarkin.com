// =============================================================
// CARMEL ARKIN — Site Scripts
// =============================================================

// ---- Rotating Tagline ----
const taglines = [
  "Chess player.",
  "Filmmaker at GMSTV.",
  "Geography nerd.",
  "Runner in training.",
  "Dog sitter.",
  "Hiker.",
  "Future bar mitzvah.",
  "Speaks English and Hebrew.",
];

function initTagline() {
  const container = document.getElementById("tagline");
  if (!container) return;

  taglines.forEach((text, i) => {
    const span = document.createElement("span");
    span.textContent = text;
    if (i === 0) span.classList.add("active");
    container.appendChild(span);
  });

  let current = 0;
  setInterval(() => {
    const spans = container.querySelectorAll("span");
    spans[current].classList.remove("active");
    current = (current + 1) % taglines.length;
    spans[current].classList.add("active");
  }, 2500);
}

// ---- Countdown Timer ----
function initCountdowns() {
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const target = new Date(el.dataset.countdown).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        el.textContent = "Today!";
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);

      if (days > 0) {
        el.textContent = `${days}d ${hours}h`;
      } else {
        const mins = Math.floor((diff % 3600000) / 60000);
        el.textContent = `${hours}h ${mins}m`;
      }
    }

    update();
    setInterval(update, 60000);
  });
}

// ---- Bar Mitzvah Countdown ----
function initBMCountdown() {
  const el = document.getElementById("bm-countdown");
  if (!el) return;

  const bmDate = new Date("2026-06-20T10:00:00").getTime();

  function update() {
    const diff = bmDate - Date.now();
    if (diff <= 0) {
      el.innerHTML = "Mazel Tov!";
      return;
    }
    const days = Math.floor(diff / 86400000);
    el.innerHTML = `${days}<span class="unit"> days</span>`;
  }

  update();
  setInterval(update, 60000);
}

// ---- Interactive Map ----
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map("map", {
    center: [30, 10],
    zoom: 2,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  // Dark tile layer
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }
  ).addTo(map);

  // Green pins — visited
  const greenIcon = L.divIcon({
    className: "",
    html: '<div style="width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid #0f0f0f;"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  if (typeof visitedPins !== "undefined") {
    visitedPins.forEach((pin) => {
      L.marker([pin.lat, pin.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`<strong>${pin.name}</strong>`);
    });
  }

  // Gold pins — favorites with photo cards
  const goldIcon = L.divIcon({
    className: "",
    html: '<div style="width:14px;height:14px;background:#fbbf24;border-radius:50%;border:2px solid #0f0f0f;box-shadow:0 0 8px rgba(251,191,36,0.4);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  if (typeof favoritePins !== "undefined") {
    favoritePins.forEach((pin) => {
      const popup = `
        <div class="popup-card" style="width:200px;">
          <img src="${pin.photo}" alt="${pin.name}" onerror="this.style.display='none'">
          <h3>${pin.name}</h3>
          <p>${pin.memory.replace(/<!--.*?-->/g, "")}</p>
        </div>
      `;
      L.marker([pin.lat, pin.lng], { icon: goldIcon })
        .addTo(map)
        .bindPopup(popup);
    });
  }

  // Red pins — want to visit
  const redIcon = L.divIcon({
    className: "",
    html: '<div style="width:12px;height:12px;background:#f87171;border-radius:50%;border:2px solid #0f0f0f;"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  if (typeof wantToVisitPins !== "undefined") {
    wantToVisitPins.forEach((pin) => {
      L.marker([pin.lat, pin.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<strong>${pin.name}</strong><br><em>Want to visit!</em>`);
    });
  }
}

// ---- Active Nav Highlighting ----
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".side-nav a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.remove("active"));
          const active = document.querySelector(
            `.side-nav a[href="#${entry.target.id}"]`
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
}

// ---- Init All ----
document.addEventListener("DOMContentLoaded", () => {
  initTagline();
  initCountdowns();
  initBMCountdown();
  initMap();
  initNavHighlight();
});
