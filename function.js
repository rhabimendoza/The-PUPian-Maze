//-----------------------------------------------HEADER-----------------------------------------------//
let btn = document.querySelector("#nav-btn");
let nav = document.querySelector(".nav-link");

btn.addEventListener("click", function () {
    nav.classList.toggle("active");
});
//-----------------------------------------------HEADER-----------------------------------------------//





//-----------------------------------------------GAME-----------------------------------------------//
let ROWS = 0;
let COLS = 0;
let maze = [];
let best = [];
let start = [0, 0];

function generateMaze(){

    let selectElement = document.getElementById('difficulty');
    let selectedValue = parseInt(selectElement.value);

    ROWS = selectedValue;
    COLS = selectedValue;

    maze = [];
    for(let i = 0; i < ROWS; i++){
        maze[i] = [];

        for(let j = 0; j < COLS; j++){
            maze[i][j] = 1;
        }
    }

    dfs(0, 0);
    displayMaze();
    start = [0, 0]; 
    displayStart();

    let mazeTable = document.getElementById('maze');
    mazeTable.rows[ROWS - 1].cells[COLS - 1].classList.add('finish');
}

function dfs(x, y){
    maze[x][y] = 0;

    let dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    shuffle(dirs);

    for(let [dx, dy] of dirs){

        let nx = x + dx * 2;
        let ny = y + dy * 2;

        if(nx >= 0 && nx < ROWS && ny >= 0 && ny < COLS && maze[nx][ny] === 1){
            maze[x + dx][y + dy] = 0;
            maze[nx][ny] = 0;

            dfs(nx, ny);
        }
    }
}

function displayMaze(){
    let mazeTable = document.getElementById('maze');
    mazeTable.innerHTML = '';

    for(let i = 0; i < ROWS; i++){
        let row = document.createElement('tr');
        
        for(let j = 0; j < COLS; j++){
            let cell = document.createElement('td');

            if(maze[i][j] === 1){
                cell.classList.add('wall');
            }
            
            row.appendChild(cell);
        }

        mazeTable.appendChild(row);
    }
}

document.addEventListener('keydown', function(event){
    let key = event.key;
    let newX = start[0];
    let newY = start[1];

    switch(key){
        case 'ArrowUp':
            event.preventDefault();
            newX = Math.max(0, start[0] - 1);
        break;
        case 'ArrowDown':
            event.preventDefault();
            newX = Math.min(ROWS - 1, start[0] + 1);
        break;
        case 'ArrowLeft':
            event.preventDefault();
            newY = Math.max(0, start[1] - 1);
        break;
        case 'ArrowRight':
            event.preventDefault();
            newY = Math.min(COLS - 1, start[1] + 1);
        break;
    }

    if(maze[newX][newY] === 0){

        let mazeTable = document.getElementById('maze');
        mazeTable.rows[start[0]].cells[start[1]].classList.remove('start');
        start = [newX, newY];
        mazeTable.rows[start[0]].cells[start[1]].classList.add('start');

        if (start[0] === ROWS - 1 && start[1] === COLS - 1) {
            generateMaze();
        }
    }
});

function displayStart(){
    let mazeTable = document.getElementById('maze');
    mazeTable.rows[start[0]].cells[start[1]].classList.add('start');
}

function shuffle(array){
    for(let i = array.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function findBestPath(){
    let end = [ROWS - 1, COLS - 1];

    best = aStar(start, end);
    displayBestPath();
}

function aStar(start, end){
    let openSet = [];
    let closedSet = new Set();
    let cameFrom = new Map();

    let gScore = new Map();
    let fScore = new Map();

    for(let i = 0; i < ROWS; i++){
        for(let j = 0; j < COLS; j++){
            gScore.set(`${i},${j}`, Infinity);
            fScore.set(`${i},${j}`, Infinity);
        }
    }

    gScore.set(start.join(','), 0);
    fScore.set(start.join(','), heuristic(start, end));
    openSet.push(start);

    while(openSet.length > 0){
        let current = getLowestFScore(openSet, fScore);
        
        if(current[0] === end[0] && current[1] === end[1]){
            return reletructPath(cameFrom, current); 
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.add(current.join(',')); 

        
        let neighbors = getNeighbors(current); 
    
        for(let neighbor of neighbors){
            if(closedSet.has(neighbor.join(','))) {
                animateSearch(neighbor[0], neighbor[1], "close"); 
                continue};

            let tentativeGScore = gScore.get(current.join(',')) + 1;
            
            if(tentativeGScore < gScore.get(neighbor.join(','))){
                cameFrom.set(neighbor.join(','), current);
                
                gScore.set(neighbor.join(','), tentativeGScore);
                fScore.set(neighbor.join(','), tentativeGScore + heuristic(neighbor, end));


                openSet.push(neighbor);
                animateSearch(neighbor[0], neighbor[1], "open");
            }
        }
    }
    return [];
}

function heuristic(node, target){
    return Math.abs(node[0] - target[0]) + Math.abs(node[1] - target[1]);
}

function getLowestFScore(nodes, fScore){
    let lowest = nodes[0];
    let lowestFScore = fScore.get(nodes[0].join(','));

    for(let node of nodes){
        let f = fScore.get(node.join(','));
        
        if(f < lowestFScore){
            lowest = node;
            lowestFScore = f;
        }
    }

    return lowest;
}

function getNeighbors(node){
    let [x, y] = node;
    let neighbors = [];

    if(x > 0)neighbors.push([x - 1, y]);
    if(x < ROWS - 1)neighbors.push([x + 1, y]);
    if(y > 0)neighbors.push([x, y - 1]);
    if(y < COLS - 1)neighbors.push([x, y + 1]);

    return neighbors.filter(neighbor => maze[neighbor[0]][neighbor[1]] === 0);
}

function reletructPath(cameFrom, current) {
    let path = [current];
  
    while (cameFrom.has(current.join(','))){
        current = cameFrom.get(current.join(','));
        path.unshift(current);
    }
    
    return path;
}

function animateSearch(cellX, cellY, whatset) {
      const mazeTable = document.getElementById('maze');
      const cell = mazeTable.rows[cellX].cells[cellY];


      if (whatset == "open"){
        sleep(100).then(() => {cell.classList.add('open');})
      }
      else{
        sleep(100).then(() => {cell.classList.add('close');})
      }
    }

function displayBestPath(){
    let mazeTable = document.getElementById('maze');

    let ind = 0;
    let currentRow, currentCell;

    sleep(500).then(() => {
        function animatePath(){
        setTimeout(function(){
            currentRow = mazeTable.rows[best[ind][0]];
            currentCell = currentRow.cells[best[ind][1]];
 
            currentCell.classList.remove('close', 'open');
            
            currentCell.classList.add('current');

            if(ind - 1 > 0){
              mazeTable.rows[best[ind - 1][0]].cells[best[ind - 1][1]].classList.remove('current')
              mazeTable.rows[best[ind - 1][0]].cells[best[ind - 1][1]].classList.add('path')
            }

            ind++;
            if(ind < best.length){
              animatePath();
            }
        }, 20);
    }
      animatePath();
    })
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

generateMaze();
//-----------------------------------------------GAME-----------------------------------------------//