import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* We will add Protected Dashboard routes next */}
        <Route
          path="/dashboard"
          element={
            <div className="p-10 text-2xl">Dashboard (Coming Soon!)</div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
