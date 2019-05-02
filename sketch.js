let PADDLE_HUES = [60, 180, 300];
let MIN_X = 180;
let MAX_X = 455;
let MIN_Y = 120;
let MAX_Y = 540;
let points = [];

function polarToCartesian(angleDeg, magnitude) {
  let x = magnitude * cos(angleDeg);
  let y = magnitude * sin(angleDeg);
  return [x, y];
}

function cartesianToAngle(x, y) {
  let phi = atan2(y, x);
  if (phi < 0) {
      phi += 360;
  }
  return phi;
}

function ColorPoint() {
    this.pos_x = random(MIN_X, MAX_X);
    this.pos_y = random(MIN_Y, MAX_Y);
    this.max_vel = 2;
    this.vel_x = random(-this.max_vel, this.max_vel);
    this.vel_y = random(-this.max_vel, this.max_vel);
    this.hue = random(PADDLE_HUES);
    this.dist = 100000;

    this.update = function () {
        decay = 0.99;
        this.vel_x = this.vel_x * decay;
        this.vel_y = this.vel_y * decay;
        this.pos_x += this.vel_x;
        this.pos_y += this.vel_y;

        if (this.pos_x > MAX_X) {
            this.pos_x = MAX_X;
            this.vel_x *= -1;
        } else if (this.pos_x < MIN_X) {
            this.pos_x = MIN_X;
            this.vel_x *= -1;
        }
        if (this.pos_y > MAX_Y) {
            this.pos_y = MAX_Y;
            this.vel_y *= -1;
        } else if (this.pos_y < MIN_X) {
            this.pos_y = MIN_X;
            this.vel_y *= -1;
        }
    };

    this.display = function () {
        noStroke();
        // fill(color(this.hue, 40, 100));
        fill(0);
        ellipse(this.pos_x, this.pos_y, 10, 10);
    };

    this.repel = function(p) {
        let d_sq = sqDistance(this.pos_x, this.pos_y, p.pos_x, p.pos_y);
        let k = 3;
        this.vel_x = this.vel_x + k * (this.pos_x - p.pos_x) / d_sq;
        this.vel_y = this.vel_y + k * (this.pos_y - p.pos_y) / d_sq;
        // this.vel_x = constrain(this.vel_x, -this.max_vel, this.max_vel);
        // this.vel_y = constrain(this.vel_y, -this.max_vel, this.max_vel);
    }
}


function preload() {
    img = loadImage('ice_cream.png');
}


function setup() {
    createCanvas(img.width, img.height);
    rectMode(CENTER);
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    angleMode(DEGREES);

    midiInput = new MIDIInput();
    midiInput.onMIDIMessage = midiMessageHandler;

    for (let i = 0; i < 10; i++) {
        points.push(new ColorPoint());
    }
    // noLoop();
}

function sqDistance(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
}

// function inPaddleRange(x, y) {

// }

function draw() {
    // background(255);
    numUpdates = 50;
    for (let x_ = 0; x_ < numUpdates; x_++) {
        let x = random(MIN_X, MAX_X);
        for (let y_ = 0; y_ < numUpdates; y_++) {
            let y = random(MIN_Y, MAX_Y);
            // x = mouseX;
            // y = mouseY;

            // if (!inPaddleRange(x, y)) {
            //     continue;
            // }


            for (let i = 0; i < points.length; i++) {
                d = sqDistance(x, y, points[i].pos_x, points[i].pos_y);
                points[i].dist = d;
                points[i].dist_x = abs(x - points[i].pos_x);
                points[i].dist_y = abs(y - points[i].pos_y);
            }

            let hueVector = [0, 0];
            for (let interpIndex = 0; interpIndex < points.length; interpIndex++) {
                vec = polarToCartesian(points[interpIndex].hue, 1 / points[interpIndex].dist);
                hueVector[0] += vec[0];
                hueVector[1] += vec[1];
            }
            let hue = cartesianToAngle(hueVector[0], hueVector[1]);
            c = color(hue, 40, 100, 60);
            // set(x, y, c);

            fill(c);
            rect(x, y, 10, 10);
        }
    }
    updatePixels();

    for (let i = 0; i < points.length; i++) {
        points[i].update();
        // points[i].display();
        for (let j = 0; j < points.length; j++) {
            if (i != j) {
                points[i].repel(points[j]);    
            }
        }
    }

    image(img, 0, 0);
}

function midiMessageHandler(data) {
    msg = new MIDI_Message(data.data);
    if (msg.type == NOTE_ON) {
        p = random(points);
        let k = 10;
        p.pos_x = random(MIN_X, MAX_X);
        p.pos_y = random(MIN_Y, MAX_Y);
        p.hue = random(PADDLE_HUES);
    }
    // console.log(msg.type, msg.channel, msg.velocity);
}

