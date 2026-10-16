# SQL vs MongoDB — Complete Query Memory Notes

These notes are designed for quick revision, query-writing practice, and 5+ years experience interview preparation. The key is to remember the pattern behind each method rather than memorizing every query separately.

We'll use PostgreSQL for SQL examples and the MongoDB shell for MongoDB examples.

## 1. The master memory map

SQL

Tables → rows → columns → SQL statements

`SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT`

MongoDB

Collections → documents → fields → methods

`find → filter → projection → sort → skip → limit`

The most important distinction:

- SQL usually expresses a query as clauses in a statement.
- MongoDB commonly uses methods with JavaScript-style objects and, for complex queries, aggregation stages.

## 2. Basic CRUD — the four operations

CRUD is the foundation of both databases.

| Operation | SQL — PostgreSQL | MongoDB                        |
| --------- | ---------------- | ------------------------------ |
| Create    | `INSERT INTO`    | `insertOne()` / `insertMany()` |
| Read      | `SELECT`         | `find()` / `findOne()`         |
| Update    | `UPDATE ... SET` | `updateOne()` / `updateMany()` |
| Delete    | `DELETE FROM`    | `deleteOne()` / `deleteMany()` |

Memory trick: C-R-U-D = Create, Read, Update, Delete.

Assume the SQL table and MongoDB collection are both named `users`.

### Create

SQL:

```
INSERT INTO users (name, age, city)
VALUES ('Nithesh', 28, 'Mangalore');
```

MongoDB:

```
db.users.insertOne({
  name: "Nithesh",
  age: 28,
  city: "Mangalore"
});
```

### Read

SQL:

```
SELECT * FROM users;
```

MongoDB:

```
db.users.find({});
```

### Update

SQL:

```
UPDATE users
SET age = 29
WHERE name = 'Nithesh';
```

MongoDB:

```
db.users.updateOne(
  { name: "Nithesh" },
  { $set: { age: 29 } }
);
```

### Delete

SQL:

```
DELETE FROM users
WHERE name = 'Nithesh';
```

MongoDB:

```
db.users.deleteOne({
  name: "Nithesh"
});
```

Interview warning: SQL `UPDATE` and `DELETE` statements without a `WHERE` clause can affect every row. MongoDB's `updateMany()` and `deleteMany()` can affect every matching document; an empty filter matches all documents. Always verify your filter before executing destructive operations.

## 3. Filtering — the operators you must remember

This is one of the highest-value sections for interviews.

| Meaning          | SQL                     | MongoDB                           |
| ---------------- | ----------------------- | --------------------------------- |
| Equal            | `age = 25`              | `{ age: 25 }`                     |
| Not equal        | `age <> 25`             | `{ age: { $ne: 25 } }`            |
| Greater than     | `age > 25`              | `{ age: { $gt: 25 } }`            |
| Less than        | `age < 25`              | `{ age: { $lt: 25 } }`            |
| Greater or equal | `age >= 25`             | `{ age: { $gte: 25 } }`           |
| Less or equal    | `age <= 25`             | `{ age: { $lte: 25 } }`           |
| Match a list     | `age IN (20, 25, 30)`   | `{ age: { $in: [20, 25, 30] } }`  |
| Exclude a list   | `age NOT IN (20, 25)`   | `{ age: { $nin: [20, 25] } }`     |
| Match a range    | `age BETWEEN 20 AND 30` | `{ age: { $gte: 20, $lte: 30 } }` |
| Is null          | `city IS NULL`          | `{ city: null }`                  |
| Is not null      | `city IS NOT NULL`      | `{ city: { $ne: null } }`         |

Important MongoDB nuance: `{ city: null }` matches documents where `city` is null or missing. `{ city: { $ne: null } }` matches documents where the field exists and is non-null. For explicit existence checks, MongoDB offers `$exists`.

### Memory pattern

SQL comparison

`WHERE column operator value`

MongoDB comparison

`{ field: { $operator: value } }`

Exception: equality is usually written directly in MongoDB, such as `{ age: 25 }`.

## 4. Logical operators — AND, OR, NOT

| Meaning          | SQL   | MongoDB                               |
| ---------------- | ----- | ------------------------------------- |
| Both conditions  | `AND` | Separate fields, or `$and`            |
| Either condition | `OR`  | `$or`                                 |
| Negation         | `NOT` | `$not` or `$nor`, depending on intent |

SQL:

```
SELECT *
FROM users
WHERE age > 25
  AND city = 'Mangalore';
```

MongoDB — AND:

```
db.users.find({
  age: { $gt: 25 },
  city: "Mangalore"
});
```

SQL — OR:

```
SELECT *
FROM users
WHERE city = 'Mangalore'
   OR city = 'Bangalore';
```

MongoDB — OR:

```
db.users.find({
  $or: [
    { city: "Mangalore" },
    { city: "Bangalore" }
  ]
});
```

Memory trick: AND = all conditions must match. OR = at least one condition matches.

When checking multiple possible values for the same field, `$in` is often simpler than `$or`.

