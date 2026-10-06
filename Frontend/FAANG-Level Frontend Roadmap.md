With **5+ years of React.js + Next.js experience**, you should prepare beyond framework APIs. For FAANG-level frontend interviews, the target is:

> **JavaScript depth → Browser internals → React internals → Next.js architecture → Performance → Web security → Frontend system design → Testing → Accessibility → DSA/problem solving**

Here is the complete roadmap I recommend.

# ****🔥 FAANG-Level Frontend Roadmap — 5+ YOE

## 1. JavaScript — Advanced

You should be able to explain these **without memorization**.

### Core

* Execution Context
* Call Stack
* Scope & Lexical Environment
* Closures
* Hoisting
* `var` / `let` / `const`
* Temporal Dead Zone
* `this`
* `call` / `apply` / `bind`
* Prototype chain
* Prototypal inheritance
* Classes
* `new` keyword

### Async JavaScript

* Event Loop
* Microtask Queue
* Macrotask Queue
* Promise internals
* `async/await`
* Promise chaining
* `Promise.all`
* `Promise.allSettled`
* `Promise.race`
* `Promise.any`
* Error propagation
* Cancellation / `AbortController`

### Functional JavaScript

* First-class functions
* Higher-order functions
* Pure functions
* Immutability
* Function composition
* Currying
* Memoization
* Debouncing
* Throttling

### Advanced

* Iterators
* Generators
* Symbols
* WeakMap / WeakSet
* Proxy / Reflect
* ES Modules
* CommonJS
* Tree shaking
* Garbage collection
* Memory leaks

---

# 2. Browser Internals ⭐⭐⭐

This is where many 5+ YOE candidates are weak.

Understand:

```text
Browser
   ↓
URL
   ↓
DNS
   ↓
TCP
   ↓
TLS
   ↓
HTTP
   ↓
HTML parsing
   ↓
DOM
   ↓
CSSOM
   ↓
Render Tree
   ↓
Layout
   ↓
Paint
   ↓
Composite
```

### Must know

* DOM
* CSSOM
* Render tree
* Layout/Reflow
* Paint
* Composite
* Critical Rendering Path
* Browser rendering pipeline
* `requestAnimationFrame`
* `requestIdleCallback`
* Web Workers
* Service Workers
* Web APIs
* Storage APIs

### Networking

* HTTP/1.1
* HTTP/2
* HTTP/3
* HTTPS
* TCP
* UDP
* QUIC
* DNS
* CDN
* Compression
* Brotli
* Gzip
* Caching
* ETags
* Cache-Control

---

# 3. React — Deep Dive ⭐⭐⭐

Don't stop at hooks.

## Fundamentals

* Virtual DOM
* Reconciliation
* Diffing
* Fiber
* Rendering
* Commit phase
* Render phase
* Component lifecycle

## Hooks

Deeply understand:

* `useState`
* `useEffect`
* `useLayoutEffect`
* `useMemo`
* `useCallback`
* `useRef`
* `useReducer`
* `useContext`
* `useImperativeHandle`
* Custom Hooks

You should be able to answer:

> Why does this component render?

and

> Why did this component render?

---

# 4. React Performance ⭐⭐⭐

Master:

* React.memo
* `useMemo`
* `useCallback`
* Component splitting
* Lazy loading
* Code splitting
* Dynamic imports
* Virtualization
* Windowing
* Avoiding unnecessary renders
* State colocation
* Derived state
* Context performance
* Selector patterns

### Advanced

* React Profiler
* React DevTools
* Concurrent rendering
* Transitions
* `useTransition`
* `useDeferredValue`
* Suspense
* Error Boundaries
* Streaming
* Server Components

---

# 5. React Server Components ⭐⭐⭐

For modern Next.js interviews this is important.

Understand:

```text
Server Component
       ↓
Server
       ↓
RSC Payload
       ↓
Client Component
       ↓
Browser
```

Know:

* Server Components
* Client Components
* `"use client"`
* `"use server"`
* RSC payload
* Server Actions
* Hydration
* Partial hydration concepts
* Streaming
* Suspense boundaries
* Client/server boundary

Be able to explain:

> Why shouldn't everything be a Client Component?

---

# 6. Next.js — Advanced ⭐⭐⭐

For 5+ YOE, know the framework architecture.

## App Router

* App Router
* Layouts
* Pages
* Route Groups
* Dynamic Routes
* Parallel Routes
* Intercepting Routes
* Middleware
* Route Handlers

## Rendering

Master the differences between:

* CSR
* SSR
* SSG
* ISR
* Streaming
* Server Components

And understand:

```text
Request
  ↓
Server
  ↓
Data fetching
  ↓
RSC
  ↓
Streaming
  ↓
Browser
  ↓
Hydration
```

---

# 7. Next.js Data & Cache Architecture ⭐⭐⭐

Very important.

Understand:

* Request memoization
* Data cache
* Full Route Cache
* Router Cache
* Revalidation
* `revalidate`
* Cache invalidation
* `revalidatePath`
* `revalidateTag`
* Dynamic rendering
* Static rendering

