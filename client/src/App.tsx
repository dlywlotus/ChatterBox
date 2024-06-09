import "./App.css";
import "typeface-roboto";
import Authentication from "./components/Authentication";
import { Routes, Route } from "react-router-dom";
import ChatApp from "./components/ChatApp";

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<ChatApp />}></Route>
        <Route
          path='/login'
          element={<Authentication type={"Login"} />}
        ></Route>
        <Route
          path='/register'
          element={<Authentication type={"Register"} />}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
