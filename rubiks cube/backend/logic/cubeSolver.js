import Cube from "cubejs";

// INIT ONCE (SYNC)
console.log("INIT SOLVER START");
Cube.initSolver();
console.log("INIT SOLVER DONE");

export function solveCube(cubeData) {
    console.log("solve start");
  const cube = Cube.fromString(cubeData);
    console.log("cube created");
  if (cube.isSolved()) {
    console.log("already solved");
    return [];
  }

  const solution = cube.solve();
  console.log("solve done");
  return solution.split(" ");
}
