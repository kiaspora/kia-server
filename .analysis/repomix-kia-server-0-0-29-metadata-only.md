This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docs/
  parse.md
  sop-setup.md
  taste-engine.md
  tmpl-api-pattern.md
postman/
  Railway_aSunder.postman_collection.json
  Railway_JustUs.postman_collection.json
  Railway_Kiaspora.postman_collection.json
  Railway_Parse.postman_collection.json
  Railway_Server.postman_collection.json
public/
  calendarItems.json
  trailer_ids.json
  trailers_list.json
src/
  asunder/
    asunder.module.ts
    attachment.util.ts
    llmBridge.controller.spec.ts
    llmBridge.controller.ts
    llmBridge.service.spec.ts
    llmBridge.service.ts
  auth/
    bearer-token.guard.ts
  common/
    trace-id.interceptor.ts
    trace-id.middleware.ts
  generate-review/
    dto/
      generate-review.dto.spec.ts
      generate-review.dto.ts
    generate-review.controller.ts
    generate-review.module.ts
    generate-review.service.spec.ts
    generate-review.service.ts
  justus/
    filmTrailer.controller.ts
    filmTrailer.service.ts
    justus.module.ts
    llmRouter.controller.ts
    llmRouter.service.ts
    titleDetail.controller.ts
    titleSearch.controller.ts
    trailers.controller.ts
  kiaspora/
    ffmpeg.ts
    googleSpeechToText.ts
    imageScan.controller.ts
    imageScan.module.ts
    imageScan.service.ts
    kiaspora.module.ts
    promptConfig.controller.ts
    promptConfig.module.ts
    promptConfig.service.ts
    speechToText.controller.ts
    speechToText.module.ts
    speechToText.service.ts
    translationChat.controller.ts
    translationChat.module.ts
    translationChat.service.ts
    translationRouter.controller.ts
    translationRouter.service.ts
  meta/
    meta.controller.spec.ts
    meta.controller.ts
  parse/
    imdb-detail.controller.ts
    imdb-search.controller.ts
    parse.controller.ts
  app.controller.spec.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
test/
  app.e2e-spec.ts
  jest-e2e.json
.gitignore
.prettierrc
AGENTS.md
app.module.ts
eslint.config.mjs
Makefile
nest-cli.json
package.json
README.md
tsconfig.build.json
tsconfig.json
```
