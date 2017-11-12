#!/usr/bin/env bash

# This script deploys the Typedoc documentation to the `gh-pages` branch and publishes the current build to
# npm with the `next` tag.
# The deployment only occurs after a merge on the `master` branch.
# The deployment requires an npm token (environment variable `NPM_TOKEN`) and an encrypted SSH key for the Github
# repo. Here is an example of generation of SSH key:
#
# ```bash
# EMAIL="demurgos@demurgos.net"
# OUTPUT_KEYFILE="deploy_key"
# ssh-keygen -t rsa -C "$EMAIL" -N "" -f "$OUTPUT_KEYFILE"
# travis encrypt-file "$OUTPUT_KEYFILE"
# rm "$OUTPUT_KEYFILE"
# ```
# Upload the public key to the repository's setting, then remove the public key and commit the encrypted private key.
# Make sure that the clear private key ($OUTPUT_KEYFILE) is not in the history (it should be removed after the
# encryption).

# Exit with nonzero exit code if anything fails
set -e

###############################################################################
# Configuration                                                               #
###############################################################################

# Space out deploys by at least this interval, 1day == 86400sec
DEPLOY_INTERVAL=86400
# Deploy only on merge commit to this branch
DEPLOYMENT_BRANCH="master"
# Id in the name of the key and iv files
TRAVIS_ENCRYPTION_ID="fa98f77d113d"
# Build id used for the publication of pre-release builds to `npm`
BUILD_ID=${TRAVIS_BUILD_NUMBER}
# Branch name or tag name
GIT_HEAD_BRANCH=${TRAVIS_BRANCH}
# If this is build for a tag, name of the tag (empty string otherwise)
GIT_HEAD_TAG=${TRAVIS_TAG}
# Possible values: "branch", "tag", "pr"
CI_BUILD_TYPE=`[[ ${TRAVIS_PULL_REQUEST} == "true" ]] && echo "pr" || [ -n "${TRAVIS_TAG}" ] && echo "tag" || echo "branch"`

###############################################################################
# Get information about the current build                                     #
###############################################################################

