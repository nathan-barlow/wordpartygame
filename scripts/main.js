import Game from "./game.js";

let game;
let wordsList = [];

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
      team1: {
         score: document.getElementById("team1_score"),
         input: document.getElementById("winner1"),
      },
      team2: {
         score: document.getElementById("team2_score"),
         input: document.getElementById("winner2"),
      },
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
   home_message: document.getElementById("home_message"),
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
   audio: {
      timer: new Audio("audio/beep2.wav"),
      buzzer: new Audio("audio/buzzer.mp3"),
      winner: new Audio("audio/winner.mp3"),
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

   if (el.score.team1.input.checked) {
      let oldScore = parseInt(localStorage.getItem("team1_score")) || 0;
      let newScore = oldScore + 1;
      localStorage.setItem("team1_score", newScore);

      if (newScore >= settings.pointsToWin) {
         el.audio.winner.play();
         alert("Team 1 wins!");
         restartGame(true);
      }
      el.score.team1.input.checked = false;
   }

   if (el.score.team2.input.checked) {
      let oldScore = parseInt(localStorage.getItem("team2_score")) || 0;
      let newScore = oldScore + 1;
      localStorage.setItem("team2_score", newScore);

      if (newScore >= settings.pointsToWin) {
         el.audio.winner.play();
         alert("Team 2 wins!");
         restartGame(true);
      }
      el.score.team1.input.checked = false;
   }

   loadSettings();
}

// Load settings from Local Storage
function loadSettings() {
   settings.team1_score = localStorage.getItem("team1_score") || 0;
   settings.team2_score = localStorage.getItem("team2_score") || 0;
   settings.currentCategory = localStorage.getItem("currentCategory") || null;
   settings.gameDuration = localStorage.getItem("gameDuration") || 60;
   settings.pointsToWin = localStorage.getItem("pointsToWin") || 6;

   el.score.team1.score.innerText = settings.team1_score;
   el.score.team2.score.innerText = settings.team2_score;
}

function addButtonListeners() {
   Object.values(el.button).forEach((button) => {
      button.el.addEventListener("click", () => {
         try {
            eval(button.func + "()");
         } catch (err) {
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

async function loadList() {
   wordsList = [];
   switch (settings.currentCategory) {
      case "Urban Dictionary":
         await loadUrbanDictionary();
         return wordsList;
         break;
      case "Food":
         loadLocalList("whales");
   }
   //return ["Apple", "Banana", "Carrot"];
}

async function startGame() {
   if (settings.currentCategory != null) {
      el.home_message.classList.remove("hide");
      el.home_message.innerText = "Loading words...";

      let wordList = await loadList(settings.currentCategory);

      if (wordList) {
         el.section.home.classList.add("hide");
         el.section.game.classList.remove("hide");
         el.section.round_end.classList.add("hide");
         el.home_message.classList.add("hide");

         game = new Game(
            settings.currentCategory,
            settings.gameDuration,
            wordList,
            el.game,
            endRound,
            el.audio
         );

         game.initialize();
         game.startTimer();
         game.nextWord();
      } else {
         el.home_message.classList.remove("hide");
         el.home_message.innerText = "Failed to load list. Reload and try again or check console for more details.";
      }
   } else {
      el.home_message.classList.remove("hide");
      el.home_message.innerText = "No category selected.";
   }
}

function endRound(usedWords) {
   el.section.home.classList.add("hide");
   el.section.game.classList.add("hide");
   el.section.round_end.classList.remove("hide");

   el.audio.timer.pause();
   el.audio.buzzer.play();

   if (usedWords) {
      el.game.used_words_container.classList.remove("hide");
      el.game.used_words.innerHTML = "";
      usedWords.map(
         (word) => (el.game.used_words.innerHTML += "<li>" + word + "</li>")
      );
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

function restartGame(scoresOnly = false) {
   if (scoresOnly) {
      localStorage.setItem("team1_score", 0);
      localStorage.setItem("team2_score", 0);
   } else {
      if (
         confirm(
            "Are you sure you want to restart the game? This will clear all scores and settings."
         )
      ) {
         localStorage.setItem("team1_score", 0);
         localStorage.setItem("team2_score", 0);
         localStorage.setItem("currentCategory", null);
         localStorage.setItem("gameDuration", 60);
         localStorage.setItem("pointsToWin", 6);

         start();
      }
   }
}

function pauseGame() {
   if (game.pauseTimer()) {
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

async function fetchUrbanDictionary() {
   try {
      let response = await fetch("https://api.urbandictionary.com/v0/random");
      if (!response.ok) {
         throw new Error("Network response was not ok");
      }
      let data = await response.json();
      let words = data.list.map((def) => def.word);
      return words;
   } catch (error) {
      console.error("Fetch error: ", error);
      return [];
   }
}

async function loadUrbanDictionary() {
   if (wordsList.length < 50) {
      try {
         let words = await fetchUrbanDictionary();
         wordsList.push(...words);

         // Check if you still need more words
         if (wordsList.length < 50) {
            await loadUrbanDictionary(); // Recursively call loadList until you have at least 50 words
         }
      } catch (error) {
         console.error("Error loading words from Urban Dictionary:", error);
      }
   }
}

async function loadLocalList(list) {
   try {
      let response = await fetch("./lists.json");
      if (!response.ok) {
         throw new Error("Network response was not ok");
      }
      let data = await response.json();
      let words = data[list];
      console.log(words);
   } catch (error) {
      console.error("Fetch error: ", error);
      return [];
   }
}
