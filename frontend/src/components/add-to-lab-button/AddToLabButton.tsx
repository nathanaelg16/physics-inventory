import {Science} from "@mui/icons-material";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import {useEffect, useState} from "react";
import {main} from "../../../wailsjs/go/models";
import {GetLabCourses, GetLabs} from "../../../wailsjs/go/main/App";
import LabCourse = main.LabCourse;
import Lab = main.Lab;

interface Props {
    onSave: (labId: number, qtyPerStation: string, qtyFrontTable: string, notes: string) => void,
    disabled: boolean
}

export default function AddToLabButton({onSave, disabled}: Props) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false)

    const [labCourses, setLabCourses] = useState<LabCourse[]>([])
    const [labs, setLabs] = useState<Lab[]>([])

    const [selectedLabCourseNumber, setSelectedLabCourseNumber] = useState<string | null>('')
    const [selectedLabId, setSelectedLabId] = useState<number | null>(null)

    const [qtyPerStation, setQtyPerStation] = useState<string>('')
    const [qtyFrontTable, setQtyFrontTable] = useState<string>('')
    const [notes, setNotes] = useState<string>('')

    const [alert, setAlert] = useState<string | null>(null)

    useEffect(() => {
        if (dialogOpen) {
            GetLabCourses()
                .then((labCourses) => setLabCourses(labCourses))
                .catch((err) => setAlert(err))
        }
    }, [dialogOpen])

    useEffect(() => {
        if (selectedLabCourseNumber) {
            GetLabs(selectedLabCourseNumber)
                .then((labs) => setLabs(labs))
                .catch((err) => setAlert(err))
        }
    }, [selectedLabCourseNumber]);

    const handleDialogClose = () => {
        setSelectedLabCourseNumber(null)
        setSelectedLabId(null)
        setAlert(null)
        setDialogOpen(false)
    }

    return <>
        <Button variant='outlined'
                color='primary'
                startIcon={<Science />}
                onClick={() => setDialogOpen(true)}
                disabled={disabled}
                size='small'
        >
            Add to Lab
        </Button>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add to Lab</DialogTitle>
            <DialogContent>
                {alert && <Alert severity='error'>{alert}</Alert>}
                <Select label='Select a course'
                        value={selectedLabCourseNumber}
                        onChange={(e) => setSelectedLabCourseNumber(e.target.value as string)}
                        fullWidth
                        sx={{mt: 2}}
                >
                    {labCourses.map((lc) => <MenuItem key={lc.courseNumber} value={lc.courseNumber}>{lc.courseNumber}: {lc.courseName}</MenuItem>)}
                </Select>
                <Select label='Select a lab'
                        value={selectedLabId}
                        onChange={(e) => setSelectedLabId(e.target.value as number)}
                        fullWidth
                >
                    {labs.map((lab) => <MenuItem key={lab.id} value={lab.id}>{lab.name}</MenuItem>)}
                </Select>
                <Divider />
                <TextField label='Qty Per Station'
                           value={qtyPerStation}
                           onChange={(e) => setQtyPerStation(e.target.value)}
                />
                <TextField label='Qty Front Table'
                           value={qtyFrontTable}
                           onChange={(e) => setQtyFrontTable(e.target.value)}
                />
                <TextField label='Notes'
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           multiline
                           fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button
                    onClick={() => {
                        if (!selectedLabId) return
                        onSave(selectedLabId, qtyPerStation, qtyFrontTable, notes)
                        handleDialogClose()
                    }}
                    disabled={!(selectedLabCourseNumber && selectedLabId && qtyPerStation && qtyFrontTable)}>Add</Button>
            </DialogActions>
        </Dialog>
    </>
}