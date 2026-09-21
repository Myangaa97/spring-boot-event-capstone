"use strict";

const API_URL = '/api/admin/events';
const CATEGORIES_URL = '/api/admin/categories';
const VENUES_URL = '/api/admin/venues';
const UPLOAD_URL = '/api/events/upload-image';
const EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const formSection = document.querySelector('#formSection');
const formTitle = document.querySelector('#formTitle');
const form = document.querySelector('#eventForm');
const editIdInput = document.querySelector('#editId');
const titleInput = document.querySelector('#fTitle');
const descInput = document.querySelector('#fDesc');
const dateInput = document.querySelector('#fDate');
const timeInput = document.querySelector('#fTime');
const categorySelect = document.querySelector('#fCategory');
const venueSelect = document.querySelector('#fVenue');
const priceInput = document.querySelector('#fPrice');
const ticketsInput = document.querySelector('#fTickets');
const imageInput = document.querySelector('#fImage');
const imageUrlInput = document.querySelector('#fImageUrl');
const imagePreview = document.querySelector('#imagePreview');
const imageStatus = document.querySelector('#imageStatus');
const publishedInput = document.querySelector('#fPublished');

const totalCount = document.querySelector('#totalCount');
const publishedCount = document.querySelector('#publishedCount');
const draftCount = document.querySelector('#draftCount');

const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');

const tableBody = document.querySelector('#eventsTableBody');
const emptyTable = document.querySelector('#emptyTable');

const csrfToken = document.querySelector('meta[name="_csrf"]').content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

let allEvents = [];

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${url}`);
    }
    return response.json();
}

function fillSelect(select, items, placeholder) {
    select.innerHTML = "";

    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    for (let item of items) {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    }
}

async function loadReferenceData() {
    try {
        const [categories, venues] = await Promise.all([
            fetchJson(CATEGORIES_URL),
            fetchJson(VENUES_URL)
        ]);

        fillSelect(categorySelect, categories, "Select category");
        fillSelect(venueSelect, venues, "Select venue");

        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        for (let category of categories) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        }
    } catch (error) {
        console.error(error);
        showMessage("Categories or venues could not be loaded", true);
    }
}

async function loadEvents() {
    try {
        allEvents = await fetchJson(API_URL);
        updateStats();
        applyFilters();
    } catch (error) {
        console.error(error);
        showMessage("Events could not be loaded", true);
    }
}

function updateStats() {
    const published = allEvents.filter(e => e.published).length;
    totalCount.textContent = allEvents.length;
    publishedCount.textContent = published;
    draftCount.textContent = allEvents.length - published;
}

function applyFilters() {
    const search = searchInput.value.trim().toLowerCase();
    const categoryId = categoryFilter.value;

    const filtered = allEvents.filter(event => {
        const matchesCategory = categoryId === "all" || String(event.categoryId) === categoryId;

        const haystack = `${event.title} ${event.venueName ?? ""} ${event.categoryName ?? ""}`.toLowerCase();
        const matchesSearch = search === "" || haystack.includes(search);

        return matchesCategory && matchesSearch;
    });

    renderEvents(filtered);
}

function renderEvents(events) {
    tableBody.innerHTML = "";

    if (events.length === 0) {
        emptyTable.classList.remove('hidden');
        return;
    }
    emptyTable.classList.add('hidden');

    for (let event of events) {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.textContent = event.title;

        const dateCell = document.createElement('td');
        const time = event.startTime ? event.startTime.substring(0, 5) : "";
        dateCell.textContent = `${event.eventDate} ${time}`.trim();

        const categoryCell = document.createElement('td');
        categoryCell.textContent = event.categoryName ?? "";

        const venueCell = document.createElement('td');
        venueCell.textContent = event.venueName ?? "";

        const priceCell = document.createElement('td');
        priceCell.textContent = `${Number(event.ticketPrice).toLocaleString('en-US')} MNT`;

        const ticketsCell = document.createElement('td');
        ticketsCell.textContent = event.totalTickets;

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.textContent = event.published ? 'Published' : 'Draft';
        badge.style.padding = '4px 10px';
        badge.style.borderRadius = '999px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '600';
        badge.style.background = event.published ? '#dcfce7' : '#fef9c3';
        badge.style.color = event.published ? '#166534' : '#854d0e';
        statusCell.appendChild(badge);

        const actionCell = document.createElement('td');
        actionCell.style.textAlign = 'right';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-secondary btn-sm';
        editButton.style.marginRight = '8px';
        editButton.addEventListener('click', () => {
            startEdit(event);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.addEventListener('click', () => {
            deleteEvent(event.id);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(categoryCell);
        row.appendChild(venueCell);
        row.appendChild(priceCell);
        row.appendChild(ticketsCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    }
}

async function deleteEvent(id) {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                [csrfHeader]: csrfToken
            }
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        showMessage("Event deleted successfully");
        hideForm();
        await loadEvents();

    } catch (error) {
        console.error(error);
        showMessage("Event could not be deleted", true);
    }
}

async function handleImageChange() {
    const file = imageInput.files[0];
    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        showMessage("Please choose an image file", true);
        imageInput.value = "";
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        showMessage("Image must be 5MB or smaller", true);
        imageInput.value = "";
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    imageStatus.textContent = "Uploading...";

    try {
		
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                [csrfHeader]: csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const data = await response.json();
        imageUrlInput.value = data.url;
        imagePreview.src = data.url;
        imageStatus.textContent = "Image uploaded";

    } catch (error) {
        console.error(error);
        imageInput.value = "";
        imageStatus.textContent = "Upload failed";
        showMessage("Image could not be uploaded", true);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const id = editIdInput.value;
    const event = {
        title: titleInput.value.trim(),
        description: descInput.value.trim(),
        eventDate: dateInput.value,
        startTime: timeInput.value,
        categoryId: Number(categorySelect.value),
        venueId: Number(venueSelect.value),
        ticketPrice: Number(priceInput.value),
        totalTickets: Number(ticketsInput.value),
        imageUrl: imageUrlInput.value || null,
        published: publishedInput.checked
    };

    if (event.title === "") {
        showMessage("Event title is required", true);
        return;
    }

    if (categorySelect.value === "") {
        showMessage("Please select a category", true);
        return;
    }

    if (venueSelect.value === "") {
        showMessage("Please select a venue", true);
        return;
    }

    if (Number.isNaN(event.ticketPrice) || event.ticketPrice < 0) {
        showMessage("Ticket price cannot be negative", true);
        return;
    }

    if (!Number.isInteger(event.totalTickets) || event.totalTickets < 1) {
        showMessage("Total tickets must be a whole number of at least 1", true);
        return;
    }

    const isEditing = id !== "";
    const url = isEditing ? `${API_URL}/${id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            throw new Error("Request failed");
        }

        showMessage(isEditing ? "Event updated successfully" : "Event created successfully");

        hideForm();
        await loadEvents();

    } catch (error) {
        console.error(error);
        showMessage("Request failed", true);
    }
}

