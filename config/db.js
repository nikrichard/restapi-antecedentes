module.exports = {
	port: process.env.PORT || 3000, //coneccion al puerto localhost:3000 y coneccion al servidor de la nube
	db: process.env.MONGODB || 'mongodb://localhost:27017/app-client',  //coneccion local a mongo db	
}