# 🚀 Frontend Caching

> Caching is one of the most important techniques for improving frontend performance, reducing network requests, and creating responsive web applications.

---

## 📌 What is Caching?

Caching is the process of storing data or resources temporarily so they can be reused without fetching or computing them again.

Instead of:

```text
User
  ↓
Browser
  ↓
Server
  ↓
Database
  ↓
Response
```

we can serve frequently used data from a cache:

```text
User
  ↓
Browser
  ↓
Cache ──────→ Response
  │
  └── Cache Miss
          ↓
       Server
          ↓
       Database
```

The goal is to reduce:

* Network latency
* Server load
* Database queries
* API response time
* Bandwidth usage

---

# 🧠 Why Do We Need Frontend Caching?

Consider an application that displays a user's profile.

Without caching:

```text
Open page
   ↓
GET /api/profile
   ↓
Server
   ↓
Database
   ↓
Response
```

Every time the user opens the page, the application may request the same data again.

With caching:

```text
Open page
   ↓
Check Cache
   ↓
Cache HIT
   ↓
Return cached profile
```

This can make the UI feel significantly faster.

---

# 🗂️ Types of Frontend Caching

Frontend caching can happen at multiple layers.

```text
                    Frontend Caching
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
 Browser Cache        Application Cache      CDN Cache
       │                   │                   │
       ▼                   ▼                   ▼
 HTTP Cache           Memory / State       Static Assets
```

Common layers include:

1. Browser/HTTP cache
2. In-memory application cache
3. Persistent browser storage
4. Service Worker cache
5. CDN cache
6. Framework-level cache

---

# 1️⃣ Browser / HTTP Cache

The browser can cache resources such as:

* JavaScript
* CSS
* Images
* Fonts
* API responses

The server controls caching using HTTP headers.

Example:

```http
Cache-Control: max-age=3600
```

This tells the browser that the resource can be considered fresh for 3600 seconds.

---

## Cache-Control

Common directives:

```http
Cache-Control: max-age=3600
```

```http
Cache-Control: no-cache
```

```http
Cache-Control: no-store
```

```http
Cache-Control: public, max-age=31536000, immutable
```

### Important distinction

`no-cache` does **not** mean "don't cache."

It generally means the cached response must be revalidated before reuse.

`no-store` means the response should not be stored.

---

# 2️⃣ In-Memory Cache

Data can be stored in JavaScript memory.

Example:

```js
const cache = new Map();

async function getUser(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();

  cache.set(id, user);

  return user;
}
```

Flow:

```text
getUser(101)
     ↓
Check Map
     ↓
 ┌───┴────┐
 │        │
 HIT     MISS
 │        │
 ▼        ▼
Data    API
          ↓
        Cache
```

### Advantages

* Very fast
* Simple
* No network request on cache hit

### Disadvantages

* Lost on page refresh
* Limited by available memory
* Doesn't automatically synchronize across tabs

---

# 3️⃣ LocalStorage / SessionStorage

Browser storage can persist data beyond a page refresh.

Example:

```js
localStorage.setItem(
  "user",
  JSON.stringify(user)
);
```

Read:

```js
const user = JSON.parse(
  localStorage.getItem("user")
);
```

### LocalStorage

Persists until explicitly removed.

### SessionStorage

Typically persists for the lifetime of the browser tab/session.

### Important

Do **not** treat browser storage as a secure place for sensitive credentials.

---

# 4️⃣ Service Worker Cache

Service Workers can intercept network requests and implement custom caching strategies.

Example architecture:

```text
Browser
   │
   ▼
Service Worker
   │
   ├──── Cache
   │
   └──── Network
```

This is particularly useful for:

* PWAs
* Offline applications
* Static assets
* Network resilience

---

# 5️⃣ CDN Cache

A CDN can cache static resources closer to users.

Example:

```text
                    Origin Server
                         │
                 ┌───────┴───────┐
                 │       │       │
                 ▼       ▼       ▼
               CDN     CDN     CDN
              India    Europe   USA
                 │
                 ▼
               User
```

Instead of every user requesting assets from the origin server, the CDN can serve cached content from a nearby edge location.

Common CDN-cached resources:

* Images
* JavaScript
* CSS
* Fonts
* Videos
* Static HTML

---

# 6️⃣ API / Data Caching

Frontend applications frequently cache API responses.

Libraries such as TanStack Query provide mechanisms for:

* Query caching
* Background refetching
* Stale data handling
* Request deduplication
* Cache invalidation

Conceptually:

```text
Component A ──┐
              │
              ▼
         Query Cache
              │
              ▼
            API
              ▲
              │
Component B ──┘
```

If both components need the same data, the application can avoid unnecessary duplicate requests.

---

# 🔄 Cache Hit vs Cache Miss

### Cache Hit

Data exists in the cache.

```text
Request
   ↓
Cache
   ↓
 HIT
   ↓
Return Data
```

### Cache Miss

Data isn't available.

```text
Request
   ↓
Cache
   ↓
 MISS
   ↓
API / Server
   ↓
Cache Data
   ↓
Return Data
```

---

# ⏳ TTL — Time To Live

TTL determines how long cached data should remain fresh.

Example:

```text
TTL = 60 seconds
```

```text
0s ─────────────── 60s
│                    │
Fresh                Expired
```

A short TTL is useful for frequently changing data.

A longer TTL can work well for data that changes rarely.

---

