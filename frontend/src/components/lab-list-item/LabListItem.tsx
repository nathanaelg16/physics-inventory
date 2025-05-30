import styles from './labListItem.module.css'
import {Typography} from '@mui/material'
import {useNavigate} from 'react-router'
import {Science} from '@mui/icons-material'
import {KeyboardEvent} from 'react'

interface Props {
    labId: number,
    labName: string
}

export default function LabListItem({labId, labName}: Props) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/labs/${labId}`)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
        }
    }

    return (
        <li
            className={styles.labListing}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role='button'
        >
            <div className={styles.labListingIcon}>
                <Science fontSize='small' />
            </div>
            <Typography className={styles.labListingTitle}>
                {labName}
            </Typography>
        </li>
    )
}