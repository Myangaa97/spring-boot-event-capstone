"use strict";

const API_URL = '/api/admin/venues';

const formSection = document.querySelector('#formSection');
const formTitle = document.querySelector('#formTitle');
const form = document.querySelector('#venueForm');
const editIdInput = document.querySelector('#editId');
const nameInput = document.querySelector('#fName');
const addressInput = document.querySelector('#fAddress');
const capacityInput = document.querySelector('#fCapacity');
const tableBody = document.querySelector('#venuesTableBody');
const emptyTable = document.querySelector('#emptyTable');

const csrfToken = document.querySelector('meta[name="_csrf"]').content;
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

async function loadVenues() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Venues could not be loaded");
        }
        const data = await response.json();

        renderVenues(data);

    } catch (error) {
        console.error(error);
        showMessage("Venues could not be loaded", true);
    }
}

function renderVenues(venues) {
    tableBody.innerHTML = "";

    if (venues.length === 0) {
        emptyTable.classList.remove('hidden');
        return;
    }
    emptyTable.classList.add('hidden');

    for (let venue of venues) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = venue.name;

        const addressCell = document.createElement('td');
        addressCell.textContent = venue.address;

        const capacityCell = document.createElement('td');
        capacityCell.textContent = venue.capacity;

        const actionCell = document.createElement('td');
        actionCell.style.textAlign = 'right';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.className = 'btn btn-secondary btn-sm';
        editButton.style.marginRight = '8px';
        editButton.addEventListener('click', () => {
            startEdit(venue);
        });

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.addEventListener('click', () => {
            deleteVenue(venue.id);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(addressCell);
        row.appendChild(capacityCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    }
}

async function deleteVenue(id) {
    const confirmed = confirm("Are you sure you want to delete this venue?");
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

        showMessage("Venue deleted successfully");
        hideForm();
        await loadVenues();

    } catch (error) {
        console.error(error);
        showMessage("Venue could not be deleted", true);
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const id = editIdInput.value;
    const venue = {
        name: nameInput.value.trim(),
        address: addressInput.value.trim(),
        capacity: Number(capacityInput.value)
    };

    if (venue.name === "") {
        showMessage("Venue name is required", true);
        return;
    }

    if (venue.address === "") {
        showMessage("Address is required", true);
        return;
    }

    if (!Number.isInteger(venue.capacity) || venue.capacity < 1) {
        showMessage("Capacity must be a whole number of at least 1", true);
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
            body: JSON.stringify(venue)
        });

        if (!response.ok) {
            throw new Error("Request failed");
        }

        showMessage(isEditing ? "Venue updated successfully" : "Venue created successfully");

        hideForm();
        await loadVenues();

    } catch (error) {
        console.error(error);
        showMessage("Request failed", true);
    }
}

function showForm() {
    form.reset();
    editIdInput.value = "";
    formTitle.textContent = "New Venue";
    formSection.classList.remove('hidden');
    nameInput.focus();
}

function hideForm() {
    form.reset();
    editIdInput.value = "";
    formSection.classList.add('hidden');
}

function startEdit(venue) {
    editIdInput.value = venue.id;
    nameInput.value = venue.name;
    addressInput.value = venue.address;
    capacityInput.value = venue.capacity;
    formTitle.textContent = "Edit Venue";
    formSection.classList.remove('hidden');
    nameInput.focus();
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

loadVenues();