/* for docs see: https://github.com/coderofsalvation/Gexpress-middleware-RESTsheet */

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