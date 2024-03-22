const peopleForm = document.getElementById("people_list");

const additionalPeopleForm = document.getElementById("additional_people_list");
const submitAdditionalPeopleButton = document.getElementById(
    "submit_additional_people_list"
);

const summary = document.getElementById("summary");

const groupQuantity = document.getElementById("group_quantity");
const submitCreateGroupPoolBotton = document.getElementById(
    "submit_create_group_pools"
);

const groupsPerRow = document.getElementById("groups_per_row");

const groupPoolLists = document.getElementById("group_pool_lists");

const submitClearButton = document.getElementById("submit_clear");
const leaderCheckbox = document.getElementById("leader_checkbox");
const submitGenerateSummaryButton = document.getElementById(
    "submit_generate_summary"
);

const personIdPrefix = "person";
const groupIdPrefix = "group";
const rowIdPrefix = "row";

var people;

function parsePeople(peopleSourceString) {
    const trimmedPeopleSource = peopleSourceString.trim();
    const noNumberPeople = trimmedPeopleSource.replace(/[0-9]/g, "");

    // CJK https://www.unicode.org/charts/PDF/U3000.pdf, split by 2 types of chinese comma
    return noNumberPeople
        .split(/[,\/\u002C\uFF0C\+＋\.．]+/)
        .filter((e) => e.trim())
        .map((e) => e.trim());
}

