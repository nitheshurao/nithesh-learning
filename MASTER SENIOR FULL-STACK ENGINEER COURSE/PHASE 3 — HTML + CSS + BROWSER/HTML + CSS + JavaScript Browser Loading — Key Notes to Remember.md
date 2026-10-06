# 🔥 HTML + CSS + JavaScript Browser Loading — Key Notes to Remember

These are the **core notes from our entire discussion**. For interviews, focus on the mental models and rules rather than memorizing every implementation detail.

---

## 1. Browser's Big Picture

When a browser loads a page:

```text
HTML
 ↓
HTML Parser
 ↓
DOM
```

```text
CSS
 ↓
CSS Parser
 ↓
CSSOM
```

Then:

```text
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

### Remember:

> **HTML → DOM, CSS → CSSOM, DOM + CSSOM → Render Tree → Layout → Paint → Composite**

---

# 2. DOM

HTML:

```html
<body>
    <h1>Hello</h1>
    <button>Click</button>
</body>
```

Browser creates:

```text
Document
 └── html
     └── body
         ├── h1
         └── button
```

This is the **DOM — Document Object Model**.

### Remember:

> DOM represents the structure and content of the HTML document.

JavaScript can modify it:

```javascript
document.querySelector("h1").textContent = "Hello JS";
```

---

# 3. CSSOM

CSS:

```css
h1 {
    color: blue;
}
```

Browser parses CSS and creates the **CSSOM**.

```text
CSS
 ↓
CSS Parser
 ↓
CSSOM
```

### Remember:

> CSSOM represents the browser's parsed CSS rules and styles.

---

# 4. Render Tree

Browser combines:

```text
DOM
 +
CSSOM
 ↓
Render Tree
```

The render tree contains what needs to be rendered.

For example:

```css
.hidden {
    display: none;
}
```

An element with:

```html
<div class="hidden">Hello</div>
```

is in the DOM but does not participate in the visual render tree.

### Remember:

> **DOM tells what exists. CSSOM tells how it should look. Render Tree determines what gets rendered.**

---

# 5. Layout

After creating the render tree:

```text
Render Tree
     ↓
Layout
```

The browser calculates:

```text
x
y
width
height
position
```

Example:

```css
.box {
    width: 200px;
    height: 100px;
}
```

The browser calculates where that box exists on the page.

### Remember:

> **Layout = calculate geometry.**

---

# 6. Paint

After layout:

```text
Layout
 ↓
Paint
```

Browser determines what pixels to draw:

```text
Text
Background
Border
Shadow
Images
```

### Remember:

> **Paint = draw pixels.**

---

# 7. Composite

Modern browsers can divide visual content into layers and combine them.

```text
Paint
 ↓
Composite
 ↓
Screen
```

### Remember:

> **Composite = combine rendered layers and display them.**

---

# 8. Is HTML synchronous?

HTML parsing happens sequentially.

```html
<h1>Hello</h1>
<div>Box</div>
<p>Text</p>
```

Conceptually:

```text
<h1>
 ↓
<div>
 ↓
<p>
```

But resources encountered during parsing can affect the process.

---

# 9. Normal JavaScript is Parser Blocking

```html
<script src="app.js"></script>
```

A classic script can stop HTML parsing.

```text
HTML Parser
     ↓
<script>
     ↓
STOP parsing
     ↓
Download JS
     ↓
Execute JS
     ↓
Resume HTML parsing
```

### Remember:

> **Normal `<script>` = parser blocking.**

This is one of the most important interview points.

---

# 10. Why does JavaScript block HTML parsing?

Because JavaScript can modify the document.

For example:

```javascript
document.body.appendChild(...);
```

or:

```javascript
document.querySelector("h1").textContent = "Changed";
```

or historically:

```javascript
document.write("Hello");
```

Therefore, the browser cannot simply assume the HTML structure will remain unchanged.

---

# 11. CSS Is Generally Render Blocking

```html
<link rel="stylesheet" href="style.css">
```

The browser downloads CSS and builds the CSSOM.

```text
HTML
 ↓
CSS discovered
 ↓
Download CSS
 ↓
CSSOM
 ↓
Rendering can proceed
```

### Important:

Don't say:

> "CSS always blocks HTML parsing."

Instead say:

> **CSS is generally render-blocking, while HTML parsing can continue in many cases.**

---

# 12. CSS Can Affect JavaScript Execution

This is a common interview trick.

Suppose:

```html
<link rel="stylesheet" href="style.css">

<script src="app.js"></script>
```

The browser discovers CSS first.

Then it reaches the classic script.

Because JavaScript can request style information:

```javascript
getComputedStyle(element);
```

the browser can wait for already-discovered blocking stylesheets before executing the classic script.

Conceptually:

```text
CSS download
     ↓
