import express from "express"
import bodyParser from "body-parser"
import session from "express-session"
import { loadEnvFile } from "process"
import cors from "cors"
import helmet from "helmet"
import fs from "fs"
import https from "https"
import { v4 as uuidv4 } from "uuid"
import router from "./routes/routes.js"
import ejs from 'ejs'
import path from "path"
import { fileURLToPath } from "url" 

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

loadEnvFile('../.env')

const app = express()

// app.set('view engine', 'ejs')
// app.set('views', path.join(__dirname, 'views'))

const sess = session({
    secret: process.env.secret,
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 60 * 15 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: "lax"
    }
})

let nonce = uuidv4()

app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', `default-src 'self'; img-src 'self'; script-src https://cdn.jsdelivr.net 'nonce-${nonce}' 'self' blob:; style-src 'self'; connect-src https://cdn.jsdelivr.net 'self' blob:;`);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
    res.setHeader('Access-Control-Allow-Method', 'post', 'get', 'options')
    res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000")
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Max-Age', '5000')

    next()
})


app.get('/', (req, res) => {
    fs.readFile('../Front/index.html', (err, html) => {
        if(err) {
            throw new Error(`error sending html file: ${err}`)
        } else {
            res.setHeader('Content-Type', 'text/html')
            html = String(html).replaceAll('__nonce__', nonce)
            res.write(html)
            res.statusCode = 200
            nonce = uuidv4()
            res.end()
        }
    })
})

app.use(sess)
app.use(router)
app.use(bodyParser.json())
router.use(sess)

app.get('/Css/:id', (req, res) => {
    const {id} = req.params
    res.setHeader('Content-Type', 'text/css')
    res.write(fs.readFileSync(`../Front/Css/${id}`))
    res.end()
})

app.get('/Js/:id', (req, res) => {
    const {id} = req.params
    res.setHeader('Content-Type', 'text/javascript')
    res.write(fs.readFileSync(`../Front/js/${id}`))
    res.end()
})

app.get('/Images/:id', (req, res) => {
    const {id} = req.params
    res.setHeader('Content-Type', 'application/javascript')
    res.write(fs.readFileSync(`../Front/Images/${id}`))
    res.end()
})

// app.use(helmet())
// app.use(cors({credentials: true, origin: "http://localhost:3000"}))
// app.use(express.static('C:/DocConverter/Front/'))

let ctime = 60 * 15 * 1000
let time = Date.now()
let first = Date.now()
let already = false

app.use((req, res) => {
    if(!already) {
        req.session.username = uuidv4()
        req.session.view++
        res.cookie('connected', uuidv4(), {httpOnly: true, secure: true})
        console.log(`sessionID: ${req.sessionID}`)
        console.log(`user: ${req.session.username}`)
        req.session.save()
        already = true
    }
    if(Date.now() > time + ctime-60000) {
        res.cookie('connected', uuidv4(), {httpOnly: true, maxAge: 60 * 15 * 1000, secure: false })
        time = Date.now() + 60000
        console.log(`time: ${first} - cookie time: ${ctime} - date now: ${time}`)
    }
})

const port = process.env.port || 3000

app.listen(port, () => {
    console.log(`listening port http://localhost:${port}`)
})

export default already