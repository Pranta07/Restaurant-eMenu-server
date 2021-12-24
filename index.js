const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("eMenu server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yxq3j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        // console.log("Database connected!");
        const database = client.db("eMenu");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");

        //to verify an user is admin or not
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            res.json(result);
        });

        app.post("/users", async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            // res.json(result);
        });

        //post api for receiving order
        app.post("/orders", async (req, res) => {
            // console.log(req.body);
            const doc = req.body;
            const result = await ordersCollection.insertOne(doc);
            res.json(result);
        });

        //get api for myorders
        app.get("/orders/:email", async (req, res) => {
            // const email = req.params.email;
            const query = { email: req.params.email };
            const result = await ordersCollection.find(query).toArray();
            res.json(result);
        });

        //updating payment status
        app.put("/pay/:email", async (req, res) => {
            // const payment = req.body;
            const filter = { email: req.params.email };
            const updateDoc = {
                $set: {
                    paymentStatus: true,
                },
            };
            const result = await ordersCollection.updateMany(filter, updateDoc);
            res.json(result);
        });

        //updating food status
        app.post("/food/:email", async (req, res) => {
            const status = JSON.parse(req.body).status;
            const filter = { email: req.params.email };
            const updateDoc = {
                $set: {
                    foodStatus: status,
                },
            };
            const result = await ordersCollection.updateMany(filter, updateDoc);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});
