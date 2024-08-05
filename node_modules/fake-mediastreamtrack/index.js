const { EventTarget, defineEventAttribute } = require('event-target-shim');
const uuidv4 = require('uuid').v4;

class FakeMediaStreamTrack extends EventTarget
{
	constructor(
		{
			kind,
			id,
			label,
			isolated,
			muted,
			readyState,
			constraints,
			data
		} = {}
	)
	{
		super();

		if (!kind)
		{
			throw new TypeError('missing kind');
		}

		// Id.
		// @type {string}
		this._id = id || uuidv4();
		// Kind ('audio' or 'video').
		// @type {string}
		this._kind = kind;
		// Label.
		// @type {string}
		this._label = label || '';
		// Isolated.
		// @type {boolean}
		this._isolated = isolated || false;
		// Enabled flag.
		// @type {boolean}
		this._enabled = true;
		// Muted flag.
		// @type {boolean}
		this._muted = muted || false;
		// Ready state ('live' or 'ended').
		// @type {string}
		this._readyState = readyState || 'live';
		// MediaTrackConstraints.
		// @type {MediaTrackConstraints}
		this._constraints = constraints || {};
		// Custom data.
		// @type {any}
		this._data = data || {};
	}

	get id()
	{
		return this._id;
	}

	get kind()
	{
		return this._kind;
	}

	get label()
	{
		return this._label;
	}

	get isolated()
	{
		return this._isolated;
	}

	get enabled()
	{
		return this._enabled;
	}

	set enabled(enabled)
	{
		const changed = this._enabled !== enabled;

		this._enabled = enabled;

		if (changed)
		{
			this.dispatchEvent({ type: '@enabledchange' });
		}
	}

	get muted()
	{
		return this._muted;
	}

	get readyState()
	{
		return this._readyState;
	}

	get data()
	{
		return this._data;
	}

	set data(data)
	{
		throw new TypeError('cannot replace data object');
	}

	clone({ id, data } = {})
	{
		return new FakeMediaStreamTrack(
			{
				id          : id || uuidv4(),
				kind        : this._kind,
				label       : this._label,
				isolated    : this._isolated,
				enabled     : this._enabled,
				muted       : this._muted,
				readyState  : this._readyState,
				constraints : this._constraints,
				data        : data !== undefined ? data : this._data
			});
	}

	stop()
	{
		if (this._readyState === 'ended')
		{
			return;
		}

		this._readyState = 'ended';

		this.dispatchEvent({ type: '@stop' });
	}

	getConstraints()
	{
		return this._constraints;
	}

	applyConstraints(constraints)
	{
		if (this._readyState === 'ended')
		{
			return;
		}

		this._constraints = constraints;
	}

	remoteStop()
	{
		if (this._readyState === 'ended')
		{
			return;
		}

		this._readyState = 'ended';

		this.dispatchEvent({ type: '@stop' });
		this.dispatchEvent({ type: 'ended' });
	}

	remoteMute()
	{
		if (this._muted)
		{
			return;
		}

		this._muted = true;

		this.dispatchEvent({ type: 'mute' });
	}

	remoteUnmute()
	{
		if (!this._muted)
		{
			return;
		}

		this._muted = false;

		this.dispatchEvent({ type: 'unmute' });
	}
}

// Define EventTarget properties.
defineEventAttribute(FakeMediaStreamTrack.prototype, 'ended');
defineEventAttribute(FakeMediaStreamTrack.prototype, 'mute');
defineEventAttribute(FakeMediaStreamTrack.prototype, 'unmute');
defineEventAttribute(FakeMediaStreamTrack.prototype, '@enabledchange');
defineEventAttribute(FakeMediaStreamTrack.prototype, '@stop');
// NOTE: These are not implemented/dispatched.
defineEventAttribute(FakeMediaStreamTrack.prototype, 'isolationchange');
defineEventAttribute(FakeMediaStreamTrack.prototype, 'overconstrained');

exports.FakeMediaStreamTrack = FakeMediaStreamTrack;
