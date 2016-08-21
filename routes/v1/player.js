var express = require('express');
var router = express.Router();
var debug = require('debug')('player');
var md5 = require('md5');
var playerModel = require('../../models/player');
var levelModel = require('../../models/level');
var constant = require('../../config/constant');
var auth = require('./auth');

function e(errMsg) {
    return {
        error: errMsg
    };
}

/**
 * @api {get} /player get player
 * @apiParam {String} id id of the player to get
 * @apiSuccessExample {json} success
 *  {
 *   "_id": "57b9454c6ba8386c2ca2926c",
 *   "id": 65432,
 *   "name": "testName",
 *   "__v": 0,
 *   "status": 0,
 *   "auth": 0,
 *   "level": 0,
 *   "score": 0
 *  }
 * @apiGroup player
 * @apiVersion 0.1.0
 */
router.get('/', function(req, res, next) {
    playerModel.findOne({
        id: req.query.id
    }).exec().then(function(foundPlayer) {
        if (foundPlayer.status == constant.playerStatus.banned || foundPlayer.status == constant.playerStatus.inactive)
            res.status(401).send(e(constant.codes.playerNotActive));
        else
            res.send(foundPlayer);
    }).catch(function(error) {
        res.send();
        // res.status(constant.serverError).send(e(error));
    })
});

/**
 * @api {delete} /player delete player
 * @apiParamExample {json} request
 * {
 *   player: {
 *       id: "654321",
 *   },
 *   user: {
 *       id: "791a4270d908c5d131e59f4ee95b9f4a"
 *   }
 * }
 * @apiSuccessExample {json} success
 * {
 *      "code" : 0,
 *      "message": "Success"
 * }
 * @apiGroup player
 * @apiVersion 0.1.0
 */
router.delete('/', auth.admin, function(req, res, next) {
    var player = req.body.player;
    playerModel.remove(player)
        .then(function(player) {
            return res.json(constant.codes.successMessage);
        }).catch(function(error) {
            return res.status(constant.serverError).send(e(error));
        })
});

/**
 * @api {put} /player put player
 * @apiParamExample {json} request
 * {
 *   player: {
 *       id: "654321",
 *       name: "testName",
 *   }
 * }
 * @apiSuccessExample {json} success
 * {
 *      "code" : 0,
 *      "message": "Success"
 * }
 * @apiGroup player
 * @apiVersion 0.1.0
 */
router.put('/', function(req, res, next) {
    var player = new playerModel(req.body.player);
    debug(player);
    // Apparently promise violates some rules and creates a copy, weird
    player.save(function(error) {
        if (error)
            return res.status(constant.serverError).send(e(error));
        return res.json(constant.codes.successMessage);
    });
});

/**
 * @api {post} /player/checkAnswer check answer
 * @apiDescription Checks if the answer is correct, updates player score and level in backend
 * @apiParamExample {json} request
 * {
 *   player: {
 *       id: "654321",
 *   },
 *   answer: "testKey"
 * }
 * @apiSuccessExample {json} success
 * {
 *      "code" : 0,
 *      "message": "Correct Answer"
 * }
 * @apiGroup player
 * @apiVersion 0.1.0
 */
router.post('/checkAnswer', auth.player, function(req, res, next) {
    var answer = md5(req.body.answer);
    var player = req.body.player;
    playerModel.findOne({
        id: req.body.player.id
    }).exec().then(function(foundPlayer) {
        if (foundPlayer) {
            levelModel.findOne({
                    level: foundPlayer.level
                }).exec()
                .then(function(foundLevel) {
                    if (answer == foundLevel.key) {
                        // TODO update level of user and return true
                        // find number of users with that level
                        playerModel.count({
                            level: {
                                $gte: foundLevel.level
                            }
                        }).exec().then(function(count) {
                            console.log(count);
                            // add 5000 to 1000 for the first five people
                            plusBaseScore = count < 5 ? (5 - count) * 1000 : 0;
                            scoreToAdd = foundLevel.basescore + plusBaseScore;
                            playerModel.update(foundPlayer, {
                                    $set: {
                                        level: foundPlayer.level + 1,
                                        score: foundPlayer.score + scoreToAdd
                                    }
                                }).exec()
                                .then(function(foundPlayer) {
                                    return res.json(constant.codes.correctAnswer);
                                }).catch(function(error) {
                                    return res.status(constant.serverError).send(e(error));
                                })

                        }).catch(function(error) {
                            return res.status(constant.serverError).send(e(error));
                        })
                    } else {
                        return res.json(constant.codes.wrongAnswer);
                    }
                }).catch(function(error) {
                    return res.status(constant.serverError).send(e(error));
                });
        } else
            return res.status(constant.serverError).send(e(constant.codes.noPlayerFound));
    }).catch(function(error) {
        return res.status(constant.serverError).send(e(error));
    })

});

module.exports = router;