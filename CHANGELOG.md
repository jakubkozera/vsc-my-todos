# Change Log

All notable changes to the "my-todos" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Changed

- Unified refresh functionality - single "Refresh All TODOs" button now refreshes both workspace/global todos and scans for code todos
- Removed separate "Refresh Code TODOs" button for cleaner UI
- Clarified exclusion patterns documentation - currently supports folder exclusions only

### Added

- Custom exclusion patterns setting for TODO scanning
- Support for comma-separated exclusion patterns in VS Code settings

### Fixed

- Corrected exclusion patterns documentation to reflect folder-only support
- Removed misleading file pattern examples (`*.js`, `*.min.js`) from settings description

## [1.3.2]

- Initial release