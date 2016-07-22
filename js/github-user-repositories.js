(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.githubUserRepositories = mod.exports;
  }
})(this, function (exports) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define([], factory);
    } else if (typeof exports !== "undefined") {
      factory();
    } else {
      var mod = {
        exports: {}
      };
      factory();
      global.githubUserRepositories = mod.exports;
    }
  })(this, function () {
    'use strict';

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    angular.module('github-user-repositories', []).directive('linkListing', function () {
      return {
        scope: {
          'repositories': '=repositories'
        },
        restrict: 'E',
        templateUrl: './template/link-listing.html'
      };
    }).factory('GithubUserRepositoriesFactory', ['$http', function ($http) {

      var checkLastPage = function checkLastPage() {
        var response = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


        if (!response) {
          return false;
        }

        var links = response.headers('Link');

        if (!links) {
          return false;
        }

        links = links.split('; rel="next", <https://api.github.com/user/');

        if (!links) {
          return false;
        }

        links = links[1];

        if (!links) {
          return false;
        }

        return parseInt(links.replace(/(\w*)\/repos\?page=(\d*).*/g, "$2"), 10);
      };

      var factory = {

        getAll: function getAll(userName, response) {

          var lastPage = checkLastPage(response),
              promises = [],
              params = response.config.params;

          if (lastPage) {

            for (var page = response.config.params.page; page <= lastPage; page++) {
              params.page = page;
              promises.push(factory.get(userName, params));
            }
          }

          return promises;
        },

        get: function get(userName) {
          var params = arguments.length <= 1 || arguments[1] === undefined ? {
            page: 1,
            per_page: 50
          } : arguments[1];
          return $http({
            url: 'https://api.github.com/users/' + userName + '/repos',
            method: 'GET',
            params: params
          }).then(function (response) {
            if (!response.data) {
              return Promise.reject(new Error(vm.str.noResponse));
            }

            return Promise.resolve(response);
          }).catch(function (error) {
            return Promise.reject(error);
          });
        }
      };

      return factory;
    }]).controller('GithubUserRepositoriesController', ['$scope', '$log', 'GithubUserRepositoriesFactory', function ($scope, $log, githubUserRepositories) {
      var _this = this;

      var isUsernameValid = function isUsernameValid() {

        if (typeof _this.userName !== 'string') {
          return false;
        }

        return _this.userName.length >= 1;
      },
          resetRepositories = function resetRepositories() {
        _this.repositories = [];
        _this.error = false;
      },
          failedToUpdateRepositories = function failedToUpdateRepositories(error) {
        $log.debug('failedToUpdateRepositories', error);
        return _this.error = (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && error.status === 404 ? _this.str.noUser : _this.str.noResponse;
      },
          updateRepositories = function updateRepositories(response) {

        $log.debug('updateRepositories', response);

        if (!response.data) {
          failedToUpdateRepositories(response);
          return false;
        }

        if (response.data.length === 0) {
          _this.error = _this.str.noRepos;
          return false;
        }

        return _this.repositories = _this.repositories.concat(response.data.map(function (repository) {
          return {
            name: repository.name,
            link: repository['html_url']
          };
        }));
      },
          onUserNameChange = function onUserNameChange(newVal, oldVal) {
        return newVal !== oldVal ? _this.getRepositories().then(function (repositories) {
          return $log.debug('getRepositories', repositories);
        }).catch(failedToUpdateRepositories) : false;
      };

      Object.assign(this, {

        str: {
          title: 'Github User Repositories',
          userName: 'Username',
          usernamePlaceholder: 'Please write a Github username to search',
          invalidUserName: 'Username is not valid',
          noUser: 'The Github user does not exist',
          noRepos: 'Github user has no repos',
          noResponse: 'Github API does not respond'
        },

        error: false,

        userName: '',

        repositories: [],

        stripUserName: function stripUserName(event) {

          if (_typeof(event.target) !== 'object') {
            return false;
          }

          if (typeof event.target.value !== 'string') {
            return false;
          }

          if (event.target.value.indexOf(' ') >= 0) {
            this.userName = event.target.value.replace(/\s+/g, '');
          }
        },

        userNameModelOptions: {
          debounce: {
            default: 250,
            blur: 0
          }
        },

        getRepositories: function getRepositories() {
          return new Promise(function (resolve, reject) {

            resetRepositories();

            if (!isUsernameValid(_this.userName)) {
              reject(_this.str.invalidUserName);
            }

            githubUserRepositories.get(_this.userName).then(function (response) {

              if (!response || !updateRepositories(response)) {
                failedToUpdateRepositories(response);
                return Promise.reject(response);
              }

              return Promise.all(githubUserRepositories.getAll(_this.userName, response).map(function (promise) {
                return promise.then(updateRepositories).catch(failedToUpdateRepositories);
              }));
            }).catch(failedToUpdateRepositories).then(resolve);
          });
        }

      });

      $scope.$watch(function () {
        return _this.userName;
      }, onUserNameChange);
    }]);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdpdGh1Yi11c2VyLXJlcG9zaXRvcmllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsWUFBUSxNQUFSLENBQWUsMEJBQWYsRUFBMkMsRUFBM0MsRUFDRyxTQURILENBQ2EsYUFEYixFQUM0QixZQUFXO0FBQ25DLGFBQU87QUFDTCxlQUFRO0FBQ04sMEJBQWlCO0FBRFgsU0FESDtBQUlMLGtCQUFVLEdBSkw7QUFLTCxxQkFBYTtBQUxSLE9BQVA7QUFPRCxLQVRILEVBVUcsT0FWSCxDQVVXLCtCQVZYLEVBVTRDLENBQUMsT0FBRCxFQUFVLFVBQUMsS0FBRCxFQUFXOztBQUU3RCxVQUVFLGdCQUFnQixTQUFoQixhQUFnQixHQUFzQjtBQUFBLFlBQXJCLFFBQXFCLHlEQUFWLEtBQVU7OztBQUVwQyxZQUFJLENBQUMsUUFBTCxFQUFlO0FBQ2IsaUJBQU8sS0FBUDtBQUNEOztBQUVELFlBQUksUUFBUSxTQUFTLE9BQVQsQ0FBaUIsTUFBakIsQ0FBWjs7QUFFQSxZQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsaUJBQU8sS0FBUDtBQUNEOztBQUVELGdCQUFRLE1BQU0sS0FBTixDQUFZLDZDQUFaLENBQVI7O0FBRUEsWUFBSSxDQUFDLEtBQUwsRUFBWTtBQUNWLGlCQUFPLEtBQVA7QUFDRDs7QUFFRCxnQkFBUSxNQUFNLENBQU4sQ0FBUjs7QUFFQSxZQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsaUJBQU8sS0FBUDtBQUNEOztBQUVELGVBQU8sU0FBUyxNQUFNLE9BQU4sQ0FBYyw2QkFBZCxFQUE2QyxJQUE3QyxDQUFULEVBQTZELEVBQTdELENBQVA7QUFFRCxPQTVCSDs7QUE4QkEsVUFBTSxVQUFVOztBQUVkLGdCQUFTLGdCQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXdCOztBQUUvQixjQUNFLFdBQVcsY0FBYyxRQUFkLENBRGI7Y0FFRSxXQUFXLEVBRmI7Y0FHRSxTQUFTLFNBQVMsTUFBVCxDQUFnQixNQUgzQjs7QUFLQSxjQUFJLFFBQUosRUFBYzs7QUFFWixpQkFBSyxJQUFJLE9BQU8sU0FBUyxNQUFULENBQWdCLE1BQWhCLENBQXVCLElBQXZDLEVBQTZDLFFBQVEsUUFBckQsRUFBK0QsTUFBL0QsRUFBdUU7QUFDckUscUJBQU8sSUFBUCxHQUFjLElBQWQ7QUFDQSx1QkFBUyxJQUFULENBQWMsUUFBUSxHQUFSLENBQVksUUFBWixFQUFzQixNQUF0QixDQUFkO0FBQ0Q7QUFFRjs7QUFFRCxpQkFBTyxRQUFQO0FBRUQsU0FwQmE7O0FBc0JkLGFBQU0sYUFBQyxRQUFEO0FBQUEsY0FBVyxNQUFYLHlEQUFvQjtBQUN4QixrQkFBVyxDQURhO0FBRXhCLHNCQUFXO0FBRmEsV0FBcEI7QUFBQSxpQkFHQSxNQUFNO0FBQ1YsbURBQXNDLFFBQXRDLFdBRFU7QUFFVixvQkFBUyxLQUZDO0FBR1Y7QUFIVSxXQUFOLEVBS0gsSUFMRyxDQUtFLFVBQUMsUUFBRCxFQUFjO0FBQ2xCLGdCQUFJLENBQUMsU0FBUyxJQUFkLEVBQW9CO0FBQ2xCLHFCQUFPLFFBQVEsTUFBUixDQUFlLElBQUksS0FBSixDQUFVLEdBQUcsR0FBSCxDQUFPLFVBQWpCLENBQWYsQ0FBUDtBQUNEOztBQUVELG1CQUFPLFFBQVEsT0FBUixDQUFnQixRQUFoQixDQUFQO0FBQ0QsV0FYRyxFQVlILEtBWkcsQ0FZRyxVQUFDLEtBQUQ7QUFBQSxtQkFBVyxRQUFRLE1BQVIsQ0FBZSxLQUFmLENBQVg7QUFBQSxXQVpILENBSEE7QUFBQTtBQXRCUSxPQUFoQjs7QUF5Q0EsYUFBTyxPQUFQO0FBRUQsS0EzRXlDLENBVjVDLEVBc0ZHLFVBdEZILENBc0ZjLGtDQXRGZCxFQXNGa0QsQ0FDOUMsUUFEOEMsRUFFOUMsTUFGOEMsRUFHOUMsK0JBSDhDLEVBSTlDLFVBQVMsTUFBVCxFQUFpQixJQUFqQixFQUF1QixzQkFBdkIsRUFBK0M7QUFBQTs7QUFFN0MsVUFFRSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBTTs7QUFFdEIsWUFBSSxPQUFPLE1BQUssUUFBWixLQUF5QixRQUE3QixFQUF1QztBQUNyQyxpQkFBTyxLQUFQO0FBQ0Q7O0FBRUQsZUFBTyxNQUFLLFFBQUwsQ0FBYyxNQUFkLElBQXdCLENBQS9CO0FBQ0QsT0FUSDtVQVdFLG9CQUFvQixTQUFwQixpQkFBb0IsR0FBTTtBQUN4QixjQUFLLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxjQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0QsT0FkSDtVQWdCRSw2QkFBNkIsU0FBN0IsMEJBQTZCLENBQUMsS0FBRCxFQUFXO0FBQ3RDLGFBQUssS0FBTCxDQUFXLDRCQUFYLEVBQXlDLEtBQXpDO0FBQ0EsZUFBTyxNQUFLLEtBQUwsR0FBYSxRQUFPLEtBQVAseUNBQU8sS0FBUCxPQUFpQixRQUFqQixJQUE2QixNQUFNLE1BQU4sS0FBaUIsR0FBOUMsR0FDbEIsTUFBSyxHQUFMLENBQVMsTUFEUyxHQUNBLE1BQUssR0FBTCxDQUFTLFVBRDdCO0FBRUQsT0FwQkg7VUF1QkUscUJBQXFCLFNBQXJCLGtCQUFxQixDQUFDLFFBQUQsRUFBYzs7QUFFakMsYUFBSyxLQUFMLENBQVcsb0JBQVgsRUFBaUMsUUFBakM7O0FBRUEsWUFBSSxDQUFDLFNBQVMsSUFBZCxFQUFvQjtBQUNsQixxQ0FBMkIsUUFBM0I7QUFDQSxpQkFBTyxLQUFQO0FBQ0Q7O0FBRUQsWUFBSSxTQUFTLElBQVQsQ0FBYyxNQUFkLEtBQXlCLENBQTdCLEVBQWdDO0FBQzlCLGdCQUFLLEtBQUwsR0FBYSxNQUFLLEdBQUwsQ0FBUyxPQUF0QjtBQUNBLGlCQUFPLEtBQVA7QUFDRDs7QUFFRCxlQUFPLE1BQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FDeEIsTUFEd0IsQ0FDakIsU0FBUyxJQUFULENBQWMsR0FBZCxDQUFrQixVQUFDLFVBQUQsRUFBZ0I7QUFDeEMsaUJBQVE7QUFDTixrQkFBTyxXQUFXLElBRFo7QUFFTixrQkFBTyxXQUFXLFVBQVg7QUFGRCxXQUFSO0FBSUQsU0FMTyxDQURpQixDQUEzQjtBQU9ELE9BNUNIO1VBOENFLG1CQUFtQixTQUFuQixnQkFBbUIsQ0FBQyxNQUFELEVBQVMsTUFBVDtBQUFBLGVBQXFCLFdBQVcsTUFBWixHQUNyQyxNQUFLLGVBQUwsR0FDRyxJQURILENBQ1EsVUFBQyxZQUFEO0FBQUEsaUJBQWtCLEtBQUssS0FBTCxDQUFXLGlCQUFYLEVBQThCLFlBQTlCLENBQWxCO0FBQUEsU0FEUixFQUVHLEtBRkgsQ0FFUywwQkFGVCxDQURxQyxHQUdFLEtBSHRCO0FBQUEsT0E5Q3JCOztBQW1EQSxhQUFPLE1BQVAsQ0FBYyxJQUFkLEVBQW9COztBQUVsQixhQUFNO0FBQ0osaUJBQVEsMEJBREo7QUFFSixvQkFBVyxVQUZQO0FBR0osK0JBQXNCLDBDQUhsQjtBQUlKLDJCQUFrQix1QkFKZDtBQUtKLGtCQUFTLGdDQUxMO0FBTUosbUJBQVUsMEJBTk47QUFPSixzQkFBYTtBQVBULFNBRlk7O0FBWWxCLGVBQVEsS0FaVTs7QUFjbEIsa0JBQVcsRUFkTzs7QUFnQmxCLHNCQUFlLEVBaEJHOztBQWtCbEIsdUJBQWdCLHVCQUFVLEtBQVYsRUFBaUI7O0FBRS9CLGNBQUksUUFBTyxNQUFNLE1BQWIsTUFBd0IsUUFBNUIsRUFBc0M7QUFDcEMsbUJBQU8sS0FBUDtBQUNEOztBQUVELGNBQUksT0FBTyxNQUFNLE1BQU4sQ0FBYSxLQUFwQixLQUE4QixRQUFsQyxFQUE0QztBQUMxQyxtQkFBTyxLQUFQO0FBQ0Q7O0FBRUQsY0FBSSxNQUFNLE1BQU4sQ0FBYSxLQUFiLENBQW1CLE9BQW5CLENBQTJCLEdBQTNCLEtBQW1DLENBQXZDLEVBQTBDO0FBQ3hDLGlCQUFLLFFBQUwsR0FBZ0IsTUFBTSxNQUFOLENBQWEsS0FBYixDQUFtQixPQUFuQixDQUEyQixNQUEzQixFQUFtQyxFQUFuQyxDQUFoQjtBQUNEO0FBQ0YsU0EvQmlCOztBQWlDbEIsOEJBQXVCO0FBQ3JCLG9CQUFVO0FBQ1IscUJBQVUsR0FERjtBQUVSLGtCQUFPO0FBRkM7QUFEVyxTQWpDTDs7QUF3Q2xCLHlCQUFrQjtBQUFBLGlCQUFNLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7O0FBRXZEOztBQUVBLGdCQUFJLENBQUMsZ0JBQWdCLE1BQUssUUFBckIsQ0FBTCxFQUFxQztBQUNuQyxxQkFBTyxNQUFLLEdBQUwsQ0FBUyxlQUFoQjtBQUNEOztBQUVELG1DQUNHLEdBREgsQ0FDTyxNQUFLLFFBRFosRUFFRyxJQUZILENBRVEsVUFBQyxRQUFELEVBQWM7O0FBRWxCLGtCQUFJLENBQUMsUUFBRCxJQUFhLENBQUMsbUJBQW1CLFFBQW5CLENBQWxCLEVBQWdEO0FBQzlDLDJDQUEyQixRQUEzQjtBQUNBLHVCQUFPLFFBQVEsTUFBUixDQUFlLFFBQWYsQ0FBUDtBQUNEOztBQUVELHFCQUFPLFFBQVEsR0FBUixDQUFZLHVCQUNoQixNQURnQixDQUNULE1BQUssUUFESSxFQUNNLFFBRE4sRUFFaEIsR0FGZ0IsQ0FFWixVQUFDLE9BQUQ7QUFBQSx1QkFBYSxRQUNmLElBRGUsQ0FDVixrQkFEVSxFQUVmLEtBRmUsQ0FFVCwwQkFGUyxDQUFiO0FBQUEsZUFGWSxDQUFaLENBQVA7QUFNRCxhQWZILEVBZ0JHLEtBaEJILENBZ0JTLDBCQWhCVCxFQWlCRyxJQWpCSCxDQWlCUSxPQWpCUjtBQW1CRCxXQTNCdUIsQ0FBTjtBQUFBOztBQXhDQSxPQUFwQjs7QUF3RUEsYUFBTyxNQUFQLENBQWM7QUFBQSxlQUFNLE1BQUssUUFBWDtBQUFBLE9BQWQsRUFBbUMsZ0JBQW5DO0FBRUQsS0FuSTZDLENBdEZsRCIsImZpbGUiOiJnaXRodWItdXNlci1yZXBvc2l0b3JpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnZ2l0aHViLXVzZXItcmVwb3NpdG9yaWVzJywgW10pXG4gIC5kaXJlY3RpdmUoJ2xpbmtMaXN0aW5nJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjb3BlIDoge1xuICAgICAgICAncmVwb3NpdG9yaWVzJyA6ICc9cmVwb3NpdG9yaWVzJ1xuICAgICAgfSxcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZW1wbGF0ZVVybDogJy4vdGVtcGxhdGUvbGluay1saXN0aW5nLmh0bWwnXG4gICAgfTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0dpdGh1YlVzZXJSZXBvc2l0b3JpZXNGYWN0b3J5JywgWyckaHR0cCcsICgkaHR0cCkgPT4ge1xuXG4gICAgY29uc3RcblxuICAgICAgY2hlY2tMYXN0UGFnZSA9IChyZXNwb25zZSA9IGZhbHNlKSA9PiB7XG5cbiAgICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsaW5rcyA9IHJlc3BvbnNlLmhlYWRlcnMoJ0xpbmsnKTtcblxuICAgICAgICBpZiAoIWxpbmtzKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlua3MgPSBsaW5rcy5zcGxpdCgnOyByZWw9XCJuZXh0XCIsIDxodHRwczovL2FwaS5naXRodWIuY29tL3VzZXIvJyk7XG5cbiAgICAgICAgaWYgKCFsaW5rcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmtzID0gbGlua3NbMV07XG5cbiAgICAgICAgaWYgKCFsaW5rcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZUludChsaW5rcy5yZXBsYWNlKC8oXFx3KilcXC9yZXBvc1xcP3BhZ2U9KFxcZCopLiovZywgXCIkMlwiKSwgMTApO1xuXG4gICAgICB9O1xuXG4gICAgY29uc3QgZmFjdG9yeSA9IHtcblxuICAgICAgZ2V0QWxsIDogKHVzZXJOYW1lLCByZXNwb25zZSkgPT4ge1xuXG4gICAgICAgIGxldFxuICAgICAgICAgIGxhc3RQYWdlID0gY2hlY2tMYXN0UGFnZShyZXNwb25zZSksXG4gICAgICAgICAgcHJvbWlzZXMgPSBbXSxcbiAgICAgICAgICBwYXJhbXMgPSByZXNwb25zZS5jb25maWcucGFyYW1zO1xuXG4gICAgICAgIGlmIChsYXN0UGFnZSkge1xuXG4gICAgICAgICAgZm9yIChsZXQgcGFnZSA9IHJlc3BvbnNlLmNvbmZpZy5wYXJhbXMucGFnZTsgcGFnZSA8PSBsYXN0UGFnZTsgcGFnZSsrKSB7XG4gICAgICAgICAgICBwYXJhbXMucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKGZhY3RvcnkuZ2V0KHVzZXJOYW1lLCBwYXJhbXMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm9taXNlcztcblxuICAgICAgfSxcblxuICAgICAgZ2V0IDogKHVzZXJOYW1lLCBwYXJhbXMgPSB7XG4gICAgICAgIHBhZ2UgOiAgICAgMSxcbiAgICAgICAgcGVyX3BhZ2UgOiA1MFxuICAgICAgfSkgPT4gJGh0dHAoe1xuICAgICAgICB1cmwgOiBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy8ke3VzZXJOYW1lfS9yZXBvc2AsXG4gICAgICAgIG1ldGhvZCA6ICdHRVQnLFxuICAgICAgICBwYXJhbXNcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmICghcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcih2bS5zdHIubm9SZXNwb25zZSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiBQcm9taXNlLnJlamVjdChlcnJvcikpXG4gICAgfTtcblxuXG4gICAgcmV0dXJuIGZhY3Rvcnk7XG5cbiAgfV0pXG4gIC5jb250cm9sbGVyKCdHaXRodWJVc2VyUmVwb3NpdG9yaWVzQ29udHJvbGxlcicsIFtcbiAgICAnJHNjb3BlJyxcbiAgICAnJGxvZycsXG4gICAgJ0dpdGh1YlVzZXJSZXBvc2l0b3JpZXNGYWN0b3J5JyxcbiAgICBmdW5jdGlvbigkc2NvcGUsICRsb2csIGdpdGh1YlVzZXJSZXBvc2l0b3JpZXMpIHtcblxuICAgICAgY29uc3RcblxuICAgICAgICBpc1VzZXJuYW1lVmFsaWQgPSAoKSA9PiB7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMudXNlck5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXMudXNlck5hbWUubGVuZ3RoID49IDE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRSZXBvc2l0b3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5yZXBvc2l0b3JpZXMgPSBbXTtcbiAgICAgICAgICB0aGlzLmVycm9yID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmFpbGVkVG9VcGRhdGVSZXBvc2l0b3JpZXMgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAkbG9nLmRlYnVnKCdmYWlsZWRUb1VwZGF0ZVJlcG9zaXRvcmllcycsIGVycm9yKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5lcnJvciA9IHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3Iuc3RhdHVzID09PSA0MDQgP1xuICAgICAgICAgICAgdGhpcy5zdHIubm9Vc2VyIDogdGhpcy5zdHIubm9SZXNwb25zZTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIHVwZGF0ZVJlcG9zaXRvcmllcyA9IChyZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgJGxvZy5kZWJ1ZygndXBkYXRlUmVwb3NpdG9yaWVzJywgcmVzcG9uc2UpO1xuXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICBmYWlsZWRUb1VwZGF0ZVJlcG9zaXRvcmllcyhyZXNwb25zZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yID0gdGhpcy5zdHIubm9SZXBvcztcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdGhpcy5yZXBvc2l0b3JpZXMgPSB0aGlzLnJlcG9zaXRvcmllc1xuICAgICAgICAgICAgLmNvbmNhdChyZXNwb25zZS5kYXRhLm1hcCgocmVwb3NpdG9yeSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gKHtcbiAgICAgICAgICAgICAgICBuYW1lIDogcmVwb3NpdG9yeS5uYW1lLFxuICAgICAgICAgICAgICAgIGxpbmsgOiByZXBvc2l0b3J5WydodG1sX3VybCddXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uVXNlck5hbWVDaGFuZ2UgPSAobmV3VmFsLCBvbGRWYWwpID0+IChuZXdWYWwgIT09IG9sZFZhbCkgP1xuICAgICAgICAgIHRoaXMuZ2V0UmVwb3NpdG9yaWVzKClcbiAgICAgICAgICAgIC50aGVuKChyZXBvc2l0b3JpZXMpID0+ICRsb2cuZGVidWcoJ2dldFJlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcykpXG4gICAgICAgICAgICAuY2F0Y2goZmFpbGVkVG9VcGRhdGVSZXBvc2l0b3JpZXMpIDogZmFsc2U7XG5cbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuXG4gICAgICAgIHN0ciA6IHtcbiAgICAgICAgICB0aXRsZSA6ICdHaXRodWIgVXNlciBSZXBvc2l0b3JpZXMnLFxuICAgICAgICAgIHVzZXJOYW1lIDogJ1VzZXJuYW1lJyxcbiAgICAgICAgICB1c2VybmFtZVBsYWNlaG9sZGVyIDogJ1BsZWFzZSB3cml0ZSBhIEdpdGh1YiB1c2VybmFtZSB0byBzZWFyY2gnLFxuICAgICAgICAgIGludmFsaWRVc2VyTmFtZSA6ICdVc2VybmFtZSBpcyBub3QgdmFsaWQnLFxuICAgICAgICAgIG5vVXNlciA6ICdUaGUgR2l0aHViIHVzZXIgZG9lcyBub3QgZXhpc3QnLFxuICAgICAgICAgIG5vUmVwb3MgOiAnR2l0aHViIHVzZXIgaGFzIG5vIHJlcG9zJyxcbiAgICAgICAgICBub1Jlc3BvbnNlIDogJ0dpdGh1YiBBUEkgZG9lcyBub3QgcmVzcG9uZCdcbiAgICAgICAgfSxcblxuICAgICAgICBlcnJvciA6IGZhbHNlLFxuXG4gICAgICAgIHVzZXJOYW1lIDogJycsXG5cbiAgICAgICAgcmVwb3NpdG9yaWVzIDogW10sXG5cbiAgICAgICAgc3RyaXBVc2VyTmFtZSA6IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBldmVudC50YXJnZXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBldmVudC50YXJnZXQudmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC52YWx1ZS5pbmRleE9mKCcgJykgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy51c2VyTmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXNlck5hbWVNb2RlbE9wdGlvbnMgOiB7XG4gICAgICAgICAgZGVib3VuY2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQgOiAyNTAsXG4gICAgICAgICAgICBibHVyIDogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRSZXBvc2l0b3JpZXMgOiAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICByZXNldFJlcG9zaXRvcmllcygpO1xuXG4gICAgICAgICAgaWYgKCFpc1VzZXJuYW1lVmFsaWQodGhpcy51c2VyTmFtZSkpIHtcbiAgICAgICAgICAgIHJlamVjdCh0aGlzLnN0ci5pbnZhbGlkVXNlck5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGdpdGh1YlVzZXJSZXBvc2l0b3JpZXNcbiAgICAgICAgICAgIC5nZXQodGhpcy51c2VyTmFtZSlcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICAgIGlmICghcmVzcG9uc2UgfHwgIXVwZGF0ZVJlcG9zaXRvcmllcyhyZXNwb25zZSkpIHtcbiAgICAgICAgICAgICAgICBmYWlsZWRUb1VwZGF0ZVJlcG9zaXRvcmllcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChnaXRodWJVc2VyUmVwb3NpdG9yaWVzXG4gICAgICAgICAgICAgICAgLmdldEFsbCh0aGlzLnVzZXJOYW1lLCByZXNwb25zZSlcbiAgICAgICAgICAgICAgICAubWFwKChwcm9taXNlKSA9PiBwcm9taXNlXG4gICAgICAgICAgICAgICAgICAudGhlbih1cGRhdGVSZXBvc2l0b3JpZXMpXG4gICAgICAgICAgICAgICAgICAuY2F0Y2goZmFpbGVkVG9VcGRhdGVSZXBvc2l0b3JpZXMpKSk7XG5cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZmFpbGVkVG9VcGRhdGVSZXBvc2l0b3JpZXMpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlKTtcblxuICAgICAgICB9KVxuXG5cbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuJHdhdGNoKCgpID0+IHRoaXMudXNlck5hbWUsIG9uVXNlck5hbWVDaGFuZ2UpO1xuXG4gICAgfVxuICBdKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