You should be able to design:

> E-commerce product page with 1M products.

---

# 8. State Management

Know when to use:

### Local

```text
useState
useReducer
```

### Shared

```text
Context
Redux
Zustand
```

### Server state

```text
React Query
SWR
```

Understand:

* Client state
* Server state
* URL state
* Form state
* Global state
* Derived state

A common interview question:

> Why shouldn't you put everything in Redux?

---

# 9. TypeScript — Advanced

For senior frontend interviews:

* Generics
* Union types
* Intersection types
* Conditional types
* Mapped types
* Utility types
* `keyof`
* `typeof`
* `infer`
* Type narrowing
* Discriminated unions
* Type guards
* Function overloads
* Template literal types
* `unknown`
* `never`
* Declaration files
* Type-safe APIs

Example:

```ts
type ApiResponse<T> = {
  data: T;
  error?: string;
};
```

You should understand why and when to use these patterns.

---

# 10. Frontend System Design ⭐⭐⭐⭐⭐

This should become one of your **highest priorities**.

Practice designing:

### Applications

* Netflix
* YouTube
* Instagram
* LinkedIn
* Amazon
* Google Search
* Google Docs
* Uber
* Airbnb
* Twitter/X
* WhatsApp Web

### Frontend-specific systems

* Autocomplete
* Infinite scrolling
* News feed
* Chat application
* Notification system
* File upload
* Image gallery
* Video player
* Rich text editor
* Dashboard
* Analytics platform
* Design system

For every system cover:

```text
Requirements
     ↓
Architecture
     ↓
Components
     ↓
State
     ↓
API
     ↓
Data flow
     ↓
Caching
     ↓
Performance
     ↓
Security
     ↓
Accessibility
     ↓
Testing
     ↓
Scalability
```

---

# 11. Frontend Architecture ⭐⭐⭐⭐

Learn:

* Component architecture
* Feature-based architecture
* Atomic design
* Design systems
* Micro-frontends
* Module Federation
* Monorepos
* Turborepo
* Nx
* Shared components
* Dependency management

Understand tradeoffs between:

```text
Monolith
vs
Microfrontend
```

---

# 12. Web Performance ⭐⭐⭐⭐⭐

Know Core Web Vitals:

* LCP
* INP
* CLS

Also:

* TTFB
* FCP
* TBT
* Resource loading
* Preload
* Prefetch
* Preconnect
* Lazy loading
* Image optimization
* Font optimization
* Bundle optimization
* Tree shaking
* Code splitting
* CDN
* Caching

Be able to investigate:

> "The homepage takes 5 seconds to become interactive. How do you debug it?"

---

# 13. Web Security ⭐⭐⭐⭐⭐

Very important for senior engineers.

Learn:

* XSS
* CSRF
* CORS
* CSP
* Clickjacking
* SQL Injection
* JWT
* OAuth 2.0
* OpenID Connect
* PKCE
* Same-Origin Policy
* SameSite cookies
* Secure cookies
* HttpOnly
* Access token
* Refresh token
* Session management
* Authentication vs Authorization

Be able to design:

> Secure authentication architecture for a Next.js application.

---

# 14. Accessibility ⭐⭐⭐

Don't skip this.

Learn:

* WCAG
* Semantic HTML
* ARIA
* Keyboard navigation
* Focus management
* Screen readers
* Color contrast
* Accessible forms
* Accessible modals
* Accessible dropdowns
* Accessibility testing

---

# 15. Testing ⭐⭐⭐⭐

### Unit

* Jest
* Vitest

### Component

* React Testing Library

### E2E

* Playwright
* Cypress

Understand:

```text
Unit
 ↓
Component
 ↓
Integration
 ↓
E2E
```

Also learn:

* Mocking
* MSW
* Test isolation
* Snapshot testing
* Visual regression testing

---

# 16. CSS — Senior Level

Don't just know Tailwind.

Master:

* CSS cascade
* Specificity
* Box model
* Positioning
* Flexbox
* Grid
* Stacking contexts
* `z-index`
* Responsive design
* Container queries
* CSS variables
* Animations
* Transitions
* Accessibility
* Responsive architecture

Also:

* CSS-in-JS
* Tailwind
* CSS Modules
* Styled Components

Understand their tradeoffs.

---

# 17. HTML — Deep Understanding

Know:

* Semantic HTML
* Forms
* Accessibility
* Browser parsing
* DOM
* `async`
* `defer`
* preload
* prefetch
* resource hints
* metadata
* SEO
* structured data

---

# 18. API & Data Layer

Master:

### REST

* HTTP methods
* Status codes
* Idempotency
* Pagination
* Filtering
* Sorting
* Versioning
* Rate limiting

### GraphQL

* Queries
* Mutations
* Subscriptions
* Fragments
* Caching
* N+1
* Apollo

### Real-time

* WebSockets
* SSE
* Long polling

