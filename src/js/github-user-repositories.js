angular.module('github-user-repositories', [])
  .directive('linkListing', () => {
    return {
      scope : {
        'linkList' : '=links'
      },
      restrict: 'E',
      replace : true,
      templateUrl: './template/link-listing.html'
    };
  })
  .factory('githubUserRepositoriesFactory', ($injector) => {

    const

      $log = $injector.get('$log'),

      $http = $injector.get('$http'),

      checkLastPage = (response = false) => {

        if (!response) {
          return false;
        }

        let links = response.headers('Link');

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

    const factory = {

      getAll : (userName, response) => {

        var
          lastPage = checkLastPage(response) || 0,
          requests = [],
          params = response.config.params;

        if (!lastPage) {
          return requests;
        }

        for (var page = params.page + 1; page <= lastPage; page++) {
          var request = factory.get(userName, {
            per_page : params.per_page,
            page
          });
          requests.push(request);
        }

        return requests;

      },

      get : (userName, params = {
        page : 1,
        per_page : 50
      }) => (new Promise((resolve, reject) => {

        $log.debug(
          'get',
          `Username : ${userName}`,
          `Page : ${params.page}`,
          `Per Page : ${params.per_page}`,
          params
        );

        return $http({
          method : 'GET',
          url : `https://api.github.com/users/${userName}/repos`,
          params
        }).then((response) => {

          if (!response.status) {
            return reject(response);
          }

          if (response.status !== 200) {
            return reject(response);
          }

          return resolve(response);

        }, (error) => reject(error))

      }))

    };

    return factory;

  })
  .controller('GithubUserRepositoriesController', function ($scope, $injector) {

    const

      vm = this,

      $log = $injector.get('$log'),

      githubUserRepositories = $injector.get('githubUserRepositoriesFactory'),

      isUsernameValid = () => {

        if (!angular.isString(vm.userName)) {
          return false;
        }

        return vm.userName.length >= 1;
      },

      resetRepositories = () => {
        $log.debug('resetting repositories');
        vm.repositories = [];
        vm.error = '';
      },

      checkResponse = (response) => {

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

      formatRepositories = (repositories) => repositories
        .map((repository) => ({
          id : repository.id,
          name : repository.name,
          link : repository.html_url
        })),

      updateRepositories = (response) => {
        $log.debug(`updateRepositories${response.config.params.page}`, response);

        vm.repositories = vm.repositories
          .concat(formatRepositories(response.data));

        $scope.$digest();

        return vm.repositories;
      },

      onUserNameChange = (newVal, oldVal) => {
        if (newVal === oldVal) {
          return false;
        }

        return vm
          .getRepositories()
          .then((repositories) => $log
            .debug('onUserNameChange.getRepositories', repositories))
          .catch((repositories) => $log
            .error('onUserNameChange.failedToGetRepositories', repositories));
      };

    Object.assign(vm, {

      str : {
        title : 'Github User Repositories',
        userName : 'Username',
        usernamePlaceholder : 'Please write a Github username to search',
        invalidUserName : 'Username is not valid',
        noUser : 'The Github user does not exist',
        noRepos : 'Github user has no repos',
        noResponse : 'Github API does not respond'
      },

      error : false,

      userName : '',

      repositories : [],

      stripUserName : function (event) {

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

      userNameModelOptions : {
        debounce: {
          default : 250,
          blur : 0
        }
      },

      getRepositories : () => new Promise((resolve, reject) => {

        resetRepositories();

        if (isUsernameValid(vm.userName) === false) {
          return resolve(vm.repositories);
        }

        githubUserRepositories
          .get(vm.userName)
          .then((response) => {

            if (checkResponse(response) === false) {
              return reject(response);
            }

            if (updateRepositories(response) === false) {
              return reject(response);
            }

            var subPages = githubUserRepositories
              .getAll(vm.userName, response);

            if (!subPages.length) {
              return resolve(vm.repositories);
            }

            let subRequests = subPages.map((request) => {
              request
                .then((response) => {
                  $log.debug(`subPage${response.config.params.page}`, response);
                  if (checkResponse(response)) {
                    updateRepositories(response);
                  }
                })
                .catch((error) => {
                  $log.error('subPage', error);
                  checkResponse(response);
                });
            });

            return Promise.all(subRequests);

          })
          .catch((response) => {

            checkResponse(response);
            $scope.$digest();

            reject(response);

          })
          .then(() => {

            resolve(vm.repositories);

          })
          .catch(reject);

      })

    });

    $scope.$watch(() => vm.userName, onUserNameChange);

  });
