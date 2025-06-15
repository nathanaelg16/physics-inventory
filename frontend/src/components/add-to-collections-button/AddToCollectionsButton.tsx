import {SyntheticEvent, useEffect, useState} from 'react'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {PlaylistAdd} from '@mui/icons-material'
import {
    AddGroupAssetAssociatedById,
    AddGroupAssetAssociatedByRecordLocator,
    AddSetRecordAssociatedById,
    AddSetRecordAssociatedByRecordLocator,
    CreateGroup,
    CreateSet,
    GetGroups,
    GetSets
} from '../../../wailsjs/go/main/App'
import {main} from "../../../wailsjs/go/models";

interface DialogProps {
    assetId: number
    recordLocator: number
    disabled?: boolean
    buttonType?: 'button' | 'icon'
    buttonSize?: 'small' | 'medium' | 'large'
}

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

export default function AddToCollectionsButton({assetId, recordLocator, disabled = false, buttonType = 'button', buttonSize = 'medium'}: DialogProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tabValue, setTabValue] = useState(0)
    const [availableSets, setAvailableSets] = useState<main.Set[]>([])
    const [availableGroups, setAvailableGroups] = useState<main.Group[]>([])
    const [newSetName, setNewSetName] = useState('')
    const [newGroupName, setNewGroupName] = useState('')
    const [selectedSetId, setSelectedSetId] = useState<number | null>(null)
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
    const [setAssociationType, setSetAssociationType] = useState<'id' | 'recordLocator'>('id')
    const [groupAssociationType, setGroupAssociationType] = useState<'id' | 'recordLocator'>('id')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (dialogOpen) {
            loadAvailableData()
        }
    }, [dialogOpen])

    const loadAvailableData = async () => {
        try {
            setLoading(true)
            const [sets, groups] = await Promise.all([
                GetSets(),
                GetGroups()
            ])
            setAvailableSets(sets)
            setAvailableGroups(groups)
        } catch (err) {
            setError('Failed to load available sets and groups')
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (event: SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
        setError(null)
        setSuccess(null)
    }

    const handleAddToSet = async () => {
        if (!selectedSetId && !newSetName.trim()) {
            setError('Please select a set or create a new one')
            return
        }

        try {
            setLoading(true)
            setError(null)
            let setId = selectedSetId

            if (newSetName.trim() && !selectedSetId) {
                setId = await CreateSet(newSetName.trim())
                setSuccess(`Created new set "${newSetName.trim()}"`)
            }

            if (setId) {
                if (setAssociationType === 'id') {
                    await AddSetRecordAssociatedById(setId, assetId)
                } else {
                    if (recordLocator === -1) {
                        throw new Error('Cannot associate by record locator: asset has no record number')
                    }
                    await AddSetRecordAssociatedByRecordLocator(setId, recordLocator)
                }

                const setName = selectedSetId
                    ? availableSets.find(s => s.id === selectedSetId)?.name || 'Unknown Set'
                    : newSetName.trim()

                setSuccess(`Asset successfully added to set "${setName}"`)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add asset to set')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToGroup = async () => {
        if (!selectedGroupId && !newGroupName.trim()) {
            setError('Please select a group or create a new one')
            return
        }

        try {
            setLoading(true)
            setError(null)
            let groupId = selectedGroupId

            if (newGroupName.trim() && !selectedGroupId) {
                groupId = await CreateGroup(newGroupName.trim())
                setSuccess(`Created new group "${newGroupName.trim()}"`)
            }

            if (groupId) {
                if (groupAssociationType === 'id') {
                    await AddGroupAssetAssociatedById(groupId, assetId)
                } else {
                    if (recordLocator === -1) {
                        throw new Error('Cannot associate by record locator: asset has no record number')
                    }
                    await AddGroupAssetAssociatedByRecordLocator(groupId, recordLocator)
                }

                const groupName = selectedGroupId
                    ? availableGroups.find(g => g.id === selectedGroupId)?.name || 'Unknown Group'
                    : newGroupName.trim()

                setSuccess(`Asset successfully added to group "${groupName}"`)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add asset to group')
        } finally {
            setLoading(false)
        }
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setTabValue(0)
        setNewSetName('')
        setNewGroupName('')
        setSelectedSetId(null)
        setSelectedGroupId(null)
        setSetAssociationType('id')
        setGroupAssociationType('id')
        setError(null)
        setSuccess(null)
    }

    const handleSetSelectChange = (event: SelectChangeEvent<number>) => {
        const value = event.target.value
        setSelectedSetId(typeof value === 'number' ? value : null)
        if (value) {
            setNewSetName('')
        }
    }

    const handleGroupSelectChange = (event: SelectChangeEvent<number>) => {
        const value = event.target.value
        setSelectedGroupId(typeof value === 'number' ? value : null)
        if (value) {
            setNewGroupName('')
        }
    }

    return (
        <>
            {buttonType === 'button' ? (
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PlaylistAdd />}
                    onClick={() => setDialogOpen(true)}
                    disabled={disabled}
                    size={buttonSize}
                >
                    Add to Set/Group
                </Button>
            ) : (
                <Tooltip title='Add to Set/Group'>
                    <IconButton color='primary'
                                size={buttonSize}
                                disabled={disabled}
                                onClick={() => setDialogOpen(true)}
                    >
                        <PlaylistAdd />
                    </IconButton>
                </Tooltip>
            )}


            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Asset to Set or Group</DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Sets" />
                            <Tab label="Groups" />
                        </Tabs>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Asset ID: {assetId} | Record #: {recordLocator >= 0 ? recordLocator.toString().padStart(5, '0') : 'N/A'}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <FormLabel component="legend">Associate by:</FormLabel>
                            <RadioGroup
                                row
                                value={setAssociationType}
                                onChange={(e) => setSetAssociationType(e.target.value as 'id' | 'recordLocator')}
                            >
                                <FormControlLabel value="id" control={<Radio />} label="Asset ID" />
                                <FormControlLabel
                                    value="recordLocator"
                                    control={<Radio />}
                                    label="Record Number"
                                    disabled={recordLocator === -1}
                                />
                            </RadioGroup>
                            {recordLocator === -1 && setAssociationType === 'recordLocator' && (
                                <Typography variant="caption" color="error">
                                    Asset must have a record number to associate by record locator
                                </Typography>
                            )}
                        </Box>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Existing Set</InputLabel>
                            <Select
                                value={selectedSetId || ''}
                                onChange={handleSetSelectChange}
                                label="Select Existing Set"
                                disabled={loading}
                            >
                                {availableSets.map((set) => (
                                    <MenuItem key={set.id} value={set.id}>
                                        {set.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                            - OR -
                        </Typography>

                        <TextField
                            fullWidth
                            label="Create New Set"
                            value={newSetName}
                            onChange={(e) => {
                                setNewSetName(e.target.value)
                                if (e.target.value) {
                                    setSelectedSetId(null)
                                }
                            }}
                            disabled={loading}
                            helperText="Enter a name to create a new set"
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Asset ID: {assetId} | Record #: {recordLocator >= 0 ? recordLocator.toString().padStart(5, '0') : 'N/A'}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <FormLabel component="legend">Associate by:</FormLabel>
                            <RadioGroup
                                row
                                value={groupAssociationType}
                                onChange={(e) => setGroupAssociationType(e.target.value as 'id' | 'recordLocator')}
                            >
                                <FormControlLabel value="id" control={<Radio />} label="Asset ID" />
                                <FormControlLabel
                                    value="recordLocator"
                                    control={<Radio />}
                                    label="Record Number"
                                    disabled={recordLocator === -1}
                                />
                            </RadioGroup>
                            {recordLocator === -1 && groupAssociationType === 'recordLocator' && (
                                <Typography variant="caption" color="error">
                                    Asset must have a record number to associate by record locator
                                </Typography>
                            )}
                        </Box>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Select Existing Group</InputLabel>
                            <Select
                                value={selectedGroupId || ''}
                                onChange={handleGroupSelectChange}
                                label="Select Existing Group"
                                disabled={loading}
                            >
                                {availableGroups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                            - OR -
                        </Typography>

                        <TextField
                            fullWidth
                            label="Create New Group"
                            value={newGroupName}
                            onChange={(e) => {
                                setNewGroupName(e.target.value)
                                if (e.target.value) {
                                    setSelectedGroupId(null)
                                }
                            }}
                            disabled={loading}
                            helperText="Enter a name to create a new group"
                        />
                    </TabPanel>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={tabValue === 0 ? handleAddToSet : handleAddToGroup}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : `Add to ${tabValue === 0 ? 'Set' : 'Group'}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}