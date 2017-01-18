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
  if(input.name || input.oid){

    var results = searchData(input);

    res.setHeader('Content-Type', 'application/json');
    if(results.length > 0)
      res.send(JSON.stringify(results[0]));
    else
      res.send("{}");

    return;
  }

  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.post('/favorites', function(req, res){
  var input = req.body;
  console.log('POST');
  console.log(JSON.stringify(input, null, 4));

  if(!input.name || !input.oid){
    res.send("Error");
    return;
  }

  var results = searchData(input);
  var data = JSON.parse(fs.readFileSync('./data.json'));

  if(results.length == 0)
    data.push(input);
  
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(input));
});

app.delete('/favorites', function(req, res){
  var input = req.query;
  console.log('POST');
  console.log(JSON.stringify(input, null, 4));

  if(/*!input.name ||*/ !input.oid){
    res.send("Error");
    return;
  }

  var reduced = reducedData(input);
  
  fs.writeFile('./data.json', JSON.stringify(reduced));
  res.setHeader('Content-Type', 'application/json');
  res.send('{}');
});

var reducedData = function(input){
  input = input || {};

  var data = JSON.parse(fs.readFileSync('./data.json'));
  var remove = function(x){
    return (input.oid == x.oid) ? false : x;
  };

  return data.map(remove).filter(function(x){return x;});
};

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