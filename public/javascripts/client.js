angular.module("app", ['ngResource']).config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider.when("/bio", {
      controller:"BioController",
      templateUrl:"partials/bio.html"
    });
    $routeProvider.when("/start", {
      controller:"StartController",
      templateUrl:"partials/start.html"
    });
    $routeProvider.when("/admin", {
      controller:"AdminController",
      templateUrl:"partials/admin.html"
    });
    $routeProvider.otherwise({
      redirectTo:"/start"
    });
  }
]).

  controller("BioController", [
  "$scope", "movieService",
  function ($scope, movieService) {

    $scope.movies = movieService.listMovies();
  }
]).

  controller("StartController", [
  "$scope",
  function ($scope) {

  }
]).

  controller("AdminController", [
  "$scope", "movieService",
  function ($scope, movieService) {
    $scope.movies = movieService.listMovies();
    $scope.movie= $scope.movies[0];

    $scope.addMovie = function () {
      var movie = movieService.addMovie({});
      $scope.editMovie(movie);
    };

    $scope.editMovie = function(movie) {
      $scope.movie = movie;
    };

    $scope.saveMovie = function() {
      movieService.saveMovie($scope.movie);
    };

    $scope.deleteMovie = function() {
      movieService.deleteMovie($scope.movie);
      delete $scope.movie;
    };

    $scope.isEditing = function(movie) {
      return movie === $scope.movie;
    };
  }
]).

  factory("MovieResource", [
  "$resource",
  function($resource) {
    return $resource('/api/movies/:id', {
      id: "@_id"
    }, {
      save: {method: "PUT"},
      create: {method: "POST"}
    });
  }
]).

  service("movieService", [
  'MovieResource',
  function (MovieResource) {
    var self = this;

    /*var movies = [
      {
        name:"The Expendables 2",
        text:"Mr. Church reunites the Expendables for what should be an easy paycheck, but when one of their men is murdered on the " +
          "job, their quest for revenge puts them deep in enemy territory and up against an unexpected threat.",
        time:"I kväll",
        imgSrc:"images/expendables.jpg",
        imdb:"http://www.imdb.com/title/tt1764651/"
      },
      {
        name:"Moonrise Kingdom",
        text:"A pair of young lovers flee their New England town, which causes a local search party to fan out and find them.",
        time:"I kväll",
        imgSrc:"images/moonrise.jpg",
        imdb:"http://www.imdb.com/title/tt1764651/"
      }
    ];*/
    var movies = [];
    self.listMovies = function () {
      movies = MovieResource.query();
      return movies;
    };

    self.addMovie = function(data) {
      var movie = new MovieResource(data);
      movie.$create();
      movies.push(movie);
      return movie;
    };

    self.saveMovie = function(movie) {
      return movie.$save();
    };

    self.deleteMovie = function(movie) {
      movies.splice(movies.indexOf(movie), 1);
      return movie.$delete();
    }
  }
]);