import styles from './labDataTableRow.module.css'
import tableStyles from '../../views/lab/labView.module.css'
import {Box, Collapse, IconButton, Stack, TableCell, TableRow, Tooltip, Typography} from '@mui/material'
import {main} from '../../../wailsjs/go/models'
import EditableParagraph from '../editable-paragraph/EditableParagraph'
import {Delete, ExpandLess, ExpandMore, Notes, Preview, Recycling} from '@mui/icons-material'
import {useState} from 'react'
import LabData = main.LabData;

interface Props {
    data: LabData
    allowEdits: boolean
}

enum LabDataType {
    AssetType = 0,
    GroupType = 1,
    SetType = 2
}

export default function LabDataTableRow({ data, allowEdits }: Props) {
    const [expanded, setExpanded] = useState(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    const getTypeInfo = () => {
        switch (data.type) {
            case LabDataType.AssetType:
                return {
                    className: styles.assetType,
                    tooltip: 'Asset',
                    icon: '•',
                    color: '#f44336'
                }
            case LabDataType.GroupType:
                return {
                    className: styles.groupType,
                    tooltip: 'Group',
                    icon: '•',
                    color: '#2196f3'
                }
            case LabDataType.SetType:
                return {
                    className: styles.setType,
                    tooltip: 'Set',
                    icon: '•',
                    color: '#4caf50'
                }
            default:
                return {
                    className: '',
                    tooltip: 'Unknown',
                    icon: '•',
                    color: '#666'
                }
        }
    }

    const typeInfo = getTypeInfo()
    const hasNotes = data.notes.String && data.notes.String.trim().length > 0

    const handleSave = (nv: string) => {
        console.log(nv)
    }

    return (
        <>
            <TableRow
                className={`${styles.tableRow} ${expanded ? styles.expandedRow : ''}`}
                hover
            >
                <TableCell className={tableStyles.typeColumn}>
                    <Stack direction='column' alignItems='center' spacing={0.5}>
                        <Tooltip title={typeInfo.tooltip}>
                            <Typography
                                className={`${styles.marker} ${typeInfo.className}`}
                                sx={{ color: typeInfo.color }}
                            >
                                {typeInfo.icon}
                            </Typography>
                        </Tooltip>

                        {data.consumable && (
                            <Tooltip title='Consumable'>
                                <Recycling
                                    fontSize='small'
                                    className={styles.consumableIcon}
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </TableCell>

                {/* Name Column */}
                <TableCell className={tableStyles.nameColumn}>
                    <Box className={styles.nameContainer}>
                        <Typography
                            variant="body2"
                            className={styles.itemName}
                            title={data.name.String}
                        >
                            {data.name.String}
                        </Typography>
                    </Box>
                </TableCell>

                {/* Location Column */}
                <TableCell className={tableStyles.locationColumn}>
                    <Box className={styles.locationContainer}>
                        <Typography variant="body2" className={styles.locationText}>
                            {data.location.String}
                        </Typography>
                    </Box>
                </TableCell>

                {/* Quantity Per Station Column */}
                <TableCell className={tableStyles.quantityColumn}>
                    <Box className={styles.quantityContainer}>
                        <EditableParagraph
                            text={data.quantityPerStation}
                            onSave={handleSave}
                            allowEdits={allowEdits}
                            placeholder='0'
                            className={`${styles.quantityText}`}
                        />
                        {data.quantityPerStation && (
                            <Typography variant="caption" className={styles.quantityLabel}>
                                per station
                            </Typography>
                        )}
                    </Box>
                </TableCell>

                {/* Quantity Front Table Column */}
                <TableCell className={tableStyles.quantityColumn}>
                    <Box className={styles.quantityContainer}>
                        <EditableParagraph
                            text={data.quantityOnFrontTable}
                            onSave={handleSave}
                            allowEdits={allowEdits}
                            placeholder='0'
                            className={`${styles.quantityText}`}
                        />
                        {data.quantityOnFrontTable && (
                            <Typography variant="caption" className={styles.quantityLabel}>
                                front table
                            </Typography>
                        )}
                    </Box>
                </TableCell>

                {/* Notes Column */}
                <TableCell className={tableStyles.notesColumn}>
                    <Box className={styles.notesContainer}>
                        {hasNotes ? (
                            <Box className={styles.notesPreview}>
                                <Typography
                                    variant="body2"
                                    className={styles.notesText}
                                    title={data.notes.String}
                                >
                                    {data.notes.String.length > 80
                                        ? `${data.notes.String.substring(0, 80)}...`
                                        : data.notes.String
                                    }
                                </Typography>
                                {data.notes.String.length > 80 && (
                                    <Typography variant="caption" className={styles.moreIndicator}>
                                        (click to expand)
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" className={styles.placeholder}>
                                No notes
                            </Typography>
                        )}
                    </Box>
                </TableCell>

                {/* Actions Column */}
                <TableCell className={tableStyles.actionsColumn}>
                    <Stack direction='row' spacing={0.5} justifyContent='center' alignItems='center'>
                        <Tooltip title='View details'>
                            <IconButton
                                size='small'
                                className={styles.actionButton}
                            >
                                <Preview fontSize='small' />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={hasNotes && data.notes.String.length > 80 ? 'View full notes' : expanded ? 'Show less' : 'Show more'}>
                            <IconButton
                                size='small'
                                onClick={toggleExpanded}
                                className={styles.actionButton}
                                disabled={!hasNotes || data.notes.String.length <= 80}
                            >
                                {expanded ? <ExpandLess fontSize='small' /> : <ExpandMore fontSize='small' />}
                            </IconButton>
                        </Tooltip>

                        {allowEdits && (
                            <>
                                <Tooltip title='Remove from lab'>
                                    <IconButton
                                        size='small'
                                        color='error'
                                        className={styles.deleteButton}
                                    >
                                        <Delete fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Stack>
                </TableCell>
            </TableRow>

            {/* Expanded Notes Row */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box className={styles.expandedContent}>
                            <Box className={styles.notesSection}>
                                <Typography variant="subtitle2" className={styles.sectionTitle}>
                                    <Notes fontSize="small" /> Full Notes
                                </Typography>

                                {allowEdits ? (
                                    <EditableParagraph
                                        text={data.notes.String}
                                        onSave={handleSave}
                                        allowEdits={true}
                                        multiline
                                        placeholder="Add notes about this item..."
                                        className={styles.expandedNotesEdit}
                                    />
                                ) : (
                                    <Typography
                                        variant="body2"
                                        className={styles.expandedNotes}
                                        style={{ whiteSpace: 'pre-wrap' }}
                                    >
                                        {data.notes.String || 'No notes available for this item.'}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}