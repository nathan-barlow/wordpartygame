import Game from "./game.js";
import lists from "./lists.js";

let game;
let wordsList = [];
let definitions = {};

document.addEventListener("DOMContentLoaded", start);

const settings = {
   team1_score: 0,
   team2_score: 0,
   currentCategory: null,
   gameDuration: 60,
   pointsToWin: 6,
   showTimer: "false",
   wordsToGenerate: 50,
   usedWords: {
      urbanDictionary: null,
      food: null,
      everything: null,
      phrases: null,
   },
   apiCallLimit: 10,
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
      cat_nsfw: {
         el: document.getElementById("cat_nsfw"),
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
      cat_random: {
         el: document.getElementById("cat_random"),
         var: "currentCategory",
      },
      cat_phrases: {
         el: document.getElementById("cat_phrases"),
         var: "currentCategory",
      },
      cat_wisconsin: {
         el: document.getElementById("cat_wisconsin"),
         var: "currentCategory",
      },
      cat_easy_words: {
         el: document.getElementById("cat_easy_words"),
         var: "currentCategory",
      },
      cat_medium_words: {
         el: document.getElementById("cat_medium_words"),
         var: "currentCategory",
      },
      cat_hard_words: {
         el: document.getElementById("cat_hard_words"),
         var: "currentCategory",
      },
      cat_all_holidays: {
         el: document.getElementById("cat_all_holidays"),
         var: "currentCategory",
      },
      cat_christmas: {
         el: document.getElementById("cat_christmas"),
         var: "currentCategory",
      },
      cat_thanksgiving: {
         el: document.getElementById("cat_thanksgiving"),
         var: "currentCategory",
      },
      cat_valentines_day: {
         el: document.getElementById("cat_valentines_day"),
         var: "currentCategory",
      },
      cat_independence_day: {
         el: document.getElementById("cat_independence_day"),
         var: "currentCategory",
      },
      cat_new_years: {
         el: document.getElementById("cat_new_years"),
         var: "currentCategory",
      },
      cat_spring: {
         el: document.getElementById("cat_spring"),
         var: "currentCategory",
      },
      cat_household: {
         el: document.getElementById("cat_household"),
         var: "currentCategory",
      },
      cat_animals: {
         el: document.getElementById("cat_animals"),
         var: "currentCategory",
      },
      cat_travel: {
         el: document.getElementById("cat_travel"),
         var: "currentCategory",
      },
      cat_idioms: {
         el: document.getElementById("cat_idioms"),
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
      show_timer: {
         el: document.getElementById("show_timer"),
         var: "showTimer",
      },
   },
   section: {
      home: document.getElementById("home"),
      game: document.getElementById("game"),
      round_end: document.getElementById("round_end"),
   },
   home_message: {
      container: document.getElementById("home_message_container"),
      text: document.getElementById("home_message"),
      button: document.getElementById("home_message_button"),
   },
   game: {
      current_category: document.getElementById("current_category"),
      current_word: document.getElementById("current_word"),
      current_word_definition: document.getElementById(
         "current_word_definition"
      ),
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
      home_message_button: {
         el: document.getElementById("home_message_button"),
         func: "resetCategory",
      },
      how_to_play: {
         el: document.getElementById("how_to_play"),
         func: "howToPlay",
      },
      test_audio: {
         el: document.getElementById("test_audio"),
         func: "testAudio",
      },
      restart_game: {
         el: document.getElementById("restart_game"),
         func: "restartGame",
      },
      pause_game: {
         el: document.getElementById("pause_game"),
         func: "pauseGame",
      },
      // skip_word: {
      //    el: document.getElementById("skip_word"),
      //    func: "skipWord",
      // },
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
      clear_history: {
         el: document.getElementById("clear_history"),
         func: "clearHistory",
      },
   },
   audio: {
      timer: new AudioContext(),
      buzzer: new Audio("audio/buzzer.mp3"),
      winner: new Audio("audio/winner.mp3"),
   },
};

function start() {
   nextRound();
   addButtonListeners();
   addSettingListeners();
}

async function nextRound() {
   el.section.home.classList.remove("hide");
   el.section.game.classList.add("hide");
   el.section.round_end.classList.add("hide");

   if (el.score.team1.input.checked) {
      let oldScore = parseInt(localStorage.getItem("team1_score")) || 0;
      let newScore = oldScore + 1;
      localStorage.setItem("team1_score", newScore);

      if (newScore >= settings.pointsToWin) {
         await el.audio.winner.play();
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
         await el.audio.winner.play();
         alert("Team 2 wins!");
         restartGame(true);
      }
      el.score.team2.input.checked = false;
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
   settings.showTimer = localStorage.getItem("showTimer") || "false";

   for (const key in el.settings) {
      if (key.startsWith("cat_")) {
         const category = el.settings[key].el.value; // Extract the category name
         let usedWordsString =
            localStorage.getItem(`usedWords_${category}`) || null;

         if (usedWordsString) {
            // Remove the first character if it's a comma
            if (usedWordsString[0] === ",") {
               usedWordsString = usedWordsString.substring(1);
            }

            // Split the string into an array
            const usedWordsArray = usedWordsString.split(",");
            const validCharactersRegex = /^[a-zA-Z0-9'"\- ]+$/;

            // Assign the array to the settings
            settings.usedWords[category] = usedWordsArray.map((word) => {
               try {
                  if (validCharactersRegex.test(atob(word))) {
                     return atob(word);
                  } else {
                     return word;
                  }
               } catch {
                  return word;
               }
            });
         } else {
            settings.usedWords[category] = null; // Handle the case where there are no used words
         }
      }
   }

   console.log(settings.usedWords);

   el.score.team1.score.innerText = settings.team1_score;
   el.score.team2.score.innerText = settings.team2_score;

   el.home_message.button.classList.add("hide");
   el.home_message.container.classList.add("hide");
   el.home_message.text.innerText = "";
}

function resetCategory(cat = settings.currentCategory) {
   localStorage.removeItem("usedWords_" + cat);
   loadSettings();
}

function addButtonListeners() {
   Object.values(el.button).forEach((button) => {
      button.el.addEventListener("click", () => {
         if (button.func === "nextRound") {
            location.reload();
         }

         try {
            eval(button.func + "()");
         } catch (err) {
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
      } else if (setting.el.dataset.type == "toggle") {
         if (settings[setting.var] == "true") {
            setting.el.checked = true;
         } else {
            setting.el.checked = false;
         }
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
         let value;

         if (setting.el.dataset.type == "toggle") {
            value = setting.el.checked;
         } else {
            value = setting.el.value;
         }

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
   settings.apiCallLimit = 10;
   switch (settings.currentCategory) {
      case "urbanDictionary":
         return await loadUrbanDictionary();
      case "everything":
         return loadLocalList("random");
      default:
         return loadLocalList(settings.currentCategory);
      //return "List does not exist.";
   }
}

async function startGame() {
   if (settings.currentCategory != null) {
      el.button.start_game.el.disabled = true;

      el.home_message.container.classList.remove("hide");
      el.home_message.text.innerText = "Loading words...";

      let loadedList = await loadList(settings.currentCategory);

      if (
         typeof loadedList === "object" &&
         loadedList.length >= settings.wordsToGenerate
      ) {
         el.section.home.classList.add("hide");
         el.section.game.classList.remove("hide");
         el.section.round_end.classList.add("hide");
         el.home_message.container.classList.add("hide");

         game = new Game(
            settings.currentCategory
               .replace(/([a-z])([A-Z])/g, "$1 $2")
               .replace(/\b\w/g, (l) => l.toUpperCase()),
            settings.gameDuration,
            loadedList,
            el.game,
            endRound,
            el.audio.timer,
            settings.showTimer,
            definitions
         );

         game.initialize();
         await game.startTimer();
         game.nextWord(true);

         el.button.start_game.el.disabled = false;
      } else if (loadedList == "Not enough unused words available.") {
         el.home_message.container.classList.remove("hide");
         el.home_message.text.innerText = "Not enough unused words available.";
         el.home_message.button.classList.remove("hide");
      } else {
         el.home_message.container.classList.remove("hide");
         el.home_message.text.innerText = "Failed to load list: " + loadedList;
      }
   } else {
      el.home_message.container.classList.remove("hide");
      el.home_message.text.innerText = "No category selected.";
   }
}

async function endRound(usedWords) {
   el.section.home.classList.add("hide");
   el.section.game.classList.add("hide");
   el.section.round_end.classList.remove("hide");

   game.stopPlayingTimer();
   await game.playAudio("buzzer", false);
   game.clearTimer();
   game = null;

   if (usedWords) {
      let cleanedWords = usedWords.map((word) => {
         return btoa(word.replace(/\s+\(skipped\)$/, "").toLowerCase());
      });

      let oldWords = (settings.usedWords[settings.currentCategory] || []).map(
         (word) => btoa(word.toLowerCase())
      );

      el.game.used_words_container.classList.remove("hide");
      el.game.used_words.innerHTML = "";
      localStorage.setItem("usedWords_" + settings.currentCategory, [
         oldWords,
         ...cleanedWords,
      ]);
      usedWords.map((word) => {
         el.game.used_words.innerHTML += "<li>" + word + "</li>";
      });
   } else {
      el.game.used_words_container.classList.add("hide");
   }
}

function howToPlay() {
   let dialog = document.getElementById("dialog_how_to_play");
   dialog.showModal();
}

async function testAudio() {
   game = new Game();
   game.audio = el.audio.timer;
   await game.playAudio("beep", false);

   game = null;

   el.home_message.container.classList.remove("hide");
   el.home_message.text.innerHTML =
      "Audio has played. If you did not hear anything, please make sure your volume is turned up, enable the ringer <i class='bi bi-bell-slash'></i> on your device, and refresh the page.";
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
         localStorage.setItem("currentCategory", "");
         localStorage.setItem("gameDuration", 60);
         localStorage.setItem("pointsToWin", 6);

         game = null;

         location.reload();
         return false;
      }
   }
}

function clearHistory() {
   if (
      confirm(
         "Are you sure you want to clear word history? This will clear ALL of the words you've used and may result in you receiving words you've already seen."
      )
   ) {
      // Loop through all keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
         const key = localStorage.key(i);

         // Check if the key starts with "usedWords_"
         if (key.startsWith("usedWords_")) {
            // Remove the item from localStorage
            localStorage.removeItem(key);
         }
      }
   }
}

function pauseGame() {
   if (game.pauseTimer()) {
      el.button.pause_game.el.innerHTML = "<i class='bi-play'></i>";
      console.log("true");
   } else {
      el.button.pause_game.el.innerHTML = "<i class='bi-pause'></i>";
      console.log("false");
   }
}

// function skipWord() {
//    game.skipWord();
// }

function nextWord() {
   game.nextWord();
}

function addToActiveList(newWords) {
   let used = settings.usedWords[settings.currentCategory] || [];

   if (typeof newWords === "string") {
      if (!used.includes(newWords.toLowerCase())) {
         wordsList.push(newWords);
      } else {
         console.log("REPEAT WORD");
      }
   } else if (typeof newWords === "object") {
      newWords.map((word) => {
         if (!used.includes(word.toLowerCase())) {
            wordsList.push(word);
         } else {
            console.log("REPEAT WORD");
         }
      });
   } else {
      return true;
   }
}

async function fetchUrbanDictionary() {
   try {
      let response = await fetch("https://api.urbandictionary.com/v0/random");
      if (!response.ok) {
         console.error("Network response was not ok");
      }
      let data = await response.json();
      return data;
   } catch (error) {
      console.error("Error loading from Urban Dictionary - " + error);
      return "Error loading from Urban Dictionary - " + error;
   }
}

async function loadUrbanDictionary() {
   if (wordsList.length >= settings.wordsToGenerate) {
      return wordsList;
   }
   if (settings.apiCallLimit <= 0) {
      return "API call limit reached and not enough words have been retrieved.";
   }
   try {
      let data = await fetchUrbanDictionary();
      let words = data.list.map((def) => def.word);

      data.list.forEach((def) => {
         definitions[def.word] = {
            definition: def.definition,
            example: def.example,
         };
      });

      if (typeof words === "object") {
         addToActiveList(words);
      } else {
         return words; // error message
      }

      if (wordsList.length <= settings.wordsToGenerate) {
         settings.apiCallLimit--;
         return await loadUrbanDictionary();
      } else {
         return wordsList;
      }
   } catch (error) {
      console.error("Error loading words from Urban Dictionary:", error);
      return "Urban Dictionary API failed to load. Error message: " + error;
   }
}

function loadLocalList(cat) {
   let words = [];

   if (cat == "everything") {
      Object.values(lists).forEach((category) => {
         words.push(...category);
      });
   } else if (cat == "allHolidays") {
      words.push(...lists["christmas"]);
      words.push(...lists["thanksgiving"]);
      words.push(...lists["valentinesDay"]);
      words.push(...lists["independenceDay"]);
      words.push(...lists["newYears"]);
      words.push(...lists["spring"]);
   } else {
      words = lists[cat];
   }

   if (words.length >= settings.wordsToGenerate) {
      const shuffled = words.slice();

      while (wordsList.length < settings.wordsToGenerate) {
         const randomIndex = Math.floor(Math.random() * shuffled.length);
         let randomWord;

         if (!isBase64Encoded(shuffled[randomIndex])) {
            if (shuffled[randomIndex] == undefined) {
               console.error("Not enough unique words.");
               return "Not enough unused words available.";
            } else {
               randomWord = shuffled.splice(randomIndex, 1)[0];
               console.error("Error decoding words list");
            }
         } else {
            randomWord = atob(shuffled.splice(randomIndex, 1)[0]);
         }

         if (addToActiveList(randomWord)) {
            console.error("Not enough unique words.");
            return "Not enough unused words available.";
            break;
         }
      }

      return wordsList;
   } else {
      console.error("Stored list is not long enough.");
      return "Stored list is not long enough.";
   }
}

function isBase64Encoded(str) {
   try {
      return btoa(atob(str)) == str;
   } catch (e) {
      return false;
   }
}
