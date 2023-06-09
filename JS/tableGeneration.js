// use xhr to dowload data in json format form server and generate table in html
const scoreboard = document.querySelector(".scoreboard");
const buttons = document.querySelectorAll(".switchButton");
// get data from server if it is available if not swich to other server
function getData(server = "main") {
    var xhr = new XMLHttpRequest();
    if (server == "main") {
        xhr.open("GET", "http://drukara.ddns.net:4000/game_data", true);
    } else if (server == "backup") {
        xhr.open(
            "GET",
            "https://space-odyssey-2-dataserver.diaxsio10.repl.co/game_data",
            true
        );
    }
    xhr.send();
    xhr.onerror = () => {
        if (server == "main") {
            getData("backup");
        } else if (server == "backup") {
            scoreboard.innerHTML = `<h1>Server is down</h1>`;
        }
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = Object.values(JSON.parse(xhr.responseText));
            var level6data = [];
            //get data from level 6 and push it to new array and remove it from old array
            data.forEach(function (rowData) {
                if (rowData.level == 6) {
                    level6data.push(rowData);
                    data.splice(data.indexOf(rowData), 1);
                }
            });
            //sort data by time
            level6data.sort(function (a, b) {
                return a.time - b.time;
            });

            //sort data by time ascending if level is below 5 and decending if level 5 and by level from highest to lowest
            data.sort(function (a, b) {
                if (a.level < 5 && b.level < 5 && a.level == b.level) {
                    return b.time - a.time;
                } else if (a.level == 5 && b.level == 5) {
                    return a.time - b.time;
                } else {
                    return b.level - a.level;
                }
            });

            level6data.forEach(function (
                rowData,
                index = data.indexOf(rowData)
            ) {
                rowData._id = index + 1;
                delete rowData.level;

                //change miliseconds to minutes and seconds
                var time = new Date(rowData.time);
                var minutes = time.getMinutes().toString().padStart(2, "0");
                var seconds = time.getSeconds().toString().padStart(2, "0");
                rowData.time = minutes + ":" + seconds;
            });
            //change _id to place in table
            data.forEach(function (rowData, index = data.indexOf(rowData)) {
                rowData._id = index + 1;

                //change miliseconds to minutes and seconds
                var time = new Date(rowData.time);
                var minutes = time.getMinutes().toString().padStart(2, "0");
                var seconds = time.getSeconds().toString().padStart(2, "0");
                rowData.time = minutes + ":" + seconds;
            });

            if (data.length > 25) {
                data.splice(25);
            }

            if (level6data.length > 25) {
                level6data.splice(25);
            }

            generateTable(data, "table1-5");
            generateTable(level6data, "table6");
        }
    };
}

// generate table in html
function generateTable(tableData, id) {
    var table = document.createElement("table");
    table.innerHTML = `
    <table>
    <thead>
        <tr>
            <th>Place</th>
            <th>Nickname</th>
            ${id == "table1-5" ? "<th>Level</th>" : ""}
            <th>Time</th>
        </tr>
    </thead>
    </table>`;
    table.setAttribute("id", id);
    var tableBody = document.createElement("tbody");

    if (tableData.length == 0) {
        table.innerHTML = `
        <table>
        <thead>
            <tr>
                <th>No Data Yet</th>
            </tr>
        </thead>
        </table>`;
    } else {
        tableData.forEach(function (rowData) {
            rowData = Object.values(rowData);
            var row = document.createElement("tr");

            rowData.forEach(function (cellData) {
                var cell = document.createElement("td");
                cell.appendChild(document.createTextNode(cellData));
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    if (id == "table1-5") {
        table.style.display = "block";
    }

    table.appendChild(tableBody);
    scoreboard.appendChild(table);
}

// generate table when page is loaded
window.onload = function () {
    getData();
};

window.addEventListener("load", function () {
    buttons.forEach(function (button) {
        button.addEventListener("click", switchTable);
    });
});

// swich between tables
function switchTable() {
    var table1 = document.getElementById("table1-5");
    var table6 = document.getElementById("table6");
    if (buttons[1].classList.contains("activeButton")) {
        table1.style.display = "block";
        table6.style.display = "none";
        buttons[0].classList.toggle("activeButton");
        buttons[1].classList.toggle("activeButton");
        adaptFooter();
    } else if (buttons[0].classList.contains("activeButton")) {
        table1.style.display = "none";
        table6.style.display = "block";
        buttons[0].classList.toggle("activeButton");
        buttons[1].classList.toggle("activeButton");
        adaptFooter();
    }
}
