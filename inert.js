const Path = require('path')

module.exports=[
	{
		path: '/style/{file*}',
		method: 'GET',
		handler: {
			directory: {
				path: Path.join(__dirname, '/public/style')
			}
		}
	},
	{
		path: '/imgs/{file*}',
		method: 'GET',
		handler: {
			directory: {
				path: Path.join(__dirname, '/public/imgs')
			}
		}
	}
]