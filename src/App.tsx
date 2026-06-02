import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Fridge } from "./pages/Fridge";
import { Recipes } from "./pages/Recipes";
import { Recommendation } from "./pages/Recommendation";
import { Settings } from "./pages/Settings";
import { Wishlist } from "./pages/Wishlist";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/fridge" element={<Fridge />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
