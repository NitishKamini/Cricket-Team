const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "cricketTeam.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error message: ${error.message}`);
  }
};

initializeDBAndServer();

// API - ONE

const convertObject = (eachObject) => {
  return {
    playerId: eachObject.player_id,
    playerName: eachObject.player_name,
    jerseyNumber: eachObject.jersey_number,
    role: eachObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer) => convertObject(eachPlayer)));
});

// API - TWO

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `INSERT INTO cricket_team(player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await database.run(createPlayerQuery);
  response.send("Player Added to Team");
});

// API - THREE

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const playerDetails = await database.get(getPlayerQuery);
  response.send(convertObject(playerDetails));
});

// API - FOUR

app.put("/players/:playerId/", async (request, response) => {
  const newDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = newDetails;
  const updatePlayerQuery = `UPDATE cricket_team 
     SET player_name = '${playerName}',jersey_number = ${jerseyNumber},role = '${role}'
     WHERE player_id = ${playerId};`;
  const dbResponse = await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API - FIVE

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const dbResponse = await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
