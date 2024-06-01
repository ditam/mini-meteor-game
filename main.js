// --- constants
const WIDTH = 1000; // 1280;
const HEIGHT = 600; // 720;
const ROAD_WIDTH = 30;

const TARGET_SIZE = 200;

const HOUSE_SIZE = 50; // should be bigger than CSS .house size
const GRID_OFFSET = 50; // move the grid X and Y to not overlap roads

const PEOPLE_COUNT = 30;
const HOUSE_CHANCE = 0.62;

const STEP_SIZE = 40;

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
let houseGrid;

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
  const _d = ROAD_WIDTH/2 - 10/2; // -person CSS size/2 at the end
  const roadXs = [WIDTH/4 + _d, WIDTH/4*2 + _d, WIDTH/4*3 + _d];
  const roadYs = [HEIGHT/3 + _d, HEIGHT/3*2 + _d];
  for (let i=0; i<PEOPLE_COUNT; i++) {
    let isVertical = Math.random() < 0.5;
    if (isVertical) {
      people.push({
        dir: Math.random() < 0.5? 'UP' : 'DOWN',
        x: getRandomItem(roadXs),
        y: getRandomInt(0, HEIGHT),
      });
    }
    else {
      people.push({
        dir: Math.random() < 0.5? 'RIGHT' : 'LEFT',
        x: getRandomInt(0, HEIGHT),
        y: getRandomItem(roadYs),
      });
    }
  }
  console.log(people);
  people.forEach(p=>{
    $('<div>').addClass('person').css({
      top: p.y,
      left: p.x
    }).data('p', p).appendTo(container);
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
          const pos = {
            y: y0 + rowIndex * HOUSE_SIZE,
            x: x0 + index * HOUSE_SIZE
          };
          $('<div>').addClass('house').css({
            top: pos.y,
            left: pos.x
          }).data('h', pos).appendTo(container);
        }
      });
    });
  });
};

function movePeople() {
  // TODO: improve perf: cache these
  $('.person').each((i, _el) => {
    const el = $(_el);
    const pData = el.data('p');
    let x = pData.x;
    let y = pData.y;
    switch(pData.dir) {
      case 'UP':
        if (y < STEP_SIZE) {
          pData.dir = 'DOWN';
          y+=STEP_SIZE;
        } else {
          y-=STEP_SIZE;
        }
        break;
      case 'RIGHT':
        if (x > WIDTH - STEP_SIZE) {
          pData.dir = 'LEFT';
          x-=STEP_SIZE;
        } else {
          x+=STEP_SIZE;
        }
        break;
      case 'DOWN':
        if (y > HEIGHT-STEP_SIZE) {
          pData.dir = 'UP';
          y-=STEP_SIZE;
        } else {
          y+=STEP_SIZE;
        }
        break;
      case 'LEFT':
        if (x < STEP_SIZE) {
          pData.dir = 'RIGHT';
          x+=STEP_SIZE;
        } else {
          x-=STEP_SIZE;
        }
        break;
      default:
        console.error('Unknown dir:', pData.dir)
    }
    // update data attr
    el.data('p', {
      dir: pData.dir,
      x: x,
      y: y
    });
    // update CSS
    el.css({
      top: y,
      left: x
    });
  });
}

function calculateImpact(x, y) {
  function getDist(obj) {
    console.assert(obj.x && obj.y, 'Unexpected object type:', obj);
    const xDiff = x - obj.x;
    const yDiff = y - obj.y;
    return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
  }
  let peopleHit = 0;
  let housesHit = 0;
  $('.person').each((i, _el) => {
    const el = $(_el);
    const pData = el.data('p');
    if (getDist(pData) < TARGET_SIZE/2) {
      peopleHit++;
    }
  });
  $('.house').each((i, _el) => {
    const el = $(_el);
    const hData = el.data('h');
    if (getDist(hData) < TARGET_SIZE/2) {
      housesHit++;
    }
  });
  console.log('impact score:', peopleHit, housesHit);
}

let impactDone = false;
$(document).ready(function() {
  console.log('Hello Meteor!');

  container = $('#main-container');

  const targetCircle = $('<div>').addClass('target').appendTo(container).css({
    width: TARGET_SIZE + 'px',
    height: TARGET_SIZE + 'px',
    top: 0,
    left: 0
  });

  container.css({
    width: WIDTH,
    height: HEIGHT
  });

  start();

  const movementInterval = setInterval(
    movePeople,
    1000
  );

  document.addEventListener('mousemove', function(event){
    if (impactDone) {
      return;
    }
    mouseX = event.clientX;
    mouseY = event.clientY;
    targetCircle.css({
      top: mouseY - TARGET_SIZE/2 + 'px',
      left: mouseX - TARGET_SIZE/2 + 'px'
    });
  }, false);

  document.addEventListener('click', function(event){
    mouseX = event.clientX;
    mouseY = event.clientY;

    $('<div>').addClass('crater').css({
      width: TARGET_SIZE + 'px',
      height: TARGET_SIZE + 'px',
      top: mouseY - TARGET_SIZE/2 + 'px',
      left: mouseX - TARGET_SIZE/2 + 'px'
    }).appendTo(container);
    impactDone = true;
    targetCircle.remove();
    container.addClass('impact-done');
    clearInterval(movementInterval);
    calculateImpact(mouseX, mouseY);
  }, false);

});
