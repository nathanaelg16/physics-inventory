import './App.css';
import {HashRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import LoginView from "./views/login/LoginView"
import SearchView from "./views/search/SearchView";
import HelpSearchModesView from "./views/help/search-modes/HelpSearchModesView";

function App() {
    return <HashRouter>
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<LoginView />} />
                <Route path='/search' element={<SearchView />} />
                <Route path='/help/search-modes' element={<HelpSearchModesView />} />
            </Route>
        </Routes>
    </HashRouter>
}

export default App
