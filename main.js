const peopleForm = document.getElementById("people_list");
const submitPeopleListButton = document.getElementById("submit_people_list"); 

const additionalPeopleForm = document.getElementById("additional_people_list");
const submitAdditionalPeopleButton = document.getElementById("submit_additional_people_list"); 

const parsedPeople = document.getElementById("parsed_people");
const summary = document.getElementById("summary");

const capacityPerCar = document.getElementById("capacity_per_car");
const submitCreateCarPoolBotton =  document.getElementById("submit_create_car_pools");

const carsPerRow = document.getElementById("cars_per_row");

const carPoolLists =  document.getElementById("car_pool_lists");

const submitClearButton = document.getElementById("submit_clear");
const submitGenerateSummaryButton = document.getElementById("submit_generate_summary");

var people;

function parsePeople(peopleSourceString) {
    const trimmedPeopleSource = peopleSourceString.trim();
    const noNumberPeople = trimmedPeopleSource.replace(/[0-9]/g, '');

    // CJK https://www.unicode.org/charts/PDF/U3000.pdf, split by 2 types of chinese comma
    return noNumberPeople.split(/[,\/\u002C\uFF0C\+]+/).filter(e => e.trim()).map(e => e.trim());
}

submitPeopleListButton.addEventListener('click', function(e) {
    e.preventDefault();

    people = parsePeople(peopleForm.value)

    parsedPeople.innerHTML = people.toString();
});

submitAdditionalPeopleButton.addEventListener('click', function(e) {
    e.preventDefault();
 
    people.push(...parsePeople(additionalPeopleForm.value));

    parsedPeople.innerHTML = people.toString();
});

submitCreateCarPoolBotton.addEventListener('click', function(e) {
    e.preventDefault();

    carPoolLists.innerHTML = '';

    const peopleTemp = structuredClone(people);
    const cars = [];

    while (peopleTemp.length > 0) {
        cars.push(peopleTemp.splice(0, capacityPerCar.value));  
    }

    const carDivs = [];
    cars.forEach(function(car, carIndex) {
        const carDiv = document.createElement('div');
        const carId = 'car' + carIndex;
        carDiv.id = carId;

        carDivColNumber = 12/carsPerRow.value;
        carDiv.className = 'list-group col-' + carDivColNumber;

        car.forEach(function(person, personIndex){
            const personDiv = document.createElement('div');
            personDiv.id = carId + 'person' + personIndex;
            personDiv.className = 'list-group-item';
            personDiv.textContent = person;
            carDiv.appendChild(personDiv);
        });
        new Sortable(carDiv, {
            group: 'shared', // set all lists to same group
            animation: 150
        });
        carDivs.push(carDiv);
    });
    
    const rowDivs = [];
    while (carDivs.length > 0) {
        rowDivs.push(carDivs.splice(0, carsPerRow.value));
    }

    rowDivs.forEach(function(row, rowIndex) {
        const rowDiv = document.createElement('div');
        rowDiv.id = 'row' + rowIndex;
        rowDiv.className = 'row top-40';
        row.forEach(function(carDiv) {
            rowDiv.appendChild(carDiv);
        });
        carPoolLists.appendChild(rowDiv);
    });
});

submitClearButton.addEventListener('click', function(e) {
    e.preventDefault();
    people = [];
    carPoolLists.innerHTML = '';
    parsedPeople.innerHTML = '';
    summary.innerHTML = '';
});

submitGenerateSummaryButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    const rowDivs = carPoolLists.children;

    var allCarsSummary = '';
    var carNumber = 1;
    
    for(const rowDiv of rowDivs) {
        const carDivs = rowDiv.children;
        
        for(const carDiv of carDivs) {
            peopleDivs = carDiv.children;
            
            const peopleStringOfCar = []; 
            for(const personDiv of peopleDivs) {
                const personSourceString = personDiv.textContent;
                // turn 'Robin (will come home)' to 'Robin'
                const personParsed = personSourceString.replace(/ *(\(|（)[^)]*(\)|）) */g, "")
                peopleStringOfCar.push(personParsed);
            }

            var carSummary = '';
            for (var peopleIndex = 0; peopleIndex < peopleStringOfCar.length; peopleIndex++) {
                const personString = peopleStringOfCar[peopleIndex]
                if (peopleIndex == 0) {
                    carSummary = carNumber + '. ' + personString + ': ';
                } else if(peopleIndex != peopleStringOfCar.length - 1) {
                    carSummary = carSummary + personString + ', ';
                } else {
                    carSummary = carSummary + personString;
                }
            }
            allCarsSummary = allCarsSummary + carSummary + '<br>';
            carNumber++;
        }
    }

    summary.innerHTML = allCarsSummary;
});