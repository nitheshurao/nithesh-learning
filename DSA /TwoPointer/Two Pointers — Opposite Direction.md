Absolutely. Here are the **most important Two Pointers — Opposite Direction** interview questions in **JavaScript**, arranged from easy → advanced.

### Pattern

```text
left → → →       ← ← ← right

[  ...  ...  ...  ...  ...  ]
```

Usually:

```js
let left = 0;
let right = arr.length - 1;

while (left < right) {
    // process arr[left] and arr[right]

    if (condition) {
        left++;
    } else {
        right--;
    }
}
```

---

# 🔥 15 Opposite-Direction Two Pointer Problems


| #  | Problem                                    | Difficulty | Main Pattern            |
| -- | ------------------------------------------ | ---------- | ----------------------- |
| 1  | Reverse an Array                           | Easy       | Swap                    |
| 2  | Check Palindrome                           | Easy       | Compare                 |
| 3  | Valid Palindrome                           | Easy       | Skip characters         |
| 4  | Two Sum II                                 | Easy       | Move based on sum       |
| 5  | Container With Most Water                  | Medium     | Move shorter side       |
| 6  | 3Sum                                       | Medium     | Sort + Two Pointers     |
| 7  | 3Sum Closest                               | Medium     | Sort + Two Pointers     |
| 8  | Remove Duplicates from Sorted Array        | Easy       | Two pointers            |
| 9  | Squares of a Sorted Array                  | Easy       | Compare absolute values |
| 10 | Boats to Save People                       | Medium     | Greedy + Two Pointers   |
| 11 | Valid Triangle Number                      | Medium     | Sort + pointers         |
| 12 | 4Sum                                       | Medium     | Nested + Two Pointers   |
| 13 | Trapping Rain Water                        | Hard       | Left/right boundaries   |
| 14 | Minimum Number of Moves to Make Palindrome | Medium     | Two pointers + greedy   |
| 15 | Palindrome Linked List                     | Medium     | Fast/slow + reverse     |

---

# 1. Reverse an Array

### Input

```js
[1, 2, 3, 4, 5]
```

### Output

```js
[5, 4, 3, 2, 1]
```

### Solution

```js
function reverseArray(arr) {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];

        left++;
        right--;
    }

    return arr;
}

console.log(reverseArray([1, 2, 3, 4, 5]));
```

### Complexity

```text
Time:  O(n)
Space: O(1)
```

---

# 2. Check Palindrome

```js
function isPalindrome(str) {
    let left = 0;
    let right = str.length - 1;

    while (left < right) {
        if (str[left] !== str[right]) {
            return false;
        }

        left++;
        right--;
    }

    return true;
}

console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false
```

### Core idea

```text
r a c e c a r
↑           ↑
L           R

  ↑       ↑
  L       R

    ↑   ↑
    L   R
```

Compare the outside characters and move inward.

---

# 3. Valid Palindrome

Ignore spaces, punctuation and capitalization.

### Input

```text
"A man, a plan, a canal: Panama"
```

### Output

```text
true
```

### Solution

```js
function isValidPalindrome(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {

        while (left < right && !isAlphaNumeric(s[left])) {
            left++;
        }

        while (left < right && !isAlphaNumeric(s[right])) {
            right--;
        }

        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }

        left++;
        right--;
    }

    return true;
}

function isAlphaNumeric(char) {
    return /^[a-zA-Z0-9]$/.test(char);
}

console.log(
    isValidPalindrome("A man, a plan, a canal: Panama")
); // true
```

---

# 4. Two Sum II

Given a **sorted array**, find two numbers that add to target.

### Input

```js
numbers = [2, 7, 11, 15]
target = 9
```

### Output

```js
[1, 2]
```

### Solution

```js
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;

    while (left < right) {
        const sum = numbers[left] + numbers[right];

        if (sum === target) {
            return [left + 1, right + 1];
        }

        if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return [];
}
```

### The important logic

