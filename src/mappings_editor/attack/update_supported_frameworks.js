const { resolve } = require("path");
const { writeFileSync } = require("fs");
const { fetchAttackData } = require("./download_attack");
const { STIX_SOURCES } = require("./download_sources");


/**
 * The framework directory's path.
 */
const FRAMEWORKS_DIR_PATH = "frameworks";

/**
 * The framework manifest file.
 */
const MANIFEST_FILE = "./src/assets/configuration/app.framework.manifest.json"


/**
 * Add data sources to data components for detections
 * @param {AttackObject} data_sources
 * @param {AttackObject} data_components
 */
function buildDataSourceRelationships(data_sources, data_components) {
    for (let dc_obj of data_components) {
        if (dc_obj.deprecated) {
            continue;
        }
        const ds_obj = data_sources.find((obj) => obj.stixId === dc_obj.dataSourceRef);
        if (ds_obj) {
            dc_obj['data_source'] = ds_obj;
        }
    }
}

/**
 * Attach ATT&CK Objects to other ATT&CK Objects based on STIX relationships
 * @param {AttackObject} source_objects
 * @param {AttackObject} target_objects
 * @param {AttackObject} relationships
 * @param {string} field
 */
function buildAttackRelationships(source_objects, target_objects, relationships, field) {
    for (let source of source_objects) {
        if (source.deprecated) {
            continue;
        }
        const source_relationships = relationships.filter((obj) => obj.sourceRef === source.stixId);
        for (const relationship of source_relationships) {
            const target = target_objects.find((obj) => obj.stixId === relationship.targetRef);
            if (target && target.deprecated || target === undefined) {
                continue;
            }
            if (target[field] === undefined) {
                target[field] = [];
            }
            if (field === "detections") {
                target[field].push({
                    id: source.data_source.id,
                    name: source.data_source.name,
                    description: source.data_source.description,
                })
                continue;
            }
            target[field].push({
                id: source.id,
                name: source.name,
                description: source.description,
            });
        }
    }
}

/**
 * Filters a set of ATT&CK Objects to only those that haven't been deprecated.
 * @param {AttackObject} objects
 *  The set of ATT&CK Objects to filter.
 */
function filterAttackObjects(objects) {
    let filtered = [];
    for(let object of objects) {
        if(object.deprecated) {
            continue;
        }
        filtered.push({
            id: object.id,
            name: object.name,
            description: object.description,
            mitigations: object.mitigations ? object.mitigations : [],
            detections: object.detections ? object.detections : [],
        });
    }
    return filtered;
}

/**
 * Updates the specified framework's directory.
 * @param {string} path
 *  The framework directory's path.
 * @param  {...string} sources
 *  A list of STIX sources specified by name, version, and url.
 */
async function updateApplicationFrameworks(path, ...sources) {

    // Collect ATT&CK Data
    let downloads = [];
    for(let source of sources) {
        downloads.push(fetchAttackData(source.url));
    }
    let listings = await Promise.all(downloads);

    // Generate Framework Listings
    console.log("→ Generating Framework Listing Files...");
    let manifest = {
        path: FRAMEWORKS_DIR_PATH,
        files: [],
    };
    for(let i = 0; i < sources.length; i++) {
        let source = sources[i];
        let filename = `${source.frameworkId}_${source.frameworkVersion}.json`
        let filepath = resolve(__dirname, `../public/${path}/${filename}`);

        // Link data sources to data components (ATT&CK v17.1 and earlier)
        buildDataSourceRelationships(
            listings[i].get("data_source"),
            listings[i].get("data_component")
        );

        // Link objects via relationships
        buildAttackRelationships(
            listings[i].get("mitigation"),
            listings[i].get("technique"),
            listings[i].get("mitigates"),
            'mitigations'
        );
        buildAttackRelationships(
            listings[i].get("data_component"),
            listings[i].get("technique"),
            listings[i].get("detects"),
            "detections"
        );

        // Generate Framework File
        writeFileSync(
            filepath,
            JSON.stringify(
                {
                    frameworkId: source.frameworkId,
                    frameworkVersion: source.frameworkVersion,
                    categories: {
                        // tactics    : filterAttackObjects(listings[i].get("tactic")),
                        techniques: filterAttackObjects(
                            listings[i].get("technique")
                        )
                    },
                },
                null,
                4
            )
        );

        // Update Manifest
        manifest.files.push({
            frameworkId: source.frameworkId,
            frameworkVersion: source.frameworkVersion,
            filename
        });

    }

    // Generate Manifest File
    writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 4));

    // Done
    console.log("\nFramework files updated successfully.\n");

}

/**
 * Main
 */
updateApplicationFrameworks(FRAMEWORKS_DIR_PATH, ...STIX_SOURCES);
