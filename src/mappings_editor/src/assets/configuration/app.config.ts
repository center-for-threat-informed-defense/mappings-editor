import * as manifest from "@/assets/configuration/app.framework.manifest.json";
import { UniversalSchemaMappingFileSerializer } from "./app.config.serializer";
import type { AppConfiguration } from "@/assets/scripts/Application";

const config: AppConfiguration = {
    file_type_name: "Mapping File",
    file_type_extension: "json",
    native_frameworks_manifest: manifest,
    menus: {
        help_menu: {
            help_links: [
                {
                    text: "GitHub Repository",
                    url: "https://github.com/center-for-threat-informed-defense/mappings-editor"
                },
                {
                    text: "Change Log",
                    url: "https://github.com/center-for-threat-informed-defense/mappings-editor/blob/main/src/mappings_editor/CHANGELOG.md"
                }
            ]
        }
    },
    serializer: UniversalSchemaMappingFileSerializer
}

export default config;
