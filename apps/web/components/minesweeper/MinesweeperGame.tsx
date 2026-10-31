'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, Group, Text, SegmentedControl, Badge } from '@mantine/core';
import { IconFlag, IconSearch, IconRefresh, IconTrophy, IconAlertTriangle } from '@tabler/icons-react';
import styles from './MinesweeperGame.module.css';

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
type TouchMode = 'reveal' | 'flag';
type Difficulty = 'easy' | 'medium';

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 8, cols: 8, mines: 10, label: 'Začátečník (8×8)' },
  medium: { rows: 10, cols: 10, mines: 16, label: 'Analytik (10×10)' },
};

interface CellState {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isExploded?: boolean;
  isFalseFlag?: boolean;
}

// Generate an empty board without mines (mines are placed on first reveal)
function createEmptyBoard(config: DifficultyConfig): CellState[][] {
  return Array.from({ length: config.rows }, (_, r) =>
    Array.from({ length: config.cols }, (_, c) => ({
      row: r,
      col: c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );
}

// Place mines randomly ensuring clicked cell and its immediate neighbors remain safe
function placeMines(
  config: DifficultyConfig,
  safeRow: number,
  safeCol: number
): CellState[][] {
  const board = createEmptyBoard(config);

  const safeZone = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeRow + dr;
      const nc = safeCol + dc;
      if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
        safeZone.add(`${nr},${nc}`);
      }
    }
  }

  const candidateCells: [number, number][] = [];
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (!safeZone.has(`${r},${c}`)) {
        candidateCells.push([r, c]);
      }
    }
  }

  // Shuffle candidate cells (Fisher-Yates)
  for (let i = candidateCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateCells[i], candidateCells[j]] = [candidateCells[j], candidateCells[i]];
  }

  let minesPlaced = 0;
  while (minesPlaced < config.mines && candidateCells.length > 0) {
    const [mr, mc] = candidateCells.pop()!;
    board[mr][mc].isMine = true;
    minesPlaced++;
  }

  // If there are still mines needed (rare edge case on small boards), allow in outer safeZone (not origin)
  if (minesPlaced < config.mines) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = safeRow + dr;
        const nc = safeCol + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && !board[nr][nc].isMine) {
          board[nr][nc].isMine = true;
          minesPlaced++;
          if (minesPlaced >= config.mines) break;
        }
      }
      if (minesPlaced >= config.mines) break;
    }
  }

  // Calculate neighbor mine numbers
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].neighborMines = count;
    }
  }

  return board;
}

