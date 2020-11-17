const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    descr: {
        type: String,
    },
    nativeLanguage: {
        type: String,
        required: true
    },
    targetLanguage: {
        type: String,
        required: true
    },
    // targetLanguageRecog: {
    //     type: String,
    //     required: true
    // },
    terms: [
        {
            targetLangText: {
                type: String,
                required: true
            },
            nativeLangText: {
                type: String,
                required: true
            }
        }
    ]

});

module.exports = mongoose.model('Set', setSchema)