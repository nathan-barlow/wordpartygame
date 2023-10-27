import Game from "./game.js";

let game;

document.addEventListener("DOMContentLoaded", start);

const settings = {
   team1_score: 0,
   team2_score: 0,
   currentCategory: null,
   gameDuration: 60,
   pointsToWin: 6,
};

const el = {
   score: {
      team1: document.getElementById("team1_score"),
      team2: document.getElementById("team2_score"),
   },
   settings: {
      cat_urban_dictionary: {
         el: document.getElementById("cat_urban_dictionary"),
         var: "currentCategory",
      },
      cat_food: {
         el: document.getElementById("cat_food"),
         var: "currentCategory",
      },
      cat_everything: {
         el: document.getElementById("cat_everything"),
         var: "currentCategory",
      },
      cat_phrases: {
         el: document.getElementById("cat_phrases"),
         var: "currentCategory",
      },
      game_duration: {
         el: document.getElementById("game_duration"),
         label: document.getElementById("game_duration_label"),
         var: "gameDuration",
      },
      points_to_win: {
         el: document.getElementById("points_to_win"),
         label: document.getElementById("points_to_win_label"),
         var: "pointsToWin",
      },
   },
   section: {
      home: document.getElementById("home"),
      game: document.getElementById("game"),
      round_end: document.getElementById("round_end"),
   },
   game: {
      current_category: document.getElementById("current_category"),
      current_word: document.getElementById("current_word"),
      used_words_container: document.getElementById("used_words_container"),
      used_words: document.getElementById("used_words"),
      timer_container: document.getElementById("timer_container"),
      timer: document.getElementById("timer"),
   },
   button: {
      start_game: {
         el: document.getElementById("start_game"),
         func: "startGame",
      },
      how_to_play: {
         el: document.getElementById("how_to_play"),
         func: "howToPlay",
      },
      restart_game: {
         el: document.getElementById("restart_game"),
         func: "restartGame",
      },
      pause_game: {
         el: document.getElementById("pause_game"),
         func: "pauseGame",
      },
      skip_word: {
         el: document.getElementById("skip_word"),
         func: "skipWord",
      },
      next_word: {
         el: document.getElementById("next_word"),
         func: "nextWord",
      },
      end_round: {
         el: document.getElementById("end_round"),
         func: "endRound",
      },
      next_round: {
         el: document.getElementById("next_round"),
         func: "nextRound",
      },
   },
};

function start() {
   nextRound();
   addButtonListeners();
   addSettingListeners();
}

function nextRound() {
   el.section.home.classList.remove("hide");
   el.section.game.classList.add("hide");
   el.section.round_end.classList.add("hide");

   loadSettings();
}

// Load settings from Local Storage
function loadSettings() {
   settings.team1_score = localStorage.getItem("team1_score") || 0;
   settings.team2_score = localStorage.getItem("team2_score") || 0;
   settings.currentCategory = localStorage.getItem("currentCategory") || null;
   settings.gameDuration = localStorage.getItem("gameDuration") || 60;
   settings.pointsToWin = localStorage.getItem("pointsToWin") || 6;
}

function addButtonListeners() {
   Object.values(el.button).forEach((button) => {
      button.el.addEventListener("click", () => {
         try {
            eval(button.func + "()");
         } catch(err) {
            //console.error(`Function "${button.func}" is not defined.`);
            console.error(err);
         }
      });
   });
}

function addSettingListeners() {
   Object.values(el.settings).forEach((setting) => {
      if (setting.label) {
         setting.el.value = settings[setting.var];
         setting.label.innerText = settings[setting.var];
      } else {
         let selected = document.querySelector(
            'input[value="' + settings[setting.var] + '"]'
         );
         if (selected) {
            selected.checked = true;
         } else {
            let radioInputs = document.querySelectorAll(
               'input[name="category"]'
            );

            radioInputs.forEach((input) => {
               input.checked = false;
            });
         }
      }
      setting.el.addEventListener("input", () => {
         let value = setting.el.value;
         if (setting.label) {
            setting.label.innerText = value;
         }

         settings[setting.var] = value;
         localStorage.setItem(setting.var, value);
      });
   });
}

function loadList() {
   return ["Apple", "Banana", "Carrot"];
}

function startGame() {
   el.section.home.classList.add("hide");
   el.section.game.classList.remove("hide");
   el.section.round_end.classList.add("hide");

   let wordList = loadList(settings.currentCategory);
   game = new Game(settings.currentCategory, settings.gameDuration, wordList, el.game, endRound);

   game.initialize();
   game.startTimer();
   game.nextWord();
}

function endRound(usedWords) {
   el.section.home.classList.add("hide");
   el.section.game.classList.add("hide");
   el.section.round_end.classList.remove("hide");

   if(usedWords) {
      el.game.used_words_container.classList.remove("hide");
      usedWords.map((word) => el.game.used_words.innerHTML += ("<li>" + word + "</li>"));
   } else {
      el.game.used_words_container.classList.add("hide");
   }

   game.clearTimer();

   game = null;
}

function howToPlay() {
   let dialog = document.getElementById("dialog_how_to_play");
   dialog.showModal();
}

function restartGame() {
   localStorage.setItem("team1_score", 0);
   localStorage.setItem("team2_score", 0);
   localStorage.setItem("currentCategory", null);
   localStorage.setItem("gameDuration", 60);
   localStorage.setItem("pointsToWin", 6);

   start();
}

function pauseGame() {
   if(game.pauseTimer()) {
      el.button.pause_game.el.innerHTML = "<i class='bi-play'></i>";
   } else {
      el.button.pause_game.el.innerHTML = "<i class='bi-pause'></i>";
   }
}

function skipWord() {
   game.skipWord();
}

function nextWord() {
   game.nextWord();
}
