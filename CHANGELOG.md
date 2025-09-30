# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this
project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.10] - 2025-09-30
### Added
- Alias `children` to `html`.
- Allow to pass an existing Node or Fragment as the first argument.

### Fixed
- Double escaping. For example `&lt;strong&gt;Hello world&lt;/strong&gt;` wasn't rendered correctly.

## [0.1.9] - 2025-05-15
### Added
- Support for SVG elements

## [0.1.8] - 2025-05-13
### Fixed
- Undefined attribute values.

## [0.1.7] - 2025-05-13
### Fixed
- Allow arrays as html property in `dom(el, html)`.

## [0.1.6] - 2025-05-05
### Added
- Allow string values for events (like `onclick="alert('clicked')"`).

### Fixed
- Error passing `null`, `undefined`, etc to `class` property.

## [0.1.5] - 2024-12-14
### Added
- Conditional for classes.

## [0.1.4] - 2024-12-10
### Changed
- Detect properties and attributes automatically.

### Fixed
- Reuse the DOMParser instance.

## [0.1.3] - 2024-12-10
### Fixed
- `undefined` as `value` property.

## [0.1.2] - 2024-12-10
### Fixed
- `value` attribute setter.

## [0.1.1] - 2024-12-09
### Fixed
- `value` attribute must be assigned as property.

## [0.1.0] - 2024-12-09
First version

[0.1.10]: https://github.com/oscarotero/dom/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/oscarotero/dom/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/oscarotero/dom/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/oscarotero/dom/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/oscarotero/dom/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/oscarotero/dom/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/oscarotero/dom/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/oscarotero/dom/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/oscarotero/dom/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/oscarotero/dom/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/oscarotero/dom/releases/tag/v0.1.0
