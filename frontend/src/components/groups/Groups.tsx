import {
    AddSetRecordAssociatedByGroup,
    CreateGroup,
    DeleteGroup,
    DeleteGroupAssetAssociatedById,
    DeleteGroupAssetAssociatedByRecordLocator,
    ExportGroupCSV,
    ExportGroupPDF,
    GetGroupAssets,
    GetGroups,
    GetSets,
    RenameGroup
} from '../../../wailsjs/go/main/App'
import CollectionManager from "../collection-manager/CollectionManager";

export default function Groups() {
    const operations = {
        fetch: GetGroups,
        fetchRecords: GetGroupAssets,
        create: CreateGroup,
        rename: RenameGroup,
        delete: DeleteGroup,
        deleteRecordById: DeleteGroupAssetAssociatedById,
        deleteRecordByRecordLocator: DeleteGroupAssetAssociatedByRecordLocator,
        exportCSV: ExportGroupCSV,
        exportPDF: ExportGroupPDF,
        addToSet: AddSetRecordAssociatedByGroup,
        getAllSets: GetSets
    }

    return (
        <CollectionManager
            type="group"
            operations={operations}
            storageKey="selected_group"
        />
    )
}