ifneq (,$(wildcard .env))
include .env
export
endif

PKG_NAME := $(shell npm pkg get name | tr -d '"')
PKG_VERSION := $(shell npm pkg get version | tr -d '"')
RN_VERSION := $(shell npm pkg get dependencies.react-native | tr -d '"')

serve:
	pnpm start:dev

bump:
	pnpm run bump

doc-repomix:
	@mkdir -p temp
	@npx repomix@latest --style markdown -o temp/repomix-$(PKG_NAME)-$(PKG_VERSION).md
# smaller + more “structural” (less raw noise)
# npx repomix@latest --compress --parsable-style

git-push:
	@npm run bump
	@git add .
	@git commit -m "$(m)"
	@git push origin $(shell git rev-parse --abbrev-ref HEAD)

git-file:
	@git checkout -- $(m)

git-set:
	git remote set-url origin git@github.com-kiaspora:kiaspora/kia-mobile-app.git;ssh-add ~/.ssh/id_ed25519_kiaspora