```text
sum < target
     ↓
increase sum
     ↓
left++

sum > target
     ↓
decrease sum
     ↓
right--
```

This is one of the **most important opposite-direction patterns**.

---

# 5. Container With Most Water

### Input

```js
[1,8,6,2,5,4,8,3,7]
```

### Output

```text
49
```

### Solution

```js
function maxArea(height) {
    let left = 0;
    let right = height.length - 1;

    let max = 0;

    while (left < right) {
        const width = right - left;

        const currentHeight = Math.min(
            height[left],
            height[right]
        );

        const area = width * currentHeight;

        max = Math.max(max, area);

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    return max;
}
```

### Critical interview concept

Why move the **shorter line**?

Because:

```text
area = width × min(leftHeight, rightHeight)
```

Moving the taller line cannot increase the limiting height while width decreases.

So:

```js
if (height[left] < height[right]) {
    left++;
} else {
    right--;
}
```

---

# 6. 3Sum

Find all unique triplets whose sum is `0`.

### Input

```js
[-1, 0, 1, 2, -1, -4]
```

### Output

```js
[
    [-1, -1, 2],
    [-1, 0, 1]
]
```

### Solution

```js
function threeSum(nums) {
    nums.sort((a, b) => a - b);

    const result = [];

    for (let i = 0; i < nums.length - 2; i++) {

        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }

        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {

            const sum = nums[i] + nums[left] + nums[right];

            if (sum === 0) {
                result.push([
                    nums[i],
                    nums[left],
                    nums[right]
                ]);

                while (
                    left < right &&
                    nums[left] === nums[left + 1]
                ) {
                    left++;
                }

                while (
                    left < right &&
                    nums[right] === nums[right - 1]
                ) {
                    right--;
                }

                left++;
                right--;

            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}
```

### Complexity

```text
Sorting: O(n log n)
Two pointers: O(n²)

Total: O(n²)
```

---

# 7. 3Sum Closest

Find three numbers whose sum is closest to target.

```js
function threeSumClosest(nums, target) {
    nums.sort((a, b) => a - b);

    let closest = nums[0] + nums[1] + nums[2];

    for (let i = 0; i < nums.length - 2; i++) {

        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {

            const sum =
                nums[i] +
                nums[left] +
                nums[right];

            if (
                Math.abs(target - sum) <
                Math.abs(target - closest)
            ) {
                closest = sum;
            }

            if (sum < target) {
                left++;
            } else if (sum > target) {
                right--;
            } else {
                return sum;
            }
        }
    }

    return closest;
}
```

---

# 8. Squares of a Sorted Array

### Input

```js
[-4, -1, 0, 3, 10]
```

### Output

```js
[0, 1, 9, 16, 100]
```

### Solution

```js
function sortedSquares(nums) {
    const result = new Array(nums.length);

    let left = 0;
    let right = nums.length - 1;

    let index = nums.length - 1;

    while (left <= right) {

        const leftSquare = nums[left] ** 2;
        const rightSquare = nums[right] ** 2;

        if (leftSquare > rightSquare) {
            result[index] = leftSquare;
            left++;
        } else {
            result[index] = rightSquare;
            right--;
        }

        index--;
    }

    return result;
}
```

### Key observation

The **largest square** must come from either:

```text
leftmost negative
        OR
rightmost positive
```

So compare both ends.

---

# 9. Boats to Save People

Each boat can carry at most two people.

### Input

```js
people = [3,2,2,1]
limit = 3
```

### Output

```text
3
```

### Solution

```js
function numRescueBoats(people, limit) {
    people.sort((a, b) => a - b);

    let left = 0;
    let right = people.length - 1;

    let boats = 0;

    while (left <= right) {

        if (people[left] + people[right] <= limit) {
            left++;
        }

        right--;
        boats++;
    }

    return boats;
}
```

### Pattern

Always put the **heaviest person** on a boat.

Then:

```text
Can lightest + heaviest fit?
        ↓
      YES → both go
        ↓
       NO → heaviest alone
```

