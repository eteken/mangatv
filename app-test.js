
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
  , CONTEXT_PATH = ''
;

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
  app.use(function(req, res, next){
      res.locals.contextPath = CONTEXT_PATH;
      next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
http.createServer(app).listen(3002, function(){
  console.log("Express server listening on port " + 3002);
});
https.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// ===ここから下をapp.jsにもコピー
var movieData = [];
var movieDataFilePath = __dirname + '/data/movie-data.json';

(function() {
    if (!fs.existsSync(movieDataFilePath)) {
        return;
    }
    var movieDataContent = fs.readFileSync(movieDataFilePath, {encoding: 'utf8'});
    movieData = JSON.parse(movieDataContent);
})();

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/upload/movies/:fileName', function(req, res) {
    var actorTwitterId = req.body.actorTwitterId;
    var actorName = req.body.actorName;
    console.log(req.body);
    var movieId = req.body.movieId;
    var movieFile = req.files.movie;
    var fileName = movieFile.filename;
    var uploadedFilePath = movieFile.path;
    var targetPath = getMoviePath(fileName);
    var saveFilePath = getMovieLocation(fileName);
  console.log('uploadedFilePath:' + uploadedFilePath + ' saveFilePath:' + saveFilePath);
    fs.rename(uploadedFilePath, saveFilePath, function (err) {
        if (err) {
            console.log('uploadedFilePath:' + uploadedFilePath + ' saveFilePath:' + saveFilePath);
            console.error(err);
            res.send(500, err);
        } else {
            movieData.push({
                id: movieId,
                fileName: fileName,
                path: targetPath,
                actor: {
                    twitterId: actorTwitterId,
                    name: actorName
                }
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

app.get('/movies', function(req, res) {
    res.render('movies/index', { movieData: movieData });
});

app.get('/movies/:id', function(req, res) {
    var movieId = req.params.id;
    var targetIdx = -1;
    var max = movieData.length;
    for (var i = 0; i < max; i++) {
        if (movieData[i].id == movieId) {
            targetIdx = i;
            break;
        }
    }
    if (targetIdx === -1) {
        return res.send(404);
    }
    var prev = null, next = null;
    var target = movieData[targetIdx];
    if (targetIdx > 0) {
        prev = movieData[targetIdx - 1];
    }
    if (targetIdx < max - 1) {
        next = movieData[targetIdx + 1];
    }
    res.render('movies/detail', {
        target: target,
        prev: prev,
        next: next
    });
});

function getMovieLocation(fileName) {
    var targetPath = getMoviePath(fileName);
    var saveFilePath = __dirname + '/public' + targetPath;
    return saveFilePath;
}
function getMoviePath(fileName) {
    return '/upload/movies/' + fileName;
}
function storeMovieData(callback) {
    fs.writeFile(movieDataFilePath, JSON.stringify(movieData), function(err) {
        callback(err);
    });
}