// --- constants
const WIDTH = 1000; // 1280;
const HEIGHT = 600; // 720;
const ROAD_WIDTH = 30;

const HOUSE_SIZE = 50; // should be bigger than CSS .house size
const GRID_OFFSET = 50; // move the grid X and Y to not overlap roads

const PEOPLE_COUNT = 20;
const HOUSE_CHANCE = 0.62;

// --- utils
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getRandomInt(min, max) { // min and max included
  if (typeof max === 'undefined') {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function deepCopy(o) {
  return JSON.parse(JSON.stringify(o));
}

// --- globals
let container;

// --- rest of the stuff
function drawRoads() {
  // horizontals
  const r1 = $('<div>').addClass('road').appendTo(container);
  r1.css({
    top: HEIGHT/3 + 'px',
    left: 0,
    width: WIDTH,
    height: ROAD_WIDTH
  });

  const r2 = $('<div>').addClass('road').appendTo(container);
  r2.css({
    top: HEIGHT/3 * 2 + 'px',
    left: 0,
    width: WIDTH,
    height: ROAD_WIDTH
  });

  // verticals
  const r3 = $('<div>').addClass('road').appendTo(container);
  r3.css({
    top: 0,
    left: (WIDTH / 4 * 1) + 'px',
    width: ROAD_WIDTH,
    height: HEIGHT
  });
  const r4 = $('<div>').addClass('road').appendTo(container);
  r4.css({
    top: 0,
    left: (WIDTH / 4 * 2) + 'px',
    width: ROAD_WIDTH,
    height: HEIGHT
  });
  const r5 = $('<div>').addClass('road').appendTo(container);
  r5.css({
    top: 0,
    left: (WIDTH / 4 * 3) + 'px',
    width: ROAD_WIDTH,
    height: HEIGHT
  });
}

let houseGrid;
function generateHouses() {
  houseGrid = [];
  for (let j=0; j<3; j++) {
    for (let i=0; i<4; i++) {
      const group = {
        groupPosition: { x: i, y: j },
        houses: [
          [Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE],
          [Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE],
          [Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE, Math.random() < HOUSE_CHANCE],
        ]
      };
      houseGrid.push(group);
    }
  }
  console.log('generated houses:', houseGrid);
}

function start() {
  drawRoads();

  // draw random people
  const people = [];
  const roadXs = [WIDTH/4, WIDTH/4*2, WIDTH/4*3];
  const roadYs = [HEIGHT/3, HEIGHT/3*2];
  for (let i=0; i<PEOPLE_COUNT; i++) {
    let isVertical = Math.random() < 0.5;
    if (isVertical) {
      people.push({
        dir: 'RIGHT',
        x: getRandomItem(roadXs),
        y: getRandomInt(0, HEIGHT),
      });
    }
    else {
      people.push({
        dir: 'DOWN',
        x: getRandomInt(0, HEIGHT),
        y: getRandomItem(roadYs),
      });
    }
  }
  people.forEach(p=>{
    $('<div>').addClass('person').css({
      top: p.y,
      left: p.x
    }).appendTo(container);
  });

  // generate houses
  generateHouses();
  // draw houses
  houseGrid.forEach(group => {
    const x0 = GRID_OFFSET + group.groupPosition.x * WIDTH/4;
    const y0 = GRID_OFFSET + group.groupPosition.y * HEIGHT/3;
    group.houses.forEach((row, rowIndex) => {
      row.forEach((h, index) => {
        if (h) {
          $('<div>').addClass('house').css({
            top: y0 + rowIndex * HOUSE_SIZE,
            left: x0 + index * HOUSE_SIZE
          }).appendTo(container);
        }
      });
    });
  });
};

$(document).ready(function() {
  console.log('Hello Meteor!');

  container = $('#main-container');

  container.css({
    width: WIDTH,
    height: HEIGHT
  });

  start();
});
