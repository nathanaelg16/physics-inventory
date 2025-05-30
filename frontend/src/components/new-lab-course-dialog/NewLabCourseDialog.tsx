import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {CreateLabCourse} from "../../../wailsjs/go/main/App";

interface Props {
    open: boolean,
    onClose: () => void,
    onCreate: (courseNumber: string) => void,
}

export default function NewLabCourseDialog({open, onClose, onCreate}: Props) {
    const [courseNumber, setCourseNumber] = useState<string>('')
    const [courseName, setCourseName] = useState<string>('')

    const [error, setError] = useState<string | null>(null)

    const validAttributes = Boolean(courseNumber.trim()) && Boolean(courseName.trim())

    const addCourse = () => {
        if (!validAttributes) return
        CreateLabCourse(courseNumber.trim(), courseName.trim())
            .then(() => {
                onCreate(courseNumber.trim())
                onClose()
            }).catch((err) => setError(err))
    }

    useEffect(() => {
        setCourseName('')
        setCourseNumber('')
        setError(null)
    }, [open])

    return <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
        <DialogTitle>New Lab Course</DialogTitle>
        <DialogContent>
            {error && <Alert color='error' sx={{ mb: 2 }}>Error: {error}</Alert>}

            <TextField
                label='Course Number'
                fullWidth
                variant='outlined'
                placeholder='PHYS 111'
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
            />
            <TextField
                label='Course Name'
                fullWidth
                variant='outlined'
                placeholder='Introduction to Physics'
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color='error'>Cancel</Button>
            <Button onClick={addCourse} disabled={!validAttributes}>Save</Button>
        </DialogActions>
    </Dialog>
}