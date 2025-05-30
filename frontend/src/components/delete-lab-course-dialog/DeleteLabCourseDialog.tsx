import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {DeleteLabCourse} from "../../../wailsjs/go/main/App";
import {useState} from "react";

interface Props {
    open: boolean,
    onClose: () => void,
    onDeleted: () => void,
    courseNumber: string,
    courseName: string,
}

export default function({open, onClose, onDeleted, courseNumber, courseName}: Props) {
    const [error, setError] = useState<string | null>(null)

    const deleteCourse = () => {
        DeleteLabCourse(courseNumber)
            .then(() => {
                onDeleted()
                onClose()
            }).catch((err) => setError(err))
    }

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
            {error && (
                <Alert severity='error' sx={{ borderRadius: 1.5 }}>
                    Error: {error}
                </Alert>
            )}
            <Typography fontWeight='600'>{courseName}</Typography>
            <Typography>
                Are you sure you want to delete this course and all its associated labs?
                This action cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={deleteCourse}>Delete</Button>
        </DialogActions>
    </Dialog>
}