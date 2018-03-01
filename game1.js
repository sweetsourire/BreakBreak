var canvas, canvasContext
var ballX = 75
var ballY = 75
var ballSpeedX = 5
var ballSpeedY = 7
const PADDLE_WIDTH = 100
const PADDLE_THICKNESS = 10
const PADDLE_DIST_FROM_EDGE = 60
var paddleX = 400
var mouseX = 0
var mouseY = 0
var Xlocation = 0
var Ylocation = 0

const BRICK_W = 80
const BRICK_H = 20
const BRICK_GAP = 2
const BRICK_COLS = 10
const BRICK_ROWS = 14
const BGM = new Audio()

var brickGrid = new Array(BRICK_COLS * BRICK_ROWS) //brickGrid[0] = true
var bricksLeft = 0

function updateMousePos(event){
	var rect = canvas.getBoundingClientRect()
	var root = document.documentElement

	mouseX = event.clientX - rect.left - root.scrollLeft
	mouseY = event.clientY - rect.top - root.scrollTop

	Xlocation = Math.round(mouseX)
	Ylocation = Math.round(mouseY)

	paddleX = mouseX - PADDLE_WIDTH/2

// //CHEAT TEST BALL
// 	ballX = mouseX
// 	ballY = mouseY
// 	ballSpeedX = 4
// 	ballSpeedY = -4 //4px up
}

function brickReset(){
	bricksLeft = 0
	var i
	for( i=0; i<3*BRICK_COLS;i++){
		brickGrid[i] = false
	}
	for(;i<BRICK_COLS * BRICK_ROWS; i++){
		brickGrid[i] = true
		bricksLeft++
	}

	//  bricksLeft = 0
	//  for(let i= 3*BRICK_COLS; i<BRICK_COLS * BRICK_ROWS; i++){
	//  	brickGrid[i] = true
	//  	bricksLeft++
	// }
} //end of brickreset()

$(document).ready(function(){
	canvas = document.getElementById('gameCanvas')
	canvasContext = canvas.getContext('2d')

	var framesPerSecond = 30
	setInterval(updateAll, 1000/framesPerSecond)//30 times per sec

	canvas.addEventListener('mousemove', updateMousePos)

	brickReset()
	ballReset()

	function updateAll(){
		moveAll()
		drawAll()
	}
	
	function ballReset(){
		ballX = canvas.width/2
		ballY = canvas.height/2
	}

	function ballMove(){
		ballX+= ballSpeedX
		ballY+= ballSpeedY

		if(ballX<0 && ballSpeedX < 0.0){ //left side
			ballSpeedX *= -1
		}
		if(ballX>canvas.width && ballSpeedX >0.0){ //right side
			ballSpeedX *= -1
		}
		if(ballY<0 && ballSpeedY<0.0){ //top
			ballSpeedY *= -1
		}
		if(ballY>canvas.height){ //bottom
			ballReset()
			brickReset()
		}
	} //motion code


	function isBrickAtColRow(col, row) {
		if(col >= 0 && col < BRICK_COLS &&
			row >= 0 && row < BRICK_ROWS) {
			 var brickIndexUnderCoord = rowColToArrayIndex(col, row);
			 return brickGrid[brickIndexUnderCoord];
		} else {
			return false;
		}
	}

	function ballBrickHandling(){
		var ballBrickCol = Math.floor(ballX / BRICK_W) //divide x position of ball by brick wid x가 800까지 간다는것 이해
		var ballBrickRow = Math.floor(ballY / BRICK_H) //divide y position by brick height y가 600까지 간다는 것 이해	
		var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow) //call brick id
		// colorText(mouseBrickCol+","+mouseBrickRow+":"+brickIndexUnderMouse, 
		// 	mouseX,mouseY, 'yellow')
		if(ballBrickCol>=0 && ballBrickCol < BRICK_COLS &&
			ballBrickRow >=0 && ballBrickRow < BRICK_ROWS){

			if(isBrickAtColRow(ballBrickCol,ballBrickRow)){ //IF there is a brick, change the speed -Y
				brickGrid[brickIndexUnderBall] = false
				// bricksLeft-- 
				// console.log(bricksLeft)

				var prevBallX = ballX - ballSpeedX //5
				var prevBallY = ballY - ballSpeedY //7
				var prevBrickCol = Math.floor(prevBallX / BRICK_W)
				var prevBrickRow = Math.floor(prevBallY / BRICK_H)
				var bothTextsFailed = true

				if(prevBrickCol != ballBrickCol) {
					if(isBrickAtColRow(prevBrickCol, ballBrickRow) == false) {
						ballSpeedX *= -1;
						bothTestsFailed = false;
					}
				}
				if(prevBrickRow != ballBrickRow) {
					if(isBrickAtColRow(ballBrickCol, prevBrickRow) == false) {
						ballSpeedY *= -1;
						bothTestsFailed = false;
					}
				}

				if(bothTestsFailed) { // armpit case, prevents ball from going through
					ballSpeedX *= -1;
					ballSpeedY *= -1;
			 	}
			} //end of brick found
		}//end valid col and row
	}//end function

	function ballPaddleHandling(){
		var paddleTopEdgeY = canvas.height-PADDLE_DIST_FROM_EDGE
		var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS
		var paddleLeftEdgeX = paddleX
		var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH

		if(ballY > paddleTopEdgeY && //below the top of paddle
			ballY<paddleBottomEdgeY && //above bottom of paddle
			ballX>paddleLeftEdgeX && //right of the left side
			ballX < paddleRightEdgeX){ //left of the right side
			
			ballSpeedY *= -1

			var centerOfPaddleX = paddleX + PADDLE_WIDTH/2 //paddlex = paddle 가로
			var ballDistFromPaddleCenterX = ballX - centerOfPaddleX
			ballSpeedX = ballDistFromPaddleCenterX * 0.35

			if(bricksLeft==0){
				brickReset()
			}//out of bricks
		}//ball center inside paddle
	}//

	function moveAll(){
		
		ballMove()
		ballBrickHandling()
		ballPaddleHandling()
		
	}

	function rowColToArrayIndex(col, row){ //width before height
		return col + BRICK_COLS * row //skipping numbers in 8*n. giving a unique number to each block
	}

	function drawBricks(){

		for(var eachRow = 0; eachRow<BRICK_ROWS; eachRow++){
			for(let eachCol=0; eachCol<BRICK_COLS; eachCol++){
				var arrayIndex = rowColToArrayIndex(eachCol, eachRow)
				if(brickGrid[arrayIndex]){
					colorRect(BRICK_W*eachCol,BRICK_H*eachRow, BRICK_W-BRICK_GAP, BRICK_H-BRICK_GAP, 'blue') //BRICK_H*eachRow locate top point of the brick
				}//end of is this brick here
			}//end of for loop
		}
	}//end of drawbricks()


	function drawAll(){
		colorRect(0,0, canvas.width,canvas.height, 'black') //clear screen, 0,0 is the top left corner of the rect

		colorCircle(ballX,ballY, 10, 'white')

		colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white')
		
		drawBricks()

	}

	function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
		canvasContext.fillStyle = fillColor
		canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight) 
	}

	function colorCircle(centerX,centerY, radius, fillColor){
		canvasContext.fillStyle = fillColor
		canvasContext.beginPath()
		canvasContext.arc(centerX,centerY, radius, 0,Math.PI*2, true) 
		canvasContext.fill()
	}

	function colorText(showWords, textX,textY, fillColor){ //show words, textX,textY= location
		canvasContext.fillStyle = fillColor
		canvasContext.fillText(showWords, textX,textY)
	}

})//end jquery