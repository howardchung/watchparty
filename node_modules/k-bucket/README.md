# k-bucket

_Stability: 2 - [Stable](https://github.com/tristanls/stability-index#stability-2---stable)_

[![NPM version](https://badge.fury.io/js/k-bucket.png)](http://npmjs.org/package/k-bucket)

Kademlia DHT K-bucket implementation as a binary tree.

## Contributors

[@tristanls](https://github.com/tristanls), [@mikedeboer](https://github.com/mikedeboer), [@deoxxa](https://github.com/deoxxa), [@feross](https://github.com/feross), [@nathanph](https://github.com/nathanph), [@allouis](https://github.com/allouis), [@fanatid](https://github.com/fanatid), [@robertkowalski](https://github.com/robertkowalski), [@nazar-pc](https://github.com/nazar-pc), [@jimmywarting](https://github.com/jimmywarting), [@achingbrain](https://github.com/achingbrain)

## Installation

    npm install k-bucket

## Tests

    npm test

## Usage

```javascript
const KBucket = require('k-bucket')

const kBucket1 = new KBucket({
    localNodeId: Buffer.from('my node id') // default: random data
})
// or without using Buffer (for example, in the browser)
const id = 'my node id'
const nodeId = new Uint8Array(id.length)
for (let i = 0, len = nodeId.length; i < len; ++i) {
  nodeId[i] = id.charCodeAt(i)
}
const kBucket2 = new KBucket({
  localNodeId: nodeId // default: random data
})
```

## Overview

A [*Distributed Hash Table (DHT)*](http://en.wikipedia.org/wiki/Distributed_hash_table) is a decentralized distributed system that provides a lookup table similar to a hash table.

*k-bucket* is an implementation of a storage mechanism for keys within a DHT. It stores `contact` objects which represent locations and addresses of nodes in the decentralized distributed system. `contact` objects are typically identified by a SHA-1 hash, however this restriction is lifted in this implementation. Additionally, node ids of different lengths can be compared.

This Kademlia DHT k-bucket implementation is meant to be as minimal as possible. It assumes that `contact` objects consist only of `id`. It is useful, and necessary, to attach other properties to a `contact`. For example, one may want to attach `ip` and `port` properties, which allow an application to send IP traffic to the `contact`. However, this information is extraneous and irrelevant to the operation of a k-bucket.

### arbiter function

This *k-bucket* implementation implements a conflict resolution mechanism using an `arbiter` function. The purpose of the `arbiter` is to choose between two `contact` objects with the same `id` but perhaps different properties and determine which one should be stored.  As the `arbiter` function returns the actual object to be stored, it does not need to make an either/or choice, but instead could perform some sort of operation and return the result as a new object that would then be stored. See [kBucket._update(node, index, contact)](#kbucket_updatenode-index-contact) for detailed semantics of which `contact` (`incumbent` or `candidate`) is selected.

For example, an `arbiter` function implementing a `vectorClock` mechanism would look something like:

```javascript
// contact example
var contact = {
    id: Buffer.from('contactId'),
    vectorClock: 0
};

function arbiter(incumbent, candidate) {
    if (incumbent.vectorClock > candidate.vectorClock) {
        return incumbent;
    }
    return candidate;
};
```

Alternatively, consider an arbiter that implements a Grow-Only-Set CRDT mechanism:

```javascript
// contact example
const contact = {
    id: Buffer.from('workerService'),
    workerNodes: {
        '17asdaf7effa2': { host: '127.0.0.1', port: 1337 },
        '17djsyqeryasu': { host: '127.0.0.1', port: 1338 }
    }
};

function arbiter(incumbent, candidate) {
    // we create a new object so that our selection is guaranteed to replace
    // the incumbent
    const merged = {
        id: incumbent.id, // incumbent.id === candidate.id within an arbiter
        workerNodes: incumbent.workerNodes
    }

    Object.keys(candidate.workerNodes).forEach(workerNodeId => {
        merged.workerNodes[workerNodeId] = candidate.workerNodes[workerNodeId];
    })

    return merged
}
```

Notice that in the above case, the Grow-Only-Set assumes that each worker node has a globally unique id.

## Documentation

### KBucket

Implementation of a Kademlia DHT k-bucket used for storing contact (peer node) information.

For a step by step example of k-bucket operation you may find the following slideshow useful: [Distribute All The Things](https://docs.google.com/presentation/d/11qGZlPWu6vEAhA7p3qsQaQtWH7KofEC9dMeBFZ1gYeA/edit#slide=id.g1718cc2bc_0661).

KBucket starts off as a single k-bucket with capacity of _k_. As contacts are added, once the _k+1_ contact is added, the k-bucket is split into two k-buckets. The split happens according to the first bit of the contact node id. The k-bucket that would contain the local node id is the "near" k-bucket, and the other one is the "far" k-bucket. The "far" k-bucket is marked as _don't split_ in order to prevent further splitting. The contact nodes that existed are then redistributed along the two new k-buckets and the old k-bucket becomes an inner node within a tree data structure.

As even more contacts are added to the "near" k-bucket, the "near" k-bucket will split again as it becomes full. However, this time it is split along the second bit of the contact node id. Again, the two newly created k-buckets are marked "near" and "far" and the "far" k-bucket is marked as _don't split_. Again, the contact nodes that existed in the old bucket are redistributed. This continues as long as nodes are being added to the "near" k-bucket, until the number of splits reaches the length of the local node id.

As more contacts are added to the "far" k-bucket and it reaches its capacity, it does not split. Instead, the k-bucket emits a "ping" event (register a listener: `kBucket.on('ping', function (oldContacts, newContact) {...});` and includes an array of old contact nodes that it hasn't heard from in a while and requires you to confirm that those contact nodes still respond (literally respond to a PING RPC). If an old contact node still responds, it should be re-added (`kBucket.add(oldContact)`) back to the k-bucket. This puts the old contact on the "recently heard from" end of the list of nodes in the k-bucket. If the old contact does not respond, it should be removed (`kBucket.remove(oldContact.id)`) and the new contact being added now has room to be stored (`kBucket.add(newContact)`).

**Public API**
  * [KBucket.arbiter(incumbent, candidate)](#kbucketarbiterincumbent-candidate)
  * [KBucket.distance(firstId, secondId)](#kbucketdistancefirstid-secondid)
  * [new KBucket(options)](#new-kbucketoptions)
  * [kBucket.add(contact)](#kbucketaddcontact)
  * [kBucket.closest(id [, n = Infinity])](#kbucketclosestid--n--infinity)
  * [kBucket.count()](#kbucketcount)
  * [kBucket.get(id)](#kbucketgetid)
  * [kBucket.metadata](#kbucketmetadata)
  * [kBucket.remove(id)](#kbucketremoveid)
  * [kBucket.toArray()](#kbuckettoarray)
  * [kBucket.toIterable()](#kbuckettoiterable)
  * [Event 'added'](#event-added)
  * [Event 'ping'](#event-ping)
  * [Event 'removed'](#event-removed)
  * [Event 'updated'](#event-updated)

#### KBucket.arbiter(incumbent, candidate)

  * `incumbent`: _Object_ Contact currently stored in the k-bucket.
  * `candidate`: _Object_ Contact being added to the k-bucket.
  * Return: _Object_ Contact to updated the k-bucket with.

Default arbiter function for contacts with the same `id`. Uses `contact.vectorClock` to select which contact to update the k-bucket with. Contact with larger `vectorClock` field will be selected. If `vectorClock` is the same, `candidat` will be selected.

#### KBucket.distance(firstId, secondId)

  * `firstId`: _Uint8Array_ Uint8Array containing first id.
  * `secondId`: _Uint8Array_ Uint8Array containing second id.
  * Return: _Integer_ The XOR distance between `firstId` and `secondId`.

Default distance function. Finds the XOR distance between firstId and secondId.

#### new KBucket(options)

  * `options`:
    * `arbiter`: _Function_ _(Default: vectorClock arbiter)_
        `function (incumbent, candidate) { return contact; }` An optional `arbiter` function that given two `contact` objects with the same `id` returns the desired object to be used for updating the k-bucket. For more details, see [arbiter function](#arbiter-function).
    * `distance`: _Function_
        `function (firstId, secondId) { return distance }` An optional `distance` function that gets two `id` Uint8Arrays and return distance (as number) between them.
    * `localNodeId`: _Uint8Array_ An optional Uint8Array representing the local node id. If not provided, a local node id will be created via `crypto.randomBytes(20)`.
    * `metadata`: _Object_ _(Default: {})_ Optional satellite data to include with the k-bucket. `metadata` property is guaranteed not be altered, it is provided as an explicit container for users of k-bucket to store implementation-specific data.
    * `numberOfNodesPerKBucket`: _Integer_ _(Default: 20)_ The number of nodes that a k-bucket can contain before being full or split.
    * `numberOfNodesToPing`: _Integer_ _(Default: 3)_ The number of nodes to ping when a bucket that should not be split becomes full. KBucket will emit a `ping` event that contains `numberOfNodesToPing` nodes that have not been contacted the longest.

Creates a new KBucket.

#### kBucket.add(contact)

  * `contact`: _Object_ The contact object to add.
    * `id`: _Uint8Array_ Contact node id.
    * Any satellite data that is part of the `contact` object will not be altered, only `id` is used.
  * Return: _Object_ The k-bucket itself.

Adds a `contact` to the k-bucket.

#### kBucket.closest(id [, n = Infinity])

  * `id`: _Uint8Array_ Contact node id.
  * `n`: _Integer_ _(Default: Infinity)_ The maximum number of closest contacts to return.
  * Return: _Array_ Maximum of `n` closest contacts to the node id.

Get the `n` closest contacts to the provided node id. "Closest" here means: closest according to the XOR metric of the `contact` node id.

#### kBucket.count()

  * Return: _Number_ The number of contacts held in the tree

Counts the total number of contacts in the tree.

#### kBucket.get(id)

  * `id`: _Uint8Array_ The ID of the `contact` to fetch.
  * Return: _Object_ The `contact` if available, otherwise null

Retrieves the `contact`.

#### kBucket.metadata

  * `metadata`: _Object_ _(Default: {})_

The `metadata` property serves as a container that can be used by implementations using k-bucket. One example is storing a timestamp to indicate the last time when a node in the bucket was responding to a ping.

#### kBucket.remove(id)

  * `id`: _Uint8Array_ The ID of the `contact` to remove.
  * Return: _Object_ The k-bucket itself.

Removes `contact` with the provided `id`.

#### kBucket.toArray()

  * Return: _Array_ All of the contacts in the tree, as an array

Traverses the tree, putting all the contacts into one array.

#### kBucket.toIterable()

  * Return: _Iterable_ All of the contacts in the tree, as an iterable

Traverses the tree, yielding contacts as they are encountered.

#### kBucket._determineNode(node, id [, bitIndex = 0])

_**CAUTION: reserved for internal use**_

  * `node`: internal object that has 2 leafs: left and right
  * `id`: _Uint8Array_ Id to compare `localNodeId` with.
  * `bitIndex`: _Integer_ _(Default: 0)_  The bit index to which bit to check in the `id` Uint8Array.
  * Return: _Object_ left leaf if `id` at `bitIndex` is 0, right leaf otherwise.

#### kBucket._indexOf(id)

_**CAUTION: reserved for internal use**_

  * `node`: internal object that has 2 leafs: left and right
  * `id`: _Uint8Array_ Contact node id.
  * Return: _Integer_ Index of `contact` with provided `id` if it exists, -1 otherwise.

Returns the index of the `contact` with provided `id` if it exists, returns -1 otherwise.

#### kBucket._split(node [, bitIndex])

_**CAUTION: reserved for internal use**_

  * `node`: _Object_ node for splitting
  * `bitIndex`: _Integer_ _(Default: 0)_ The bit index to which bit to check in the `id` Uint8Array.

Splits the node, redistributes contacts to the new nodes, and marks the node that was split as an inner node of the binary tree of nodes by setting `self.contacts = null`. Also, marks the "far away" node as `dontSplit`.

#### kBucket._update(node, index, contact)

_**CAUTION: reserved for internal use**_

  * `node`: internal object that has 2 leafs: left and right
  * `index`: _Integer_ The index in the bucket where contact exists (index has already been computed in previous calculation).
  * `contact`: _Object_ The contact object to update.
    * `id`: _Uint8Array_ Contact node id
    * Any satellite data that is part of the `contact` object will not be altered, only `id` is used.

Updates the `contact` by using the `arbiter` function to compare the incumbent and the candidate. If `arbiter` function selects the old `contact` but the candidate is some new `contact`, then the new `contact` is abandoned. If `arbiter` function selects the old `contact` and the candidate is that same old `contact`, the `contact` is marked as most recently contacted (by being moved to the right/end of the bucket array). If `arbiter` function selects the new `contact`, the old `contact` is removed and the new `contact` is marked as most recently contacted.

#### Event: 'added'

  * `newContact`: _Object_ The new contact that was added.

Emitted only when `newContact` was added to bucket and it was not stored in the bucket before.

#### Event: 'ping'

  * `oldContacts`: _Array_ The array of contacts to ping.
  * `newContact`: _Object_ The new contact to be added if one of old contacts does not respond.

Emitted every time a contact is added that would exceed the capacity of a _don't split_ k-bucket it belongs to.

#### Event: 'removed'

  * `contact`: _Object_ The contact that was removed.

Emitted when `contact` was removed from the bucket.

#### Event: 'updated'

  * `oldContact`: _Object_ The contact that was stored prior to the update.
  * `newContact`: _Object_ The new contact that is now stored after the update.

Emitted when a previously existing ("previously existing" means `oldContact.id` equals `newContact.id`) contact was added to the bucket and it was replaced with `newContact`.

## Releases

[Current releases](https://github.com/tristanls/k-bucket/releases).

### Policy

We follow the semantic versioning policy ([semver.org](http://semver.org/)) with a caveat:

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
>MAJOR version when you make incompatible API changes,<br/>
>MINOR version when you add functionality in a backwards-compatible manner, and<br/>
>PATCH version when you make backwards-compatible bug fixes.

**caveat**: Major version zero is a special case indicating development version that may make incompatible API changes without incrementing MAJOR version.

## Sources

The implementation has been sourced from:

  - [A formal specification of the Kademlia distributed hash table](http://maude.sip.ucm.es/kademlia/files/pita_kademlia.pdf)
  - [Distributed Hash Tables (part 2)](https://web.archive.org/web/20140217064545/http://offthelip.org/?p=157)
