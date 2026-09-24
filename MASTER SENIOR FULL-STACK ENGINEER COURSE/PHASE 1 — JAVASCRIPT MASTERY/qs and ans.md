1. What are first-class functions in JavaScript?

**Answer:**

JavaScript treats functions as **first-class citizens**, meaning functions can be:

* assigned to variables
* passed as arguments
* returned from other functions
* stored in objects or arrays

```js
const greet = (name) => `Hello ${name}`;

const fn = greet;

console.log(fn("Nithesh"));
```

Here, `greet` is treated like any other value.

---

## 2. What is a higher-order function?

**Answer:**

A higher-order function is a function that **accepts another function as an argument, returns a function, or both**.

```js
function calculate(a, b, operation) {
  return operation(a, b);
}

const add = (a, b) => a + b;

calculate(10, 20, add);
```

Common examples:

```js
map()
filter()
reduce()
sort()
setTimeout()
```

---

## 3. What is a callback function?

**Answer:**

A callback is a function passed to another function to be executed by it, usually after some operation completes.

```js
function processUser(name, callback) {
  console.log(`Processing ${name}`);
  callback();
}

processUser("Nithesh", () => {
  console.log("Completed");
});
```

Callbacks are heavily used in asynchronous JavaScript.

---

## 4. What is the difference between a higher-order function and a callback?

**Answer:**

They describe **different things**.

```text
Higher-order function
        ↓
The function receiving/returning another function

Callback
        ↓
The function being passed
```

Example:

```js
function process(callback) {
  callback();
}

process(() => {
  console.log("Hello");
});
```

`process` is the **higher-order function**.

The anonymous function is the **callback**.

---

# IIFE

## 5. What is an IIFE?

**Answer:**

IIFE stands for **Immediately Invoked Function Expression**.

It is a function that executes immediately after it is created.

```js
(function () {
  console.log("Executed immediately");
})();
```

It was commonly used to create private scope and avoid polluting the global scope before ES modules became common.

---

## 6. Why were IIFEs commonly used?

**Answer:**

Primarily to create an isolated scope.

```js
(function () {
  const secret = "private";
  console.log(secret);
})();
```

`secret` isn't available outside the function.

Modern JavaScript generally uses:

```js
import
export
```

for module-level isolation.

---

# Pure Functions

## 7. What is a pure function?

**Answer:**

A pure function has two important properties:

1. Same input always produces the same output.
2. It doesn't cause observable side effects.

```js
function add(a, b) {
  return a + b;
}
```

```js
add(2, 3); // always 5
```

An example of an impure function:

```js
let total = 0;

function add(value) {
  total += value;
}
```

The function modifies external state.

---

## 8. Why are pure functions useful in React?

**Answer:**

Pure functions make behavior predictable and make state changes easier to reason about.

For example:

```js
const updatedUsers = users.map(user => ({
  ...user,
  active: true
}));
```

Instead of mutating the original array.

This is particularly important for predictable state management and easier testing.

---

# Composition

## 9. What is function composition?

**Answer:**

Function composition means combining multiple small functions so the output of one becomes the input of another.

```js
const double = x => x * 2;
const square = x => x * x;

const result = square(double(5));

console.log(result); // 100
```

Conceptually:

```text
5
 ↓
double
 ↓
10
 ↓
square
 ↓
100
```

---

# `this`

## 10. What is `this` in JavaScript?

**Answer:**

`this` is determined primarily by **how a function is invoked**.

```js
const user = {
  name: "Nithesh",

  greet() {
    console.log(this.name);
  }
};

user.greet();
```

Here:

```js
this === user
```

because `greet()` is called as a method of `user`.

A common interview mistake is saying:

> "`this` always refers to the object."

That's not correct.

---

## 11. How does `this` behave in a regular function?

```js
const user = {
  name: "Nithesh",

  greet: function () {
    console.log(this.name);
  }
};

user.greet();
```

Output:

```text
Nithesh
```

But:

```js
const greet = user.greet;

greet();
```

The function is no longer called as `user.greet()`.

