export default class Game {
   category;
   gameDuration;
   unusedWords;
   usedWords = [];
   timerInterval;
   paused = true;
   audio;
   lastWordTimestamp;
   skippedWords = 0; // number of skipped words

   constructor(
      category,
      gameDuration,
      unusedWords,
      gameElements,
      endRound,
      audio,
      showTimer,
      definitions
   ) {
      this.category = category;
      this.gameDuration = gameDuration;
      this.unusedWords = unusedWords;
      this.el = gameElements;
      this.endRound = endRound;
      this.audio = audio;
      this.showTimer = showTimer;
      this.definitions = definitions;
   }

   async initialize() {
      this.lastWordTimestamp = new Date().getTime();
      this.el.timer_container.classList.remove("hide");
      if (!this.showTimer || this.showTimer == "false") {
         this.el.timer_container.classList.add("hide");
      }
      this.el.current_category.innerText = this.category;
      this.el.timer.innerText = this.gameDuration;
   }

   async playAudio(file, loop) {
      this.audio.source = this.audio.createBufferSource();
      this.audio.source.connect(this.audio.destination);

      let audioFile;

      switch (file) {
         case "beep":
            audioFile = "audio/beep2.mp3";
            break;
         case "buzzer":
            audioFile = "audio/buzzer.mp3";
            break;
         case "winner":
            audioFile = "audio/winner.mp3";
            break;
         default:
            break;
      }

      try {
         const audioData = await this.loadAudioFile(audioFile);
         this.audio.source.buffer = audioData;
         this.audio.source.loop = loop;
      } catch (error) {
         console.error("Error loading audio file:", error);
      }

      this.audio.source.start();

      if (!loop) {
         this.audio.source.onended = () => {
            this.audio.source.disconnect();
         };
      }
   }

   async startTimer() {
      await this.playAudio("beep", true);
      this.paused = false;
      this.timerInterval = setInterval(() => {
         this.gameDuration -= 0.1;
         this.el.timer.innerText = Math.round(this.gameDuration, 1);

         if (this.gameDuration < 5) {
            this.audio.source.playbackRate.value = 3;
         } else if (this.gameDuration < 10) {
            this.audio.source.playbackRate.value = 2;
         } else if (this.gameDuration < 20) {
            this.audio.source.playbackRate.value = 1.5;
         } else if (this.gameDuration < 30) {
            this.audio.source.playbackRate.value = 1.25;
         }

         if (this.gameDuration <= 0) {
            clearInterval(this.timerInterval);
            this.endRound(this.usedWords);
         }
      }, 100);
   }

   pauseTimer() {
      if (this.paused) {
         this.startTimer();
         return false;
      } else {
         this.paused = true;
         clearInterval(this.timerInterval);
         this.audio.source.stop();
         this.audio.source.disconnect();
         return true;
      }
   }

   clearTimer() {
      clearInterval(this.timerInterval);
   }

   stopPlayingTimer() {
      this.audio.source.stop();
      this.audio.source.disconnect();
   }

   nextWord(start = false) {
      if (!start) {
         this.updateRemainingTime();
      }

      const nextWordButton = document.getElementById("next_word");
      nextWordButton.classList.remove("start-timer");
      setInterval(() => {
         nextWordButton.classList.add("start-timer");
      }, 1);

      let currentWord = this.unusedWords[this.unusedWords.length - 1];
      let currentDefinition = this.definitions[currentWord];
      this.unusedWords.pop();

      if (currentWord == undefined) {
         this.gameDuration = 0;
         alert("Ran out of words!");
         return;
      }

      this.el.current_word.innerText = currentWord;

      if (currentDefinition == undefined) {
         this.el.current_word_definition.classList.add("hide");
      } else {
         this.el.current_word_definition.classList.remove("hide");
         this.el.current_word_definition.innerText =
            currentDefinition.definition.replace(/\[|\]/g, "");
      }

      this.usedWords.push(currentWord);
   }

   updateRemainingTime() {
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - this.lastWordTimestamp) / 1000;
      let decrement;

      if (timeDifference > 3) {
         // if it's likely to be a new person
         this.skippedWords = 0;

         // Generate a skewed random interval
         const baseInterval = Math.random() * 5; // Random number between 0 and 5
         const skewFactor = 1 / (1 + timeDifference - 3); // Skew factor diminishes as timeDifference grows
         decrement = baseInterval * skewFactor;
      } else {
         // if the word was skipped
         this.skippedWords++;
         decrement = Math.max(4 - this.skippedWords, 0);
      }

      this.lastWordTimestamp = currentTime;

      console.log(timeDifference, decrement);

      if (this.gameDuration - decrement < 8) {
         this.gameDuration = 8;
      } else {
         this.gameDuration -= decrement;
      }

      this.el.timer.innerText = Math.round(this.gameDuration, 1);
   }

   async loadAudioFile(url) {
      return new Promise(async (resolve, reject) => {
         try {
            const response = await fetch(url);
            if (!response.ok) {
               reject("Network response was not ok");
               console.error("Network response not okay");
               return;
            }
            const audioData = await response.arrayBuffer();
            this.audio.decodeAudioData(
               audioData,
               (buffer) => {
                  resolve(buffer);
               },
               (error) => {
                  reject("Error decoding audio data: " + error);
                  console.error("error decoding");
               }
            );
         } catch (error) {
            reject("Error loading audio data: " + error);
         }
      });
   }
}
