"use strict";

const PUBLIC_EVENTS_URL = '/api/public/events';
const PUBLIC_SEARCH_URL = '/api/public/events/search';
const PUBLIC_VENUES_URL = '/api/public/venues';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop';
const PAGE_SIZE = 9;

const categoryFilters = document.querySelector('#categoryFilters');
const eventsGrid = document.querySelector('#eventsGrid');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const dateFilter = document.querySelector('#dateFilter');
const venueFilter = document.querySelector('#venueFilter');
const clearBtn = document.querySelector('#clearFilters');
const pagination = document.querySelector('#pagination');
const pageInfo = document.querySelector('#pageInfo');
const prevPageBtn = document.querySelector('#prevPage');
const nextPageBtn = document.querySelector('#nextPage');

let activeCategory = "all";
let currentPage = 0;
let totalPages = 0;
let inFlight = null;
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

async function fetchJson(url, signal) {
    const response = await fetch(url, { signal });
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

function buildQuery(page) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('size', PAGE_SIZE);

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

    return params.toString();
}

function syncUrl() {
    const qs = buildQuery(currentPage);
    history.replaceState(null, '', `${location.pathname}?${qs}`);
}

function restoreFromUrl() {
    const params = new URLSearchParams(location.search);

    const title = params.get('title');
    if (title) {
        searchInput.value = title;
    }

    const date = params.get('date');
    if (date) {
        dateFilter.value = date;
    }

    const venue = params.get('venue');
    if (venue) {
        venueFilter.value = venue;
    }

    const category = params.get('category');
    if (category) {
        activeCategory = category;
    }

    const page = Number.parseInt(params.get('page'), 10);
    currentPage = Number.isNaN(page) || page < 0 ? 0 : page;
}

function setActiveCategoryChip(category) {
    for (let chip of categoryFilters.querySelectorAll('.chip')) {
        chip.classList.toggle('active', chip.dataset.category === category);
    }
}

async function loadFilteredEvents() {
    if (inFlight) {
        inFlight.abort();
    }
    const controller = new AbortController();
    inFlight = controller;

    let page;
    try {
        page = await fetchJson(`${PUBLIC_SEARCH_URL}?${buildQuery(currentPage)}`, controller.signal);
    } catch (error) {
        if (error.name === 'AbortError') {
            return;
        }
        console.error("Failed to load events:", error);
        page = { content: [], number: 0, size: PAGE_SIZE, totalPages: 1, totalElements: 0, first: true, last: true };
    } finally {
        if (inFlight === controller) {
            inFlight = null;
        }
    }

    if (page.totalPages > 0) {
        currentPage = Math.min(page.number, page.totalPages - 1);
    }
    totalPages = page.totalPages;

    renderEvents(page.content);
    renderPagination(page);
    syncUrl();
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

    setActiveCategoryChip(chip.dataset.category);
    activeCategory = chip.dataset.category;
    currentPage = 0;
    loadFilteredEvents();
}

function goToPage(page) {
    if (page < 0 || page >= totalPages || page === currentPage) {
        return;
    }
    currentPage = page;
    loadFilteredEvents();
    eventsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPagination(page) {
    const start = page.totalElements === 0 ? 0 : page.number * page.size + 1;
    const end = Math.min((page.number + 1) * page.size, page.totalElements);

    if (page.totalElements === 0) {
        pagination.hidden = true;
        return;
    }

    pageInfo.textContent = `Showing ${start}-${end} of ${page.totalElements}`;
    pagination.hidden = false;
    prevPageBtn.disabled = page.first;
    nextPageBtn.disabled = page.last;
}

function resetFilters() {
    searchInput.value = "";
    dateFilter.value = "";
    venueFilter.value = "";
    activeCategory = "all";
    currentPage = 0;

    setActiveCategoryChip("all");

    loadFilteredEvents();
}

searchInput.addEventListener("input", debounce(() => {
    currentPage = 0;
    loadFilteredEvents();
}));
dateFilter.addEventListener("change", () => {
    currentPage = 0;
    loadFilteredEvents();
});
venueFilter.addEventListener("change", () => {
    currentPage = 0;
    loadFilteredEvents();
});
clearBtn.addEventListener("click", resetFilters);
prevPageBtn.addEventListener("click", () => goToPage(currentPage - 1));
nextPageBtn.addEventListener("click", () => goToPage(currentPage + 1));
document.addEventListener("click", handleCategoryClick);

async function init() {
    restoreFromUrl();
    await loadVenues();
    await loadCategories();
    setActiveCategoryChip(activeCategory);
    await loadFilteredEvents();
}

init();
