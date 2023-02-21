const mongoose = require('mongoose')
const Schema = mongoose.Schema

const infoUserSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    tipoInfo: {
        type: String
    },
    observacion: {
        type: String
    },
    codigo_informa :{
        type: String
    },
    ilicitos_respuesta: [
        {
            _attributes: {
                type: String
            },
            porcentaje: {
                type: String
            },
            campo_buscado:{
                type: String
            },
            valor_buscado: {
                type: String
            },
            registro: {
                type: String
            },
            tipo_lista: {
                type: String
            },
            nombre_completo: {
                type: String
            },
            nit: {
                type: String
            },
            fuente: {
                type: String
            },
            fecha_update: {
                type: String
            },
            /*estado: {
                type: String
            },*/
            motivo: {
                type: String
            }
        }
    ]
})

module.exports = mongoose.model("InfoUser", infoUserSchema)