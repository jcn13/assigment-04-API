const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const Handlebars = require('handlebars')
const Path = require('path')

//heroku config
const PORT = process.env.PORT || 8000
const server = new Hapi.Server()

server.connection({
	port: PORT
})

server.register(Inert, (err) =>{
	if(err){
		throw err
	}
	server.route(require('./inert'))
})
server.register(Vision, (err) =>{
	if(err){
		throw err
	}
	server.views({
		engines:{
			html: Handlebars
		},
		path: __dirname + '/views'
	})
})

server.route(require('./routes'))

server.register(require('hapi-overriding'), (err) =>{
	if(err){
		throw err
	}
	server.route(require('./put_delete'))
})

server.start((err) =>{
	if(err){
		throw err
	}
	console.log(`Server started: ${server.info.uri}`)
})