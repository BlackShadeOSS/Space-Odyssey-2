function getPlayerProfile(nickname) {
    var nicknametosent = nickname.toString();
    var best5gamesTable = document.getElementById("best5games");
    var playerDataDiv = document.getElementById("playerData");
    var h2 = document.querySelector("h2");
    if (nicknametosent == "") {
        playerDataDiv.innerHTML =
            '<p style="color:red;"><u>No Logged In Profile</u></p>' +
            "<br>" +
            "<p>Log in now or Create profile</p>" +
            "<br>" +
            "<button onclick='createNewProfile()'>Create Profile</button>" +
            "<button onclick='createNewProfile()'>Log In</button>";
        document.getElementById("best5games").style.display = "none";
        h2.style.display = "none";
        return;
    }
    if (nicknametosent != "") {
        document.getElementById("best5games").style.display = "block";
        h2.style.display = "block";
    }
    var xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        "http://drukara.ddns.net:4000/profile_data?nickname=" + nicknametosent,
        true
    );
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = Object.values(JSON.parse(xhr.responseText));
            var playerData = { nickname: "", games: 0, totaltime: 0 };
            var best5games = [];

            if (data.length == 0) {
                playerDataDiv.innerHTML =
                    "<p>No Data Found for: </p><u><p>" +
                    nickname +
                    "</p></u><br>" +
                    "<p>If you want to log out click the button below</p>" +
                    "<br>" +
                    "<button onclick='logOut()'>Log Out</button>";
                document.getElementById("best5games").style.display = "none";
                h2.style.display = "none";
                return;
            }

            data.forEach(function (rowData) {
                if (rowData.nickname == nickname) {
                    playerData.nickname = rowData.nickname;
                    playerData.games += 1;
                    playerData.totaltime += rowData.time;
                }
            });

            playerData.totaltime = new Date(playerData.totaltime);
            var minutes = playerData.totaltime
                .getMinutes()
                .toString()
                .padStart(2, "0");
            var seconds = playerData.totaltime
                .getSeconds()
                .toString()
                .padStart(2, "0");
            playerData.totaltime = minutes + ":" + seconds;

            data.forEach(function (rowData) {
                if (rowData.nickname == nickname && best5games.length < 5) {
                    best5games.push(rowData);
                }
            });

            best5games.forEach(function (rowData) {
                var time = new Date(rowData.time);
                var minutes = time.getMinutes().toString().padStart(2, "0");
                var seconds = time.getSeconds().toString().padStart(2, "0");
                rowData.time = minutes + ":" + seconds;
            });

            if (playerData.nickname == "") {
                return;
            } else {
                playerDataDiv.innerHTML =
                    "<p>Nickname: <u>" +
                    playerData.nickname +
                    "</u></p>" +
                    "<p>Total Games: <u>" +
                    playerData.games +
                    "</u></p>" +
                    "<p>Total Time: <u>" +
                    playerData.totaltime +
                    "</u></p>" +
                    "<br><br>" +
                    "<button onclick='logOut()'>Log Out</button>";
                best5games.forEach(function (rowData) {
                    best5gamesTable.innerHTML +=
                        "<tr>" +
                        "<td>" +
                        rowData.nickname +
                        "</td>" +
                        "<td>" +
                        rowData.level +
                        "</td>" +
                        "<td>" +
                        rowData.time +
                        "</td>" +
                        "</tr>";
                });
            }
        }
    };
}

function createNewProfile() {
    var nickname = getCookie("nickname");
    var profileContainer = document.querySelector(".profileContainer");
    if (document.getElementById("nicknameScreen")) {
        document.body.removeChild(document.getElementById("nicknameScreen"));
    }
    profileContainer.style.filter = "blur(10px)";
    var nicknameScreen = document.createElement("div");
    nicknameScreen.id = "nicknameScreen";
    nicknameScreen.innerHTML = `
    <div id="nicknameScreenContent">
        <h1>Enter your nickname</h1>
        <input type="text" id="nicknameInput" placeholder="Nickname" maxlength="15">
        <br>
        <button id="nicknameButton">Submit</button>
    </div>
    `;
    document.body.appendChild(nicknameScreen);
    document.getElementById("nicknameButton").addEventListener("click", () => {
        if (document.getElementById("nicknameInput").value == "") {
            return;
        }
        nickname = document.getElementById("nicknameInput").value;
        setCookie("nickname", nickname, 365);
        document.body.removeChild(nicknameScreen);
        profileContainer.style.filter = "blur(0px)";
        getPlayerProfile(getCookie("nickname"));
    });
}

function logOut() {
    setCookie("nickname", "", 365);
    getPlayerProfile(getCookie("nickname"));
}

getPlayerProfile(getCookie("nickname"));
