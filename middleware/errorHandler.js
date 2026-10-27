export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Product name already exists" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
}