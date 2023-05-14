// use xhr to dowload data in json format form server and generate table in html

// get data from server
function getData() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://drukara.ddns.net:4000/game_data", true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = Object.values(JSON.parse(xhr.responseText));
            //change id to place in table
            data.forEach(function (rowData, index = data.indexOf(rowData)) {
                rowData.id = index + 1;

                //change miliseconds to minutes and seconds
                var time = new Date(rowData.time);
                var minutes = time.getMinutes().toString().padStart(2, "0");
                var seconds = time.getSeconds().toString().padStart(2, "0");
                rowData.time = minutes + ":" + seconds;
            });
            generateTable(data);
        }
    };
}

// generate table in html
function generateTable(tableData) {
    var tableBody = document.querySelector("tbody");
    console.log(tableData);

    tableData.forEach(function (rowData) {
        rowData = Object.values(rowData);
        var row = document.createElement("tr");

        console.log(rowData);

        rowData.forEach(function (cellData) {
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// generate table when page is loaded
window.onload = function () {
    getData();
};
