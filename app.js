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
// const workingGameUrl = "https://stats.nba.com/stats/boxscoresummaryv2/?GameID=0021800202";

app.get('/fullSchedule', (req, res, next) => {
    const url = "http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2019/league/00_full_schedule.json";
    axios.get(url)
    .then((response) => {
        const gamesByMonth = [];
        const allGames = [];
        const gamesByDate = [];
        const months = response.data.lscd;

        months.forEach((month, index) => {

            const monthObj = {
                monthStr: month.mscd.mon,
                gamesInMonth: {}
            }
            const games = month.mscd.g;

            games.forEach((game) => {
                let date = game.gdte;

                if(monthObj.gamesInMonth[date]) {
                    monthObj.gamesInMonth[date].push(game);
                } else {
                    monthObj.gamesInMonth[date] = [game];
                }
                allGames.push(game);
            });

            gamesByMonth.push(monthObj);

        });

        gamesByMonth.forEach((month) => {
            for(let key in month.gamesInMonth) {
                gamesByDate.push(month.gamesInMonth[key]);
            }
        });
        res.json({allGames, gamesByDate});
    });
});

// GameID must be 10 digits.  May have to append 0's to front of it.
app.get('/completed/:gameID', (req, res, next) => {
    let url = "https://stats.nba.com/stats/boxscoresummaryv2/?GameID=";
    let id = req.params["gameID"];
    // 21800202
    while(id.length < 10) {
        id = '0' + id;
     }
    url = url + id;
    axios.get(url)
    .then((response) => {
        console.log(response);
        let data = response.data;
        let gameSummary = data.resultSets[0];
        let lineScoreHeaders = data.resultSets[5].headers;
        let lineScore = data.resultSets[5].rowSet;
        // let homeTeamID = gameSummary.rowSet[0][6];
        // let visitorTeamID = gameSummary.rowSet[0][7];

        // let homeTeamCity = lineScore.filter(team => {
        //     return team[3] === homeTeamID
        // });
        // homeTeamCityStr = homeTeamCity[0][5];

        // let visitorTeamCity = lineScore.filter(team => {
        //     return team[3] === visitorTeamID
        // });
        // visitorTeamCityStr = visitorTeamCity[0][5];

        // let visitingLineScore = lineScore[0];
        // let homeLineScore = lineScore[1];

        let team1 = lineScore[0];
        let team2 = lineScore[1];

        let team1_ID = team1[3];
        let team2_ID = team2[3];
        let team1_score = team1[team1.length - 1];
        let team2_score = team2[team2.length - 1];

        let winning_ID;

        if(team1_score > team2_score) {
            winning_ID = team1_ID;
        } else if (team2_score > team1_score) {
            winning_ID = team2_ID;
        }

        let obj = {
            winning_ID,
        }

        // obj[visitorTeamID] = visitingLineScore[visitingLineScore.length - 1];
        // obj[homeTeamID] = homeLineScore[homeLineScore.length - 1];
        // obj[visitorTeamCityStr] = visitorTeamID;
        // obj[homeTeamCityStr] = homeTeamID;
        // obj.game_ID = gameSummary.rowSet[0][2];

        // let obj = {
        //     visitorScore: visitingLineScore[visitingLineScore.length - 1],
        //     homeScore: homeLineScore[homeLineScore.length - 1],
        //     visitorTeamID,
        //     homeTeamID,
        //     // gameSummary,
        //     // lineScore,
        //     // homeTeamID,
        //     // visitorTeamID,
        //     // homeTeamCity,
        //     // homeTeamCityStr,
        //     // visitorTeamCity,
        //     // visitorTeamCityStr
        // }

        // data[""]

        res.json({data: obj});
    }).catch((error) => {
        console.log(error)
    })
});

app.post('/games', (req, res, next) => {
    axios.get(`https://stats.nba.com/stats/scoreboard/?GameDate=${req.body.date}&LeagueID=00&DayOffset=0`)
    .then((response) => {
        console.log(response.data)
        
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
        
        res.json({data: games});
    })
    .catch((error) => {
        console.log(error);
    });
});

app.listen(port, ()=> {
    console.log('Listening on ' + port);
});