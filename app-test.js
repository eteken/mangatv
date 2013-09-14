
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

var movieData = [];
var movieDataFilePath = './data/movie-data.json';

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

(function() {
    if (!fs.existsSync(movieDataFilePath)) {
        return;
    }
    var movieDataContent = fs.readFileSync(movieDataFilePath, {encoding: 'utf8'});
    movieData = JSON.parse(movieDataContent);
    
})();

app.get('/', routes.index);
app.get('/users', user.list);

https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

http.createServer(app).listen(3002, function(){
  console.log("Express server listening on port " + 3002);
});

app.post('/upload/movies/:fileName', function(req, res) {
    var twitterId = req.body.twitterId;
    var movieId = req.body.movieId;
    var targetPath = '/upload/movies/' + fileName;
    var movieFile = req.files.movie;
    var uploadedFilePath = movieFile.path;
    var fileName = movieFile.filename;
    var saveFilePath = getUploadedMoviePath(fileName);
    fs.rename(uploadedFilePath, saveFilePath, function (err) {
        if (err) {
            res.send(500, err);
        } else {
            movieData.push({
                movieId: movieId,
                fileName: fileName,
                twitterId: twitterId
            });
            storeMovieData(function(err) {
                if (err) {
                    console.error(err);
                }
            });
            res.send(200, targetPath);
        }
    });
});

app.get('/movies/:id')
function getUploadedMoviePath(fileName) {
    var targetPath = '/upload/movies/' + fileName;
    var saveFilePath = __dirname + '/public' + targetPath;
    return saveFilePath;
}
function storeMovieData(callback) {
    fs.writeFile(movieDataFilePath, JSON.stringify(movieData), function(err) {
        callback(err);
    });
}