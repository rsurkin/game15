export default (game15 = {}, {type, id}) => {
  switch (type) {
    case 'MOVE_TILE':
      return moveTile(game15, id);
    case 'NEW_GAME':
      return createNewGame();
    case 'UNDO':
      return undo(game15, false);
    case 'REDO':
      return undo(game15, true);
    case 'SAVE':
      return save(game15);
    case 'RESTORE':
      return restore(game15);
    default:
      return game15;
  }
}

const GAME_SAVE_KEY = `game15save`

const save = (game15) => {
  localStorage.setItem(
    GAME_SAVE_KEY,
    JSON.stringify(game15)
  );

  return {
    ...game15,
    restoreAvailable: true
  }
}

const restore = (game15) => {
  // в идеале какую то схему, котороая провалидирует JSON, но я себе доверяю
  const newGame15 = JSON.parse(
    localStorage.getItem(GAME_SAVE_KEY)
  );

  if (!newGame15) {
    return game15;
  }

  return {
    ...newGame15
  };
}

const undo = (game15, redo) => {
  const {
    undoStack,
    stackPointer,
    restoreAvailable,
  } = game15;

  const direction = redo ? +1 : -1;
  const nextStackPointer = stackPointer + direction;

  if (!undoStack[nextStackPointer]) {
    return game15;
  }

  const tiles = [
    ...undoStack[nextStackPointer]
  ];

  return {
    restoreAvailable: restoreAvailable,
    tiles: tiles,
    undoStack: [...undoStack],
    stackPointer: nextStackPointer,
    undoAvailable: nextStackPointer > 0,
    redoAvailable: nextStackPointer < undoStack.length - 1,
  }
};

const moveTile = (game15, id) => {
  const {
    tiles,
    undoStack,
    stackPointer,
    restoreAvailable,
  } = game15;
  if (!moveAvailable(tiles, id)) {
    return game15;
  }

  const positionOfZero = tiles.indexOf(0);
  const positionOfElement = tiles.indexOf(id);

  const newTiles = [
    ...tiles
  ];

  newTiles[positionOfZero] = id;
  newTiles[positionOfElement] = 0;

  const nextUndoStack = [
    ...undoStack.slice(0, stackPointer + 1),
    newTiles,
  ];

  return {
    restoreAvailable: restoreAvailable,
    undoStack: nextUndoStack,
    undoAvailable: true,
    redoAvailable: false,
    stackPointer: nextUndoStack.length - 1,
    tiles: newTiles,
  };
};

const moveAvailable = (tiles, id) => {
  const positionOfZero = tiles.indexOf(0) + 1;
  const positionOfElement = tiles.indexOf(id) + 1;

  const elementNotLastAtString = (positionOfElement % 4) !== 0;
  const elementNotFirstAtString = (positionOfElement % 4) !== 1;

  return (
    (positionOfElement + 1 === positionOfZero && elementNotLastAtString)
    || (positionOfElement - 1 === positionOfZero && elementNotFirstAtString)
    || positionOfElement - 4 === positionOfZero
    || positionOfElement + 4 === positionOfZero
  )
};

const createNewGame = () => {
  const tiles = [
    ...Array(16).keys()
  ]
    .sort(() => Math.random() - 0.5)
    .sort((a, b) => b === 0 ? -1 : 0)
    ;

  return {
    // за рамками задачи, выделить, ф-ию isRestore available, и зануть это в другой файл
    restoreAvailable: localStorage.getItem(GAME_SAVE_KEY) !== null,
    undoStack: [
      tiles
    ],
    undoAvailable: false,
    redoAvailable: false,
    stackPointer: 0,
    tiles: tiles,
  }
};