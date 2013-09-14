
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3002);
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

app.post('/upload/movies/:fileName', function(req, res) {
    var actorTwitterId = req.body.actorTwitterId;
    var actorName = req.body.actorName;
    console.log(req.body);
    var movieId = req.body.movieId;
    var movieFile = req.files.movie;
    var fileName = movieFile.filename;
    var uploadedFilePath = movieFile.path;
    var targetPath = '/upload/movies/' + fileName;
    var saveFilePath = getUploadedMoviePath(fileName);
    fs.rename(uploadedFilePath, saveFilePath, function (err) {
        if (err) {
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