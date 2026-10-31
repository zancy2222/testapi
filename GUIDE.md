# One API, Two Systems: Learning Demo

This project shows that **one API can serve many systems at the same time.**

```
   ┌──────────────────────┐          ┌──────────────────────┐
   │  SYSTEM 1: Store     │          │  SYSTEM 2: Admin     │
   │  localhost:4000      │          │  localhost:5000      │
   │  (customers buy)     │          │  (owner manages)     │
   └──────────┬───────────┘          └───────────┬──────────┘
              │   fetch() HTTP requests (JSON)   │
              └───────────────┬──────────────────┘
                              ▼
                ┌───────────────────────────┐
                │     THE API               │
                │     localhost:3000        │
                │     /api/products         │
                │     /api/orders           │
                └─────────────┬─────────────┘
                              ▼
                     api/data.json (database)
```

---

## 1. How to run

**Requirement:** [Node.js](https://nodejs.org) (v18 or newer). Check with `node -v`.

Open a terminal in this folder (`E:\testapi`), then:

```bash
npm install
```

```bash
npm start
```

You should see:

```
API running at http://localhost:3000
System 1 (Store) running at http://localhost:4000
System 2 (Admin) running at http://localhost:5000
```

Open these in your browser (put them **side by side**):

| What | URL |
|---|---|
| The API (raw JSON) | http://localhost:3000/api/products |
| System 1: Store | http://localhost:4000 |
| System 2: Admin | http://localhost:5000 |

Stop everything with **Ctrl + C**.

> `npm run api` · `npm run store` · `npm run admin`

To reset the data, stop the servers and delete `api/data.json`. It is recreated with sample products on the next start.

---

## 2. Project structure

```
testapi/
├── api/
│   ├── server.js        ← THE API (all the rules + data)
│   └── data.json        ← the "database" (auto-created)
├── store/
│   ├── server.js        ← System 1 web server (port 4000)
│   └── public/index.html← Store page (uses fetch to call the API)
├── admin/
│   ├── server.js        ← System 2 web server (port 5000)
│   └── public/index.html← Admin page (uses fetch to call the SAME API)
├── start-all.js         ← starts all 3 with "npm start"
└── package.json
```

Notice: **the Store and Admin folders have no data at all.** They only have a web page. All data lives in the API.

---

## 3. The API endpoints

| Method | URL | What it does | Used by |
|---|---|---|---|
| GET | `/api/products` | List all products | Store + Admin |
| GET | `/api/products/:id` | Get one product | (try it in the browser) |
| POST | `/api/products` | Add a product | Admin |
| PUT | `/api/products/:id` | Update a product | Admin |
| DELETE | `/api/products/:id` | Delete a product | Admin |
| GET | `/api/orders` | List all orders | Admin |
| POST | `/api/orders` | Buy a product (lowers stock) | Store |

---

## 4. How to explain it to your audience

### The simple analogy: a restaurant kitchen 🍳

- The **API** is the **kitchen**. It has the food (data) and the rules (e.g. "you can't order more than what's in stock").
- **System 1 (Store)** is the **dine-in counter** where customers order.
- **System 2 (Admin)** is the **manager's office** where the owner adds menu items.
- Both talk to the **same kitchen**. Neither of them cooks. They just send requests and receive responses.

If tomorrow you build a **mobile app** or a **POS machine**, it is just another counter connected to the same kitchen. You don't rebuild the kitchen.

### Key points to say

1. **An API is a middleman.** Systems don't touch the database directly. They ask the API, and the API answers in **JSON**.
2. **Separation.** The API is on port 3000; the websites are on 4000 and 5000. They are completely separate programs. They could even be on different computers.
3. **One source of truth.** Because both systems use the same API, they always see the same data.
4. **The only connection is a URL.** In both HTML files, look for this line:
   ```js
   const API_URL = "http://localhost:3000/api";
   ```
   That one line is the whole "connection" between a system and the API.
5. **HTTP methods = actions.** GET = read, POST = create, PUT = update, DELETE = remove (CRUD).
6. **CORS.** Browsers block a site on port 4000 from calling port 3000 by default. `app.use(cors())` in `api/server.js` tells the browser "these other systems are allowed."

---

## 5. Live demo script (about 10 minutes)

**Step 1: Show the API alone.**
Open http://localhost:3000/api/products. "This is just raw data. No design. This is what an API gives you."

**Step 2: Open System 1 (Store).**
"This website has no data of its own. It asked the API for the products and displayed them nicely."

**Step 3: Open System 2 (Admin)** next to it.
"Different website, different port, different purpose, but the same products. Because it's the same API."

**Step 4: Admin → Store.**
In Admin, add a product (e.g. *Piattos, 20, 30*). Click **Refresh** on the Store. It appears!
"The Admin didn't talk to the Store. Admin told the API, and the Store asked the API."

**Step 5: Store → Admin.**
In the Store, type a name and buy 3 of something. Go to Admin and click **Refresh**:
the stock went down and the order appears in the Orders table.

**Step 6: Show the API terminal.**
Every request is logged with who sent it:
```
[10:15:02] GET /api/products  <- from: STORE (port 4000)
[10:15:09] POST /api/products  <- from: ADMIN (port 5000)
[10:15:20] POST /api/orders  <- from: STORE (port 4000)
```
"One API, serving two systems."

**Step 7: Show the API rules.**
Try to buy more than the available stock in the Store. You get *"Not enough stock"*.
"The rule lives in the API, so **every** system follows it automatically."

**Step 8 (bonus): Kill the API.**
Stop only the API terminal (`Ctrl + C`), then refresh the Store. It shows *"Cannot reach the API."*
"The websites are still running, but without the API they are empty shells."

---

## 6. Test the API without any website (optional)

This proves the API doesn't need a website at all. In **PowerShell**:

```powershell
Invoke-RestMethod http://localhost:3000/api/products
```

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/products -ContentType "application/json" -Body '{"name":"Nova","price":15,"stock":25}'
```

Or use tools like **Postman** or the VS Code **Thunder Client** extension. This is a third "system" using the same API.

---

## 7. Common problems

| Problem | Fix |
|---|---|
| `npm` is not recognized | Install Node.js, then reopen the terminal. |
| `Cannot find module 'express'` | Run `npm install` first. |
| `EADDRINUSE` (port in use) | Something is already using that port. Close it or change `PORT` in that `server.js`. |
| Store says "Cannot reach the API" | The API isn't running. Start it with `npm run api`. |
| CORS error in browser console | Make sure `app.use(cors())` is still in `api/server.js`. |
