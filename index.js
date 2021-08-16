const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require('redis')
const cors = require('cors')

const { MONGO_USER, MONGO_PASS, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config')
let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})

const app = express()
const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')

const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectMongoose = () => {
    mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
        console.log(err)
        setTimeout(() => connectMongoose(), 5000)
    })
}

connectMongoose()

app.enable("trust proxy")
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 1 * 60 * 1000           // 1 minute(s)
    }
}))

app.use(express.json())

app.get('/api', (req, res) => {
    res.send('<h2>Hello World!</h2>')
})

app.use('/api/v1/posts', postRouter)
app.use('/api/v1/auth', userRouter)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on port ${port}`))