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
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("jobTask");
    const optionsCollection = database.collection("optionsCollection");
    const usersCollection = database.collection("users");

    // Get all Services api
    app.get("/options", async (req, res) => {
      const cursor = optionsCollection.find({});
      const options = await cursor.toArray();
      // console.log(services);
      res.json(options);
    });

    // get users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      // console.log(users);
      res.json(users);
    });
    app.get("/users/:name", async (req, res) => {
      const id = req.params.name;
      const query = { name: id };
      const package = await usersCollection.findOne(query);
      console.log("hello from inside dynamic route");
      res.json(package);
    });
    // users management

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      // console.log("user inserted", user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { name: user.name };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job task");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
