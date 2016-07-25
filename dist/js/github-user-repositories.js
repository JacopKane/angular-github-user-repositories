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

    angular.module('github-user-repositories', []).directive('linkListing', function () {
      return {
        scope: {
          'linkList': '=links'
        },
        restrict: 'E',
        replace: true,
        templateUrl: './template/link-listing.html'
      };
    }).factory('githubUserRepositoriesFactory', ["$injector", function ($injector) {

      var $log = $injector.get('$log'),
          $http = $injector.get('$http'),
          checkLastPage = function checkLastPage() {
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

        return parseInt(links.replace(/(\w*)\/repos\?page=(\d*).*/g, '$2'), 10);
      };

      var factory = {

        getAll: function getAll(userName, response) {

          var lastPage = checkLastPage(response) || 0,
              requests = [],
              params = response.config.params;

          if (!lastPage) {
            return requests;
          }

          for (var page = params.page + 1; page <= lastPage; page++) {
            var request = factory.get(userName, {
              per_page: params.per_page,
              page: page
            });
            requests.push(request);
          }

          return requests;
        },

        get: function get(userName) {
          var params = arguments.length <= 1 || arguments[1] === undefined ? {
            page: 1,
            per_page: 50
          } : arguments[1];
          return new Promise(function (resolve, reject) {

            $log.debug('get', 'Username : ' + userName, 'Page : ' + params.page, 'Per Page : ' + params.per_page, params);

            return $http({
              method: 'GET',
              url: 'https://api.github.com/users/' + userName + '/repos',
              params: params
            }).then(function (response) {

              if (!response.status) {
                return reject(response);
              }

              if (response.status !== 200) {
                return reject(response);
              }

              return resolve(response);
            }, function (error) {
              return reject(error);
            });
          });
        }

      };

      return factory;
    }]).controller('GithubUserRepositoriesController', ["$scope", "$injector", function ($scope, $injector) {

      var vm = this,
          $log = $injector.get('$log'),
          githubUserRepositories = $injector.get('githubUserRepositoriesFactory'),
          isUsernameValid = function isUsernameValid() {

        if (!angular.isString(vm.userName)) {
          return false;
        }

        return vm.userName.length >= 1;
      },
          resetRepositories = function resetRepositories() {
        $log.debug('resetting repositories');
        vm.repositories = [];
        vm.error = '';
      },
          checkResponse = function checkResponse(response) {

        if (angular.isObject(response) === false) {
          vm.error = vm.str.noResponse;
          $log.error('checkResponse', vm.str.noResponse, response);
          return false;
        }

        if (response.status === 200) {

          if (response.data.length === 0) {
            vm.error = vm.str.noRepos;
            $log.debug('checkResponse', vm.str.noRepos, response);
          }

          $log.debug('checkResponse', 200, response);
          return true;
        }

        if (response.status === 404) {
          vm.error = vm.str.noUser;
          $log.debug('checkResponse', vm.str.noUser, response);
          return false;
        }

        $log.debug('checkResponse', vm.str.noResponse, response);
        vm.error = vm.str.noResponse;
        return false;
      },
          formatRepositories = function formatRepositories(repositories) {
        return repositories.map(function (repository) {
          return {
            id: repository.id,
            name: repository.name,
            link: repository.html_url
          };
        });
      },
          updateRepositories = function updateRepositories(response) {
        $log.debug('updateRepositories' + response.config.params.page, response);

        vm.repositories = vm.repositories.concat(formatRepositories(response.data));

        $scope.$digest();

        return vm.repositories;
      },
          onUserNameChange = function onUserNameChange(newVal, oldVal) {
        if (newVal === oldVal) {
          return false;
        }

        return vm.getRepositories().then(function (repositories) {
          return $log.debug('onUserNameChange.getRepositories', repositories);
        }).catch(function (repositories) {
          return $log.error('onUserNameChange.failedToGetRepositories', repositories);
        });
      };

      Object.assign(vm, {

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

          if (!angular.isObject(event.target)) {
            return false;
          }

          if (!angular.isString(event.target.value)) {
            return false;
          }

          if (event.target.value.indexOf(' ') >= 0) {
            vm.userName = event.target.value.replace(/\s+/g, '');
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

            if (isUsernameValid(vm.userName) === false) {
              return resolve(vm.repositories);
            }

            githubUserRepositories.get(vm.userName).then(function (response) {

              if (checkResponse(response) === false) {
                return reject(response);
              }

              if (updateRepositories(response) === false) {
                return reject(response);
              }

              var subPages = githubUserRepositories.getAll(vm.userName, response);

              if (!subPages.length) {
                return resolve(vm.repositories);
              }

              var subRequests = subPages.map(function (request) {
                request.then(function (response) {
                  $log.debug('subPage' + response.config.params.page, response);
                  if (checkResponse(response)) {
                    updateRepositories(response);
                  }
                }).catch(function (error) {
                  $log.error('subPage', error);
                  checkResponse(response);
                });
              });

              return Promise.all(subRequests);
            }).catch(function (response) {

              checkResponse(response);
              $scope.$digest();

              reject(response);
            }).then(function () {

              resolve(vm.repositories);
            }).catch(reject);
          });
        }

      });

      $scope.$watch(function () {
        return vm.userName;
      }, onUserNameChange);
    }]);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdpdGh1Yi11c2VyLXJlcG9zaXRvcmllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFDLFVBQVUsUUFBUSxTQUFTO0VBQzFCLElBQUksT0FBTyxXQUFXLGNBQWMsT0FBTyxLQUFLO0lBQzlDLE9BQU8sQ0FBQyxZQUFZO1NBQ2YsSUFBSSxPQUFPLFlBQVksYUFBYTtJQUN6QyxRQUFRO1NBQ0g7SUFDTCxJQUFJLE1BQU07TUFDUixTQUFTOztJQUVYLFFBQVEsSUFBSTtJQUNaLE9BQU8seUJBQXlCLElBQUk7O0dBRXJDLE1BQU0sVUFBVSxTQUFTO0VBQzFCLENBQUMsVUFBVSxRQUFRLFNBQVM7SUFDMUIsSUFBSSxPQUFPLFdBQVcsY0FBYyxPQUFPLEtBQUs7TUFDOUMsT0FBTyxJQUFJO1dBQ04sSUFBSSxPQUFPLFlBQVksYUFBYTtNQUN6QztXQUNLO01BQ0wsSUFBSSxNQUFNO1FBQ1IsU0FBUzs7TUFFWDtNQUNBLE9BQU8seUJBQXlCLElBQUk7O0tBRXJDLE1BQU0sWUFBWTtJQUNuQjs7SUExQkosUUFBUSxPQUFPLDRCQUE0QixJQUN4QyxVQUFVLGVBQWUsWUFBTTtNQUM5QixPQUFPO1FBQ0wsT0FBUTtVQUNOLFlBQWE7O1FBRWYsVUFBVTtRQUNWLFNBQVU7UUFDVixhQUFhOztPQUdoQixRQUFRLCtDQUFpQyxVQUFDLFdBQWM7O01BRXZELElBRUUsT0FBTyxVQUFVLElBQUk7VUFFckIsUUFBUSxVQUFVLElBQUk7VUFFdEIsZ0JBQWdCLFNBQWhCLGdCQUFzQztRQUFBLElBQXJCLFdBQXFCLFVBQUEsVUFBQSxLQUFBLFVBQUEsT0FBQSxZQUFWLFFBQVUsVUFBQTs7O1FBRXBDLElBQUksQ0FBQyxVQUFVO1VBQ2IsT0FBTzs7O1FBR1QsSUFBSSxRQUFRLFNBQVMsUUFBUTs7UUFFN0IsSUFBSSxDQUFDLE9BQU87VUFDVixPQUFPOzs7UUFHVCxRQUFRLE1BQU0sTUFBTTs7UUFFcEIsSUFBSSxDQUFDLE9BQU87VUFDVixPQUFPOzs7UUFHVCxRQUFR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QUV2QixJQUFJLENBQUMsU0FBUyxRQUFRO2dCQUNwQixPQUFPLFFBQVEsR0FBRzs7O2NBR3BCLElBQUksY0FBYyxTQUFTLElBQUksVUFBQyxTQUFZO2dCQUMxQyxRQUNHLEtBQUssVUFBQyxVQUFhO2tCQUNsQixLQUFLLE1BQUwsWUFBcUIsU0FBUyxPQUFPLE9BQU8sTUFBUTtrQkFDcEQsSUFBSSxjQUFjLFdBQVc7b0JBQzNCLG1CQUFtQjs7bUJBR3RCLE1BQU0sVUFBQyxPQUFVO2tCQUNoQixLQUFLLE1BQU0sV0FBVztrQkFDdEIsY0FBYzs7OztjQUlwQixPQUFPLFFBQVEsSUFBSTtlQUdwQixNQUFNLFVBQUMsVUFBYTs7Y0FFbkIsY0FBYztjQUNkLE9BQU87O2NBRVAsT0FBTztlQUdSLEtBQUssWUFBTTs7Y0FFVixRQUFRLEdBQUc7ZUFHWixNQUFNOzs7Ozs7TUFNYixPQUFPLE9BQU8sWUFBQTtRQUFBLE9BQU0sR0FBRztTQUFVOzs7R0FDbEMiLCJmaWxlIjoiZ2l0aHViLXVzZXItcmVwb3NpdG9yaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2dpdGh1Yi11c2VyLXJlcG9zaXRvcmllcycsIFtdKVxuICAuZGlyZWN0aXZlKCdsaW5rTGlzdGluZycsICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NvcGUgOiB7XG4gICAgICAgICdsaW5rTGlzdCcgOiAnPWxpbmtzJ1xuICAgICAgfSxcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICByZXBsYWNlIDogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAnLi90ZW1wbGF0ZS9saW5rLWxpc3RpbmcuaHRtbCdcbiAgICB9O1xuICB9KVxuICAuZmFjdG9yeSgnZ2l0aHViVXNlclJlcG9zaXRvcmllc0ZhY3RvcnknLCAoJGluamVjdG9yKSA9PiB7XG5cbiAgICBjb25zdFxuXG4gICAgICAkbG9nID0gJGluamVjdG9yLmdldCgnJGxvZycpLFxuXG4gICAgICAkaHR0cCA9ICRpbmplY3Rvci5nZXQoJyRodHRwJyksXG5cbiAgICAgIGNoZWNrTGFzdFBhZ2UgPSAocmVzcG9uc2UgPSBmYWxzZSkgPT4ge1xuXG4gICAgICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGlua3MgPSByZXNwb25zZS5oZWFkZXJzKCdMaW5rJyk7XG5cbiAgICAgICAgaWYgKCFsaW5rcykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmtzID0gbGlua3Muc3BsaXQoJzsgcmVsPVwibmV4dFwiLCA8aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyLycpO1xuXG4gICAgICAgIGlmICghbGlua3MpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rcyA9IGxpbmtzWzFdO1xuXG4gICAgICAgIGlmICghbGlua3MpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VJbnQobGlua3MucmVwbGFjZSgvKFxcdyopXFwvcmVwb3NcXD9wYWdlPShcXGQqKS4qL2csICckMicpLCAxMCk7XG5cbiAgICAgIH07XG5cbiAgICBjb25zdCBmYWN0b3J5ID0ge1xuXG4gICAgICBnZXRBbGwgOiAodXNlck5hbWUsIHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgdmFyXG4gICAgICAgICAgbGFzdFBhZ2UgPSBjaGVja0xhc3RQYWdlKHJlc3BvbnNlKSB8fCAwLFxuICAgICAgICAgIHJlcXVlc3RzID0gW10sXG4gICAgICAgICAgcGFyYW1zID0gcmVzcG9uc2UuY29uZmlnLnBhcmFtcztcblxuICAgICAgICBpZiAoIWxhc3RQYWdlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcXVlc3RzO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgcGFnZSA9IHBhcmFtcy5wYWdlICsgMTsgcGFnZSA8PSBsYXN0UGFnZTsgcGFnZSsrKSB7XG4gICAgICAgICAgdmFyIHJlcXVlc3QgPSBmYWN0b3J5LmdldCh1c2VyTmFtZSwge1xuICAgICAgICAgICAgcGVyX3BhZ2UgOiBwYXJhbXMucGVyX3BhZ2UsXG4gICAgICAgICAgICBwYWdlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVxdWVzdHMucHVzaChyZXF1ZXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXF1ZXN0cztcblxuICAgICAgfSxcblxuICAgICAgZ2V0IDogKHVzZXJOYW1lLCBwYXJhbXMgPSB7XG4gICAgICAgIHBhZ2UgOiAxLFxuICAgICAgICBwZXJfcGFnZSA6IDUwXG4gICAgICB9KSA9PiAobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICRsb2cuZGVidWcoXG4gICAgICAgICAgJ2dldCcsXG4gICAgICAgICAgYFVzZXJuYW1lIDogJHt1c2VyTmFtZX1gLFxuICAgICAgICAgIGBQYWdlIDogJHtwYXJhbXMucGFnZX1gLFxuICAgICAgICAgIGBQZXIgUGFnZSA6ICR7cGFyYW1zLnBlcl9wYWdlfWAsXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICBtZXRob2QgOiAnR0VUJyxcbiAgICAgICAgICB1cmwgOiBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2Vycy8ke3VzZXJOYW1lfS9yZXBvc2AsXG4gICAgICAgICAgcGFyYW1zXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICBpZiAoIXJlc3BvbnNlLnN0YXR1cykge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShyZXNwb25zZSk7XG5cbiAgICAgICAgfSwgKGVycm9yKSA9PiByZWplY3QoZXJyb3IpKVxuXG4gICAgICB9KSlcblxuICAgIH07XG5cbiAgICByZXR1cm4gZmFjdG9yeTtcblxuICB9KVxuICAuY29udHJvbGxlcignR2l0aHViVXNlclJlcG9zaXRvcmllc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkaW5qZWN0b3IpIHtcblxuICAgIGNvbnN0XG5cbiAgICAgIHZtID0gdGhpcyxcblxuICAgICAgJGxvZyA9ICRpbmplY3Rvci5nZXQoJyRsb2cnKSxcblxuICAgICAgZ2l0aHViVXNlclJlcG9zaXRvcmllcyA9ICRpbmplY3Rvci5nZXQoJ2dpdGh1YlVzZXJSZXBvc2l0b3JpZXNGYWN0b3J5JyksXG5cbiAgICAgIGlzVXNlcm5hbWVWYWxpZCA9ICgpID0+IHtcblxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNTdHJpbmcodm0udXNlck5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZtLnVzZXJOYW1lLmxlbmd0aCA+PSAxO1xuICAgICAgfSxcblxuICAgICAgcmVzZXRSZXBvc2l0b3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICRsb2cuZGVidWcoJ3Jlc2V0dGluZyByZXBvc2l0b3JpZXMnKTtcbiAgICAgICAgdm0ucmVwb3NpdG9yaWVzID0gW107XG4gICAgICAgIHZtLmVycm9yID0gJyc7XG4gICAgICB9LFxuXG4gICAgICBjaGVja1Jlc3BvbnNlID0gKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UpID09PSBmYWxzZSkge1xuICAgICAgICAgIHZtLmVycm9yID0gdm0uc3RyLm5vUmVzcG9uc2U7XG4gICAgICAgICAgJGxvZy5lcnJvcignY2hlY2tSZXNwb25zZScsIHZtLnN0ci5ub1Jlc3BvbnNlLCByZXNwb25zZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG5cbiAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZtLmVycm9yID0gdm0uc3RyLm5vUmVwb3M7XG4gICAgICAgICAgICAkbG9nLmRlYnVnKCdjaGVja1Jlc3BvbnNlJywgdm0uc3RyLm5vUmVwb3MsIHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkbG9nLmRlYnVnKCdjaGVja1Jlc3BvbnNlJywgMjAwLCByZXNwb25zZSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICB2bS5lcnJvciA9IHZtLnN0ci5ub1VzZXI7XG4gICAgICAgICAgJGxvZy5kZWJ1ZygnY2hlY2tSZXNwb25zZScsIHZtLnN0ci5ub1VzZXIsIHJlc3BvbnNlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmRlYnVnKCdjaGVja1Jlc3BvbnNlJywgdm0uc3RyLm5vUmVzcG9uc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgdm0uZXJyb3IgPSB2bS5zdHIubm9SZXNwb25zZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICB9LFxuXG4gICAgICBmb3JtYXRSZXBvc2l0b3JpZXMgPSAocmVwb3NpdG9yaWVzKSA9PiByZXBvc2l0b3JpZXNcbiAgICAgICAgLm1hcCgocmVwb3NpdG9yeSkgPT4gKHtcbiAgICAgICAgICBpZCA6IHJlcG9zaXRvcnkuaWQsXG4gICAgICAgICAgbmFtZSA6IHJlcG9zaXRvcnkubmFtZSxcbiAgICAgICAgICBsaW5rIDogcmVwb3NpdG9yeS5odG1sX3VybFxuICAgICAgICB9KSksXG5cbiAgICAgIHVwZGF0ZVJlcG9zaXRvcmllcyA9IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAkbG9nLmRlYnVnKGB1cGRhdGVSZXBvc2l0b3JpZXMke3Jlc3BvbnNlLmNvbmZpZy5wYXJhbXMucGFnZX1gLCByZXNwb25zZSk7XG5cbiAgICAgICAgdm0ucmVwb3NpdG9yaWVzID0gdm0ucmVwb3NpdG9yaWVzXG4gICAgICAgICAgLmNvbmNhdChmb3JtYXRSZXBvc2l0b3JpZXMocmVzcG9uc2UuZGF0YSkpO1xuXG4gICAgICAgICRzY29wZS4kZGlnZXN0KCk7XG5cbiAgICAgICAgcmV0dXJuIHZtLnJlcG9zaXRvcmllcztcbiAgICAgIH0sXG5cbiAgICAgIG9uVXNlck5hbWVDaGFuZ2UgPSAobmV3VmFsLCBvbGRWYWwpID0+IHtcbiAgICAgICAgaWYgKG5ld1ZhbCA9PT0gb2xkVmFsKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZtXG4gICAgICAgICAgLmdldFJlcG9zaXRvcmllcygpXG4gICAgICAgICAgLnRoZW4oKHJlcG9zaXRvcmllcykgPT4gJGxvZ1xuICAgICAgICAgICAgLmRlYnVnKCdvblVzZXJOYW1lQ2hhbmdlLmdldFJlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcykpXG4gICAgICAgICAgLmNhdGNoKChyZXBvc2l0b3JpZXMpID0+ICRsb2dcbiAgICAgICAgICAgIC5lcnJvcignb25Vc2VyTmFtZUNoYW5nZS5mYWlsZWRUb0dldFJlcG9zaXRvcmllcycsIHJlcG9zaXRvcmllcykpO1xuICAgICAgfTtcblxuICAgIE9iamVjdC5hc3NpZ24odm0sIHtcblxuICAgICAgc3RyIDoge1xuICAgICAgICB0aXRsZSA6ICdHaXRodWIgVXNlciBSZXBvc2l0b3JpZXMnLFxuICAgICAgICB1c2VyTmFtZSA6ICdVc2VybmFtZScsXG4gICAgICAgIHVzZXJuYW1lUGxhY2Vob2xkZXIgOiAnUGxlYXNlIHdyaXRlIGEgR2l0aHViIHVzZXJuYW1lIHRvIHNlYXJjaCcsXG4gICAgICAgIGludmFsaWRVc2VyTmFtZSA6ICdVc2VybmFtZSBpcyBub3QgdmFsaWQnLFxuICAgICAgICBub1VzZXIgOiAnVGhlIEdpdGh1YiB1c2VyIGRvZXMgbm90IGV4aXN0JyxcbiAgICAgICAgbm9SZXBvcyA6ICdHaXRodWIgdXNlciBoYXMgbm8gcmVwb3MnLFxuICAgICAgICBub1Jlc3BvbnNlIDogJ0dpdGh1YiBBUEkgZG9lcyBub3QgcmVzcG9uZCdcbiAgICAgIH0sXG5cbiAgICAgIGVycm9yIDogZmFsc2UsXG5cbiAgICAgIHVzZXJOYW1lIDogJycsXG5cbiAgICAgIHJlcG9zaXRvcmllcyA6IFtdLFxuXG4gICAgICBzdHJpcFVzZXJOYW1lIDogZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNTdHJpbmcoZXZlbnQudGFyZ2V0LnZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQudmFsdWUuaW5kZXhPZignICcpID49IDApIHtcbiAgICAgICAgICB2bS51c2VyTmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcnKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgdXNlck5hbWVNb2RlbE9wdGlvbnMgOiB7XG4gICAgICAgIGRlYm91bmNlOiB7XG4gICAgICAgICAgZGVmYXVsdCA6IDI1MCxcbiAgICAgICAgICBibHVyIDogMFxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBnZXRSZXBvc2l0b3JpZXMgOiAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgcmVzZXRSZXBvc2l0b3JpZXMoKTtcblxuICAgICAgICBpZiAoaXNVc2VybmFtZVZhbGlkKHZtLnVzZXJOYW1lKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh2bS5yZXBvc2l0b3JpZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2l0aHViVXNlclJlcG9zaXRvcmllc1xuICAgICAgICAgIC5nZXQodm0udXNlck5hbWUpXG4gICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChjaGVja1Jlc3BvbnNlKHJlc3BvbnNlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1cGRhdGVSZXBvc2l0b3JpZXMocmVzcG9uc2UpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHN1YlBhZ2VzID0gZ2l0aHViVXNlclJlcG9zaXRvcmllc1xuICAgICAgICAgICAgICAuZ2V0QWxsKHZtLnVzZXJOYW1lLCByZXNwb25zZSk7XG5cbiAgICAgICAgICAgIGlmICghc3ViUGFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHZtLnJlcG9zaXRvcmllcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzdWJSZXF1ZXN0cyA9IHN1YlBhZ2VzLm1hcCgocmVxdWVzdCkgPT4ge1xuICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAkbG9nLmRlYnVnKGBzdWJQYWdlJHtyZXNwb25zZS5jb25maWcucGFyYW1zLnBhZ2V9YCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrUmVzcG9uc2UocmVzcG9uc2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVJlcG9zaXRvcmllcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAkbG9nLmVycm9yKCdzdWJQYWdlJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgY2hlY2tSZXNwb25zZShyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHN1YlJlcXVlc3RzKTtcblxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChyZXNwb25zZSkgPT4ge1xuXG4gICAgICAgICAgICBjaGVja1Jlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICRzY29wZS4kZGlnZXN0KCk7XG5cbiAgICAgICAgICAgIHJlamVjdChyZXNwb25zZSk7XG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcblxuICAgICAgICAgICAgcmVzb2x2ZSh2bS5yZXBvc2l0b3JpZXMpO1xuXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcblxuICAgICAgfSlcblxuICAgIH0pO1xuXG4gICAgJHNjb3BlLiR3YXRjaCgoKSA9PiB2bS51c2VyTmFtZSwgb25Vc2VyTmFtZUNoYW5nZSk7XG5cbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