## 5. Selecting fields, sorting and limiting results

| Requirement     | SQL                  | MongoDB                                  |
| --------------- | -------------------- | ---------------------------------------- |
| All fields      | `SELECT *`           | `find({})`                               |
| Specific fields | `SELECT name, age`   | Projection `{ name: 1, age: 1, _id: 0 }` |
| Ascending sort  | `ORDER BY age ASC`   | `.sort({ age: 1 })`                      |
| Descending sort | `ORDER BY age DESC`  | `.sort({ age: -1 })`                     |
| Limit results   | `LIMIT 5`            | `.limit(5)`                              |
| Skip records    | `OFFSET 10`          | `.skip(10)`                              |
| One record      | Query with `LIMIT 1` | `findOne()`                              |

Example: Get the five oldest users.

SQL:

```
SELECT name, age
FROM users
ORDER BY age DESC
LIMIT 5;
```

MongoDB:

```
db.users.find(
  {},
  { _id: 0, name: 1, age: 1 }
).sort({ age: -1 }).limit(5);
```

Memory trick: Filter → Project → Sort → Limit.

MongoDB method order can be arranged differently in chained code, but filtering, projection, sorting and limiting are the concepts to remember. For reliable pagination, sort by a unique field as a tie-breaker.

## 6. Pattern matching — SQL `LIKE` vs MongoDB `$regex`

| Requirement   | SQL            | MongoDB                       |
| ------------- | -------------- | ----------------------------- |
| Starts with N | `LIKE 'N%'`    | `{ name: { $regex: "^N" } }`  |
| Ends with a   | `LIKE '%a'`    | `{ name: { $regex: "a$" } }`  |
| Contains ith  | `LIKE '%ith%'` | `{ name: { $regex: "ith" } }` |
| Exact match   | `= 'Nithesh'`  | `{ name: "Nithesh" }`         |

Remember:

- SQL `%` = any number of characters.
- SQL `_` = exactly one character.
- MongoDB uses regular expressions, where `^` means start and `$` means end.

PostgreSQL `LIKE` is case-sensitive; `ILIKE` is case-insensitive. MongoDB regex matching is case-sensitive by default; the `i` option enables case-insensitive matching.

Example:

```
db.users.find({
  name: { $regex: "^n", $options: "i" }
});
```

This matches names beginning with `n` or `N`.

## 7. Aggregation — COUNT, SUM, AVG, GROUP BY

These patterns are especially important for intermediate and senior interviews.

| Requirement   | SQL           | MongoDB                 |
| ------------- | ------------- | ----------------------- |
| Count records | `COUNT(*)`    | `countDocuments({})`    |
| Sum values    | `SUM(salary)` | `$sum` in aggregation   |
| Average       | `AVG(salary)` | `$avg` in aggregation   |
| Minimum       | `MIN(salary)` | `$min` in aggregation   |
| Maximum       | `MAX(salary)` | `$max` in aggregation   |
| Group records | `GROUP BY`    | `$group`                |
| Filter groups | `HAVING`      | `$match` after `$group` |

### Example: Average age by city

SQL:

```
SELECT city, AVG(age) AS average_age
FROM users
GROUP BY city;
```

MongoDB:

```
db.users.aggregate([
  {
    $group: {
      _id: "$city",
      averageAge: { $avg: "$age" }
    }
  }
]);
```

Memory trick:

- SQL: `GROUP BY` collects records into groups.
- MongoDB: `$group` creates groups, and `_id` identifies each group.
- MongoDB field references inside aggregation expressions often start with `$`, such as `"$age"`.

### Example: Cities with average age above 25

SQL:

```
SELECT city, AVG(age) AS average_age
FROM users
GROUP BY city
HAVING AVG(age) > 25;
```

MongoDB:

```
db.users.aggregate([
  {
    $group: {
      _id: "$city",
      averageAge: { $avg: "$age" }
    }
  },
  {
    $match: {
      averageAge: { $gt: 25 }
    }
  }
]);
```

Interview distinction: `WHERE` filters individual rows before grouping. `HAVING` filters groups after aggregation. In MongoDB, `$match` can appear before or after `$group`, depending on what you need to filter.

## 8. JOIN vs `$lookup` — combining related data

Suppose you have a `users` table and an `applications` table.

| Requirement                     | SQL                                   | MongoDB                                                           |
| ------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| Combine related records         | `JOIN`                                | `$lookup`                                                         |
| Keep only matching records      | `INNER JOIN`                          | `$lookup` followed by appropriate filtering or `$unwind` behavior |
| Keep all records from left side | `LEFT JOIN`                           | `$lookup` preserves unmatched source documents in an array        |
| Flatten an array                | Not usually needed for a regular join | `$unwind`                                                         |

SQL:

```
SELECT u.name, a.company
FROM users u
INNER JOIN applications a
  ON u.id = a.user_id;
```

MongoDB:

```
db.users.aggregate([
  {
    $lookup: {
      from: "applications",
      localField: "_id",
      foreignField: "userId",
      as: "applications"
    }
  }
]);
```

