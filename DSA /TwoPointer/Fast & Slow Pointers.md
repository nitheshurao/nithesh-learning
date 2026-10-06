# Fast & Slow Pointers — JavaScript Interview Questions

Fast & Slow pointers are mainly used when **two pointers move at different speeds**.

```js
slow = slow.next;
fast = fast.next.next;
```

Core pattern:

```text
slow → 1 step
fast → 2 steps

S
↓
1 → 2 → 3 → 4 → 5 → 6
          ↑
          F
```

Here are the **most important interview problems**, from easy → hard.

---

## 1. Middle of Linked List ⭐

**Question:** Find the middle node.

```js
function middleNode(head) {
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow;
}
```

### Example

```text
1 → 2 → 3 → 4 → 5
        S
                F
```

Output:

```text
3
```

### Complexity

```text
Time:  O(n)
Space: O(1)
```

---

# 2. Middle of Even Linked List

```text
1 → 2 → 3 → 4 → 5 → 6
```

The above implementation returns:

```text
4
```

Why?

```text
S moves: 1 → 2 → 3 → 4
F moves: 1 → 3 → 5 → null
```

This is a common interview follow-up.

---

# 3. Detect Cycle in Linked List ⭐⭐⭐

**Question:** Determine whether a linked list contains a cycle.

```js
function hasCycle(head) {
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow === fast) {
            return true;
        }
    }

    return false;
}
```

### Why does it work?

Imagine a circular track:

```text
1 → 2 → 3 → 4
        ↑   ↓
        6 ← 5
```

`fast` moves faster than `slow`.

Eventually:

```text
slow === fast
```

If there is no cycle, `fast` reaches `null`.

---

# 4. Find Start of Cycle ⭐⭐⭐

This is an important follow-up to cycle detection.

```js
function detectCycle(head) {
    let slow = head;
    let fast = head;

    // Phase 1: Detect cycle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow === fast) {
            break;
        }
    }

    if (!fast || !fast.next) {
        return null;
    }

    // Phase 2: Find cycle entrance
    slow = head;

    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
    }

    return slow;
}
```

### Two phases

```text
Phase 1
head
 ↓
S → → 
F → → →

Find meeting point
        ↓
Phase 2
S = head

S → 1 step
F → 1 step

Meet at cycle beginning
```

This is **Floyd's Cycle Detection Algorithm**.

---

# 5. Happy Number ⭐⭐

A number is happy if repeatedly replacing it with the sum of the squares of its digits eventually reaches `1`.

Example:

```text
19

1² + 9² = 82
8² + 2² = 68
6² + 8² = 100
1² + 0² + 0² = 1
```

### Solution

```js
function isHappy(n) {

    function next(num) {
        let sum = 0;

        while (num > 0) {
            const digit = num % 10;
            sum += digit * digit;
            num = Math.floor(num / 10);
        }

        return sum;
    }

    let slow = n;
    let fast = next(n);

    while (fast !== 1 && slow !== fast) {
        slow = next(slow);
        fast = next(next(fast));
    }

    return fast === 1;
}
```

### Important insight

A sequence like:

```text
19 → 82 → 68 → 100 → 1
```

eventually reaches `1`.

An unhappy number eventually enters a cycle:

```text
... → 4 → 16 → 37 → 58 → 89
          ↑                 ↓
          ← ← ← ← ← ← ← ← ←
```

So the problem becomes **cycle detection**.

---

# 6. Palindrome Linked List ⭐⭐⭐

### Input

```text
1 → 2 → 2 → 1
```

Output:

```text
true
```

### Approach

1. Find middle.
2. Reverse second half.
3. Compare both halves.

```js
function isPalindrome(head) {

    if (!head || !head.next) {
        return true;
    }

    // Find middle
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse second half
    let prev = null;

    while (slow) {
        let next = slow.next;
        slow.next = prev;
        prev = slow;
        slow = next;
    }

    // Compare
    let left = head;
    let right = prev;

    while (right) {
        if (left.val !== right.val) {
            return false;
        }

        left = left.next;
        right = right.next;
    }

    return true;
}
```

