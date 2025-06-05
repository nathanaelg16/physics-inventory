import styles from './header.module.css'
import EditableParagraph from '../editable-paragraph/EditableParagraph'
import {Chip, IconButton, Tooltip} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {nonEmptyFieldValidator} from "../../utils/validators";

interface Props {
    courseNumber: string
    courseName: string
    labName: string
    allowEdits: boolean
    onRename: (newName: string) => void
    onDelete: () => void
}

export default function LabHeader({courseNumber, courseName, labName, allowEdits, onRename, onDelete}: Props) {
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
                {allowEdits && (
                    <Tooltip title="Delete lab" arrow>
                        <IconButton
                            onClick={onDelete}
                            color="error"
                            size="medium"
                            className={styles.deleteButton}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
            <div className={styles.courseSubtitle}>
                <span className={styles.courseInfo}>{courseNumber}: {courseName}</span>
            </div>
        </div>
    )
}