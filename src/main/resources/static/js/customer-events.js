"use strict";

const PUBLIC_EVENTS_URL = '/api/public/events';
const PUBLIC_VENUES_URL = '/api/public/venues';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop';

const categoryFilters = document.querySelector('#categoryFilters');
const eventsGrid = document.querySelector('#eventsGrid');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const dateFilter = document.querySelector('#dateFilter');
const venueFilter = document.querySelector('#venueFilter');
const clearBtn = document.querySelector('#clearFilters');

let activeCategory = "all";
let debounceTimer = null;

function formatPrice(price) {
    return `${Number(price).toLocaleString('mn-MN')} ₮`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function ticketPercent(event) {
    return Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
}

function statusBadgeClass(event) {
    const percent = ticketPercent(event);
    if (percent >= 90) {
        return 'badge badge-red';
    }
    if (percent >= 70) {
        return 'badge badge-orange';
    }
    return 'badge badge-green';
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${url}`);
    }
    return response.json();
}

function debounce(fn, delay = 300) {
    return function (...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => fn.apply(this, args), delay);
    };
}

async function loadVenues() {
    try {
        const venues = await fetchJson(PUBLIC_VENUES_URL);
        for (let venue of venues) {
            const option = document.createElement('option');
            option.value = venue.id;
            option.textContent = venue.name;
            venueFilter.appendChild(option);
        }
    } catch (error) {
        console.error("Failed to load venues:", error);
    }
}

async function loadCategories() {
    categoryFilters.innerHTML = "";

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.dataset.category = "all";
    allChip.className = 'chip active';
    allChip.textContent = "All";
    categoryFilters.appendChild(allChip);

    try {
        const events = await fetchJson(PUBLIC_EVENTS_URL);
        const seen = new Set();
        for (let event of events) {
            if (!event.categoryId || seen.has(event.categoryId)) {
                continue;
            }
            seen.add(event.categoryId);

            const chip = document.createElement('button');
            chip.type = 'button';
            chip.dataset.category = event.categoryId;
            chip.className = 'chip';
            chip.textContent = event.categoryName;
            categoryFilters.appendChild(chip);
        }
    } catch (error) {
        console.error("Failed to load categories:", error);
    }
}

function buildQuery() {
    const params = new URLSearchParams();

    const title = searchInput.value.trim();
    if (title) {
        params.set('title', title);
    }
    if (dateFilter.value) {
        params.set('date', dateFilter.value);
    }
    if (venueFilter.value) {
        params.set('venue', venueFilter.value);
    }
    if (activeCategory !== "all") {
        params.set('category', activeCategory);
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

async function loadFilteredEvents() {
    let events;
    try {
        events = await fetchJson(PUBLIC_EVENTS_URL + buildQuery());
    } catch (error) {
        console.error("Failed to load events:", error);
        events = [];
    }
    renderEvents(events);
}

function buildEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <div class="event-card-image">
            <img src="${event.imageUrl || FALLBACK_IMAGE}" alt="${event.title}"
                 onerror="this.src='${FALLBACK_IMAGE}'">
            <div class="image-badge-top"><span class="badge badge-white">${event.categoryName || ""}</span></div>
            <div class="image-badge-bottom"><span class="${statusBadgeClass(event)}">${event.availableTickets} tickets</span></div>
        </div>
        <div class="event-card-body">
            <h3 class="event-card-title">${event.title}</h3>
            <div class="event-meta">
                <div class="event-meta-row">
                    <i class="svg-icon fa-solid fa-calendar-days"></i>
                    <span>${formatDate(event.eventDate)} · ${event.startTime}</span>
                </div>
                <div class="event-meta-row">
                    <i class="svg-icon fa-solid fa-location-dot"></i>
                    <span>${event.venueName || ""}</span>
                </div>
            </div>
            <div class="event-card-footer">
                <div>
                    <p class="price">${formatPrice(event.ticketPrice)}</p>
                    <p class="price-note">per ticket</p>
                </div>
                <a href="/customer/events/${event.id}" class="btn btn-primary btn-sm" style="padding: 10px 20px;">Details</a>
            </div>
        </div>`;
    return card;
}

function renderEvents(events) {
    eventsGrid.innerHTML = "";

    if (events.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    for (let event of events) {
        eventsGrid.appendChild(buildEventCard(event));
    }
}

function handleCategoryClick(clickEvent) {
    const chip = clickEvent.target.closest('#categoryFilters .chip');
    if (!chip) {
        return;
    }

    const allChips = categoryFilters.querySelectorAll('.chip');
    for (let c of allChips) {
        c.classList.remove('active');
    }
    chip.classList.add('active');

    activeCategory = chip.dataset.category;
    loadFilteredEvents();
}

function resetFilters() {
    searchInput.value = "";
    dateFilter.value = "";
    venueFilter.value = "";
    activeCategory = "all";

    const allChips = categoryFilters.querySelectorAll('.chip');
    for (let c of allChips) {
        c.classList.toggle('active', c.dataset.category === "all");
    }

    loadFilteredEvents();
}

searchInput.addEventListener("input", debounce(loadFilteredEvents));
dateFilter.addEventListener("change", loadFilteredEvents);
venueFilter.addEventListener("change", loadFilteredEvents);
clearBtn.addEventListener("click", resetFilters);
document.addEventListener("click", handleCategoryClick);

async function init() {
    await loadVenues();
    await loadCategories();
    await loadFilteredEvents();
}

init();
