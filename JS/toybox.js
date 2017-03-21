//Random Gen
function roll() {
	
	return Math.random() * 100;
}

//Get max bets that can be made before going negative in the bank
function getMaxSafeBets() {
	
	var max = 0;

	//Get max times bet can occur before going over bank limit
	while(player.bet * Math.pow(player.betMulti, max) <= player.bank) { max++; }

	return max;
}

//Get the odds of exceeding the max bet if continued betting occurs
function getMaxSafeBetsOdds() {
	
	return (Math.pow((100 - casino.odds) / 100, getMaxSafeBets()) * 100).toFixed(2)
}