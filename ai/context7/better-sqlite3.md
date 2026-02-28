# Better-SQLite3 Documentation

Source: Context7 - `/wiselibs/better-sqlite3`

## Overview

Better-SQLite3 is the fastest and simplest library for SQLite in Node.js, offering:
- Full transaction support
- High performance
- Easy-to-use synchronous API
- Prepared statements
- Memory-efficient iteration

---

## Database Initialization

### Basic Connection

```javascript
const Database = require('better-sqlite3');

// Open a file-based database
const db = new Database('myapp.db');
```

**ES6 Modules:**

```javascript
import Database from 'better-sqlite3';
const db = new Database('myapp.db');
```

### Database Options

```javascript
const db = new Database('myapp.db', {
  readonly: false,           // Open in read-only mode (default: false)
  fileMustExist: false,      // Throw error if file doesn't exist (default: false)
  timeout: 5000,             // Timeout for locked database in ms (default: 5000)
  verbose: console.log,      // Log all SQL statements (default: null)
  nativeBinding: './path/to/better_sqlite3.node'  // Custom native addon path
});
```

**Options:**
- `readonly` - Opens the database in read-only mode
- `fileMustExist` - Throws an error if the database file doesn't exist (ignored for in-memory/temporary/readonly databases)
- `timeout` - Milliseconds to wait when executing queries on a locked database before throwing `SQLITE_BUSY` error
- `verbose` - Function called with every SQL string executed (useful for debugging)
- `nativeBinding` - Custom file path to `better_sqlite3.node` (for complex build systems)

### Special Database Types

#### In-Memory Database

```javascript
const memDb = new Database(':memory:');
```

**Use cases:**
- Testing
- Temporary data storage
- Fast operations without disk I/O

#### Temporary Database

```javascript
// Creates a temporary file that's automatically deleted
const tempDb = new Database('');

// Or omit all arguments
const tempDb2 = new Database();
```

#### Database from Serialized Buffer

```javascript
// Serialize an existing database
const buffer = existingDb.serialize();

// Create new database from buffer
const clonedDb = new Database(buffer);
```

### Enable WAL Mode (Recommended)

```javascript
import Database from 'better-sqlite3';
const db = new Database('foobar.db');

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');
```

---

## Running Queries

### Prepared Statements

Better-SQLite3 uses prepared statements for all queries. This provides:
- Security against SQL injection
- Better performance for repeated queries
- Clean parameter binding

### Creating Tables

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER
  )
`);
```

### Query Methods

#### .get() - Get Single Row

Returns the first row or `undefined` if no data is found.

```javascript
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
const user = stmt.get(1);

console.log(user);
// { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 }

if (user) {
  console.log(user.name);
} else {
  console.log('User not found');
}
```

**Example with specific field:**

```javascript
const stmt = db.prepare('SELECT age FROM cats WHERE name = ?');
const cat = stmt.get('Joey');

console.log(cat.age); // => 2
```

#### .all() - Get All Rows

Returns an array of all matching rows. Returns empty array if no rows found.

```javascript
const stmt = db.prepare('SELECT * FROM users WHERE age >= ?');
const users = stmt.all(25);

console.log(users.length); // Number of matching rows
console.log(users);
// [
//   { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
//   { id: 2, name: 'Bob', email: 'bob@example.com', age: 28 }
// ]
```

**Get all rows:**

```javascript
const stmt = db.prepare('SELECT * FROM cats WHERE name = ?');
const cats = stmt.all('Joey');

console.log(cats.length); // => 1
```

#### .iterate() - Memory-Efficient Iteration

Returns an iterator for retrieving rows one by one. More memory-efficient than `.all()` for large result sets.

```javascript
const stmt = db.prepare('SELECT * FROM users');

for (const row of stmt.iterate()) {
  console.log(row.name);

  // Can break early
  if (row.name === 'Joey') {
    console.log('found him!');
    break;
  }
}
```

**When to use:**
- Large result sets that don't fit in memory
- Processing rows one at a time
- Early termination conditions

---

## Inserts, Updates, and Deletes

### .run() - Execute Modifications

Returns an info object with `changes` and `lastInsertRowid`.

#### Basic Insert

```javascript
const stmt = db.prepare('INSERT INTO cats (name, age) VALUES (?, ?)');
const info = stmt.run('Joey', 2);

console.log(info.changes);        // => 1 (number of rows affected)
console.log(info.lastInsertRowid); // => 1 (ID of inserted row)
```

#### Complete Example

