
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let notes = [];
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");

let nextLocalKey = 1;

// Display a status message and its visual style.
function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

// Create and display the notes without using innerHTML.
function renderNotes() {
    notesList.replaceChildren();

    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No notes found. Click Load notes to try again.";
        notesList.appendChild(emptyItem);
        return;
    }

    notes.forEach((note) => {
        const listItem = document.createElement("li");
        listItem.className = "note-item";

        const heading = document.createElement("h3");
        heading.textContent = note.title;

        const body = document.createElement("p");
        body.textContent = note.body;

        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            handleDelete(note);
        });

        listItem.appendChild(heading);
        listItem.appendChild(body);
        listItem.appendChild(deleteButton);
        notesList.appendChild(listItem);

    });
}

// Reusable function for sending HTTP requests.
async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
    }

    const data = response.status === 204
        ? null
        : await response.json();

    return {
        data: data,
        status: response.status
    };
}

// GET: retrieve the first 10 notes.
async function getNotes() {
    const result = await request(`${API_URL}?_limit=10`);
    return result.data;
}

// Load notes when the button is clicked.
loadButton.addEventListener("click", async () => {
    loadButton.disabled = true;
    showStatus("Loading notes...");

    try {
        notes = await getNotes();
        renderNotes();

        if (notes.length === 0) {
            showStatus("The server returned no notes.", "success");
        } else {
            showStatus(`Loaded ${notes.length} notes from the server.`, "success");
        }
    } catch (error) {
        showStatus(
            `Could not load notes: ${error.message}`,
            "error"
        );
    } finally {
        loadButton.disabled = false;
    }
});

async function createNote(title, body) {
    return await request(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            body: body,
            userId: 1
        })
    });
}

noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        showStatus("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus("The title must be 100 characters or fewer.", "error");
        return;
    }

    submitButton.disabled = true;
    loadButton.disabled = true;
    showStatus("Creating note...");

    try {
        const result = await createNote(title, body);

        const newNote = {
            ...result.data,
            uiKey: nextLocalKey++
        };

        notes.unshift(newNote);
        renderNotes();

        showStatus(
            `Note created successfully (HTTP ${result.status}).`,
            "success"
        );

        noteForm.reset();
    } catch (error) {
        showStatus(`Could not create note: ${error.message}`, "error");
    } finally {
        submitButton.disabled = false;
        loadButton.disabled = false;
    }
});

async function deleteNote(noteId) {
    return await request(`${API_URL}/${noteId}`, {
        method: "DELETE"
    });
}

async function handleDelete(note) {
    loadButton.disabled = true;
    submitButton.disabled = true;
    showStatus("Deleting note...");

    try {
        const result = await deleteNote(note.id);

        // JSONPlaceholder simulates deletion; remove the note
        // from our local page because the server does not persist it.
        notes = notes.filter((item) => item !== note);

        renderNotes();

        showStatus(
            `Note deleted successfully (HTTP ${result.status}).`,
            "success"
        );
    } catch (error) {
        showStatus(`Could not delete note: ${error.message}`, "error");
    } finally {
        loadButton.disabled = false;
        submitButton.disabled = false;
    }
}


