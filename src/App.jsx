import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Topic from "./pages/Topic";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:slug" element={<Topic />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
