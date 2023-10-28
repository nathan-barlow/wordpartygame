export default class Game {
   category;
   gameDuration;
   unusedWords;
   usedWords = [];
   timerInterval;
   paused = true;
   audio;

   constructor(
      category,
      gameDuration,
      unusedWords,
      gameElements,
      endRound,
      audio
   ) {
      this.category = category;
      this.gameDuration = gameDuration;
      this.unusedWords = unusedWords;
      this.el = gameElements;
      this.endRound = endRound;
      this.audio = audio;
      this.audio.source = this.audio.createBufferSource();
      this.audio.loop = true;
      this.audio.source.connect(this.audio.destination);
   }

   async initialize() {
      this.el.current_category.innerText = this.category;
      this.el.timer.innerText = this.gameDuration;

      try {
         const audioData = await this.loadAudioFile("audio/beep2.mp3");
         this.audio.source.buffer = audioData;
         this.audio.source.loop = true;

         console.log(this.audio);
      } catch (error) {
         console.error("Error loading audio file:", error);
      }
   }

   startTimer() {
      this.audio.source.start(0);
      this.paused = false;
      this.timerInterval = setInterval(() => {
         this.gameDuration -= 0.1;
         this.el.timer.innerText = Math.round(this.gameDuration, 1);

         if (this.gameDuration < 10) {
            this.audio.source.playbackRate.value = 2;
         } else if (this.gameDuration < 20) {
            this.audio.source.playbackRate.value = 1.5;
         } else if (this.gameDuration < 30) {
            this.audio.source.playbackRate.value = 1.25;
         }

         if (this.gameDuration <= 0) {
            clearInterval(this.timerInterval);
            this.endRound(this.usedWords);
            this.audio.source.stop();
         }
      }, 100);
   }

   pauseTimer() {
      if (this.paused) {
         this.startTimer();
      } else {
         this.paused = true;
         clearInterval(this.timerInterval);
         this.audio.source.stop();
      }
      return this.paused;
   }

   clearTimer() {
      clearInterval(this.timerInterval);
   }

   nextWord(skipped = false) {
      let currentWord = this.unusedWords[this.unusedWords.length - 1];
      this.unusedWords.pop();

      if (currentWord == undefined) {
         this.gameDuration = 0;
         alert("Ran out of words!");
         return;
      }

      this.el.current_word.innerText = currentWord;

      if (skipped) {
         this.usedWords.push(currentWord + " (skipped)");
      } else {
         this.usedWords.push(currentWord);
         if (this.gameDuration < 8) {
            this.gameDuration = 8;
         }
      }
   }

   skipWord() {
      if (this.gameDuration > 5) {
         this.gameDuration -= 5;
         this.nextWord(true);
      }
   }

   async loadAudioFile(url) {
      return new Promise(async (resolve, reject) => {
         try {
            const response = await fetch(url);
            if (!response.ok) {
               reject("Network response was not ok");
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
