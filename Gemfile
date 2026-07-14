# Pins fastlane for reproducible CI runs. Bundler resolves this Gemfile for
# both android/ and ios/ (it searches upward from the working directory).
#
# Locally, fastlane runs from an rbenv Ruby as a plain gem — see
# docs/fastlane.md. In CI, run a modern Ruby and `bundle exec fastlane`; pin
# bundler 2.x (bundler 4.x hung on resolution in testing).
source "https://rubygems.org"

gem "fastlane", "~> 2.226"
