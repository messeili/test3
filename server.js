'use strict'
//dependencies
const dotenv = require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

require('dotenv').config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//routes
app.get('/', homePageHandler);
app.post('/addJokes', addJokesHandler);
app.get('/favJokes', favJokesHandler);
app.get('/joke/:id', jokeDetailsHandler);
app.delete('/deleteJoke/:id', deleteJokeHandler);
app.put('/updateJoke/:id', updateJokeHandler);
app.get('/ranJokes', ranJokesHandler)




//functions
function homePageHandler(req, res) {
    let url = `https://official-joke-api.appspot.com/jokes/programming/ten`;
    superagent.get(url).then((results) => {
        res.render('pages/index', { data: results.body })
    })
}

function addJokesHandler(req, res) {
    let { id, type, setup, punchline } = req.body;
    let SQL = `INSERT INTO test3 (id,type,setup,punchline) VALUES ($1,$2,$3,$4);`
    let VALUES = [id, type, setup, punchline];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/favJokes')
    })
}

function favJokesHandler(req, res) {
    let SQL = `SELECT * FROM test3;`
    client.query(SQL).then((results) => {
        if (results.rows.length == 0) {
            res.render('pages/error', { data: 'no available jokes' })
        }
        res.render('pages/favJokes', { data: results.rows })
    })
}

function jokeDetailsHandler(req, res) {
    let idParams = req.params.id;
    let SQL = `SELECT * FROM test3 WHERE idp=$1;`
    let VALUES = [idParams];
    client.query(SQL, VALUES).then((results) => {
        res.render('pages/jokeDetails', { data: results.rows[0] })
    })
}

function deleteJokeHandler(req, res) {
    let idParams = req.params.id;
    let SQL = `DELETE FROM test3 WHERE idp=$1;`
    let VALUES = [idParams];
    client.query(SQL, VALUES).then(() => {
        res.redirect('/favJokes')
    })
}
function updateJokeHandler(req, res) {
    let { id, type, setup, punchline } = req.body;
    let idParams = req.params.id;
    let SQL = `UPDATE test3 SET id=$1,type=$2,setup=$3,punchline=$4 WHERE idp=$5;;`;
    let VALUES = [id, type, setup, punchline, idParams];
    client.query(SQL, VALUES).then(() => {
        res.redirect(`/joke/${idParams}`)
    })
}

function ranJokesHandler(req, res) {
    let url = `https://official-joke-api.appspot.com/jokes/programming/random`;
    superagent.get(url).then((results) => {
        res.render('pages/ranJokes', { data: results.body })
    })
}



//port listening
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening to PORT: ${PORT}`);
    })
})