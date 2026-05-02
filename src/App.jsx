import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Loader from "./components/Loader";
import NotFound from "./pages/NotFound";

const Home = lazy(() => import("./pages/Home"));
const Topic = lazy(() => import("./pages/Topic"));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<Loader />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/topic/:slug"
            element={
              <Suspense fallback={<Loader />}>
                <Topic />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
