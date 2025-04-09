import {main} from "../../../wailsjs/go/models";
import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField
} from "@mui/material";
import {KeyboardEvent, useEffect, useState} from "react";
import Asset = main.Asset;
import {useNavigate} from "react-router";
import {
    GetDefaultSearchMode, SearchModeBoolean,
    SearchModeFullText, SearchModeFullTextWithQueryExpansion,
    SearchModeRegular,
    SetDefaultSearchMode
} from "../../../wailsjs/go/main/App";
import {SnackbarAlert} from "../../views/search/SearchView";
import {useSessionStorage} from "@uidotdev/usehooks"

interface Props {
    onResult: (results: Array<Asset>) => void,
    onAlert: (alert: SnackbarAlert) => void
}

type SearchType = 'au_inventory' | 'brand' | 'item_name' | 'keywords' | 'location' | 'model' | 'notes'
    | 'part' | 'record_locator' | 'serial_number' | 'vendor'

type SearchMode = 'regular' | 'full_text' | 'full_text_query_expansion' | 'boolean'

export default function SearchBox(props: Props) {
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useSessionStorage<string>('search_query', '')
    const [searchMode, setSearchMode] = useSessionStorage<SearchMode>('search_mode', 'regular')
    const [searchType, setSearchType] = useSessionStorage<SearchType>('search_type', 'keywords')
    const [showAdvancedOptionsDialog, setShowAdvancedOptionsDialog] = useState<boolean>(false)

    useEffect(() => {
        // load initial list of assets
        void performSearch()

        // load default search mode
        GetDefaultSearchMode()
            .then((res) => setSearchMode(res as SearchMode))
            .catch(() => setSearchMode('regular'))
    }, [])

    const handleSearchTypeChange = (e: SelectChangeEvent) => {
        setSearchType(e.target.value as SearchType)
    }

    const handleSearchModeChange = (e: SelectChangeEvent) => {
        setSearchMode(e.target.value as SearchMode)
    }

    const setDefaultSearchMode = () => {
        SetDefaultSearchMode(searchMode)
            .then(() => props.onAlert({
                severity: 'success',
                msg: 'Updated successfully!'
            })).catch(() => props.onAlert({
                severity: 'error',
                msg: 'An error occurred while updating your default search mode.'
            }))
    }

    const performSearch = async () => {
        try {
            let results: Array<Asset>

            switch (searchMode) {
                case "regular":
                    results = await SearchModeRegular(searchQuery, searchType)
                    break
                case "full_text":
                    results = await SearchModeFullText(searchQuery)
                    break
                case "full_text_query_expansion":
                    results = await SearchModeFullTextWithQueryExpansion(searchQuery)
                    break
                case "boolean":
                    results = await SearchModeBoolean(searchQuery)
                    break
            }

            props.onResult(results)
        } catch (e: any) {
            props.onAlert({
                severity: 'error',
                msg: 'An error occurred.'
            })
        }
    }

    const enterKeyListener = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Enter') {
            await performSearch()
        }
    }

    return <>
        <Grid container alignItems='center' spacing={2}>

            {/* search type */}
            <Grid size={2}>
                <Select disabled={searchMode !== 'regular'} fullWidth sx={{maxWidth: '150px'}} variant='standard'
                        value={searchType} onChange={handleSearchTypeChange}>
                    <MenuItem value='AU Inventory Number'>AU Inventory Number</MenuItem>
                    <MenuItem value='Brand'>Brand</MenuItem>
                    <MenuItem value='item_name'>Name</MenuItem>
                    <MenuItem value='keywords'>Keywords</MenuItem>
                    <MenuItem value='location'>Location</MenuItem>
                    <MenuItem value='model'>Model</MenuItem>
                    <MenuItem value='notes'>Notes</MenuItem>
                    <MenuItem value='part'>Part Number</MenuItem>
                    <MenuItem value='record_locator'>Record Number</MenuItem>
                    <MenuItem value='serial_number'>Serial Number</MenuItem>
                    <MenuItem value='vendor'>Vendor</MenuItem>
                </Select>
            </Grid>

            {/* search box */}
            <Grid size={8}>
                <TextField fullWidth variant='outlined' label='Search' value={searchQuery}
                           onChange={(e: any) => setSearchQuery(e.target.value)}
                           onKeyUp={enterKeyListener}
                />
            </Grid>

            {/* options */}
            <Grid size={2}>
                <Button variant='contained' onClick={() => setShowAdvancedOptionsDialog(true)}>Advanced</Button>
            </Grid>

            {/* search button */}
            <Grid size={12}>
                <Button fullWidth variant='contained' onClick={performSearch}>Search</Button>
            </Grid>

        </Grid>

        <Dialog open={showAdvancedOptionsDialog} onClose={() => setShowAdvancedOptionsDialog(false)}>
            <DialogTitle>Search Mode</DialogTitle>
            <DialogContent>
                <Select fullWidth variant='outlined' value={searchMode}
                        onChange={handleSearchModeChange}>
                    <MenuItem value='regular'>Normal</MenuItem>
                    <MenuItem value='full_text'>Full-Text</MenuItem>
                    <MenuItem value='full_text_query_expansion'>Full-Text w/ Query Expansion</MenuItem>
                    <MenuItem value='boolean'>Boolean</MenuItem>
                </Select>
                <Button onClick={() => navigate('/help/search-modes')}>What's the difference?</Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={setDefaultSearchMode}>Set Default</Button>
                <Button onClick={() => setShowAdvancedOptionsDialog(false)}>OK</Button>
            </DialogActions>
        </Dialog>

    </>
}