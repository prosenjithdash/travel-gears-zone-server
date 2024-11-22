const express = require("express")
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express()
const port = process.env.PORT || 8000;

// middleware declare
app.use(cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus:200,
}))
app.use(express.json())




// token verification
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.send({message:"No Token"})
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (error, decoded) => {
        if (error) {
            return res.send({message:"Invalid Token"})
        }
        req.decoded = decoded;
        next();
    });
}

// verify seller
const verifySeller = async (req,res, next) => {
    const email = req.decoded.email;
    const query = { email: email }
    const user = await userCollection.findOne(query)
    if (user?.role !== "seller") {
        return res.send({message:"Forbidden access"})
    }
    next();
}


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


         // get user
        app.get("/user/:email", async (req, res) => {
            const query = { email: req.params.email };
            const user = await userCollection.findOne(query);
            res.send(user)
        });


        // insert user data
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


        // Add Product API
        app.post("/add-products",verifyJWT,verifySeller, async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        // get products from Product API
        app.get("/all-products", async (req, res) => {
            
            // name searching
            // sort by price
            // filter by category
            //filter by brand

            const { title, sort, category, brand } = req.query
            
            const query = {}

            if (title) {
                query.title = { $regex: title, $options: "i" }
            }

            if (category) {
                query.category = { $regex: category, $options: "i" }
            }

            if (brand) {
                query.brand = brand;
            }

            const sortOption = sort === 'asc' ? 1 : -1
            
            const products = await productCollection
                .find(query)
                .sort({ price: sortOption })
                .toArray();
            res.json(products);




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