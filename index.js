const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const objectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yd5hs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("luxuryLiving");
    const servicesCollection = database.collection("services");
    const emailCollection = database.collection("clientEmails");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    // Get all Services api
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.limit(6).toArray();
      // console.log(services);
      res.json(services);
    });
    // Get single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const package = await servicesCollection.findOne(query);
      // console.log("hello from inside dynamic route");
      res.json(package);
    });

    // get users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      // console.log(users);
      res.json(users);
    });
    // email section
    app.get("/clientEmails", async (req, res) => {
      const cursor = emailCollection.find({});
      const emails = await cursor.toArray();
      // console.log(emails);
      res.json(emails);
    });

    // Get all ordersCollection
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      // console.log(orders);
      res.json(orders);
    });

    // Get Specific Orders
    app.get("/myorders/:email", async (req, res) => {
      const cursor = ordersCollection.find({ email: req.params.email });
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // users management

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      // console.log("user inserted", user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // making admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("Put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // finding admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // order booking
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      // console.log(result);
      res.json(result);
    });
    // add new Service
    app.post("/services", async (req, res) => {
      console.log("hitting service post");
      const result = await servicesCollection.insertOne(req.body);
      res.json(result);
    });

    //add subscription email
    app.post("/clientEmails", async (req, res) => {
      const result = await emailCollection.insertOne(req.body);
      // console.log(result);
      res.json(result);
    });

    // delete operation
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    app.delete("/myorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // review post and get
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      console.log(review);
      res.json(result);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Luxury Living");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
