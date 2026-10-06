Yes. If your goal is **FAANG-level frontend/browser knowledge**, don’t study this as a list of APIs. Study the **execution model**: what the browser receives, parses, executes, renders, stores, and sends over the network.

# Browser & Web — FAANG-Level Roadmap

### 1. Browser Architecture

Understand the major components and how they interact:

```text
User
 ↓
Browser
 ├── Browser Process
 ├── Renderer Process
 │    ├── JavaScript Engine
 │    ├── DOM
 │    ├── CSSOM
 │    ├── Layout
 │    └── Paint / Composite
 ├── Network Process
 └── GPU Process
```

You should be able to explain:

* Browser process vs renderer process
* Multi-process architecture
* Same-origin isolation
* Main thread
* Compositor thread
* GPU process
* JavaScript engine
* Event loop
* Rendering pipeline

---

# 2. DOM — Go Beyond `querySelector`

Learn:

```text
HTML
 ↓
HTML Parser
 ↓
DOM Tree
```

### Core topics

* DOM tree
* Nodes vs elements
* `Document`
* `Element`
* `Node`
* `DocumentFragment`
* DOM traversal
* Live vs static collections
* Event listeners
* Event propagation
* MutationObserver
* IntersectionObserver
* ResizeObserver

### Interview depth

Know exactly what happens here:

```js
button.addEventListener("click", handler);
```

And explain:

```text
User click
 ↓
Browser detects event
 ↓
Event dispatched
 ↓
Capture phase
 ↓
Target phase
 ↓
Bubble phase
 ↓
JavaScript handler
```

---

# 3. Event System

This is extremely important for frontend interviews.

Master:

### Event propagation

```text
window
  ↓
document
  ↓
html
  ↓
body
  ↓
parent
  ↓
button
```

Understand:

* Capturing
* Target phase
* Bubbling
* `stopPropagation()`
* `stopImmediatePropagation()`
* `preventDefault()`

### Event delegation

```js
list.addEventListener("click", (event) => {
  if (event.target.matches("button")) {
    // ...
  }
});
```

Understand **why event delegation works** and when it is useful.

---

# 4. Rendering Pipeline

This is one of the most important FAANG-level areas.

Learn this deeply:

```text
HTML
 ↓
DOM

CSS
 ↓
CSSOM

DOM + CSSOM
 ↓
Render Tree
 ↓
Layout
 ↓
Paint
 ↓
Composite
 ↓
Screen
```

Understand:

### Layout

Calculates:

```text
x
y
width
height
```

### Paint

Draws:

```text
text
colors
borders
shadows
images
```

### Composite

Combines layers.

---

# 5. Reflow vs Repaint

Know the difference.

### Reflow / Layout

Changing:

```js
element.style.width = "500px";
```

may require layout recalculation.

### Repaint

Changing:

```js
element.style.color = "red";
```

may require repaint without layout.

### Composite-only

Some transformations can be handled efficiently by the compositor:

```css
transform: translateX(100px);
```

and:

```css
opacity: 0.5;
```

You should understand **why** this can improve animation performance.

---

# 6. JavaScript + Browser Event Loop

This should be mastered rather than memorized.

Understand:

```text
Call Stack
     ↓
Web APIs
     ↓
Task Queue
     ↓
Microtask Queue
     ↓
Event Loop
     ↓
Rendering
```

Example:

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

You should immediately know:

```text
A
D
C
B
```

But FAANG-level understanding goes further:

**Where does rendering happen relative to tasks and microtasks?**

**What happens if microtasks continuously schedule more microtasks?**

**Why can JavaScript block rendering?**

**Why does a long synchronous function cause jank?**

---

# 7. Browser Storage

Master the differences between:


| Storage        | Typical use                                      |
| -------------- | ------------------------------------------------ |
| Cookies        | Server/client state, authentication-related data |
| localStorage   | Persistent client-side key/value data            |
| sessionStorage | Per-tab session data                             |
| IndexedDB      | Large structured client-side storage             |
| Cache API      | Request/response caching                         |

