pragma solidity ^0.5.11;

contract Betting {
    uint minimumBet = 0.005 ether;
    uint maximumBet = 0.025 ether;
    uint participants = 2;


    struct Bet {
        address eth_address;
        address opponent_eth_address;
        uint game_ID;
        uint game_date;
        uint team_ID;
        uint opponent_ID; 
        uint bet_amount;
        string team_city;
        string opponent_city;
    }

    struct BetPair {
        Bet bet1;
        Bet bet2;
    }

    Bet[] public bets;
    BetPair[] public activated_bets;

    function createBet(address _opponent_address, uint _game_ID, uint _game_date, uint _team_ID, uint _opponent_ID, uint _bet_amount, string _team_city, string _opponent_city) external payable {
        require(msg.value >= minimumBet);
        require(msg.value <= maximumBet);
        address bet_address = msg.value;
        bet = Bet(Bet(bet_address, _opponent_address, _game_ID, _game_date, _team_ID, _opponent_ID, _bet_amount, _team_city, _opponent_city));
        bets.push(bet);
        bool ready_to_activate = isBetReady(bet);

        if(ready_to_activate) {
            // need to remove both bets from bets;
            activateBet(bet_address);
        }
    }

    function activateBet(Bet _bet) internal {
        struct[] memory temp_bets = bets;
        for(uint i = 0; i < temp_bets.length; i++) {
            if(_bet.eth_address === temp_bets[i].opponent_address) {
                pair = BetPair(_bet, temp_bets[i]);
                activated_bets.push(pair);
            }
        }
    }

    function isBetReady(address _betting_address) internal returns (bool) {
        // struct[] memory temp_bets = bets;
        for(uint i = 0; i < bets.length; i++) {
            if(_betting_address === bets[i].opponent_address) {
                return true;
            }
        }
        return false;
    }

}