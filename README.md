# AI Assisted Journal System

An AI powered journaling application that analyzes emotional patterns in user journal entries after immersive nature sessions.

Users can write journal entries, analyze emotional tone using an LLM, and view insights about their mental state over time.

---

# Features

* Write journal entries
* Emotion analysis using an LLM
* View journal history
* Insights based on previous entries
* Redis caching for repeated analysis
* Background job processing using BullMQ
* Encryption for journal data
* Rate limiting for API protection

---

# Tech Stack

## Backend

* Node.js
* Express
* MongoDB
* Redis
* BullMQ

## Frontend

* React
* TailwindCSS

## AI

* Groq LLM API

---

# Project Structure

project-root

backend

* src
* Dockerfile
* package.json

frontend

* src
* public
* Dockerfile
* package.json

Other files

* docker-compose.yml
* .env.example
* README.md
* ARCHITECTURE.md

---

# Environment Setup

Create environment file

cp .env.example .env

Example `.env`

- GROQ_API_KEY = your_API_KEY (change this)

- ENCRYPTION_SECRET = yoursecret (you may or may not change)

- MONGO_URI=mongodb://mongo:27017/journal (dont change)

- REDIS_URL=redis://redis:6379 (dont change)

- REACT_APP_API_URL=[http://localhost:5000](http://localhost:5000) (dont change)

---

# Running the Project (Recommended)

The easiest way to run the system is using Docker.

Step 1 - Clone the repository 

 -> git clone https://github.com/Rah-ul-643/ArvyaX.git

 -> cd ArvyaX

Step 2 - Create environment file

 -> cp .env.example .env

(Add your LLM API key.)

Step 3 - Start all services

 -> docker compose up --build

Step 4 - Open the application

Frontend

[http://localhost:3000](http://localhost:3000)

Backend

[http://localhost:5000](http://localhost:5000)

---

# Running Without Docker

0. Add new .env files in each of frontend, backend and worker, configure mongo and redis accordingly:
    - REDIS_URL=redis://localhost:6379
    - MONGO_URI=mongodb://localhost:27017/journal
    
1. Start MongoDB

    - mongod

2. Start Redis

    - redis-server

3. Start Backend

    - cd backend

    - npm install

    - node src/server.js

4. Start Worker

    - cd backend

    - node src/workers/analysis.worker.js

5. Start Frontend

    - cd frontend

    - npm install

    - npm start

---

# API Examples

Analyze Journal

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

Create Journal Entry

POST /api/journal

Request

{
"userId": "123",
"ambience": "forest",
"text": "I felt calm today"
}

---

Get Journal Entries

GET /api/journal/:userId

---

Get Insights

GET /api/journal/insights/:userId

Example Response

{
"totalEntries": 8,
"topEmotion": "calm",
"mostUsedAmbience": "forest",
"recentKeywords": ["focus","nature","rain"]
}

---

# Security

* Journal text encrypted before database storage
* Secrets stored in environment variables
* No user identifiers sent to the LLM

---

# Future Improvements

* authentication
* emotion trend visualization
* advanced insights
* streaming LLM responses

---

# Author

Rahul
