const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const Handlebars = require('handlebars')
const firebase = require('firebase')
const Path = require('path')
require('dotenv').config()

const server = new Hapi.Server()

const config = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID
}
firebase.initializeApp(config)

const auth = firebase.auth()
const db = firebase.database()
const book = db.ref('books')
const user = db.ref('user')

const PORT = process.env.PORT || 8000

server.connection({
	port: PORT,
	host: 'localhost'
})

server.route(require('./routes'))

server.register(require('hapi-overriding'), (err) =>{
	if(err){
		throw err
	}
	server.route({
		method:'DELETE',
		path:'/books/{isbn}',
		handler: (request, reply) =>{
			let isbn = request.params.isbn
			book.child(`${isbn}`).remove()
			reply.redirect().location('../all')
		}
	})
	server.route({
		method:'PUT',
		path:'/books/{isbn}',
		handler: (request, reply) =>{
			let isbn = request.params.isbn
			let newBook = {
				title: request.payload.title,
				isbn: request.payload.isbn,
				author: request.payload.author,
				genre: request.payload.genre,
				pub_inf:{
					published_date: request.payload.published_date,
					publisher: request.payload.publisher,
					edition: request.payload.edition
				},
				status:{
					borrowed: request.payload.borrowed,
					reserved: request.payload.reserved
				}
			}
			console.log(`Editando ${newBook}`)
			book.child(`${isbn}`).update(newBook)
			reply.redirect().location(`../${isbn}`)
		}
	})			
})

server.start((err) =>{
	if(err){
		throw err
	}
	console.log(`Server started: ${server.info.uri}`)
})

