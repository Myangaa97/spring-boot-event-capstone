"use strict";

const EVENTS_URL = '/api/public/events';
const VENUES_URL = '/api/public/venues';

const searchInput = document.querySelector('#searchInput');
const categoryFilters = document.querySelector('#categoryFilters');

const eventsGrid = document.querySelector('#eventsGrid');
const emptyState = document.querySelector('#emptyState');
const venuesGrid = document.querySelector('#venuesGrid');

const statEvents = document.querySelector('#statEvents');
const statVenues = document.querySelector('#statVenues');

const eventModal = document.querySelector('#eventModal');
const modalOverlay = document.querySelector('#modalOverlay');
const modalClose = document.querySelector('#modalClose');
const modalContent = document.querySelector('#modalContent');

let allEvents = [];
let allVenues = [];
let activeCategory = "all";

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${url}`);
    }
    return response.json();
}

function formatPrice(price) {
    return `${Number(price).toLocaleString('mn-MN')} ₮`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()}`;
}

function ticketPercentage(event) {
    return Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
}

function ticketStatusClass(event) {
    const pct = ticketPercentage(event);
    if (pct >= 90) return 'badge badge-red';
    if (pct >= 70) return 'badge badge-orange';
    return 'badge badge-green';
}

function ticketStatusText(event) {
    if (event.availableTickets <= 0) return 'Sold out';
    if (event.availableTickets <= 50) return 'Only a few left!';
    return `${event.availableTickets} tickets left`;
}

async function loadEvents() {
    try {
        allEvents = await fetchJson(EVENTS_URL);
        buildCategoryFilters();
        updateStats();
        applyFilters();
    } catch (error) {
        console.error(error);
        eventsGrid.innerHTML = "";
        emptyState.classList.remove('hidden');
    }
}

async function loadVenues() {
    try {
        allVenues = await fetchJson(VENUES_URL);
        updateStats();
        renderVenues(allVenues);
    } catch (error) {
        console.error(error);
    }
}

function buildCategoryFilters() {
    const seen = new Set();

    categoryFilters.innerHTML = "";

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.dataset.category = "all";
    allChip.textContent = "All";
    allChip.className = activeCategory === "all" ? "chip active" : "chip";
    allChip.addEventListener('click', () => selectCategory("all"));
    categoryFilters.appendChild(allChip);

    for (let event of allEvents) {
        if (event.categoryId == null || seen.has(event.categoryId)) {
            continue;
        }
        seen.add(event.categoryId);

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.dataset.category = String(event.categoryId);
        chip.textContent = event.categoryName;
        chip.className = String(event.categoryId) === activeCategory ? "chip active" : "chip";
        chip.addEventListener('click', () => selectCategory(String(event.categoryId)));
        categoryFilters.appendChild(chip);
    }
}

function selectCategory(categoryId) {
    activeCategory = categoryId;

    for (let chip of categoryFilters.querySelectorAll('.chip')) {
        chip.classList.toggle('active', chip.dataset.category === categoryId);
    }

    applyFilters();
}

function updateStats() {
    statEvents.textContent = allEvents.filter(e => e.published).length;
    statVenues.textContent = allVenues.length;
}

function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();

    const filtered = allEvents.filter(event => {
        if (!event.published) {
            return false;
        }

        const matchesCategory = activeCategory === "all" || String(event.categoryId) === activeCategory;

        const haystack = `${event.title} ${event.description ?? ""} ${event.venueName ?? ""}`.toLowerCase();
        const matchesSearch = search === "" || haystack.includes(search);

        return matchesCategory && matchesSearch;
    });

    renderEvents(filtered);
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

function buildEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.addEventListener('click', () => openEventModal(event));

    const imageWrap = document.createElement('div');
    imageWrap.className = 'event-card-image';

    const image = document.createElement('img');
    image.src = event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop';
    image.alt = event.title;
    imageWrap.appendChild(image);

    const categoryBadge = document.createElement('div');
    categoryBadge.className = 'image-badge-top';
    const categorySpan = document.createElement('span');
    categorySpan.className = 'badge badge-white';
    categorySpan.textContent = event.categoryName ?? "";
    categoryBadge.appendChild(categorySpan);
    imageWrap.appendChild(categoryBadge);

    const statusBadge = document.createElement('div');
    statusBadge.className = 'image-badge-bottom';
    const statusSpan = document.createElement('span');
    statusSpan.className = ticketStatusClass(event);
    statusSpan.textContent = ticketStatusText(event);
    statusBadge.appendChild(statusSpan);
    imageWrap.appendChild(statusBadge);

    card.appendChild(imageWrap);

    const body = document.createElement('div');
    body.className = 'event-card-body';

    const title = document.createElement('h3');
    title.className = 'event-card-title';
    title.textContent = event.title;
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'event-meta';

    const dateRow = document.createElement('div');
    dateRow.className = 'event-meta-row';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = `${formatDate(event.eventDate)} · ${event.startTime}`;
    dateRow.appendChild(dateSpan);
    meta.appendChild(dateRow);

    const venueRow = document.createElement('div');
    venueRow.className = 'event-meta-row';
    const venueSpan = document.createElement('span');
    venueSpan.textContent = event.venueName ?? "";
    venueRow.appendChild(venueSpan);
    meta.appendChild(venueRow);

    body.appendChild(meta);

    const footer = document.createElement('div');
    footer.className = 'event-card-footer';

    const priceBlock = document.createElement('div');
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = formatPrice(event.ticketPrice);
    priceBlock.appendChild(price);
    const priceNote = document.createElement('p');
    priceNote.className = 'price-note';
    priceNote.textContent = 'per ticket';
    priceBlock.appendChild(priceNote);
    footer.appendChild(priceBlock);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary btn-sm';
    button.textContent = 'Details';
    footer.appendChild(button);

    body.appendChild(footer);
    card.appendChild(body);

    return card;
}

