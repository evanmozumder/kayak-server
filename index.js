const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej9vy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("kayakUser");
    const serviceCollection = database.collection("offerings");
    const dealCollection = database.collection("recommendedDeals");
    const clientCollection = database.collection("clientInfo");

    // GET request
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/deals", async (req, res) => {
      const cursor = dealCollection.find({});
      const deals = await cursor.toArray();
      res.send(deals);
    });
    app.get("/orders", async (req, res) => {
      const cursor = clientCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // specific service
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("order_id", id);
      const query = { _id: ObjectId(id) };
      const order = await serviceCollection.findOne(query);
      console.log("specific order", order);
      res.send(order);
    });

    // UPDATE API
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      console.log("updated request", updatedOrder);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          address: updatedOrder.address,
          city: updatedOrder.city,
          phone: updatedOrder.phone,
          orders: updatedOrder.orders,
        },
      };
      const result = await clientCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating user", req.params.id);
      res.json(result);
    });

    // POST request
    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await clientCollection.insertOne(orders);

      console.log("orders from server", orders);
      res.send("order reached to server", result);
    });

    /* // DELETE 
    app.delete('/orders/:id',async(req,res)=> {
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await clientCollection.deleteOne(query);
      res.json(result)
    }) */
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("helllo hello");
});

app.listen(port, () => {
  console.log("listening port", port);
});
