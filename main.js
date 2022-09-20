const draggableElements = document.querySelectorAll(".draggable");
const droppableElements = document.querySelectorAll(".droppable");

const peopleForm = document.getElementById("people_list");
const submitButton = document.getElementById("submit_people_list"); 

const additionalPeopleForm = document.getElementById("additional_people_list");
const submitAdditionalPeopleButton = document.getElementById("submit_additional_people_list"); 

const parsedPeople = document.getElementById("parsed_people");

const example2Left = document.getElementById('example2-left');
const example2Right = document.getElementById('example2-right');

var people;

function parsePeople(peopleSourceString) {
    const trimmedPeopleSource = peopleSourceString.trim();
    const noNumberPeople = trimmedPeopleSource.replace(/[0-9]/g, '');

    // CJK https://www.unicode.org/charts/PDF/U3000.pdf, split by 2 types of chinese comma
    return noNumberPeople.split(/[\s,\u002C\uFF0C\+]+/).filter(e => e.trim()).map(e => e.trim());
}

submitButton.addEventListener('click', function(e) {
    e.preventDefault();

    people = parsePeople(peopleForm.value)

    parsedPeople.innerHTML = people.toString();
});

submitAdditionalPeopleButton.addEventListener('click', function(e) {
    e.preventDefault();
 
    people.push(...parsePeople(additionalPeopleForm.value));

    parsedPeople.innerHTML = people.toString();
});


// Example 2 - Shared lists
new Sortable(example2Left, {
	group: 'shared', // set both lists to same group
	animation: 150
});

new Sortable(example2Right, {
	group: 'shared',
	animation: 150
});
  
