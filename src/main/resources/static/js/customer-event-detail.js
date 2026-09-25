"use strict";

const PUBLIC_EVENT_URL = '/api/public/events';
const BOOKINGS_URL = '/api/bookings';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop';
const MAX_TICKETS_PER_BOOKING = 10;

const eventContainer = document.querySelector('#eventContainer');
const bookingModal = document.querySelector('#bookingModal');

const pathParts = window.location.pathname.split('/');
const eventId = pathParts[pathParts.length - 1];

let currentEvent = null;
let ticketQty = 1;

function formatPrice(price) {
    return `${Number(price).toLocaleString('mn-MN')} ₮`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    return `${date.getFullYear()} ${months[date.getMonth()]} ${date.getDate()}`;
}

function soldPercent(event) {
    return Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
}

function availabilityBadgeClass(event) {
    const percent = soldPercent(event);
    if (percent >= 90) {
        return 'badge badge-red badge-outlined';
    }
    if (percent >= 70) {
        return 'badge badge-orange';
    }
    return 'badge badge-green badge-outlined';
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request failed: ${url}`);
    }
    return response.json();
}

async function loadEvent() {
    try {
        currentEvent = await fetchJson(`${PUBLIC_EVENT_URL}/${eventId}`);
    } catch (error) {
        console.error("Failed to load event:", error);
        currentEvent = null;
    }
    renderDetail();
}

function changeQty(delta) {
    if (!currentEvent) {
        return;
    }
    const max = Math.min(currentEvent.availableTickets, MAX_TICKETS_PER_BOOKING);
    ticketQty = Math.max(1, Math.min(max, ticketQty + delta));
    renderDetail();
}

function openBookingModal() {
    if (!currentEvent) {
        return;
    }
    if (window.IS_LOGGED_IN !== true) {
        window.location.href = "/login";
        return;
    }

    const total = currentEvent.ticketPrice * ticketQty;

    bookingModal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal modal-sm" onclick="event.stopPropagation()">
                <button onclick="closeModal()" class="modal-close">
                    <i class="svg-icon fa-solid fa-xmark"></i>
                </button>
                <div class="modal-body">
                    <h2 class="modal-title" style="font-size: 20px;">Confirm Booking</h2>
                    <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 20px;">Review your booking details below</p>
                    <div class="info-box" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Event</span>
                            <span class="info-value">${currentEvent.title}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Date</span>
                            <span class="info-value">${formatDate(currentEvent.eventDate)} · ${currentEvent.startTime}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Venue</span>
                            <span class="info-value">${currentEvent.venueName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Tickets</span>
                            <span class="info-value">${ticketQty}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                            <span class="page-subtitle">Price per ticket</span>
                            <span class="info-value">${formatPrice(currentEvent.ticketPrice)}</span>
                        </div>
                        <hr style="border: none; border-top: 1px solid var(--gray-200); margin: 8px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                            <span class="info-value">Total</span>
                            <span class="total-price">${formatPrice(total)}</span>
                        </div>
                    </div>
                    <button onclick="confirmBooking()" class="btn btn-primary btn-block btn-lg" id="confirmBtn">Confirm Booking</button>
                </div>
            </div>
        </div>`;
}

function closeModal(clickEvent) {
    if (clickEvent && clickEvent.target && !clickEvent.target.classList.contains('modal-overlay')) {
        return;
    }
    bookingModal.innerHTML = "";
}

async function confirmBooking() {
    if (!currentEvent) {
        return;
    }
    if (window.IS_LOGGED_IN !== true) {
        window.location.href = "/login";
        return;
    }

    const confirmBtn = document.querySelector('#confirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing...";

    try {
        const response = await fetch(BOOKINGS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: currentEvent.id, ticketQuantity: ticketQty })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Booking failed");
        }

        showBookingSuccess(data);

    } catch (error) {
        console.error(error);
        alert(error.message || "Booking failed. Please sign in first.");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm Booking";
    }
}

