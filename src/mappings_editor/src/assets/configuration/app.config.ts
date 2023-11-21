import type { AppConfiguration } from "@/assets/scripts/Application";
import * as manifest from "@/assets/configuration/app.framework.manifest.json";

const config: AppConfiguration = {
    file_type_name: "Mappings File",
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
                    url: "https://github.com/center-for-threat-informed-defense/cti-blueprints/blob/main/src/cti_authoring_tool/CHANGELOG.md"
                }
            ]
        }
    }
}

export default config;
