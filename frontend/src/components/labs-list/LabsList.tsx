import './labsList.css'
import {useEffect, useState} from 'react'
import {main} from '../../../wailsjs/go/models'
import {GetLabs} from '../../../wailsjs/go/main/App'
import {SnackbarAlert} from '../../utils/snackbar-alert'
import LabListItem from '../lab-list-item/LabListItem'
import {Typography} from '@mui/material'
import {ScienceOutlined} from '@mui/icons-material'
import Lab = main.Lab;

interface Props {
    labCourseId: number,
    onAlert: (snackbarAlert: SnackbarAlert) => void,
}

export default function LabsList({labCourseId, onAlert}: Props) {
    const [labs, setLabs] = useState<Lab[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)
        GetLabs(labCourseId)
            .then((labs) => {
                setLabs(labs)
            })
            .catch((err) => onAlert({
                severity: 'error',
                msg: err
            }))
            .finally(() => setLoading(false))
    }, [labCourseId, onAlert])

    if (loading) {
        return (
            <div className='labs-list-loading'>
                {Array.from({length: 6}).map((_, index) => (
                    <div key={index} className='lab-listing-skeleton'>
                        <div className='skeleton-header'>
                            <div className='skeleton-icon'></div>
                            <div className='skeleton-content'>
                                <div className='skeleton-title'></div>
                                <div className='skeleton-subtitle'></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (labs.length === 0) {
        return (
            <div className='labs-list-empty'>
                <ScienceOutlined className='labs-list-empty-icon' />
                <Typography variant='h6' gutterBottom>
                    No Labs Found
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                    This course doesn't have any labs yet. Create a new lab to get started.
                </Typography>
            </div>
        )
    }

    return (
        <ul className='labs-list'>
            {labs.map((lab) => (
                <LabListItem
                    key={lab.id}
                    labId={lab.id}
                    labName={lab.name}
                />
            ))}
        </ul>
    )
}