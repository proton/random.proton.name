
const localStorageKey = 'prevResults'

const minInput = document.getElementById('min-input')
const maxInput = document.getElementById('max-input')
const generateBtn = document.getElementById('generate-btn')
const resultText = document.getElementById('result-text')

const prevInputsList = document.getElementById('prev-inputs')
const prevResultsList = document.getElementById('prev-results')

let prevResults = JSON.parse(localStorage.getItem(localStorageKey)) || []

const lastResult = prevResults ? prevResults[0] : { min: 1, max: 9 }
minInput.value   = lastResult.min
maxInput.value   = lastResult.max

const inputToElement = result => `<tr data-min=${result.min} data-max=${result.max}><td>${result.min} ⬌ ${result.max}</td></tr>`
const resultToElement = result => `<tr data-min=${result.min} data-max=${result.max} data-result=${result.result}><td>${result.min} ⬌ ${result.max}</td><td> = </td><td>${result.result}</td></tr>`

const renderPrevs = function () {
  prevInputsList.innerHTML  = [...new Set(prevResults.map(inputToElement))].join('')
  prevResultsList.innerHTML = prevResults.map(resultToElement).join('')
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const loadResult = function (event) {
  let el = event.target
  if (el.tagName == 'TD') el = el.parentElement
  if (el.tagName == 'TABLE') return

  minInput.value = el.getAttribute('data-min')
  maxInput.value = el.getAttribute('data-max')
  resultText.innerText = el.getAttribute('data-result')
}

const generateNumber = function () {
  const min = +minInput.value
  const max = +maxInput.value
  const result = rand(min, max)

  resultText.innerText = result
  resultText.classList.remove('update-animation')
  resultText.offsetWidth
  resultText.classList.add('update-animation')

  prevResults.unshift({ min, max, result })
  prevResults = prevResults.slice(0, 100)
  localStorage.setItem(localStorageKey, JSON.stringify(prevResults))
  renderPrevs()
}

const selectAll = function (event) {
  const el = event.target
  el.select()
}

renderPrevs()
generateBtn.addEventListener('click', generateNumber)
prevInputsList.addEventListener('click', loadResult)
prevResultsList.addEventListener('click', loadResult)
minInput.addEventListener('click', selectAll)
maxInput.addEventListener('click', selectAll)
