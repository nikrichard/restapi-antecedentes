'use strict'
const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config/db')

mongoose.connect(
	config.db, 
	{
		useUnifiedTopology: true,
		useNewUrlParser: true, 
		useFindAndModify: false,
		useCreateIndex: true
	}, (err,res)=>{

	if (err) {
		return console.log(`Error al conectar a la base de datos: ${err}`)
	}else{
		console.log('Conexión a la base de datos exitosa')
	}

	app.listen(config.port, ()=>{
		console.log(`Servidor corriendo en el Puerto: ${config.port}`)
	})
   
})
