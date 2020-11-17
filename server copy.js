// THIS VERSION OF SERVER.JS HAS MY ATTEMPT AT USING AWS FOR IMAGE HOSTING

// require('dotenv/config')
const express = require('express');
const mongoose = require('mongoose');
const port = 5000;
const Set = require('./models/set');
const fs = require('fs');
const expressUpload = require('express-fileupload');
const AWS = require('aws-sdk');
const { S3 } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');

const app = express();

const ID = 'AKIAJVF5BTH4NIABWIOA';
const SECRET = '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';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
})

mongoose.connect(
  'mongodb+srv://jaronk100:jaronk100@cluster0.h8oht.mongodb.net/listen-and-speak?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(fileUpload())
// app.use(express.bodyParser())

//Get the form to create a set
app.get('/sets/create-set', (req, res) => {
  // const sets = await Set.find().sort({createdAt: 'desc'})
  const sets = 'This is where the sets go';
  res.render('usersets/create-set', { sets: sets });
});

app.get('/sets', (req, res) => {
  res.send('This is the index page.')
})

//Post a new set to the db and redirect to index page
app.post('/sets', (req, res) => {
  let myFile = req.files.pic1.name.split(".")
  const fileType = myFile[myFile.length -1]
  
  req.files.pic1.name = `${uuidv4()}.${fileType}`;
  console.log(req.files.pic1.name)

  const uploadFile = (file) => {
      // const fileContent = fs.readFileSync(file);
  
      const params = {
          Bucket: 'listen-and-speak',
          Key: file.name,
          Body: file,
          ACL: 'public-read'
      };

      let dataLocation;
      s3.upload(params, function(err, data) {
          if(err) {
              throw err;
          }
          console.log(`File uploaded successfully. ${data.Location}`);
          dataLocation = `${data.location}`
      });
  };
  
  uploadFile(req.files.pic1);

  let name = req.body.name
  let nativeLanguage = req.body.nativeLanguage
  let targetLanguageSynth = req.body.targetLanguageSynth
  let targetLanguageRecog = req.body.targetLanguageRecog
  let terms = {
      targetLangText: req.body.targetLangText,
      pic: dataLocation,
      nativeLangText: req.body.nativeLangText
  }
  
  let setData = {name: name, nativeLanguage: nativeLanguage, targetLanguageSynth: targetLanguageSynth, targetLanguageRecog: targetLanguageRecog, terms: terms}
  Set.create(setData, (err, newSet) => {
      if(err) {
          console.log(err)
      } else {
          console.log(newSet)
          res.redirect('/sets')
      }
  })  

})

app.listen(port, () => {
  console.log('App running on port 5000');
});
