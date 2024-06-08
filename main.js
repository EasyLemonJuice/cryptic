let currentGuess = 0
let currentDate = ""
let textLastChanged = new Date().getTime()
let gameover = false
let guesses = []

let savedData = {}

let hints = [
    ()=>{
        document.getElementById("firstLetter").querySelector(".word").style.opacity = 1
        return "First Letter: "+days[currentDate]['answer'].charAt(0).toUpperCase()
    },
    ()=>{
        let string = ""
        for (text in days[currentDate]['sentence']){
            if (text == "definition"){
                string += "<span style = 'color:cyan'><i>"+ days[currentDate]['sentence'][text]+"</i></span> "
            }else{
                string +=days[currentDate]['sentence'][text]+" "
            }
        }
        document.querySelector(".description").innerHTML = string
        return "Definition: "+days[currentDate]['sentence']['definition']
    },
    ()=>{return "Hint: "+days[currentDate]['hint']},
    ()=>{
        document.getElementById("lastLetter").querySelector(".word").style.opacity = 1
        return "Last Letter: "+days[currentDate]['answer'].charAt(days[currentDate]['answer'].length-1).toUpperCase()
    },
]

function addToList(text,count){
    let element = document.getElementById("guess"+count)
    if (element){
        element.textContent = text
    }
}

function resetList(){
    for (i=1;i<6;i++){
        addToList("",i)
    }
}

function displayWord(){
    let letters = document.getElementsByClassName("letter")
    letters = Array.from(letters)
    for (letter of letters){
        letter.querySelector(".word").style.opacity = 1
    }
}

function submit(){
    let input = document.querySelector(".guess")
    let guess = input.value.toLowerCase()
    if (guess != "" && !gameover){
        input.value = ""
        if (guess == days[currentDate]['answer']){
            addToList("✅"+guess,currentGuess+1)
            displayWord()
            setText("🎉 You got it in "+(currentGuess+1)+" 🎉",true)
            document.body.classList.add("victory")
            gameover = true
        }else if (!guesses.includes(guess)){
            guesses.push(guess)
            let additionalText = ""
            if (hints[currentGuess]){
                let text = hints[currentGuess]()
                additionalText = " 💡"+text
            }
            addToList("❌ "+guess+additionalText,currentGuess+1)
            if (currentGuess >= 4){
                gameover = true
                displayWord()
                setText("❌ GAME OVER ❌",true)
                document.body.classList.add("loss")
            }
            currentGuess+=1
        }else{
            setText("Word already used")
        }
        document.querySelector(".guessCount").textContent = "Guessed: "+currentGuess+" / 5"
    }else if (!gameover){
        setText("Enter a guess")
    }
    setData()
}

function setText(text,last){
    let now = new Date().getTime()
    let textElement = document.querySelector(".tip")
    textLastChanged = now
    textElement.textContent = text
    if (!last){
        setTimeout(()=>{
            let now = new Date().getTime()
            if (now-textLastChanged>2350){
                textElement.textContent = ""
            }
        },2500)
    }
}

function reveal(){
    if (!gameover){
        gameover = true
        displayWord()
        setText("❌ GAME OVER ❌",true)
        document.body.classList.add("loss")
    }
    setData()
}

function skip(){
    if (gameover) return;
    let guess = ""
    guesses.push(guess)
    let additionalText = ""
    if (hints[currentGuess]){
        let text = hints[currentGuess]()
        additionalText = " 💡"+text
    }
    addToList("❌ "+guess+additionalText,currentGuess+1)
    if (currentGuess >= 4){
        gameover = true
        displayWord()
        setText("❌ GAME OVER ❌",true)
        document.body.classList.add("loss")
    }
    currentGuess+=1
    document.querySelector(".guessCount").textContent = "Guessed: "+currentGuess+" / 5"
    setData()
}

function retrieveSave(){
    savedData = localStorage.getItem("cryptic2007_save")
    if (savedData){
        savedData = JSON.parse(savedData)
        if (savedData['date'] != currentDate){
            savedData = {}
        }
    }else{
        savedData = {}
    }
}

function loadSave(data){
    guesses = data['guesses']
    currentGuess = data['currentGuess']
    gameover = data['gameover']
    let guessCount = -1
    for (guess of guesses){
        console.log(guess)
        guessCount+=1
        let additionalText = ""
        if (hints[guessCount]){
            let text = hints[guessCount]()
            additionalText = " 💡"+text
        }
        addToList("❌ "+guess+additionalText,guessCount+1)
    }
    document.querySelector(".guessCount").textContent = "Guessed: "+currentGuess+" / 5"

    if (gameover){
        displayWord()
        if (guesses[currentGuess] == days[currentDate]['answer']){
            setText("🎉 You got it in "+(currentGuess+1)+" 🎉",true)
        }else{
            setText("❌ GAME OVER ❌",true)
        }
    }
}

function setData(){
    savedData['guesses'] = guesses
    savedData['currentGuess'] = currentGuess
    savedData['gameover'] = gameover
    savedData['date'] = currentDate
    localStorage.setItem("cryptic2007_save",JSON.stringify(savedData))
}

function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = (date.getDate()).toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function reset(){
    localStorage.setItem("cryptic2007_save","{}")
    location.reload()
}

document.addEventListener("DOMContentLoaded",()=>{
    let date = new Date();
    while (!days[currentDate]) {
        date.setDate(date.getDate() - 1);
        currentDate = formatDate(date);
    }
   
    let letterDiv = document.querySelector(".letter").cloneNode(true)
    document.querySelector(".letter").remove()
    let currentWord = days[currentDate]['answer']
    let firstLetter = true
    for (letter of currentWord){
        newLetter = letterDiv.cloneNode(true)
        newLetter.querySelector(".word").textContent = letter.toUpperCase()
        newLetter.querySelector(".word").style.opacity = 0
        if (firstLetter){
            firstLetter = false
            newLetter.id = "firstLetter"
        }
        document.querySelector(".wordBox").append(newLetter)
    }
    newLetter.id = "lastLetter"
    document.querySelector('.description').textContent = ""
    for (text in days[currentDate]['sentence']){
        document.querySelector('.description').textContent +=days[currentDate]['sentence'][text]+" "
    }
    document.querySelector(".difficulty").textContent = days[currentDate]['difficulty']
    retrieveSave()
    console.log(savedData)
    if (savedData['date']){
        console.log("loading")
        loadSave(savedData)
    }
})
