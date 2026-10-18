# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web-based notes application that allows users to create, retrieve, update, and delete notes. The proposed production architecture separates the frontend, application services, background processing, and database so each component can scale independently.

The current project is a small frontend using JSONPlaceholder. The architecture below describes a proposed production system, not infrastructure already deployed by this project.

## 2. Functional Requirements

1. Users can register and authenticate securely.
2. Users can create notes with a required title and optional body.
3. Users can view, edit, and delete their own notes.
4. Users can search and filter their notes.
5. Users can organize notes using tags.
6. Users cannot access another user's private notes.
7. The system provides useful success and error responses.

## 3. Non-Functional Requirements

1. **Availability:** target 99.9% monthly availability.
2. **Performance:** target a response time below 300 ms for typical reads, under normal load.
3. **Scalability:** add application servers as traffic increases.
4. **Security:** use HTTPS, authentication, authorization, input validation, and secure password hashing.
5. **Reliability:** back up the database and monitor errors.
6. **Maintainability:** separate application logic, data access, and frontend code.
7. **Data integrity:** use database constraints and transactions where needed.

## 4. Load Estimates for One Million Users

These are planning assumptions, not measured traffic.

Assume:
- 1,000,000 registered users.
- 10% of registered users are active daily: 100,000 daily active users.
- Each daily active user makes 50 API reads and 5 writes per day.
- Traffic is spread across 24 hours for the average-rate calculation.
- Each stored note and its average metadata occupy approximately 2 KB.
- Each daily active user creates 2 new notes per day.

### Average request rates

Daily reads:

100,000 × 50 = 5,000,000 reads/day

Average reads per second:

5,000,000 ÷ 86,400 ≈ 58 reads/second

Daily writes:

100,000 × 5 = 500,000 writes/day

Average writes per second:

500,000 ÷ 86,400 ≈ 5.8 writes/second

For initial capacity planning, assume peak traffic could be 5 times the average: approximately 290 reads/second and 29 writes/second. Actual traffic must be measured and the estimates revised.

### Storage growth

Assume each daily active user creates 2 notes per day:

100,000 × 2 = 200,000 new notes/day

Annual note count:

200,000 × 365 = 73,000,000 notes/year

Estimated annual storage for note data:

73,000,000 × 2 KB ≈ 146 GB/year

This is an approximate decimal storage estimate. It excludes indexes, replicas, backups, logs, and other database overhead. If each note is larger than 2 KB, storage requirements increase.

## 5. Proposed Architecture Diagram

```text
                     +----------------------+
                     |      Web Client      |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     |         DNS          |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     | CDN / Static Assets |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     |    Load Balancer     |
                     +----------+-----------+
                                |
                     +----------+----------+
                     |                     |
                     v                     v
             +---------------+     +---------------+
             | Application 1 |     | Application 2 |
             +-------+-------+     +-------+-------+
                     |                     |
                     +----------+----------+
                                |
                     +----------+-----------+
                     |                      |
                     v                      v
              +-------------+        +-------------+
              | Cache       |        | Job Queue   |
              | (e.g. Redis)|        +------+------+
              +------+------+               |
                     |                      v
                     |              +---------------+
                     |              | Background    |
                     |              | Worker        |
                     |              +-------+-------+
                     |                      |
                     v                      v
             +----------------+      +---------------+
             | Primary DB     |----->| Read Replica  |
             | (PostgreSQL)   |      +---------------+
             +----------------+
```

### Component responsibilities

- **Web client:** displays the interface and sends API requests.
- **DNS:** resolves the application's domain name to its network destination.
- **CDN:** serves cached static assets closer to users.
- **Load balancer:** distributes incoming API requests across healthy application servers.
- **Application servers:** validate requests, enforce permissions, and implement business rules.
- **Cache:** stores frequently accessed data to reduce database reads; cache invalidation must be handled carefully.
- **Primary database:** stores authoritative data and processes writes.
- **Read replica:** serves eligible read queries to reduce load on the primary; replication lag may cause slightly stale results.
- **Job queue:** stores background tasks until workers process them.
- **Background worker:** processes asynchronous tasks such as notifications and exports.

## 6. Request Flows

### GET /notes

1. The client sends `GET /notes` over HTTPS.
2. DNS resolves the application domain.
3. The CDN serves any applicable cached static assets; private note data is not placed in a shared public cache.
4. The load balancer routes the API request to a healthy application server.
5. The application server authenticates the user and verifies access permissions.
6. The server checks the cache for the user's notes.
7. On a cache miss, the server queries the read replica if the query can tolerate replication lag; otherwise it reads from the primary.
8. The server returns the notes as JSON with `200 OK`.

### POST /notes

1. The client sends `POST /notes` with a JSON body and authentication token.
2. DNS resolves the domain and the load balancer selects a healthy application server.
3. The server authenticates the user and validates the title and body.
4. The server writes the new note to the primary database inside a transaction.
5. The server invalidates or updates relevant cached data.
6. If required, the server publishes a background job, such as a notification, to the queue.
7. The server returns the created note with `201 Created`.

## 7. Architecture Trade-Offs

### SQL database vs NoSQL database

A relational database offers transactions, constraints, and joins that suit users, notes, and tags. However, joins and large workloads require careful indexing and capacity planning. A NoSQL database can suit certain flexible data structures and access patterns, but would introduce different consistency and modeling considerations.

### Cache vs always reading from the database

Caching can lower response times and database load. However, cached results can become stale, and invalidation adds complexity. The system should cache suitable read data while keeping writes authoritative in the primary database.

### Synchronous vs asynchronous work

Synchronous processing provides immediate results but can increase request latency. A queue allows slower tasks to run in the background, but introduces eventual completion, retries, and duplicate-processing concerns.

## 8. Avoiding Single Points of Failure

- Run at least two application servers across separate failure domains.
- Use a health-checked load balancer.
- Deploy database replication and maintain tested backups.
- Monitor replica lag and define a failover procedure.
- Configure the queue and workers for recovery and retry.
- Use cache fallbacks so a cache failure does not automatically make the application unavailable.
- Monitor service health, request latency, errors, and resource usage.

The architecture reduces individual points of failure, but true resilience depends on deployment configuration, failover testing, and operational monitoring.