function resetImage(url = "") {
    imageInput.value = "";
    imageUrlInput.value = url;
    imagePreview.src = url || EMPTY_IMAGE;
    imageStatus.textContent = "";
}

function showForm() {
    form.reset();
    editIdInput.value = "";
    resetImage();
    formTitle.textContent = "New Event";
    formSection.classList.remove('hidden');
    titleInput.focus();
}

function hideForm() {
    form.reset();
    editIdInput.value = "";
    resetImage();
    formSection.classList.add('hidden');
}

function startEdit(event) {
    editIdInput.value = event.id;
    titleInput.value = event.title;
    descInput.value = event.description ?? "";
    dateInput.value = event.eventDate;
    timeInput.value = event.startTime ? event.startTime.substring(0, 5) : "";
    categorySelect.value = String(event.categoryId);
    venueSelect.value = String(event.venueId);
    priceInput.value = event.ticketPrice;
    ticketsInput.value = event.totalTickets;
    publishedInput.checked = event.published;
    resetImage(event.imageUrl || "");

    formTitle.textContent = "Edit Event";
    formSection.classList.remove('hidden');
    formSection.scrollIntoView({ behavior: 'smooth' });
    titleInput.focus();
}

function showMessage(text, isError = false) {
    let message = document.querySelector('#message');

    if (!message) {
        message = document.createElement('div');
        message.id = 'message';
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.padding = '12px 18px';
        message.style.borderRadius = '8px';
        message.style.color = '#fff';
        message.style.zIndex = '1000';
        document.body.appendChild(message);
    }

    message.style.background = isError ? '#dc2626' : '#16a34a';
    message.textContent = text;
    message.hidden = false;

    setTimeout(() => {
        message.hidden = true;
    }, 3000);
}

form.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleImageChange);
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

async function init() {
    await loadReferenceData();
    await loadEvents();
}

init();