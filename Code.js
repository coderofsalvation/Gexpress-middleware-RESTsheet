/*
# Usage

```
var sheet    = SpreadsheetApp.openById('1AImZywpGLsOWZafgyHUHBo')
var person   = GexpressTamotsu.middleware('/person', {sheet:sheet,tab:'persons',order:'date_modify DESC'})

app.use( person )
```

> Voila! now the following urls are exposed:

| url | will return |
|-|-|
|GET `https://{your-script-url}/?path=/person`                     | all rows from 'persons'-sheettab             |
|GET `https://{your-script-url}/?path=/person/123`                 | person with value '123' in column '#'        |
|DELETE `https://{your-script-url}/?path=/person/123&method=DELETE`| person with value '123' in column '#'        |
|POST `https://{your-script-url}/?path=/person&method=POST`        | append (person) jsondata to 'persons'-sheettab |
|PUT `https://{your-script-url}/?path=/person/123&method=PUT`      | update person '123' with jsondata            |

> NOTE: in the sheet, make sure all rows in column '#' are formatted as __plain text__ (other wise you'll get an `Record not found [id=..] error-response`)

# Advanced usage

> NOTE: this middleware is based on [tamotsu](https://github.com/itmammoth/Tamotsu)
                                                                          
```                                                                       
    var tamotsu_opts    = {    // generated output properties             
      fullName: function() {   // for options see https://github.com/itmammoth/Tamotsu
        return [this['First Name'], this['Last Name']].join(' ');
      }
    }

    var opts     = {
      sheet:sheet,
      tab:'foo',
      tamotsu:tamotsu_opts,
      query: {active:1},        // default 'where'-query
      limit: 25,                // default limit on .all() results
      order: 'date_modify DESC' // default order on .all() results
    }        

    app.use( GexpressTamotsu.middleware('/foo',opts ) )
               
    // lets hook into GET /person
    person.get = function(req,res,handler){
               
      if( req.route == '/person/:id' ){  
          var result = handler()
          // to access sheetdata: handler.table.where({foo:12}).all()             
          return result;
      }                  
                         
      if( req.url == '/person' ){
         var result = handler()
         result.items = result.items.map( function(person){
           var forbidden = ['email','phone']
           forbidden.map(function(f){ delete person[f] })
           return person
         })        
         return result
       }else return handler()
               
    }             
```             
*/

function middleware(path,opts){
  if( !opts.sheet || !opts.tab ) throw 'GexpressTamotsu.middleware needs url & sheetname passed in options object'
  Tamotsu.initialize(opts.sheet)
  var endpoint
  
  var reply = function(data,res){
      res.set('content-type','application/json')
      res.send( JSON.stringify(data) )
      res.end()    
  }
  
  var runHandler = function(req, res, handler){
      handler.table = table
      try{
        var cb = endpoint[ req.method.toLowerCase() ]
        if( cb ) result = cb( req, res, handler )
        else result = handler()
        reply(result,res)
      }catch (e){ reply({error:e},res) }  
  }

  endpoint = function(req,res,next){
    var table = Tamotsu.Table.define({ sheetName: opts.tab }, opts.tamotsu )
   
    // spy .end() function to prevent calling twice
    var end = res.end
    res.end = function(){
      if(!res.endCalled) end()
      res.endCalled = true
    }
    
    // GET /{path}/:id
    if( req.url.match(path) && req.params.id ){
      req.route = path+'/:id'
      Logger.log(opts)
      runHandler(req,res,function(){
        try{ 
          return table.find(req.params.id)
        }catch(e){ return {error:e} }
      })
    }
    
    // GET /{path}
    if( req.url == path && req.method == 'GET' ){
      var handler = function(){
        var limit  = req.query.limit  || opts.limit || 25
        var offset = req.query.offset || 0
        var query  = req.query.query  || opts.query || {}
        var order  = req.query.order  || opts.order || false
        var items  = table.where(query)
        if( order ) items.order(order)
        items      = items.all().slice(offset,limit)
        var nitems = items.length
        return {limit:limit,offset:offset,order:order,nitems:nitems,items:items}
      }
      runHandler(req,res,handler)
      return
    }
    next()
  }
  
  return endpoint
}