import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import LoginView from "./views/login/LoginView"
import SearchView from "./views/search/SearchView";

function App() {
    return <BrowserRouter>
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<LoginView />} />
                <Route path='/search' element={<SearchView />} />
            </Route>
        </Routes>
    </BrowserRouter>
}

export default App
