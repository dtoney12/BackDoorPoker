/*global define, Backbone */

define(function () {

	'use strict';

	return Backbone.Model.extend({

		urlRoot: '/json/{{name}}',

		name: '{{name}}',

		defaults: {
			{{#fields}}
				'{{this}}': '',
			{{/fields}}
		},

		schema: {
			{{#fields}}
				'{{this}}': {
					type: String
				},
			{{/fields}}
		}

	});

});