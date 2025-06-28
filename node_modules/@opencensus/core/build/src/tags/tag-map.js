"use strict";
/**
 * Copyright 2019, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 the "License";
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("./validation");
/** TagMap is maps of TagKey -> TagValue */
class TagMap {
    constructor() {
        // A map mapping TagKey to to its respective TagValue.
        this.registeredTags = new Map();
    }
    /** Adds the key/value pair regardless of whether the key is present. */
    set(tagKey, tagValue) {
        if (!validation_1.isValidTagKey(tagKey)) {
            throw new Error(`Invalid TagKey name: ${tagKey.name}`);
        }
        if (!validation_1.isValidTagValue(tagValue)) {
            throw new Error(`Invalid TagValue: ${tagValue.value}`);
        }
        this.registeredTags.set(tagKey, tagValue);
    }
    /** Deletes a tag from the map if the key is in the map. */
    delete(tagKey) {
        this.registeredTags.delete(tagKey);
    }
    /** Gets the tags map. */
    get tags() {
        return this.registeredTags;
    }
}
exports.TagMap = TagMap;
//# sourceMappingURL=tag-map.js.map