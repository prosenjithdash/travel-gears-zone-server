const express = require("express")
const cors = require('cors');
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

// connect to database
const dbConnect = async () => {
    try {
        client.connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.log(error.name, error.message);
    }
}

dbConnect();

// api

app.get('/',  (req, res) => {
    res.send("Travel Gears Zone Server is running.")
})

app.listen(port, () => {
    console.log(`Travel Gears Zone Server is running on port, ${port}`)
})