With strict mode, `this` inside the function is `undefined`.

---

# Arrow Functions

## 12. How is `this` different in arrow functions?

**Answer:**

Arrow functions don't have their own `this`.

They capture `this` from their **lexical surrounding scope**.

```js
const user = {
  name: "Nithesh",

  greet: function () {
    const inner = () => {
      console.log(this.name);
    };

    inner();
  }
};

user.greet();
```

Output:

```text
Nithesh
```

The arrow function gets `this` from `greet()`.

---

## 13. Can you change `this` of an arrow function using `call()`?

**Answer:**

No.

```js
const greet = () => {
  console.log(this.name);
};

greet.call({ name: "Nithesh" });
```

`call()` cannot override the lexical `this` of an arrow function.

This is an important interview question.

---

# call / apply / bind

## 14. What is `call()`?

**Answer:**

`call()` invokes a function immediately while explicitly setting its `this` value.

```js
function greet() {
  console.log(`Hello ${this.name}`);
}

const user = {
  name: "Nithesh"
};

greet.call(user);
```

Output:

```text
Hello Nithesh
```

---

## 15. What is `apply()`?

**Answer:**

`apply()` is similar to `call()`, but arguments are passed as an array.

```js
function introduce(role, company) {
  console.log(this.name, role, company);
}

const user = {
  name: "Nithesh"
};

introduce.apply(user, ["Developer", "ABC"]);
```

---

## 16. What is `bind()`?

**Answer:**

`bind()` creates a **new function** with a specified `this` value.

It doesn't execute the function immediately.

```js
function greet() {
  console.log(this.name);
}

const user = {
  name: "Nithesh"
};

const boundGreet = greet.bind(user);

boundGreet();
```

---

## 17. Difference between `call`, `apply`, and `bind`?

**Answer:**


| Method    | Executes immediately? | Arguments            |
| --------- | --------------------- | -------------------- |
| `call()`  | Yes                   | Separate arguments   |
| `apply()` | Yes                   | Array                |
| `bind()`  | No                    | Returns new function |

Example:

```js
fn.call(obj, a, b);

fn.apply(obj, [a, b]);

const newFn = fn.bind(obj, a, b);
newFn();
```

**Easy interview memory:**

```text
call  → call now
apply → call now with array
bind  → bind now, call later
```

---

# Prototypes

## 18. What is a prototype?

**Answer:**

A prototype is an object from which another object can inherit properties and methods.

For example:

```js
const user = {
  name: "Nithesh"
};

console.log(Object.getPrototypeOf(user));
```

Objects can access properties through their prototype.

---

## 19. What is the prototype chain?

**Answer:**

If JavaScript doesn't find a property on an object, it looks at its prototype, then the prototype's prototype, and so on.

Example:

```js
const arr = [1, 2, 3];

arr.map(x => x * 2);
```

Conceptually:

```text
arr
 ↓
Array.prototype
 ↓
Object.prototype
 ↓
null
```

JavaScript finds `map()` on `Array.prototype`.

---

## 20. What happens when you access a property?

Suppose:

```js
const user = {
  name: "Nithesh"
};

console.log(user.toString());
```

JavaScript doesn't find `toString` directly on `user`.

It searches:

```text
user
 ↓
user's prototype
 ↓
Object.prototype
 ↓
toString()
```

So the method can be accessed through the prototype chain.

---

# Classes

## 21. Are JavaScript classes truly class-based?

**Answer:**

JavaScript is fundamentally **prototype-based**.

The `class` syntax provides a cleaner abstraction over the prototype system.

```js
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello ${this.name}`;
  }
}
```

The `greet` method is associated with `User.prototype`.

---

## 22. What does the `new` keyword do?

**Answer:**

When you execute:

```js
const user = new User("Nithesh");
```

Conceptually, JavaScript:

1. creates a new object
2. links it to `User.prototype`
3. binds `this` to the new object
4. executes the constructor
5. returns the object

Simplified:

```text
new User()
    ↓
Create object
    ↓
Connect prototype
    ↓
this = object
    ↓
