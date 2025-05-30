import listItemStyles from './labListItem.module.css'
import newItemStyles from './newLabItem.module.css'
import {Typography} from '@mui/material'
import {Add} from '@mui/icons-material'
import {KeyboardEvent} from 'react'

interface Props {
    onClick: () => void
}

export default function NewLabItem({onClick}: Props) {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
        }
    }

    return (
        <li
            className={`${listItemStyles.labListing} ${newItemStyles.newLabItem}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role='button'
            aria-label='Add new lab'
        >
            <div className={`${listItemStyles.labListingIcon} ${newItemStyles.newLabIcon}`}>
                <Add fontSize='small' />
            </div>
            <Typography className={`${listItemStyles.labListingTitle} ${newItemStyles.newLabTitle}`}>
                Add New Lab
            </Typography>
        </li>
    )
}