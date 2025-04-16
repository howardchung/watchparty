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
import { TagKey, TagValue } from './types';
/** TagMap is maps of TagKey -> TagValue */
export declare class TagMap {
    private readonly registeredTags;
    /** Adds the key/value pair regardless of whether the key is present. */
    set(tagKey: TagKey, tagValue: TagValue): void;
    /** Deletes a tag from the map if the key is in the map. */
    delete(tagKey: TagKey): void;
    /** Gets the tags map. */
    readonly tags: Map<TagKey, TagValue>;
}
