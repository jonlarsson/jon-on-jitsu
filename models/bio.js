module.exports = function (mongoose) {
  var res = {};

  var movieSchema = new mongoose.Schema({
    name:String,
    text:String,
    time:String,
    imgSrc:String,
    imdb:String
  });

  var Movie = mongoose.model('Movie', movieSchema);

  var models = [Movie];

  res.api = {};
  models.forEach(function (Model) {
    res.api[Model.modelName.toLowerCase()] = {
      list:function (req, res) {
        Model.find(function (err, list) {
          if (err) {
            return res.send(500, {message:'Kunde inte lista'});
          } else {
            return res.send(list);
          }
        })
      },
      post:function (req, res) {
        var obj = new Model(req.body);
        return obj.save(function (err, obj) {
          if (err) {
            return res.send(500, {message:'Kunde inte spara'});
          } else {
            return res.send(obj);
          }
        })
      },
      put:function (req, res) {
        Model.findById(req.params.id, function (err, obj) {
          if (err) {
            return res.send(500, {message:'Kunde inte spara' })
          }
          Model.schema.eachPath(function (path) {
            if (Model.schema.pathType(path) === 'real') {
              obj[path] = req.body[path];
            }
          });
          return obj.save(function (err, obj) {
            if (err) {
              return res.send(500, {message:'Kunde inte spara'});
            } else {
              return res.send(obj);
            }
          });
        });
      },
      get:function (req, res) {
        return Model.findById(req.params.id, function (err, obj) {
          if (err) {
            return res.send(500, {message:'Kunde inte hämta'});
          } else {
            return res.send(obj);
          }
        });
      },
      delete:function (req, res) {
        return Model.findById(req.params.id, function (err, obj) {
          if (err) {
            return res.send(500, {message:'Kunde inte ta bort'});
          } else {
            obj.remove(function (err) {
              if (err) {
                res.send(500, {message:'Kunde inte ta bort'});
              } else {
                res.send(200);
              }
            })
          }
        });
      }
    }
  });
  return res;
};

