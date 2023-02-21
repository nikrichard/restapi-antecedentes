'use strict'
const User = require('../models/user')
const InfoUser = require('../models/infoUser')
const soap = require('../services')
const convert = require('xml-js')

async function verifyUser(req,res){

    //leer el formulario
    const nombres = req.body.nombres;
    const primerApellido = req.body.primerApellido;
    const segundoApellido = req.body.segundoApellido;
    const tipoDeDocumento = req.body.tipoDeDocumento;
    const numDocument = req.body.numDocument;
    const tipoDeEmpleado = req.body.tipoDeEmpleado;
    const direccion = req.body.direccion;
    const telefono = req.body.telefono;
    const correo = req.body.correo;
    const usuarioQueSolicita = req.body.usuarioQueSolicita;
    // estado inicial = 0
    //const estado = 0;
    //const stakeholderId = stakeholder.id;

    try {
        const user = await User.findOne({numeroDeDocumento: numDocument}, (error)=>{
            if(error){
                res.status(500).json({ 
                    success: false, 
                    message: `Error al realizar la consulta: ${error}`
                });  
            }
        })
        if(user){
            res.status(200).json({
               success: true,
               message: `El usuario ya existe`,
               user: user
            })
        }else{
            const user = await soap.apiSoap(numDocument)
                        .then((body)=>{
                            return body
                        }).catch((message)=>{
							return message;	
						})
            const result = await convert.xml2json(user, {compact: true, spaces: 4})
            const jsonResult = await JSON.parse(result)
            
            const message1 = await jsonResult["soapenv:Envelope"]["soapenv:Body"]["ns1:obtenerLaftXMLUncodedResponse"]["ns1:obtenerLaftXMLUncodedReturn"]._text 
            const result1 = await convert.xml2json(message1, {compact: true, spaces: 4})
            const jsonResult1 = await JSON.parse(result1)

            //Verificamos si existe algun error de servidor SOAP
            if ("RESPUESTA_PRODUCTO" in jsonResult1){ 
                res.status(503).json({
                    success: false,
                    message: jsonResult1.RESPUESTA_PRODUCTO.ERROR.DETALLE_ERROR._text
                })
            }else{
                //Traemos la información de los incidentes que pueda tener una persona
                const incidenteUser = await jsonResult1["RETURN"]

                //Definimos el modelo para la colección del Usuario
                const userSearch = new User({
                    nombres: nombres,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    tipoDeDocumento: tipoDeDocumento,
                    numeroDeDocumento: numDocument,
                    tipoDeEmpleado: tipoDeEmpleado,
                    direccion: direccion,
                    telefono: telefono,
                    correo: correo,
                    usuarioQueSolicita: usuarioQueSolicita,
                    estado: false,
                })
                
                //Verificamos la cantidad de incidentes que tiene la persona
                if(incidenteUser["NUMERO_OCURRENCIAS"]._text <= 0){ 
                    //"No tiene incidentes"
                    userSearch.estado = false

                    //Guardamos la información del usuario que no tiene incidentes
                    await userSearch.save(async (error, user)=>{
                        if(error){
                            res.status(500).json({
                                success: false,
                                message: `Error al realizar el registro: ${error}`
                            })
                        }  
                    })
                    res.status(200).json({
                        success: true,
                        message: `Se registró correctamente el usuario`
                    })
                }else{
                    //"Tiene incidentes"
                    userSearch.estado = true

                    //Definimos el modelo para la colección de información ilicita del Usuario
                    const infouser = new InfoUser({
                        userId: null,
                        tipoInfo: null,
                        observacion: null,
                        codigo_informa : null,
                        ilicitos_respuesta: null
                    })

                    //Traemos los datos de los incidentes
                    infouser.codigo_informa = incidenteUser["RESPUESTA_LAFT"]._text
                    
                    let cantidadIlicitos = incidenteUser["RESPUESTA_LAFT"].ILICITOS_RESPUESTA
                    let incidentes = []

                    for(var posicion in cantidadIlicitos){
                        const datos = {
                            _attributes: cantidadIlicitos[posicion]._attributes.NUM_REG,
                            porcentaje: cantidadIlicitos[posicion].PORCENTAJE._text,
                            campo_buscado: cantidadIlicitos[posicion].CAMPO_BUSCADO._text,
                            valor_buscado: cantidadIlicitos[posicion].VALOR_BUSCADO._text,
                            registro: cantidadIlicitos[posicion].REGISTRO._text,
                            tipo_lista: cantidadIlicitos[posicion].TIPO_LISTA._text,
                            nombre_completo: cantidadIlicitos[posicion].NOMBRECOMPLETO._text,
                            nit: cantidadIlicitos[posicion].NIT._text,
                            fuente: cantidadIlicitos[posicion].FUENTE._text,
                            fecha_update: cantidadIlicitos[posicion].FECHA_UPDATE._text,
                            //estado: cantidadIlicitos[posicion].ESTADO,
                            motivo: cantidadIlicitos[posicion].MOTIVO_INGRESO._text
                        }
                        incidentes.push(datos)
                    }

                    await userSearch.save(async (error, user)=>{
                        if(error){
                            res.status(500).json({
                                success: false,
                                message: `Error al realizar el registro: ${error}`
                            })
                        }else{
                            infouser.userId = user._id
                            infouser.ilicitos_respuesta = incidentes
                            await infouser.save((error)=>{
                                if(error){
                                    res.status(500).json({
                                        success: false,
                                        message: `Error al realizar el registro de incidentes: ${error}`
                                    })
                                }     
                            })
                        }
                        res.status(200).json({
                            success: true,
                            message: `Se registró correctamente el usuario`
                        })
                    })

                }
            }

        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error: ${error}`
        })
    }

}

//Función para registrar empleado
async function userSearch(req,res){
    const numDocument = req.params.numDocument //Número de documento del usuario
    
    try {
        //Buscamos si existe el usuario
        const user = await User.findOne({numeroDeDocumento: numDocument}, (error)=>{
            if(error){
              res.status(500).json({ status: false, message: `Error al realizar la consulta: ${error}`});  
            }
        })
        if(!user){
            res.status(404).json({
                success: true,
                message: `El usuario no existe`
            })
        }else{
            const userId = user._id
            //Buscamos si el usuario tiene incidentes
            const incidenteUser = await InfoUser.findOne({userId: userId}, (error)=>{
                if(error){
                    res.status(500).json({
                        success: false,
                        message: `Error al realizar el registro: ${error}`
                    })
                }
            })
            if(!incidenteUser){
                //Mostramos información del usuario
                res.status(200).json({
                    success: true,
                    user: user
                }) 
            }else{
                //Mostramos la información del Usuario con los incidentes
                res.status(200).json({
                    success: true,
                    user: user,
                    ilicitos_respuesta: incidenteUser
                }) 
            }
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error: ${error}`
        }) 
    }

}

//Función para actualizar información de los ilicitos encontrados
async function updateInfoIlicitosUser(req,res){
    const numeroDeDocumento = req.params.numeroDeDocumento
    const tipoInfo = req.body.tipoInfo
    const observacion = req.body.observacion
    try {
        const user = await User.findOne({numeroDeDocumento: numeroDeDocumento},(error)=>{
            if(error){
                res.status(500).json({
                    success: false,
                    message: `Error al realizar la petición: ${error}`
                })
            }
        })
        if(!user){
            res.status(404).json({
                success: false,
                message: `El usuario no existe`
            })
        }else{
            const userId = user._id
            await InfoUser.findOneAndUpdate({userId: userId},{tipoInfo: tipoInfo, observacion:observacion}, function(error, infoUSer){
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: `Error al realizar la petición: `
                    })
                }if(!infoUSer){
                    res.status(404).json({
                        success: false,
                        message: `No existe información alguna`
                    })
                }else{
                    res.status(200).json({
                        success: true,
                        message: `Se actualizo la información correctamente`
                    })    
                }
            })   
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error: ${error}`
        })
    }
}

module.exports = {
    verifyUser,
    userSearch,
    updateInfoIlicitosUser
}