
/**
 * Module dependencies.
 */

var express = require('express'),
    knox     = require('knox'),
    routes = require('./routes'),
    socket = require('socket.io'),
    yourAccessKeyId = require('./secrets').index().accessKey,
    yourSecretAccessKey = require('./secrets').index().secretKey,
    bucketName = "jlembeck-photo-uploader-test",
    client = knox.createClient({
      key: yourAccessKeyId,
      secret: yourSecretAccessKey,
      bucket: bucketName
    });

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/test', function(req, res){
  res.render('index', { title: 'YO TEST' });
});

app.post('/photos', function(req, res){
  var body = req.body,
      guid = body.guid,
      caption = body.caption,
      timestamp = body.timestamp,
      image = body.image,
      width = body.width,
      height = body.height,
      orientation = body.orientation,
      buf = new Buffer(image,'base64'),
      request = client.put('/images/'+guid, {
             'Content-Length': buf.length,
             'Content-Type':'image/jpg'
      });

  request.on('response', function(response){
    if (response.statusCode === 200) {
      console.log('saved to %s', request.url);
      res.send({ url: request.url});
    } else {
      console.log('error %d', req.statusCode);
    }
  });

  request.end(buf);

});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
