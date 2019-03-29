<img src="https://github.com/coderofsalvation/Gexpress/raw/master/gexpress.png"/>

[Gexpress](https://github.com/coderofsalvation/Gexpress) middleware to expose spreadsheet as REST endpoints

## Usage

```
var app      = new Gexpress.App() // see https://github.com/coderofsalvation/Gexpress
var sheet    = SpreadsheetApp.openById('1AImZywpGLsOWZafgyHUHBo')
var person   = GexpressTamotsu.middleware('/person', {sheet:sheet,tab:'persons'})

app.use( person )
```

> Voila! now the following urls are exposed:

| url | will return |
|-|-|
|GET `https://{scripturl}/?path=/person`                     | all rows from 'persons'-sheettab             |
|GET `https://{scripturl}/?path=/person/123`                 | get row with value '123' in column '#'        |
|DELETE `https://{scripturl}/?path=/person/123&method=DELETE`| remove row with value '123' in column '#'        |
|POST `https://{scripturl}/?path=/person&method=POST` {...}  | append (person) jsondata to 'persons'-sheettab |
|PUT `https://{scripturl}/?path=/person/123&method=PUT` {...}| update person '123' with jsondata            |

> IMPORTANT: include [Gexpress](https://github.com/coderofsalvation/Gexpress) and the __latest version__ of this library (`McC5ha7ENyUgeP62iQ1o5n3yo9jV2Cq2v`)

<center><img src="include.gif"/></center>

## querying the sheet

| query param | example | info |
|-|-|-|
| query | {active:1} | mongodb-ish query to match candidates in sheet |
| limit | 4          | return max 4 results |
| offset | 0         | skip n items from result, for pagination purposes |
| order | 'date_modify DESC' | sort results on date_modify column |

> GET `https://{scripturl}/?path=/person&limit=5&offset=0&order=date_modify%20DESC&query={"active":1}` 

## Generate JS Client

[Gexpress](https://github.com/coderofsalvation/Gexpress) automatically generate a JS client, so here's how to extend it:

```
    app.get('/client.js', app.client(function(code){
        return code + person.generateClientCode() 
      }) 
    )
```

> Voila, now you can run the following in your __jquery/vue/react/whatever__-app after including `<script src="https://script.google.com/{SCRIPTID}/exec?path=/client.js"></script>` in your html:

```
    backend.user.get('l2k3l').then( console.dir ).catch( console.error )
    backend.user.delete('l2k3l').then( console.dir ).catch( console.error )
    backend.user.put('l2k3l',{...data..}).then( console.dir ).catch( console.error )
    backend.user.post({...data..}).then( console.dir ).catch( console.error )

    // the following assumes columns '#', 'date_created' and 'active' to exist in your spreadsheet
    backend.user.find({active:1},{offset:0,limit:10,order:'date_created DESC'}).then( console.dir ).catch( console.error )
```



## Advanced usage

> NOTE: this middleware is based on [tamotsu](https://github.com/itmammoth/Tamotsu)
                                                                          
```                                                                       
    var opts     = {
      sheet:sheet,
      tab:'foo',
      query: {active:1},        // default 'where'-query
      limit: 25,                // default limit on .all() results
      order: 'date_modify DESC' // default order on .all() results
    }        

    opts.tamotsu = {    // generated output properties             
      fullName: function() {   // for options see https://github.com/itmammoth/Tamotsu
        return [this['First Name'], this['Last Name']].join(' ');
      }
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

## Todo 

* ✓ GET /foo
* ✓ GET /foo/:id
* ◔ POST /foo
* ◔ PUT /foo/:id
* ◔ DELETE /foo/:id
* ✓ support for 'query'-arg 
* ✓ support for 'limit'-arg 
* ✓ support for 'order'-arg 
* ✓ support for 'offset'-arg 
* ❍ more tests
