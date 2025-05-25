import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {KeyboardEvent} from "react";

interface Props {
    collectionType: 'set' | 'group',
    collectionName: string,
    setCollectionName: (name: string) => void,
    onSave: () => void,
    onCancel: () => void,
    open: boolean,
}

export default function NewCollectionDialog(props: Props) {
    const typeName = props.collectionType === 'set' ? 'Set' : 'Group'

    const enterKeyListener = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && Boolean(props.collectionName.trim())) {
            e.preventDefault()
            props.onSave()
        }
    }

    return <Dialog open={props.open} maxWidth="xs" fullWidth>
        <DialogTitle>Create New {typeName}</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label={`${typeName} Name`}
                fullWidth
                variant="outlined"
                value={props.collectionName}
                onChange={(e) => props.setCollectionName(e.target.value)}
                autoComplete="off"
                onKeyUp={enterKeyListener}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onCancel}>Cancel</Button>
            <Button
                onClick={props.onSave}
                variant="contained"
                color='primary'
                disabled={!props.collectionName.trim()}
            >
                Create
            </Button>
        </DialogActions>
    </Dialog>
}