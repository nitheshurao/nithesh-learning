# Fast & Slow Pointers — Complete JavaScript DSA Notes

Fast & Slow Pointers is not limited to linked lists. In interviews, the pattern appears in **arrays, strings, linked lists, and mathematical sequences**.

The most important idea is to identify **what each pointer represents**.

```text
                         FAST & SLOW POINTERS
                                  │
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
       Same Direction       Different Speed      Gap / Runner
       Read / Write           1x vs 2x             n apart
              │                   │                   │
           Arrays              Linked List       Linked List
           Strings              Cycles            Remove Nth
```

---

# 1. What Are Fast & Slow Pointers?

Two pointers traverse the same data structure but have different **roles, positions, or speeds**.

### Form 1 — Read / Write

```text
slow →
fast  →

[ ... ... ... ... ... ... ]
```

Usually:

```text
fast = scanner
slow = writer
```

Used for:

* Remove Element
* Move Zeroes
* Remove Duplicates
* Partition Array
* Filtering in-place

---

### Form 2 — Different Speeds

```text
slow →       1 step
fast →       2 steps
```

Used for:

* Middle of Linked List
* Cycle Detection
* Cycle Start
* Happy Number
* Find Duplicate Number

---

### Form 3 — Fixed Gap

```text
slow →
fast  → → → → n positions ahead
```

Used for:

* Remove Nth Node From End
* Find kth node from end
* Some linked-list distance problems

---

# 2. The Master Mental Model

Remember:

```text
FAST = EXPLORE
SLOW = TRACK / BUILD
```

For arrays:

```text
FAST = READ
SLOW = WRITE
```

For linked lists:

```text
FAST = MOVE FASTER
SLOW = MOVE SLOWER
```

For fixed-gap problems:

```text
FAST = MAINTAIN DISTANCE
SLOW = TARGET POSITION
```

---

# PART I — ARRAYS

# 3. Array Read/Write Pattern ⭐⭐⭐⭐⭐

This is probably the most important Fast/Slow pattern for arrays.

```js
let slow = 0;

for (let fast = 0; fast < nums.length; fast++) {

    if (isValid(nums[fast])) {
        nums[slow] = nums[fast];
        slow++;
    }
}
```

### Invariant

At every point:

```text
nums[0 ... slow - 1]
```

contains the correctly processed elements.

And:

```text
fast
 ↓
current element

slow
 ↓
next write position
```

---

# 4. Remove Element ⭐⭐⭐

### Problem

Remove all occurrences of `val` in-place.

```text
Input:
[3,2,2,3]

val = 3

Output:
[2,2]
```

### Solution

```js
function removeElement(nums, val) {
    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {

        if (nums[fast] !== val) {
            nums[slow] = nums[fast];
            slow++;
        }
    }

    return slow;
}
```

### Pattern

```text
fast → scan everything
slow → keep valid elements
```

---

# 5. Move Zeroes ⭐⭐⭐

### Problem

Move all zeroes to the end while preserving the relative order of non-zero values.

```text
[0,1,0,3,12]

        ↓

[1,3,12,0,0]
```

### Solution

```js
function moveZeroes(nums) {
    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {

        if (nums[fast] !== 0) {

            [nums[slow], nums[fast]] =
            [nums[fast], nums[slow]];

            slow++;
        }
    }

    return nums;
}
```

### Think

```text
fast → find non-zero
slow → position for non-zero
```

---

# 6. Remove Duplicates from Sorted Array ⭐⭐⭐

### Input

```text
[1,1,2,2,3]
```

### Output

```text
[1,2,3]
```

### Solution

```js
function removeDuplicates(nums) {

    if (nums.length === 0) {
        return 0;
    }

    let slow = 1;

    for (let fast = 1; fast < nums.length; fast++) {

        if (nums[fast] !== nums[fast - 1]) {
            nums[slow] = nums[fast];
            slow++;
        }
    }

    return slow;
}
```

### Why?

Sorted array:

```text
1 1 2 2 3 3
    ↑
duplicates are adjacent
```

---

# 7. Remove Duplicates II ⭐⭐⭐⭐

Allow each number at most twice.

```text
[1,1,1,2,2,3]

        ↓

[1,1,2,2,3]
```

