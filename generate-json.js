const fs = require('fs');
const fetch = require('node-fetch');

const leagues = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1'];
const LEAGUE_NAMES = {
  'eng.1': 'Premier League',
  'esp.1': 'La Liga',
  'ita.1': 'Serie A',
  'ger.1': 'Bundesliga',
  'fra.1': 'Ligue 1'
};

async function fetchLeague(leagueId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`;
  const res = await fetch(url);
  const data = await res.json();

  return (data.events || []).map(event => {
    const comp = event.competitions[0];
    const home = comp.competitors.find(t => t.homeAway === 'home');
    const away = comp.competitors.find(t => t.homeAway === 'away');

    return {
      league: LEAGUE_NAMES[leagueId],
      id: event.id,
      date: event.date,
      status: event.status.type.description,
      completed: event.status.type.completed,
      team1: home.team.shortDisplayName,
      team2: away.team.shortDisplayName,
      score1: home.score,
      score2: away.score,
      venue: comp.venue?.fullName || 'TBD',
      link: `https://www.espn.com/soccer/match/_/gameId/${event.id}`
    };
  });
}

(async () => {
  const allMatches = [];

  for (let leagueId of leagues) {
    const matches = await fetchLeague(leagueId);
    allMatches.push(...matches);
  }

  fs.writeFileSync('matches.json', JSON.stringify(allMatches, null, 2));
})();
