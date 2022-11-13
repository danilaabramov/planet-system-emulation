import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { update } from "react-spring";

const Hello = () => {
  const G = 6.67 * 10 ** -11;
  const M = 1.2166 * 10 ** 30;
  const x0 = 0, y0 = 0;

  const canvas = useRef(null);
  let ctx = null;

  const [height, setHeight] = useState(window.innerHeight);
  const [option, setOption] = useState(false);
  const [fileWindow, setFileWindow] = useState(false);
  const [intervals, setIntervals] = useState([]);
  const [Start, setStart] = useState(false);
  const [timeCount, setTimeCount] = useState(0);
  const [vXCount, setVXCount] = useState(0);
  const [vYCount, setVYCount] = useState(0);
  const [planetsCount, setPlanetsCount] = useState(10);
  const [T, setT] = useState(360000);

  const [method, setMethod] = useState(1);

  const [planetsStart, setPlanetsStart] = useState(Array(planetsCount).fill().map((item, index) => ({
    X: 149500000000 * index,
    Y: 0,
    vX: 0,
    vY: index ? Math.sqrt(G * M / 149500000000 / index) : 0,
    M: index ? index * 6.083 * 10 ** 24 : M,
    E: 0
  })));

  const radius = 140000000000


  useEffect(() => {
    setPlanetsStart(Array(planetsCount).fill().map((item, index) => ({
      X: 149500000000 * index,
      Y: 0,
      vX: 0,
      vY: index ? Math.sqrt(G * M / 149500000000 / index) : 0,
      M: index ? index * 6.083 * 10 ** 24 : M,
      E: 0
    })));
  }, [planetsCount]);

  useEffect(() => {
    let p = JSON.parse(JSON.stringify(planetsStart));
    setSun(p[0]);
    p.splice(0, 1);
    setPlanets(p);
  }, [...planetsStart]);

  const [planets, setPlanets] = useState(Array(planetsCount ? planetsCount - 1 : 0).fill().map((item, index) => ({
    X: 149500000000 * (index + 1),
    Y: 0,
    vX: 0,
    vY: Math.sqrt(G * M / 149500000000 * (index + 1)),
    M: (index + 1) * 6.083 * 10 ** 24,
    E: 0
  })));

  const [sun, setSun] = useState({
    X: 0,
    Y: 0,
    vX: 0,
    vY: 0,
    M: 1.2166 * 10 ** 30,
    E: 0
  });

  const widthCanvas = useMemo(() => {
    let w = 0;
    for (let i = 0; i < planetsStart.length; ++i)
      if (w < Math.sqrt(planetsStart[i].X ** 2 + planetsStart[i].Y ** 2))
        w = Math.sqrt(planetsStart[i].X ** 2 + planetsStart[i].Y ** 2);
    return w;
  }, [...planetsStart]);


  const minM = useMemo(() => {
    let m = planetsStart[0].M, i = 0;
    for (let j = 1; j < planetsStart.length; ++j) if (planetsStart[j].M < m && planetsStart[j].M > 0) {
      m = planetsStart[j].M;
      i = j;
    }
    return { m, i };
  }, [...planetsStart, Start]);

  const weightPlanets = useMemo(() => {
    let k = minM.m / 2;
    let arr = [];
    arr.push(sun.M / k);
    for (let j = 0; j < planets.length; ++j)
      arr.push(planets[j].M / k);
    return arr;
  }, [minM, planets[8].M]);

  const drawCircle = (info) => {
    const { x, y, w } = info;
    ctx.beginPath();
    ctx.arc(x, y, w, 0, 2 * Math.PI, false);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "lightblue";
    ctx.stroke();
  };


  const vx = useMemo(() => {
    let res = 0;
    let M = sun.M;
    planets.map((item) => {
      res += item.vX * item.M;
      M += item.M;
    });
    return res / M;
  }, [planets[0].X]);

  const vy = useMemo(() => {
    let res = 0;
    let M = sun.M;
    planets.map((item) => {
      res += item.vY * item.M;
      M += item.M;
    });
    return res / M;
  }, [planets[0].X]);

  const Energy = useMemo(() => {
    let res = sun.E;
    planets.map((item) => {
      res += item.E;
    });
    return res;
  }, [planets[0].E]);


  let P = JSON.parse(JSON.stringify(planetsStart));


  const start = (index) => {

    setTimeCount(0);

    let X = P[index].X, Y = P[index].Y;
    let aX = 0, aY = 0, vX = P[index].vX, vY = P[index].vY;
    let arr = intervals;

    let aX1 = [0], aY1 = [0];
    let X1 = [X], Y1 = [Y];

    let flag = true;

    const inter = setInterval(() => {
      drawCircle({
        x: height / 2 + height * X / planetsStart[planetsStart.length - 1].X / 2,
        y: height / 2 + height * Y / planetsStart[planetsStart.length - 1].X / 2, w: weightPlanets[index] < 40 ? weightPlanets[index] / 2 : 20
      });

      let p = planets;
      p[index - 1].X = X;
      p[index - 1].Y = Y;
      P[index].X = X;
      P[index].Y = Y;

      p[index - 1].vX = vX;
      p[index - 1].vY = vY;

      let Ek = 0, Ep = 0;
      let v2 = Math.sqrt(2 * G * M / 149500000000 / index);

      Ek = P[index].M * v2 ** 2 / 2;

      for (let i = 0; i < P.length; ++i) {
        if (i !== index) {
          let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);

          if(R < radius){
            console.log(index, i)

            P[index].vX = (P[index].vX * P[index].M + P[i].vX * P[i].M) / (P[i].M + P[index].M)
            P[index].vY = (P[index].vY * P[index].M + P[i].vY * P[i].M) / (P[i].M + P[index].M)
            p[index - 1].vX += P[index].vX
            p[index - 1].vY += P[index].vY

            P[index].aX = (P[index].aX * P[index].M + P[i].aX * P[i].M) / (P[i].M + P[index].M)
            P[index].aY = (P[index].aY * P[index].M + P[i].aY * P[i].M) / (P[i].M + P[index].M)
            p[index - 1].aX += P[index].aX
            p[index - 1].aY += P[index].aY

            P[index].M += P[i].M
            p[index - 1].M += P[i].M

            clearInterval(intervals[i]);
            p.splice(index - 1, 0)
            P.splice(index, 0)

          }


          Ep -= G * P[index].M * P[i].M / R;
        }
      }

      p[index - 1].E = Ek + Ep;
      setPlanets(p);

      if ((method === 0) || (flag && method === 2) || (flag && method === 3)) {
        [aX, aY] = [0, 0];
        for (let i = 0; i < P.length; ++i) {
          if (i !== index) {
            let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
            aX += G * P[i].M * (P[i].X - X) / (R ** 3);
            aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
          }
        }
        ;
        [X, Y] = [X + T * vX, Y + T * vY];
        [vX, vY] = [vX + T * aX, vY + T * aY];
        X1.push(X);
        Y1.push(Y);
        aX1.push(aX);
        aY1.push(aY);
        flag = false;
      }
      if (method === 1) {
        [aX, aY] = [0, 0];
        for (let i = 0; i < P.length; ++i) {
          if (i !== index) {
            let R = Math.sqrt((P[i].X - X) ** 2 + (P[i].Y - Y) ** 2);
            aX += G * P[i].M * (P[i].X - X) / (R ** 3);
            aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
          }
        }
        ;

        [vX, vY] = [vX + T * aX, vY + T * aY];
        [X, Y] = [X + T * vX, Y + T * vY];
      }
      if ((method === 2) && !flag) {
        [aX, aY] = [0, 0];
        for (let i = 0; i < P.length; ++i) {
          if (i !== index) {
            let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
            aX += G * P[i].M * (P[i].X - X) / (R ** 3);
            aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
          }
        }
        ;

        [X, Y] = [2 * X1[X1.length - 1] - X1[X1.length - 2] + (T ** 2) * aX, 2 * Y1[Y1.length - 1] - Y1[Y1.length - 2] + (T ** 2) * aY];
        [vX, vY] = [(X - X1[X1.length - 2]) / (2 * T), (Y - Y1[Y1.length - 2]) / (2 * T)];
        X1.push(X);
        Y1.push(Y);
      }
      if ((method === 3) && !flag) {
        [aX, aY] = [0, 0];
        for (let i = 0; i < P.length; ++i) {
          if (i !== index) {
            let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
            aX += G * P[i].M * (P[i].X - X) / (R ** 3);
            aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
          }
        }
        ;
        aX1.push(aX), aY1.push(aY);
        [X, Y] = [X + T * vX - 1 / 6 * (4 * aX1[aX1.length - 2] - aX1[aX1.length - 3]) * T ** 2, Y + T * vY - 1 / 6 * (4 * aY1[aY1.length - 2] - aY1[aY1.length - 3]) * T ** 2];
        [vX, vY] = [vX + 1 / 6 * (2 * aX + 5 * aX1[aX1.length - 1] - aX1[aX1.length - 2]) * T, vY + 1 / 6 * (2 * aY + 5 * aY1[aY1.length - 2] - aY1[aY1.length - 3]) * T];
      }

      if (index === 1) setTimeCount(t => t + T);
    }, 1);
    arr.push(inter);
    setIntervals(arr);
  };


  const startSun = () => {
    let X = P[0].X, Y = P[0].Y;
    let aX = 0, aY = 0, vX = P[0].vX, vY = P[0].vY;
    let arr = intervals;

    let aX1 = [0], aY1 = [0];
    let X1 = [X], Y1 = [Y];

    let flag = true;

    const inter = setInterval(() => {

      drawCircle({
        x: height / 2 + height * X / planetsStart[planetsStart.length - 1].X / 2,
        y: height / 2 + height * Y / planetsStart[planetsStart.length - 1].X / 2, w: weightPlanets[0] < 40 ? weightPlanets[0] / 2 : 20
      });

      let s = sun;
      sun.X = X;
      sun.Y = Y;

      P[0].X = X;
      P[0].Y = Y;

      sun.vX = vX;
      sun.vY = vY;

      let Ek = 0, Ep = 0;
      // let v2 = Math.sqrt(2 * G * M / 149500000000 / 9)
      //
      // Ek = s.M * v2 ** 2 / 2;

      for (let i = 1; i < P.length; ++i) {
        let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
        Ep -= G * s.M * P[i].M / R;
      }

      s.E = Ek + Ep;

      setSun(s);

      if ((method === 0) || (flag && method === 2)) {
        [aX, aY] = [0, 0];
        for (let i = 1; i < P.length; ++i) {
          let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
          aX += G * P[i].M * (P[i].X - X) / (R ** 3);
          aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
        }
        [X, Y] = [X + T * vX, Y + T * vY];
        [vX, vY] = [vX + T * aX, vY + T * aY];
        X1.push(X);
        Y1.push(Y);
        flag = false;
      }
      if (method === 1) {
        [aX, aY] = [0, 0];
        for (let i = 1; i < P.length; ++i) {
          let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
          aX += G * P[i].M * (P[i].X - X) / (R ** 3);
          aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
        }

        [vX, vY] = [vX + T * aX, vY + T * aY];
        [X, Y] = [X + T * vX, Y + T * vY];
      }
      if ((method === 2) && !flag) {
        [aX, aY] = [0, 0];
        for (let i = 1; i < P.length; ++i) {
          let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
          aX += G * P[i].M * (P[i].X - X) / (R ** 3);
          aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
        }

        [X, Y] = [2 * X1[X1.length - 1] - X1[X1.length - 2] + T ** 2 * aX, 2 * Y1[Y1.length - 1] - Y1[Y1.length - 2] + T ** 2 * aY];
        [vX, vY] = [(X - X1[X1.length - 2]) / (2 * T), (Y - Y1[Y1.length - 2]) / (2 * T)];
        X1.push(X);
        Y1.push(Y);
      }
      if ((method === 3) && !flag) {
        [aX, aY] = [0, 0];
        for (let i = 1; i < P.length; ++i) {
          let R = Math.sqrt((X - P[i].X) ** 2 + (Y - P[i].Y) ** 2);
          aX += G * P[i].M * (P[i].X - X) / (R ** 3);
          aY += G * P[i].M * (P[i].Y - Y) / (R ** 3);
        }
        aX1.push(aX), aY1.push(aY);
        [X, Y] = [X + T * vX - 1 / 6 * (4 * aX1[aX1.length - 2] - aX1[aX1.length - 3]) * T ** 2, Y + T * vY - 1 / 6 * (4 * aY1[aY1.length - 2] - aY1[aY1.length - 3]) * T ** 2];
        [vX, vY] = [vX + 1 / 6 * (2 * aX + 5 * aX1[aX1.length - 1] - aX1[aX1.length - 2]) * T, vY + 1 / 6 * (2 * aY + 5 * aY1[aY1.length - 2] - aY1[aY1.length - 3]) * T];
      }
    }, 1);
    arr.push(inter);
    setIntervals(arr);
  };


  const finish = () => {
    for (let i = 0; i < intervals.length; ++i)
      clearInterval(intervals[i]);
    setIntervals([]);
    setStart(false);
  };


  const updateStartPlanets = (index, property, value) => {
    let ps = JSON.parse(JSON.stringify(planetsStart));
    ps[index][property] = value;
    P = ps;
    setPlanetsStart(ps);
  };


  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden" }}>

      {
        fileWindow &&
        <div style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, .5)",
          zIndex: 5000
        }}>
          <div style={{
            position: "absolute",
            height: "20%",
            width: "20%",
            backgroundColor: "white",
            borderRadius: 20,
            transform: "translateX(-50%) translateY(-50%)",
            top: "50%",
            left: "50%",
            overflowX: "hidden"
          }}>


            <div style={{ borderRadius: 10, padding: 5, width: "100%" }}>
              <div style={{ height: 30, lineHeight: "30px" }}>
                Число планет
              </div>

              <input
                style={{ display: "flex", width: "calc(100% - 30px)", height: 10 }}
                type="text"
                className="writeInput"
                value={planetsCount}
                onChange={e => setPlanetsCount(Number(e.target.value) > 1 ? Number(e.target.value) : 2)} />


              <div style={{ display: "flex" }}>
                <button onClick={() => setFileWindow(o => !o)} style={{
                  margin: "auto",
                  width: 80,
                  height: 30,
                  marginTop: 20,
                  textAlign: "center",
                  borderRadius: 20,
                  backgroundColor: "#9FD0DF",
                  border: "none"
                }}>OK
                </button>
              </div>
            </div>


          </div>
        </div>
      }

      {
        option &&
        <div style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, .5)",
          zIndex: 5000
        }}>

          <div style={{
            position: "absolute",
            height: "80%",
            width: "80%",
            backgroundColor: "white",
            borderRadius: 20,
            transform: "translateX(-50%) translateY(-50%)",
            top: "50%",
            left: "50%",
            overflowX: "hidden"
          }}>
            <div style={{ display: "flex", margin: 5, padding: 5, borderRadius: 10 }}>
              <div style={{ height: 30, lineHeight: "30px", marginRight: 5, marginLeft: 5 }}>
                Шаг по времени
              </div>

              <input
                style={{ width: "calc(20% - 24px)", height: 10 }}
                type="number"
                className="writeInput"
                value={T}
                onChange={e => setT(Number(e.target.value))} />
            </div>


            <div style={{ display: "flex" }}>
              <div style={{ display: "flex" }}>
                <div style={{
                  minWidth: 20,
                  height: 20,
                  margin: 5,
                  background: method === 0 ? "blue" : "gray",
                  borderRadius: 10,
                  cursor: "pointer"
                }} onClick={() => setMethod(0)} />
                <div style={{ marginTop: 5 }}>Метод Эйлера</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{
                  minWidth: 20,
                  height: 20,
                  margin: 5,
                  background: method === 1 ? "blue" : "gray",
                  borderRadius: 10,
                  cursor: "pointer"
                }} onClick={() => setMethod(1)} />
                <div style={{ marginTop: 5 }}>Метод Эйлера-Крамера</div>
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex" }}>
                <div style={{
                  minWidth: 20,
                  height: 20,
                  margin: 5,
                  background: method === 2 ? "blue" : "gray",
                  borderRadius: 10,
                  cursor: "pointer"
                }} onClick={() => setMethod(2)} />
                <div style={{ marginTop: 5 }}>Метод Верле</div>
              </div>
              <div style={{ display: "flex" }}>
                <div style={{
                  minWidth: 20,
                  height: 20,
                  margin: 5,
                  background: method === 3 ? "blue" : "gray",
                  borderRadius: 10,
                  cursor: "pointer"
                }} onClick={() => setMethod(3)} />
                <div style={{ marginTop: 5 }}>Метод Бимана</div>
              </div>
            </div>


            <div style={{ display: "flex", margin: 5, padding: 5, borderRadius: 10 }}>
              <div style={{ width: 20, height: 30, lineHeight: "30px", textAlign: "center" }}>
                {planetsStart.length}
              </div>
              <div style={{ width: "calc(20% - 4px)", height: 30, lineHeight: "30px", textAlign: "center" }}>
                X
              </div>

              <div style={{ width: "calc(20% - 4px)", height: 30, lineHeight: "30px", textAlign: "center" }}>
                Y
              </div>

              <div style={{ width: "calc(20% - 4px)", height: 30, lineHeight: "30px", textAlign: "center" }}>
                Vx
              </div>

              <div style={{ width: "calc(20% - 4px)", height: 30, lineHeight: "30px", textAlign: "center" }}>
                Vy
              </div>

              <div style={{ width: "calc(20% - 4px)", height: 30, lineHeight: "30px", textAlign: "center" }}>
                Масса
              </div>


            </div>


            {
              planetsStart.map((item, index) => {
                return (
                  <div style={{ display: "flex", margin: 5, padding: 5, borderRadius: 10 }}>
                    <div style={{ width: 20, height: 30, lineHeight: "30px", textAlign: "center" }}>
                      {index}
                    </div>
                    <div style={{ width: "calc(100% - 20px)", display: "flex" }}>
                      <input
                        style={{ width: "20%", height: 10 }}
                        type="number"
                        className="writeInput"
                        value={item.X}
                        onChange={e => updateStartPlanets(index, "X", Number(e.target.value))}
                      />
                      <input
                        style={{ width: "20%", height: 10 }}
                        type="number"
                        className="writeInput"
                        value={item.Y}
                        onChange={e => updateStartPlanets(index, "Y", Number(e.target.value))}
                      />
                      <input
                        style={{ width: "20%", height: 10 }}
                        type="number"
                        className="writeInput"
                        value={item.vX}
                        onChange={e => updateStartPlanets(index, "vX", Number(e.target.value))}
                      />
                      <input
                        style={{ width: "20%", height: 10 }}
                        type="number"
                        className="writeInput"
                        value={item.vY}
                        onChange={e => updateStartPlanets(index, "vY", Number(e.target.value))}
                      />
                      <input
                        style={{ width: "20%", height: 10 }}
                        type="number"
                        className="writeInput"
                        value={item.M}
                        onChange={e => updateStartPlanets(index, "M", Number(e.target.value))}
                      />
                    </div>
                  </div>
                );
              })
            }

          </div>
        </div>
      }

      <div style={{ width: "100vh", height: "100vh", backgroundColor: "black" }}>

        <div style={{ position: "absolute", display: "flex" }}>
          <button onClick={() => setFileWindow(o => !o)} style={{ zIndex: 6000, left: 88 }}>Файл
          </button>
          <button onClick={() => setOption(o => !o)} style={{ zIndex: 6000, left: 88 }}>Параметры
          </button>
          <button onClick={() => {
            if (Start === false) {
              setStart(true);

              const canvasEle = canvas.current;
              canvasEle.width = height;
              canvasEle.height = height;
              ctx = canvasEle.getContext("2d");

              // let ps = JSON.parse(JSON.stringify(planetsStart))
              // setSun(ps[0])
              // ps.splice(0, 1)
              // setPlanets(ps)
              startSun();
              for (let i = 1; i <= planets.length; ++i)
                start(i);

            }
          }
          } style={{ zIndex: 6000 }}>Запуск модели
          </button>
          <button onClick={finish} style={{ zIndex: 6000, left: 42 }}>Остановить
          </button>
        </div>


        <div className="sun"
             style={{
               transition: "all 0.02s linear",
               left: `calc(50% + ${sun.X / widthCanvas * 100 / 2}%)`,
               top: `calc(50% + ${sun.Y / widthCanvas * 100 / 2}%)`
             }}
        >

          {/* <img src={require("./sun.png")}  */}
          <div style={{
            position: "relative",
            top: 20,
            backgroundColor: "red",
            objectFit: "cover",
            borderRadius: 100000,
            height: weightPlanets[0] < 40 ? weightPlanets[0]: 40,
            minWidth: weightPlanets[0] < 40 ? weightPlanets[0]: 40,
            transform: "translateY(-50%)"
          }}>
          </div>
        </div>

        {
          planets.map((item, index) => {
            return (
              <div className="el" id={`el${index + 1}`}
                   style={{
                     transition: "all 0.01s linear",
                     left: `calc(50% + ${item.X / widthCanvas * 100 / 2}%)`,
                     top: `calc(50% + ${item.Y / widthCanvas * 100 / 2}% - ${20 * index + 40}px)`
                   }}>
                {/* <img src={require("./earth.png")}/> */}
                <div
                  style={{
                    position: "relative",
                    top: 10,
                    backgroundColor: "red",
                    borderRadius: 100000,
                    objectFit: "cover",
                    height: weightPlanets[index + 1] < 40 ? weightPlanets[index + 1]: 40,
                    minWidth: weightPlanets[index + 1] < 40 ? weightPlanets[index + 1]: 40,
                    transform: "translateY(-50%)"
                  }}
                >
                </div>
              </div>
            );
          })
        }
        <canvas style={{ position: "relative", top: -40 - planets.length * 20, width: "100wh", height: "100vh" }}
                ref={canvas}></canvas>
      </div>

      <div>
        <div style={{
          width: "calc(100vw - 100vh - 100px)",
          padding: 25,
          margin: 25,
          backgroundColor: "lightblue",
          borderRadius: 20,
          lineHeight: "20px"
        }}>
          Общая энергия, Дж {Energy}
        </div>
        <div style={{
          width: "calc(100vw - 100vh - 100px)",
          padding: 25,
          margin: 25,
          backgroundColor: "lightblue",
          borderRadius: 20,
          lineHeight: "20px"
        }}>
          Текущее время {timeCount} с
        </div>
        <div style={{
          width: "calc(100vw - 100vh - 100px)",
          padding: 25,
          margin: 25,
          backgroundColor: "lightblue",
          borderRadius: 20,
          lineHeight: "20px"
        }}>
          Центр масс vx {vx}
        </div>
        <div style={{
          width: "calc(100vw - 100vh - 100px)",
          padding: 25,
          margin: 25,
          backgroundColor: "lightblue",
          borderRadius: 20,
          lineHeight: "20px"
        }}>
          Центр масс vy {vy}
        </div>

      </div>


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
