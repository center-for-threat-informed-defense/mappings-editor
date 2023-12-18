import type { MappingFileSerializer } from "."

export interface AppConfiguration {
    file_type_name: string,
    file_type_extension: string,
    native_frameworks_manifest: {
        path: string,
        files: {
            frameworkId: string,
            frameworkVersion: string,
            filename: string
        }[]
    },
    menus: {
        help_menu: {
            help_links: { text: string, url: string }[]
        }
    },
    serializer?: typeof MappingFileSerializer;
}
