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

server.connection({
	port: 8000,
	host: 'localhost'
})

server.register(Inert, (err) =>{
	if(err){
		throw err
	}

	server.route({
		path: '/style/{file*}',
		method: 'GET',
		handler: {
			directory: {
				path: Path.join(__dirname, '/public/style')
			}
		}
	})
	server.route({
		path: '/imgs/{file*}',
		method: 'GET',
		handler: {
			directory: {
				path: Path.join(__dirname, '/public/imgs')
			}
		}
	})
})

//home route
server.route({
	method:'GET',
	path:'/',
	handler: (request, reply) =>{
		reply.view('index')
	}
})

server.route({
	method:'GET',
	path:'/books/search',
	handler: (request, reply) =>{
		reply.view('search')
	}
})

server.route({
	method:'GET',
	path:'/books/query/',
	handler: (request, reply) =>{
		let books
		let name = request.query.name
		let field = request.query.field
		console.log(`${field}: ${name}`)
		const query = book.orderByChild(`${field}`)
							.equalTo(`${name}`)
		query.once('value', data =>{
			console.log(data)
			books = data.val()
			console.log(books)
			reply.view('all', {books:books}) 
			})			
	}
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

//Books
server.route({
	method:'GET',
	path:'/books/all',
	handler: (request, reply) =>{
		let books
		book.once('value', data => {
			books = data.val()
			reply.view('all',{
				books: books
			}) 
		})
	}
})

server.route({
	method:'GET',
	path:'/books/new',
	handler: (request, reply) =>{
		reply.view('new') 
	}
})

server.route({
	method:'GET',
	path:'/books/{isbn}',
	handler: (request, reply) =>{
		let books
		let isbn = request.params.isbn
		book.once('value', data => {
			books = data.val()
			let aBook = books[isbn]
			console.log(aBook)
			reply.view('single', aBook) 
		})		
	}
})

server.route({
	method:'GET',
	path:'/books/{isbn}/edit',
	handler: (request, reply) =>{
		let books
		let isbn = request.params.isbn
		book.once('value', data => {
			books = data.val()
			let aBook = books[isbn]
			console.log(aBook)
			reply.view('edit', aBook) 
		})		
	}
})
//post
server.route({
	method:'POST',
	path:'/books/new',
	handler: (request, reply) =>{
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
		book.child(`${newBook.isbn}`).set(newBook)
		reply.redirect().location('all')
	}
})

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

