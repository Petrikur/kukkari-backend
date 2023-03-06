const express = require('express');
const { check } = require('express-validator');

const notesController = require("../controllers/notes-controller")

const auth = require("../auth/auth");


