const wrapper = document.getElementById('wrapper')
const prevInputsList = document.getElementById('prev-inputs')
const prevResultsList = document.getElementById('prev-results')

const defaultRandomizer = { min: 1, max: 9 }

const prevResultsLocalStorageKey = 'prevResults'
let prevResults = []
try { prevResults = JSON.parse(localStorage.getItem(prevResultsLocalStorageKey)) || [] } catch { }
const savePrevResults = prevResults => localStorage.setItem(prevResultsLocalStorageKey, JSON.stringify(prevResults))

const randomizersLocalStorageKey = 'randomizers'
let randomizers = []
try { randomizers = JSON.parse(localStorage.getItem(randomizersLocalStorageKey)) || [] } catch { }
if (randomizers.length === 0) {
  const lastResult = prevResults.length ? prevResults[0] : defaultRandomizer
  randomizers.push(lastResult)
}
const saveRandomizers = prevResults => localStorage.setItem(randomizersLocalStorageKey, JSON.stringify(prevResults))

const findParent = (element, className) => {
  while (!element.classList.contains(className)) element = element.parentElement
  return element
}

const allRandomizers = _ => document.querySelectorAll('.randomizer')

const toggleRemoveButton = _ => {
  const randomizers = allRandomizers()

  for (const randomizer of randomizers) {
    const removeButton = randomizer.querySelector('.remove')
    removeButton.style.display = randomizers.length > 1 ? 'inline-block' : 'none'
  }
}

const generateNumber = event => {
  saveRandomizers()

  const randomizer = findParent(event.target, 'randomizer')

  const min = +randomizer.querySelector('.min-input').value
  const max = +randomizer.querySelector('.max-input').value
  const result = rand(min, max)

  const resultText = randomizer.querySelector('.result-text')
  resultText.innerText = result
  resultText.classList.remove('update-animation')
  resultText.offsetWidth
  resultText.classList.add('update-animation')

  prevResults.unshift({ min, max, result })
  prevResults = prevResults.slice(0, 100)
  savePrevResults(prevResults)
  renderPrevs()
}

const generateNumberOnEnter = event => {
  if (event.key === 'Enter') generateNumber(event)
}

const selectAll = event => event.target.select()

const addRandomizer = event => {
  const randomizer = findParent(event.target, 'randomizer')
  randomizer.parentNode.insertBefore(generateRandomizer(defaultRandomizer), randomizer.nextSibling)
  toggleRemoveButton()
  saveRandomizers()
}

const removeRandomizer = event => {
  const randomizer = findParent(event.target, 'randomizer')
  randomizer.remove()
  toggleRemoveButton()
  saveRandomizers()
}

const addRandomizerListeners = randomizer => {
  randomizer.querySelector('.generate-btn').addEventListener('click', generateNumber)
  randomizer.querySelector('.min-input').addEventListener('keydown', generateNumberOnEnter)
  randomizer.querySelector('.max-input').addEventListener('keydown', generateNumberOnEnter)
  randomizer.querySelector('.min-input').addEventListener('click', selectAll)
  randomizer.querySelector('.max-input').addEventListener('click', selectAll)
  randomizer.querySelector('.buttons > .add').addEventListener('click', addRandomizer)
  randomizer.querySelector('.buttons > .remove').addEventListener('click', removeRandomizer)
}

const generateRandomizer = data => {
  const randomizer = document.createElement('div')
  randomizer.className = 'randomizer'
  randomizer.innerHTML = `
    <div class='buttons'>
    <a class='remove'>➖</a>
    <a class='add'>➕</a>
    </div>
    <p><label>Min</label><input type="number" class="min-input" /></p>
    <p><label>Max</label><input type="number" class="max-input" /></p>
    <button class="generate-btn">Generate!</button>
    <p><span class="result-text"></span></p>
  `

  randomizer.querySelector('.min-input').value = data.min
  randomizer.querySelector('.max-input').value = data.max

  addRandomizerListeners(randomizer)

  return randomizer
}

for (const randomizer of randomizers) {
  wrapper.appendChild(generateRandomizer(randomizer))
  toggleRemoveButton()
}

const inputToElement = result => `<tr data-min=${result.min} data-max=${result.max}><td>${result.min} ⬌ ${result.max}</td></tr>`
const resultToElement = result => `<tr data-min=${result.min} data-max=${result.max} data-result=${result.result}><td>${result.min} ⬌ ${result.max}</td><td> = </td><td>${result.result}</td></tr>`

const renderPrevs = function () {
  prevInputsList.innerHTML  = [...new Set(prevResults.map(inputToElement))].join('')
  prevResultsList.innerHTML = prevResults.map(resultToElement).join('')
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const loadResult = event => {
  const el = event.target
  if (el.tagName == 'TD') el = el.parentElement
  if (el.tagName == 'TABLE') return

  // allRandomizers
  // const randomizers = document.querySelectorAll('.randomizer')

  // minInput.value = el.getAttribute('data-min')
  // maxInput.value = el.getAttribute('data-max')
  // resultText.innerText = el.getAttribute('data-result')
}

renderPrevs()

prevInputsList.addEventListener('click', loadResult)
prevResultsList.addEventListener('click', loadResult)