// Check if all non-mine cells are revealed
function checkWinCondition(currentBoard: CellState[][], config: DifficultyConfig): boolean {
  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const cell = currentBoard[r][c];
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const config = DIFFICULTIES[difficulty];

  const [board, setBoard] = useState<CellState[][]>(() => createEmptyBoard(config));
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [touchMode, setTouchMode] = useState<TouchMode>('reveal');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isClicking, setIsClicking] = useState(false);

  // References for long-press and timer handling
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressFireRef = useRef(false);

  // Stop running timer on unmount or state change
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset game
  const resetGame = useCallback(
    (newDiff?: Difficulty) => {
      stopTimer();
      const currentDiff = newDiff || difficulty;
      const currentConfig = DIFFICULTIES[currentDiff];
      setBoard(createEmptyBoard(currentConfig));
      setGameStatus('idle');
      setElapsedTime(0);
      setIsClicking(false);
    },
    [difficulty, stopTimer]
  );

  // Difficulty switch handler
  const handleDifficultyChange = (val: string) => {
    const newDiff = val as Difficulty;
    setDifficulty(newDiff);
    resetGame(newDiff);
  };

  // Timer runner
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => Math.min(prev + 1, 999));
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [gameStatus, stopTimer]);

  // Count placed flags
  const flagsCount = board.reduce(
    (acc, row) => acc + row.reduce((rAcc, cell) => rAcc + (cell.isFlagged ? 1 : 0), 0),
    0
  );
  const remainingMines = config.mines - flagsCount;

  // Toggle flag on a cell
  const toggleFlag = useCallback((r: number, c: number) => {
    setBoard((prevBoard) => {
      const cell = prevBoard[r][c];
      if (cell.isRevealed) return prevBoard;

      const nextBoard = prevBoard.map((row) => row.map((item) => ({ ...item })));
      nextBoard[r][c].isFlagged = !cell.isFlagged;

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(30);
      }

      return nextBoard;
    });
  }, []);

  // Reveal cell action (with zero flood-fill and mine explosion detection)
  const revealCellAt = useCallback(
    (r: number, c: number) => {
      setBoard((prevBoard) => {
        const cell = prevBoard[r][c];
        if (cell.isRevealed || cell.isFlagged) return prevBoard;

        let workingBoard = prevBoard;

        // If game is idle, this is the very first click: place mines safely
        if (gameStatus === 'idle') {
          workingBoard = placeMines(config, r, c);
          setGameStatus('playing');
        }

        const nextBoard = workingBoard.map((row) => row.map((item) => ({ ...item })));
        const target = nextBoard[r][c];

        // Exploded on mine
        if (target.isMine) {
          target.isExploded = true;
          // Reveal all mines and mark false flags
          for (let rowIdx = 0; rowIdx < config.rows; rowIdx++) {
            for (let colIdx = 0; colIdx < config.cols; colIdx++) {
              const current = nextBoard[rowIdx][colIdx];
              if (current.isMine) {
                current.isRevealed = true;
              } else if (current.isFlagged) {
                current.isFalseFlag = true;
              }
            }
          }
          setGameStatus('lost');
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([100, 50, 100]);
          }
          return nextBoard;
        }

        // BFS Flood fill
        const queue: [number, number][] = [[r, c]];
        target.isRevealed = true;

        while (queue.length > 0) {
          const [currR, currC] = queue.shift()!;
          const currCell = nextBoard[currR][currC];

          if (currCell.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = currR + dr;
                const nc = currC + dc;
                if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                  const neighbor = nextBoard[nr][nc];
                  if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                    neighbor.isRevealed = true;
                    if (neighbor.neighborMines === 0) {
                      queue.push([nr, nc]);
                    }
                  }
                }
              }
            }
          }
        }

        // Check if player won
        if (checkWinCondition(nextBoard, config)) {
          // Flag all mines for clean victory view
          for (let rowIdx = 0; rowIdx < config.rows; rowIdx++) {
            for (let colIdx = 0; colIdx < config.cols; colIdx++) {
              if (nextBoard[rowIdx][colIdx].isMine) {
                nextBoard[rowIdx][colIdx].isFlagged = true;
              }
            }
          }
          setGameStatus('won');
        }

        return nextBoard;
      });
    },
    [config, gameStatus]
  );

  // Chording: clicking an already revealed cell with matching flagged neighbors
  const handleChord = useCallback(
    (r: number, c: number) => {
      const cell = board[r][c];
      if (!cell.isRevealed || cell.neighborMines === 0 || gameStatus !== 'playing') return;

      // Count adjacent flags
      let adjacentFlags = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
            if (board[nr][nc].isFlagged) {
              adjacentFlags++;
            }
          }
        }
      }

      // If flag count matches the cell's number, reveal unflagged neighbors
      if (adjacentFlags === cell.neighborMines) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
              if (!board[nr][nc].isRevealed && !board[nr][nc].isFlagged) {
                revealCellAt(nr, nc);
              }
            }
          }
        }
      }
    },
    [board, config, gameStatus, revealCellAt]
  );

  // Handle cell click (Desktop left-click or mobile tap)
  const handleCellClick = (r: number, c: number) => {
    if (didLongPressFireRef.current) {
      didLongPressFireRef.current = false;
      return;
    }
    if (gameStatus === 'lost' || gameStatus === 'won') return;

    const cell = board[r][c];

    // If cell is already revealed, try chording
    if (cell.isRevealed) {
      handleChord(r, c);
      return;
    }

    if (touchMode === 'flag') {
      toggleFlag(r, c);
    } else {
      revealCellAt(r, c);
    }
  };

  // Right-click handles flag placement
  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus === 'lost' || gameStatus === 'won') return;
    toggleFlag(r, c);
  };

  // Mobile long-press handlers
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    if (gameStatus === 'lost' || gameStatus === 'won') return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    didLongPressFireRef.current = false;

    longPressTimeoutRef.current = setTimeout(() => {
      didLongPressFireRef.current = true;
      toggleFlag(r, c);
    }, 350);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || !longPressTimeoutRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    // If movement is larger than 8px, cancel long-press (user is scrolling)
    if (dx > 8 || dy > 8) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Face icon state
  const getFaceIcon = () => {
    if (gameStatus === 'won') return '😎';
    if (gameStatus === 'lost') return '💥';
    if (isClicking) return '😮';
    return '🙂';
  };

  // Formatted digital counters (e.g. 010 or -02)
  const formatNumber = (num: number) => {
    if (num < 0) {
      return `-${Math.abs(num).toString().padStart(2, '0')}`;
    }
    return Math.min(Math.max(num, 0), 999).toString().padStart(3, '0');
  };

  return (
    <Box className={styles.gameCard}>
      {/* Controls row: Difficulty and Mobile Tool Mode */}
      <Box className={styles.controlsRow}>
        <SegmentedControl
          size="xs"
          value={difficulty}
          onChange={handleDifficultyChange}
          data={[
            { label: 'Snadná (8×8)', value: 'easy' },
            { label: 'Analytik (10×10)', value: 'medium' },
          ]}
        />

        <SegmentedControl
          size="xs"
          value={touchMode}
          onChange={(val) => setTouchMode(val as TouchMode)}
          data={[
            {
              label: (
                <Group gap={4} justify="center">
                  <IconSearch size={14} />
                  <span>Odkrýt</span>
                </Group>
              ),
              value: 'reveal',
            },
            {
              label: (
                <Group gap={4} justify="center">
                  <IconFlag size={14} />
                  <span>Označit</span>
                </Group>
              ),
              value: 'flag',
            },
          ]}
        />
      </Box>

      {/* Top HUD: Flag counter, Face button, Elapsed timer */}
      <Box className={styles.hudBar}>
        <Box className={styles.digitalDisplay} title="Zbývající miny k označení">
          <span className={styles.digitalIcon}>🚩</span>
          <span>{formatNumber(remainingMines)}</span>
        </Box>

        <button
          type="button"
          className={styles.faceButton}
          onClick={() => resetGame()}
          aria-label="Restartovat hru"
          title="Nová hra"
        >
          {getFaceIcon()}
        </button>

        <Box className={styles.digitalDisplay} title="Uplynulý čas v sekundách">
          <span className={styles.digitalIcon}>⏱️</span>
          <span>{formatNumber(elapsedTime)}</span>
        </Box>
      </Box>

      {/* Minesweeper Grid Board */}
      <Box className={styles.boardContainer}>
        <Box
          className={styles.boardGrid}
          style={{
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
          }}
          onMouseDown={() => setIsClicking(true)}
          onMouseUp={() => setIsClicking(false)}
          onMouseLeave={() => setIsClicking(false)}
        >
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              let content: React.ReactNode = null;
              let cellClass = `${styles.cell} `;

              if (cell.isRevealed) {
                cellClass += styles.cellRevealed;
                if (cell.isMine) {
                  content = '💣';
                  if (cell.isExploded) {
                    cellClass += ` ${styles.cellExploded}`;
                  }
                } else if (cell.neighborMines > 0) {
                  content = cell.neighborMines;
                  cellClass += ` ${styles[`num${cell.neighborMines}`]} ${styles.cellChordable}`;
                }
              } else if (cell.isFlagged) {
                cellClass += styles.cellUnrevealed;
                content = cell.isFalseFlag ? '❌' : '🚩';
              } else {
                cellClass += styles.cellUnrevealed;
              }

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  className={cellClass}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  onContextMenu={(e) => handleContextMenu(e, rIdx, cIdx)}
                  onTouchStart={(e) => handleTouchStart(e, rIdx, cIdx)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  aria-label={`Pole [${rIdx + 1}, ${cIdx + 1}]`}
                >
                  {content}
                </button>
              );
            })
          )}
        </Box>
      </Box>

      {/* Outcome banners */}
      {gameStatus === 'won' && (
        <Box className={`${styles.statusBanner} ${styles.statusBannerWin}`}>
          <Group gap={6} justify="center" mb={6}>
            <IconTrophy size={20} color="var(--mantine-color-brandTeal-6)" />
            <Text fw={700} c="brandTeal.8">
              Skvělá práce! Všechna data jsou ověřena.
            </Text>
          </Group>
          <Text size="sm" mb={10}>
            Vyhnuli jste se všem {config.mines} nástrahám a dezinformacím v čase{' '}
            <strong>{elapsedTime} sekund</strong>. Datová žurnalistika vám jde od ruky!
          </Text>
          <Button
            size="xs"
            variant="filled"
            color="teal"
            leftSection={<IconRefresh size={14} />}
            onClick={() => resetGame()}
          >
            Hrát další kolo
          </Button>
        </Box>
      )}

      {gameStatus === 'lost' && (
        <Box className={`${styles.statusBanner} ${styles.statusBannerLoss}`}>
          <Group gap={6} justify="center" mb={6}>
            <IconAlertTriangle size={20} color="var(--mantine-color-brand-6)" />
            <Text fw={700} c="brand.7">
              Pozor na neověřené zdroje!
            </Text>
          </Group>
          <Text size="sm" mb={10}>
            Narazili jste na chybný údaj. V datové žurnalistice stačí jedna nepodložená informace
            a celá hypotéza padá. Zkuste to znovu a s rozvahou!
          </Text>
          <Button
            size="xs"
            variant="filled"
            color="red"
            leftSection={<IconRefresh size={14} />}
            onClick={() => resetGame()}
          >
            Zkusit znovu
          </Button>
        </Box>
      )}

      {/* Legend & Tips */}
      <Box className={styles.metaInfo}>
        <Group justify="space-between" align="center">
          <Group gap={8}>
            <Badge size="xs" color="gray" variant="light">
              Tip
            </Badge>
            <Text size="xs">
              Na mobilu přepněte režim nahoře (nebo podržte prst pro vlaječku 🚩).
            </Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
