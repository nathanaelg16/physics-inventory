import {Typography} from "@mui/material";
import {useNavigate} from "react-router";

interface Props {
    labId: number,
    labName: string
}

export default function LabListItem({labId, labName}: Props) {
    const navigate = useNavigate()

    return <li className='lab-listing' onClick={() => navigate(`/labs/${labId}`)}>
        <Typography>{labName}</Typography>
    </li>
}