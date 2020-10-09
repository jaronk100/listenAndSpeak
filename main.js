const grid = document.getElementById('grid');
const skipButton = document.getElementById('skip');
const practiceDiv = skipButton.parentNode;
const listSelect = document.getElementById('word-lists');
const orderSelect = document.getElementById('order-select');
const practiceLang = document.getElementById('practice-lang');
const startButton = document.getElementById('start-practice');
const form1 = document.getElementById('form-1');
const viewList = document.getElementById('view-list');
const createList = document.getElementById('create-list');
const ding = document.getElementById('speak-ding');
const pointsDiv = document.getElementById('points');
const pointsNum = document.getElementById('points-num');
const uiTop = document.getElementById('ui-top');
const instructions = document.getElementById('instructions');
import { data } from '/data.js';

let listNum = 0;
let wordNum = 0;
let pickedWord;
let practicing = false;
let showingGrid = false;

let points = 0;
let answersArr = [];

practiceDiv.style.display = 'none';

let selectedList = data[listNum];
let speechSynthLang = selectedList[0].nativeLanguage;
const displayInstructions = () => {
  if (practicing === true && showingGrid === false) {
    instructions.innerHTML = `<p id="listen">Listen to words in one language.</p><p id="say">Say them in your other langauge.</p>`;
  } else if (showingGrid === true) {
    instructions.innerHTML = `<p id = 'click-hear'>Click a card to hear it.</p>`;
  } else {
    instructions.innerHTML = `<p id='options-instr'>Select your options</p>`;
  }
};
displayInstructions();

const setList = (e) => {
  listNum = +e.target.value;
  selectedList = data[listNum];
  viewList.innerText = 'View Word List';
  if (grid.firstChild) {
    removeGrid();
    for (let i = 1; i < selectedList.length; i++) {
      createGrid(selectedList[i]);
    }
    viewList.innerText = 'Hide list';
  }
};
listSelect.addEventListener('change', setList);

let grammarList = [];
let concatList;

const createGrammarList = (listWord) => {
  grammarList.push(listWord);
  concatList = ''.concat(...grammarList);
};

let wordPlusBar;
for (let i = 1; i < data[0].length; i++) {
  if (practiceLang.value === 'en-US') {
    wordPlusBar = `${data[0][i].nativeLangText} | `;
  } else {
    wordPlusBar = `${data[0][i].targetLangText} | `;
  }
  createGrammarList(wordPlusBar);
}

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;

var listen = new window.SpeechRecognition();
console.log(listen);

var speechRecognitionList = new SpeechGrammarList();
var grammar = `#JSGF V1.0; grammar words; public <word> = ${concatList}`;
speechRecognitionList.addFromString(grammar, 1);
listen.grammars = speechRecognitionList;

practiceLang.value = 'en-US';
listen.lang = practiceLang.value; // = practicLang.value instead?
console.log(practiceLang.value);
listen.interimResults = false;
listen.maxAlternatives = 2;

//Init speech synth
const speechObject = new SpeechSynthesisUtterance();
//Init array of voices. Had problems when I didn't do this globally.
//I also 'call' this variable inside of functions. Necessary?
let voices = speechSynthesis.getVoices();

const randomWord = () => {
  wordNum = Math.floor(Math.random() * (selectedList.length - 1) + 1);
  pickedWord = selectedList[wordNum];
  readAndDisplay(pickedWord);
};

let word;
const nextWord = () => {
  //Restarts list
  ++wordNum;
  if (wordNum >= selectedList.length - 1) {
    wordNum = 1;
  }

  word = selectedList[wordNum];
  readAndDisplay(word);
};

const messageAndNext = (message) => {
  practiceDiv.removeChild(practiceDiv.firstChild);
  skipButton.classList.add('hidden');
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `<h1>${message}</h1>`;
  practiceDiv.appendChild(messageDiv);

  setTimeout(() => {
    if (wordOrder === 'random') {
      messageDiv.innerHTML = '';
      skipButton.classList.remove('hidden');
      randomWord();
    } else {
      messageDiv.innerHTML = '';
      skipButton.classList.remove('hidden');
      nextWord();
    }
  }, 2500);
};