### Solution

```js
function removeDuplicates(nums) {

    if (nums.length <= 2) {
        return nums.length;
    }

    let slow = 2;

    for (let fast = 2; fast < nums.length; fast++) {

        if (nums[fast] !== nums[slow - 2]) {
            nums[slow] = nums[fast];
            slow++;
        }
    }

    return slow;
}
```

### Key trick

```js
nums[fast] !== nums[slow - 2]
```

If the current value equals the value two positions behind the write pointer, it would create a third copy.

---

# 8. Partition Array ⭐⭐⭐

Move values satisfying a condition to the front.

Example:

```text
Move negative values before positive values.
```

```js
function partition(nums) {

    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {

        if (nums[fast] < 0) {

            [nums[slow], nums[fast]] =
            [nums[fast], nums[slow]];

            slow++;
        }
    }

    return nums;
}
```

### General pattern

```text
if condition is true:
    place element at slow
    slow++
```

---

# 9. Move Even Numbers to Front

```js
function moveEvenNumbers(nums) {

    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {

        if (nums[fast] % 2 === 0) {

            [nums[slow], nums[fast]] =
            [nums[fast], nums[slow]];

            slow++;
        }
    }

    return nums;
}
```

Possible result:

```text
[2,4,6,1,3,5]
```

Order within each group isn't guaranteed.

---

# 10. Filter Array In-Place ⭐⭐⭐

Generic version:

```js
function filterInPlace(nums, isValid) {

    let slow = 0;

    for (let fast = 0; fast < nums.length; fast++) {

        if (isValid(nums[fast])) {
            nums[slow] = nums[fast];
            slow++;
        }
    }

    return slow;
}
```

Examples:

```js
nums[fast] !== 0
```

```js
nums[fast] > 0
```

```js
nums[fast] % 2 === 0
```

```js
nums[fast] !== target
```

---

# 11. Squares of Sorted Array

This is worth understanding because it combines **two-pointer reasoning** with writing into an output array.

Input:

```text
[-4,-1,0,3,10]
```

Output:

```text
[0,1,9,16,100]
```

Here the pointers move from opposite ends:

```js
function sortedSquares(nums) {

    const result = new Array(nums.length);

    let left = 0;
    let right = nums.length - 1;

    let write = nums.length - 1;

    while (left <= right) {

        const leftSquare = nums[left] ** 2;
        const rightSquare = nums[right] ** 2;

        if (leftSquare > rightSquare) {
            result[write] = leftSquare;
            left++;
        } else {
            result[write] = rightSquare;
            right--;
        }

        write--;
    }

    return result;
}
```

This is technically an **opposite-direction + write-pointer** problem.

---

# PART II — STRINGS

Fast/slow ideas can also be applied to strings, particularly when the task is to **filter, compact, or compare characters**.

Because JavaScript strings are immutable, true in-place modification is generally done using an array of characters or by constructing a result.

---

# 12. Remove Characters from String

Remove all vowels.

```text
Input:
"javascript"

Output:
"jvscript"
```

### Solution

```js
function removeVowels(s) {

    const chars = s.split("");

    let slow = 0;

    for (let fast = 0; fast < chars.length; fast++) {

        if (!"aeiouAEIOU".includes(chars[fast])) {
            chars[slow] = chars[fast];
            slow++;
        }
    }

    return chars.slice(0, slow).join("");
}
```

### Pattern

```text
fast → read character
slow → write valid character
```

---

# 13. Remove Spaces

```js
function removeSpaces(s) {

    const chars = s.split("");

    let slow = 0;

    for (let fast = 0; fast < chars.length; fast++) {

        if (chars[fast] !== " ") {
            chars[slow] = chars[fast];
            slow++;
        }
    }

    return chars.slice(0, slow).join("");
}
```

---

# 14. Keep Only Alphanumeric Characters

```js
function cleanString(s) {

    const chars = s.split("");

    let slow = 0;

    for (let fast = 0; fast < chars.length; fast++) {

        if (/^[a-zA-Z0-9]$/.test(chars[fast])) {
            chars[slow] = chars[fast];
            slow++;
        }
    }

    return chars.slice(0, slow).join("");
}
```