Understand:

```text
Cookie
 ↓
HTTP request
 ↓
Server
```

versus:

```text
localStorage
 ↓
JavaScript
```

Also learn:

* Storage limits
* Same-origin behavior
* Cookie attributes
* `HttpOnly`
* `Secure`
* `SameSite`
* Session cookies
* Persistent cookies

---

# 8. HTTP — Frontend Engineer Must Know This

Don't stop at:

```text
GET
POST
PUT
DELETE
```

Learn:

### Request

```text
Method
URL
Headers
Cookies
Body
```

### Response

```text
Status
Headers
Cookies
Body
```

Master:

* HTTP/1.1
* HTTP/2
* HTTP/3
* TLS
* HTTPS
* Keep-alive
* Connection reuse
* Compression
* Streaming
* Chunked transfer
* Cache-Control
* ETag
* Last-Modified
* Conditional requests

---

# 9. HTTP Caching

Very important for performance.

Understand:

```text
Browser Cache
      ↓
Fresh?
 ┌────┴────┐
Yes       No
 ↓         ↓
Use       Request
cache
```

Learn:

```http
Cache-Control
ETag
Last-Modified
Expires
```

Example:

```http
Cache-Control: max-age=3600
```

And understand:

```text
Cache hit
Cache miss
304 Not Modified
200 from cache
200 from network
```

---

# 10. CORS

Don't memorize:

> CORS means Cross-Origin Resource Sharing.

Understand the actual browser security model.

Learn:

```text
Origin =
scheme + host + port
```

Example:

```text
https://example.com
```

and:

```text
https://api.example.com
```

are different origins.

Master:

* Same-Origin Policy
* Simple requests
* Preflight
* `OPTIONS`
* `Access-Control-Allow-Origin`
* `Access-Control-Allow-Methods`
* `Access-Control-Allow-Headers`
* Credentials
* Cookies + CORS
* Why Postman can work while browser requests fail

---

# 11. Browser Security

For FAANG-level frontend, this is mandatory.

Master:

### XSS

```text
Attacker
 ↓
Malicious JavaScript
 ↓
Victim browser
```

Understand:

* Reflected XSS
* Stored XSS
* DOM XSS
* Output encoding
* Content Security Policy

### CSRF

Understand:

```text
Victim browser
      ↓
Authenticated request
      ↓
Attacker-controlled site
      ↓
Your server
```

Learn:

* CSRF tokens
* SameSite cookies
* Origin/Referer validation

Also understand:

* Clickjacking
* CSP
* HTTPS
* Secure cookies
* HttpOnly cookies

---

# 12. Networking

Understand what happens when you enter:

```text
https://google.com
```

into the browser.

FAANG-level flow:

```text
URL
 ↓
DNS
 ↓
IP address
 ↓
TCP / QUIC
 ↓
TLS
 ↓
HTTP
 ↓
Server
 ↓
Response
 ↓
HTML
 ↓
Parsing
 ↓
Rendering
```

You should be able to explain:

### DNS

```text
Domain
 ↓
DNS resolver
 ↓
IP
```

### TCP

Understand:

* 3-way handshake
* Connection
* Reliability
* Congestion control

### TLS

Understand conceptually:

```text
Client
 ↓
TLS handshake
 ↓
Certificate verification
 ↓
Session keys
 ↓
Encrypted HTTP
```

---

# 13. Critical Rendering Path

This is where browser knowledge connects directly to frontend performance.

Learn:

```text
HTML
 ↓
DOM
CSS
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

Understand how these affect performance:

```html
<script>
```

vs

```html
<script defer>
```

vs

```html
<script async>
```

And:

```html
<link rel="preload">
<link rel="preconnect">
```

---

# 14. Browser Performance

Master the concepts behind:

```text
FCP
LCP
CLS
INP
TTFB
```

Understand:

### Main-thread blocking

```text
Long JS
   ↓
Main thread blocked
   ↓
Rendering delayed
   ↓
