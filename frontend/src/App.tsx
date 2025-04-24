import './App.css';
import {HashRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import LoginView from "./views/login/LoginView"
import SearchView from "./views/search/SearchView";
import HelpSearchModesView from "./views/help/search-modes/HelpSearchModesView";
import AssetView from "./views/asset/AssetView";
import NewAssetView from "./views/new-asset/NewAssetView";

function App() {
    return <HashRouter>
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<LoginView />} />
                <Route path='/search' element={<SearchView />} />
                <Route path='/help/search-modes' element={<HelpSearchModesView />} />
                <Route path='/asset/new' element={<NewAssetView />} />
                <Route path='/asset/:id' element={<AssetView />} />
            </Route>
        </Routes>
    </HashRouter>
}

export default App
