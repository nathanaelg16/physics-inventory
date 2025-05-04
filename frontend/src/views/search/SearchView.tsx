import SearchBox from '../../components/search-box/SearchBox'
import {MouseEvent, useEffect, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {
    Alert,
    Box,
    Button,
    LinearProgress,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    Snackbar,
    Typography,
    useTheme
} from '@mui/material'
import AssetCard from '../../components/asset-card/AssetCard'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import './searchView.css'
import {ExportAssetsCSV, ExportAssetsPDF} from "../../../wailsjs/go/main/App"
import {EventsOff, EventsOn} from '../../../wailsjs/runtime'
import Asset = main.Asset;

// todo implement results export to PDF

export default function SearchView() {
    const theme = useTheme()
    const [results, setResults] = useState<Array<Asset>>([])
    const [alert, setAlert] = useState<SnackbarAlert | null>(null)
    const [isSearching, setSearching] = useState<boolean>(false)
    const [isExporting, setIsExporting] = useState<boolean>(false)
    const [exportProgress, setExportProgress] = useState<number>(0)
    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const openExportMenu = Boolean(exportMenuAnchor)

    useEffect(() => {
        // Listen for export progress events
        EventsOn('export-progress', (progress: number) => {
            setExportProgress(progress)
            if (progress > 0 && !isExporting) {
                setIsExporting(true)
            }
            if (progress >= 1) {
                // Reset export status after a brief delay
                setTimeout(() => {
                    setIsExporting(false)
                    setExportProgress(0)
                }, 2000)
            }
        })

        // Cleanup event listeners when component unmounts
        return () => {
            EventsOff('export-progress')
        }
    }, [isExporting])

    const handleExportMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget)
    }

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null)
    }

    const handleExportToCSV = () => {
        handleExportMenuClose()
        setIsExporting(true)
        setExportProgress(0)

        ExportAssetsCSV(results.map(asset => asset.id))
            .then(() => setAlert({
                severity: 'success',
                msg: 'Export finished successfully!'
            })).catch(err => setAlert({
                severity: 'error',
                msg: `Error: ${err}`
            }))
    }

    const handleExportToPDF = () => {
        handleExportMenuClose()
        setIsExporting(true)
        setExportProgress(0)

        ExportAssetsPDF(results.map(asset => asset.id))
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
                        <Button size='small' onClick={handleExportMenuOpen} disabled={isExporting || results.length === 0}>
                            Export
                        </Button>
                        <Menu open={openExportMenu} anchorEl={exportMenuAnchor} onClose={handleExportMenuClose}>
                            <MenuItem onClick={handleExportToCSV}>Export to CSV</MenuItem>
                            <MenuItem onClick={handleExportToPDF}>Export to PDF</MenuItem>
                        </Menu>
                    </div>
                </Box>

                {isExporting && (
                    <Box sx={{ width: '100%', px: 2, pt: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            Exporting: {Math.round(exportProgress * 100)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={exportProgress * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}

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