### Pattern

```text
1 → 2 → 3 | 3 → 2 → 1
            ↑
          reverse
```

---

# 7. Remove Nth Node From End ⭐⭐⭐

This is often taught as **two pointers with a fixed gap**, rather than classic 1×/2× speeds.

### Input

```text
1 → 2 → 3 → 4 → 5
n = 2
```

Remove:

```text
4
```

### Solution

```js
function removeNthFromEnd(head, n) {

    const dummy = {
        next: head
    };

    let slow = dummy;
    let fast = dummy;

    // Create n-node gap
    for (let i = 0; i < n; i++) {
        fast = fast.next;
    }

    while (fast.next) {
        slow = slow.next;
        fast = fast.next;
    }

    slow.next = slow.next.next;

    return dummy.next;
}
```

### Why?

Maintain:

```text
fast
   ↓
1 → 2 → 3 → 4 → 5
     ↑
    slow
```

When `fast` reaches the end, `slow` is positioned immediately before the node to remove.

---

# 8. Intersection of Two Linked Lists ⭐⭐⭐

Not technically classic fast/slow, but it is an important **two-pointer linked-list** problem.

```js
function getIntersectionNode(headA, headB) {

    let a = headA;
    let b = headB;

    while (a !== b) {
        a = a ? a.next : headB;
        b = b ? b.next : headA;
    }

    return a;
}
```

### Key trick

```text
A → A → A → C → C
              ↑
B → B → C → C
```

Pointers switch lists:

```text
A → ... → null → B → ... → C
B → ... → null → A → ... → C
```

They travel equal total distances.

---

# 9. Find Duplicate Number ⭐⭐⭐

Given:

```js
[1, 3, 4, 2, 2]
```

Return:

```text
2
```

The clever solution uses **cycle detection**.

```js
function findDuplicate(nums) {

    let slow = nums[0];
    let fast = nums[0];

    // Phase 1
    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow !== fast);

    // Phase 2
    slow = nums[0];

    while (slow !== fast) {
        slow = nums[slow];
        fast = nums[fast];
    }

    return slow;
}
```

### Why is this possible?

Treat array values as pointers:

```text
index → next index

0 → 1 → 3 → 2
        ↑     ↓
        ← ← ←
```

The duplicate creates a cycle.

Then use Floyd's algorithm.

---

# 10. Circular Array Loop ⭐⭐⭐⭐

Determine whether an array contains a valid cycle following its values.

Example:

```js
[2, -1, 1, 2, 2]
```

This is a more advanced application of fast/slow pointers.

The key is to ensure that:

* Movement stays in the same direction.
* The cycle contains more than one element.

A simplified helper:

```js
function nextIndex(nums, i) {
    const n = nums.length;

    return ((i + nums[i]) % n + n) % n;
}
```

The complete solution:

```js
function circularArrayLoop(nums) {

    const n = nums.length;

    function next(i) {
        return ((i + nums[i]) % n + n) % n;
    }

    function sameDirection(i, j) {
        return nums[i] * nums[j] > 0;
    }

    for (let i = 0; i < n; i++) {

        if (nums[i] === 0) continue;

        let slow = i;
        let fast = i;

        while (true) {

            const slowNext = next(slow);

            if (
                !sameDirection(slow, slowNext) ||
                slowNext === slow
            ) {
                break;
            }

            const fastNext = next(fast);

            if (
                !sameDirection(fast, fastNext) ||
                fastNext === fast
            ) {
                break;
            }

            const fastNext2 = next(fastNext);

            if (
                !sameDirection(fast, fastNext2) ||
                fastNext2 === fastNext
            ) {
                break;
            }

            slow = slowNext;
            fast = fastNext2;

            if (slow === fast) {
                return true;
            }
        }
    }

    return false;
}
```

This is considerably harder than the standard linked-list problems.

---

# 11. Reorder List ⭐⭐⭐⭐

### Input

```text
1 → 2 → 3 → 4 → 5
```

### Output

```text
1 → 5 → 2 → 4 → 3
```

This combines **three patterns**:

