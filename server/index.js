#!/usr/bin/env node

const express = require('express')
const app = express()
const port = 3000

// Global game state

const state = {}
let gameIdCounter = 0

// Create listen server

app.listen(port, () => {
  console.log(`Connect-4 server listening on port ${port}`)
})

// Logger middleware

const logger = (req, res, next) => { 
    console.log(`${req.method} ${req.url} ${req.ip}`)
    next()
}

app.use(logger)

// Validate game ID middleware

const validateGameID = (req, res, next) => {
    if (!state[req.params.gameId]) {
	res.status(404).json({ message: "Invalid game ID" })
	return;
    }
    next()
}
  
// Create a new game, return game ID

app.post('/game', (req, res) => {
    const id = gameIdCounter++
    state[id] = {}
    res.json({id})
})

// Get game status

app.get(
    '/game/:gameId',
    validateGameID,
    (req, res) => {
	res.json(state[req.params.gameId])
    }
)

// Update game status
	
app.put(
    '/game/:gameId',
    validateGameID,
    (req, res) => {
	res.json({})
    }
)
