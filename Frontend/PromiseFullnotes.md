# JavaScript Promises — Complete Notes + Coding Revision

For interviews, don't memorize `Promise` as just `.then()/.catch()`. Learn the **Promise state machine + chaining + microtask behavior + implementation**. That lets you solve most Promise coding questions.

---

# 1. Promise — Core Mental Model

```
Promise = object representing a future result

             Promise
                │
       ┌────────┴────────┐
       ↓                 ↓
   SUCCESS            FAILURE
  fulfilled           rejected
       │                 │
     value              error
```

A Promise has **3 states**:

```
PENDING
   │
   ├── resolve(value) ──→ FULFILLED
   │
   └── reject(error) ───→ REJECTED
```

### Important

```
pending → fulfilled
pending → rejected

❌ fulfilled → rejected
❌ rejected → fulfilled
```

**Once settled, a Promise cannot change state.**

---

# 2. Creating a Promise

```
const promise = new Promise((resolve, reject) => {

    // async operation

    if (success) {
        resolve("Done");
    } else {
        reject("Failed");
    }

});
```

Remember:

```
new Promise(executor)

executor(resolve, reject)
          │       │
          │       └── failure
          └────────── success
```

Example:

```
const p = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello");
    }, 1000);
});

p.then(result => {
    console.log(result);
});
```

---

# 3. `.then()`, `.catch()`, `.finally()`

```
promise
   .then(success)
   .catch(error)
   .finally(cleanup);
```

### `.then()`

Handles fulfilled Promise.

```
Promise.resolve(10)
    .then(value => {
        console.log(value); // 10
    });
```

### `.catch()`

Handles rejection.

```
Promise.reject("Error")
    .catch(error => {
        console.log(error);
    });
```

### `.finally()`

Runs regardless of success/failure.

```
promise
    .then(...)
    .catch(...)
    .finally(() => {
        console.log("cleanup");
    });
```

---

# 4. MOST IMPORTANT — Promise Chaining

This is extremely important for coding questions.

```
Promise.resolve(10)
    .then(x => x * 2)
    .then(x => x + 5)
    .then(x => console.log(x));
```

Think:

```
Promise
  ↓
10
  ↓ ×2
20
  ↓ +5
25
  ↓
console.log(25)
```

### Rule

> Whatever you `return` from `.then()` becomes the value of the next `.then()`.

```
.then(x => {
    return x * 2;
})
.then(x => {
    console.log(x);
});
```

---

# 5. Returning a Promise from `.then()`

```
Promise.resolve(10)
    .then(x => {
        return Promise.resolve(x * 2);
    })
    .then(x => {
        console.log(x);
    });
```

Output:

```
20
```

The next `.then()` **waits for the returned Promise**.

Mental model:

```
return value
     ↓
next .then gets value

return Promise
     ↓
next .then WAITS
     ↓
gets resolved value
```

---

# 6. Throwing Errors

```
Promise.resolve(10)
    .then(x => {
        throw new Error("Oops");
    })
    .then(x => {
        console.log("not executed");
    })
    .catch(err => {
        console.log(err.message);
    });
```

Output:

```
Oops
```

### Important interview rule

Inside `.then()`:

```
return value       → next then
return Promise     → wait → next then
throw error        → nearest catch
```

---

# 7. Promise + Event Loop ⭐⭐⭐

This is one of the most common interview questions.

```
console.log("A");

setTimeout(() => {
    console.log("B");
}, 0);

Promise.resolve().then(() => {
    console.log("C");
});

console.log("D");
```

Output:

```
A
D
C
B
```

Why?

```
Synchronous code
      ↓
A
D
      ↓
Microtask Queue
      ↓
Promise → C
      ↓
Macrotask Queue
      ↓
setTimeout → B
```

### Remember

```
SYNC
 ↓
MICROTASK
 ↓
MACROTASK
```

Promises use the **microtask queue**.

---

# 8. `Promise.resolve()`

```
Promise.resolve(10)
```

Creates an already fulfilled Promise.

Equivalent mental model:

```
new Promise(resolve => {
    resolve(10);
});
```

Example:

```
Promise.resolve("Hello")
    .then(console.log);
```

---

# 9. `Promise.reject()`

```
Promise.reject("Failed")
    .catch(console.log);
```

Output:

```
Failed
```

---

# 10. `Promise.all()` ⭐⭐⭐

Used when **all operations must succeed**.

```
Promise.all([
    promise1,
    promise2,
    promise3
])
.then(results => {
    console.log(results);
})
.catch(error => {
    console.log(error);
});
```

Example:

```
const p1 = Promise.resolve("A");
const p2 = Promise.resolve("B");
const p3 = Promise.resolve("C");

Promise.all([p1, p2, p3])
    .then(console.log);
```

Output:

```
["A", "B", "C"]
```

