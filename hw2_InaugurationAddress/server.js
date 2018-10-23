// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

app.use(express.static('public'));

// Create socket connection
const io = require('socket.io').listen(server);
const Concordance = require('./Concordance')
const math = require('mathjs')
const wordVec = require('./wordvecs10000')
const emotions = [
  wordVec.vectors['happy'],
  wordVec.vectors['surprise'],
  wordVec.vectors['angry'],
  wordVec.vectors['sad'],
  wordVec.vectors['hope']
]

const emotionColor = [
  '#FFD484',
  '#C4B1DE',
  '#FF564C',
  '#91AA9D',
  '#F9B1B1'
]


// Listen for individual clients to connect
io.sockets.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function (socket) {
    
    // let addressData
    analyzeData(socket).then(data => {
      const addressData = data
      // console.log(addressData[0])
      socket.emit('dataLoaded', true)
      
      socket.on('word', (word) => {
        console.log(word)
        // console.log(wordVec.vectors[word])
        let wordData = addressData.map((data) => {
          let message = {
            name: data.name,
            date: data.date,
            wordCount: data.concordance.getCount(word) == undefined ? 0:data.concordance.getCount(word)
          }

          return message
        })

        wordData = wordData.filter(data => data.wordCount != 0)

        let zeroArr = new Array(300)
        zeroArr.fill(0)
        let queryWordVec = wordVec.vectors[word] == undefined ? zeroArr:wordVec.vectors[word]
        let dist = emotions.map(emo => wordDist(queryWordVec, emo))
        let nearest = dist.reduce((emo1, emo2)=> {return emo1 >= emo2? emo1:emo2})
        
        console.log(dist.indexOf(nearest))
        let color = emotionColor[dist.indexOf(nearest)] // interpolate color
  
        let message = {
          word: word,
          wordData: wordData,
          color: color
        }
        socket.emit('countData', message)
  
      })
    })

    // Listen for this client to disconnect
    socket.on('disconnect', function () {
      console.log("Client has disconnected " + socket.id);
    });
  }
);

async function analyzeData(socket){
    const fs = require('fs')

    const text = await fs.readFileSync('inauguration.txt', 'utf-8')

    let addresses = await text.split("* * * * *")

    addresses = await addresses.map((x) => {
      let data = x.split('\n')
      data.shift()
      data = data.map(x => x.replace('\r', ''))
      let name = data[0]
      let date = data[1]
      data.shift()
      data.shift()
      let text = data.join(" ")
      let concordance = new Concordance()
      concordance.process(text)
      concordance.sortByCount()
      return {
        name: name,
        date: date,
        text: text,
        concordance: concordance
      }
    })

    

    return addresses
}

function wordDist(w1, w2){
  if(math.norm(w1) > 0 && math.norm(w2) > 0){
    return math.dot(w1, w2)/(math.norm(w1) * math.norm(w2))
  }
  else{
    return 0
  }
}