This pattern is useful when preparing strings for:

* palindrome checking
* normalization
* filtering
* preprocessing

---

# 15. Valid Palindrome ⭐⭐⭐

This one uses **opposite-direction pointers**, rather than classic same-direction fast/slow.

```js
function isPalindrome(s) {

    let left = 0;
    let right = s.length - 1;

    while (left < right) {

        while (
            left < right &&
            !/[a-zA-Z0-9]/.test(s[left])
        ) {
            left++;
        }

        while (
            left < right &&
            !/[a-zA-Z0-9]/.test(s[right])
        ) {
            right--;
        }

        if (
            s[left].toLowerCase() !==
            s[right].toLowerCase()
        ) {
            return false;
        }

        left++;
        right--;
    }

    return true;
}
```

---

# 16. String Compression

For problems involving consecutive repeated characters, a read/write pointer is useful.

Example:

```text
"aabbccc"

→

"a2b2c3"
```

```js
function compress(chars) {

    let read = 0;
    let write = 0;

    while (read < chars.length) {

        const current = chars[read];

        let count = 0;

        while (
            read < chars.length &&
            chars[read] === current
        ) {
            read++;
            count++;
        }

        chars[write++] = current;

        if (count > 1) {

            for (const digit of String(count)) {
                chars[write++] = digit;
            }
        }
    }

    return write;
}
```

Here:

```text
read  → scans
write → builds compressed result
```

---

# PART III — LINKED LIST

This is where the classic **Fast & Slow Pointer** pattern becomes especially important.

---

# 17. Middle of Linked List ⭐⭐⭐

```text
1 → 2 → 3 → 4 → 5
```

### Solution

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

### Why?

```text
slow = 1 step
fast = 2 steps
```

When `fast` reaches the end:

```text
slow = middle
```

---

# 18. Detect Linked List Cycle ⭐⭐⭐⭐

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

### Mental model

Imagine runners on a circular track:

```text
slow → 1 step
fast → 2 steps
```

The faster runner eventually catches the slower runner.

---

# 19. Find Beginning of Cycle ⭐⭐⭐⭐⭐

```js
function detectCycle(head) {

    let slow = head;
    let fast = head;

    // Phase 1
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

    // Phase 2
    slow = head;

    while (slow !== fast) {

        slow = slow.next;
        fast = fast.next;
    }

    return slow;
}
```

### Remember

```text
Phase 1:
slow = 1x
fast = 2x
        ↓
find meeting point

Phase 2:
slow = head
fast = meeting point

both = 1x
        ↓
cycle entrance
```

---

# 20. Palindrome Linked List ⭐⭐⭐⭐

Example:

```text
1 → 2 → 2 → 1
```

Approach:

```text
Find middle
    ↓
Reverse second half
    ↓
Compare both halves
```

```js
function isPalindrome(head) {

    let slow = head;
    let fast = head;

    // Find middle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse second half
    let prev = null;

    while (slow) {

        const next = slow.next;

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

---

# 21. Reorder List ⭐⭐⭐⭐⭐

Input:

```text
1 → 2 → 3 → 4 → 5
```

Output:

```text
1 → 5 → 2 → 4 → 3
```

Three patterns:

```text
1. Fast/Slow → find middle
2. Reverse → second half
3. Merge → two lists
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

        const next = second.next;

        second.next = prev;

        prev = second;
        second = next;
    }

    // Merge
    let first = head;
    second = prev;

    while (second) {

        const firstNext = first.next;
        const secondNext = second.next;

        first.next = second;
        second.next = firstNext;

        first = firstNext;
        second = secondNext;
    }
}
```

---

# 22. Remove Nth Node From End ⭐⭐⭐⭐

This uses a **fixed-distance Fast/Slow pattern**.

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

    // Move together
    while (fast.next) {

        slow = slow.next;
        fast = fast.next;
    }

    // Remove target
    slow.next = slow.next.next;

    return dummy.next;
}
```

### Key idea

Maintain:

```text
distance(slow, fast) = n
```

Then when `fast` reaches the end:

```text
slow = node before target
```

---

# 23. Find Kth Node From End

Similar fixed-gap pattern.