CSS ready
     ↓
Execute classic JS
```

### Interview wording:

> **A stylesheet discovered before a classic script can delay that script's execution.**

Don't say:

> "CSS always blocks JS."

---

# 13. `async`

```html
<script async src="app.js"></script>
```

The browser downloads JS while HTML parsing continues.

```text
HTML parsing ─────────────────→
       │
       └── JS downloading
                ↓
            JS ready
                ↓
          Execute JS
```

### Key rule:

> **Async executes as soon as the script is downloaded.**

It does NOT wait for HTML parsing to finish.

---

# 14. `async` Execution Order Is NOT Guaranteed

```html
<script async src="a.js"></script>
<script async src="b.js"></script>
```

You cannot assume:

```text
a.js
 ↓
b.js
```

It could be:

```text
b.js
 ↓
a.js
```

because execution depends on which resource finishes downloading first.

### Remember:

> **async = independent scripts + execution as soon as ready**

Good examples:

```text
Analytics
Ads
Independent third-party scripts
```

---

# 15. `defer`

```html
<script defer src="app.js"></script>
```

The browser downloads JS while HTML parsing continues.

But execution waits until HTML parsing is complete.

```text
HTML parsing ───────────────→ Complete
       │
       └── JS downloading
                  ↓
             Execute JS
```

### Remember:

> **defer = download now, execute after HTML parsing.**

---

# 16. `defer` Preserves Order

```html
<script defer src="a.js"></script>
<script defer src="b.js"></script>
```

Execution order:

```text
a.js
 ↓
b.js
```

Even if `b.js` downloads first.

### Remember:

> **defer = ordered execution.**

---

# 17. `async` vs \`defer

This is extremely important.


| Feature      | Normal          | async                     | defer              |
| ------------ | --------------- | ------------------------- | ------------------ |
| Download     | Blocks parser   | Parallel                  | Parallel           |
| HTML parsing | Paused          | Continues until execution | Continues          |
| Execution    | Immediately     | As soon as downloaded     | After HTML parsing |
| Order        | Document order  | ❌ Not guaranteed         | ✅ Preserved       |
| DOM ready?   | Not necessarily | Not necessarily           | Yes, HTML parsed   |

### Memorize:

```text
normal
→ Download → Execute → Continue parsing

async
→ Download parallel → Execute immediately

defer
→ Download parallel → HTML complete → Execute
```

---

# 18. Your Four Examples

## Case 1

```html
<link rel="stylesheet" href="style.css">
<script defer src="app.js"></script>
```

Browser:

```text
Discover CSS
     ↓
CSS download

Discover JS
     ↓
JS download in parallel

HTML parsing continues
     ↓
HTML complete
     ↓
defer JS executes
```

### Key:

> `defer` does not execute immediately.

---

# 19. Case 2

```html
<script defer src="app.js"></script>
<link rel="stylesheet" href="style.css">
```

Browser:

```text
Discover JS
 ↓
JS download

Discover CSS
 ↓
CSS download

HTML parsing continues
 ↓
HTML complete
 ↓
defer JS executes
```

### Key:

The fact that `script` appears before CSS doesn't make `defer` behave like a normal script.

> **`defer` controls JS execution timing.**

---

# 20. Case 3

```html
<link rel="stylesheet" href="style.css">
<script async src="app.js"></script>
```

Browser:

```text
Discover CSS
 ↓
CSS download

Discover async JS
 ↓
JS download

HTML parsing continues
 ↓
If JS finishes
 ↓
JS executes
```

### Key:

> `async` does not wait for HTML parsing to complete.

Its exact timing depends on resource loading and browser scheduling.

---

# 21. Case 4

```html
<script async src="app.js"></script>
<link rel="stylesheet" href="style.css">
```

Browser:

```text
Discover async JS
 ↓
JS download starts

Discover CSS
 ↓
CSS download starts

HTML continues parsing

If JS becomes ready
 ↓
Execute JS
```

The JS can execute before HTML parsing completes.

### Key:

> With `async`, resource order in HTML does not guarantee execution order relative to other resources.

---

# 22. `async` Is Timing-Dependent

This is important.

Suppose:

```text
app.js = 50 KB
style.css = 500 KB
```

JS might finish first.

But if:

```text
app.js = 2 MB
style.css = 20 KB
```

CSS may finish first.

Therefore don't say:

> "CSS always loads first because it is above JS."

Instead:

> **The browser discovers resources in document order, but downloads can happen concurrently, and async script execution depends on when the script becomes available.**

---

# 23. JavaScript Can Modify DOM

```javascript
const title = document.querySelector("h1");

