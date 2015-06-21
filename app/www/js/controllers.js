angular.module('Gunt.controllers', ['Gunt.factories', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})

.controller('LoginCtrl', function($scope,$state, $timeout, $stateParams, $ionicPopup,$ionicLoading, ngFB, login) {
    $scope.$parent.clearFabs();
    $scope.fbLogin = function() {
        $ionicLoading.show();
        ngFB.login({
            scope: 'email'
        }).then(
            function(response) {
                if (response.status === 'connected') {
                    console.log('Facebook login succeeded');
                    ngFB.api({
                        path: '/me',
                        params: {
                            fields: 'id,name,email'
                        }
                    }).then(
                        function(player) {
                            $scope.player = player;
                            console.log($scope.player);
                            login.login($scope.player)
                                .success(function(data) {
                                    console.log(data);
                                    if (data.code == 0) {
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Success',
                                            template: 'You have been successfully registered'
                                        });
                                        alertPopup.then(function(res) {
                                            // $state.go('app.dashboard');
                                        });
                                    } else if (data.code == 3) {
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Failed',
                                            template: 'The Email is already in use' + '</br> Error code : ' + data.code
                                        });
                                    } else {
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Failed',
                                            template: 'Some Error Occured' + '</br> Error code : ' + data.code
                                        });
                                    }
                                }).error(function(err) {
                                    console.log(err);
                                }).then(function() {
                                    $ionicLoading.hide();
                                });
                        },
                        function(error) {
                            alert('Facebook error: ' + error.error_description);
                        });
                } else {
                    alert('Facebook login failed');
                }
            });

    };


    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionic.material.ink.displayEffect();
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function() {
        ionic.material.motion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
        ionic.material.motion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionic.material.ink.displayEffect();
});