```text
1. Fast & Slow → find middle
2. Reverse Linked List
3. Merge two lists
```

```js
function reorderList(head) {

    if (!head || !head.next) {
        return;
    }

    // Find middle
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse second half
    let second = slow.next;
    slow.next = null;

    let prev = null;

    while (second) {
        let next = second.next;
        second.next = prev;
        prev = second;
        second = next;
    }

    // Merge
    let first = head;
    second = prev;

    while (second) {

        let firstNext = first.next;
        let secondNext = second.next;

        first.next = second;
        second.next = firstNext;

        first = firstNext;
        second = secondNext;
    }
}
```

---

# 12. Sort a Linked List ⭐⭐⭐⭐

Merge sort on a linked list uses fast/slow pointers to split the list.

```js
function sortList(head) {

    if (!head || !head.next) {
        return head;
    }

    // Find middle
    let slow = head;
    let fast = head.next;

    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    const second = slow.next;
    slow.next = null;

    const left = sortList(head);
    const right = sortList(second);

    return merge(left, right);
}

function merge(a, b) {

    const dummy = { next: null };
    let current = dummy;

    while (a && b) {

        if (a.val < b.val) {
            current.next = a;
            a = a.next;
        } else {
            current.next = b;
            b = b.next;
        }

        current = current.next;
    }

    current.next = a || b;

    return dummy.next;
}
```

Complexity:

```text
Time:  O(n log n)
Space: O(log n) recursion
```

---

# 🧠 Fast & Slow Pointer Cheat Sheet


| Problem                | Slow               | Fast               |
| ---------------------- | ------------------ | ------------------ |
| Middle of Linked List  | `1 step`           | `2 steps`          |
| Detect Cycle           | `1 step`           | `2 steps`          |
| Cycle Start            | Reset slow to head | Both move 1        |
| Palindrome Linked List | Find middle        | Find middle        |
| Reorder List           | Find middle        | Find middle        |
| Sort Linked List       | Find middle        | Find middle        |
| Happy Number           | `f(x)`             | `f(f(x))`          |
| Find Duplicate         | `nums[slow]`       | `nums[nums[fast]]` |
| Remove Nth From End    | Maintain gap       | Ahead by`n`        |

---

# 🔥 The 5 Patterns You Should Master

### Pattern 1 — Find Middle

```js
let slow = head;
let fast = head;

while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
}
```

Used in:

```text
Middle Linked List
Palindrome Linked List
Reorder List
Sort Linked List
```

---

### Pattern 2 — Detect Cycle

```js
while (fast && fast.next) {

    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
        return true;
    }
}
```

Used in:

```text
Linked List Cycle
Happy Number
Find Duplicate Number
Circular Array Loop
```

---

### Pattern 3 — Find Cycle Entrance

```js
slow = head;

while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
}
```

Used in:

```text
Linked List Cycle II
```

---

### Pattern 4 — Fixed Gap

```js
for (let i = 0; i < n; i++) {
    fast = fast.next;
}

while (fast.next) {
    slow = slow.next;
    fast = fast.next;
}
```

Used in:

```text
Remove Nth Node From End
```

---

### Pattern 5 — Find Middle + Reverse + Merge

```text
              Linked List
                   ↓
          Fast & Slow Pointer
                   ↓
                Middle
              ↙        ↘
         First half   Second half
                       ↓
                    Reverse
                       ↓
                    Merge
```

Used in:

```text
Palindrome Linked List
Reorder List
```

## 🎯 Best Practice Sequence

For interviews, solve these **in this exact progression**:

```text
1. Middle of Linked List
        ↓
2. Linked List Cycle
        ↓
3. Linked List Cycle II
        ↓
4. Happy Number
        ↓
5. Remove Nth Node From End
        ↓
6. Palindrome Linked List
        ↓
7. Find Duplicate Number
        ↓
8. Intersection of Two Linked Lists
        ↓
9. Reorder List
        ↓
10. Sort List
        ↓
11. Circular Array Loop
```

If you can **derive these 11 rather than memorize them**, you have most of the important Fast & Slow Pointer interview patterns covered.
