import styles from './header.module.css'
import EditableParagraph from '../editable-paragraph/EditableParagraph'
import {Chip, IconButton, Menu, MenuItem, Tooltip} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {nonEmptyFieldValidator} from "../../utils/validators";
import {Download} from '@mui/icons-material';
import {useState} from 'react';

interface Props {
    courseNumber: string
    courseName: string
    labName: string
    allowEdits: boolean
    onRename: (newName: string) => void
    onDelete: () => void
    onExport: (option: 'csv' | 'pdf') => void
}

export default function LabHeader({courseNumber, courseName, labName, allowEdits, onRename, onDelete, onExport}: Props) {
    const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
    const showExportMenu = Boolean(exportMenuAnchor)

    return (
        <div className={styles.headerCard}>
            <Chip label='Lab' color='primary' sx={{fontWeight: 600, mb: 2}}/>
            <div className={styles.headerContent}>
                <div className={styles.headerText}>
                    <EditableParagraph
                        text={labName}
                        onSave={onRename}
                        allowEdits={allowEdits}
                        className={styles.headerCardTitle}
                        validator={nonEmptyFieldValidator}
                    />
                </div>
                <div className={styles.headerActions}>
                    <Tooltip title='Export lab' arrow>
                        <IconButton
                            color='primary'
                            size='medium'
                            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                        >
                            <Download />
                        </IconButton>
                    </Tooltip>
                    <Menu open={showExportMenu}
                          onClose={() => setExportMenuAnchor(null)}
                          anchorEl={exportMenuAnchor}
                    >
                        <MenuItem onClick={() => {
                            setExportMenuAnchor(null)
                            onExport('csv')}
                        }>
                            Export to CSV
                        </MenuItem>
                        <MenuItem onClick={() => {
                            setExportMenuAnchor(null)
                            onExport('pdf')}
                        }>
                            Export to PDF
                        </MenuItem>
                    </Menu>
                    {allowEdits && (
                        <Tooltip title="Delete lab" arrow>
                            <IconButton
                                onClick={onDelete}
                                color="error"
                                size="medium"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className={styles.courseSubtitle}>
                <span className={styles.courseInfo}>{courseNumber}: {courseName}</span>
            </div>
        </div>
    )
}