//представление, ответственное за обновление изображений и вывода сообщений
var view = {
    //получает текст сообщения
    displayMessage: function(msg) {
        var messageArea = document.getElementById("message-aria");
        messageArea.innerHTML = msg;
    },
    
    displayHit: function(location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    
    displayMiss: function(location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    }
};

//модель для хранения состояния игры
var model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipsSunk: 0, //текущее значение потопленных кораблей
    ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

    fire: function(guess) {
        //получает координаты выстрела и перебирает массив ships, проверяя каждый корабль
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];
            
            //массив клеток, занимаемых кораблем
            //необходимо проверить совпадает ли guess с каким-то параметром из массива locations
            //возвращает -1, если значения нет в массиве
            var index = ship.locations.indexOf(guess);
            
            //если больше нуля - попадание
            if (index >= 0) {
            
                //ставит отметку в массиве hits
                ship.hits[index] = "hit";
                
                //добавляет класс hit и выводим сообщение о попадании
                view.displayHit(guess);
                view.displayMessage("HIT!");
                
                //выводим сообщение, что корабль потоплен, и увеличиваем shipsSunk
                if (this.isSunk(ship)) {
                    view.displayMessage("You sank my battleship!");
                    this.shipsSunk++;
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage("You missed.")
        return false;
    },
    
    //получает объект корабля и проверяет помечены ли все его клетки маркером попадания
    isSunk: function(ship) {
        
        //если хотя бы в одну клетку не попали, то возвращается false
        for (var i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    },
    
    //расположение кораблей
    generateShipLocation: function() {
        var locations; //массив позиций одного корабля
        for (var i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            } while (this.collision(locations)); //проверяется перекрытие
            this.ships[i].locations = locations; //если корабли перекрываются, еще одна попытка
        }
    },
    
    generateShip: function() {
        var direction = Math.floor(Math.random() * 2);
        var row, col;
        
         if (direction === 1) {
             //первая точка горизонтального корабля
             row = Math.floor(Math.random() * this.boardSize);
             col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
         } else {
             //первая точка вертикального корабля
             row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
             col = Math.floor(Math.random() * this.boardSize);
         }
        
        var newShipLocations = [];
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                newShipLocations.push(row + "" + (col + i));
            } else {
                newShipLocations.push((row + i) + "" + col);
            }
        }
        return newShipLocations;
    },
    
    collision: function(locations) {
        for (var i = 0; i < this.numShips; i++) {
            
            //для каждого корабля
            var ship = model.ships[i];
            
            //проверяются их позиции
            for (var j = 0; j < locations.length; j++) {
                //если встречается несколько раз, то индекс больше или равен 0
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    
                    //обнаружено перекрытие
                    return true;
                }
            }
        }
        return false;
    }
};

//связывает все данные воедино
var controller = {
    guesses: 0,
    
    //получает координаты
    processGuess: function(guess) {
        var location = parseGuess(guess);
        if (location) {
            //если ввел правильные координаты
            this.guesses++;
            
            //комбинация строки и столбца передается в fire
            var hit = model.fire(location);
            
            //если выстрел попал в цель, а потопленных кораблей равно количеству кораблей в игре,
            //то выводится сообщение, что все корабли потоплены + кол-во попыток
            if (hit && model.shipsSunk === model.numShips) {
                view.displayMessage("You sank all my battleships, in " + this.guesses + " guesses");
            }
        }
    }
};
        
function parseGuess(guess) {
    var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
        
    //проверка введенных данных
    if (guess === null || guess.length !==2) {
        alert("Oops, please enter a letter and a number on the board");
    } else {
        //первый символ введенного значения
        firstChar = guess.charAt(0);
        //получаем цифру в диапозоне от 0 до 6
        var row = alphabet.indexOf(firstChar);
        var column = guess.charAt(1);
        
        //выявляет значения, которые не являются цифрами
        if (isNaN(row) || isNaN(column)) {
            alert("Oops, that isn't on the board.");
        
        //проверка, что цифры лежат в диапазоне от 0 до размер доски-1
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
            alert("Oops, that's off the board!");
        } else {
            return row + column;
        }
    }
    return null;
};

function init() {
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;
    var guessInput = document.getElementById("guessInput");
    
    //для нажатия на enter
    guessInput.onkeypress = handleKeyPress;
    
    model.generateShipLocation();
};

function handleKeyPress(e) {
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13) {
        
        //если нажата клавиша enter, то кнопка должна сработать так, будто игрок щелкнул на нее
        fireButton.click();
        
        //возвращаем false, чтобы кнопка не делала ничего лишнего
        return false;
    }
};

function handleFireButton() {
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    
    controller.processGuess(guess);
    
    //удаляет содержимое формы
    guessInput.value = "";
};

//при полной загрузке страницы
window.onload = init;
