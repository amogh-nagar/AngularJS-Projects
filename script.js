/// [reference path="angular.min.js" /]
/// [reference path="angular-route.min.js" /]
var app = angular
  .module("Demo", ["ui.router", "ngAnimate", "ngSanitize", "ui.bootstrap"])
  .config(function (
    $stateProvider,
    $urlRouterProvider,
    $urlMatcherFactoryProvider,
    $locationProvider
  ) {
    $urlMatcherFactoryProvider.caseInsensitive(true);
    $stateProvider
      .state("home", {
        url: "/home",
        templateUrl: "Templates/Home.html",
        controller: "homeController",
        resolve: {
          check: function (isSignIn) {
            return isSignIn.checkAuthentication();
          },
        },
      })
      .state("login", {
        url: "/login",
        templateUrl: "Templates/Login.html",
        controller: "loginController",
      })
      .state("signup", {
        url: "/signup",
        templateUrl: "Templates/Signup.html",
        controller: "signupController",
      })
      .state("goals", {
        url: "/goals",
        templateUrl: "Templates/Goals.html",
        controller: "goalsController",
        resolve: {
          check: function (isSignIn) {
            return isSignIn.checkAuthentication();
          },
        },
      });
    $locationProvider.html5Mode(true);
  })
  .controller(
    "IndexController",
    function ($scope, $rootScope, $location, $log) {
      $rootScope.error = null;
      $rootScope.showcnt = false;

      $scope.logout = function () {
        var token = JSON.parse(localStorage.getItem("token"));
        if (!token) {
          token = [];
        }
        token = token.filter(function (i) {
          return (
            i.name != $rootScope.user.name &&
            i.email != $rootScope.user.email &&
            i.password != $rootScope.user.password
          );
        });
        $log.info(token);
        $log.info("root", $rootScope);
        localStorage.setItem("token", JSON.stringify(token));
        $rootScope.signin = false;
        $location.path("/login");
      };
    }
  )
  .controller("homeController", function ($scope, $http, $log, $rootScope) {
    $rootScope.error = null;
    $rootScope.showcnt = false;
    $scope.search = function () {
      $http
        .get(
          "http://api.weatherapi.com/v1/current.json?key=3d743729feab467eb9f40414221810&q=" +
            $scope.cityName +
            "&aqi=no"
        )
        .then(function (response) {
          $log.info(response);
          $rootScope.showcnt = true;
          $scope.cityDetails = response.data;
        });
    };
  })
  .controller(
    "signupController",
    function ($scope, $log, $location, $rootScope) {
      $rootScope.max = 10;
      var validprop = [];
      var type;
      var value = 0;
      $rootScope.updateProgress = function (name) {
        if (validprop.indexOf(name) != -1) return;
        value++;
        validprop.push(name);
        if (value < 25) {
          type = "success";
        } else if (value < 50) {
          type = "info";
        } else if (value < 75) {
          type = "warning";
        } else {
          type = "danger";
        }

        $rootScope.showWarning = type === "danger" || type === "warning";

        $rootScope.dynamic = value;
        $rootScope.type = type;
      };

      $scope.countryList = [
        { CountryId: 1, Name: "India" },
        { CountryId: 2, Name: "USA" },
      ];
      $scope.cityList = [];
      $scope.$watch("user.country", function (newVal, oldVal) {
        if (newVal == 1) {
          $scope.cityList = [
            { CountryId: 1, CityId: 1, Name: "Noida" },
            { CountryId: 1, CityId: 2, Name: "Delhi" },
          ];
        } else if (newVal == 2) {
          $scope.cityList = [
            { CountryId: 2, CityId: 3, Name: "Texas" },
            { CountryId: 2, CityId: 4, Name: "NewYork" },
          ];
        } else $scope.cityList = [];
      });
      $scope.today = function () {
        $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dt = null;
      };

      $scope.options = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true,
      };

      // Disable weekend selection
      function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === "day" && (date.getDay() === 0 || date.getDay() === 6);
      }

      $scope.toggleMin = function () {
        $scope.options.minDate = $scope.options.minDate ? null : new Date();
      };

      $scope.toggleMin();

      $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
      };

      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var afterTomorrow = new Date(tomorrow);
      afterTomorrow.setDate(tomorrow.getDate() + 1);
      $scope.events = [
        {
          date: tomorrow,
          status: "full",
        },
        {
          date: afterTomorrow,
          status: "partially",
        },
      ];

      function getDayClass(data) {
        var date = data.date,
          mode = data.mode;
        if (mode === "day") {
          var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(
              0,
              0,
              0,
              0
            );

            if (dayToCheck === currentDay) {
              return $scope.events[i].status;
            }
          }
        }

        return "";
      }
      $rootScope.error = null;
      $rootScope.showcnt = false;

      $scope.signup = function ($event) {
        $event.preventDefault();
        var token = JSON.parse(localStorage.getItem("token"));
        if (!token || token.length === 0) {
          token = [];
        }
        if (
          !$scope.userForm.username.$viewValue ||
          !$scope.userForm.email.$viewValue ||
          !$scope.userForm.password.$viewValue
        )
          return;
        token.push({
          username: $scope.userForm.username.$viewValue,
          email: $scope.userForm.email.$viewValue,
          password: $scope.userForm.password.$viewValue,
        });
        $log.info($scope);
        localStorage.setItem("token", JSON.stringify(token));
        $location.path("/login");
      };
    }
  )
  .controller(
    "loginController",
    function ($rootScope, $scope, $log, $location) {
      
      $rootScope.showcnt = false;

      $scope.loginf = function ($event) {
        $event.preventDefault();
        $log.info($scope);
        var token = JSON.parse(localStorage.getItem("token"));
        if (!token) {
          $rootScope.error =
            "Invalid Credentials, Please try again Login or Signup";
          return;
        }
        if (
          !$scope.userForm.username.$viewValue ||
          !$scope.userForm.password.$viewValue
        )
          return;
        var user = token.find(function (user) {
          return (
            user.username == $scope.userForm.username.$viewValue &&
            user.password == $scope.userForm.password.$viewValue
          );
        });
        if (!user) {
          $rootScope.error =
            "Invalid Credentials, Please try again Login or Signup";
        } else {
          $rootScope.user = user;
          $rootScope.error = null;
          $rootScope.signin = true;
          $location.path("/home");
        }
      };
    }
  )
  .controller("goalsController", function ($scope, $rootScope) {
    $scope.goals = [];
    $rootScope.showcnt = false;

    $scope.submitform = function () {
      $scope.goals.push({ text: $scope.goalinput, id: Math.random() * 10 });
    };

    $rootScope.error = null;
    $scope.deleteHandler = function (id) {
      $scope.goals = $scope.goals.filter(function (goal) {
        return goal.id !== id;
      });
    };
  });

app.factory("isSignIn", function ($q, $location, $rootScope, $log) {
  return {
    checkAuthentication: function () {
      var deffered = $q.defer();
      $log.info("Called");
      if (!$rootScope.signin) {
        $location.path("/login");
        deffered.reject();
      } else {
        deffered.resolve();
      }
      return deffered.promise;
    },
  };
});
