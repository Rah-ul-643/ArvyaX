# AI Assisted Journal System — Architecture

## 1. System Overview

The AI Assisted Journal System allows users to write reflective journal entries after immersive nature sessions (forest, ocean, mountain). The system analyzes the emotional tone of each entry using a Large Language Model (LLM) and generates insights about the user's mental state over time.

The system is designed with scalability, cost efficiency, and privacy in mind. It separates API handling, background processing, and storage so that each component can scale independently.

Core capabilities:

* Store journal entries
* Analyze emotional content using an LLM
* Generate insights from historical entries
* Provide a simple web interface for users

---

# 2. High Level Architecture

Client (React Frontend) -->
Node.js API Server (Express) -->
(A) MongoDB (Journal Storage)
(B) Redis (Cache + Queue)
(C) BullMQ Worker 
-->
LLM API

Component responsibilities:

Frontend

* Provides UI for journaling and analysis
* Displays previous entries
* Displays insights

API Server

* Accepts journal entries
* Handles analysis requests
* Provides insights
* Adds analysis jobs to the queue

Worker

* Processes background analysis jobs
* Calls the LLM
* Stores results in the database

MongoDB

* Stores journal entries and analysis results

Redis

* Stores cached LLM responses
* Maintains job queue

---

# 3. Component Architecture

## Frontend

Technology:

* React
* TailwindCSS

Responsibilities:

* Write journal entries
* Request emotion analysis
* Display journal history
* Display insights

The frontend communicates with the backend through REST APIs.

---

## Backend API

Technology:

* Node.js
* Express

Responsibilities:

* Validate incoming requests
* Store journal entries
* Trigger LLM analysis
* Retrieve journal entries
* Compute insights

The API server is stateless and can be horizontally scaled.

---

## MongoDB

MongoDB stores journal entries and analysis results.

Example document:

{
"userId": "123",
"ambience": "forest",
"text": "<encrypted text>",
"emotion": "calm",
"keywords": ["rain", "nature", "peace"],
"summary": "User felt calm after listening to forest ambience",
"createdAt": "timestamp"
}

Journal text is encrypted before storage.

---

## Redis

Redis serves two purposes:

1. LLM response caching
2. Job queue storage

This prevents repeated expensive LLM calls and enables background processing.

---

## Worker Service

Technology:

* BullMQ

Responsibilities:

* Consume journal analysis jobs
* Decrypt journal text
* Call LLM API
* Store analysis results

This prevents blocking the main API server.

---

# 4. API Design

## Create Journal Entry

POST /api/journal

Request

{
"userId": "123",
"ambience": "forest",
"text": "I felt calm today after listening to the rain"
}

Response

{
"status": "saved"
}

---

## Analyze Journal Text

POST /api/journal/analyze

Request

{
"text": "I felt calm today after listening to the rain"
}

Response

{
"emotion": "calm",
"keywords": ["rain","nature","peace"],
"summary": "User experienced relaxation during the forest session"
}

---

## Get Journal Entries

GET /api/journal/:userId

Returns all journal entries for the user.

---

## Get Insights

GET /api/journal/insights/:userId

Response example

{
"totalEntries": 8,
"topEmotion": "calm",
"mostUsedAmbience": "forest",
"recentKeywords": ["focus","nature","rain"]
}

---

# 5. Scaling to 100k Users

The architecture scales using horizontal scaling.

## API Layer

Multiple API servers can run behind a load balancer.

Users
|
Load Balancer
|
API1 API2 API3 API4

Each API instance is stateless.

---

## Worker Scaling

Workers process analysis jobs from Redis.

Queue
|
Worker1
Worker2
Worker3
Worker4

More workers can be added to handle increased demand.

---

## Database Scaling

MongoDB scaling options:

* Indexing on userId
* Read replicas
* Sharding

---

# 6. Reducing LLM Cost

LLM cost is reduced using several techniques.

## Redis Caching

Cache key:

sha256(journal_text)

If the same journal text is analyzed again, the cached result is returned.

---

## Lightweight Models

The system uses Groq hosted models such as:

llama-3.1-8b-instant

These models are fast and cost efficient.

---

## Asynchronous Processing

LLM calls are processed in background workers instead of the API thread.

---

# 7. Caching Repeated Analysis

Workflow:

1. Compute hash of journal text
2. Check Redis cache
3. If cache hit → return result
4. If cache miss → call LLM
5. Store result in Redis

Cache TTL: 24 hours

---

# 8. Protecting Sensitive Journal Data

Journal entries contain personal information and must be protected.

Security measures:

Encryption

* Journal text encrypted using AES‑256‑GCM

Environment Variables

* API keys stored in environment variables

LLM Privacy

* Only journal text is sent to the LLM
* No user identifiers are included

---

# 9. Rate Limiting

The analyze endpoint uses rate limiting.

Example rule:

20 requests per minute per user

This prevents abuse of the LLM API.

---

# 10. Fault Tolerance

BullMQ supports:

* automatic retries
* backoff strategies
* job failure logging

Example:

attempts: 3
backoff: exponential

---

# 11. Deployment

The application is containerized using Docker.

Services:

* Frontend
* Backend API
* Worker
* MongoDB
* Redis

Docker Compose orchestrates all services.

---

# 12. Future Improvements

Possible improvements:

* authentication
* journaling streak tracking
* sentiment trend visualization
* vector search for journals
* real-time streaming analysis

---

# Conclusion

This architecture provides a scalable and privacy-focused journaling system capable of supporting large numbers of users while keeping LLM usage efficient.
