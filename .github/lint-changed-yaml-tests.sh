#! /usr/bin/env bash

if ! files=$(find openfisca_yuisekin|grep yaml)
then
  echo "Linting the following YAML files:"
  echo $files
  yamllint $files
else echo "No YAML files to lint"
fi