### Key rule

```
ALL succeed
    ↓
results

ONE rejects
    ↓
Promise.all rejects
```

Order is based on **input order**, not completion order.

---

# 11. `Promise.allSettled()`

When you want **every result**, even failures.

```
Promise.allSettled([
    Promise.resolve("A"),
    Promise.reject("B"),
    Promise.resolve("C")
])
.then(console.log);
```

Conceptually:

```
[
  { status: "fulfilled", value: "A" },
  { status: "rejected", reason: "B" },
  { status: "fulfilled", value: "C" }
]
```

Remember:

```
all()
        → fail fast

allSettled()
        → wait for everything
```

---

# 12. `Promise.race()`

Returns whichever Promise settles first.

```
Promise.race([
    slowRequest,
    fastRequest
])
.then(console.log);
```

Mental model:

```
P1 ──────── 5 sec
P2 ─ 1 sec       ← WIN

race → P2
```

**Settled = fulfilled OR rejected.**

So a rejection can win the race.

---

# 13. `Promise.any()`

Returns the **first fulfilled Promise**.

```
Promise.any([
    Promise.reject("A"),
    Promise.resolve("B"),
    Promise.resolve("C")
])
.then(console.log);
```

Output:

```
B
```

Mental model:

```
all()
    → everyone must succeed

race()
    → first settled

any()
    → first fulfilled

allSettled()
    → everyone finishes
```

### Perfect interview table


| Method       | Resolves when  | Rejects when                     |
| ------------ | -------------- | -------------------------------- |
| `all`        | all fulfill    | one rejects                      |
| `allSettled` | all settle     | never because of input rejection |
| `race`       | first settles  | first settles as rejection       |
| `any`        | first fulfills | all reject                       |

---

# 14. Sequential vs Parallel Promises ⭐

### Sequential

```
const a = await getA();
const b = await getB();
const c = await getC();
```

```
A → B → C
```

Total time approximately:

```
A + B + C
```

### Parallel

```
const [a, b, c] = await Promise.all([
    getA(),
    getB(),
    getC()
]);
```

```
A ─────┐
B ─────┼──→ result
C ─────┘
```

Total time approximately:

```
max(A, B, C)
```

if they can genuinely run concurrently.

---

# 15. `async / await`

```
async function getData() {
    const result = await promise;
    return result;
}
```

Important:

```
async function
     ↓
ALWAYS returns Promise
```

Example:

```
async function test() {
    return 10;
}

test().then(console.log);
```

Output:

```
10
```

Even though:

```
return 10;
```

the function returns:

```
Promise<10>
```

---

# 16. `await` Mental Model

```
async function test() {

    console.log("A");

    await Promise.resolve();

    console.log("B");
}

test();

console.log("C");
```

Output:

```
A
C
B
```

Think:

```
A
 ↓
await
 ↓
function pauses
 ↓
current synchronous code continues
 ↓
C
 ↓
microtask
 ↓
B
```

`await` doesn't block the entire JavaScript thread.

---

# 17. `try/catch` with Async/Await

```
async function getData() {
    try {
        const data = await fetchData();
        return data;
    } catch (error) {
        console.error(error);
    }
}
```

Mental model:

```
await Promise
     ↓
fulfilled → continue
rejected  → catch
```

---

# 18. How to BUILD Your Own Promise ⭐⭐⭐

This is where coding interview questions become interesting.

Start with the simplest mental model.

```
class MyPromise {

    constructor(executor) {

        this.state = "pending";
        this.value = undefined;

        const resolve = (value) => {
            if (this.state !== "pending") return;

            this.state = "fulfilled";
            this.value = value;
        };

        const reject = (reason) => {
            if (this.state !== "pending") return;

            this.state = "rejected";
            this.value = reason;
        };

        executor(resolve, reject);
    }
}
```

Core architecture:

```
MyPromise
   │
   ├── state
   │     pending
   │     fulfilled
   │     rejected
   │
   ├── value
   │
   ├── resolve()
   │
   └── reject()
```

---

# 19. Build `.then()`

Now we need callbacks.

```
class MyPromise {

    constructor(executor) {

        this.state = "pending";
        this.value = undefined;
        this.handlers = [];

        const resolve = (value) => {

            if (this.state !== "pending") return;

            this.state = "fulfilled";
            this.value = value;

            this.handlers.forEach(handler => {
                handler.onFulfilled(value);
            });
        };

        const reject = (reason) => {

            if (this.state !== "pending") return;

            this.state = "rejected";
            this.value = reason;

            this.handlers.forEach(handler => {
                handler.onRejected(reason);
            });
        };

        executor(resolve, reject);
    }

    then(onFulfilled, onRejected) {

        this.handlers.push({
            onFulfilled,
            onRejected
        });

        return this;
    }
}
```