Run constructor
    ↓
Return object
```

---

# Inheritance

## 23. How does inheritance work with classes?

```js
class Person {
  greet() {
    return "Hello";
  }
}

class Developer extends Person {
  code() {
    return "Writing code";
  }
}

const dev = new Developer();

dev.greet();
dev.code();
```

`Developer` inherits from `Person`.

Conceptually:

```text
dev
 ↓
Developer.prototype
 ↓
Person.prototype
 ↓
Object.prototype
 ↓
null
```

---

## 24. What does `super` do?

**Answer:**

`super` is used to access the parent class.

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `Hello ${this.name}`;
  }
}

class Developer extends Person {
  constructor(name, language) {
    super(name);
    this.language = language;
  }
}
```

`super(name)` calls the parent constructor.

---

# Getters & Setters

## 25. What is a getter?

**Answer:**

A getter allows a method to be accessed like a property.

```js
class User {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

const user = new User("Nithesh");

console.log(user.name);
```

Notice:

```js
user.name
```

not:

```js
user.name()
```

---

## 26. What is a setter?

**Answer:**

A setter allows you to control what happens when a property is assigned.

```js
class User {
  constructor(name) {
    this._name = name;
  }

  set name(value) {
    this._name = value.trim();
  }

  get name() {
    return this._name;
  }
}

const user = new User("Nithesh");

user.name = "  Rahul  ";

console.log(user.name);
```

Output:

```text
Rahul
```

Setters are useful for **validation, transformation, and controlled updates**.

---

# 🔥 Tricky Interview Questions

These are the ones I'd make sure you can solve without memorizing.

### 27. What is the output?

```js
const user = {
  name: "Nithesh",

  greet() {
    console.log(this.name);
  }
};

const fn = user.greet;

fn();
```

**Answer:**

In strict mode:

```text
undefined / TypeError depending on the exact surrounding code
```

The important concept is that `fn()` is a standalone function call, not `user.greet()`.

---

### 28. What is the output?

```js
const user = {
  name: "Nithesh",

  greet: () => {
    console.log(this.name);
  }
};

user.greet();
```

**Answer:**

It does **not** use `user` as `this`.

Arrow functions don't have their own `this`; they capture it lexically.

---

### 29. What is the output?

```js
const user = {
  name: "Nithesh"
};

function greet() {
  console.log(this.name);
}

const fn = greet.bind(user);

fn();
```

**Answer:**

```text
Nithesh
```

`bind()` permanently associates the new function with `user`.

---

### 30. What is the output?

```js
function greet() {
  console.log(this.name);
}

const user1 = { name: "Nithesh" };
const user2 = { name: "Rahul" };

greet.call(user1);
greet.call(user2);
```

**Answer:**

```text
Nithesh
Rahul
```

`call()` allows the same function to be invoked with different `this` values.

---

### 31. What is the output?

```js
const obj = {
  value: 10,

  regular() {
    console.log(this.value);
  },

  arrow: () => {
    console.log(this.value);
  }
};

obj.regular();
obj.arrow();
```

**Answer:**

The regular method gets `this` from `obj`.

The arrow function doesn't. Its `this` comes from the surrounding lexical scope.

Therefore, don't expect `obj.arrow()` to make `this === obj`.

---

# ⭐ Most Important 10 to Master

For a **React + Node.js interview**, make sure you can explain these without notes:

```text
1. First-class functions
2. Higher-order functions
3. Callback vs higher-order function
4. Pure vs impure functions
5. Function composition
6. How `this` works
7. call vs apply vs bind
8. Arrow function vs regular function
9. Prototype chain
10. Classes vs prototypes
```

And there is one **major missing topic** from your list:

> **Closures**

Closures are extremely important because they connect:

```text
Functions
   ↓
Lexical Scope
   ↓
Closures
   ↓
Callbacks
   ↓
Async JavaScript
   ↓
React Hooks
   ↓
Interview questions
```

For your preparation, I would learn **Closures → Scope → Hoisting → Event Loop → Promises/async-await** immediately after this block.