```js
function kthFromEnd(head, k) {

    let slow = head;
    let fast = head;

    for (let i = 0; i < k; i++) {
        if (!fast) return null;
        fast = fast.next;
    }

    while (fast) {
        slow = slow.next;
        fast = fast.next;
    }

    return slow;
}
```

---

# 24. Find Duplicate Number ⭐⭐⭐⭐⭐

This is one of the most interesting applications because the input is an **array**, but we treat it like a linked-list cycle.

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

### Think

```text
index → value → next index
```

Example:

```text
nums = [1,3,4,2,2]

0 → 1 → 3 → 2
        ↑     ↓
        ← ← ←
```

The duplicate creates a cycle.

---

# PART IV — SEQUENCE / MATHEMATICAL PROBLEMS

# 25. Happy Number ⭐⭐⭐⭐

Fast & Slow pointers aren't restricted to physical pointers.

A sequence can behave like a linked list:

```text
n
↓
next(n)
↓
next(next(n))
↓
...
```

### Solution

```js
function isHappy(n) {

    function getNext(num) {

        let sum = 0;

        while (num > 0) {

            const digit = num % 10;

            sum += digit * digit;

            num = Math.floor(num / 10);
        }

        return sum;
    }

    let slow = n;
    let fast = getNext(n);

    while (fast !== 1 && slow !== fast) {

        slow = getNext(slow);
        fast = getNext(getNext(fast));
    }

    return fast === 1;
}
```

### Important concept

If a sequence does not terminate, in a finite state space it eventually repeats.

Therefore:

```text
repetition = cycle
```

And Fast & Slow detects the cycle.

---

# PART V — FAST/SLOW VS OTHER TWO-POINTER PATTERNS

This distinction is extremely important in interviews.

## A. Opposite Direction

```text
left →       ← right

[ 1 2 3 4 5 6 ]
```

Typical:

```text
Two Sum II
3Sum
Palindrome
Container With Most Water
Trapping Rain Water
```

---

## B. Same Direction — Read/Write

```text
slow →
fast  →
```

Typical:

```text
Move Zeroes
Remove Element
Remove Duplicates
Partition Array
Filter
Compression
```

---

## C. Different Speed

```text
slow → 1 step
fast → 2 steps
```

Typical:

```text
Middle Linked List
Cycle Detection
Cycle Start
Happy Number
Find Duplicate
```

---

## D. Fixed Gap

```text
slow →
       fast → → → → 
```

Typical:

```text
Remove Nth Node From End
Kth Node From End
```

---

# PART VI — HOW TO RECOGNIZE THE PATTERN

When you see this in a question:

### "In-place"

Think:

```text
Read/Write pointers
```

---

### "Remove elements"

Think:

```text
fast = scan
slow = write
```

---

### "Keep relative order"

Think:

```text
Read/Write
```

---

### "Sorted array + remove duplicates"

Think:

```text
slow/fast
```

---

### "Middle of linked list"

Think:

```text
slow = 1x
fast = 2x
```

---

### "Cycle"

Think:

```text
Floyd's Algorithm
slow = 1x
fast = 2x
```

---

### "Nth from end"

Think:

```text
fixed gap
```

---

### "Duplicate number"

Think:

```text
array → linked-list interpretation → cycle
```

---

### "String compression/filtering"

Think:

```text
read/write
```

---

# PART VII — COMPLEXITY

Most Fast/Slow pointer solutions provide:

```text
Time:  O(n)
Space: O(1)
```

For example:

```text
Move Zeroes
Remove Element
Remove Duplicates
Middle Linked List
Cycle Detection
Remove Nth Node
```

Some combined algorithms may have different complexity.

For example:

```text
3Sum
Time: O(n²)
Space: O(1) auxiliary, excluding output
```

---

# PART VIII — INTERVIEW INVARIANTS

Don't just say:

> "I'll use two pointers."

Say what each pointer **means**.

### Array

> "`fast` scans every element, while `slow` points to the next position where a valid element should be written."

### Middle of linked list

> "`slow` moves one node at a time while `fast` moves two, so when `fast` reaches the end, `slow` is at the middle."

### Cycle

