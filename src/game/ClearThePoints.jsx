import React, { useState, useEffect, useRef } from "react";

const ClearThePoints = () => {
  const autoPlayIntervalRef = useRef(null);
  const timeToHiddenIntervalRef = useRef(null);
  const timeoutDisappearRef = useRef(null);

  const [n, setN] = useState(5);
  const [numbers, setNumbers] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(1);
  const [autoNumberRestart, setAutoNumberRestart] = useState(false);
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [disappearedNumbers, setDisappearedNumbers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(2000);
  const [isTimeToHidden, setIsTimeToHidden] = useState(false);
  const [timeToHidden, setTimeToHidden] = useState(autoPlayInterval / 1000);

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const generateRandomPositions = (count) =>
    Array.from({ length: count }, () => ({
      left: `${Math.random() * 90}%`,
      top: `${Math.random() * 90}%`,
    }));

  const restartGame = () => {
    // Clear intervals & timeouts
    clearInterval(autoPlayIntervalRef.current);
    clearInterval(timeToHiddenIntervalRef.current);
    clearTimeout(timeoutDisappearRef.current);

    const newNumbers = Array.from({ length: n }, (_, i) => i + 1);
    setNumbers(shuffleArray(newNumbers).reverse());
    setPositions(generateRandomPositions(n));
    setCurrentSelection(1);
    setMessage("");
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameStarted(true);
    setSelectedNumbers([]);
    setDisappearedNumbers([]);
    setIsTimeToHidden(false);
    setTimeToHidden(autoPlayInterval / 1000);
    setAutoPlay(false);
    setAutoPlayInterval(2000);
  };

  const handleSuccess = () => {
    setMessage("ALL CLEARED");
    setGameStarted(false);
    setAutoPlay(false);
  };

  const handleGameOver = () => {
    setMessage("GAME OVER");
    setGameStarted(false);
    setAutoPlay(false);
  };

  const startCountdown = () => {
    clearInterval(timeToHiddenIntervalRef.current);
    setTimeToHidden(autoPlayInterval / 1000);
    setIsTimeToHidden(true);
  };

  const handleClick = (number) => {
    if (!gameStarted || selectedNumbers.includes(number)) return;
    if (number === currentSelection) {
      startCountdown();
      setSelectedNumbers((prev) => [...prev, number]);
      setAutoNumberRestart(false);
      timeoutDisappearRef.current = setTimeout(() => {
        setDisappearedNumbers((prev) => [...prev, number]);
      }, autoPlayInterval);
      if (number === n) {
        handleSuccess(); // Gọi sau khi đã ẩn
      } else {
        setCurrentSelection((prev) => prev + 1);
      }
    } else {
      handleGameOver();
    }
  };

  console.log("⏳ isTimeToHidden:", isTimeToHidden);

  useEffect(() => {
    if (startTime && gameStarted) {
      const timer = setInterval(() => {
        setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [startTime, gameStarted]);

  useEffect(() => {
    if (!isTimeToHidden) return;
    clearInterval(timeToHiddenIntervalRef.current);
    timeToHiddenIntervalRef.current = setInterval(() => {
      setTimeToHidden((prev) => {
        const next = parseFloat((prev - 0.1).toFixed(1));
        if (next <= 0) {
          clearInterval(timeToHiddenIntervalRef.current);
          return autoPlayInterval / 1000;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timeToHiddenIntervalRef.current);
  }, [isTimeToHidden, autoPlayInterval, currentSelection, n]);

  useEffect(() => {
    if (autoPlay && gameStarted) {
      // Click ngay số đầu tiên
      if (autoNumberRestart) {
        handleClick(currentSelection);
      }
      // Sau đó tự động click các số tiếp theo mỗi autoPlayInterval
      autoPlayIntervalRef.current = setInterval(() => {
        if (currentSelection <= n) {
          handleClick(currentSelection);
        } else {
          clearInterval(autoPlayIntervalRef.current);
        }
      }, autoPlayInterval);

      return () => clearInterval(autoPlayIntervalRef.current);
    } else {
      // Nếu không autoPlay, reset trạng thái liên quan
      setAutoNumberRestart(true);
    }
  }, [autoPlay, gameStarted, message, currentSelection, n]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1
        className={`text-2xl font-bold transition-colors duration-300 ${
          message === "ALL CLEARED"
            ? "text-green-500"
            : message === "GAME OVER"
            ? "text-red-500"
            : "text-gray-800"
        }`}
      >
        {message || "LET'S PLAY"}
      </h1>

      <div className="flex gap-3">
        <label className="font-medium">Points:</label>
        <input
          type="number"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          min="1"
          className="w-20 border rounded px-2 py-1 outline-blue-400"
        />
      </div>

      <div className="flex gap-4">
        <span className="font-medium">Time:</span>
        <span className="text-blue-600 font-mono">{elapsedTime}s</span>
      </div>

      <div className="flex gap-4">
        {!gameStarted ? (
          <button
            onClick={restartGame}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
          >
            Play
          </button>
        ) : (
          <>
            <button
              onClick={restartGame}
              className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
            >
              Restart
            </button>
            <>
              {autoPlay ? (
                <button
                  onClick={() => setAutoPlay(false)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                >
                  Auto Play Off
                </button>
              ) : (
                <button
                  onClick={() => setAutoPlay(true)}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
                >
                  Auto Play On
                </button>
              )}
            </>
          </>
        )}
      </div>

      <div className="relative border-4 border-black w-[500px] h-[500px] mt-4 bg-white">
        {numbers.map((number, index) => {
          const { left, top } = positions[index] || { left: "0%", top: "0%" };
          const isCurrent = number === currentSelection - 1;
          const isHidden = disappearedNumbers.includes(number);

          return (
            <div
              key={number}
              onClick={() => handleClick(number)}
              className={`absolute flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-500 text-lg font-semibold cursor-pointer shadow-md
                ${
                  isCurrent
                    ? "bg-red-600 text-white border-white"
                    : "bg-white border-black"
                }
                ${isHidden ? "hidden" : "flex"}`}
              style={{ left, top, zIndex: 100000 - number }}
            >
              <div className="flex flex-col items-center">
                <span>{number}</span>
                {isCurrent && isTimeToHidden && (
                  <span className="text-xs font-normal">{timeToHidden}s</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClearThePoints;