const compareResults = (results, word) => {
  let correctWord;
  if (practiceLang.value === 'en-US') {
    correctWord = word.nativeLangText;
  } else {
    correctWord = word.targetLangText;
  }
  if (results[0][0].transcript.toUpperCase() == correctWord.toUpperCase()) {
    answersArr.push(1);
    let last3Answers = answersArr.slice(Math.max(answersArr.length - 3, 0));
    var last3Sum = last3Answers.reduce(function (acc, num) {
      return acc + num;
    }, 0);
    let rightMessage;
    if (last3Sum >= 3) {
      points = points + 300;
      rightMessage = 'Streak bonus: +300!';
      answersArr = [];
    } else {
      points = points + 100;
      rightMessage = 'You got it right!';
    }
    messageAndNext(rightMessage);
    pointsDiv.style.display = 'flex';
    pointsNum.innerText = `${points}`;
  } else {
    const wrongMessage = 'Oops, better luck next time';
    messageAndNext(wrongMessage);
    //find the index number of the list item that matches the argument 'word'
    let wordIndex = selectedList.indexOf(word);
    answersArr.push(0);
    var wordOccurrences = selectedList.reduce(function (acc, currentWord) {
      return (
        acc +
        (selectedList[wordIndex].targetLangText === currentWord.targetLangText)
      );
    }, 0);
    console.log(results[0][0].transcript);
  }
};

let wordOrder;
orderSelect.addEventListener('change', () => {
  wordOrder = orderSelect.value;
});

listen.onend = () => {
  listen.stop();
};

listen.addEventListener('result', (e) => {
  if (wordOrder === 'random') {
    compareResults(e.results, pickedWord);
  } else {
    compareResults(e.results, word);
  }
});

listen.onnomatch = () => {
  console.log('No match');
  const noHear = document.createElement('p');
  noHear.innerText = "Sorry, didn't hear that";
  practiceDiv.appendChild(noHear);
};

//When would speech recognition throw an error?
listen.addEventListener('onError', () => {
  const errMess = document.createElement('p');
  errMess.innerText = 'Opps. Something went wrong.';
  practiceDiv.appendChild(errMess);
});

const startPractice = (e) => {
  e.preventDefault();
  //Should I make this a conditional call, check to see if clearing is needed?
  practicing = true;
  practiceDiv.style.display = 'flex';
  if (practiceDiv.childNodes[1]) {
    practiceDiv.removeChild(practiceDiv.childNodes[0]);
  }
  removeGrid();
  startButton.className = 'hidden';
  createList.className = 'hidden';

  viewList.innerText = 'View Word List';
  // User chooses random or in order in settings
  if (wordOrder === 'random') {
    randomWord();
  } else {
    nextWord();
  }

  if (!form1.classList.contains('hidden')) {
    form1.classList.add('hidden');
  } else {
    form1.classList = '';
  }
};

const removeGrid = () => {
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
};

// Creates word list grid.
const createGrid = (word) => {
  const box = document.createElement('div');
  let { targetLangText, pic, nativeLangText } = word;
  nativeLangText = nativeLangText[0].toUpperCase() + nativeLangText.slice(1);
  targetLangText = targetLangText[0].toUpperCase() + targetLangText.slice(1);

  speechObject.text = targetLangText;

  box.innerHTML = `        
        <p class="box-text">${targetLangText}</p> 
        <img src="/img/${pic}">
        <p class="box-text">${nativeLangText}</p> 
    `;

  box.classList.add('box');

  box.addEventListener('click', () => {
    speechObject.text = targetLangText;
    voices = speechSynthesis.getVoices();
    console.log(voices);
    speechObject.voice = voices.find(
      (voice) => voice.name === selectedList[0].targetLanguageSynth
    );
    speechSynthesis.speak(speechObject);
  });

  grid.appendChild(box);
};

const displayGridPractice = () => {
  listen.stop();
  practiceDiv.style.display = 'none';

  if (!grid.classList.contains('showingList')) {
    showingGrid = true;
    displayInstructions();
    pointsDiv.style.display = 'none';
    const backToPractice = document.createElement('button');
    backToPractice.id = 'back-to-practice';
    backToPractice.innerText = 'Back To Practice';
    uiTop.appendChild(backToPractice);
    backToPractice.addEventListener('click', returnToPractice);

    for (let i = 1; i < data[listNum].length; i++) {
      createGrid(data[listNum][i]);
    }
    grid.classList.add('showingList');
    if (practicing) {
      viewList.innerText = 'Back to Practice';
    } else {
      viewList.innerText = 'Hide list';
    }
  } else {
    returnToPractice();
  }
};

