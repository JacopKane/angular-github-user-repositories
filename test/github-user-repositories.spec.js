describe('Module', function() {

  describe('GithubUserRepositories', function() {

    var
      $q,
      $scope,
      $rootScope,
      $controller,
      $logProvider,
      $httpBackend,
      repositoryGetDeferred,
      githubUserRepositoriesController,
      githubUserRepositoriesFactory,
      sampleUserName = 'JacopKane',
      sampleUrl = function (options) {
        return 'https://api.github.com/users/' +
          options.userName +
          '/repos?page=' + options.page +
          '&per_page=' + options.perPage;
      },
      sampleRequestParams = {
        page :     1,
        per_page : 10
      },
      sampleResponse = [{
        id : 999,
        name : 'angular-github-user-repositories',
        'html_url' : 'https://github.com/JacopKane/angular-github-user-repositories'
      }];

    beforeEach(module('app'));
    beforeEach(module('github-user-repositories'));

    beforeEach(inject(function(
      _$q_,
      _$rootScope_,
      _$httpBackend_,
      _$controller_,
      _githubUserRepositoriesFactory_
    ) {

      $httpBackend = _$httpBackend_;
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      $q = _$q_;
      githubUserRepositoriesFactory = _githubUserRepositoriesFactory_;

      githubUserRepositoriesController = $controller('GithubUserRepositoriesController', {
        $scope : $scope,
        githubUserRepositoriesFactory : githubUserRepositoriesFactory
      });

    }));

    afterEach (function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest ();
    });


    describe('Factory', function() {

      describe('GithubUserRepositories', function() {

        it('have methods', function() {

          expect(githubUserRepositoriesFactory.get).not.toBeUndefined();
          expect(githubUserRepositoriesFactory.getAll).not.toBeUndefined();

        });

        it('can get url', function (done) {

          var url = sampleUrl({
            page : sampleRequestParams.page,
            perPage : sampleRequestParams.per_page,
            userName : sampleUserName
          });

          $httpBackend
            .when('GET', url)
            .respond(200, sampleResponse);

          $httpBackend.expect('GET', url);

          var request = githubUserRepositoriesFactory
            .get(sampleUserName, sampleRequestParams);

          request
            .then(function(response) {

              expect(response.data[0].html_url).toEqual(sampleResponse[0].html_url);
              expect(response.data[0].name).toEqual(sampleResponse[0].name);
              expect(response.data[0].id).toEqual(sampleResponse[0].id);

              done();

            })
            .catch(function(error) {
              setTimeout(function() {
                throw new Error(error);
              }, 0);
            });

          $httpBackend.flush();

        });

      });

    });

    describe('Controller', function() {

      describe('GithubUserRepositories', function() {

        it('have methods and properties', function() {

          expect(githubUserRepositoriesController.repositories)
            .not.toBeUndefined();

          expect(githubUserRepositoriesController.str).not.toBeUndefined();

          expect(githubUserRepositoriesController.error).not.toBeUndefined();

          expect(githubUserRepositoriesController.userName).not.toBeUndefined();

          expect(githubUserRepositoriesController.stripUserName)
            .not.toBeUndefined();

          expect(githubUserRepositoriesController.getRepositories)
            .not.toBeUndefined();

        });

        it('can get repositories', function(done) {

          var url = sampleUrl({
            page : 1,
            perPage : 50,
            userName : sampleUserName
          });

          spyOn(githubUserRepositoriesFactory, 'get').and.callThrough();
          spyOn(githubUserRepositoriesController, 'getRepositories')
            .and.callThrough();

          $httpBackend
            .expect('GET', url)
            .respond(sampleResponse);

          githubUserRepositoriesController.userName = sampleUserName;

          var repositories = githubUserRepositoriesController.getRepositories();

          repositories
            .then(function(repositories) {
              expect(repositories.length).toBeGreaterThan(0);
              done();
            })
            .catch(function(error) {
              setTimeout(function() {
                throw new Error(error);
              }, 0);
            });

          expect(githubUserRepositoriesController.getRepositories)
            .toHaveBeenCalled();
          expect(githubUserRepositoriesFactory.get)
            .toHaveBeenCalled();

          $httpBackend.flush();

        });


      });

    });

  });

});