title.textContent = "New Title";
```

Potentially:

```text
JS
 ↓
DOM mutation
 ↓
Style recalculation
 ↓
Layout
 ↓
Paint
```

If the change affects geometry:

```javascript
element.style.width = "500px";
```

it may trigger layout.

---

# 24. Reflow / Layout

If JavaScript changes geometry:

```javascript
element.style.width = "500px";
```

the browser may need to recalculate layout.

```text
DOM/CSS change
 ↓
Style recalculation
 ↓
Layout
 ↓
Paint
```

This is commonly called:

> **Reflow**

Modern browser terminology often uses **layout**.

---

# 25. Repaint

If only visual properties change:

```javascript
element.style.color = "red";
```

the browser may only need to repaint affected pixels.

```text
Style change
 ↓
Paint
```

Conceptually:

> **Repaint = redraw pixels.**

---

# 26. JavaScript Can Block the Main Thread

Consider:

```javascript
for (let i = 0; i < 10000000000; i++) {
}
```

The JavaScript runs on the main thread and occupies it.

While this is happening, browser work such as rendering and event handling can be delayed.

```text
Main Thread

JavaScript
████████████████████████████
```

### Remember:

> **Long-running JavaScript can block the main thread and make the UI unresponsive.**

---

# 27. Async JavaScript Does NOT Mean Parallel JavaScript

Example:

```javascript
setTimeout(() => {
    console.log("B");
}, 0);

console.log("A");
```

Output:

```text
A
B
```

Because:

```text
setTimeout
 ↓
Browser timer
 ↓
Task queue
 ↓
Event loop
 ↓
Call stack available
 ↓
Callback executes
```

### Remember:

> **Async means the operation can be scheduled without blocking the current execution flow; it does not automatically mean another JavaScript thread is running.**

---

# 28. Event Loop

Basic model:

```text
          JavaScript
             ↓
         Call Stack
             ↓
       Web APIs / Browser
             ↓
        Task Queue
             ↓
         Event Loop
             ↓
         Call Stack
```

Example:

```javascript
console.log("A");

setTimeout(() => {
    console.log("B");
}, 0);

console.log("C");
```

Output:

```text
A
C
B
```

---

# 29. Critical Rendering Path

The browser's important rendering process can be remembered as:

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
```

### Interview phrase:

> **The critical rendering path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript resources into pixels on the screen.**

---

# 30. Most Important Interview Distinctions

### HTML

```text
HTML → DOM
```

### CSS

```text
CSS → CSSOM
```

### JavaScript

```text
JS → Can modify DOM/CSSOM
```

### Rendering

```text
DOM + CSSOM
     ↓
Render Tree
     ↓
Layout
     ↓
Paint
     ↓
Composite
```

### Script types

```text
Normal → blocks parser

async → executes when downloaded

defer → executes after HTML parsing
```

---

# 🔥 31. The 10 Things You MUST Remember

If the interviewer asks you about this topic, remember these **10 statements**:

1. **HTML parsing creates the DOM.**
2. **CSS parsing creates the CSSOM.**
3. **CSS is generally render-blocking.**
4. **A classic JavaScript script is parser-blocking.**
5. **A stylesheet discovered before a classic script can delay that script's execution.**
6. **`async` downloads in parallel and executes as soon as it is ready.**
7. **`async` execution order is not guaranteed.**
8. **`defer` downloads in parallel but executes after HTML parsing.**
9. **Deferred scripts execute in document order.**
10. **DOM + CSSOM → Render Tree → Layout → Paint → Composite.**

---

# 🧠 Final Mental Model

If you remember only one diagram, remember this:

```text
                 BROWSER
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
       HTML         CSS         JS
        │           │           │
        ↓           ↓           │
       DOM         CSSOM        │
        │           │           │
        └──────┬────┘           │
               ↓                │
          Render Tree           │
               ↓                │
             Layout             │
               ↓                │
             Paint              │
               ↓                │
           Composite            │
               ↓                │
             SCREEN             │
                                │
                    JS can modify
                    DOM / styles
                         ↓
                  Recalculate
                         ↓
                  Layout/Paint
```

And for scripts:

```text
┌──────────┬────────────────────────────────┐
│ Normal   │ Parser → STOP → JS → Continue │
├──────────┼────────────────────────────────┤
│ async    │ Download → Execute when ready │
├──────────┼────────────────────────────────┤
│ defer    │ Download → HTML complete → JS │
└──────────┴────────────────────────────────┘
```

**This is the core browser-loading mental model you should be able to explain without memorizing a long answer.**
