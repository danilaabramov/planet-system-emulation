import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import anime from "animejs/lib/anime.es.js";
import React, { useEffect, useState } from "react";

const Hello = () => {
  const G = 6.67 * 10 ** -11
  const T = 360000;
  const M = 1.2166 * 10 ** 30;
  const x0 = 0, y0 = 0;

  const [r, setR] = useState(0);
  const [x, setX] = useState(40);
  const [y, setY] = useState(40);
  const [vx, setVX] = useState(0.1);
  const [vy, setVY] = useState(1.5);
  const [ax, setAX] = useState(0);
  const [ay, setAY] = useState(0);

  const animationRef = React.useRef(null);

  useEffect(() => {
   anime({
      targets: ".el",
      left: 'calc(100% - 10px)',
      top: '50%',
      easing: "linear",
     duration: 0
    });

    anime({
      targets: ".sun",
      left: 'calc(50% - 20px)',
      top: 'calc(50% - 10px)',
      easing: "linear",
      duration: 0
    });

  }, []);

  const start = () => {
    let R = 0, aX = 0, aY = 0, vX = 0, vY = 23297.8704870374, X = 149500000000, Y = 0
    setInterval(() => {
      R = Math.sqrt((X - x0) ** 2 + (Y - y0) ** 2);
      [aX, aY] = [G * M * (x0 - X) / (R ** 3), G * M * (y0 - Y) / (R ** 3)];
      [vX, vY] = [vX + T * aX, vY + T * aY];
      [X, Y] = [X + T * vX, Y + T * vY]
      console.log(X)
      console.log(Y)

      animationRef.current = anime({
        targets: ".el",
        left: `calc(50% - 10px + ${X / 1495000000/2}%)`,
        top: `calc(50% + ${Y / 1495000000/2}%)`,
        easing: "linear",
        duration: 40
      });
      animationRef.current.restart();
    }, 40);
  };


  return (
    <div style={{ width: "100vh", height: "100vh", backgroundColor: 'black' }}>
      <button onClick={() => start()}>start</button>
      <div className="el"></div>
      <div className="sun"></div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
