
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , fs = require('fs')

var app = express()
  ,options = {
    key: fs.readFileSync('keys/spdy-key.pem'),
    cert: fs.readFileSync('keys/spdy-cert.pem'),
    ca: fs.readFileSync('keys/spdy-csr.pem')
  };


app.configure(function(){
  app.set('port', process.env.PORT || 4443);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

http.createServer(app).listen(3002, function(){
  console.log("Express server listening on port " + 3002);
});

app.post('/agif/:fileName', function(req, res) {
//    var fileName = req.params.fileName;
//    var image = req.body;
    var imageFile = req.files.image;
    var uploadedFilePath = imageFile.path;
    var targetPath = '/upload/agif/' + imageFile.filename;
    var saveFilePath = __dirname + '/public' + targetPath;
    fs.rename(uploadedFilePath, saveFilePath, function (err) {
        if (err) {
            res.send(500, err);
        } else {
            res.send(200, targetPath);
        }
    });
});
