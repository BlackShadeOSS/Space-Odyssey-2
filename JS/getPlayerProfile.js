// dont work yet

function getPlayerProfile(nickname) {
    var nicknametosent = nickname.toString();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://drukara.ddns.net:4000/profile_data", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(
        JSON.stringify({
            nickname: nicknametosent,
        })
    );
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = Object.values(JSON.parse(xhr.responseText));
            var playerData = { nickname: "", games: 0, totaltime: 0 };
            var last10games = [];

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
                if (rowData.nickname == nickname && last10games.length < 10) {
                    last10games.push(rowData);
                }
            });

            last10games.forEach(function (rowData) {
                var time = new Date(rowData.time);
                var minutes = time.getMinutes().toString().padStart(2, "0");
                var seconds = time.getSeconds().toString().padStart(2, "0");
                rowData.time = minutes + ":" + seconds;
            });

            last10games.sort(function (a, b) {
                return a.id - b.id;
            });

            console.log(playerData);
            console.log(last10games);
        }
    };
}
