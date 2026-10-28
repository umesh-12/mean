import Product from "../models/Product.js";

// 1. getAll: database ma bhayeko SABAI product ko list dinxa
export const getAll = async (req, res) => {
  const products = await Product.find();
  res.json(products); // list lai JSON banayera pathaune
};

// 2. getOne: EK ota product matra dinxa (id anusar)
export const getOne = async (req, res) => {
  // req.params.id = URL ma lekheko id
  const product = await Product.findById(req.params.id);

  // product bhetiyena bhane 404 (Not Found) pathaune, ra yahi ruknu
  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product);
};

// 3. create: NAYA product banayera database ma save garxa

export const create = async (req, res) => {
  // req.body = Postman bata pathayeko JSON data
  // body pathayeko chhaina bhane khali object {} use hunxa (crash hudaina)
  const body = req.body ?? {};

  // 3 ota field matra liyeko (aru extra field aayo bhane ignore)
  // schema ko rules (required, min) yahi check hunxa
  const product = await Product.create({
    name: body.name,
    price: body.price,
    stock: body.stock,
  });

  // 201 = "Created" (naya banyo)
  res.status(201).json(product);
};

// 4. update: bhayeko product ko data CHANGE garxa
//    URL: PUT /api/products/64f1a2...   body: {"name":"Keyboard","price":3500,"stock":8}
export const update = async (req, res) => {
  const body = req.body ?? {};

  const product = await Product.findByIdAndUpdate(
    req.params.id, // kun product change garne (URL ko id)
    { name: body.name, price: body.price, stock: body.stock }, // naya data
    {
      new: true, // change bhayepachi ko NAYA data return gar
      runValidators: true, // update garda pani schema ko rules check gar
    },
  );

  // id ko product xaina bhane 404
  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product); // update bhayeko product pathaune
};

// 5. remove: product DELETE (hataune)
//    URL: DELETE /api/products/64f1a2...
export const remove = async (req, res) => {
  // findByIdAndDelete = id anusar khojera delete garne
  const product = await Product.findByIdAndDelete(req.params.id);

  // delete garna product nai thiyena bhane 404
  if (!product) return res.status(404).json({ error: "Product not found" });

  // 204 = "No Content" (delete bhayo, pathauna kei chhaina)
  res.status(204).send();
};