const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  })
);
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
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const singleUser = await usersCollection.findOne(query);
      // console.log("hello from inside dynamic route");
      res.json(singleUser);
    });
    // users management

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      // console.log("user inserted", user);
      res.json(result);
    });
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      console.log(user);
      const option = { upsert: true };
      const updatedUser = {
        $set: {
          name: user.name,
          sectors: user.sectors,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
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
