# QuickNotes API Design

## 1. Overview

QuickNotes is a notes management application. Its API allows clients to create, retrieve, update, and delete notes. The API follows REST principles and uses JSON for request and response bodies.

**Base URL:** `https://api.quicknotes.example.com`

*Note: This is a proposed API design. The frontend currently uses JSONPlaceholder for practice.*

## 2. Endpoints

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| GET | `/notes` | Retrieve all notes belonging to the authenticated user | 200 OK |
| GET | `/notes/{id}` | Retrieve one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| PATCH | `/notes/{id}` | Update selected note fields | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/tags` | Retrieve available tags | 200 OK |
| POST | `/notes/{id}/tags` | Associate a tag with a note | 201 Created |

## 3. Create a Note

**Request**

`POST /notes`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

Example JSON request body:

```json
{
  "title": "Meeting notes",
  "body": "Discuss the project deadline.",
  "tag_ids": [1, 2]
}
```

Example successful response — `201 Created`:

```json
{
  "id": 42,
  "user_id": 7,
  "title": "Meeting notes",
  "body": "Discuss the project deadline.",
  "created_at": "2026-10-19T08:30:00Z",
  "updated_at": "2026-10-19T08:30:00Z",
  "tags": [
    {"id": 1, "name": "Work"},
    {"id": 2, "name": "Projects"}
  ]
}
```

## 4. List Notes

**Request**

`GET /notes?page=1&limit=10`

Example successful response — `200 OK`:

```json
{
  "page": 1,
  "limit": 10,
  "total": 2,
  "notes": [
    {
      "id": 42,
      "title": "Meeting notes",
      "body": "Discuss the project deadline."
    },
    {
      "id": 43,
      "title": "Shopping list",
      "body": "Buy notebooks and pens."
    }
  ]
}
```

## 5. Error Handling

Errors return a suitable HTTP status code and a consistent JSON response.

Example error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required."
  }
}
```

| Status | Meaning | Example |
|---|---|---|
| 400 Bad Request | Invalid request data | Missing note title |
| 401 Unauthorized | Authentication is missing or invalid | No valid access token |
| 403 Forbidden | User lacks permission | Attempt to access a restricted resource |
| 404 Not Found | Resource does not exist or is unavailable to the user | Note ID not found |
| 500 Internal Server Error | Unexpected server failure | Database operation fails |

## 6. Security and Validation

- Require authentication for private notes.
- Verify that users can access only their own notes.
- Validate that titles are present and no longer than 100 characters.
- Use parameterized SQL queries to reduce SQL injection risks.
- Apply rate limiting and HTTPS in production.
- Return useful error messages without exposing passwords, tokens, or internal server details.
