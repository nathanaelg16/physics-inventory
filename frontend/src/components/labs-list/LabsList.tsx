import styles from './labsList.module.css'
import {useEffect, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {GetLabs} from '../../../wailsjs/go/main/App'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import LabListItem from '../lab-list-item/LabListItem'
import {Typography} from '@mui/material'
import {ScienceOutlined} from '@mui/icons-material'
import NewLabItem from "../lab-list-item/NewLabItem";
import Lab = main.Lab;

interface Props {
    labCourseNumber: string,
    onAlert: (snackbarAlert: SnackbarAlert) => void,
    onNewLab: () => void,
    canEdit: boolean,
}

export default function LabsList({labCourseNumber, onAlert, onNewLab, canEdit}: Props) {
    const [labs, setLabs] = useState<Lab[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)
        GetLabs(labCourseNumber)
            .then((labs) => {
                setLabs(labs)
            }).catch((err) => onAlert({
                severity: 'error', msg: err
            })).finally(() => setLoading(false))
    }, [labCourseNumber, onAlert])

    if (loading) {
        return (
            <div className={styles.labsListLoading}>
                {Array.from({length: 6}).map((_, index) => (
                    <div key={index} className={styles.labListingSkeleton}>
                        <div className={styles.skeletonIcon}></div>
                        <div className={styles.skeletonTitle}></div>
                    </div>
                ))}
            </div>
        )
    }

    return <>
        {labs.length === 0 && (<div className={styles.labsListEmpty}>
                <ScienceOutlined className={styles.labsListEmptyIcon}/>
                <Typography variant='h6' gutterBottom>
                    No Labs Found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                    This course doesn't have any labs yet. Create a new lab to get started.
                </Typography>
            </div>)}
        <ul className={styles.labsList}>
            {canEdit && <NewLabItem onClick={onNewLab}/>}

            {labs.map((lab) => (<LabListItem
                    key={lab.id}
                    labId={lab.id}
                    labName={lab.name}
                />))}
        </ul>
    </>
}