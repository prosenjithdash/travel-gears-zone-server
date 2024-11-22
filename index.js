const express = require("express")
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express()
const port = process.env.PORT || 8000;

// middleware declare
app.use(cors())
app.use(express.json())

// mongodb

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kybpity.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// client declare
const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors:true
    }
})

const userCollection = client.db('travelGearsZone').collection("users")
const productCollection = client.db('travelGearsZone').collection("products");


// connect to database
const dbConnect = async () => {
    try {
        client.connect();
        console.log('Database connected successfully');

        // insert user
        app.post("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                return res.send({ message: "User already exists" });
            }
           
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
    } catch (error) {
        console.log(error.name, error.message);
    }
}

dbConnect();

// api

app.get('/',  (req, res) => {
    res.send("Travel Gears Zone Server is running.")
})


//jwt
app.post('/authentication', async (req, res) => {
    const userEmail = req.body
    const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, { expiresIn: '10d' });
    res.send({ token });
})
app.listen(port, () => {
    console.log(`Travel Gears Zone Server is running on port, ${port}`)
})