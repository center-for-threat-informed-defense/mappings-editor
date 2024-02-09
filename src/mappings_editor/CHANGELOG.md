# Changelog

## [0.1.1](https://github.com/center-for-threat-informed-defense/mappings-editor/compare/mappings_editor-v0.1.0...mappings_editor-v0.1.1) (2024-02-09)


### Features

* add "clear search" button ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* add "collapse/uncollapse all mapping objects" menu items ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* add auto-migrate capabilities to framework objects ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* add basic runtime error notifications ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))


### Bug Fixes

* correct "Change Log" link ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* deserialize empty strings to `null` on select mapping object fields ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* deserialize mapping object `references` to a list of links (not characters) ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* eliminate scroll glitch that occurs when moving uncollapsed mapping objects ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* eliminate scroll glitch that occurs when undeleting end-of-file mapping objects ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* remove "Layout" menu ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* remove deprecated mapping statuses ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))


### Performance Improvements

* improve file indexing speed ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* improve import file speed ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* improve mass cut, copy, and paste speed ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))
* improve mass delete speed ([8f41917](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8f41917597dae67c714c63f67cf014e99d168f4e))

## [0.1.0](https://github.com/center-for-threat-informed-defense/mappings-editor/compare/mappings_editor-v0.0.1...mappings_editor-v0.1.0) (2024-02-07)


### ⚠ BREAKING CHANGES

* rename `group` to `capability_group` in export schema
* rename `groups` to `capability_groups` in export schema

### Features

* add import file feature ([6e01175](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/6e01175d4fea32d501c262ae7936f83b002f36ba))
* add Mapping File search functionality ([ea8f2e8](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/ea8f2e8b960d323cd84526ba90de952573b9377f))
* display file metrics in application footer ([c786fc5](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/c786fc5e9b6ab8ab6939b76350711ec43bf89bf6))
* only export `related_score` when a sub-technique has an assigned score ([b5ff4ac](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/b5ff4ac72fde65c4b64818e333cf42b7e9f335b7))


### Bug Fixes

* null dereference that crashes file view ([9fdacf6](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/9fdacf6d6437c3808ada3d2f490d76bebcf528db))
* prefix single-digit days and months with `0` in accordance with the schema ([b5ff4ac](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/b5ff4ac72fde65c4b64818e333cf42b7e9f335b7))
* switch date export from ISO format to `MM/DD/YYYY` ([001db5d](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/001db5dc7c0ed5761ff1cf9e774d4af3b9dd6f09))


### Code Refactoring

* rename `group` to `capability_group` in export schema ([b5ff4ac](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/b5ff4ac72fde65c4b64818e333cf42b7e9f335b7))
* rename `groups` to `capability_groups` in export schema ([b5ff4ac](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/b5ff4ac72fde65c4b64818e333cf42b7e9f335b7))

## [0.0.1](https://github.com/center-for-threat-informed-defense/mappings-editor/compare/mappings_editor-v0.0.0...mappings_editor-v0.0.1) (2024-01-30)


### Features

* add cut, copy, and paste features to mapping objects ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* add drag and drop features to mapping objects ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* add mapping group, status, score, comments, and references fields ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* add multi-select, paint-select, select all, and unselect all ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* add product version number to Help menu ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* autosave file on edit ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* sort filter options by name ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* update serializer to conform to new schema ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))


### Bug Fixes

* ensure dropdown options always reside at the highest layer ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))
* include ATT&CK 8.0 and 9.0 in framework manifest ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))


### Performance Improvements

* improve scroll and render performance ([2fdaa5c](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/2fdaa5cc536bd0eca48a69cac0a4bceb5e1325ef))

## 0.0.0 (2023-12-18)


### Features

* implement first-pass of core libraries ([0d36cc5](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/0d36cc5bb5a1ad6b1099dc6c75bcaea08c395719))
* implement Initial Interface ([8dc3533](https://github.com/center-for-threat-informed-defense/mappings-editor/commit/8dc3533a35601d439eadfef4cb0e54b4d6a717c5))
