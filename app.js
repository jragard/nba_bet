const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const util = require('util');
const path = require('path');

const publicPath = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

const port = 3000;

const workingGameUrl = "https://stats.nba.com/stats/boxscoresummaryv2/?GameID=0021800051";

// app.get('/:gameID', (req, res, next) => {
//     let gameID = req.params.gameID;
//     // https://stats.nba.com/game/0021900003/
//     // https://stats.nba.com/stats/boxscoresummaryv2/?GameID=0021900003
//     // let url = `https://stats.nba.com/stats/boxscoresummaryv2/?GameID=${req.params.gameID}`;
//     let url = `https://stats.nba.com/stats/boxscoresummaryv2/?GameID=0021800051`;
//     axios.get(url)
//     .then((response) => {
//         console.log(response)
//         if(response.status == 200) {
//             res.json({data: response})
//         }
//     })
//     .catch((err) => {
//         res.send('Error')
//     })
// })

app.get('/completed', (req, res, next) => {
    axios.get(workingGameUrl)
    .then((response) => {
        let data = response.data;
        let gameSummary = data.resultSets[0];
        let otherStats = data.resultSets[1];
        let gameInfo = data.resultSets[4];
        let lineScore = data.resultSets[5].rowSet;

        // console.log('gameSummary: ');
        // console.log(gameSummary);
        // console.log('----');
        // console.log('otherStats: ');
        // console.log(otherStats);
        // console.log('----');
        // console.log('gameInfo: ');
        // console.log(gameInfo);
        // console.log('----');
        // console.log('lineScore: ');
        // console.log(lineScore);
        // console.log('----');

        let gameStatusStr = gameSummary.rowSet[0][4];
        let gameDateStr = gameInfo.rowSet[0][0];
        let gameDateEST = gameSummary.rowSet[0][0];
        let gameID = gameSummary.rowSet[0][2];
        let homeTeamID = gameSummary.rowSet[0][6];
        let visitorTeamID = gameSummary.rowSet[0][7];

        let homeTeamCity = lineScore.filter(team => {
            return team[3] === homeTeamID
        });
        homeTeamCityStr = homeTeamCity[0][5];

        let visitorTeamCity = lineScore.filter(team => {
            return team[3] === visitorTeamID
        });
        visitorTeamCityStr = visitorTeamCity[0][5];

        console.log('home');
        console.log(homeTeamCityStr);
        console.log('away');
        console.log(visitorTeamCityStr);

        // console.log('game status string: ');
        // console.log(gameStatusStr);
        // console.log('game date string: ');
        // console.log(gameDateStr);
        // console.log('gameDateEST');
        // console.log(gameDateEST);
        // console.log('gameID: ');
        // console.log(gameID);
        // console.log('home team ID: ');
        // console.log(homeTeamID);
        // console.log('visitor team ID: ');
        // console.log(visitorTeamID);


        res.json({msg: 'Success', data});
    })
})

app.post('/games', (req, res, next) => {
    axios.get(`https://stats.nba.com/stats/scoreboard/?GameDate=${req.body.date}&LeagueID=00&DayOffset=0`)
    .then((response) => {
        
        let teamData = response.data.resultSets[0].rowSet;
        let gamesData = response.data.resultSets[1].rowSet;
        let games = {};

        for(let i = 0; i < gamesData.length; i++) {
            let team = gamesData[i];
            let gameDateEST = team[0];
            let gameSequence = team[1];
            let gameID = team[2];
            let teamID = team[3];
            let teamAbbreviation = team[4];
            let teamCityName = team[5];
            let teamWinsLosses = team[6];

            let homeFilter = teamData.filter((game) => {
                return game[2] === gameID.toString()
            });

            let visitorTeamID = homeFilter[0][7];
            let homeTeamID = homeFilter[0][6];

            let gameObject = {gameID, gameDateEST, gameSequence, homeTeamID, visitorTeamID, teamID, teamAbbreviation, teamCityName, teamWinsLosses}
            
            games[gameID] ? games[gameID].push(gameObject) : games[gameID] = [gameObject];
        }
        // console.log(games);
        res.json({msg: 'Success', data: games});
    })
    .catch((error) => {
        console.log(error);
    });
});

app.listen(port, ()=> {
    console.log('Listening on ' + port);
});