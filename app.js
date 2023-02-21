'use strict'
const express = require('express')
const app = express();
const morgan=require("morgan")

const routesApi = require('./routes')

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(morgan("dev"))


app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use('/api', routesApi)
	
module.exports = app