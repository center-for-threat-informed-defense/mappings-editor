/**
 * The base URL for the ATT&CK repository.
 */
const BASE_URL = "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master";


/**
 * Enterprise Sources
 */
const ENTERPRISE_SOURCES = [
    "18.0", "17.1", "17.0", "16.1",
    "16.0", "15.1", "15.0", "14.1",
    "14.0", "13.1", "13.0", "12.1",
    "12.0", "11.2", "11.1", "11.0",
    "10.1", "10.0", "9.0", "8.2",
    "8.1", "8.0"
].map(version => ({
    url              : `${BASE_URL}/enterprise-attack/enterprise-attack-${ version }.json`,
    frameworkId      : "mitre_attack_enterprise",
    frameworkVersion : version
}));

/**
 * ICS Sources
 */
const ICS_SOURCES = [
    "18.0", "17.1", "17.0", "16.1",
    "16.0", "15.1", "15.0", "14.1",
    "14.0", "13.1", "13.0", "12.1",
    "12.0", "11.3", "11.2", "11.1",
    "11.0", "10.1", "10.0", "9.0",
    "8.2", "8.1",  "8.0"
].map(version => ({
    url              : `${BASE_URL}/ics-attack/ics-attack-${ version }.json`,
    frameworkId      : "mitre_attack_ics",
    frameworkVersion : version
}));

/**
 * Mobile Sources
 */
const MOBILE_SOURCES = [
    "18.0", "17.1", "17.0", "16.1",
    "16.0", "15.1", "15.0", "14.1",
    "14.0", "13.1", "13.0", "12.1",
    "12.0", "11.3", "10.1", "10.0",
    "9.0", "8.2",  "8.1",  "8.0"
].map(version => ({
    url              : `${BASE_URL}/mobile-attack/mobile-attack-${ version }.json`,
    frameworkId      : "mitre_attack_mobile",
    frameworkVersion : version,
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
