const {MongoClient} = require('mongodb');
const express = require('express');
const app = express();
const fs = require('fs');
const readline = require('readline');

const http = require('http');

const hostname = '127.0.0.1'; // localhost
const port = 3000;
let exists = false;

const uri = "mongodb+srv://discordbot:liOeWqTs8H5Mse98@cluster0.iswguim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri);

app.use(express.static('public'));
app.use(express.json());

app.get('/info/:dynamic', (req, res) => {
  const {dynamic} = req.params;
  const {key} = req.query;
  console.log(dynamic, key)
  res.status(200).json({info: 'Function Success!'});
});
app.route('/add')
  .post(async function(req, res, next) {
  const { package } = req.body;
  if(!package){
    res.status(400).send({status: 'failed'});
  }
  res.status(200).send({status: 'recieved'})

  await client.connect();
  console.log("second");
  rotation = package.substring(1, package.length-1);
  let rotationArr = rotation.split(", ")
  for(let i = 0; i<rotationArr.length; i++){
    rotationArr[i] = rotationArr[i].substring(1, rotationArr[i].length-1);
  }
  await createRotation(client, {
    values: rotationArr
  });
  await client.close();
  next();
})
  .get(async function (req, res) {
    console.log("first")
    await res.status(200).json({info: exists});
  });

app.route('/find')
  .post(async function(req, res, next) {
    const { package } = req.body;
    await client.connect();
    rotations = await findRotations(client, package);
    await client.close();
    next();
  })
  .get(async function (req, res) {
    res.status(200).json({info: rotations});
  });

app.listen(port, () => console.log("Running"));


async function main(){


  await client.connect();

  let rotation = await new Promise(resolve => {
    rl.question("Enter rotation number (e.g., 0077):", resolve)
  })
  rl.close();

  rotation = rotation.substring(1, rotation.length-1);
  let rotationArr = rotation.split(", ")
  for(let i = 0; i<rotationArr.length; i++){
    rotationArr[i] = rotationArr[i].substring(1, rotationArr[i].length-1);
  }
  await createRotation(client, {
    values: rotationArr
  });

  await client.close();

}
async function main2(){

    const rotationNum = await new Promise(resolve => {
      rl.question("Enter rotation number (e.g., 0077):", resolve)
    })
    rl.close();

    const server = http.createServer(async (req, res) => {
      await client.connect();
      res.statusCode = 200;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      const log = await findRotations(client, rotationNum);
        res.write('<html>')
        for(let i = 0; i < log.length; i++){
          res.write(log[i] + '<br>')
        }
      res.write('</html>');
      res.write('<!DOCTYPE HTML><body>Enter rotation number(e.g., 0077):<br><input id="numb" placeholder="Rotation Number:"><br>');
      res.write('<button type="button"onclick="myFunction()">Enter</button></body>');
      res.write('<script>function myFunction(){let v = document.getElementById("numb").value; console.log(v)}</script></html>')
      const x = await fetch("http://127.0.0.1:3000/")

      console.log(x);
      res.end();
      await client.close();
    });
    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
}
//main2();
async function createPokemon(client, newPoke){
  await client.db("test").collection("testings").insertOne(newPoke);

  console.log("new Pokemon added");
}
async function checkRotation(client, newRotation){
  let match = await client.db("DB_New").collection("Rotations").find(newRotation);
  const match2 = await match.toArray();
  if(match2.length != 0){
    exists = true;
  }
  else{
    exists = false;
  }

}
async function createRotation(client, newRotation){
  let match = await client.db("DB_New").collection("Rotations").find(newRotation);
  const match2 = await match.toArray();
  if(match2.length != 0){
    exists = true;
    console.log("Rotation already in database");
  }
  else{
    exists = false;
    await client.db("DB_New").collection("Rotations").insertOne(newRotation);
    console.log("new rotation added");
  }
}
async function findRotations(client, rotationNum){
  const rotation = await client.db("DB_New").collection("Rotations").find({values: { $all: [rotationNum]}});
  const results = await rotation.toArray();
  let log = "";
  let arra = [];
  for(let i = 0; i < results.length; i++){
    for(let j = 0; j < results[i].values.length; j++){
      if(j == results[i].values.length - 1){
        if(i != results.length - 1){
          log += results[i].values[j];
          arra.push(log);
          log = "";

        }else{
          log += results[i].values[j];
          arra.push(log);
          log = "";
        }
      }
      else if (results[i].values[j+1].includes("[") && j < results[i].values.length-1) {
        log += results[i].values[j];
        log += " ";
      }
      else{
        log += results[i].values[j];
        log += ", ";
      }
    }
  }
  if(arra.length == 0){
    arra[0] = "No rotations found for " + rotationNum;
    return arra;
  }else{
    arra.splice(0, 0, "Rotations for " + rotationNum + ":");
    return arra;
  }
}
function arraEqual(arra1, arra2){
  if(arra1.length != arra2.length){
    return false;
  }
  for(let i = 0; i < arra1.length; i++){
    if(arra1[i] != arra2[i]){
      return false;
    }
  }
  return true;
}

/*
.001 sec * arr.length * hello.length

O(n^2)

arr = {1, 4, 6, 2, 8, 3, 11, 7}

for(let i = 0; i < arr.length; i++)
    arr[i] = arr.length
  }
}

}


[[1,1,1],  [2,2,2], [3,3,3],
[4, 5, 6],
[7, 8, 9]

*/

/*async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};*/