---

# 10. Valid Triangle Number

Given side lengths, count combinations that can form a triangle.

### Key condition

For sorted:

```text
a <= b <= c
```

Triangle exists when:

```text
a + b > c
```

### Solution

```js
function triangleNumber(nums) {
    nums.sort((a, b) => a - b);

    let count = 0;

    for (let right = nums.length - 1; right >= 2; right--) {

        let left = 0;
        let middle = right - 1;

        while (left < middle) {

            if (nums[left] + nums[middle] > nums[right]) {

                count += middle - left;
                middle--;

            } else {
                left++;
            }
        }
    }

    return count;
}
```

---

# 11. 4Sum

Find unique quadruplets that sum to target.

```js
function fourSum(nums, target) {
    nums.sort((a, b) => a - b);

    const result = [];

    for (let i = 0; i < nums.length - 3; i++) {

        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }

        for (let j = i + 1; j < nums.length - 2; j++) {

            if (j > i + 1 && nums[j] === nums[j - 1]) {
                continue;
            }

            let left = j + 1;
            let right = nums.length - 1;

            while (left < right) {

                const sum =
                    nums[i] +
                    nums[j] +
                    nums[left] +
                    nums[right];

                if (sum === target) {

                    result.push([
                        nums[i],
                        nums[j],
                        nums[left],
                        nums[right]
                    ]);

                    while (
                        left < right &&
                        nums[left] === nums[left + 1]
                    ) {
                        left++;
                    }

                    while (
                        left < right &&
                        nums[right] === nums[right - 1]
                    ) {
                        right--;
                    }

                    left++;
                    right--;

                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }

    return result;
}
```

---

# 12. Trapping Rain Water

One of the most important **Hard** Two Pointer problems.

### Input

```js
[0,1,0,2,1,0,1,3,2,1,2,1]
```

### Output

```text
6
```

### Solution

```js
function trap(height) {
    let left = 0;
    let right = height.length - 1;

    let leftMax = 0;
    let rightMax = 0;

    let water = 0;

    while (left < right) {

        if (height[left] <= height[right]) {

            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }

            left++;

        } else {

            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }

            right--;
        }
    }

    return water;
}
```

### Core idea

```text
left →                ← right

[0,1,0,2,1,0,1,3,2,1,2,1]
 ↑                       ↑
left                    right
```

Process the side with the **smaller boundary**.

---

# 🧠 The Master Rule

For opposite-direction Two Pointers, don't memorize individual solutions.

Ask:

### 1. What does `left` represent?

### 2. What does `right` represent?

### 3. What information do I get by comparing them?

### 4. Which pointer can safely move?

For example:

### Two Sum

```js
sum < target → left++
sum > target → right--
```

### Container

```js
height[left] < height[right]
→ left++
```

### Palindrome

```js
s[left] !== s[right]
→ false
```

### Sorted Squares

```js
left² > right²
→ put left² at the end
→ left++
```

### Trapping Rain Water

```js
left boundary < right boundary
→ process left
```

---

# 🔥 Interview Practice Order

If you're preparing for **FAANG-style DSA interviews**, I would practice them in this order:

```text
LEVEL 1
│
├── Reverse Array
├── Palindrome
├── Valid Palindrome
│
LEVEL 2
│
├── Two Sum II
├── Squares of Sorted Array
├── Remove Duplicates
│
LEVEL 3
│
├── Container With Most Water
├── Boats to Save People
├── 3Sum
│
LEVEL 4
│
├── 3Sum Closest
├── Valid Triangle Number
├── 4Sum
│
LEVEL 5
│
└── Trapping Rain Water
```

The **core pattern** to master is:

```text
          left              right
            ↓                 ↓
       [  2  3  5  7  9  11  ]
            →               ←

             compare
                ↓
        make a decision
                ↓
       move left OR right
                ↓
             repeat
```

If you master **why the pointer moves**, rather than memorizing the code, you can derive most opposite-direction problems during an interview.
