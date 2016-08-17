angular.module("gunt", ["ngMaterial", "ui.router"])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/app/game/one");
        $stateProvider
            .state("app", {
                url: "/app",
                templateUrl: "modules/start/start.html",
                controller: "startController",
                abstract: true,
            })
            .state("app.scoreboard", {
                url: "/scoreboard",
                templateUrl: "modules/scoreboard/scoreboard.html",
                controller: "scoreController",
            })
            .state("app.game", {
                url: "/game",
                templateUrl: "modules/game/game.html",
                controller: "gameController",
                abstract: true,
            })
            .state("app.game.dummy", {
                url: "/dummy",
                templateUrl: "modules/game/dummy.html",
                controller: "dummyController"
            })
            .state("app.game.one", {
                url: "/one",
                templateUrl: "modules/game/one.html",
                controller: "oneController"
            });
    });