MongoDB's `$lookup` returns matching records as an array. Unlike a SQL `INNER JOIN`, it preserves source documents with no matches by default. To discard users with no applications, you can unwind with `preserveNullAndEmptyArrays: false`, or filter for nonempty arrays.

Memory trick: SQL JOIN connects rows; MongoDB `$lookup` attaches matching documents.

## 9. Insert, update and delete — advanced patterns

| Requirement       | SQL                       | MongoDB                        |
| ----------------- | ------------------------- | ------------------------------ |
| Insert one        | `INSERT INTO`             | `insertOne()`                  |
| Insert many       | Multi-row `INSERT`        | `insertMany()`                 |
| Update one/many   | `UPDATE ... WHERE`        | `updateOne()` / `updateMany()` |
| Increment a value | `SET age = age + 1`       | `$inc: { age: 1 }`             |
| Set a field       | `SET city = ...`          | `$set`                         |
| Remove a field    | Schema-dependent `UPDATE` | `$unset`                       |
| Delete one/many   | `DELETE FROM ... WHERE`   | `deleteOne()` / `deleteMany()` |

Example: Increment every matching user's age by one.

SQL:

```
UPDATE users
SET age = age + 1
WHERE city = 'Mangalore';
```

MongoDB:

```
db.users.updateMany(
  { city: "Mangalore" },
  { $inc: { age: 1 } }
);
```

Memory trick: `$set` assigns a value, `$inc` increments a number, and `$unset` removes a field from a document.

## 10. Indexes, transactions and database design

These topics go beyond basic syntax, but they are essential for senior-level interviews.

| Concept                 | SQL / PostgreSQL                                                 | MongoDB                          |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------- |
| Create index            | `CREATE INDEX`                                                   | `createIndex()`                  |
| Unique constraint       | `UNIQUE` constraint/index                                        | Unique index                     |
| Transaction             | `BEGIN`, `COMMIT`, `ROLLBACK`                                    | Session transaction APIs         |
| Relationships           | Foreign keys                                                     | References or embedded documents |
| Schema validation       | Column types and constraints                                     | Collection validation rules      |
| Query analysis          | `EXPLAIN ANALYZE`                                                | `explain("executionStats")`      |
| Replication             | Streaming replication                                            | Replica sets                     |
| Horizontal partitioning | Partitioning; sharding through extensions or distributed systems | Sharding                         |

Example: Index users by email.

SQL:

```
CREATE INDEX idx_users_email
ON users(email);
```

MongoDB:

```
db.users.createIndex({ email: 1 });
```

For unique email values:

```
CREATE UNIQUE INDEX idx_users_email_unique
ON users(email);
```

```
db.users.createIndex(
  { email: 1 },
  { unique: true }
);
```

Interview memory trick: Indexes can accelerate reads and lookups, but they consume storage and add write overhead. Choose indexes based on actual query patterns and validate them with query plans.

Transactions group changes into an atomic unit. Both PostgreSQL and MongoDB support transactions, though their transaction scope and operational trade-offs differ.

## 11. The SQL query execution order

This is a favorite interview topic because writing order and logical processing order differ.

Typical SQL query:

```
SELECT city, COUNT(*) AS total
FROM users
WHERE age > 20
GROUP BY city
HAVING COUNT(*) > 1
ORDER BY total DESC
LIMIT 5;
```

Remember the logical order:

1

`FROM` — identify the source

2

`WHERE` — filter rows

3

`GROUP BY` — form groups

4

`HAVING` — filter groups

5

`SELECT` — determine output expressions

6

`ORDER BY` — sort results

7

`LIMIT` — restrict the result count

Memory sentence: From Where Groups Have Selected Orders Limited.

This is a simplified logical model, not a guarantee of the database's physical execution plan.

## 12. How to memorize all these methods

Don't attempt to memorize the entire reference in one sitting. Use a repeatable method.

1. Understand: Read a pattern and explain what it does without looking at the definition.
2. Reproduce: Close the notes and write the SQL and MongoDB versions.
3. Transform: Change the requirement, such as `age > 25` to `age BETWEEN 20 AND 30`.
4. Compare: Explain the difference between the two database approaches.
5. Review: Revisit the pattern after 1, 3, 7, 14 and 30 days.

## 13. Interactive revision test

Let's test whether you can recall the patterns without copying them. You can refer back to the notes after attempting the answers.

## Database memory challenge

Write the query yourself. Focus on the correct pattern, not speed.

1\. SQL filtering

Find users older than 25 who live in Bangalore.

2\. MongoDB filtering

Find users whose age is between 20 and 30, inclusive.

3\. SQL aggregation

Count how many users live in each city.

4\. MongoDB update

Increase the age of all users living in Mangalore by one.

5\. Interview explanation

Why can an index improve query performance, and what is its trade-off?

Evaluate my recall

My recommendation: keep this as your master revision sheet. First master filtering, sorting, CRUD and grouping. Then move into joins, aggregation pipelines, indexing, transactions, query optimization and system design. Those advanced topics will build on the patterns here.