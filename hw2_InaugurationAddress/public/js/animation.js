var searchButton = $("#button-search");
var textField = $("#search")[0];
var textLable = $("label.input__label.input__label--hoshi.input__label--hoshi-color-0")[0];
var barCount = 4; // Number of word count
var barHolders = [];
var illustrationHolders = [
    [0, 0],
    [0, 1],
    [0, 2]
];

let socket = io();
let addressData;
let wordCount;
let allMessage;
let intervalID = "";

// Create a stylesheet
var sheet = (function () {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
})();

$(window).load(function () {
    centerContent();
});

$(window).resize(function () {
    centerContent();
});

socket.on('connect', () => {
    console.log('connected');
})


socket.on('dataLoaded', (isLoaded) => {
    if (isLoaded) {
        // maybe put in recieving data function or model loaded function
        console.log('dataLoaded')

        let graphGenerateButton = document.getElementById('graphGenerate')
        $("#button-search").click(function () {
            let word = $(".input__field")[0].value
            console.log(word)
            socket.emit('word', word)
        })

    }

})

// set bg color by word here
socket.on('countData', (message) => {
    console.log(message)
    allMessage = message;
    var flag = true;

    if ($("#input-4").val().trim().length === 0) {
        textField.classList.add("input__label--error");
        setTimeout(function () {
            textField.classList.remove("input__label--error");
        }, 300);
    } else {
        $(".barHolder")[0].innerHTML = "";
        
        // if (flag) {
        //     $('html, body').animate({
        //         scrollTop: $("#main").offset().top-64
        //       }, 400)
        //     flag = false;
        // }

        if (flag && parseInt($('#main').css('top'), 10) > 64) {
            $("#main").animate({
                top: "64",
            }, 300, function () {
                // Animation complete.
            });
            flag = false;
        }
        
        chart();


        $('body').css('background', allMessage.color)
        $('#header').css('background', allMessage.color)
        $('.desc').css('border-color', allMessage.color)


        if(responsiveVoice.isPlaying()) responsiveVoice.cancel()

        let wordCount = allMessage.wordData.map((data) =>{
            
            return data.wordCount;
        })
        console.log(wordCount)

        let totalCount = 0;
        if (wordCount.length !=0) {
            let totalCount = wordCount.reduce((acc, cum) => acc + cum)
            $(".notes--count")[0].innerHTML = `The word is mentioned <strong>${totalCount} time(s)</strong> in all US presidential inaugural addresses.`;
        } else {
            $(".notes--count")[0].innerHTML = `The word is not mentioned in any US presidential inaugural address. Please search again.`;
            $('body').css('background', '#ccc')
            $('#header').css('background', '#ccc')
        }

        wordCount = mapping(wordCount, 2, 0);
        console.log(wordCount)
        for(let cnt in wordCount){
            responsiveVoice.speak(allMessage.word, "Russian Female", {pitch : wordCount[cnt], rate: 1.5});
            
        }
        // let cnt = 0
        // if(intervalID != "") clearInterval(intervalID)
        // intervalID = setInterval(()=>{
        //     if(cnt >= wordCount.length) clearInterval(intervalID)
        //     let barName = '.bars--'+cnt
        //     $(barName).css('opacity',1)
        //     if(cnt-1 >= 0){
        //         barName = '.bars--'+(cnt-1)
        //         $(barName).css('opacity',0.5)
        //     }
        //     cnt++
        // }, 600)
    
    }
})

function centerContent() {
    var container = $('#home');
    var content = $('#main');
    content.css("left", (container.width() - content.width()) / 2);
    content.css("top", ($(window).height() - content.height()) / 2 + 32);
}

// Map enter to button click
// textField.addEventListener("keyup", event => {
//     if (event.key !== "Enter") return;
//     if ($("#input-4").val().trim().length === 0) {
//         // Shake the text field
//         console.log("Type something!");

//         textField.classList.add("input__label--error");
//         textLable.classList.remove("input__label--hoshi-color-0");
//         setTimeout(function () {
//             textField.classList.remove("input__label--error");
//             textLable.classList.add("input__label--hoshi-color-0");
//         }, 300);

//     } else {
//         if (event.key !== "Enter") return;
//         $(".barHolder")[0].innerHTML = "";
//         if (flag && parseInt($('#main').css('top'), 10) > 64) {
//             $("#main").animate({
//                 top: "0%",
//             }, 300, function () {
//                 // Animation complete.
//             });
//             flag = false;
//         }
//         chart();
//         event.preventDefault();
//     }
// });




// Callback function after valid search request
function chart() {
    reveal();
    bars();
}

// Reveal the chart
function reveal() {
    $(".notes").css("visibility", "visible");
}

// Creating visulization bars
function bars() {

    var hoverHolder = $(".barHolder")[0];
    
    hoverHolder.addEventListener("mouseover", function (e) {
        if (e.target && e.target.nodeName == "SPAN") {
            console.log("Hovered!")
            $('.desc').css('display', 'block')

            var index = e.target.className.split('--')[1];
            $(".illustrations--header")[0].innerHTML = allMessage.wordData[index].date;
            $(".illustrations--paragraph")[0].innerHTML = `${allMessage.wordData[index].name}, mentioned ${allMessage.word} ${allMessage.wordData[index].wordCount} time(s).`;
        }
    });
    hoverHolder.addEventListener("mouseout", function (e) {
        if (e.target && e.target.nodeName == "SPAN") {
            $('.desc').css('display', 'none')
            $(".illustrations--header")[0].innerHTML = "";
            $(".illustrations--paragraph")[0].innerHTML = "";
        }
    });

// function bars(length, date, presidentName) {
    // count = allMessage.wordCount.filter((data) => {
    //     if (data !== 0) {
    //         return data;
    //     }
    // });
    // presidentName = $(".input__field")[0].value;
    var bars = $(".barHolder")[0];
    var illustrations = $(".illustrationsHolder")[0];


    let wordCount = allMessage.wordData.map(data => data.wordCount)
    wordCount = mapping(wordCount, 300, 40)
    // Create bars
    for (i = 0; i < allMessage.wordData.length; i++) {
        var j = wordCount[i]
        barHolders[i] = document.createElement("span");
        // sheet.insertRule(`.bars--${i} { height: ${j}px;}`, 0);
        sheet.insertRule(`.bars--${i} {height: ${j}px;}`, sheet.cssRules.length);
        barHolders[i].setAttribute("class", `bars bars--${i}`);
        bars.appendChild(barHolders[i]);
    }
}

$('.barHolder').on('mousemove', function(e){
    if (e.pageX+20 < ($(window).width())/4*3) {
        $('.desc').css({
            left:  e.pageX + 20,
            top:   e.pageY - 100
         });
    } else {
        $('.desc').css({
            left:  e.pageX - 300,
            top:   e.pageY - 100
         });
    }
});


function mapping(wordCount, max, min){
    wordCount = wordCount.map((data) => {
        let local_max = Math.max(...wordCount)
        let local_min = Math.min(...wordCount)
        
        return (local_max-local_min) == 0? (max + min)/2:data/(local_max - local_min) * (max - min) + min
    })

    return wordCount
}

function changeOp(cnt){
    let barName = '.bars--'+cnt
    $(barName).css('opacity',1)
    if(cnt-1 >= 0){
        barName = '.bars--'+(cnt-1)
        $(barName).css('opacity',0.5)
    }

}