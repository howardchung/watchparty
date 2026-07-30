#!/bin/bash

# Copyright 2018 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -euo pipefail
IFS=$'\n\t'

echo "Running update.sh"

# Variables
PROTOS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORK_DIR=`mktemp -d`
cd ${PROTOS_DIR}

# deletes the temp directory on exit
function cleanup {
  rm -rf "$WORK_DIR"
  echo "Deleted temp working directory $WORK_DIR"
}

# register the cleanup function to be called on the EXIT signal
trap cleanup EXIT

# Capture location of pbjs / pbts before we pushd.
PBJS="$(npm bin)/pbjs"
PBTS="$(npm bin)/pbts"

# Enter work dir
pushd "$WORK_DIR"

# Clone necessary git repos.
git clone --depth 1 https://github.com/googleapis/googleapis.git
git clone --depth 1 https://github.com/google/protobuf.git

# Copy necessary protos.
mkdir -p "${PROTOS_DIR}/google/api"
cp googleapis/google/api/{annotations,client,field_behavior,http,launch_stage,resource}.proto \
   "${PROTOS_DIR}/google/api/"

mkdir -p "${PROTOS_DIR}/google/firestore/v1"
cp googleapis/google/firestore/v1/*.proto \
   "${PROTOS_DIR}/google/firestore/v1/"

mkdir -p "${PROTOS_DIR}/google/firestore/v1beta1"
cp googleapis/google/firestore/v1beta1/*.proto \
   "${PROTOS_DIR}/google/firestore/v1beta1/"

mkdir -p "${PROTOS_DIR}/google/firestore/admin/v1"
cp googleapis/google/firestore/admin/v1/*.proto \
   "${PROTOS_DIR}/google/firestore/admin/v1/"

mkdir -p "${PROTOS_DIR}/google/longrunning"
cp googleapis/google/longrunning/operations.proto \
   "${PROTOS_DIR}/google/longrunning/"

mkdir -p "${PROTOS_DIR}/google/rpc"
cp googleapis/google/rpc/status.proto \
   "${PROTOS_DIR}/google/rpc/"

mkdir -p "${PROTOS_DIR}/google/type"
cp googleapis/google/type/latlng.proto \
   "${PROTOS_DIR}/google/type/"

mkdir -p "${PROTOS_DIR}/google/protobuf"
cp protobuf/src/google/protobuf/{any,descriptor,empty,field_mask,struct,timestamp,wrappers}.proto \
   "${PROTOS_DIR}/google/protobuf/"

popd

# Generate the Protobuf typings
PBJS_ARGS=( --proto_path=. \
  --js_out=import_style=commonjs,binary:library \
  --target=static-module \
  --no-create \
  --no-encode \
  --no-decode \
  --no-verify \
  --no-delimited \
  --force-enum-string)

"${PBJS}" "${PBJS_ARGS[@]}" -o firestore_v1_proto_api.js \
  -r firestore_v1 \
  "${PROTOS_DIR}/google/firestore/v1/*.proto" \
  "${PROTOS_DIR}/firestore/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto" \
  "${PROTOS_DIR}/google/longrunning/*.proto"
perl -pi -e 's/number\|Long/number\|string/g' firestore_v1_proto_api.js
"${PBTS}" -o firestore_v1_proto_api.d.ts firestore_v1_proto_api.js

"${PBJS}" "${PBJS_ARGS[@]}" -o firestore_admin_v1_proto_api.js \
  -r firestore_admin_v1 \
  "${PROTOS_DIR}/google/firestore/admin/v1/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto" \
  "${PROTOS_DIR}/google/longrunning/*.proto"
perl -pi -e 's/number\|Long/number\|string/g' firestore_admin_v1_proto_api.js
"${PBTS}" -o firestore_admin_v1_proto_api.d.ts firestore_admin_v1_proto_api.js

"${PBJS}" "${PBJS_ARGS[@]}" -o firestore_v1beta1_proto_api.js \
  -r firestore_v1beta1 \
  "${PROTOS_DIR}/google/firestore/v1beta1/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto" \
  "${PROTOS_DIR}/google/longrunning/*.proto"
perl -pi -e 's/number\|Long/number\|string/g' firestore_v1beta1_proto_api.js
"${PBTS}" -o firestore_v1beta1_proto_api.d.ts firestore_v1beta1_proto_api.js

"${PBJS}" --proto_path=. --target=json -o v1.json \
  -r firestore_v1 \
  "${PROTOS_DIR}/google/firestore/v1/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto"

"${PBJS}" --proto_path=. --target=json -o admin_v1.json \
  -r firestore_admin_v1 \
  "${PROTOS_DIR}/google/firestore/admin/v1/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto" \
  "${PROTOS_DIR}/google/longrunning/*.proto"

"${PBJS}" --proto_path=. --target=json -o v1beta1.json \
  -r firestore_v1beta1 \
  "${PROTOS_DIR}/google/firestore/v1beta1/*.proto" \
  "${PROTOS_DIR}/google/protobuf/*.proto" "${PROTOS_DIR}/google/type/*.proto" \
  "${PROTOS_DIR}/google/rpc/*.proto" "${PROTOS_DIR}/google/api/*.proto"

node  ../../scripts/license.js *.d.ts *.js ../../build/src/v1beta1/*.d.ts ../../build/src/v1/*.d.ts