const returnToPractice = () => {
  showingGrid = false;
  displayInstructions();
  removeGrid();
  grid.classList = '';
  viewList.innerText = 'View Word List';
  practiceDiv.removeChild(practiceDiv.firstChild);
  practiceDiv.style.display = 'flex';
  pointsDiv.style.display = 'flex';
  uiTop.removeChild(uiTop.lastChild);
  if (wordOrder === 'random') {
    randomWord();
  } else {
    nextWord();
  }
};

const displayGridNotPractice = () => {
  if (!grid.classList.contains('showingList')) {
    showingGrid = true;
    displayInstructions();
    for (let i = 1; i < data[listNum].length; i++) {
      createGrid(data[listNum][i]);
    }
    grid.classList.add('showingList');
    viewList.innerText = 'Hide List';
  } else {
    showingGrid = false;
    displayInstructions();
    removeGrid();
    grid.classList = '';
    viewList.innerText = 'View Word List';
  }
};

//During practice, display one word and say it, start speech recognition; message
const readAndDisplay = (word) => {
  displayInstructions();
  if (points < selectedList.length * 40) {
    console.log(points);
    let { targetLangText, pic, nativeLangText } = word;
    nativeLangText = nativeLangText[0].toUpperCase() + nativeLangText.slice(1);
    targetLangText = targetLangText[0].toUpperCase() + targetLangText.slice(1);

    // Get an array of voice objects
    voices = speechSynthesis.getVoices();
    //Find voice object with a key/value that matches the array's voice name
    if (practiceLang.value === 'en-US') {
      speechObject.text = targetLangText;
      speechObject.voice = voices.find(
        (voice) => voice.name === selectedList[0].targetLanguageSynth
      );
    } else {
      speechObject.text = nativeLangText;
      speechObject.voice = voices.find(
        (voice) => voice.name === selectedList[0].nativeLanguage
      );
    }

    speechSynthesis.speak(speechObject);

    const practiceBox = document.createElement('div');

    let text1;
    let text2;
    speechSynthLang = practiceLang.value;
    if (speechSynthLang === selectedList[0].nativeLanguage) {
      text1 = targetLangText;
      text2 = nativeLangText;
    } else {
      text1 = nativeLangText;
      text2 = targetLangText;
    }

    if (points < selectedList.length * 20) {
      practiceBox.innerHTML = `        
      <p class="box-text">${text1}</p> 
      <img src="/img/${pic}">
      <p class="box-text">${text2}</p> 
  `;
    } else {
      practiceBox.innerHTML = `        
          <p class="box-text">${text1}</p> 
          <img src="/img/${pic}">
          <p class="box-text"></p> 
      `;
    }

    practiceBox.id = 'practice-box';
    practiceBox.classList.add('practice-box');
    practiceDiv.insertBefore(practiceBox, skipButton);

    if (skipButton.classList.contains('hidden')) {
      skipButton.classList.remove('hidden');
    }
  } else {
    const roundMessage = 'You Won!';
    practiceDiv.removeChild(practiceDiv.firstChild);
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<h1>${roundMessage}</h1>`;
    practiceDiv.appendChild(messageDiv);
    practicing = false;
    // selectedList = data[listNum];
  }
};

const showCreateForm = () => {
  createList.style.display = 'block';
};

//-----------------------RESOLVED----------------------------
//  -----I made the data an array of arrays, and that way the value of the selected list can easily be made into a number to refer to an array in the data set. Just have to make the string a number with the + sign.
//How do I get the value of the selected list from the listSelect eventListener to the viewList function. I can't put the listener inside the function, because it would only listen once that function is called...or could I put it at the beginning of the function in order to have it work on the rest? I don't think so, because I need a listener on that function for the gameplay, not just to display the list...
skipButton.addEventListener('click', () => {
  listen.stop();
  practiceDiv.removeChild(practiceDiv.firstChild);
  if (wordOrder === 'random') {
    randomWord();
  } else {
    nextWord();
  }
});

startButton.addEventListener('click', startPractice);
viewList.addEventListener('click', (e) => {
  e.preventDefault();
  if (practicing) {
    displayGridPractice();
  } else {
    displayGridNotPractice();
  }
});

createList.addEventListener('click', showCreateForm);

speechObject.addEventListener('end', (e) => {
  if (grid.firstChild) {
    return;
  } else {
    ding.play();
    listen.lang = practiceLang.value;
    listen.start();
  }
});

// window.addEventListener('resize', () => {
//   console.log(window.innerWidth);
// });

//todo: DONE Bare bones styling (working styling)
//todo: DONE word list link, to a grid or just the words and defs
//todo: DONE Initialize Speech Synthesis and recognition
//todo: Word Grid/List
//  -----DONE Make word grid produce sounds on click
//  -----DONE Fix first time wrong voice problem
//  -----DONE viewList toggle word grid, not reproduce it multiple times.
//todo: DONE How to iterate over the array?
//  ----- .map() inside of a Math.random() ???
//  ----- for loop???
//  ----- .forEach() ??? Google .map() vs. .forEach() vs for loop
//  -----DONE Make grid/list appear in the right place, not at end; basic style.
//todo: DONE Factor out data to separate file
//todo: DONE connect View Word list button to selected word set
//todo: DONE Set default word list
//todo: DONE function to play sound, show word and pic in UI
//  -----Cut out the box event listener
//  -----Initialize Speech recognition
//  -----Make event listener for speech, check for match
//todo: DONE If word list is open and user selects another list, what should happen?
//todo: DONE compare results function
//  ✓-----Remove word card from UI
//  ✓-----Display message
//  ✓-----Remove words user gets right from selectedList.
//  ✓-----Make round stop when all removed.
//  ✓-----Restore list for next round.
//  ✓-----What happens if user views list while practicing?
//  ✓----------As of now it only shows words they haven't gotten right yet
//  ✓----------When I make user practice wrong words more, multiple times in grid?
//  ✓-----What if a user clicks 'view list' at the end of the round? (empty list)
//  ✓-----Make user practice wrong words more times, set max num of reps
//todo: DONE Timing between readAndDisplay() and listen.start(): listening too soon?
//todo: DONE Capitalize senteces in grid
//todo: DONE sound to indicate listening
//todo: DONE capitalize first letter of text (lower case in data.js for results matching)
//todo: DONE Make speech recognition more accurate
//  -----✓ onSpeechEnd event listener instead of listen.stop() in other function.
//  -----✓ onError listener. What errors would it need to handle? Check number guessing app.
//  -----✓ If user doesn't say anything, how to go to next card? Next/skip arrow button?
//  ----------Couldn't find way to show message after silence, so I made the button.
//todo: DONE apply text flip in readAndDisplay AND speechObject language AND listen language like I did to createGrid()
//todo: DONE Take out word elimination, only in random mode now? Removes words from grid too.

//todo: DONE User presses "View List" while practicing
//  -----✓Hide practice card
//  -----✓Make "Click a card to hear in targetLanguage
//  -----✓Make button say "Back to Practice"
//  -----✓Make separate callbacks for display grid when practicing and not practicing

//todo: DONE Instead of adding or removing instances in the array, have a counter and a point goal that move user to next round
//  -----✓Round 1: Hear Spanish; say English, Spanish and English visible.
//  -----✓Round 2: Hear Spanish; say English, Spanish visible.
//  -----Round 3: Hear English; say Spanish.
//  ----------Streak bonus: default is each word twice per round (number of terms * 100 * 2)
//  ----------Every 3rd question right in a row gives triple points
//todo: Alt text for some trouble phrases, 'Ella viene a casa las 8:00'
//todo: Hide points when practicing is false
//todo: Something happens between rounds: Diff message? Color change? Animation/image? Sound?
//  -----More points per question? (if so, change streak bonus too)
//todo: Message when user finishes:
//  -----Vocabulary is best acquired in context.
//  -----This tool is meant to help you bootstrap yourself into basic comprehension.
//  -----Please, go read, listen, and talk to people!
//todo: Show rounds practiced and total points
//  -----Sound/music? Funny pic?

//--------------------FINAL UI FUNCTIONALITY AND BACK END -----------------------
//todo: Gear icon to bring options modal, side toggle. Hangman? Number game?
//todo: Secondary translation? (eight vs 8, no match)
//todo: Form to enter a custom list of words, pics. Custom audio too?
//todo: Sign in/out
//todo: Athentication: authenticated users can create sets and search other users sets. Unauthenticated users can only use mine.
//todo: Authorization to delete/edit one's own sets but not others.
//todo: Set Search feature (get request)
//todo: Backend setup: database template, CRUD, etc. Scale/cost?
//todo: Should I make a call to DB for my default word lists instead of data.js?
//todo: Notification of mic use.

//??? What is the relationship of hoisting & scope to let and const?
//??? When do we need to return? Diff in arrow functions?
