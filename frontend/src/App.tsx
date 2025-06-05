import './App.css';
import {HashRouter, Route, Routes} from "react-router";
import Layout from "./components/layout/Layout";
import LoginView from "./views/login/LoginView"
import SearchView from "./views/search/SearchView";
import HelpSearchModesView from "./views/help/search-modes/HelpSearchModesView";
import AssetView from "./views/asset/AssetView";
import NewAssetView from "./views/new-asset/NewAssetView";
import AdminView from "./views/admin/AdminView";
import SetsAndGroupsView from "./views/sets-and-groups/SetsAndGroupsView";
import LabsView from "./views/labs/LabsView";
import LabView from "./views/lab/LabView";

function App() {
    return <HashRouter>
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<LoginView />} />
                <Route path='/search' element={<SearchView />} />
                <Route path='/help/search-modes' element={<HelpSearchModesView />} />
                <Route path='/asset/new' element={<NewAssetView />} />
                <Route path='/asset/:id' element={<AssetView />} />
                <Route path='/admin' element={<AdminView />} />
                <Route path='/sets-and-groups' element={<SetsAndGroupsView />} />
                <Route path='/labs' element={<LabsView />} />
                <Route path='/labs/:id' element={<LabView />} />
            </Route>
        </Routes>
    </HashRouter>
}

export default App