```javascript
const db = new Database('myapp.db');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER
  )
`);

// Prepare insert statement
const insert = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)');

// Execute insert
const info = insert.run('Alice', 'alice@example.com', 30);
console.log(info.changes);        // 1
console.log(info.lastInsertRowid); // 1
```

#### Update Statement

```javascript
const update = db.prepare('UPDATE users SET age = ? WHERE id = ?');
const info = update.run(31, 1);

console.log(info.changes); // Number of rows updated
```

#### Delete Statement

```javascript
const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
const info = deleteStmt.run(1);

console.log(info.changes); // Number of rows deleted
```

---

## Parameter Binding

### Anonymous Parameters (?)

Use `?` as placeholders and pass values in order.

```javascript
const stmt = db.prepare('INSERT INTO people VALUES (?, ?, ?)');

// All of these are equivalent:
stmt.run('John', 'Smith', 45);
stmt.run(['John', 'Smith', 45]);
stmt.run(['John'], ['Smith', 45]);
```

### Named Parameters

Use `@name`, `:name`, or `$name` as placeholders and pass an object.

```javascript
// All three syntaxes are supported and can be mixed:
const stmt1 = db.prepare('INSERT INTO people VALUES (@firstName, @lastName, @age)');
const stmt2 = db.prepare('INSERT INTO people VALUES (:firstName, :lastName, :age)');
const stmt3 = db.prepare('INSERT INTO people VALUES ($firstName, $lastName, $age)');
const stmt4 = db.prepare('INSERT INTO people VALUES (@firstName, :lastName, $age)');

// Execute with object
stmt1.run({
  firstName: 'John',
  lastName: 'Smith',
  age: 45
});
```

**Example with SELECT:**

```javascript
const selectByAge = db.prepare('SELECT * FROM users WHERE age >= @minAge');

// Named parameters with objects
const olderUsers = selectByAge.all({ minAge: 25 });
```

**Benefits of named parameters:**
- More readable
- Order-independent
- Self-documenting
- Easier to maintain

---

## Transactions

### Why Use Transactions?

- **Atomicity:** All operations succeed or all fail
- **Performance:** Batch operations are much faster
- **Data Integrity:** Maintain consistency across related operations

### Creating Transaction Functions

```javascript
const db = new Database(':memory:');

// Setup
db.exec(`
  CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance REAL);
  INSERT INTO accounts VALUES (1, 'Alice', 1000), (2, 'Bob', 500);
`);

// Prepare statements
const transfer = db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?');
const getBalance = db.prepare('SELECT balance FROM accounts WHERE id = ?').pluck();

// Create a transaction function
const transferMoney = db.transaction((fromId, toId, amount) => {
  const fromBalance = getBalance.get(fromId);

  if (fromBalance < amount) {
    throw new Error('Insufficient funds');
  }

  transfer.run(-amount, fromId);
  transfer.run(amount, toId);

  return {
    fromBalance: fromBalance - amount,
    toBalance: getBalance.get(toId)
  };
});

// Transaction commits on success
const result = transferMoney(1, 2, 100);
console.log(result); // { fromBalance: 900, toBalance: 600 }

// Transaction rolls back on error
try {
  transferMoney(1, 2, 10000); // Will fail - insufficient funds
} catch (err) {
  console.log(err.message); // 'Insufficient funds'
  console.log(getBalance.get(1)); // 900 (unchanged - rolled back)
}
```

### Transaction Modes

```javascript
// Default mode (BEGIN)
transferMoney(1, 2, 50);

// DEFERRED - locks when first read/write occurs
transferMoney.deferred(1, 2, 50);

// IMMEDIATE - locks on BEGIN (recommended for writes)
transferMoney.immediate(1, 2, 50);

// EXCLUSIVE - exclusive lock (blocks all other connections)
transferMoney.exclusive(1, 2, 50);
```

**Transaction Modes:**
- **Default (BEGIN):** Starts a deferred transaction
- **DEFERRED:** Database is locked when first read/write occurs
- **IMMEDIATE:** Database is locked immediately (prevents write conflicts)
- **EXCLUSIVE:** Exclusive lock (no other connections can read or write)

### Batch Inserts with Transactions

Transactions make batch inserts dramatically faster:

```javascript
const db = new Database(':memory:');

db.exec(`
  CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    balance REAL
  )
`);

// Create transaction function for batch inserts
const insertMany = db.transaction((items) => {
  const insert = db.prepare('INSERT INTO accounts (name, balance) VALUES (?, ?)');
  for (const item of items) {
    insert.run(item.name, item.balance);
  }
});