function showBookingSuccess(data) {
    const bookingId = data.data ? data.data.id : "";

    bookingModal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal modal-sm">
                <div class="modal-body text-center">
                    <div class="success-circle">
                        <i class="svg-icon fa-solid fa-check"></i>
                    </div>
                    <h2 class="modal-title" style="font-size: 20px;">Booking Confirmed!</h2>
                    <p style="color: var(--gray-500); font-size: 14px;">Booking ID:
                        <span style="font-weight: 700;">KiloE-${1000 + Number(bookingId)}</span></p>
                    <p style="color: var(--gray-500); font-size: 14px;">Redirecting to your bookings...</p>
                </div>
            </div>
        </div>`;

    setTimeout(() => {
        window.location.href = "/customer/bookings";
    }, 1500);
}

function renderTicketPanel(event) {
    const max = Math.min(event.availableTickets, MAX_TICKETS_PER_BOOKING);
    const total = event.ticketPrice * ticketQty;

    if (event.availableTickets <= 0) {
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid var(--gray-100);">
                <div>
                    <p class="total-price" style="font-size: 36px;">${formatPrice(event.ticketPrice)}</p>
                    <p class="price-note">per ticket</p>
                </div>
                <button disabled class="btn btn-lg">Sold Out</button>
            </div>`;
    }

    const actionButton = window.IS_LOGGED_IN === true
        ? '<button onclick="bookTickets()" class="btn btn-accent btn-block btn-lg">Book Now</button>'
        : '<a href="/login" class="btn btn-accent btn-block btn-lg">Sign In to Book</a>';

    return `
        <div class="ticket-panel">
            <h3 style="font-weight: 700; margin-bottom: 16px;">Select Tickets</h3>
            <div class="qty-controls">
                <button onclick="changeQty(-1)" class="qty-btn">-</button>
                <span class="qty-value">${ticketQty}</span>
                <button onclick="changeQty(1)" class="qty-btn">+</button>
                <span style="font-size: 14px; color: var(--gray-400);">Max ${max}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-top: 16px; border-top: 1px solid var(--gray-100);">
                <div>
                    <p class="total-price">${formatPrice(total)}</p>
                    <p class="price-note">${formatPrice(event.ticketPrice)} x ${ticketQty}</p>
                </div>
            </div>
            ${actionButton}
        </div>`;
}

function renderDetail() {
    if (!currentEvent) {
        eventContainer.innerHTML = '<p class="empty-state" style="margin:0;">Event not found</p>';
        return;
    }

    const event = currentEvent;
    const sold = soldPercent(event);

    document.title = `${event.title} - KiloE`;

    eventContainer.innerHTML = `
        <img src="${event.imageUrl || FALLBACK_IMAGE}" alt="${event.title}" style="width: 100%; height: 320px; object-fit: cover;"
             onerror="this.src='${FALLBACK_IMAGE}'">
        <div style="padding: 32px;">
            <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                <span class="badge badge-yellow">${event.categoryName}</span>
                <span class="${availabilityBadgeClass(event)}">${event.availableTickets} tickets left</span>
            </div>
            <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 16px;">${event.title}</h1>
            <p style="color: var(--gray-600); font-size: 17px; line-height: 1.7; margin-bottom: 28px;">${event.description || ""}</p>

            <div class="two-col" style="margin-bottom: 28px;">
                <div class="info-box">
                    <p class="info-label">Date / Time</p>
                    <p class="info-value">${formatDate(event.eventDate)}</p>
                    <p class="info-sub">${event.startTime} цагаас</p>
                </div>
                <div class="info-box">
                    <p class="info-label">Venue</p>
                    <p class="info-value">${event.venueName}</p>
                </div>
            </div>

            <div style="margin-bottom: 28px;">
                <div class="progress-meta">
                    <span>Tickets sold</span>
                    <span style="font-weight: 700;">${sold}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${sold}%"></div>
                </div>
            </div>

            ${renderTicketPanel(event)}
        </div>`;
}


window.changeQty = changeQty;
window.bookTickets = openBookingModal;
window.closeModal = closeModal;
window.confirmBooking = confirmBooking;

document.addEventListener("DOMContentLoaded", loadEvent);