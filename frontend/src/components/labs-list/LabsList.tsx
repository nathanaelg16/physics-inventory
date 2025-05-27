import "./labsList.css"
import {useEffect, useState} from "react";
import {main} from "../../../wailsjs/go/models";
import {GetLabs} from "../../../wailsjs/go/main/App";
import {SnackbarAlert} from "../../utils/snackbar-alert";
import LabListItem from "../lab-list-item/LabListItem";
import Lab = main.Lab;

interface Props {
    labCourseId: number,
    onAlert: (snackbarAlert: SnackbarAlert) => void,
}

export default function LabsList({labCourseId, onAlert}: Props) {
    const [labs, setLabs] = useState<Lab[]>([])

    useEffect(() => {
        GetLabs(labCourseId)
            .then((labs) => setLabs(labs))
            .catch((err) => onAlert({
                severity: 'error',
                msg: err
            }))
    }, [labCourseId]);

    return <ul className="labs-list">
        {labs.map((lab) => <LabListItem labId={lab.id} labName={lab.name} />)}
    </ul>
}