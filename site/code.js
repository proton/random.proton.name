const wrapper = document.getElementById('wrapper')
const prevInputsList = document.getElementById('prev-inputs')
const prevResultsList = document.getElementById('prev-results')

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const colors = [
  '#ffa500', '#ffffff', '#f9dc24', '#ff6347', '#e0e0e0', '#00bcd4', '#8e44ad',
  '#01b95d', '#e1f7d5', '#c9c9ff', '#f1cbff', '#afd275', '#272b2c',
]
const randomColor = _ => colors[rand(0, colors.length - 1)]

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
    const min   = +randomizerMin(randomizer).value
    const max   = +randomizerMax(randomizer).value
    const name  = randomizerName(randomizer).innerText
    const color = randomizerColor(randomizer)
    return { min, max, name, color }
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

const randomizerMin    = randomizer => randomizer.querySelector('.min-input')
const randomizerMax    = randomizer => randomizer.querySelector('.max-input')
const randomizerRezult = randomizer => randomizer.querySelector('.result-text')
const randomizerName   = randomizer => randomizer.querySelector('.randomizer-name')
const randomizerColor  = randomizer => window.getComputedStyle(randomizer).backgroundColor

const setRandomizerColor = (randomizer, color) => {
  randomizer.style.backgroundColor = color
}

const randomizerInputs = randomizer => [randomizerMin(randomizer), randomizerMax(randomizer)]

const updateInputSizes = event => {
  const randomizer = findParent(event.target, 'randomizer')
  const inputs     = randomizerInputs(randomizer)
  const inputSize  = Math.max(...inputs.map(input => input.value.length + 1), 10)

  for (const input of inputs) {
    input.style.width = `${inputSize}ch`
  }
}

const generateNumber = event => {
  saveRandomizers()

  const randomizer = findParent(event.target, 'randomizer')

  const min    = +randomizerMin(randomizer).value
  const max    = +randomizerMax(randomizer).value
  const result = rand(min, max)

  const resultText = randomizerRezult(randomizer)
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

const changeColor = event => {
  const randomizer = findParent(event.target, 'randomizer')
  setRandomizerColor(randomizer, randomColor())
  saveRandomizers()
}

const removeRandomizer = event => {
  const randomizer = findParent(event.target, 'randomizer')
  randomizer.remove()
  toggleRemoveButton()
  saveRandomizers()
}

const renameRandomizer = event => {
  const target     = event.target
  const randomizer = findParent(target, 'randomizer')
  const nameTag    = randomizerName(randomizer)

  if (target !== randomizer && target !== nameTag) return

  const newName     = prompt('Enter new name', nameTag.innerText)
  nameTag.innerText = newName
  saveRandomizers()
}

const addRandomizerListeners = randomizer => {
  const inputs = randomizerInputs(randomizer)

  for (const input of inputs) {
    input.addEventListener('keydown', generateNumberOnEnter)
    input.addEventListener('click', selectAll)
    input.addEventListener('input', updateInputSizes)
  }

  randomizer.querySelector('.left-buttons > .changeColor').addEventListener('click', changeColor)
  randomizer.querySelector('.generate-btn').addEventListener('click', generateNumber)
  randomizer.querySelector('.buttons > .add').addEventListener('click', addRandomizer)
  randomizer.querySelector('.buttons > .remove').addEventListener('click', removeRandomizer)

  randomizer.addEventListener('dblclick', renameRandomizer)
}

const generateRandomizer = data => {
  const randomizer = document.createElement('div')
  randomizer.className = 'randomizer'
  randomizer.innerHTML = `
    <div class='left-buttons'>
    <a class='changeColor' alt='Change background color'>❀</a>
    </div>
    <span class='randomizer-name'>${data.name || ''}</span>
    <div class='buttons'>
    <a class='remove'>➖</a>
    <a class='add'>➕</a>
    </div>
    <p class='row'><label>Min</label><input type="number" class="min-input" /></p>
    <p class='row'><label>Max</label><input type="number" class="max-input" /></p>
    <p class='row'><button class="generate-btn">Generate!</button><span class="result-text"></span></p>
  `

  randomizerMin(randomizer).value = data.min
  randomizerMax(randomizer).value = data.max
  setRandomizerColor(randomizer, data.color || randomColor())

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

const loadResult = event => {
  let el = event.target
  if (el.tagName == 'TD') el = el.parentElement
  if (el.tagName == 'TABLE') return

  const min    = +el.getAttribute('data-min')
  const max    = +el.getAttribute('data-max')
  const result = el.getAttribute('data-result')

  let randomizer = allRandomizers().find(randomizer => {
    const r_min = +randomizerMin(randomizer).value
    const r_max = +randomizerMax(randomizer).value
    return r_min === min && r_max === max
  })

  if (!randomizer) {
    randomizer = generateRandomizer({ min, max })
    wrapper.appendChild(randomizer)
    toggleRemoveButton()
    saveRandomizers()
  }

  randomizerMin(randomizer).value        = min
  randomizerMax(randomizer).value        = max
  randomizerRezult(randomizer).innerText = result
}

renderPrevs()

prevInputsList.addEventListener('click', loadResult)
prevResultsList.addEventListener('click', loadResult)

dragula(
  [document.querySelector('#wrapper')], {
    moves: function (el, source, handle, sibling) {
      return handle.classList.contains('randomizer')
    }
  }
)
