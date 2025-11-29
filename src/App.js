import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CreateJoin from "./pages/CreateJoin";
import Game from "./pages/Game";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create-join" element={<CreateJoin />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </Router>
  );
}
