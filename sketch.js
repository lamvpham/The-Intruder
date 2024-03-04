// parameters
let p = {
  boundBox: true,
};

// main variables
let video;
let lastFlashTime = 0;

// pixelation
var scaler = 6; // size of pixels
var preFrame; // data of previous frame of video feed

// ml5 components
let facemesh; // the model
let predictions = []; // latest model predictions

// capturing and storing the pixel values w a limit
let motionCapture = []; // array for pixel colouring (red / black)
let showPixelatedFeed = true; // initial video feed state

// audio vars
let alertSound;
let alertPlayed = false;



// main function - preload audios from youtube
function preload() {
  staticSound = loadSound('sounds/whitenoise.mp3');
  alertSound = loadSound('sounds/alert.mp3');
}

// main function - setup
function setup() {
  createCanvas(640, 480);
  noCursor();

  // video details from motion heatmap medium article
  video = createCapture(VIDEO); // initializing video feed
  video.size(width, height); 
  video.hide(); // remove video DOM
  preFrame = createImage(video.width, video.height); // create previous frame
  pixelDensity(1);
  frameRate(32); // to lag the video

  // refresh and create new array every load
  motionCapture = new Array(video.width * video.height).fill(0); 

  // static sound for an increase in movement detection
  staticSound.loop();

  // initialize ml5.js model
  const options = {
    maxFaces: 10, // detect a max 10 faces
    detectionConfidence: 0.5,
  };
  facemesh = ml5.facemesh(video, options, modelReady);
  facemesh.on("predict", (results) => {
    predictions = results;
  });
}

// main function - draw
function draw() {
  video.loadPixels();
  preFrame.loadPixels();
  redCounter = 0; // once R value > 200, counter +1

  heatmap();

  // switching between pixelated and pure video feed based on redCounter
  if (redCounter >= 2800) {
    showPixelatedFeed = false;
    // play alert sound when pure video feed is active, inspired by intruder sketch from online user
    if (!alertPlayed) {
      alertSound.setVolume(1);
      alertSound.play(); 
      alertSound.loop();
      alertPlayed = true; 
    }
  } else if (redCounter <= 20) {
    showPixelatedFeed = true;
    alertSound.stop();
    alertPlayed = false; 
  }

  // video feed switch
  if (showPixelatedFeed) {
    pixelation() ;
    document.body.style.backgroundColor = "black";
  } else {
    image(video, 0, 0, width, height); 
    drawBoundingBoxes();
    document.body.style.backgroundColor = "red";
  }

  // ui elements
  soundVolume();
  recording();
  timer();
  redEyes();

  // save previous frame
  preFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
}



// increase static volume as more pixels get red
function soundVolume() {
  // map volume to recCounter + constrain the min/max volume
  let volume = map(redCounter, 0, 1000, 0, 1);
  volume = constrain(volume, 0.2, 1);
  staticSound.setVolume(volume);
}

// ui element - recording text
function recording() {
  let textX = 44;
  let textY = 44;
  let dotX = 30
  let dotY = 31

  fill(255, 0, 0); 
  textSize(24);
  textStyle(BOLD);
  noStroke(); 

  // blinking every 2 seconds
  if (frameCount % 20 < 10) {
    ellipse(dotX, dotY, 12, 12); 
  }

  text("REC", textX, textY);
}

// ui element - timer
function timer() {
  let elapsed = millis();
  let minutes = nf(floor(elapsed / 60000), 2);
  let seconds = nf(floor((elapsed % 60000) / 1000), 2);
  let milliseconds = nf(floor((elapsed % 1000) / 10), 2);
  let timerText = `${minutes}:${seconds}:${milliseconds}`;

  // timer width for right alignment
  let textW = textWidth(timerText);

  fill(255, 0, 0); 
  textSize(26);
  textStyle(BOLD);
  noStroke(); 
  text(timerText, width - textW - 28, height - 16);
}

