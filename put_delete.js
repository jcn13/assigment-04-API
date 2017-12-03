const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const Handlebars = require('handlebars')
const firebase = require('firebase')
const Path = require('path')
require('dotenv').config()

const server = new Hapi.Server()

const db = firebase.database()
const book = db.ref('books')

module.exports=[
	{
		method:'DELETE',
		path:'/books/{isbn}',
		handler: (request, reply) =>{
			let isbn = request.params.isbn
			book.child(`${isbn}`).remove()
			reply.redirect().location('../all')
		}
	},
	{
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
			if(isbn !== request.payload.isbn){
				console.log(`Criando novo e apagando o velho`)
				book.child(`${isbn}`).remove()
				book.child(`${request.payload.isbn}`).set(newBook)
				reply.redirect().location(`../${request.payload.isbn}`)	
			}else{
				console.log(`Editando ${newBook}`)
				book.child(`${isbn}`).update(newBook)
				reply.redirect().location(`../${isbn}`)				
			}
		}
	}
]