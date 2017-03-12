/*jslint node: true */
/*global define */

define([
	'underscore',
	'backbone'
], function (_, Backbone) {

	'use strict';

	return Backbone.Controller.extend({

		name: 'Pages',

		home: function (req, res) {
			this.render('pages/home', {
				title: 'Backbone on Express'
			});
		}

	});

});