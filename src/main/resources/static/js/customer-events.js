/* Customer - Events Listing JS (REST API) */

let events = [];
let activeCategory = "all";
let searchQuery = "";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function formatPrice(p) { return Number(p).toLocaleString("mn-MN") + " ₮"; }
function formatDate(d) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
function ticketPct(e) { return Math.round(((e.totalTickets - e.availableTickets) / e.totalTickets) * 100); }
function statusCls(e) {
    const p = ticketPct(e);
    if (p >= 90) return "badge badge-red";
    if (p >= 70) return "badge badge-orange";
    return "badge badge-green";
}

function renderCategories() {
    const c = $("#categoryFilters");
    const seen = new Set();
    events.forEach(ev => {
        if (!ev.categoryId || seen.has(ev.categoryId)) return;
        seen.add(ev.categoryId);
        const b = document.createElement("button");
        b.dataset.category = ev.categoryId;
        b.className = "chip";
        b.textContent = ev.categoryName;
        c.appendChild(b);
    });
}

function renderEvents() {
    const grid = $("#eventsGrid");
    const empty = $("#emptyState");
    const filtered = events.filter(e => {
        const mc = activeCategory === "all" || String(e.categoryId) === String(activeCategory);
        const ms = !searchQuery || e.title.toLowerCase().includes(searchQuery) ||
                   (e.description || "").toLowerCase().includes(searchQuery);
        return mc && ms;
    });
    grid.innerHTML = "";
    if (!filtered.length) { empty.classList.remove("hidden"); return; }
    empty.classList.add("hidden");

    filtered.forEach(ev => {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
            <div class="event-card-image">
                <img src="${ev.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'}" alt="${ev.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop'">
                <div class="image-badge-top"><span class="badge badge-white">${ev.categoryName || ""}</span></div>
                <div class="image-badge-bottom"><span class="${statusCls(ev)}">${ev.availableTickets} tickets</span></div>
            </div>
            <div class="event-card-body">
                <h3 class="event-card-title">${ev.title}</h3>
                <div class="event-meta">
                    <div class="event-meta-row">
                        <i class="svg-icon fa-solid fa-calendar-days"></i>
                        <span>${formatDate(ev.eventDate)} · ${ev.startTime}</span>
                    </div>
                    <div class="event-meta-row">
                        <i class="svg-icon fa-solid fa-location-dot"></i>
                        <span>${ev.venueName || ""}</span>
                    </div>
                </div>
                <div class="event-card-footer">
                    <div>
                        <p class="price">${formatPrice(ev.ticketPrice)}</p>
                        <p class="price-note">per ticket</p>
                    </div>
                    <a href="/customer/events/${ev.id}" class="btn btn-primary btn-sm" style="padding: 10px 20px;">Details</a>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

document.addEventListener("click", e => {
    const b = e.target.closest("#categoryFilters .chip");
    if (b) {
        $$("#categoryFilters .chip").forEach(c => c.classList.remove("active"));
        b.classList.add("active");
        activeCategory = b.dataset.category;
        renderEvents();
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/public/events");
        events = await res.json();
    } catch (err) {
        console.error("Failed to load events:", err);
    }
    renderCategories();
    renderEvents();

    $("#searchInput").addEventListener("input", e => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderEvents();
    });
});