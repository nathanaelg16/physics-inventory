import styles from './header.module.css'
import EditableParagraph from "../editable-paragraph/EditableParagraph"

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
            <EditableParagraph
                text={labName}
                onSave={onRename}
                allowEdits={allowEdits}
                className={styles.headerCardTitle}
            />
            <div className={styles.courseSubtitle}>
                <span className={styles.courseInfo}>{courseNumber}: {courseName}</span>
            </div>
        </div>
    )
}