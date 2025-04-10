import SearchBox from "../../components/search-box/SearchBox";
import {useState} from "react";
import {main} from "../../../wailsjs/go/models";
import Asset = main.Asset;
import {Alert, Snackbar, Typography} from "@mui/material";
import "./searchView.css"
import AssetCard from "../../components/asset-card/AssetCard";
import {SnackbarAlert} from "../../utils/snackbar-alert";

export default function SearchView() {
    const [results, setResults] = useState<Array<Asset>>([])
    const [alert, setAlert] = useState<SnackbarAlert | null>(null)

    return <>
        <div style={{padding: '10px 20px'}}>
            <SearchBox onResult={(results) => setResults(results)} onAlert={(a: SnackbarAlert)=> setAlert(a)} />
        </div>
        <div className="horizontal-line"></div>
        <div className="results-count">
            <Typography variant="body2" color="textSecondary">
                {results.length > 0
                    ? `Found ${results.length} asset${results.length !== 1 ? 's' : ''}`
                    : 'No assets found'}
            </Typography>
        </div>
        <div id='results'>
            {results.map((r) => <AssetCard key={r.id} asset={r}/>)}
        </div>
        <Snackbar autoHideDuration={3000} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} open={Boolean(alert)} onClose={() => setAlert(null)}>
            <Alert severity={alert?.severity}>{alert?.msg}</Alert>
        </Snackbar>
    </>
}