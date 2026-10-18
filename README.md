# QuickNotes System Design

QuickNotes is a notes management project that demonstrates frontend development, REST API operations, relational database design, and scalable system architecture.

## Features

- Retrieve 10 sample notes using a GET request.
- Create notes using a POST request.
- Delete notes using a DELETE request.
- Display loading, success, and error messages.
- Validate note titles before submitting.
- Document a proposed REST API, database schema, and scalable architecture.

**Important:** The frontend uses JSONPlaceholder, a practice API. Created and deleted notes are simulated and are not permanently stored on the server.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Fetch API
- JSONPlaceholder
- Git and GitHub
- SQL and SQLite-compatible schema examples
- PostgreSQL as the proposed production database

## How to Run Locally

1. Clone this repository:

   ```bash
   git clone https://github.com/odhiamboakinyivallarie/quicknotes-system-design.git
   ```

2. Enter the project directory:

   ```bash
   cd quicknotes-system-design
   ```

3. Start a local web server using Python:

   ```bash
   py -m http.server 5500
   ```

4. Open `http://localhost:5500` in your browser.

5. Click **Load notes** to retrieve sample notes, or use the form to create a note.

Python is only needed to serve the static files locally; the application itself is built with HTML, CSS, and JavaScript.

## Project Documentation

- [API Design](docs/api-design.md) — endpoints, request and response examples, and error handling.
- [Data Model](docs/data-model.md) — database tables, relationships, SQL queries, and indexes.
- [System Architecture](docs/architecture.md) — requirements, load estimates, architecture diagram, request flows, and trade-offs.

## What I Learned

- How GET, POST, and DELETE requests communicate with a REST API.
- How JavaScript's Fetch API, async/await, and try/catch handle network requests.
- How to display API data safely using `textContent`.
- How primary keys, foreign keys, and joins represent relational data.
- How indexes can improve database query performance.
- How load balancers, caches, replicas, and queues support scalable systems.
- How to organize project documentation and use Git commits to track progress.

## Future Improvements

- Connect the frontend to a real backend and persistent database.
- Add user authentication and authorization.
- Implement note editing, searching, and tag management.
- Add automated tests and deployment configuration.