const _createGroupDiv = function (peopleInGroup, groupIndex) {
    const groupDiv = document.createElement("div");
    const groupId = groupIdPrefix + groupIndex;
    groupDiv.id = groupId;

    groupDivColNumber = 12 / groupsPerRow.value;
    groupDiv.className = "list-group col-" + groupDivColNumber;

    peopleInGroup.forEach(function (person, personIndex) {
        const personDiv = document.createElement("div");
        personDiv.id = groupId + personIdPrefix + personIndex;
        personDiv.className = "list-group-item";

        const personTextElement = document.createElement("span");
        personTextElement.textContent = person;

        personTextElement.addEventListener("dblclick", function (e) {
            e.preventDefault();
            personTextElement.contentEditable = true;
            personTextElement.focus();

            // Get the mouse coordinates
            var mouseX = e.clientX;
            var mouseY = e.clientY;

            // Get the caret position at the mouse coordinates
            let caretPos;
            let textNode;
            let offset;

            if (document.caretPositionFromPoint) {
                caretPos = document.caretPositionFromPoint(e.clientX, e.clientY);
                textNode = caretPos.offsetNode;
                offset = caretPos.offset;
            } else if (document.caretRangeFromPoint) {
                // Use WebKit-proprietary fallback method
                caretPos = document.caretRangeFromPoint(e.clientX, e.clientY);
                textNode = caretPos.startContainer;
                offset = caretPos.startOffset;
            } else {
                // Neither method is supported, do nothing
                return;
            }

            // Check if a valid caret position is obtained
            if (caretPos) {
                // Create a range object
                var range = document.createRange();

                // Set the range start position based on the caret position
                range.setStart(textNode, offset);

                // Collapse the range to set the cursor position
                range.collapse(true);

                // Get the selection object
                var selection = window.getSelection();

                // Remove any existing selections
                selection.removeAllRanges();

                // Add the new range to the selection
                selection.addRange(range);
            }
        });
        personTextElement.addEventListener("blur", function () {
            // This code will execute when editing finishes (element loses focus)
            personTextElement.contentEditable = false; // Disable editing
        });
        personTextElement.addEventListener("mouseover", function (e) {
            e.preventDefault();
            personTextElement.style.backgroundColor = "coral";
        });
        personTextElement.addEventListener("mouseout", function (e) {
            e.preventDefault();
            personTextElement.style.backgroundColor = "";
        });

        personDiv.appendChild(personTextElement);

        const buttonElement = document.createElement("button");
        buttonElement.className = "btn-close float-end";
        buttonElement.ariaLabel = "Close";
        buttonElement.addEventListener("click", function (e) {
            e.preventDefault();
            const immediateGroupDiv = personDiv.parentElement;
            if (immediateGroupDiv.children.length === 1) {
                var currentRowDiv = immediateGroupDiv.parentElement;
                immediateGroupDiv.remove();

                while (currentRowDiv.nextSibling) {
                    nextRowDiv = currentRowDiv.nextSibling;
                    const nextRowDivFirstGroup = nextRowDiv.firstChild;
                    currentRowDiv.append(nextRowDivFirstGroup);
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

        groupDiv.appendChild(personDiv);
    });
    new Sortable(groupDiv, {
        group: "shared", // set all lists to same group
        animation: 150,
    });

    return groupDiv;
};

const _createRowDiv = function (rowIndex) {
    const rowDiv = document.createElement("div");
    rowDiv.id = rowIdPrefix + rowIndex;
    rowDiv.className = "row top-40";
    return rowDiv;
};

submitAdditionalPeopleButton.addEventListener("click", function (e) {
    e.preventDefault();

    const peopleInGroup = parsePeople(additionalPeopleForm.value);

    const lastRowDiv = groupPoolLists.lastChild;

    if (lastRowDiv == null) {
        const rowDiv = _createRowDiv(1);
        rowDiv.appendChild(_createGroupDiv(peopleInGroup, 1));
        groupPoolLists.appendChild(rowDiv);
    } else {
        const lastGroupId = lastRowDiv.lastChild.id.substring(groupIdPrefix.length);
        const lastGroupDiv = _createGroupDiv(
            peopleInGroup,
            Number(lastGroupId) + 1
        );
        if (lastRowDiv.children.length < Number(groupsPerRow.value)) {
            lastRowDiv.appendChild(lastGroupDiv);
        } else {
            const lastRowId = lastRowDiv.id.substring(rowIdPrefix.length);
            const newLastRowDiv = _createRowDiv(Number(lastRowId) + 1);
            newLastRowDiv.appendChild(lastGroupDiv);
            groupPoolLists.appendChild(newLastRowDiv);
        }
    }
});

submitCreateGroupPoolBotton.addEventListener("click", function (e) {
    e.preventDefault();

    people = parsePeople(peopleForm.value);
    const peopleInGroup = parsePeople(additionalPeopleForm.value);
    people.push(...peopleInGroup);

    groupPoolLists.innerHTML = "";

    const peopleTemp =
        typeof structuredClone === "function"
            ? structuredClone(people)
            : JSON.parse(JSON.stringify(people));

    const groups = [];
    const actualGroupQuantity =
        peopleTemp.length < Number(groupQuantity.value)
            ? peopleTemp.length
            : Number(groupQuantity.value);
    const groupCapacity = Math.floor(peopleTemp.length / actualGroupQuantity);
    const peopleOverGroupCapacityRemainder =
        peopleTemp.length % actualGroupQuantity;
    for (let group_index = 1; group_index <= actualGroupQuantity; group_index++) {
        groups.push(
            peopleTemp.splice(
                0,
                groupCapacity +
                (group_index <= peopleOverGroupCapacityRemainder ? 1 : 0)
            )
        );
    }

    const groupDivs = [];
    groups.forEach(function (peopleInGroup, groupIndex) {
        groupDivs.push(_createGroupDiv(peopleInGroup, groupIndex));
    });

    const rowDivs = [];
    while (groupDivs.length > 0) {
        rowDivs.push(groupDivs.splice(0, groupsPerRow.value));
    }

    rowDivs.forEach(function (row, rowIndex) {
        const rowDiv = _createRowDiv(rowIndex);
        row.forEach(function (groupDiv) {
            rowDiv.appendChild(groupDiv);
        });
        groupPoolLists.appendChild(rowDiv);
    });
});

submitClearButton.addEventListener("click", function (e) {
    e.preventDefault();
    people = [];
    groupPoolLists.innerHTML = "";
    summary.innerHTML = "";
});

submitGenerateSummaryButton.addEventListener("click", function (e) {
    e.preventDefault();

    const rowDivs = groupPoolLists.children;

    var allGroupsSummary = "";
    var groupNumber = 1;

    for (const rowDiv of rowDivs) {
        const groupDivs = rowDiv.children;

        for (const groupDiv of groupDivs) {
            peopleDivs = groupDiv.children;

            const peopleStringOfGroup = [];
            for (const personDiv of peopleDivs) {
                const personSourceString = personDiv.textContent;
                // turn 'Robin (will come home)' to 'Robin'
                const personParsed = personSourceString.replace(
                    / *(\(|（)[^)]*(\)|）) */g,
                    ""
                );
                peopleStringOfGroup.push(personParsed);
            }

            var groupSummary = "";
            for (
                var peopleIndex = 0;
                peopleIndex < peopleStringOfGroup.length;
                peopleIndex++
            ) {
                const personString = peopleStringOfGroup[peopleIndex];
                if (peopleIndex == 0 && leaderCheckbox.checked) {
                    groupSummary = groupNumber + ". " + personString + ": ";
                } else if (peopleIndex != peopleStringOfGroup.length - 1) {
                    groupSummary = groupSummary + personString + ", ";
                } else {
                    groupSummary = groupSummary + personString;
                }
            }
            if (groupSummary !== "") {
                allGroupsSummary = allGroupsSummary + groupSummary + "<br><br>";
                groupNumber++;
            }
        }
    }

    summary.innerHTML = allGroupsSummary;
});
