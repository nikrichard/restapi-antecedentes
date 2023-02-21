'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    nombres: { type: String },
    primerApellido: { type: String },
    segundoApellido: { type: String },
    tipoDeDocumento: { type: String },
    numeroDeDocumento: { type: String },
    tipoDeEmpleado: { type: String },
    direccion: { type: String },
    telefono: { type: String },
    correo: { type: String },
    usuarioQueSolicita: { type: String },
    estado: { type: Boolean }
})

module.exports = mongoose.model("User", userSchema)