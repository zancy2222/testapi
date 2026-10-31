const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const from = req.get("X-Client-App") || "unknown";
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}  <- from: ${from}`);
  next();
});


function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = {
      products: [
        { id: 1, name: "Coke 1.5L", price: 75, stock: 20 },
        { id: 2, name: "Lucky Me Pancit Canton", price: 18, stock: 50 },
        { id: 3, name: "Skyflakes", price: 10, stock: 40 },
      ],
      orders: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/", (req, res) => {
  res.json({ message: "API is running!", endpoints: ["/api/products", "/api/orders"] });
});

// READ all products
app.get("/api/products", (req, res) => {
  res.json(loadData().products);
});

// READ one product
app.get("/api/products/:id", (req, res) => {
  const product = loadData().products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// CREATE a product
app.post("/api/products", (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || price == null || stock == null) {
    return res.status(400).json({ error: "name, price and stock are required" });
  }
  const data = loadData();
  const newId = data.products.length ? Math.max(...data.products.map((p) => p.id)) + 1 : 1;
  const product = { id: newId, name, price: Number(price), stock: Number(stock) };
  data.products.push(product);
  saveData(data);
  res.status(201).json(product);
});

// UPDATE a product
app.put("/api/products/:id", (req, res) => {
  const data = loadData();
  const product = data.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  const { name, price, stock } = req.body;
  if (name != null) product.name = name;
  if (price != null) product.price = Number(price);
  if (stock != null) product.stock = Number(stock);
  saveData(data);
  res.json(product);
});

// DELETE a product
app.delete("/api/products/:id", (req, res) => {
  const data = loadData();
  const index = data.products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  const [removed] = data.products.splice(index, 1);
  saveData(data);
  res.json({ message: "Deleted", product: removed });
});

// READ all orders
app.get("/api/orders", (req, res) => {
  res.json(loadData().orders);
});

// CREATE an order (a customer buys something) -> also lowers the stock
app.post("/api/orders", (req, res) => {
  const { productId, quantity, customer } = req.body;
  const qty = Number(quantity) || 1;
  const data = loadData();
  const product = data.products.find((p) => p.id === Number(productId));
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.stock < qty) return res.status(400).json({ error: "Not enough stock" });

  product.stock -= qty;
  const order = {
    id: data.orders.length + 1,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    total: product.price * qty,
    customer: customer || "Guest",
    date: new Date().toISOString(),
  };
  data.orders.push(order);
  saveData(data);
  res.status(201).json(order);
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
