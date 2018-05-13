
require("dotenv").config();
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var keys = require("./keys.js");
var fs = require("fs");
var request = require("request-promise"); // uses promises
//var request = require("request"); // uses callback function

var OMDB_BASE_ADDRESS = "http://www.omdbapi.com/?";
//logit(keys.twitter);
//logit(keys.spotify);

var command = process.argv[2]; // command is the action to perform (i.e.. spotify-this-song)
//logit("command is: " + command);

var data; // data is the parameter to a command, if any (i.e.. movie name, song title)

// if the command line command is 'do-what-it-say' then read the command from the random.txt file
if (command == "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function (err, res) {
        if (err) {
            return logit(err);
        }

        logit("The response is: " + res);
        command = res.split(",")[0];
        logit("command is: " + command);
        data = res.split(",")[1];
        logit("data is: " + data);
        doWhat(command, data);
    });
} else {
    if (process.argv[3] != null && process.argv[3] != undefined) {
        data = process.argv[3];
    } else {
        data = "NA"
    }
    doWhat(command, data);
}

function doWhat(aCommand, aData) {
    switch (aCommand) {
        case "my-tweets":
            logit("\n\n\n**************************************************************************")
            logit("GETTING THE LAST 20 TWEETS\n");
            getLastTwentyTweets();
            break;
        case "spotify-this-song":
        logit("\n\n\n******************************************************************************")
            logit("SPOTIFYING THE SONG: " + aData + "\n")
            getSongInfoFromSpotify(aData);
            break;
        case "movie-this":
        logit("\n\n\n******************************************************************************")
            logit("GETTING MOVIE INFO FOR: " + aData  + "\n");
            getMovieInfoFromOmdb(aData);
            break;
        default:
        logit("\n\n\n******************************************************************************")
            logit("I DID NOT UNDERSTAND THE COMAND: " + aCommand  + "\n");
    }
}

////////////  TWITTER ////////////////////////////
function getLastTwentyTweets() {
    console.log("enter getLastTwentyTweets");
    var client = new Twitter(keys.twitter);
    client.get('statuses/home_timeline', {  ///statuses/home_timeline displays tweets from user AND those followed by user
    //client.get('statuses/user_timeline', { // statuses/user_timeline display tweets ONLY from user
        count: 20
    }, function (error, tweets, response) {
        if (error) throw error;

        //logit(tweets);
        // logit(response);  // Raw response object. 
        tweets.forEach(tweet => {
            logit("\n\n\nCreated: " + tweet.created_at + "\n");
            logit(tweet.text + "\n");
        });
    });
    console.log("exit getLastTwentyTweets")
}

/////////////////  SPOTIFY  ///////////////////////////
function getSongInfoFromSpotify(aSong) {
    console.log("enter getSongInfoFromSpotify");

    var spotify = new Spotify(keys.spotify);
    if (aSong == "NA") {
        aSong = "The Sign";
    }

    spotify.search({
        type: 'track',
        query: data
    }).then(function (response) {
        //logit(response.tracks.items);
        var items = response.tracks.items;

        items.forEach(track => {
            var artistsArr = [];
            track.artists.forEach(artist => {
                artistsArr.push(artist.name);
            });
            logit("Artist(s): " + artistsArr);
            logit("Title: " + track.name);
            logit("Preview Link: " + track.preview_url);
            logit("Album: " + track.album.name + "\n\n\n");
        });

    }).catch(function (err) {
        logit(err);
    });

    console.log("exit getSongInfoFromSpotify");
}

/////////////////  OMDb  //////////////////////////
function getMovieInfoFromOmdb(aMovie) {
    console.log("Enter getMovieInfo");
    request(OMDB_BASE_ADDRESS + "apikey=" + keys.OMDb.api_key + "&t=" + aMovie.replace(" ", "+")).then((res) => {
       try {
        logit(res);

        var json = JSON.parse(res);

        logit("Title: " + json.Title);
        logit("Year: " + json.Year);
        logit("Rated: " + json.Rated);

        // Show any and all ratings for the movie
        json.Ratings.forEach((r) => {
            logit(r.Source + ": " + r.Value);
        });

        //logit("Rotten Tomatoes: " + json.Ratings[1].Value); //////some movies have no 'Rotten Tomatoes' Rating
        logit("Produced In " + json.Country);
        logit("Language(s): " + json.Language);
        logit("Plot: " + json.Plot);
        logit("Actors: " + json.Actors);
       } catch (error) {
           //do nothing
       }
        
    }).catch((err) => {
        logit("Error getting movie info" + err);
    });
    //...... Using request with callback function instead of promise ....................
    // request(OMDB_BASE_ADDRESS + "apikey=" + keys.OMDb.api_key + "&t=" + aMovie.replace(" ", "+"), function (err, res, body) {
    //     if (err) {
    //         return logit("An Error Occurred: " + err);
    //     }

    //     //logit(res);
    //     //logit(body);
    //     var json = JSON.parse(body);
    //     logit("Title: " + json.Title);
    //     logit("Year: " + json.Year);
    //     logit("Rated: " + json.Rated);
    //     logit("Rotten Tomatoes: " + json.Ratings[1].Value);
    //     logit("Produced In " + json.Country);
    //     logit("Language(s): " + json.Language);
    //     logit("Plot: " + json.Plot);
    //     logit("Actors: " + json.Actors);
    // });

    console.log("Exit getMovieInfo");
}

// log messages to console AND to log.txt
function logit(aMessage) {
    console.log(aMessage);

    fs.appendFile("./log.txt", aMessage + "\n", function (err) {
        
        if(err)
        {
            console.log("Error Occurred: " + err.message);
        }
    });
}