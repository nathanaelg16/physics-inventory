import styles from './labDataCard.module.css'
import {
    Avatar,
    Badge,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import {Delete, Group, Inventory, LocationOn, Notes, Preview, Recycling, Science} from '@mui/icons-material'
import {main} from '../../../wailsjs/go/models'
import EditableParagraph from '../editable-paragraph/EditableParagraph'
import LabData = main.LabData;

enum LabDataType {
    AssetType = 0,
    GroupType = 1,
    SetType = 2
}

interface Props {
    data: LabData
    allowEdits: boolean
}

export default function LabDataCard({ data, allowEdits }: Props) {
    const theme = useTheme()
    const isLargeScreen = useMediaQuery(theme.breakpoints.down(1369))

    const getTypeInfo = () => {
        switch (data.type) {
            case LabDataType.AssetType:
                return {
                    icon: <Science />,
                    label: 'Asset',
                    color: '#f44336',
                    bgColor: '#ffebee',
                    lightBgColor: '#fef5f5'
                }
            case LabDataType.GroupType:
                return {
                    icon: <Group />,
                    label: 'Group',
                    color: '#2196f3',
                    bgColor: '#e3f2fd',
                    lightBgColor: '#f3f9ff'
                }
            case LabDataType.SetType:
                return {
                    icon: <Inventory />,
                    label: 'Set',
                    color: '#4caf50',
                    bgColor: '#e8f5e8',
                    lightBgColor: '#f1f8f1'
                }
            default:
                return {
                    icon: <Science />,
                    label: 'Unknown',
                    color: '#666',
                    bgColor: '#f5f5f5',
                    lightBgColor: '#fafafa'
                }
        }
    }

    const typeInfo = getTypeInfo()

    const handleSave = (field: string) => (newValue: string) => {
        console.log(`Saving ${field}:`, newValue)
        // TODO: Implement actual save functionality
    }

    return (
        <Card
            sx={{
                mb: 2,
                transition: 'all 0.2s ease',
                border: '1px solid #e0e0e0',
                borderLeft: `4px solid ${typeInfo.color}`,
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)'
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Type and Icon Section */}
                    <Grid size={{xs: 12, sm: 2, lg: 2}}>
                        <Stack direction="column" alignItems="center" spacing={1}>
                            <Badge
                                badgeContent={data.consumable ? <Recycling fontSize="small" /> : null}
                                color="warning"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: typeInfo.bgColor,
                                        color: typeInfo.color,
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    {typeInfo.icon}
                                </Avatar>
                            </Badge>
                            <Chip
                                label={typeInfo.label}
                                size="small"
                                sx={{
                                    bgcolor: typeInfo.bgColor,
                                    color: typeInfo.color,
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Stack>
                    </Grid>

                    {/* Name and Location Section */}
                    <Grid size={{xs: 12, sm: 10, lg: 6}}>
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        wordBreak: 'break-word',
                                        lineHeight: 1.2,
                                        flex: 1,
                                        minWidth: 0
                                    }}
                                >
                                    {data.name.String || 'Unnamed Item'}
                                </Typography>
                                {data.consumable && (
                                    <Chip
                                        icon={<Recycling fontSize="small" />}
                                        label="Consumable"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>

                            {data.location.String && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {data.location.String}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Grid>

                    {/* Quantities Section */}
                    <Grid size={{xs: 12, sm: 12, lg: 3}}>
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: typeInfo.lightBgColor,
                                        border: `1px solid ${typeInfo.bgColor}`,
                                        textAlign: 'center',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                                        Per Station
                                    </Typography>
                                    <EditableParagraph
                                        text={data.quantityPerStation}
                                        onSave={handleSave('quantityPerStation')}
                                        allowEdits={allowEdits}
                                        placeholder="0"
                                        className={styles.quantityDisplay}
                                    />
                                </Paper>
                            </Grid>
                            <Grid size={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: typeInfo.lightBgColor,
                                        border: `1px solid ${typeInfo.bgColor}`,
                                        textAlign: 'center',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                                        Front Table
                                    </Typography>
                                    <EditableParagraph
                                        text={data.quantityOnFrontTable}
                                        onSave={handleSave('quantityOnFrontTable')}
                                        allowEdits={allowEdits}
                                        placeholder="0"
                                        className={styles.quantityDisplay}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Actions Section */}
                    <Grid size={{xs: 12, sm: 12, lg: 1}}>
                        <Stack direction={{ xs: 'row', sm: 'row', lg: 'column' }} spacing={1} justifyContent="center">
                            <Tooltip title="View details">
                                <IconButton
                                    size="medium"
                                    sx={{
                                        bgcolor: '#f5f5f5',
                                        '&:hover': { bgcolor: '#e0e0e0' }
                                    }}
                                >
                                    <Preview />
                                </IconButton>
                            </Tooltip>

                            {allowEdits && (
                                <Tooltip title="Remove from lab">
                                    <IconButton
                                        size="medium"
                                        color="error"
                                        sx={{
                                            bgcolor: '#f5f5f5',
                                            '&:hover': { bgcolor: '#ffebee' }
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                {/* Notes Section - Always visible */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ px: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Notes fontSize="small" color="action" sx={{ mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                                Notes
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <EditableParagraph
                                    text={data.notes.String}
                                    onSave={handleSave('notes')}
                                    allowEdits={allowEdits}
                                    multiline
                                    placeholder={allowEdits ? 'Add notes...' : 'No notes available.'}
                                    className={styles.notes}
                                />
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    )
}