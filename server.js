// require('dotenv/config')
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = 5000;
const Set = require('./models/set');

const app = express();

const ID = 'AKIAJVF5BTH4NIABWIOA';
const SECRET = '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';

mongoose.connect(
  'mongodb+srv://jaronk100:jaronk100@cluster0.h8oht.mongodb.net/listen-and-speak?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/play', async (req, res) => {
  const sets = await Set.find().sort({createdAt: 'desc'});
  res.render('main/index', {sets: sets});
})

//Get the form to create a set
app.get('/sets/create-set', (req, res) => {
  res.render('usersets/create-set');
});

//Index page of all user's sets
app.get('/sets', async (req, res) => {
  const sets = await Set.find().sort({createdAt: 'desc'});
  res.render('usersets/sets-index', {sets: sets})
})

//View single set when you click on it from sets-index (in addition to the link that show set during game play)
app.get('/sets/:id', async (req, res) => {
  const set = await Set.findById(req.params.id);
  res.render('usersets/set', {set: set})
})

//Post a new set to the db and redirect to sets index page
app.post('/sets', async (req, res) => {
  req.set = new Set();
  let set = req.set;
  let num = (Object.keys(req.body).length - 4)/2
  console.log(num);
  set.name = req.body.name
  set.descr = req.body.descr
  set.nativeLanguage = req.body.nativeLanguage
  set.targetLanguage = req.body.targetLanguage
  set.terms = [];
  for (let i = 0; i < num; i++) {
    if (req.body[`learnText${i}`] && req.body[`nativeText${i}`]) {
      set.terms[i] = {
        targetLangText: req.body[`learnText${i}`],
        nativeLangText: req.body[`nativeText${i}`]     
      } 
    }
  }

  try {
    set = await set.save();
    res.redirect('/sets')
  } catch (e) {
    res.send(e)
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
