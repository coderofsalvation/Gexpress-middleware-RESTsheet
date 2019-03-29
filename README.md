<img src="https://github.com/coderofsalvation/Gexpress/raw/master/gexpress.png"/>

Expose spreadsheet using REST endpoints

## Usage

```
var sheet    = SpreadsheetApp.openById('1AImZywpGLsOWZafgyHUHBo')
var person   = GexpressTamotsu.middleware('/person', {sheet:sheet,tab:'persons'})

app.use( person )
```

## Advanced usage

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
