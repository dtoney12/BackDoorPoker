/*global define */

define([

	'models/{{name}}_model'

], function (Model) {

	'use strict';

	return Backbone.Collection.extend({

		name: '{{name}}s',

		model: Model,

		initialize: function () {
			
		}

	});

});