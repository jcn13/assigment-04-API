const Handlebars = require('handlebars')
const firebase = require('firebase')
const path = require('path')

const config = {
    apiKey: "AIzaSyBJbtAWNHp4vaO-9Yic-m75R-keNfeqpQg",
    authDomain: "assignment-04-api.firebaseapp.com",
    databaseURL: "https://assignment-04-api.firebaseio.com",
    projectId: "assignment-04-api",
    storageBucket: "assignment-04-api.appspot.com",
    messagingSenderId: "771892051580"
}
firebase.initializeApp(config)

const db = firebase.database()
const book = db.ref('books')
const user = db.ref('user')

module.exports =[
	{
		method:'GET',
		path:'/',
		handler: (request, reply) =>{
			reply.view('index')
		}
	},
	{
		method:'GET',
		path:'/books/search',
		handler: (request, reply) =>{
			reply.view('search')
		}
	},
	{
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
	},
	{
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
	},
	{
		method:'GET',
		path:'/books/new',
		handler: (request, reply) =>{
			reply.view('new') 
		}
	},
	{
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
	},
	{
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
	},
	{
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
	},
	{

	}
]





