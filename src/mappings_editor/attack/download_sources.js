/**
 * The base URL for the ATT&CK repository.
 */
const BASE_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";

/**
 * The framework's identifier.
 */
const FRAMEWORK_ID = "mitre_attack";

/**
 * Enterprise Sources
 */
const ENTERPRISE_SOURCES = [
    "14.1", "14.0", "13.1", "13.0", 
    "12.1", "12.0", "11.2", "11.1", 
    "11.0", "10.1", "10.0", "9.0",
    "8.2",  "8.1",  "8.0"
].map(v => ({
    url              : `${BASE_URL}/enterprise-attack/enterprise-attack-${ v }.json`,
    frameworkId      : FRAMEWORK_ID,
    frameworkVersion : `enterprise@${ v }`
}));

/**
 * ICS Sources
 */
const ICS_SOURCES = [
    "14.1", "14.0", "13.1", "13.0", 
    "12.1", "12.0", "11.3", "11.2", 
    "11.1", "11.0", "10.1", "10.0",
    "9.0",  "8.2",  "8.1",  "8.0"
].map(v => ({
    url              : `${BASE_URL}/ics-attack/ics-attack-${ v }.json`,
    frameworkId      : FRAMEWORK_ID,
    frameworkVersion : `ics@${ v }`
}));

/**
 * Mobile Sources
 */
const MOBILE_SOURCES = [
    "14.1", "14.0", "13.1", "13.0", 
    "12.1", "12.0", "11.3", "10.1",
    "10.0", "9.0",  "8.2",  "8.1",
    "8.0"
].map(v => ({
    url              : `${BASE_URL}/mobile-attack/mobile-attack-${ v }.json`,
    frameworkId      : FRAMEWORK_ID,
    frameworkVersion : `mobile@${ v }`,
}));

/**
 * The STIX sources.
 */
const STIX_SOURCES = [
    ...ENTERPRISE_SOURCES,
    ...ICS_SOURCES,
    ...MOBILE_SOURCES    
]

/**
 * Export
 */
module.exports = {
    STIX_SOURCES
};