# 🔄 Cache Invalidation

One of the most important caching problems is:

> How do we know when cached data is outdated?

Common approaches:

### 1. TTL

Expire data after a fixed period.

```text
Cache → 60 seconds → Expire
```

### 2. Manual Invalidation

When data changes, remove or update the cache.

```js
cache.delete("user:101");
```

### 3. Versioning

Use versioned resources.

```text
app.v1.js
app.v2.js
```

### 4. Revalidation

Ask the server whether the cached resource is still valid.

---

# 🧩 Stale-While-Revalidate

A useful caching pattern is:

```text
Request
   ↓
Return stale cached data
   ↓
Background request
   ↓
Get latest data
   ↓
Update cache
```

This provides fast UI responses while keeping data relatively fresh.

Conceptually:

```text
             ┌───────────────┐
Request ────→│ Cached Data   │────→ UI
             └───────┬───────┘
                     │
                     ▼
               Background
                 Request
                     │
                     ▼
                Fresh Data
                     │
                     ▼
                  Cache
```

---

# ⚛️ Caching in React

React applications often have multiple caching layers.

```text
React Component
       │
       ▼
Application Cache
       │
       ▼
HTTP Cache
       │
       ▼
CDN
       │
       ▼
Backend
```

Examples of application-level caching tools:

* TanStack Query
* SWR
* Redux-based caching
* Custom caches

---

# ▲ Caching in Next.js

Next.js applications can involve caching at several levels.

Think about:

```text
Browser
   ↓
CDN
   ↓
Next.js
   ↓
Data/API
```

When designing a Next.js application, understand:

* Browser caching
* HTTP caching
* CDN caching
* Server-side caching
* Data caching
* Request memoization
* Static generation
* Revalidation

The exact behavior depends on the Next.js version and the API/rendering mechanism being used, so always verify the current framework behavior for production designs.

---

# ⚖️ Cache Trade-offs

Caching is not automatically beneficial.


| Benefit           | Trade-off                     |
| ----------------- | ----------------------------- |
| Faster response   | Potentially stale data        |
| Lower API traffic | Cache invalidation complexity |
| Lower server load | Additional memory/storage     |
| Better UX         | More complex architecture     |
| Lower bandwidth   | Consistency challenges        |

---

# 🎯 Interview Questions

### Beginner

* What is caching?
* Why do we use caching?
* What is a cache hit?
* What is a cache miss?
* What is TTL?
* What is HTTP caching?
* Difference between `no-cache` and `no-store`?

### Intermediate

* How would you cache API responses in React?
* How does browser caching work?
* When would you use localStorage?
* What is stale-while-revalidate?
* How would you invalidate cached data?
* How would you prevent duplicate API requests?

### Advanced

* Design a caching strategy for a large React application.
* How would you cache millions of API responses?
* How would you handle stale data?
* How would you design cache invalidation?
* How would CDN caching affect your architecture?
* How would you handle cache consistency across multiple clients?

---

# 🏗️ System Design Example

### Design a Product Listing Page

Requirements:

* Millions of users
* Product catalog changes periodically
* Fast page load
* Filtering and pagination
* High read traffic

Possible architecture:

```text
                    User
                      │
                      ▼
                   Browser
                      │
                Browser Cache
                      │
                      ▼
                    CDN
                      │
                      ▼
                Next.js App
                      │
                      ▼
                 API Layer
                      │
                ┌─────┴─────┐
                ▼           ▼
             Redis       Database
             Cache       MongoDB
```

Potential strategy:

```text
Static Assets
    ↓
Long-lived CDN caching

Product Data
    ↓
Redis / application caching

Frequently changing data
    ↓
Short TTL / revalidation

User-specific data
    ↓
Avoid shared caching unless safe
```

---

# 🧪 Hands-On Practice

Build a small React application that:

* Fetches products from an API
* Stores responses in a cache
* Displays cached data immediately
* Refetches stale data
* Shows cache HIT/MISS
* Implements TTL
* Allows manual cache invalidation

Example:

```text
Product Page
     │
     ▼
Check Cache
     │
 ┌───┴────┐
 │        │
 HIT     MISS
 │        │
 ▼        ▼
Show     API
Data      │
 │        ▼
 │      Cache
 │        │
 └────────┘
```

---

# 📝 My Learning Notes

### What I learned

* Caching reduces repeated work and network requests.
* Caching can happen at multiple layers.
* Cache invalidation is a major design concern.
* TTL controls freshness.
* Browser, CDN, application, and server caching solve different problems.

### Questions I still need to explore

* [ ]  HTTP cache validation
* [ ]  ETag vs Last-Modified
* [ ]  Cache-Control in depth
* [ ]  CDN cache invalidation
* [ ]  TanStack Query caching internals
* [ ]  Next.js caching internals
* [ ]  Redis caching patterns
* [ ]  Cache stampede
* [ ]  Cache penetration
* [ ]  Cache avalanche

---

# 🔗 Next Topics

```text
Caching
   │
   ├── HTTP Caching
   │
   ├── Browser Cache
   │
   ├── CDN
   │
   ├── Cache Invalidation
   │
   ├── Redis
   │
   ├── Request Deduplication
   │
   └── Stale-While-Revalidate
```

---

## 🧠 Key Takeaway

> **Caching is not simply storing data. Good caching is about deciding what to cache, where to cache it, how long to keep it, and how to maintain acceptable freshness and consistency.**
>
