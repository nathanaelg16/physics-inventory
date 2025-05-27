import {Typography} from '@mui/material'
import {useNavigate} from 'react-router'
import {Science} from '@mui/icons-material'

interface Props {
    labId: number,
    labName: string
}

export default function LabListItem({labId, labName}: Props) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/labs/${labId}`)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
        }
    }

    return (
        <li
            className='lab-listing'
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role='button'
        >
            <div className='lab-listing-icon'>
                <Science fontSize='small' />
            </div>
            <Typography className='lab-listing-title'>
                {labName}
            </Typography>
        </li>
    )
}