/*global require */

require.config({
    baseUrl: '/scripts',
    urlArgs: "bust=" + new Date().getTime(),
    paths: {
			'jquery': '/scripts/backbone-on-express/vendor/jquery',
			'bootstrap': '//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap.min',
			'backbone-on-express': '/scripts/backbone-on-express'
    },
    shim: {
			bootstrap: {
				deps: ['jquery']
			}
    }
});

require([
	'bootstrap',
	'backbone-on-express',
	'config/router'
], function(bootstrap, Backbone, router) {
	'use strict';
});