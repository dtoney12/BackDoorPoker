try
{
    var Player = Backbone.Model.extend(
        {
            
        });
    
    var Players = Backbone.Collection.extend(
        {
            model: Player,
            initialize:
                function()
                {
                    this.on( "change:name", this.changeName, this);
                    this.on( "change:age", this.changeAge, this);
                },
            changeName:
                function( model, val, options)
                {
                    var prev = model.previousAttributes();
                    this.log( model.get("name") + " changed his name from " + prev.name);
                },
            changeAge:
                function( model, val, options)
                {
                    var prev = model.previousAttributes();
                    this.log( model.get("name") + " changed his age from " + prev.age + " to " + model.get("age"));
                },
            log:
                function( message)
                {
                    debugger
                    $("#results").append( "<li>" + message + "</li>");
                }
        });
    
    var daz = new Player( {name:"daz", age:33});
    var gaz = new Player( {name:"gaz", age:38});
    var baz = new Player( {name:"baz", age:34});

    var players = new Players([daz, gaz, baz]);

    daz.set( {name:"Daz"});
    baz.set( {age:43});
}
catch(e)
{
    alert( e.message);
}