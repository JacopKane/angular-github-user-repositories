angular.module('github-user-repositories', [])
  .directive('linkListing', function() {
    return {
      scope : {
        'repositories' : '=repositories'
      },
      restrict: 'E',
      templateUrl: './template/link-listing.html'
    };
  })
  .factory('GithubUserRepositoriesFactory', ['$http', ($http) => {

    const

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

        return parseInt(links.replace(/(\w*)\/repos\?page=(\d*).*/g, "$2"), 10);

      };

    const factory = {

      getAll : (userName, response) => {

        let
          lastPage = checkLastPage(response),
          promises = [],
          params = response.config.params;

        if (lastPage) {

          for (let page = response.config.params.page; page <= lastPage; page++) {
            params.page = page;
            promises.push(factory.get(userName, params));
          }

        }

        return promises;

      },

      get : (userName, params = {
        page :     1,
        per_page : 50
      }) => $http({
        url : `https://api.github.com/users/${userName}/repos`,
        method : 'GET',
        params
      })
        .then((response) => {
          if (!response.data) {
            return Promise.reject(new Error(vm.str.noResponse));
          }

          return Promise.resolve(response);
        })
        .catch((error) => Promise.reject(error))
    };


    return factory;

  }])
  .controller('GithubUserRepositoriesController', [
    '$scope',
    '$log',
    'GithubUserRepositoriesFactory',
    function($scope, $log, githubUserRepositories) {

      const

        isUsernameValid = () => {

          if (typeof this.userName !== 'string') {
            return false;
          }

          return this.userName.length >= 1;
        },

        resetRepositories = () => {
          this.repositories = [];
          this.error = false;
        },

        failedToUpdateRepositories = (error) => {
          $log.debug('failedToUpdateRepositories', error);
          return this.error = typeof error === 'object' && error.status === 404 ?
            this.str.noUser : this.str.noResponse;
        },


        updateRepositories = (response) => {

          $log.debug('updateRepositories', response);

          if (!response.data) {
            failedToUpdateRepositories(response);
            return false;
          }

          if (response.data.length === 0) {
            this.error = this.str.noRepos;
            return false;
          }

          return this.repositories = this.repositories
            .concat(response.data.map((repository) => {
              return ({
                name : repository.name,
                link : repository['html_url']
              });
            }));
        },

        onUserNameChange = (newVal, oldVal) => (newVal !== oldVal) ?
          this.getRepositories()
            .then((repositories) => $log.debug('getRepositories', repositories))
            .catch(failedToUpdateRepositories) : false;

      Object.assign(this, {

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

          if (typeof event.target !== 'object') {
            return false;
          }

          if (typeof event.target.value !== 'string') {
            return false;
          }

          if (event.target.value.indexOf(' ') >= 0) {
            this.userName = event.target.value.replace(/\s+/g, '');
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

          if (!isUsernameValid(this.userName)) {
            reject(this.str.invalidUserName);
          }

          githubUserRepositories
            .get(this.userName)
            .then((response) => {

              if (!response || !updateRepositories(response)) {
                failedToUpdateRepositories(response);
                return Promise.reject(response);
              }

              return Promise.all(githubUserRepositories
                .getAll(this.userName, response)
                .map((promise) => promise
                  .then(updateRepositories)
                  .catch(failedToUpdateRepositories)));

            })
            .catch(failedToUpdateRepositories)
            .then(resolve);

        })


      });

      $scope.$watch(() => this.userName, onUserNameChange);

    }
  ]);
