import {
    CreateSet,
    DeleteSet,
    DeleteSetRecordAssociatedByGroup,
    DeleteSetRecordAssociatedById,
    DeleteSetRecordAssociatedByRecordLocator,
    ExportSetCSV,
    ExportSetPDF,
    GetSetRecords,
    GetSets,
    RenameSet
} from '../../../wailsjs/go/main/App'
import CollectionManager from "../collection-manager/CollectionManager";

interface Props {
    onNavigateToGroup: (groupId: number) => void
}

export default function Sets({onNavigateToGroup}: Props) {
    const operations = {
        fetch: GetSets,
        fetchRecords: GetSetRecords,
        create: CreateSet,
        rename: RenameSet,
        delete: DeleteSet,
        deleteRecordById: DeleteSetRecordAssociatedById,
        deleteRecordByRecordLocator: DeleteSetRecordAssociatedByRecordLocator,
        deleteRecordByGroup: DeleteSetRecordAssociatedByGroup,
        exportCSV: ExportSetCSV,
        exportPDF: ExportSetPDF
    }

    return (
        <CollectionManager
            type="set"
            operations={operations}
            storageKey="selected_set"
            onNavigateToGroup={onNavigateToGroup}
        />
    )
}