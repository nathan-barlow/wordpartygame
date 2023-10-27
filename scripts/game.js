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
      this.audio.timer.loop = true;
   }

   initialize() {
      this.el.current_category.innerText = this.category;
      this.el.timer.innerText = this.gameDuration;
   }

   startTimer() {
      this.audio.timer.play();
      this.paused = false;
      this.timerInterval = setInterval(() => {
         this.gameDuration -= 0.1;
         this.el.timer.innerText = Math.round(this.gameDuration, 1);

         if (this.gameDuration < 10) {
            this.audio.timer.playbackRate = 2;
         } else if (this.gameDuration < 20) {
            this.audio.timer.playbackRate = 1.5;
         } else if (this.gameDuration < 30) {
            this.audio.timer.playbackRate = 1.25;
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
      } else {
         this.paused = true;
         clearInterval(this.timerInterval);
         this.audio.timer.pause();
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
}
