import React, { useState, useEffect } from "react";

const ClearThePoints = () => {
  const [n, setN] = useState(5); // Mặc định giá trị n là 5
  const [numbers, setNumbers] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(1); // Giá trị bắt đầu từ 1
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false); // Biến để kiểm tra trạng thái trò chơi
  const [selectedNumbers, setSelectedNumbers] = useState([]); // Mảng lưu số đã chọn
  const [disappearedNumbers, setDisappearedNumbers] = useState([]); // Mảng lưu số đã biến mất
  const [positions, setPositions] = useState([]); // Mảng lưu vị trí ngẫu nhiên

  // Hàm xáo trộn mảng
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Hàm tạo vị trí ngẫu nhiên cho các số
  const generateRandomPositions = (count) => {
    const positionsArray = [];
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 90; // Vị trí bên trái ngẫu nhiên
      const top = Math.random() * 90; // Vị trí trên ngẫu nhiên
      positionsArray.push({ left: `${left}%`, top: `${top}%` });
    }
    return positionsArray;
  };

  // Hàm khởi động lại trò chơi
  const restartGame = () => {
    const newNumbers = Array.from({ length: n }, (_, i) => i + 1);
    setNumbers(shuffleArray(newNumbers).reverse());
    setPositions(generateRandomPositions(n)); // Tạo vị trí ngẫu nhiên
    setCurrentSelection(1);
    setMessage("");
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameStarted(true);
    setSelectedNumbers([]); // Reset danh sách số đã chọn
    setDisappearedNumbers([]); // Reset danh sách số đã biến mất
  };

  // Cập nhật thời gian khi trò chơi bắt đầu
  useEffect(() => {
    let timer;
    if (startTime && gameStarted) {
      timer = setInterval(() => {
        setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
    }
    return () => clearInterval(timer); // Dọn dẹp khi component bị unmount
  }, [startTime, gameStarted]);

  // Hàm xử lý khi click vào một số
  const handleClick = (number) => {
    if (!gameStarted) return; // Nếu trò chơi chưa bắt đầu, không cho phép click
    if (selectedNumbers.includes(number)) return; // Nếu số đã chọn rồi thì không cho chọn lại

    if (number === currentSelection) {
      setSelectedNumbers((prev) => [...prev, number]); // Thêm số đã chọn vào mảng
      if (number === n) {
        setMessage(`ALL CLEARED`);
        setGameStarted(false); // Kết thúc trò chơi khi chọn đúng số cuối cùng
      } else {
        setCurrentSelection(currentSelection + 1);
      }
      // Thiết lập thời gian để số biến mất sau 2 giây
      setTimeout(() => {
        setDisappearedNumbers((prev) => [...prev, number]);
      }, 2000);
    } else {
      setMessage("GAME OVER");
      setGameStarted(false); // Kết thúc trò chơi nếu chọn sai
    }
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <h1
        className={`font-semibold text-xl ${
          message === "ALL CLEARED" ? "text-green-500" : ""
        } ${message === "GAME OVER" ? "text-red-500" : ""}`}
      >
        {message ? <p>{message}</p> : <p>LET'S PLAY</p>}
      </h1>
      <div className="flex items-center justify-center gap-3">
        <label>Points:</label>
        <input
          type="number"
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          min="1"
          className="pl-2 w-28 border border-[#333] rounded-sm outline-blue-400"
        />
      </div>
      <div className="flex items-center justify-center gap-10">
        <span>Time:</span>
        <span>{elapsedTime}s</span>
      </div>
      <button
        onClick={restartGame}
        className="border rounded-sm border-[#333] px-3 hover:opacity-80 hover:bg-slate-200 mb-5"
      >
        Restart
      </button>
      <div className="relative border-2 border-solid border-black w-[500px] h-[500px]">
        {numbers.map((number, index) => {
          const { left, top } = positions[index] || { left: "0%", top: "0%" }; // Lấy vị trí
          return (
            <div
              key={number}
              onClick={() => handleClick(number)}
              className={`absolute p-5 rounded-full bg-white border-2 border-black w-[50px] h-[50px] flex justify-center items-center text-[20px] transition-colors duration-[2000ms] ${
                selectedNumbers.includes(number)
                  ? "bg-red-500 text-white"
                  : "bg-white"
              }`}
              style={{
                cursor: gameStarted ? "pointer" : "not-allowed", // Chỉ cho phép click nếu game bắt đầu
                left: left,
                top: top,
                zIndex: 1000000 - number,
                display: disappearedNumbers.includes(number) ? "none" : "flex", // Ẩn số đã biến mất
              }}
            >
              {number}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClearThePoints;
