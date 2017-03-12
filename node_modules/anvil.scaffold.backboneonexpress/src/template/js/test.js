/*jslint node: true, sub: true */
/*global require, before, describe, it */

(function () {

	'use strict';

	var assert = require( 'assert' ),
			path = require( 'path' ),
			app, data = {};

	{{#fields}}
		data['{{this}}'] = '123';	
	{{/fields}}

	before(function (done) {
		require ( 'backbone-on-express' )({
			rootPath: path.resolve(__dirname, '../') + '/'
		}, function (server) {
			app = server;
			done();
		});
	});

	describe('Create {{name}}', function () {
		it('Should create a new {{name}}', function (done) {
			app.controllers['{{name}}'].create({
				body: data
			}, {
				redirect: function (url) {
					data._id = url.split('/')[2];
					assert.equal(typeof url, 'string');
					done();
				}
			});
		});
	});

	describe('Get {{name}}', function () {
		it('Should retrieve a new {{name}}', function (done) {

			app.controllers['{{name}}'].render = function (template, values) {
				{{#fields}}
					assert.equal(data['{{this}}'], values['{{this}}']);	
				{{/fields}}
				done();
			};
			
			app.controllers['{{name}}'].show({
				params: {
					id: data._id
				}
			});

		});
	});

	describe('Show all', function () {
		it('Should show every {{name}}', function (done) {

			app.controllers['{{name}}'].render = function (template, values) {
				assert.equal(typeof values['{{name}}s'], 'object');
				done();
			};
			
			app.controllers['{{name}}'].index();

		});
	});

	describe('Update {{name}}', function () {
		it('Should update the {{name}}', function (done) {

			{{#fields}}
				data['{{this}}'] = '456';	
			{{/fields}}

			app.controllers['{{name}}'].render = function (template, values) {
				{{#fields}}
					assert.equal(data['{{this}}'], values['{{this}}']);
				{{/fields}}
				done();
			};

			app.controllers['{{name}}'].update({
				body: data
			}, {
				redirect: function () {
					app.controllers['{{name}}'].show({
						params: {
							id: data._id
						}
					});
				}
			});

		});
	});

	describe('Delete the {{name}}', function () {
		it('Should remove the {{name}}', function (done) {

			app.controllers['{{name}}'].render = function (template, values) {
				assert.equal(template, 404);
				done();
			};
			
			app.controllers['{{name}}'].destroy({
				params: {
					id: data._id
				}
			}, {
				redirect: function () {
					app.controllers['{{name}}'].show({
						params: {
							id: data._id
						}
					});	
				}
			});

		});
	});

}());