const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../database/dbConfig.js');

const { authenticate, generateToken } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

async function register(req, res) {
  // implement user registration
  try {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 14);
    const returnedIdArr = await db.insert(user).into('users');
    const dbEntry = await db.select().from('users').where({ id: returnedIdArr[0] }).first();

    res.status(201).json(dbEntry);
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

async function login(req, res) {
  // implement user login
  try {
    const user = req.body;
  
    const dbUserData = await db.select().from('users').where({ username: user.username }).first();
    console.log(dbUserData);

    if (dbUserData && await bcrypt.compare(user.password, dbUserData.password)) {
      console.log('Authenticated');
      const token = generateToken(dbUserData);
      console.log('Token is: ', token);
  
      res.json({ message: `Welcome, here's a token!`, token: token });
    } else {
      res.status(401).json({ message: 'You shall not pass!' });
    }
  } catch(err) {
    res.status(500).json({ error: err });
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
