/*jslint node: true */
/*global define, app */

define([
	'underscore',
	'backbone',
	'models/{{name}}_model',
	'collections/{{name}}s_collection'
], function (_, Backbone, Model, Collection) {

	'use strict';

	return Backbone.Controller.extend({

		name: '{{name}}',

		'new': function (req, res) {

			var model = new Model();

			this.render('{{name}}/new', _.extend({
				title: 'New {{name}}'
			}, model.defaults));

		},

		'edit': function (req, res) {

			var self = this,
					model = new Model({
						_id: req.params.id
					});

			model.fetch(function (model, data, err) {
				self.render('{{name}}/edit', _.extend(data, {
					title: 'Edit {{name}}'
				}));
			});

		},

		'index': function (req, res) {

			var self = this,
					collection = new Collection();

			collection.fetch({

				success: function (collection, data, options) {
					self.render('{{name}}/index', {
						'{{name}}s': data,
						title: '{{name}}s'
					});
				},

				error: function (collection, error, options) {
					self.render(500);
				}

			});

		},

		'show': function (req, res) {

			var self = this,
					model = new Model({
						_id: req.params.id
					});

			model.fetch(function (model, data, err) {
				if (data) {
					self.render('{{name}}/show', _.extend(data, {
						title: 'View {{name}}'
					}));
				} else {
					self.render(404);
				}
			});

		},

		'update': function (req, res) {

			var model, self = this;

			model = new Model(req.body);

			model.save({
				success: function (model, data) {
					res.redirect('/{{name}}/' + data._id);
				},
				error: function (model, data) {
					if (data) {
						req.session.flash = {
							type: 'error',
							message: 'Update error.',
							errors: data,
							body: req.body
						};
						res.redirect('/{{name}}/edit/' + req.session['{{name}}']._id);
					} else {
						self.render(500);
					}
				}
			});
			
		},

		'create': function (req, res) {

			var model, self = this;

			model = new Model(req.body);

			model.save({
				success: function (model, data) {
					res.redirect('/{{name}}/' + data._id);
				},
				error: function (model, data) {
					if (data) {
						req.session.flash = {
							type: 'error',
							message: 'Create error.',
							errors: data,
							body: req.body
						};
						res.redirect('/{{name}}/new');
					} else {
						self.render(500);
					}
				}
			});

		},

		'destroy': function (req, res) {

			var self = this,
					model = new Model({
						_id: req.params.id
					});

			model.destroy(function (model, data, err) {
				res.redirect('/{{name}}');
			});

		}

	});

});