// Execute batch insert (much faster than individual inserts)
insertMany([
  { name: 'Charlie', balance: 750 },
  { name: 'Diana', balance: 1200 },
  { name: 'Eve', balance: 950 },
]);
```

**Performance tip:** Batch inserts in a transaction can be 100x+ faster than individual inserts.

---

## Complete Example

```javascript
import Database from 'better-sqlite3';

// Initialize database
const db = new Database('myapp.db', { verbose: console.log });

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Prepare statements
const insert = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)');
const selectById = db.prepare('SELECT * FROM users WHERE id = ?');
const selectAll = db.prepare('SELECT * FROM users');
const selectByAge = db.prepare('SELECT * FROM users WHERE age >= @minAge');
const update = db.prepare('UPDATE users SET age = ? WHERE id = ?');
const deleteUser = db.prepare('DELETE FROM users WHERE id = ?');

// Insert users
const info1 = insert.run('Alice', 'alice@example.com', 30);
const info2 = insert.run('Bob', 'bob@example.com', 25);
const info3 = insert.run('Charlie', 'charlie@example.com', 35);

console.log(`Inserted user with ID: ${info1.lastInsertRowid}`);

// Query single user
const user = selectById.get(1);
console.log(user); // { id: 1, name: 'Alice', ... }

// Query all users
const allUsers = selectAll.all();
console.log(`Total users: ${allUsers.length}`);

// Query with named parameters
const olderUsers = selectByAge.all({ minAge: 30 });
console.log('Users 30+:', olderUsers);

// Update user
const updateInfo = update.run(31, 1);
console.log(`Updated ${updateInfo.changes} rows`);

// Iterate over results
console.log('All users:');
for (const user of selectAll.iterate()) {
  console.log(`- ${user.name} (${user.age})`);
}

// Batch insert with transaction
const insertBatch = db.transaction((users) => {
  for (const user of users) {
    insert.run(user.name, user.email, user.age);
  }
});

insertBatch([
  { name: 'Diana', email: 'diana@example.com', age: 28 },
  { name: 'Eve', email: 'eve@example.com', age: 32 },
]);

// Close database when done
db.close();
```

---

## Best Practices

### Performance

1. **Use WAL mode:** `db.pragma('journal_mode = WAL')`
2. **Use transactions for batch operations:** 100x+ faster
3. **Reuse prepared statements:** Don't recreate them
4. **Use `.iterate()` for large result sets:** More memory-efficient
5. **Close database connections:** `db.close()` when done

### Security

1. **Always use parameter binding:** Never concatenate SQL strings
2. **Use named parameters for clarity:** More readable and maintainable
3. **Validate input data:** Even with parameter binding
4. **Use readonly mode:** When modifications aren't needed

### Code Organization

1. **Prepare statements at initialization:** Not in loops
2. **Create transaction functions:** For related operations
3. **Handle errors appropriately:** Transactions auto-rollback on error
4. **Use verbose mode during development:** `verbose: console.log`

### Error Handling

```javascript
try {
  const info = insert.run('Alice', 'alice@example.com', 30);
  console.log(`Inserted row ${info.lastInsertRowid}`);
} catch (err) {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    console.error('Email already exists');
  } else {
    console.error('Database error:', err);
  }
}
```

---

## Common Patterns

### Check if Record Exists

```javascript
const exists = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?')
  .pluck()
  .get('alice@example.com');

if (exists > 0) {
  console.log('User exists');
}
```

### Upsert (Insert or Update)

```javascript
const upsert = db.prepare(`
  INSERT INTO users (id, name, email, age)
  VALUES (@id, @name, @email, @age)
  ON CONFLICT(id) DO UPDATE SET
    name = @name,
    email = @email,
    age = @age
`);

upsert.run({ id: 1, name: 'Alice Updated', email: 'alice@example.com', age: 31 });
```

### Get Single Column Value

```javascript
// Use .pluck() to get single column value instead of object
const getAge = db.prepare('SELECT age FROM users WHERE id = ?').pluck();
const age = getAge.get(1);

console.log(age); // 30 (not { age: 30 })
```

### Count Rows

```javascript
const count = db.prepare('SELECT COUNT(*) as count FROM users').pluck().get();
console.log(`Total users: ${count}`);
```

---

## Additional Resources

- [Better-SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [SQL Tutorial](https://www.sqlitetutorial.net/)
