/*
  Johan Karlsson, 2022
  https://twitter.com/DonKarlssonSan
  MIT License, see Details View
*/
let canvas;
let ctx;
let w, h;
let then;
let worms;
let pointerX, pointerY;

class Worm {
  constructor(x, y, r) {
    let c = Math.floor(Math.random() * 156 + 150);
    this.color = `rgba(${c}, ${c}, ${c}, 0.3)`;
    this.segments = [];
    const len = Math.random() * 100 + 75;
    for(let i = 0; i < len; i++) {
      this.segments.push([x, y]);
    }
    this.r = r;
    this.angle = Math.random() * Math.PI * 2;
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.pulseRate = Math.random() * 0.5 + 0.5;
    this.directionSkew = Math.random() * 0.04 - 0.02;
  }
  
  update(delta) {
    if(pointerX !== undefined && pointerY !== undefined) {
      const [x, y] = this.segments[0];
      const angle = Math.atan2(pointerY - y, pointerX - x);
      this.direction = angle + Math.random() * 0.1;
    } else {
      this.direction += Math.random() * 0.3 - 0.15 + this.directionSkew;
    }
    this.angle += delta * this.pulseRate*0.0061;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    let r;
    for(let i = this.segments.length - 1; i >= 0; i--) {
      const segment = this.segments[i];
      const angle = this.angle + i / this.segments.length*3;
      const [x, y] = segment;
      r = (Math.sin(angle) * 0.5 + 0.5) * this.r + 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      drawLineAtRandomAngle(x, y, r);
      drawLineAtRandomAngle(x, y, r);
      drawLineAtRandomAngle(x, y, r);
    }
    const stepSize = delta * r * 0.005;
    const [headX, headY] = this.segments[0];
    let newHeadX = headX + Math.cos(this.direction) * stepSize;
    let newHeadY = headY + Math.sin(this.direction) * stepSize;
    if(newHeadX < -2) {
      this.direction = reflectAlongX(this.direction);
      newHeadX = 0;
    }
    if(newHeadY < -2) {
      this.direction = reflectAlongY(this.direction);
      newHeadY = 0;
    }
    if(newHeadX > w+2) {
      this.direction = reflectAlongX(this.direction);
      newHeadX = w;
    }
    if(newHeadY > h+2) {
      this.direction = reflectAlongY(this.direction);
      newHeadY = h;
    }
    this.segments.splice(0, 0, [newHeadX, newHeadY]);
    this.segments.pop();
  }
}

function drawLineAtRandomAngle(x, y, r) {
  ctx.beginPath();
  const a = Math.random() * Math.PI * 2;
  const x1 = x + Math.cos(a) * r;
  const y1 = y + Math.sin(a) * r;
  ctx.moveTo(x1, y1);
  let f = Math.random() + 1;
  const x2 = x + Math.cos(a) * r * f;
  const y2 = y + Math.sin(a) * r * f;
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function reflectAlongX(angle) {
  let x = Math.cos(angle);
  let y = Math.sin(angle);
  return Math.atan2(y, -x);
}

function reflectAlongY(angle) {
  let x = Math.cos(angle);
  let y = Math.sin(angle);
  return Math.atan2(-y, x);
}

function setup() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerleave", pointerLeave);
  
}

function pointerMove(event) {
  pointerX = event.clientX;
  pointerY = event.clientY;
}

function pointerLeave(event) {
  pointerX = undefined;
  pointerY = undefined;
}

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  ctx.strokeStyle = "white";
  const min = Math.min(w, h);
  const r = min * 0.02;
  worms = [];
  then = performance.now();
  for(let i = 0; i < 20; i++) {
    let x = Math.random() * w;
    let y = Math.random() * h;
    worm = new Worm(x, y, r);
    worms.push(worm);
  }
}

function draw(now) {
  requestAnimationFrame(draw);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "white";
  const delta = now - then;
  worms.forEach(worm => {
    worm.update(delta);
  });
  
  then = now;
}

setup();
draw(performance.now());
