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
const MANIFEST_FILE = "../src/assets/configuration/app.framework.manifest.json"


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
            description: object.description
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
        let filepath = resolve(__dirname,`../public/${ path }/${ filename }`);
        
        // Generate Framework File
        writeFileSync(filepath, JSON.stringify({
            frameworkId: source.frameworkId,
            frameworkVersion: source.frameworkVersion,
            categories: {
                // tactics    : filterAttackObjects(listings[i].get("tactic")),
                techniques : filterAttackObjects(listings[i].get("technique"))
            }
        }, null, 4));

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
