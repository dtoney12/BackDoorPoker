/*global require, define, appConfig */

define([
	'backbone-on-express'
], function (Backbone) {

	'use strict';
	
	var router, Router = Backbone.Router.extend({

		routes: {
			'*actions': 'defaultRoute'
		},

		defaultRoute: function (path) {
			path = path || appConfig.route;
			require(['/scripts/views' + path + '.js'], function (View) {
				var view = new View();
				view.render();
			});
		}

	});

	router = new Router();

	Backbone.history.start();

	return router;

});