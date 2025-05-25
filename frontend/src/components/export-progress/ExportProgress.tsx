import {Box, LinearProgress, Typography} from "@mui/material";
import {EventsOff, EventsOn} from "../../../wailsjs/runtime";
import {useEffect, useState} from "react";

interface Props {
    isExporting: boolean,
    onExportComplete: () => void,
    sx?: any,
}

export default function ExportProgress({isExporting, onExportComplete, sx = {}}: Props) {
    const [exportProgress, setExportProgress] = useState<number>(0.0)

    useEffect(() => {
        if (isExporting) {
            EventsOn('export-progress', (progress: number) => {
                setExportProgress(progress)
                if (progress >= 1) {
                    setTimeout(() => {
                        setExportProgress(0)
                        onExportComplete()
                    }, 2000)
                }
            })
        } else {
            EventsOff('export-progress')
            setExportProgress(0)
        }

        // Cleanup event listeners if component unmounts
        return () => {
            EventsOff('export-progress')
        }
    }, [isExporting])

    return isExporting ? <Box sx={{px: 2, pt: 1, mb: 2, ...sx}}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            Exporting: {Math.round(exportProgress * 100)}%
        </Typography>
        <LinearProgress
            variant="determinate"
            value={exportProgress * 100}
            sx={{ height: 8, borderRadius: 4 }}
        />
    </Box> : <></>
}