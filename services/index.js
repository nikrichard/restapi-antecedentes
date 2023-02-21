'use strict'
const config = require('../config/config')
const axios = require('axios')

const request = require('request')

function apiSoap(numDocument){

    const baseURL = 'http://www.informacolombia.com/InformaIntWeb/services/LaftXML';
    const xmls = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://servicioWebLAFT.informa">
        <soapenv:Header/>
        <soapenv:Body>
                <ser:obtenerLaftXMLUncoded soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                <xmlLaftEntrada xsi:type="xsd:string">
                <![CDATA[
                    <PETICION_PRODUCTO>
                        <IDENTIFICACION>
                            <USUARIO>${config.user}</USUARIO>
                            <PASSWORD>9KHZ4AX5KN</PASSWORD>
                        </IDENTIFICACION>
                        <PETICION_LAFT>
                            <REG_CODIGO></REG_CODIGO>
                            <REG_IDENTIFICACION>${numDocument}</REG_IDENTIFICACION>
                            <REG_NOMBRE></REG_NOMBRE>
                            <REG_PARAM_MONITOREO>N</REG_PARAM_MONITOREO>
                        </PETICION_LAFT>
                    </PETICION_PRODUCTO>]]>
                </xmlLaftEntrada>
            </ser:obtenerLaftXMLUncoded>
        </soapenv:Body>
    </soapenv:Envelope>`;
    
    return new Promise(function(resolve, reject){
		request.post({
            url: baseURL,
            body: xmls,
            headers: {
                'Content-Type': 'text/xml',
                SOAPAction: ''
            }
        },
        function(error, response, body){
			if(response.statusCode != 200){
				reject(error)
			}else{
                resolve(body)
			}
		});
    })
    
}
module.exports = {
    apiSoap
}