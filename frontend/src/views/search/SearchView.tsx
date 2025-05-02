import SearchBox from '../../components/search-box/SearchBox'
import {MouseEvent, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {Alert, Box, Button, Menu, MenuItem, Paper, Skeleton, Snackbar, Typography, useTheme,} from '@mui/material'
import AssetCard from '../../components/asset-card/AssetCard'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import './searchView.css'
import {ExportAssetsCSV} from "../../../wailsjs/go/main/App";
import Asset = main.Asset;

// todo implement results export to PDF

export default function SearchView() {
    const theme = useTheme()
    const [results, setResults] = useState<Array<Asset>>([])
    const [alert, setAlert] = useState<SnackbarAlert | null>(null)
    const [isSearching, setSearching] = useState<boolean>(false)

    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    const handleExportMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleExportToCSV = () => {
        handleExportMenuClose()
        ExportAssetsCSV(results.map(asset => asset.id))
            .then(() => setAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => setAlert({
                severity: 'error',
                msg: `Error: ${err}`
            }))
    }

    return (
        <Box sx={{
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 1, sm: 2 },
            pb: 4
        }}>
            <SearchBox
                onResult={setResults}
                onAlert={(a: SnackbarAlert) => setAlert(a)}
                setSearching={setSearching}
            />

            <Paper
                elevation={2}
                sx={{
                    borderRadius: '12px',
                    mb: 2,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
            >
                <Box className="results-count" sx={{
                    p: '10px 20px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="body2" color="textSecondary">
                        {isSearching
                            ? 'Searching...'
                            : (results.length > 0
                                ? `Found ${results.length} asset${results.length !== 1 ? 's' : ''}`
                                : 'No assets found')}
                    </Typography>
                    <div>
                        <Button size='small' onClick={handleExportMenuOpen}>Export</Button>
                        <Menu open={openExportMenu} anchorEl={exportMenuAnchor} onClose={handleExportMenuClose}>
                            <MenuItem onClick={handleExportToCSV}>Export to CSV</MenuItem>
                            <MenuItem>Export to PDF</MenuItem>
                        </Menu>
                    </div>
                </Box>

                <Box className="results-container" sx={{
                    p: { xs: 1, sm: 2 },
                    backgroundColor: theme.palette.background.default,
                    minHeight: '200px'
                }}>
                    {isSearching ? (
                        <Box className='search-view-loading'>
                            {Array.from(Array(5).keys()).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="rounded"
                                    height={120}
                                    sx={{ borderRadius: '12px' }}
                                />
                            ))}
                        </Box>
                    ) : (
                        <>
                            {results.length > 0 ? (
                                results.map((asset) => (
                                    <AssetCard key={asset.id} asset={asset} />
                                ))
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '200px'
                                }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No results found. Check for typos or try a different search term.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            <Snackbar
                autoHideDuration={3000}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                open={Boolean(alert)}
                onClose={() => setAlert(null)}
            >
                <Alert severity={alert?.severity}>{alert?.msg}</Alert>
            </Snackbar>
        </Box>
    )
}

// todo add pagination