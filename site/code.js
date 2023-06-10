const wrapper = document.getElementById('wrapper')
const prevInputsList = document.getElementById('prev-inputs')
const prevResultsList = document.getElementById('prev-results')

const defaultRandomizer = { min: 1, max: 9 }

const allRandomizers = _ => [...document.querySelectorAll('.randomizer')]

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
const saveRandomizers = _ => {
  const data = allRandomizers().map(randomizer => {
    const min = +randomizer.querySelector('.min-input').value
    const max = +randomizer.querySelector('.max-input').value
    return { min, max }
  })
  localStorage.setItem(randomizersLocalStorageKey, JSON.stringify(data))
}

const findParent = (element, className) => {
  while (!element.classList.contains(className)) element = element.parentElement
  return element
}

const toggleRemoveButton = _ => {
  const randomizers = allRandomizers()

  for (const randomizer of randomizers) {
    const removeButton = randomizer.querySelector('.remove')
    removeButton.style.display = randomizers.length > 1 ? 'inline-block' : 'none'
  }
}

const randomizerInputs = randomizer => ['.min-input', '.max-input'].map(selector => randomizer.querySelector(selector))

const updateInputSizes = event => {
  const randomizer = findParent(event.target, 'randomizer')
  const inputs = randomizerInputs(randomizer)
  const inputSize = Math.max(...inputs.map(input => input.value.length + 1), 10)

  for (const input of inputs) {
    input.style.width = `${inputSize}ch`
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
  const inputs = randomizerInputs(randomizer)

  for (const input of inputs) {
    input.addEventListener('keydown', generateNumberOnEnter)
    input.addEventListener('click', selectAll)
    input.addEventListener('input', updateInputSizes)
  }

  randomizer.querySelector('.generate-btn').addEventListener('click', generateNumber)
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
    <p class='row'><label>Min</label><input type="number" class="min-input" /></p>
    <p class='row'><label>Max</label><input type="number" class="max-input" /></p>
    <p class='row'><button class="generate-btn">Generate!</button><span class="result-text"></span></p>
  `

  randomizer.querySelector('.min-input').value = data.min
  randomizer.querySelector('.max-input').value = data.max

  updateInputSizes({ target: randomizer })
  addRandomizerListeners(randomizer)

  return randomizer
}

for (const randomizer of randomizers) {
  wrapper.appendChild(generateRandomizer(randomizer))
}
toggleRemoveButton()

const inputToElement = result => `<tr data-min=${result.min} data-max=${result.max}><td>${result.min} ⬌ ${result.max}</td></tr>`
const resultToElement = result => `<tr data-min=${result.min} data-max=${result.max} data-result=${result.result}><td>${result.min} ⬌ ${result.max}</td><td> = </td><td>${result.result}</td></tr>`

const renderPrevs = function () {
  prevInputsList.innerHTML  = [...new Set(prevResults.map(inputToElement))].join('')
  prevResultsList.innerHTML = prevResults.map(resultToElement).join('')
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const loadResult = event => {
  let el = event.target
  if (el.tagName == 'TD') el = el.parentElement
  if (el.tagName == 'TABLE') return

  const min = +el.getAttribute('data-min')
  const max = +el.getAttribute('data-max')
  const result = el.getAttribute('data-result')

  let randomizer = allRandomizers().find(randomizer => {
    const r_min = +randomizer.querySelector('.min-input').value
    const r_max = +randomizer.querySelector('.max-input').value
    return r_min === min && r_max === max
  })

  if (!randomizer) {
    randomizer = generateRandomizer({ min, max })
    wrapper.appendChild(randomizer)
    toggleRemoveButton()
    saveRandomizers()
  }

  randomizer.querySelector('.min-input').value = min
  randomizer.querySelector('.max-input').value = max
  randomizer.querySelector('.result-text').innerText = result
}

renderPrevs()

prevInputsList.addEventListener('click', loadResult)
prevResultsList.addEventListener('click', loadResult)