# If the current build is a tag build, check if the corresponding tag is on the deployment branch
IS_GIT_HEAD_TAG_ON_DEPLOYMENT_BRANCH="false"
if [[ "${CI_BUILD_TYPE}" == "tag" ]]; then
  # Revert `--single-branch` (caused by `--depth`)
  git config remote.origin.fetch refs/heads/*:refs/remotes/origin/*
  # Fetch all (TODO: Only fetch the last commits of the deployment branch)
  git fetch --quiet --unshallow --tags
  # List the tags on the deployment branch (ignore errors), use grep to perform an exact match and test if the match returns the tag
  IS_GIT_HEAD_TAG_ON_DEPLOYMENT_BRANCH=`! (git tag --merged "origin/${DEPLOYMENT_BRANCH}" 2> /dev/null || true) | grep --quiet --fixed-strings --line-regexp "${GIT_HEAD_TAG}" && echo "false" || echo "true"`
fi
# Time of the latest commit in seconds since UNIX epoch
GIT_HEAD_TIME=`git log -1 --pretty=format:%ct`
# Package name on npm
NPM_LOCAL_NAME=`jq --raw-output .name < package.json`
# ISO date or empty string: time of last modification of the pre-release build on npm
NPM_NEXT_DATE=`npm view "${NPM_LOCAL_NAME}@next" time.modified 2> /dev/null || echo ""`
# Parse the ISO date to a timestamp if we got a non-empty result (default is 0 - UNIX epoch)
NPM_NEXT_TIME=`[ -z "${NPM_NEXT_DATE}" ] && echo "0" || date -d ${NPM_NEXT_DATE} "+%s"`
# Hash of the git head for the pre-release build on npm
NPM_NEXT_GIT_HEAD=`npm view "${NPM_LOCAL_NAME}@next" gitHead 2> /dev/null || echo ""`
# Version of the latest release
NPM_LATEST_VERSION=`npm view "${NPM_LOCAL_NAME}@latest" version 2> /dev/null || echo ""`
# Local version of the package
NPM_LOCAL_VERSION=`jq --raw-output .version < package.json`

echo "ci: build id: $BUILD_ID"
echo "ci: build type: $CI_BUILD_TYPE"
echo "git: branch: $GIT_HEAD_BRANCH"
echo "git: tag: $GIT_HEAD_TAG"
echo "git: is tag on deployment branch ($DEPLOYMENT_BRANCH): $IS_GIT_HEAD_TAG_ON_DEPLOYMENT_BRANCH"
echo "npm: @next modification date: $NPM_NEXT_DATE"
echo "npm: @latest version: $NPM_LATEST_VERSION"
echo "npm: local version: $NPM_LOCAL_VERSION"
echo ""

###############################################################################
# Check if we should deploy                                                   #
###############################################################################


case ${CI_BUILD_TYPE} in
  "pr")
    echo "Skipping deployment: This is only a Pull Request."
    exit 0
    ;;
  "tag")
    # Only commits to the source branch should deploy
    if [ "$IS_GIT_HEAD_TAG_ON_DEPLOYMENT_BRANCH" != "true" ]; then
      echo "Skipping deployment: Current tag $GIT_HEAD_TAG is not on the deployment branch $DEPLOYMENT_BRANCH."
      exit 0
    fi
    # Release if there is a git tag matching the version in `package.json` (pre-release by default).
    if [[ ${GIT_HEAD_TAG} != "v$NPM_LOCAL_VERSION" ]]; then
      echo "Skipping deployment: Tag ${GIT_HEAD_TAG} is not v$NPM_LOCAL_VERSION."
      exit 0
    fi
    ;;
  "branch")
    # Only commits to the source branch should deploy
    if [ "$GIT_HEAD_BRANCH" != "$DEPLOYMENT_BRANCH" ]; then
        echo "Skipping deployment: Not on the deployment branch $DEPLOYMENT_BRANCH."
        exit 0
    fi
    if (( ${GIT_HEAD_TIME} - ${NPM_NEXT_TIME} < ${DEPLOY_INTERVAL})); then
      # The last version was published long enough before the current commit
      echo "Skipping deployment: Latest deployment occurred less than $DEPLOY_INTERVAL seconds ago."
      exit 0
    fi
    ;;
esac

###############################################################################
# Deployment info                                                             #
###############################################################################

echo "+------------------------------------------------------------+"
if [[ ${CI_BUILD_TYPE} == "tag" ]]; then
  echo "| Deploying release to npm and documentation to gh-pages     |"
else
  echo "| Deploying pre-release to npm and documentation to gh-pages |"
fi
echo "+------------------------------------------------------------+"
echo ""

###############################################################################
# npm deployment                                                              #
###############################################################################

echo "Deploying to npm..."
if [[ ${CI_BUILD_TYPE} == "tag" ]]; then
  gulp lib:dist:publish
else
  gulp lib:dist:publish --dev-dist ${BUILD_ID}
fi

echo "Successfully deployed to npm"

###############################################################################
# gh-pages deployment                                                         #
###############################################################################

echo "Deploying to gh-pages..."

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
TRAVIS_ENCRYPTED_KEY_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_key"
TRAVIS_ENCRYPTED_IV_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_iv"
openssl aes-256-cbc -K "${!TRAVIS_ENCRYPTED_KEY_VAR}" -iv "${!TRAVIS_ENCRYPTED_IV_VAR}" -in deploy_key.enc -out deploy_key -d
# Start SSH
eval `ssh-agent -s`
# Reduce the permissions of the deploy key, or it will be rejected by ssh-add
chmod 600 deploy_key
# Add the key
ssh-add deploy_key

gulp lib:typedoc:deploy

echo "Successfully deployed to gh-pages"
