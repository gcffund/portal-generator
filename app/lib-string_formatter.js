const _ = require('lodash');

function getRegexpWordString(words) { return `(\\b${words.join('\\b|\\b')}\\b)`; }

let lowerCaseRegexp;
let upperCaseRegexp;


function setLowerCaseWords(arrayOfWords) {
  lowerCaseRegexp = new RegExp(getRegexpWordString(arrayOfWords), 'gi');
}

function setUpperCaseWords(arrayOfWords) {
  upperCaseRegexp = new RegExp(getRegexpWordString(arrayOfWords), 'gi');
}


function getStartCase(inputString) {
  let outputString = _.startCase(inputString.trim());
  outputString = outputString.replace(/$\./, '');
  if (lowerCaseRegexp) {
    outputString = outputString.replace(lowerCaseRegexp, match => match.toLowerCase());
  }
  if (upperCaseRegexp) {
    outputString = outputString.replace(upperCaseRegexp, match => match.toUpperCase());
  }

  return outputString;
}

module.exports = { setLowerCaseWords, setUpperCaseWords, getStartCase };