Interaction delayed
   ↓
Poor UX
```

Learn:

* Code splitting
* Lazy loading
* Tree shaking
* Dynamic imports
* Resource hints
* Image optimization
* Web Workers
* Service Workers
* Virtualization
* Debouncing
* Throttling

---

# 15. Web Workers

Understand why this:

```js
while (true) {
  // expensive calculation
}
```

can freeze the UI.

Then:

```text
Main Thread
     │
     │ postMessage()
     ↓
Worker
     │
     │ postMessage()
     ↓
Main Thread
```

Learn:

* Dedicated Worker
* Shared Worker
* Worker communication
* Structured cloning
* Transferable objects
* When workers are useful

---

# 16. Service Workers

Understand the architecture:

```text
Browser
   ↓
Service Worker
   ↓
Network
```

Learn:

* Registration
* Installation
* Activation
* Fetch interception
* Cache API
* Offline applications
* Background capabilities
* PWA architecture

---

# 17. Browser APIs

Know the important ones rather than trying to memorize every API.

### Observation

```text
MutationObserver
IntersectionObserver
ResizeObserver
```

### Storage

```text
IndexedDB
Cache API
Web Storage
Cookies
```

### Performance

```text
Performance API
PerformanceObserver
requestAnimationFrame
requestIdleCallback
```

### Communication

```text
WebSocket
Server-Sent Events
WebRTC
BroadcastChannel
postMessage
```

---

# 18. WebSockets

Understand:

```text
HTTP
 ↓
Upgrade
 ↓
WebSocket
 ↓
Persistent connection
 ↕
Client ↔ Server
```

Compare:

```text
HTTP polling
Long polling
SSE
WebSocket
```

Know when each architecture makes sense.

---

# 19. Browser Tabs & Cross-Window Communication

Learn:

```js
window.postMessage()
```

and:

```text
Tab A
  ↓
BroadcastChannel
  ↓
Tab B
```

Understand:

* Same-origin restrictions
* `postMessage`
* BroadcastChannel
* opener relationships
* iframe communication

---

# 20. Browser Storage + Authentication

This is a very common interview area.

Understand the tradeoffs between:

```text
JWT in localStorage
```

and:

```text
HttpOnly Secure Cookie
```

You should be able to discuss:

```text
XSS
CSRF
Token expiration
Refresh tokens
SameSite
CORS
```

without simply saying one approach is universally correct.

---

# FAANG-Level Mental Model

Ultimately, you should be able to trace this:

```text
User enters URL
        ↓
DNS
        ↓
TCP / QUIC
        ↓
TLS
        ↓
HTTP request
        ↓
Server
        ↓
HTTP response
        ↓
HTML parser
        ↓
DOM
        +
CSS parser
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
        ↓
Screen
```

Then:

```text
User clicks button
        ↓
Browser event system
        ↓
Event propagation
        ↓
JS handler
        ↓
State / DOM mutation
        ↓
Style calculation
        ↓
Layout
        ↓
Paint
        ↓
Composite
        ↓
Screen
```

And simultaneously:

```text
JavaScript
    ↓
Call Stack
    ↓
Web APIs
    ↓
Task / Microtask queues
    ↓
Event Loop
    ↓
Rendering
```

## Your interview target

Don't aim to memorize **DOM + HTTP + CORS + storage** separately.

Aim to answer questions like:

> **"What exactly happens from clicking a link until the new page becomes interactive?"**

> **"Why can JavaScript block rendering?"**

> **"Why does a CORS request trigger an OPTIONS request?"**

> **"Why can `transform` be cheaper than changing `top`?"**

> **"Why does a Promise callback execute before `setTimeout(..., 0)`?"**

> **"Why can an HttpOnly cookie not be read by JavaScript?"**

> **"How would you diagnose a page with poor LCP?"**

> **"What happens when you type `https://example.com` into the address bar?"**

If you can explain those **from first principles**, you're approaching the browser knowledge expected in strong frontend/system-design interviews.
