import {useState} from "react";

export default function useCollectionDialogs() {
    const [dialogs, setDialogs] = useState({
        new: false,
        rename: false,
        delete: false
    })

    const openDialog = (dialog: keyof typeof dialogs) => {
        setDialogs(prev => ({...prev, [dialog]: true}))
    }

    const closeDialog = (dialog: keyof typeof dialogs) => {
        setDialogs(prev => ({...prev, [dialog]: false}))
    }

    return {dialogs, openDialog, closeDialog}
}