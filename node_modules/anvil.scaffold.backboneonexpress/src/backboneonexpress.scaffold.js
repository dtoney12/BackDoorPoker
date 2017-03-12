/*global Handlebars */
/*jslint node: true, plusplus: true, evil: true */

var path = require( "path" ),
    root = path.resolve( __dirname, "../src/template/" ) + "/",
    fs = require( "fs" ),
    handlebars = require( "handlebars" );


module.exports = function( _, anvil ) {

    "use strict";

    // Backbone on Express Project
    anvil.scaffold({

        type: "boe",
        description: "Creates a new Backbone on Express application",

        prompt: [{
            name: "name",
            description: "Your application name:",
            required: true

        }, {
            name: "secret",
            description: "A password to keep your application secure:",
            required: true
        }],

        output: {

            "{{path}}": {

                "server.js": anvil.scaffold.file( root + "js/server.js" ),
                "build.json": anvil.scaffold.file( root + "json/build.json" ),
                "package.json": anvil.scaffold.file( root + "json/package.json" ),
                ".gitignore": anvil.scaffold.file( root + ".gitignore" ),
                "test/.empty": anvil.scaffold.file( root + ".empty" ),
                
                "log":{
                    "access.log": anvil.scaffold.file( root + "log.log" ),
                    "error.log": anvil.scaffold.file( root + "log.log" )
                },

                "app": {
                    
                    "controllers": {
                        "app_controller.js": anvil.scaffold.file( root + "js/appcontroller.js" ),
                        "pages_controller.js": anvil.scaffold.file( root + "js/pagescontroller.js" )
                    },

                    "config": {
                        "routes.js": anvil.scaffold.file( root + "js/router-server.js" ),
                        "environments": {
                            "development.json": anvil.scaffold.file( root + "json/config-custom.json" ),
                            "production.json": anvil.scaffold.file( root + "json/config-custom.json" ),
                            "global.json": anvil.scaffold.file( root + "json/config-global.json" )
                        }
                    }

                },

                "public": {

                    "scripts": {
                        "app.js": anvil.scaffold.file( root + "js/app.js" ),
                        "collections/.empty": anvil.scaffold.file( root + ".empty" ),
                        "models/.empty": anvil.scaffold.file( root + ".empty" ),
                        "config/router.js": anvil.scaffold.file( root + "js/router-client.js" ),
                        "views/pages/home.js": anvil.scaffold.file( root + "js/view.js" )
                    },

                    "templates": {
                        "layout.ejs": anvil.scaffold.file( root + "ejs/layout.ejs" ),
                        "pages/home.ejs": anvil.scaffold.file( root + "ejs/home.ejs" )
                    }
                }

            }

        }
    });

    // Backbone on Express Crud
    anvil.scaffold({

        type: "boe:crud",
        description: "Creates the CRUD functionality for a Backbone on Express module",

        prompt: [{
            name: "name",
            description: "The module name (ie: user):",
            required: true
        }, {
            name: "fields",
            description: "The fields to be used in the module (ie: firstName,phone,email):",
            required: true
        }],

        render: function ( data ) {

            var template, fields, field, i;

            if (typeof data.data.fields === "string") {
                data.data.fields = data.data.fields.split(',');
            }

            template = handlebars.compile( data.template );

            return template( data.data );
        },

        output: {

            "{{path}}": {
                "test/{{name}}s_test.js": anvil.scaffold.file( root + "js/test.js" ),
                "app": {
                    "controllers/{{name}}s_controller.js": anvil.scaffold.file( root + "js/controller.js" ),
                    "config/routes.js": function (data) {
                        var file = fs.readFileSync( anvil.project.root + "/app/config/routes.js", "utf8" ).replace("crud = [];", "crud = []; crud.push('" + data.name + "'); ");
                        fs.writeFileSync( anvil.project.root + "/app/config/routes.js", file, "utf8" );
                        return file;
                    }
                },
                "public": {

                    "scripts": {
                        "views/{{name}}": {
                            "edit.js": anvil.scaffold.file( root + "js/view.js" ),
                            "index.js": anvil.scaffold.file( root + "js/view.js" ),
                            "new.js": anvil.scaffold.file( root + "js/view.js" ),
                            "show.js": anvil.scaffold.file( root + "js/view.js" )
                        },
                        "models/{{name}}_model.js": anvil.scaffold.file( root + "js/model.js" ),
                        "collections/{{name}}s_collection.js": anvil.scaffold.file( root + "js/collection.js" )
                    },

                    "templates/{{name}}": {
                        "_form.ejs": anvil.scaffold.file( root + "ejs/_form.ejs" ),
                        "index.ejs": anvil.scaffold.file( root + "ejs/index.ejs" ),
                        "new.ejs": anvil.scaffold.file( root + "ejs/new.ejs" ),
                        "edit.ejs": anvil.scaffold.file( root + "ejs/edit.ejs" ),
                        "show.ejs": anvil.scaffold.file( root + "ejs/show.ejs" )
                    }

                }
            }

        }

    });

};