This is a **learning implementation**, not a full Promises/A+ implementation.

---

# 20. Why Do We Need Handlers?

Consider:

```
const p = new MyPromise(resolve => {

    setTimeout(() => {
        resolve("Done");
    }, 1000);

});

p.then(value => {
    console.log(value);
});
```

At first:

```
p = pending
```

So `.then()` cannot execute immediately.

We store:

```
handlers[]
     ↓
callback
```

After 1 second:

```
resolve("Done")
      ↓
state = fulfilled
      ↓
run stored callbacks
```

---

# 21. Real Promise Implementation Challenge

A proper implementation must handle:

```
1. pending state
2. fulfilled state
3. rejected state

4. resolve()
5. reject()

6. then()

7. chaining

8. errors

9. async callbacks

10. returned Promises
```

The hardest part is **chaining**.

---

# 22. Implementing Promise Chaining

We want this:

```
new MyPromise(resolve => {
    resolve(10);
})
.then(x => x * 2)
.then(x => x + 5)
.then(console.log);
```

Expected:

```
25
```

Therefore:

```
then()
 ↓
must return NEW Promise
```

Not:

```
return this;
```

Instead:

```
then(...) {
    return new MyPromise(...)
}
```

---

# 23. The Most Important `then()` Rule

Imagine:

```
p.then(x => {
    return 10;
});
```

New Promise resolves with:

```
10
```

But:

```
p.then(x => {
    return Promise.resolve(10);
});
```

New Promise must wait for that Promise.

And:

```
p.then(x => {
    throw new Error("X");
});
```

New Promise must reject.

So:

```
handler result
      │
      ├── normal value
      │      ↓
      │   resolve(value)
      │
      ├── Promise
      │      ↓
      │   wait
      │
      └── throw
             ↓
          reject(error)
```

This is the core of Promise chaining.

---

# 24. Coding Interview Question #1

### Implement `delay()`

```
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function test() {
    console.log("Start");

    await delay(1000);

    console.log("End");
}
```

Mental model:

```
delay()
  ↓
Promise pending
  ↓
setTimeout
  ↓
resolve()
  ↓
await continues
```

---

# 25. Coding Question #2 — Promise Delay Value

```
function delay(ms, value) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}

delay(1000, "Hello")
    .then(console.log);
```

---

# 26. Coding Question #3 — Retry Promise ⭐

Very common interview pattern.

```
async function retry(fn, attempts) {

    for (let i = 0; i < attempts; i++) {

        try {
            return await fn();
        } catch (error) {

            if (i === attempts - 1) {
                throw error;
            }
        }
    }
}
```

Usage:

```
retry(fetchData, 3);
```

Mental model:

```
try
 ↓
success → return

failure
 ↓
try again
 ↓
failure
 ↓
try again
 ↓
failure
 ↓
throw
```

---

# 27. Coding Question #4 — Timeout Promise

```
function timeout(promise, ms) {

    const timer = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("Timeout"));
        }, ms);
    });

    return Promise.race([
        promise,
        timer
    ]);
}
```

Usage:

```
timeout(fetchData(), 3000);
```

Mental model:

```
             ┌── fetch
Promise.race ┤
             └── timeout
                  ↓
              first settles
```

---

# 28. Coding Question #5 — Run Promises Sequentially

```
async function runSequentially(tasks) {

    const results = [];

    for (const task of tasks) {
        results.push(await task());
    }

    return results;
}
```

Important:

```
tasks = [
    () => fetchA(),
    () => fetchB(),
    () => fetchC()
]
```

Not:

```
tasks = [
    fetchA(),
    fetchB(),
    fetchC()
]
```

because those Promises may already have started.

---

# 29. Coding Question #6 — Concurrency Limit

This is a more advanced interview question.

Given:

```
tasks = [
    task1,
    task2,
    task3,
    task4,
    task5
]
```

Run only 2 at a time:

```
task1 ────────┐
task2 ────────┤
              ↓
           task3
           task4
              ↓
           task5
```

Core idea:

```
async function worker() {

    while (index < tasks.length) {

        const current = index++;

        await tasks[current]();
    }
}

await Promise.all([
    worker(),
    worker()
]);
```

Two workers → max approximately **2 active tasks**.

---

# 30. Coding Question #7 — Implement `Promise.all`

Interview favorite.

```
function promiseAll(promises) {

    return new Promise((resolve, reject) => {

        const results = [];
        let completed = 0;

        if (promises.length === 0) {
            resolve([]);
            return;
        }

        promises.forEach((promise, index) => {

            Promise.resolve(promise)
                .then(value => {

                    results[index] = value;
                    completed++;

                    if (completed === promises.length) {
                        resolve(results);
                    }

                })
                .catch(reject);
        });
    });
}
```

Why `results[index]`?

Because:

```
Promise 1 → 3 sec
Promise 2 → 1 sec
Promise 3 → 2 sec
```

Completion:

```
2
3
1
```

But result must be:

```
[1, 2, 3]
```

Therefore:

```
results[index] = value;
```

---

# 31. Coding Question #8 — Promise Queue

A useful advanced pattern:

```
Tasks
 ↓
Queue
 ↓
One task at a time
 ↓
next task
```

Basic idea:

```
let queue = Promise.resolve();

function addTask(task) {

    queue = queue
        .then(() => task())
        .catch(() => {});

    return queue;
}
```

Now:

```
addTask(() => fetchA());
addTask(() => fetchB());
addTask(() => fetchC());
```

runs sequentially.

---

# 32. Promise Coding Question Checklist

When interviewer asks:

> "Implement Promise X"

Immediately think:

```
① What are the STATES?
       ↓
pending / fulfilled / rejected

② When does it SETTLE?
       ↓
resolve / reject

③ Can it settle twice?
       ↓
NO

④ Does it RETURN a Promise?
       ↓
usually YES

⑤ Does it SUPPORT CHAINING?
       ↓
then → new Promise

⑥ What happens if callback RETURNS?
       ↓
value → resolve
Promise → adopt/wait

⑦ What if callback THROWS?
       ↓
reject

⑧ SYNC or ASYNC?
       ↓
callbacks should run asynchronously

⑨ Does ORDER matter?
       ↓
Promise.all → input order

⑩ What happens on ERROR?
       ↓
reject / catch
```

---

# 33. 🔥 Promise Interview Traps

### Trap 1

```
new Promise((resolve, reject) => {
    resolve(1);
    resolve(2);
});
```

Result:

```
1
```

Because:

```
first settlement wins
```

---

### Trap 2

```
new Promise((resolve, reject) => {
    reject("A");
    resolve("B");
});
```

Result:

```
rejected → A
```

---

### Trap 3

```
Promise.resolve()
    .then(() => {
        console.log("A");
        throw new Error("X");
    })
    .then(() => {
        console.log("B");
    })
    .catch(() => {
        console.log("C");
    });
```

Output:

```
A
C
```

---

### Trap 4

```
Promise.resolve()
    .then(() => {
        return Promise.resolve("A");
    })
    .then(console.log);
```

Output:

```
A
```

Because Promise resolution is assimilated/adopted.

---

# 34. 🔥 Ultimate Promise Mental Map

Write this in your notebook:

```
                         PROMISE
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
             STATE                   RESULT
                │                       │
       pending / fulfilled /       value / reason
             rejected
                │
         resolve / reject
                │
                ↓
              THEN
                │
        ┌───────┼────────┐
        ↓       ↓        ↓
      value   Promise   throw
        ↓       ↓        ↓
     resolve   wait     reject
                │
                ↓
             CHAINING
                │
                ↓
          NEW PROMISE
```

And next to it:

```
PROMISE METHODS
─────────────────────────

all()         → ALL must succeed
allSettled()  → ALL finish
race()        → FIRST settles
any()         → FIRST succeeds

resolve()     → fulfilled Promise
reject()      → rejected Promise
```

And finally:

```
EVENT LOOP
─────────────────────────

SYNC
  ↓
MICROTASK
  ↓
MACROTASK

Promise.then()
    ↓
MICROTASK ⭐

setTimeout()
    ↓
MACROTASK
```

---

# 35. Your Promise Interview Progression

Don't jump directly into implementing the full Promise. Practice in this order:

```
LEVEL 1
✓ Promise creation
✓ resolve / reject
✓ then / catch / finally

        ↓

LEVEL 2
✓ chaining
✓ return values
✓ returned Promises
✓ throw errors

        ↓

LEVEL 3
✓ Event loop questions
✓ Microtasks
✓ async/await
✓ Promise output questions

        ↓

LEVEL 4
✓ Promise.all
✓ Promise.race
✓ Promise.any
✓ Promise.allSettled

        ↓

LEVEL 5
✓ delay()
✓ retry()
✓ timeout()
✓ sequential execution

        ↓

LEVEL 6
🔥 implement Promise.all
🔥 implement Promise.race
🔥 implement Promise.any
🔥 implement Promise.allSettled

        ↓

LEVEL 7
🔥 build simplified MyPromise
🔥 then chaining
🔥 error propagation
🔥 Promise resolution
🔥 async callback execution

        ↓

LEVEL 8
🔥 concurrency limiter
🔥 task queue
🔥 retry with exponential backoff
🔥 cancellable async operations
```

**The single most important sentence to remember:**

> **A Promise represents a future result; `then()` creates a new Promise, and its result determines how the chain continues.**

If you can explain that sentence and implement `delay → retry → timeout → Promise.all → simplified MyPromise`, you have the core Promise concepts needed for most JavaScript interview coding questions.
