import React from "react";

export type CellProps = {
  x: number;
  y: number;
  symbol: string;
  paint: (x: number, y: number) => void;
};

const Cell = ({ x, y, symbol, paint }: CellProps) => {
  return (
    <td
      draggable="true"
      style={{
        display: "flexbox",
        justifyContent: "center",
        alignItems: "center",
        width: "5rem",
        height: "5rem",
        cursor: "pointer",
        border: "1px solid",
      }}
      onClick={() => paint(x, y)}
      onDragEnter={() => paint(x, y)}
    >
      {symbol}
    </td>
  );
};

export default React.memo(Cell);
