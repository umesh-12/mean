const express = require("express");
const cors = require("cors");

const app = express();

// ---------- Middleware ----------
app.use(cors({ origin: "http://localhost:4200" })); // Angular ko URL matra
app.use(express.json({ limit: "10kb" }));           // thulo body block garne

// Har request log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---------- Data ----------
let products = [
  { id: 1, name: "Laptop", price: 90000, stock: 5 },
  { id: 2, name: "Mouse", price: 1500, stock: 0 },
];
let nextId = 3;

// ---------- Helper ----------

// URL ko id check: positive integer ho ki
function parseId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id" });
  }
  req.productId = id;
  next();
}

// Body validation: error message return garxa, thik bhaye null
function validateProduct(body) {
  if (typeof body !== "object" || body === null) {
    return "Body must be a JSON object";
  }
  const { name, price, stock } = body;

  if (typeof name !== "string" || name.trim() === "") {
    return "name is required";
  }
  if (name.trim().length > 100) {
    return "name is too long (max 100)";
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return "price must be a non-negative number";
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return "stock must be a non-negative integer";
  }
  return null;
}

function nameExists(name, exceptId = null) {
  const n = name.trim().toLowerCase();
  return products.some(p => p.name.toLowerCase() === n && p.id !== exceptId);
}

// ---------- Routes ----------

// READ: sabai product (filter + search)
// /api/products?inStock=true&search=lap
app.get("/api/products", (req, res) => {
  let result = products;

  if (req.query.inStock === "true") {
    result = result.filter(p => p.stock > 0);
  }
  if (typeof req.query.search === "string" && req.query.search.trim() !== "") {
    const s = req.query.search.trim().toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(s));
  }

  res.json(result);
});

// RE   AD: ek ota product
app.get("/api/products/:id", parseId, (req, res) => {
  const product = products.find(p => p.id === req.productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

// CREATE
app.post("/api/products", (req, res) => {
  const error = validateProduct(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { name, price, stock } = req.body;

  if (nameExists(name)) {
    return res.status(409).json({ error: "Product name already exists" });
  }

  // req.body seedhai save gardaina, field chhanera matra
  const product = { id: nextId++, name: name.trim(), price, stock };
  products.push(product);

  res.status(201).json(product);
});

// UPDATE (pura replace)
app.put("/api/products/:id", parseId, (req, res) => {
  const index = products.findIndex(p => p.id === req.productId);


  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const error = validateProduct(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { name, price, stock } = req.body;

  if (nameExists(name, req.productId)) {
    return res.status(409).json({ error: "Product name already exists" });
  }

  products[index] = { id: req.productId, name: name.trim(), price, stock };
    console.log(products[index], 'index ok')
  res.json(products[index]);
});

// DELETE
app.delete("/api/products/:id", parseId, (req, res) => {
  const index = products.findIndex(p => p.id === req.productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);
  res.status(204).send();
});

// ---------- Error handling (sabbhanda tala) ----------

// Route nai bhetiyena
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Aprat्yashit error
app.use((err, req, res, next) => {
  // galat JSON pathayo bhane
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// ---------- Start ----------
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));