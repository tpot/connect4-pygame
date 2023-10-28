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

function newGameState() {
    return {
	turn: 1,
	winner: 0,
	board: [[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0]]}
}

// Create a new game, return game ID

app.post('/game', (req, res) => {
    const id = gameIdCounter++
    state[id] = newGameState()
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


function updateBoard(board, player, column) {
    const new_board = JSON.parse(JSON.stringify(board))
    for(row = 5; row >= 0; row--) {
	if (board[row][column] === 0) {
	    new_board[row][column] = player
	    return new_board
	}
    }
    throw new Error('Invalid move')
}

function validMove(board, player, column) {
    // Column is already full
    if (board[0][column] != 0) {
	return false
    }
    
    return true
}

function updateWinner(board) {
    return 0
}

app.put(
    '/game/:gameId',
    validateGameID,
    (req, res) => {
	const s = state[req.params.gameId]

	const player = parseInt(req.query.player)
	const column = parseInt(req.query.column)

	// Check whether it's the players turn
	if (s.turn != player) {
	    res.status(400).json({
		message: `Invalid player ${player}`,
	    })
	    return
	}

	// Check valid column
	if (column < 0 || column > 7) {
	    res.status(400).json({ 
		message: `Invalid column ${column}`,
	    })
	    return
	}

	// Check for valid move
	if (!validMove(s.board, player, column)) {
	    res.status(400).json({
		message: `Invalid move`,
	    })
	    return
	}

	// Update board with token
	s.board = updateBoard(s.board, player, column)

	// Check for winner
	s.winner = updateWinner(s.board)

	// Switch player
	if (player == 1) {
	    s.turn = 2
	} else {
	    s.turn = 1
	}

	res.json(s)
    }
)

// Player's key string = 4 digits randomly generated with lowercase letters and 0-9. There are 1,679,616 different combinations, which is secure enough.

/*

deadline

---------------------------- x ------ x ---------------------------
                               U

*/
