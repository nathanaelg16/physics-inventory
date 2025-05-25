import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";

interface Props {
    collectionType: 'set' | 'group',
    collectionName: string,
    onDelete: () => void,
    onCancel: () => void,
    open: boolean,
}

export default function DeleteCollectionDialog(props: Props) {
    const typeName = props.collectionType === 'set' ? 'Set' : 'Group'

    return <Dialog open={props.open} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {typeName}</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to delete the {props.collectionType} "{props.collectionName}"?
                The {props.collectionType} will be deleted from any labs that contain it as well.
                This action cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.onCancel}>Cancel</Button>
            <Button
                onClick={props.onDelete}
                variant="contained"
                color='error'
            >
                Delete
            </Button>
        </DialogActions>
    </Dialog>
}