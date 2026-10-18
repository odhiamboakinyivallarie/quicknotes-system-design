# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database to store users, notes, tags, and the relationships between notes and tags.

The design contains four tables:

- `users`: stores user account information.
- `notes`: stores notes created by users.
- `tags`: stores reusable labels.
- `note_tags`: connects notes to tags through a many-to-many relationship.

## 2. Tables and Columns

### Users

| Column | Data type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| username | VARCHAR(50) | Unique, not null |
| email | VARCHAR(255) | Unique, not null |
| password_hash | VARCHAR(255) | Not null |
| created_at | TIMESTAMP | Not null |

### Notes

| Column | Data type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| user_id | INTEGER | Foreign key to users.id, not null |
| title | VARCHAR(100) | Not null |
| body | TEXT | Nullable |
| created_at | TIMESTAMP | Not null |
| updated_at | TIMESTAMP | Not null |

### Tags

| Column | Data type | Constraints |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| name | VARCHAR(50) | Unique, not null |

### Note Tags

| Column | Data type | Constraints |
|---|---|---|
| note_id | INTEGER | Foreign key to notes.id, primary key |
| tag_id | INTEGER | Foreign key to tags.id, primary key |

The composite primary key `(note_id, tag_id)` prevents the same tag from being attached to the same note more than once.

## 3. Relationships

- **Users to Notes — one-to-many:** one user can create many notes, but each note belongs to one user.
- **Notes to Tags — many-to-many:** one note can have many tags, and one tag can belong to many notes.
- `note_tags` implements the many-to-many relationship using two foreign keys.

## 4. SQL Table Creation

The following SQL uses SQLite-compatible syntax.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## 5. SQL Queries

### Query 1: Retrieve notes for one user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This returns the notes belonging to user 1, newest updated notes first.

### Query 2: Find all notes with a particular tag

```sql
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt ON n.id = nt.note_id
JOIN tags AS t ON nt.tag_id = t.id
WHERE t.name = 'Work';
```

This demonstrates how JOIN operations combine related tables.

### Query 3: Count notes per user

```sql
SELECT u.id, u.username, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON u.id = n.user_id
GROUP BY u.id, u.username;
```

The LEFT JOIN includes users who have no notes.

### Query 4: Add a tag to a note

```sql
INSERT INTO note_tags (note_id, tag_id)
VALUES (1, 2);
```

Both IDs must refer to existing records. The pair must not already exist.

## 6. Indexing

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

**Reason:** The application frequently retrieves notes by `user_id`. This index can speed up those lookups as the notes table grows, at the cost of extra storage and some write overhead.

The primary key on `note_tags(note_id, tag_id)` also supports lookups beginning with `note_id`. An additional index on `tag_id` can improve searches that start from a tag:

```sql
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
```

## 7. SQL vs NoSQL

**Choice: SQL, specifically PostgreSQL for a production deployment.**

Reasons:

1. Users, notes, and tags have clear relationships.
2. Foreign keys and constraints protect data integrity.
3. Transactions help keep related changes consistent.
4. JOIN queries make it straightforward to retrieve notes and their tags.
5. PostgreSQL supports indexes, concurrent access, and read replicas.

A NoSQL database could be useful for flexible document structures or particular high-scale access patterns, but it is not necessary for this application's initial requirements. SQLite is suitable for local development and a small learning project.
