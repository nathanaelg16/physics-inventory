import {main} from '../../../wailsjs/go/models'
import {
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputBase,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import {KeyboardEvent, useContext, useEffect, useState} from 'react'
import {useNavigate} from 'react-router'
import {
    GetDefaultSearchMode,
    SearchModeBoolean,
    SearchModeFullText,
    SearchModeFullTextWithQueryExpansion,
    SearchModeRegular,
    SetDefaultSearchMode
} from '../../../wailsjs/go/main/App'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import {useSessionStorage} from '@uidotdev/usehooks'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import TuneIcon from '@mui/icons-material/Tune'
import SaveIcon from '@mui/icons-material/Save'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import {AccessLevel, AuthContext} from "../../utils/auth";
import Asset = main.Asset;

interface Props {
    onResult: (results: Array<Asset>) => void
    onAlert: (alert: SnackbarAlert) => void
    setSearching: (isSearching: boolean) => void
}

type SearchType = 'au_inventory' | 'brand' | 'item_name' | 'keywords' | 'location' | 'model' | 'notes'
    | 'part' | 'record_locator' | 'serial_number' | 'vendor'

type SearchMode = 'regular' | 'full_text' | 'full_text_query_expansion' | 'boolean'

export default function SearchBox(props: Props) {
    const navigate = useNavigate()
    const authContext = useContext(AuthContext)

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const isMediumScreen = useMediaQuery(theme.breakpoints.down(1116))

    const [searchQuery, setSearchQuery] = useSessionStorage<string>('search_query', '')
    const [searchMode, setSearchMode] = useSessionStorage<SearchMode>('search_mode', 'regular')
    const [searchType, setSearchType] = useSessionStorage<SearchType>('search_type', 'keywords')
    const [showAdvancedOptionsDialog, setShowAdvancedOptionsDialog] = useState<boolean>(false)

    const canAddAsset = authContext.accessLevel >= AccessLevel.Maintainer

    useEffect(() => {
        // Load initial list of assets
        void performSearch()

        // Load default search mode
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
        props.setSearching(true)
        try {
            let results: Array<Asset>

            switch (searchMode) {
                case 'regular':
                    results = await SearchModeRegular(searchQuery, searchType)
                    break
                case 'full_text':
                    results = await SearchModeFullText(searchQuery)
                    break
                case 'full_text_query_expansion':
                    results = await SearchModeFullTextWithQueryExpansion(searchQuery)
                    break
                case 'boolean':
                    results = await SearchModeBoolean(searchQuery)
                    break
                default:
                    results = []
            }

            props.onResult(results)
        } catch (e: any) {
            props.onAlert({
                severity: 'error',
                msg: `Error: ${e}`
            })
        }

        props.setSearching(false)
    }

    const enterKeyListener = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            await performSearch()
        }
    }

    const handleAddNewAsset = () => {
        navigate('/asset/new')
    }

    const getFieldLabel = (field: SearchType): string => {
        const labels: Record<SearchType, string> = {
            au_inventory: 'AU Inventory',
            brand: 'Brand',
            item_name: 'Name',
            keywords: 'Keywords',
            location: 'Location',
            model: 'Model',
            notes: 'Notes',
            part: 'Part Number',
            record_locator: 'Record Number',
            serial_number: 'Serial Number',
            vendor: 'Vendor'
        }
        return labels[field] || field
    }

    const getModeLabel = (mode: SearchMode): string => {
        switch (mode) {
            case 'regular':
                return 'Normal'
            case 'full_text':
                return 'Full-Text'
            case 'full_text_query_expansion':
                return 'Expanded'
            case 'boolean':
                return 'Boolean'
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Main Search Card */}
            <Card
                elevation={3}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: '12px',
                    background: theme.palette.mode === 'dark' ? 'rgba(66, 66, 66, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Search Input Row */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: isMediumScreen ? 'column' : 'row',
                    gap: 2,
                    mb: 2
                }}>
                    {/* Search Bar with Type Selector */}
                    <Paper
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: isMediumScreen ? '100%' : '75%',
                            borderRadius: '8px',
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        {searchMode === 'regular' && (
                            <>
                                <Select
                                    value={searchType}
                                    onChange={handleSearchTypeChange}
                                    variant="standard"
                                    disableUnderline
                                    sx={{
                                        mx: 1,
                                        minWidth: isSmallScreen ? '90px' : '120px',
                                        '& .MuiSelect-select': {
                                            py: 1,
                                            fontSize: '0.9rem'
                                        }
                                    }}
                                >
                                    <MenuItem value="au_inventory">AU Inventory</MenuItem>
                                    <MenuItem value="brand">Brand</MenuItem>
                                    <MenuItem value="item_name">Name</MenuItem>
                                    <MenuItem value="keywords">Keywords</MenuItem>
                                    <MenuItem value="location">Location</MenuItem>
                                    <MenuItem value="model">Model</MenuItem>
                                    <MenuItem value="notes">Notes</MenuItem>
                                    <MenuItem value="part">Part Number</MenuItem>
                                    <MenuItem value="record_locator">Record Number</MenuItem>
                                    <MenuItem value="serial_number">Serial Number</MenuItem>
                                    <MenuItem value="vendor">Vendor</MenuItem>
                                </Select>
                                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            </>
                        )}

                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder={`Search ${searchMode === 'regular' ? getFieldLabel(searchType) : 'all fields'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={enterKeyListener}
                        />

                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                        <Tooltip title="Search">
                            <IconButton
                                color="primary"
                                sx={{ p: '10px' }}
                                onClick={performSearch}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                    </Paper>

                    {/* Action Buttons */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        width: isMediumScreen ? '100%' : '25%',
                        justifyContent: 'flex-end'
                    }}>
                        <Tooltip title="Search settings">
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<TuneIcon />}
                                onClick={() => setShowAdvancedOptionsDialog(true)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none'
                                }}
                            >
                                Settings
                            </Button>
                        </Tooltip>

                        {canAddAsset && <Tooltip title="Add new asset">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddNewAsset}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    backgroundColor: '#a89254',
                                    color: 'white'
                                }}
                            >
                                New
                            </Button>
                        </Tooltip>}
                    </Box>
                </Box>

                {/* Search Mode Pills in a Row */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                }}>
                    <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mr: 1, whiteSpace: 'nowrap' }}
                    >
                        Search Mode:
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        {['regular', 'full_text', 'full_text_query_expansion', 'boolean'].map((mode) => (
                            <Chip
                                key={mode}
                                label={getModeLabel(mode as SearchMode)}
                                size="small"
                                color={searchMode === mode ? 'primary' : 'default'}
                                variant={searchMode === mode ? 'filled' : 'outlined'}
                                onClick={() => setSearchMode(mode as SearchMode)}
                                sx={{
                                    borderRadius: '16px',
                                    '&:hover': {
                                        backgroundColor: searchMode === mode ?
                                            theme.palette.primary.main :
                                            theme.palette.action.hover
                                    }
                                }}
                            />
                        ))}

                        <Tooltip title="Learn about search modes">
                            <IconButton
                                size="small"
                                onClick={() => navigate('/help/search-modes')}
                            >
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Card>

            {/* Advanced Options Dialog */}
            <Dialog
                open={showAdvancedOptionsDialog}
                onClose={() => setShowAdvancedOptionsDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Search Settings
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" gutterBottom>
                        Search Mode
                    </Typography>
                    <Select
                        fullWidth
                        variant="outlined"
                        value={searchMode}
                        onChange={handleSearchModeChange}
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="regular">Normal</MenuItem>
                        <MenuItem value="full_text">Full-Text</MenuItem>
                        <MenuItem value="full_text_query_expansion">Full-Text w/ Query Expansion</MenuItem>
                        <MenuItem value="boolean">Boolean</MenuItem>
                    </Select>

                    <Button
                        variant="text"
                        size="small"
                        startIcon={<HelpOutlineIcon />}
                        onClick={() => {
                            setShowAdvancedOptionsDialog(false)
                            navigate('/help/search-modes')
                        }}
                        sx={{ mb: 3 }}
                    >
                        What's the difference?
                    </Button>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Save Preferences
                    </Typography>
                    <Typography variant="caption" color="textSecondary" component='p'>
                        Make this search mode your default when opening the search page.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={setDefaultSearchMode}
                        startIcon={<SaveIcon />}
                        color="primary"
                    >
                        Set as Default
                    </Button>
                    <Button onClick={() => setShowAdvancedOptionsDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}