import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

import Cell from "./Cell";

let client: Client;

function Canvas() {
  const [colorGrid, setColorGrid] = useState([
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "],
  ]);
  const [symbol, setSymbol] = useState("X");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!client) {
      client = new Client({
        brokerURL: "ws://localhost:8080/demo-websocket",
        onConnect: () => {
          client.subscribe("/app/canvas", (message) => {
            const body = JSON.parse(message.body);
            setColorGrid(body["colorGrid"]);
            setSymbol(body["currentPlayer"]);
          });

          client.subscribe("/topic/canvas", (message) => {
            const body = JSON.parse(message.body);
            setColorGrid(body["colorGrid"]);
            setSymbol(body["currentPlayer"]);
          });
        },
      });

      client.activate();
    }
  }, []);

  const paint = (x: number, y: number) => {
    if (colorGrid[y][x] !== " " || symbol !== symbol || gameOver) {
      return;
    }

    const newColorGrid = [...colorGrid];
    newColorGrid[y][x] = symbol;
    setColorGrid(newColorGrid);

    const paintMessage = { color: symbol, posX: x, posY: y };
    client.publish({
      destination: "/app/paint",
      body: JSON.stringify(paintMessage),
    });

    if (checkGameEnd(newColorGrid, symbol)) {
      alert(`${symbol} wins!`);
      setGameOver(true);
    } else if (newColorGrid.every((row) => row.every((cell) => cell !== " "))) {
      alert("Tie game!");
      setGameOver(true);
    } else {
      setSymbol(symbol === "X" ? "O" : "X");
    }
  };

  const reset = () => {
    setColorGrid([
      [" ", " ", " "],
      [" ", " ", " "],
      [" ", " ", " "],
    ]);
    setSymbol("X");
    setGameOver(false);
    if (client) {
      if (client.connected) {
        client.publish({ destination: "/app/reset", body: "" });
      }
    }
  };

  function checkGameEnd(colorGrid: string[][], symbol: string): boolean {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (
        colorGrid[row][0] === symbol &&
        colorGrid[row][1] === symbol &&
        colorGrid[row][2] === symbol
      ) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (
        colorGrid[0][col] === symbol &&
        colorGrid[1][col] === symbol &&
        colorGrid[2][col] === symbol
      ) {
        return true;
      }
    }

    // Check diagonal from top left to bottom right
    if (
      colorGrid[0][0] === symbol &&
      colorGrid[1][1] === symbol &&
      colorGrid[2][2] === symbol
    ) {
      return true;
    }

    // Check diagonal from bottom left to top right
    if (
      colorGrid[0][2] === symbol &&
      colorGrid[1][1] === symbol &&
      colorGrid[2][0] === symbol
    ) {
      return true;
    }

    // If none of the above conditions are true, the game has not ended
    return false;
  }

  return (
    <div>
      <table
        style={{
          borderCollapse: "collapse",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <tbody
          style={{
            alignItems: "center",
            margin: "10vh",
          }}
        >
          {colorGrid.map((row, j) => (
            <tr key={j}>
              {row.map((col, i) => (
                <Cell
                  x={i}
                  y={j}
                  key={`${i}${j}`}
                  paint={paint}
                  symbol={colorGrid[j][i]}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={reset}>New Game</button>
    </div>
  );
}

export default Canvas;
