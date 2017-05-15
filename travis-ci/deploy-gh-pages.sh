#!/bin/bash
# bash is required (instead of a simple POSIX shell) for substitutions (and maybe indirect variable access)

# This script deploys the gh-pages directory to the `gh-pages` branch of the repo
# when a change is merged into `master`.
# It requires an encrypted SSH key for the repo.
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

echo "Starting documentation deployment"

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
# Directory to publish
GH_PAGES_DIRECTORY="dist/gh-pages/"
# Id in the name of the key and iv files
TRAVIS_ENCRYPTION_ID="fa5122df9563"

# Pull requests shouldn't try to deploy
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Skipping deploy, this is only Pull Request."
    exit 0
fi

# Commits to other branches shouldn't try to deploy
if [ "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy, not on the source branch ($SOURCE_BRANCH)."
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
HTTPS_REPO=${REPO/git@github.com:/https:\/\/github.com\/}
SHA=`git rev-parse --verify HEAD`

# Clean out existing gh-pages
rm -rf $GH_PAGES_DIRECTORY

# Clone repo, checkout gh-pages branch and clean it
git clone $HTTPS_REPO $GH_PAGES_DIRECTORY
cd $GH_PAGES_DIRECTORY
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deploy)
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
git rm -f '**'
# Return to previous directory (project root)
cd -

# Build gh-pages
npm run gh-pages

# Configure git
cd $GH_PAGES_DIRECTORY
git config user.name "Travis CI"
git config user.email "demurgos@demurgos.net"

# Ensure that the files are added
git add .

# If there are no changes (empty string for `git status --porcelain`) then just bail.
if [ -z "$(git status --porcelain)" ]; then
    echo "No changes to gh-pages, exiting."
    exit 0
fi

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git commit -m "Deploy to Github Pages: ${SHA}"

# Decrypt and add the deployment key
cd -
# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
TRAVIS_ENCRYPTED_KEY_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_key"
TRAVIS_ENCRYPTED_IV_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_iv"
openssl aes-256-cbc -K "${!TRAVIS_ENCRYPTED_KEY_VAR}" -iv "${!TRAVIS_ENCRYPTED_IV_VAR}" -in deploy_key.enc -out deploy_key -d
# Start SSH
eval `ssh-agent -s`
# Reduce the access of the deploy key, or it will be rejected by ssh-add
chmod 600 deploy_key
# Add the key
ssh-add deploy_key

# Finally, return to the gh-pages directory and push the commit
cd $GH_PAGES_DIRECTORY
git push $SSH_REPO $TARGET_BRANCH
