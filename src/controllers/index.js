import CFBDService from '../services/cfbdService.js';
import SportsDBService from '../services/sportsDbService.js';

/**
 * Renders the primary Cougar Conquest homepage with schedule tracking and matchup metrics.
 */
const getHomePage = async (req, res) => {
  try {
    // 1. Allow query string year override, fallback to env variable, or default to 2026[cite: 6]
    const year = req.query.year || process.env.SEASON_YEAR || 2026; //[cite: 6]
    
    // 2. Fetch raw schedule from CFBD API[cite: 6]
    const rawSchedule = await CFBDService.getSchedule(year, 'BYU'); //[cite: 6]

    // 3. Fetch BYU logo once to reuse across games[cite: 6]
    const byuLogo = await SportsDBService.getTeamLogo('BYU Cougars'); //[cite: 6]

    // 4. Enrich full schedule with logos and explicitly mapped dates[cite: 6]
    const schedule = await Promise.all(
      rawSchedule.map(async (game) => {
        const opponentLogo = await SportsDBService.getTeamLogo(game.opponent); //[cite: 6]
        
        // Pull date from start_date or startDate returned by CFBD[cite: 6]
        const gameDate = game.startDate || game.start_date || null; //[cite: 6]

        return {
          ...game,
          startDate: gameDate,
          opponentLogo: opponentLogo || 'https://via.placeholder.com/60?text=Logo', //[cite: 6]
          byuLogo: byuLogo || 'https://via.placeholder.com/60?text=BYU' //[cite: 6]
        };
      })
    );

    // 5. Determine upcoming / next game by checking completion and comparing start dates[cite: 6]
    const now = new Date(); //[cite: 6]
    let nextGame = schedule.find(g => !g.completed && g.startDate && new Date(g.startDate) > now); //[cite: 6]

    // Fallback: If no future game is found, take the first uncompleted game or the last game on schedule[cite: 6]
    if (!nextGame && schedule.length > 0) {
      nextGame = schedule.find(g => !g.completed) || schedule[schedule.length - 1]; //[cite: 6]
    }

    // 6. Build campaign ticker items centered on schedule & rivalries
    const tickerItems = [];

    if (nextGame) {
      const formattedDate = nextGame.startDate 
        ? new Date(nextGame.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'TBD'; //[cite: 6]
      const locationText = nextGame.venue ? ` at ${nextGame.venue}` : '';
      tickerItems.push(`🏈 NEXT BATTLE: BYU vs ${nextGame.opponent} (${formattedDate}${locationText})`);
    }

    const completedGames = schedule.filter(g => g.completed); //[cite: 6]
    if (completedGames.length > 0) {
      const lastGame = completedGames[completedGames.length - 1];
      tickerItems.push(`🏆 RECENT RESULT: BYU vs ${lastGame.opponent} (Week ${lastGame.week})`);
    }

    const homeGamesCount = schedule.filter(g => g.isHome).length;
    const awayGamesCount = schedule.filter(g => !g.isHome).length;

    tickerItems.push(`📊 ${year} CAMPAIGN: ${schedule.length} Total Games (${homeGamesCount} Home / ${awayGamesCount} Away)`);
    tickerItems.push(`⚔️ COUGAR CONQUEST: Track historical head-to-head records and upcoming battles`);

    // 7. Render EJS view with updated metadata
    res.render('index', {
      title: `Cougar Conquest | BYU Football ${year} Schedule & Rivalry Portal`,
      year,
      nextGame,
      schedule,
      tickerItems,
      page: 'home' //[cite: 6]
    });

  } catch (error) {
    console.error('Error rendering Home Page:', error.message); //[cite: 6]
    
    // Fallback data for error states
    res.render('index', {
      title: 'Cougar Conquest | BYU Football Portal',
      year: 2026,
      nextGame: null,
      schedule: [],
      tickerItems: ['⚔️ Cougar Conquest — BYU Football Schedule & Rivalry Portal'],
      page: 'home' //[cite: 6]
    });
  }
};

export {
  getHomePage
}; //[cite: 6]