import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';
import ejs from "ejs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const key = process.env.KEY;
const base_url = "https://api.nasa.gov/planetary/apod";

app.engine('ejs', ejs.renderFile);  // Register the EJS engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/range", async(req, res)=> {
    try {
        function endDate(params) {
            if (req.body.sday !== "" && req.body.syear !== "" && req.body.smonth !== "") {
                params.end_date = `${req.body.syear}-${req.body.smonth}-${req.body.sday}`;
            }
        }
        const params = {
            api_key: key,
            start_date: `${req.body.fyear}-${req.body.fmonth}-${req.body.fday}`,
            thumbs: true,
        };
        endDate(params);
        
        const response = await axios.get(base_url, { params }); 
        res.render("index.ejs", {data: response.data}); // as an array
    } catch (error) {
        let errorMsg = await error.response.data.msg;
        res.render("index.ejs", {error: errorMsg || "invalid input"});
    }
});
app.post("/spec", async(req, res)=> {
    try {
        const response = await axios.get(base_url, {
        params: {
            api_key: key,
            date: `${req.body.year}-${req.body.month}-${req.body.day}`,
            thumbs: true
        }
        }); 
        res.render("index.ejs", {dataOb: response.data}); // as an object
    } catch (error) {
        res.render("index.ejs", {error: error.response.data.msg});
    }
});
app.post("/random", async(req, res)=> {
    try {
        const response = await axios.get(base_url, {
        params: {count: req.body.random, api_key: key, thumbs: true}
        }); 
        res.render("index.ejs", {data: response.data}); // as an array
    } catch (error) {
        res.render("index.ejs", {error: error.response.data.msg});
    }
});
app.get("/", (req, res)=> {
    res.render("index.ejs");
});
app.get('/favicon.ico', (req, res) => res.status(204).end());// ignore favicon in vercel
app.get('/favicon.png', (req, res) => res.status(204).end());
//temporarily to verify file serving
app.get('/debug-css', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'index.css');
    res.sendFile(cssPath);
});
app.listen(3000, ()=> {
    console.log("listening on port 3000");
});