function renderVenues(venues) {
    venuesGrid.innerHTML = "";

    for (let venue of venues) {
        venuesGrid.appendChild(buildVenueCard(venue));
    }
}

function buildVenueCard(venue) {
    const card = document.createElement('div');
    card.className = 'venue-card';

    const inner = document.createElement('div');
    inner.className = 'venue-card-inner';

    const info = document.createElement('div');

    const name = document.createElement('h3');
    name.className = 'venue-name';
    name.textContent = venue.name;
    info.appendChild(name);

    const address = document.createElement('p');
    address.className = 'venue-address';
    address.textContent = venue.address ?? "";
    info.appendChild(address);

    const capacity = document.createElement('div');
    capacity.className = 'venue-capacity';
    const capacitySpan = document.createElement('span');
    capacitySpan.textContent = `${Number(venue.capacity ?? 0).toLocaleString()} capacity`;
    capacity.appendChild(capacitySpan);
    info.appendChild(capacity);

    inner.appendChild(info);
    card.appendChild(inner);

    return card;
}

function openEventModal(event) {
    modalContent.innerHTML = "";

    const image = document.createElement('img');
    image.className = 'modal-image';
    image.src = event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop';
    image.alt = event.title;
    modalContent.appendChild(image);

    const body = document.createElement('div');
    body.className = 'modal-body';

    const badgeRow = document.createElement('div');
    badgeRow.style.display = 'flex';
    badgeRow.style.gap = '8px';
    badgeRow.style.marginBottom = '12px';
    badgeRow.style.flexWrap = 'wrap';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge badge-yellow';
    categoryBadge.textContent = event.categoryName ?? "";
    badgeRow.appendChild(categoryBadge);

    const statusBadge = document.createElement('span');
    statusBadge.className = ticketStatusClass(event);
    statusBadge.textContent = `${event.availableTickets} tickets left`;
    badgeRow.appendChild(statusBadge);

    body.appendChild(badgeRow);

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = event.title;
    body.appendChild(title);

    if (event.description) {
        const description = document.createElement('p');
        description.textContent = event.description;
        body.appendChild(description);
    }

    const infoGrid = document.createElement('div');
    infoGrid.className = 'two-col';

    const dateBox = document.createElement('div');
    dateBox.className = 'info-box';
    const dateLabel = document.createElement('p');
    dateLabel.className = 'info-label';
    dateLabel.textContent = 'Date / Time';
    dateBox.appendChild(dateLabel);
    const dateValue = document.createElement('p');
    dateValue.className = 'info-value';
    dateValue.textContent = formatDate(event.eventDate);
    dateBox.appendChild(dateValue);
    const dateSub = document.createElement('p');
    dateSub.className = 'info-sub';
    dateSub.textContent = event.startTime;
    dateBox.appendChild(dateSub);
    infoGrid.appendChild(dateBox);

    const venueBox = document.createElement('div');
    venueBox.className = 'info-box';
    const venueLabel = document.createElement('p');
    venueLabel.className = 'info-label';
    venueLabel.textContent = 'Venue';
    venueBox.appendChild(venueLabel);
    const venueValue = document.createElement('p');
    venueValue.className = 'info-value';
    venueValue.textContent = event.venueName ?? "";
    venueBox.appendChild(venueValue);
    infoGrid.appendChild(venueBox);

    body.appendChild(infoGrid);

    const progressWrap = document.createElement('div');
    const progressMeta = document.createElement('div');
    progressMeta.className = 'progress-meta';
    const soldLabel = document.createElement('span');
    soldLabel.textContent = 'Tickets sold';
    progressMeta.appendChild(soldLabel);
    const soldValue = document.createElement('span');
    soldValue.style.fontWeight = '700';
    soldValue.textContent = `${ticketPercentage(event)}%`;
    progressMeta.appendChild(soldValue);
    progressWrap.appendChild(progressMeta);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${ticketPercentage(event)}%`;
    progressTrack.appendChild(progressFill);
    progressWrap.appendChild(progressTrack);

    body.appendChild(progressWrap);

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.alignItems = 'center';
    footer.style.justifyContent = 'space-between';
    footer.style.paddingTop = '16px';
    footer.style.borderTop = '1px solid var(--gray-100)';

    const priceBlock = document.createElement('div');
    const totalPrice = document.createElement('p');
    totalPrice.className = 'total-price';
    totalPrice.textContent = formatPrice(event.ticketPrice);
    priceBlock.appendChild(totalPrice);
    const priceNote = document.createElement('p');
    priceNote.className = 'price-note';
    priceNote.textContent = 'per ticket';
    priceBlock.appendChild(priceNote);
    footer.appendChild(priceBlock);

    if (event.availableTickets > 0) {
        const bookButton = document.createElement('a');
        bookButton.href = `/customer/events/${event.id}`;
        bookButton.className = 'btn btn-accent';
        bookButton.textContent = 'Book Now';
        footer.appendChild(bookButton);
    } else {
        const soldOutButton = document.createElement('button');
        soldOutButton.type = 'button';
        soldOutButton.disabled = true;
        soldOutButton.className = 'btn';
        soldOutButton.textContent = 'Sold Out';
        footer.appendChild(soldOutButton);
    }

    body.appendChild(footer);
    modalContent.appendChild(body);

    eventModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    eventModal.classList.add('hidden');
    document.body.style.overflow = '';
}

searchInput.addEventListener('input', applyFilters);
modalOverlay.addEventListener('click', closeEventModal);
modalClose.addEventListener('click', closeEventModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventModal();
    }
});

async function init() {
    await loadVenues();
    await loadEvents();
}

init();