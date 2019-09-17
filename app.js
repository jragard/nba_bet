const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const path = require('path');

const publicPath = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

const port = 3000;

// url for a past, completed NBA game. Keep as an example of the data you get after a game is complete
const workingGameUrl = "https://stats.nba.com/stats/boxscoresummaryv2/?GameID=0021800051";

app.get('/completed', (req, res, next) => {
    axios.get(workingGameUrl)
    .then((response) => {
        let data = response.data;
        let gameSummary = data.resultSets[0];
        let lineScore = data.resultSets[5].rowSet;
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
      
        res.json({msg: 'Success', data: games});
    })
    .catch((error) => {
        console.log(error);
    });
});

app.listen(port, ()=> {
    console.log('Listening on ' + port);
});