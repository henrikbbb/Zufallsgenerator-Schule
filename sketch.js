let schueler = []
let kursName = 'Kursname'
let amountGroups = 3
let preset

function setup() {
	createPreset()
	noCanvas()
	build()
}

function createPreset() {
	preset = {}
	preset['Kursname'] = 'Kurs1'
	preset['Schuelernamen'] = []
	for (let i = 1; i < 25; i++) {
		preset['Schuelernamen'].push('Name' + str(i))
	}
}

function build(){
	let scrollY = window.scrollY

	removeElements()

	if (schueler.length == 0){
		let buttonLoadFile = createButton('Klassenliste laden')
		buttonLoadFile.addClass('buttonWithText')
		buttonLoadFile.mousePressed(() => {
			document.getElementById('fileInput').click()
		})

		let fileInput = createFileInput(loadFile)
		fileInput.attribute('hidden', true)
		fileInput.id('fileInput')

		createElement('br')
		createElement('br')

		let buttonSavePreset = createButton('Vorlage Klassenliste speichern')
		buttonSavePreset.addClass('buttonWithText')
		buttonSavePreset.mousePressed(() => {
			save(preset, 'Vorlage Klassenliste.json')
		})
	}

	if (schueler.length){
		createElement('h1', kursName)

		let divContainerColumns = createDiv()
		divContainerColumns.addClass('containerColumns')

		let divColumnLeft = createDiv()
		divColumnLeft.addClass('containerColumnLeft')
		divColumnLeft.parent(divContainerColumns)

		let headerLeft = createElement('h2', 'Auswahl')
		headerLeft.parent(divColumnLeft)

		for (let s of schueler){
			s.createElementsLeft(divColumnLeft)
		}

		let divColumnRight = createDiv()
		divColumnRight.addClass('containerColumnRight')
		divColumnRight.parent(divContainerColumns)

		if (groupsExist()) {
			let headerRight = createElement('h2', 'Gruppen')
			headerRight.parent(divColumnRight)

			for (let i = 0; i < amountGroups; i++) {
				for (let s of schueler) {
					if (s.group == i && s.enabled) {
						s.createElementsRight(divColumnRight)
					}
				}
			}
		}

		createElement('hr')
		
		let buttonSelectSchueler = createButton('neue Wahl')
		buttonSelectSchueler.addClass('buttonWithText')
		buttonSelectSchueler.mousePressed(selectSchueler)
		
		let buttonClearSelected = createButton('Wahl zurücksetzen')
		buttonClearSelected.addClass('buttonWithText')
		buttonClearSelected.mousePressed(() => {
			for (let s of schueler) {
				s.selected = false
			}
			build()
		})
		
		createElement('br')
		createElement('br')

		let buttonCreateGroups = createButton('Gruppen erstellen')
		buttonCreateGroups.addClass('buttonWithText')
		buttonCreateGroups.mousePressed(createGroups)

		let buttonClearGroups = createButton('Gruppen zurücksetzen')
		buttonClearGroups.addClass('buttonWithText')
		buttonClearGroups.mousePressed(() => {
			for (let s of schueler) {
				s.group = undefined
			}
			build()
		})

		//createElement('br')

		createElement('span', ' Anzahl Gruppen: ')
		let inputAmountGroups = createInput(amountGroups, 'number')
		inputAmountGroups.attribute('min', 2)
		inputAmountGroups.attribute('max', schueler.length)
		inputAmountGroups.input(() => {
			if (inputAmountGroups.value()) {
				amountGroups = int(inputAmountGroups.value())
				build()
			}
		})

		let groupSizes = Array(amountGroups).fill(0)
		let currentIndex = 0
		for (let s of schueler) {
			if (s.enabled) {
				groupSizes[currentIndex % amountGroups] += 1
				currentIndex += 1
			}
		}

		let string = ''
		for (let v of groupSizes) {
			string += str(v) + '/'
		}
		string = string.slice(0, -1)
		createElement('span', ' Gruppengrößen:' + string)
	}

	window.scrollTo(0, scrollY)
}

function groupsExist () {
	for (let s of schueler){
		if (s.group != undefined) {
			return true
		}
	}
	return false
}

async function createGroups(){
	let n = int(random(20, 30))
	for (let i = 0; i < n; i++){
		// reset selected & group
		for (let s of schueler){
			s.group = undefined
		}

		let ungroupedSchueler = []
		for (let s of schueler){
			if (s.enabled && s.group == undefined){
				ungroupedSchueler.push(s)
			}
		}

		let j = 0
		while (ungroupedSchueler.length){
			let r = int(random(ungroupedSchueler.length))
			let s = ungroupedSchueler.splice(r, 1)[0]
			s.group = j % amountGroups
			j++
		}

		build()
		await sleep(500/(n-i))
	}
}

async function selectSchueler() {
	let n = int(random(20, 30))
	let start_index = int(random(schueler.length))
	for (let i = 0; i < n; i++){
		// reset selected & group
		for (let s of schueler){
			s.selected = false
		}

		let index = start_index + i
		while (schueler[index % schueler.length].enabled == false){
			start_index += 1
			index += 1
		}
		schueler[index % schueler.length].selected = true

		build()
		await sleep(500/(n-i))
	}
}

function loadFile(file){
	let data = file.data
	kursName = data['Kursname']
	schueler = []
	for (let name of data['Schuelernamen']){
		s = new Schueler(name)
		schueler.push(s)
	}
	build()
}

class Schueler{
	constructor(name){
		this.name = name
		this.enabled = true
		this.selected = false
		this.group = undefined
	}

	createElementsLeft(divColumnLeft) {
		let divContainer = createDiv()
		divContainer.addClass('containerElements')
		divContainer.parent(divColumnLeft)

		let divName = createDiv(this.name)
		divName.addClass('containerName')
		divName.parent(divContainer)

		if (this.selected){
			divName.addClass('selected')
		}

		if (this.enabled){
			let buttonDisable = createButton('-')
			buttonDisable.parent(divContainer)
			buttonDisable.mousePressed(()=>{
				this.enabled = false
				build()
			})
		} else {
			divName.addClass('disabled')
			let buttonEnable = createButton('+')
			buttonEnable.parent(divContainer)
			buttonEnable.mousePressed(()=>{
				this.enabled = true
				build()
			})
		}
	}

	createElementsRight(divColumnRight) {
		let divContainer = createDiv()
		divContainer.addClass('containerElements')
		divContainer.parent(divColumnRight)

		let divName = createDiv(this.name)
		divName.addClass('containerName')
		divName.parent(divContainer)

		if (this.group != undefined){
			divName.addClass('group' + str(this.group + 1))
		}
	}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
