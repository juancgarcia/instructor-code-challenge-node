var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')));


app.get('/favorites', function(req, res){
  var input = req.query;

  // handle individual favorite request
  if(input.name || input.oid){

    var results = searchData(input);

    res.setHeader('Content-Type', 'application/json');
    if(results.length > 0)
      res.send(JSON.stringify(results[0]));
    else
      res.send("{}");

    return;
  }

  // or send the whole list
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});


app.post('/favorites', function(req, res){
  var input = req.body;

  // can't save a favorite if info not supplied
  if(!input.name || !input.oid){
    res.send("Error");
    return;
  }

  // see if it's already in the data store first
  var results = searchData(input);
  var data = JSON.parse(fs.readFileSync('./data.json'));

  // add if a new entry
  if(results.length == 0)
    data.push(input);
  
  // return the one favorite
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(input));
});


app.delete('/favorites', function(req, res){
  var input = req.query;

  // can't delete without a reference
  if(/*!input.name ||*/ !input.oid){
    res.send("Error");
    return;
  }

  // data store copy with to-delete item stripped out
  var reduced = reducedData(input);
  
  // write back the trimmed list
  fs.writeFile('./data.json', JSON.stringify(reduced));

  // return an empty object (signifying success)
  res.setHeader('Content-Type', 'application/json');
  res.send('{}');
});

// return a copy of the data store minus any copies of the passed item
var reducedData = function(input){
  input = input || {};

  var data = JSON.parse(fs.readFileSync('./data.json'));
  var remove = function(x){
    return (input.oid == x.oid) ? false : x;
  };

  return data.map(remove).filter(function(x){return x;});
};

// returns any items in the data store which matches the passed input
var searchData = function(input){
  input = input || {};

  var data = JSON.parse(fs.readFileSync('./data.json'));
  var search = function(x){
    return (input.oid == x.oid) ? x : false;
  };

  return data.map(search).filter(function(x){return x;});
};

app.listen(app.get('port'), function(){
  console.log("Listening on port "+app.get('port'));
});