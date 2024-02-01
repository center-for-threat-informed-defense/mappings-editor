# Mappings Editor Use Cases

- [Target Audience](#target-audience)
- [Usage](#usage)
- [User Stories](#user-stories)

## Target Audience

Certain roles and responsibilities associated with organizational risk management
processes and procedures require customization of security controls and capabilities.
These roles include:

Information System Security Manager / Officer (ISSM/ISSO)

- Responsibilities include ensuring the appropriate operational security posture is
  maintained for information systems or programs.

Security Engineer (SE)

- Responsibilities include developing and implementing security controls and solutions
  to protect networks and systems from unauthorized access and attacks.

Incident Response (IR) Professional

- Responsibilities include response, management, and coordination, and remediation
  activities for cyber incidents such as malware infections, data theft, ransomware
  encryption, denial of service, and control systems intrusions.

## Usage

The Mappings Editor enables the mapping of customized security controls or capabilities
to MITRE ATT&CK, either to be used solely internally within an organization or shared
with the Center or other organizations. Mappings Editor uses include:

1. Customized Mappings

- Create customized mappings for products or systems in use at your organization. Use
  those mappings to view and better understand current coverage of adversary behaviors
  provided by the mapped tools and capabilities.

2. Mappings Integration

- Create customized mappings for product capability or system settings. Use those
  mappings to integrate threat-informed defense into security operations, such as new
  system and network set up and configuration or to provide remediation actions to take
  in incident reports.

3. Mappings Contributions

- Create and share security capability mappings with the Center or other organizations
  using a unified data schema.

## User Stories

This section describes user stories for the Mappings Editor based on the roles
identified above. A short exploration of how a user story may be achieved follows
each story.

1. As an ISSM/ISSO, I want to provide input to system developers regarding security
   requirements and security engineering practices to incorporate to defend against
   adversary activity.

- Use the Mappings Editor to create customized mappings of available security controls
  or capabilities to specific adversary behaviors. Provide this customized input to
  support the SE, system developers, and information system owner’s selection and
  implementation of security controls most appropriate in mitigating cyber attacks
  of interest.

2. As a SE, I want to select and tailor capabilities and security controls to defend
   against specific threats and reduce residual risk to the organization.

- Use the Mappings Editor to create customized mappings of security controls and
  capabilities to threats of interest and share that information with the ISSM/ISSO
  for system-specific cyber defense. The mappings define a relationship between the
  security control and technique, and address protection from, detection of, or
  response to a given adversary behavior.

3. As an IR professional I want to ensure I have a complete picture of an active
   security incident.

- Use the Mappings Editor to map security capabilities for products or frameworks used
  within the organization that are not in the Center’s repository (e.g., Jira Software
  Security, ISO 27001) to ATT&CK techniques used in a security event. The mappings
  allow IR professionals to link specific adversary activities to customized solutions
  for protection, detection, and response at a technical level, and include that as
  actionable information in incident reports.
