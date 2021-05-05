var dog, dogSadImg, dogHappyImg;
var database;
var foodS, foodStock;

var feedPet, addFood;
var fedTime, lastFed;
var foodObj;

var readState;

var gameState = "hungry";

var currentTime;

var bedroomImg, gardenImg, washroomImg;

function preload()
{
	dogSadImg = loadImage("dogSadImg.png");
  dogHappyImg = loadImage("dogHappyImg.png");

  bedroomImg = loadImage("bedroom.png");
  gardenImg = loadImage("Garden.png");
  washroomImg = loadImage("washroom.png");
}

function setup() {
	createCanvas(1000,500);

  database = firebase.database();

  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  })

  foodObj = new Food();

  dog = createSprite(800,215,20,20); 
  dog.addImage(dogSadImg);
  dog.scale = 0.1;

  feedPet = createButton("Feed the Dog");
  feedPet.position(360,50);
  feedPet.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(465,50);
  addFood.mousePressed(addFoods);

  foodStock = database.ref('Food');
  foodStock.on("value", readStock);
}


function draw() { 

  background(46, 139, 87);

  if(gameState != "hungry"){
    feedPet.hide();
    addFood.hide();
    dog.visible = false;
  } else {
    feedPet.show();
    addFood.show();
    dog.visible = true;
    dog.addImage(dogSadImg);
  }
  
  fedTime = database.ref('FeedTime');
  fedTime.on("value", function(data){
    lastFed = data.val();
  })

  currentTime = hour();

  if(currentTime === (lastFed + 1)){
    updateState("playing");
    foodObj.garden();
  } else if(currentTime === (lastFed + 2)){
    updateState("sleeping");
    foodObj.bedroom();
  } else if(currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)){
    updateState("bathing");
    foodObj.washroom();
  } else {
    updateState("hungry");
    foodObj.display();
  }

  fill("white");
  textSize(25);
  if(lastFed >= 12){
    text("Last Fed: " + lastFed/12 + "PM", 350,30);
  } else if(lastFed === 0){
    text("Last Fed: 12 AM",350,30);
  } else {
    text("Last Fed: " + lastFed + "AM",350,30);
  }

  foodObj.display();

  drawSprites();
  
  text("Food: " + foodS,20,50);

}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}


function addFoods(){
  foodS++;
  database.ref('/').update({
    Food : foodS
  })
}

function feedDog(){
  dog.addImage(dogHappyImg);

  if(foodS >= 1){foodObj.updateFoodStock(foodObj.getFoodStock() - 1);}
  if(foodS < 1){
    dog.addImage(dogSadImg);
  }
  database.ref('/').update({
    Food : foodObj.getFoodStock(),
    FeedTime: hour()
  })
}

function updateState(state){

  database.ref('/').update({
    gameState: state
  })

}



