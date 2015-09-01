'use strict';

var config = require('./db_creds.js'),
    cudl = require('cuddle'),
    mongo = require('anytv-node-mongo').open(config),
    _ = require('lodash'),

    get_shortened_url_objects = function(callback) {
        mongo.collection('games')
            .find({image : /goo.gl/}, 
                {
                    image:1,
                    game_id:1,
                    _id:0
                })
            .toArray(callback);
    },

    get_redirect_urls = function (err, result) {

        if(result.length === 0) {
            return console.log("We're all clear! :)");
        }

        console.log("Got the following URLs :" );
        console.log(result);

        console.log("\n\n");
        console.log("Now proceeding to retrieving redirect URLs");

        _.map(result, function (url) {
            cudl.get.to(url.image)
                .then(update_to_redirect_urls.bind(this, url));
        });
    },

    update_to_redirect_urls = function (data, result, err , meta) {
        var filter = {game_id : data.game_id},
            changes = {
                    $set : 
                        {
                            image: meta.response_headers.location
                        }
                    };

        console.log("=================================");
        console.log(data.image + "\nINTO =>\n" + meta.response_headers.location);
        mongo.collection('games')
            .update(filter, changes, finish);
        console.log("SUCESSFUL!");
        console.log("=================================");
    },

    finish = function (err, result) {
        console.log("\n Service done.");
    }

get_shortened_url_objects(get_redirect_urls);