> "If a cycle exists, the faster pointer will eventually catch the slower pointer."

### Remove Nth from end

> "I maintain an `n`-node gap between the pointers, so when `fast` reaches the end, `slow` is immediately before the target."

These explanations are more important than memorizing syntax.

---

# PART IX — MASTER TEMPLATES

## Template 1 — Read / Write

```js
let slow = 0;

for (let fast = 0; fast < nums.length; fast++) {

    if (condition(nums[fast])) {

        nums[slow] = nums[fast];

        slow++;
    }
}

return slow;
```

---

## Template 2 — Swap / Partition

```js
let slow = 0;

for (let fast = 0; fast < nums.length; fast++) {

    if (condition(nums[fast])) {

        [nums[slow], nums[fast]] =
        [nums[fast], nums[slow]];

        slow++;
    }
}
```

---

## Template 3 — Different Speed

```js
let slow = head;
let fast = head;

while (fast && fast.next) {

    slow = slow.next;
    fast = fast.next.next;
}
```

---

## Template 4 — Cycle Detection

```js
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
```

---

## Template 5 — Fixed Gap

```js
let slow = head;
let fast = head;

for (let i = 0; i < k; i++) {
    fast = fast.next;
}

while (fast) {

    slow = slow.next;
    fast = fast.next;
}
```

---

# PART X — COMPLETE PROBLEM ROADMAP

Practice these in this order:

```text
                    FAST & SLOW
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
      ARRAY            STRING          LINKED LIST
        │                │                │
        ↓                ↓                ↓
Remove Element      Remove Spaces    Middle List
Move Zeroes         Remove Vowels     Cycle
Remove Duplicates   Filter Chars      Cycle Start
Partition           Compression       Palindrome
                    │                 Remove Nth
                    │                 Reorder
                    │                 Kth from End
                    │
                    └───────┐
                            ↓
                    SEQUENCE / ARRAY
                            │
                       Happy Number
                       Find Duplicate
```

### Recommended interview sequence

```text
01. Remove Element
02. Move Zeroes
03. Remove Duplicates from Sorted Array
04. Remove Duplicates II
05. Partition Array
06. String Filtering
07. String Compression
08. Middle of Linked List
09. Linked List Cycle
10. Linked List Cycle II
11. Remove Nth Node From End
12. Kth Node From End
13. Palindrome Linked List
14. Happy Number
15. Find Duplicate Number
16. Reorder List
17. Circular Array Loop
```

---

# 🧠 FINAL CHEAT SHEET

```text
FAST & SLOW POINTERS
│
├── 1. READ / WRITE
│
│   fast → READ
│   slow → WRITE
│
│   Used for:
│   • Move Zeroes
│   • Remove Element
│   • Remove Duplicates
│   • Partition
│   • Filter
│   • Compression
│
├── 2. DIFFERENT SPEED
│
│   slow → 1 step
│   fast → 2 steps
│
│   Used for:
│   • Middle Linked List
│   • Cycle Detection
│   • Cycle Start
│   • Happy Number
│   • Find Duplicate
│
├── 3. FIXED GAP
│
│   slow →
│   fast → → → → n
│
│   Used for:
│   • Remove Nth From End
│   • Kth From End
│
└── 4. OPPOSITE DIRECTION
    ← left       right →
    
    Used for:
    • Two Sum II
    • 3Sum
    • Palindrome
    • Container
    • Trapping Rain Water
```

## The 4 questions to ask yourself

Whenever you see a new DSA problem, ask:

```text
1. Do I need to READ and WRITE in the same array?
       ↓
   FAST + SLOW

2. Do I need to find a MIDDLE or CYCLE?
       ↓
   SLOW = 1x
   FAST = 2x

3. Do I need a fixed DISTANCE from the end?
       ↓
   FAST = k positions ahead

4. Do I need to compare BOTH ENDS?
       ↓
   LEFT → ← RIGHT
```

### The one-line memory trick

> **Fast explores, Slow builds; if speed matters, Fast moves 2×; if distance matters, Fast stays `k` ahead; if both ends matter, use Left/Right.**

This gives you the complete **Fast & Slow / Two-Pointer family** across **arrays, strings, linked lists, and sequence/cycle problems**.
