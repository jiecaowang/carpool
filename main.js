const peopleForm = document.getElementById("people_list");

const additionalPeopleForm = document.getElementById("additional_people_list");
const submitAdditionalPeopleButton = document.getElementById(
    "submit_additional_people_list"
);

const summary = document.getElementById("summary");

const carQuantity = document.getElementById("car_quantity");
const submitCreateCarPoolBotton = document.getElementById(
    "submit_create_car_pools"
);

const carsPerRow = document.getElementById("cars_per_row");

const carPoolLists = document.getElementById("car_pool_lists");

const submitClearButton = document.getElementById("submit_clear");
const submitGenerateSummaryButton = document.getElementById(
    "submit_generate_summary"
);

const personIdPrefix = "person";
const carIdPrefix = "car";
const rowIdPrefix = "row";

var people;

function parsePeople(peopleSourceString) {
    const trimmedPeopleSource = peopleSourceString.trim();
    // const noNumberPeople = trimmedPeopleSource.replace(/[0-9]/g, "");

    // CJK https://www.unicode.org/charts/PDF/U3000.pdf, split by 2 types of chinese comma
    return trimmedPeopleSource
        .split(/[,\/\u002C\uFF0C\+＋\.．]+/)
        .filter((e) => e.trim())
        .map((e) => e.trim());
}

const _createCarDiv = function(peopleInCar, carIndex) {
    const carDiv = document.createElement("div");
    const carId = carIdPrefix + carIndex;
    carDiv.id = carId;

    carDivColNumber = 12 / carsPerRow.value;
    carDiv.className = "list-group col-" + carDivColNumber;

    peopleInCar.forEach(function (person, personIndex) {
        const personDiv = document.createElement("div");
        personDiv.id = carId + personIdPrefix + personIndex;
        personDiv.className = "list-group-item";
        personDiv.textContent = person;

        const buttonElement = document.createElement("button");
        buttonElement.className = "btn-close float-end";
        buttonElement.ariaLabel = "Close";
        buttonElement.addEventListener("click", function(e) {
            e.preventDefault();
            const immediateCarDiv = personDiv.parentElement;
            if(immediateCarDiv.children.length === 1) {                
                var currentRowDiv = immediateCarDiv.parentElement;
                immediateCarDiv.remove();

                while(currentRowDiv.nextSibling) {
                    nextRowDiv = currentRowDiv.nextSibling;
                    const nextRowDivFirstCar = nextRowDiv.firstChild;
                    currentRowDiv.append(nextRowDivFirstCar);
                    currentRowDiv = nextRowDiv;
                }

                if (currentRowDiv.children.length === 0) {
                    currentRowDiv.remove();
                }
            } else {
                personDiv.remove();
            }
        });

        personDiv.appendChild(buttonElement);
        carDiv.appendChild(personDiv);
    });
    new Sortable(carDiv, {
        group: "shared", // set all lists to same group
        animation: 150,
    });
    
    return carDiv;
};

const _createRowDiv = function (rowIndex) {
    const rowDiv = document.createElement("div");
    rowDiv.id = rowIdPrefix + rowIndex;
    rowDiv.className = "row top-40";
    return rowDiv;
};

submitAdditionalPeopleButton.addEventListener("click", function (e) {
    e.preventDefault();

    const peopleInCar = parsePeople(additionalPeopleForm.value);

    const lastRowDiv = carPoolLists.lastChild;
    
    if (lastRowDiv == null) {
        const rowDiv = _createRowDiv(1);
        rowDiv.appendChild(_createCarDiv(peopleInCar, 1));
        carPoolLists.appendChild(rowDiv);
    } else {
        const lastCarId = lastRowDiv.lastChild.id.substring(carIdPrefix.length);
        const lastCarDiv = _createCarDiv(peopleInCar, Number(lastCarId) + 1)
        if (lastRowDiv.children.length < Number(carsPerRow.value)) {
            lastRowDiv.appendChild(lastCarDiv);
        } else {
            const lastRowId = lastRowDiv.id.substring(rowIdPrefix.length);
            const newLastRowDiv = _createRowDiv(Number(lastRowId) + 1);
            newLastRowDiv.appendChild(lastCarDiv);
            carPoolLists.appendChild(newLastRowDiv);
        }
    }
});

submitCreateCarPoolBotton.addEventListener("click", function (e) {
    e.preventDefault();

    people = parsePeople(peopleForm.value);
    const peopleInCar = parsePeople(additionalPeopleForm.value);
    people.push(...peopleInCar);

    carPoolLists.innerHTML = "";

    const peopleTemp =
        typeof structuredClone === "function"
            ? structuredClone(people)
            : JSON.parse(JSON.stringify(people));
    
    const cars = [];
    const actualCarQuantity = peopleTemp.length < Number(carQuantity.value) ? peopleTemp.length : Number(carQuantity.value);
    const carCapacity = Math.floor(peopleTemp.length/actualCarQuantity);
    const peopleOverCarCapacityRemainder = peopleTemp.length % actualCarQuantity;
    for (let car_index = 1; car_index <= actualCarQuantity; car_index++) {
        cars.push(peopleTemp.splice(0, carCapacity + (car_index <= peopleOverCarCapacityRemainder? 1 : 0)));
      }

    const carDivs = [];
    cars.forEach(function (peopleInCar, carIndex) {
        carDivs.push(_createCarDiv(peopleInCar, carIndex));
    });

    const rowDivs = [];
    while (carDivs.length > 0) {
        rowDivs.push(carDivs.splice(0, carsPerRow.value));
    }

    rowDivs.forEach(function (row, rowIndex) {
        const rowDiv = _createRowDiv(rowIndex);
        row.forEach(function (carDiv) {
            rowDiv.appendChild(carDiv);
        });
        carPoolLists.appendChild(rowDiv);
    });
});

submitClearButton.addEventListener("click", function (e) {
    e.preventDefault();
    people = [];
    carPoolLists.innerHTML = "";
    summary.innerHTML = "";
});

submitGenerateSummaryButton.addEventListener("click", function (e) {
    e.preventDefault();

    const rowDivs = carPoolLists.children;

    var allCarsSummary = "";
    var carNumber = 1;

    for (const rowDiv of rowDivs) {
        const carDivs = rowDiv.children;

        for (const carDiv of carDivs) {
            peopleDivs = carDiv.children;

            const peopleStringOfCar = [];
            for (const personDiv of peopleDivs) {
                const personSourceString = personDiv.textContent;
                // turn 'Robin (will come home)' to 'Robin'
                const personParsed = personSourceString.replace(
                    / *(\(|（)[^)]*(\)|）) */g,
                    ""
                );
                peopleStringOfCar.push(personParsed);
            }

            var carSummary = "";
            for (
                var peopleIndex = 0;
                peopleIndex < peopleStringOfCar.length;
                peopleIndex++
            ) {
                const personString = peopleStringOfCar[peopleIndex];
                if (peopleIndex == 0) {
                    carSummary = carNumber + ". " + personString + ": ";
                } else if (peopleIndex != peopleStringOfCar.length - 1) {
                    carSummary = carSummary + personString + ", ";
                } else {
                    carSummary = carSummary + personString;
                }
            }
            if (carSummary !== "") {
                allCarsSummary = allCarsSummary + carSummary + "<br><br>";
                carNumber++;
            }
        }
    }

    summary.innerHTML = allCarsSummary;
});