// ui element - red eyes
function redEyes() {
  // only draw red eyes on the pixelated feed
  if (showPixelatedFeed) {
    predictions.forEach(prediction => {
      // using the right and left eye annotations closest to pupils
      const eyeAnnotations = [
        'rightEyeUpper0', 'rightEyeLower0', 
        'leftEyeUpper0', 'leftEyeLower0'
      ];

      // iterating over the annotations and scales them to match display resolution
      eyeAnnotations.forEach(annotation => {
        prediction.annotations[annotation]?.forEach(point => {
          const displayScaleX = width / video.width;
          const displayScaleY = height / video.height;
          const x = Math.floor(point[0] * displayScaleX);
          const y = Math.floor(point[1] * displayScaleY);

          drawRedEyes(x, y);
        });
      });
    });
  }
}

// ui element - drawing red eyes
function drawRedEyes(x, y) {
  // taking the scaled coordinates from redEyes and draws a red square at that eye landmark location
  // convert x, y back to pixelated grid coordinates
  let gridX = Math.floor(x / scaler) * scaler;
  let gridY = Math.floor(y / scaler) * scaler;

  // draw red square
  fill(255, 0, 0);
  noStroke();
  rect(gridX, gridY, scaler, scaler);
}

// ui element - draw the bounding box for faces (taken from class workshop)
function drawBoundingBoxes() {
  let c = "red";

  predictions.forEach((p) => {
    const bb = p.boundingBox;
    // get bb coordinates
    const x = bb.topLeft[0][0];
    const y = bb.topLeft[0][1];
    const w = bb.bottomRight[0][0] - x;
    const h = bb.bottomRight[0][1] - y;

    // draw the bounding box
    stroke(c);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h);
    // draw the confidence
    noStroke();
    fill(c);
    textAlign(LEFT, BOTTOM);
    textSize(20.0);
    text("INTRUDER", x, y - 10);
  });
}

// motion detection heatmap - referenced from heatmap medium article
function heatmap() {
  // applying heatmap onto pixel grid by iterating through the y then x
  for (let y = 0; y < video.height; y++) {
    for (let x = 0; x < video.width; x++) {
      let index = (x + y * video.width); // go through each pixel at (x, y) 
      let pixIndex = index * 4; // for each pixel, compare RGB value (each pixel consists of 4 values)
      let diff = distSq(video.pixels[pixIndex], video.pixels[pixIndex + 1], video.pixels[pixIndex + 2], preFrame.pixels[pixIndex], preFrame.pixels[pixIndex + 1], preFrame.pixels[pixIndex + 2]);
    
      // calc squared diff between RBG values of current frame vs previous frame to indicate motion
      // if diff reaches threshold, increment red pixel colour to a max of 255
      // if diff is below threshold, decrease red pixel colour back to black
      if (diff > 1000) {
        motionCapture[index] = min(motionCapture[index] + 35, 255); // increment towards red
      } else {
        motionCapture[index] = max(motionCapture[index] - 10, 0); // decrease towards black
      }

      // whenever a pixel reaches RGB value > 200, add to counter
      if (motionCapture[index] >= 200) { 
        redCounter++;
      }
    }
  }
}

// heatmap math -> taken from heatmap medium article to calculate squared Euclidean distance between RGB values of current and previous frames of the same pixel
const distSq = (x1, y1, z1, x2, y2, z2) => {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2;
}

// pixelation filter (inspired / referenced from the pixelation sketch of an online user)
function pixelation() {
  video.loadPixels();
  // iterating through every 6th pixel (scaler), making each pixel a 6x6 block
  for (let y = 0; y < video.height; y += scaler) {
    for (let x = 0; x < video.width; x += scaler) {
      // using the value stored in the array that says how much motion was detected at that block
      let index = (x + y * video.width);
      let colourIntensity = motionCapture[index];
      fill(colourIntensity, 0, 0); 
      noStroke();
      rect(x, y, scaler, scaler); // drawing the 6x6 block
    }
  }
}



// main utils - taken from p5.js for full screen mode 
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  staticSound();
}

// main utils - ml5 model initialization
function modelReady() {
  console.log("Model ready!");
}
