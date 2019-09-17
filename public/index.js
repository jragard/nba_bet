$(document).ready(function () {

function populateTeamChoice(game) {
    // console.log(game);
    let teamChoices = document.getElementById("chooseTeam");
    let team1City = game[0].teamCityName;
    let team2City = game[1].teamCityName;

    let team1Record = game[0].teamWinsLosses;
    let team2Record = game[1].teamWinsLosses;

    let option1 = document.createElement("option");
    let option2 = document.createElement("option");

    let option1Text = `${team1City} - (${team1Record})`;
    let option2Text = `${team2City} - (${team2Record})`;

    option1.innerHTML = option1Text;
    option1.value = JSON.stringify(game[0]);

    option2.innerHTML = option2Text;
    option2.value = JSON.stringify(game[1]);

    teamChoices.appendChild(option1);
    teamChoices.appendChild(option2);

    let chooseTeamButton = document.getElementById("chooseTeamButton");
    chooseTeamButton.className = 'button';
        
    chooseTeamButton.onclick = () => {
        let selection = teamChoices.options[teamChoices.selectedIndex].value;
        let nonSelection;
        selection = JSON.parse(selection);

        if(teamChoices.selectedIndex === 0) {
            nonSelection = teamChoices.options[1].value;
        } else {
            nonSelection = teamChoices.options[0].value;
        }

        nonSelection = JSON.parse(nonSelection);
        // console.log(selection);
        // console.log(nonSelection);
        selection.selected = true;
        nonSelection.selected = false;
        constructBet(selection, nonSelection);
    }
}

function constructBet(team, opponentTeam) {
    // console.log('Chosen Team');
    // console.log(team);
    // console.log('Opposing Team');
    // console.log(opponentTeam);
    let betContainer = document.getElementById('bet');

    let betInput = document.createElement('input');
    betInput.name = "bet";
    let betLabel = document.createElement('label');
    betLabel.for = "bet";
    betLabel.innerHTML = "Enter your bet";
    betInput.type = 'text';
    betInput.id = 'betInput';
    betContainer.appendChild(betLabel);
    betContainer.appendChild(betInput);

    let addressInput = document.createElement('input');
    let addressLabel = document.createElement('label');
    addressLabel.for = "address";
    addressLabel.innerHTML = "Enter Opponent's ETH address";
    addressInput.type = 'text';
    addressInput.name = 'address';
    addressInput.id = 'addressInput';
    betContainer.appendChild(addressLabel);
    betContainer.appendChild(addressInput);

    let submitBetButton = document.createElement('button');
    submitBetButton.className = "button";
    submitBetButton.innerHTML = "Submit";
    betContainer.appendChild(submitBetButton);

    submitBetButton.onclick = () => {
        let bet = betInput.value;
        let address = addressInput.value;
        // console.log(bet);
        // console.log(address);
        confirmBet(team, opponentTeam, bet, address);
    }


    // let tempEthAddress = '0x04bb91796b7d6164c97a859b10da2daf8f5b1e15';
    // let tempOpponentAddress = '0xbd4d8e4be6b70ab33c29759b398c5663d14245d8';

    // let gameID = team.gameId;
    // let gameDate = team.gameDateEST;
    // let teamID = team.teamID;
    // let opponentTeamID = opponentTeam.teamID;
    // let betAmount = 0.025;
    // let teamCity = team.teamCityName;
    // let opponentCity = opponentTeam.teamCityName;

    // contractFunction(tempEthAddress, tempOpponentAddress, gameID, gameDate, teamID, opponentTeamID, betAmount, teamCity, opponentCity);
}

function confirmBet(chosenTeam, opponentTeam, bet, address) {
    let hostCity;
    if(chosenTeam.home) {
        hostCity = chosenTeam.teamCityName;
    } else {
        hostCity = opponentTeam.teamCityName;
    }

    let confirmDiv = document.getElementById('confirm');
    let confirm = document.createElement('h3');
    let details = document.createElement('p');
    confirmText = document.createTextNode('Please Confirm Your Bet Details Are Correct');
    confirm.appendChild(confirmText);
    confirmDiv.appendChild(confirm);

    let text = `You want to bet ${bet} ETH on ${chosenTeam.teamCityName} to beat ${opponentTeam.teamCityName} in ${hostCity} on ${chosenTeam.gameDateEST} against the owner of ETH Address: ${address}  -- Please click to confirm or cancel`;
    let detailsText = document.createTextNode(text);
    details.appendChild(detailsText);
    confirmDiv.appendChild(details);

    let confirmButton = document.createElement("button");
    confirmButton.id = "confirmButton";
    confirmButton.className = "button";
    confirmButton.innerHTML = "Confirm";

    let cancelButton = document.createElement("button");
    cancelButton.id = "cancelButton";
    cancelButton.className = "button";
    cancelButton.innerHTML = "Cancel";

    confirmDiv.appendChild(confirmButton);
    confirmDiv.appendChild(cancelButton);

    confirmButton.onclick = () => {
        let date = chosenTeam.gameDateEST;
        let index = date.indexOf('T');
        gameOverTimeStamp = Math.floor(new Date(date.slice(0, index).split('-').join('.')).getTime() / 1000);

        contractFunction(address, parseInt(chosenTeam.gameID, 10), gameOverTimeStamp, chosenTeam.teamID, opponentTeam.teamID, parseFloat(bet), chosenTeam.teamCityName, opponentTeam.teamCityName)
    }

    cancelButton.onclick = () => {
        location.reload();
    }
}

function contractFunction(address, gameID, gameDate, teamID, opponentID, bet, teamCity, opponentCity) {
    console.log(typeof address);
    console.log(address);
    console.log(typeof gameID);
    console.log(gameID);
    console.log(typeof gameDate);
    console.log(gameDate);
    console.log(typeof teamID);
    console.log(teamID);
    console.log(typeof opponentID);
    console.log(opponentID);
    console.log(typeof bet)
    console.log(bet);;
    console.log(typeof teamCity);
    console.log(teamCity);
    console.log(typeof opponentCity);
    console.log(opponentCity);
}

function fetchAndUpdate(url, date) {
    fetch(url, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({date: date})        
    })
    .then((res) => {
        return res.json()
    })
    .then((res) => {
   
        for(key in res.data) {
            let gamePair = res.data[key];
       
            // let date = gamePair[0].gameDateEST;
            // let gameID = gamePair[0].gameID;
            // let gameSequence = gamePair[0].gameSequence;

            let homeTeamID = gamePair[0].homeTeamID;

            let city1 = gamePair[0].teamCityName;
            let teamID1 = gamePair[0].teamID;
            let record1 = gamePair[0].teamWinsLosses;

            let city2 = gamePair[1].teamCityName;
            let teamID2 = gamePair[1].teamID;
            let record2 = gamePair[1].teamWinsLosses;

            let homeTeam;
            let visitorTeam;
            let homeRecord;
            let visitorRecord;

            if(teamID1 === homeTeamID) {
                homeTeam = city1;
                visitorTeam = city2;
                homeRecord = record1;
                visitorRecord = record2;
                gamePair[0].home = true;
                gamePair[0].visiting = false;
                gamePair[1].home = false;
                gamePair[1].visiting = true;
            } else {
                homeTeam = city2;
                visitorTeam = city1;
                homeRecord = record2;
                visitorRecord = record1;
                gamePair[1].home = true;
                gamePair[1].visiting = false;
                gamePair[0].home = false;
                gamePair[0].visiting = true;
            }

            let optionText = `${visitorTeam} - (${visitorRecord})  @  ${homeTeam} - (${homeRecord})`;
            let option = document.createElement("option");
            option.value = JSON.stringify(gamePair);
            option.innerHTML = optionText;

            let sel = document.getElementById("chooseGame");
            sel.appendChild(option);

            let selButton = document.getElementById("chooseGameButton");
        
            selButton.onclick = () => {
                let selection = sel.options[sel.selectedIndex].value;
                selection = JSON.parse(selection);
                populateTeamChoice(selection);
            }
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

document.getElementById('games').addEventListener('submit', (evt) => {
    evt.preventDefault();
    let date = document.getElementById('date').value;
    date = date.split('-')
    year = date.shift()
    date.push(year);
    date = date.join('/')
    fetchAndUpdate('http://localhost:3000/games', date);
});
});