---

# 19. Distributed Frontend Concepts ⭐⭐⭐⭐

Understand:

* CDN
* Edge computing
* Distributed caching
* Load balancing
* Rate limiting
* Event-driven architecture
* Message queues
* WebSockets
* Pub/Sub
* CAP theorem
* Consistency
* Availability

You don't need to become a backend engineer, but you need to understand how your frontend interacts with distributed systems.

---

# 20. DSA for Frontend Interviews ⭐⭐⭐⭐

Don't neglect DSA.

### Must master

```text
Arrays
Strings
HashMap
Set
Two Pointers
Sliding Window
Stack
Queue
Binary Search
Linked List
Trees
Graphs
Heap
Recursion
Backtracking
Dynamic Programming
Intervals
Prefix Sum
```

### Target

For 5+ YOE:

**100–150 high-quality problems** > solving 500 randomly.

Focus heavily on:

* Arrays
* Strings
* HashMap
* Sliding Window
* Two Pointers
* Stack
* Binary Search
* Trees
* Graphs
* Intervals

---

# 21. Frontend Coding Questions ⭐⭐⭐⭐⭐

Practice implementing:

### Utilities

```text
debounce()
throttle()
deepClone()
deepEqual()
memoize()
once()
curry()
compose()
pipe()
```

### React

```text
useDebounce()
usePrevious()
useFetch()
useLocalStorage()
useInfiniteScroll()
useClickOutside()
useIntersectionObserver()
```

### Components

Build from scratch:

* Modal
* Dropdown
* Tooltip
* Tabs
* Accordion
* Carousel
* Autocomplete
* Pagination
* Infinite scroll
* Data table
* File uploader
* Toast system
* Date picker
* Virtualized list

---

# 22. Machine Coding ⭐⭐⭐⭐⭐

This is extremely important for senior frontend interviews.

Practice building:

### Level 1

* Todo
* Counter
* Tabs
* Accordion
* Modal

### Level 2

* Autocomplete
* Pagination
* Infinite scrolling
* Data table
* File upload

### Level 3

* Kanban board
* Chat application
* Notification center
* Rich text editor
* Spreadsheet
* Dashboard

### Level 4

Build a complete:

> **Google Docs / Notion / Trello / Slack-style application**

with:

* scalable component architecture
* state management
* API integration
* optimistic updates
* error handling
* loading states
* accessibility
* testing
* performance

---

# 23. Git & Engineering Practices

Senior-level expectations:

* Git branching
* Rebase
* Merge
* Cherry-pick
* Bisect
* Conventional commits
* CI/CD
* Code review
* Feature flags
* Environment management
* Semantic versioning

---

# 24. DevOps Knowledge for Frontend

Because you're using Next.js, learn:

```text
Frontend
   ↓
Docker
   ↓
CI/CD
   ↓
AWS
   ↓
CDN
   ↓
Load Balancer
   ↓
Next.js server
```

Know:

* Docker
* Kubernetes basics
* AWS
* CloudFront
* S3
* Load Balancer
* ECS/EKS basics
* CI/CD
* Environment variables
* Secrets
* Observability

---

# 🎯 Your Priority Order

Don't study everything equally.

For **your 5+ YOE React/Next.js profile**, I'd prioritize:


| Priority | Area                   |
| -------- | ---------------------- |
| 🔴 P0    | JavaScript Advanced    |
| 🔴 P0    | React Internals        |
| 🔴 P0    | Frontend System Design |
| 🔴 P0    | Next.js Architecture   |
| 🔴 P0    | Performance            |
| 🔴 P0    | Machine Coding         |
| 🔴 P0    | DSA                    |
| 🔴 P0    | Browser Internals      |
| 🟠 P1    | TypeScript             |
| 🟠 P1    | Web Security           |
| 🟠 P1    | State Management       |
| 🟠 P1    | Networking             |
| 🟠 P1    | Testing                |
| 🟠 P1    | CSS                    |
| 🟡 P2    | Accessibility          |
| 🟡 P2    | Micro-frontends        |
| 🟡 P2    | DevOps                 |
| 🟡 P2    | GraphQL                |

## The actual FAANG-level target

You should eventually be comfortable answering questions like:

> **"Design the frontend architecture for an Instagram feed serving 100M users."**

Then:

> "How would you handle infinite scrolling?"

> "How do you prevent unnecessary React renders?"

> "How would you cache the feed?"

> "What happens when the network fails?"

> "How would you implement optimistic updates?"

> "How would you make it accessible?"

> "How would you monitor performance?"

> "How would you handle XSS?"

> "SSR, RSC or CSR — which parts would you choose and why?"

> "How would you test it?"

That combination of **deep fundamentals + React/Next.js internals + machine coding + system design + performance + DSA** is the level I'd target for your experience.

If you want, I can turn this into a **12-week / 4-hours-per-day FAANG Frontend Mastery curriculum**, with **daily topics + theory + coding problems + machine-coding tasks + system-design problems + interview questions**.
