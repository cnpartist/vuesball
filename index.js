// localStorage persistence
var STORAGE_KEY = 'vuesball-storage'
var vuesballStorage = {
  load: function (key) {
    var items = JSON.parse(localStorage.getItem(STORAGE_KEY + '-' + key) || '[]')
    return items
  },
  save: function (key, items) {
    localStorage.setItem(STORAGE_KEY + '-' + key, JSON.stringify(items))
  }
}

var vuesball = new Vue({
  el: '#vuesball',
  data: {
    teams: vuesballStorage.load('teams'),
    games: vuesballStorage.load('games'),
    newTeam: function () {
      return {
        name: '',
        gamesWon: 0,
        gamesDrawn: 0,
        gamesLost: 0,
        active: false,
        points: 0,
        highlighted: false,
        hidden: false
      }
    },
    newGame: function () {
      return {
        team1: null,
        team2: null,
        points1: null,
        points2: null,
        active: false
      }
    },
    newTeamName: ''
  },
  watch: {
    teams: {
      handler: function (teams) {
        vuesballStorage.save('teams', teams)
      },
      deep: true
    },
    games: {
      handler: function (games) {
        vuesballStorage.save('games', games)
      },
      deep: true
    }
  },
  methods: {
    addTeam: function () {
      var team = this.newTeam()
      team.name = this.newTeamName
      this.teams.push(team)
      this.newTeamName = ''
      this.resetGames()
    },
    removeTeam: function (team) {
      var i = 0
      while (i < this.games.length) {
        if (this.games[i].team1 === team || this.games[i].team2 === team) {
          this.games.splice(i, 1)
        }
        else {
          i++
        }
      }
      this.teams.splice(this.teams.indexOf(team), 1)
      this.updateTeams()
    },
    resetGames: function () {
      this.games = []
      for (i = 0; i < this.teams.length; i++) {
        for (j = i + 1; j < this.teams.length; j++) {
          var game1 = this.newGame()
          game1.team1 = this.teams[i]
          game1.team2 = this.teams[j]
          this.games.push(game1)

          var game2 = this.newGame()
          game2.team2 = this.teams[i]
          game2.team1 = this.teams[j]
          this.games.push(game2)
        }
      }
    },
    updateTeams: function () {
      for (i = 0; i < this.teams.length; i++) {
        this.teams[i].gamesWon = 0
        this.teams[i].gamesDrawn = 0
        this.teams[i].gamesLost = 0
        this.teams[i].active = false
        this.teams[i].points = 0
      }
      for (i = 0; i < this.games.length; i++) {
        var game = this.games[i]
        if (game.active || game.points1 > 0 || game.points2 > 0) {
          if (game.active) {
            game.team1.active = true
            game.team2.active = true
          }
          if (game.points1 > 0 || game.points2 > 0) {
            if (game.points1 === game.points2) {
              game.team1.gamesDrawn++
              game.team2.gamesDrawn++
            }
            else {
              if (game.points1 > game.points2) {
                game.team1.gamesWon++
                game.team2.gamesLost++
              }
              else {
                game.team2.gamesWon++
                game.team1.gamesLost++
              }
            }
          }
        }
      }
      for (i = 0; i < this.teams.length; i++) {
        this.teams[i].points = this.teams[i].gamesWon * 2 + this.teams[i].gamesDrawn
      }
      this.teams.sort(function (team1, team2) {
        if (team1.points > team2.points)
          return -1
        if (team1.points < team2.points)
          return 1
        return 0
      })
    }
  }
})