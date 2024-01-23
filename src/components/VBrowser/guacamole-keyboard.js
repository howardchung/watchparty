/* eslint-disable */

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var Guacamole = Guacamole || {};

/**
 * Provides cross-browser and cross-keyboard keyboard for a specific element.
 * Browser and keyboard layout variation is abstracted away, providing events
 * which represent keys as their corresponding X11 keysym.
 *
 * @constructor
 * @param {Element|Document} [element]
 *    The Element to use to provide keyboard events. If omitted, at least one
 *    Element must be manually provided through the listenTo() function for
 *    the Guacamole.Keyboard instance to have any effect.
 */
Guacamole.Keyboard = function Keyboard(element) {
  /**
   * Reference to this Guacamole.Keyboard.
   *
   * @private
   * @type {!Guacamole.Keyboard}
   */
  var guac_keyboard = this;

  /**
   * An integer value which uniquely identifies this Guacamole.Keyboard
   * instance with respect to other Guacamole.Keyboard instances.
   *
   * @private
   * @type {!number}
   */
  var guacKeyboardID = Guacamole.Keyboard._nextID++;

  /**
   * The name of the property which is added to event objects via markEvent()
   * to note that they have already been handled by this Guacamole.Keyboard.
   *
   * @private
   * @constant
   * @type {!string}
   */
  var EVENT_MARKER = '_GUAC_KEYBOARD_HANDLED_BY_' + guacKeyboardID;

  /**
   * Fired whenever the user presses a key with the element associated
   * with this Guacamole.Keyboard in focus.
   *
   * @event
   * @param {!number} keysym
   *     The keysym of the key being pressed.
   *
   * @return {!boolean}
   *     true if the key event should be allowed through to the browser,
   *     false otherwise.
   */
  this.onkeydown = null;

  /**
   * Fired whenever the user releases a key with the element associated
   * with this Guacamole.Keyboard in focus.
   *
   * @event
   * @param {!number} keysym
   *     The keysym of the key being released.
   */
  this.onkeyup = null;

  /**
   * Set of known platform-specific or browser-specific quirks which must be
   * accounted for to properly interpret key events, even if the only way to
   * reliably detect that quirk is to platform/browser-sniff.
   *
   * @private
   * @type {!Object.<string, boolean>}
   */
  var quirks = {
    /**
     * Whether keyup events are universally unreliable.
     *
     * @type {!boolean}
     */
    keyupUnreliable: false,

    /**
     * Whether the Alt key is actually a modifier for typable keys and is
     * thus never used for keyboard shortcuts.
     *
     * @type {!boolean}
     */
    altIsTypableOnly: false,

    /**
     * Whether we can rely on receiving a keyup event for the Caps Lock
     * key.
     *
     * @type {!boolean}
     */
    capsLockKeyupUnreliable: false,
  };

  // Set quirk flags depending on platform/browser, if such information is
  // available
  if (navigator && navigator.platform) {
    // All keyup events are unreliable on iOS (sadly)
    if (navigator.platform.match(/ipad|iphone|ipod/i))
      quirks.keyupUnreliable = true;
    // The Alt key on Mac is never used for keyboard shortcuts, and the
    // Caps Lock key never dispatches keyup events
    else if (navigator.platform.match(/^mac/i)) {
      quirks.altIsTypableOnly = true;
      quirks.capsLockKeyupUnreliable = true;
    }
  }

  /**
   * A key event having a corresponding timestamp. This event is non-specific.
   * Its subclasses should be used instead when recording specific key
   * events.
   *
   * @private
   * @constructor
   * @param {KeyboardEvent} [orig]
   *     The relevant DOM keyboard event.
   */
  var KeyEvent = function KeyEvent(orig) {
    /**
     * Reference to this key event.
     *
     * @private
     * @type {!KeyEvent}
     */
    var key_event = this;

    /**
     * The JavaScript key code of the key pressed. For most events (keydown
     * and keyup), this is a scancode-like value related to the position of
     * the key on the US English "Qwerty" keyboard. For keypress events,
     * this is the Unicode codepoint of the character that would be typed
     * by the key pressed.
     *
     * @type {!number}
     */
    this.keyCode = orig ? orig.which || orig.keyCode : 0;

    /**
     * The legacy DOM3 "keyIdentifier" of the key pressed, as defined at:
     * http://www.w3.org/TR/2009/WD-DOM-Level-3-Events-20090908/#events-Events-KeyboardEvent
     *
     * @type {!string}
     */
    this.keyIdentifier = orig && orig.keyIdentifier;

    /**
     * The standard name of the key pressed, as defined at:
     * http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
     *
     * @type {!string}
     */
    this.key = orig && orig.key;

    /**
     * The location on the keyboard corresponding to the key pressed, as
     * defined at:
     * http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
     *
     * @type {!number}
     */
    this.location = orig ? getEventLocation(orig) : 0;

    /**
     * The state of all local keyboard modifiers at the time this event was
     * received.
     *
     * @type {!Guacamole.Keyboard.ModifierState}
     */
    this.modifiers = orig
      ? Guacamole.Keyboard.ModifierState.fromKeyboardEvent(orig)
      : new Guacamole.Keyboard.ModifierState();

    /**
     * An arbitrary timestamp in milliseconds, indicating this event's
     * position in time relative to other events.
     *
     * @type {!number}
     */
    this.timestamp = new Date().getTime();

    /**
     * Whether the default action of this key event should be prevented.
     *
     * @type {!boolean}
     */
    this.defaultPrevented = false;

    /**
     * The keysym of the key associated with this key event, as determined
     * by a best-effort guess using available event properties and keyboard
     * state.
     *
     * @type {number}
     */
    this.keysym = null;

    /**
     * Whether the keysym value of this key event is known to be reliable.
     * If false, the keysym may still be valid, but it's only a best guess,
     * and future key events may be a better source of information.
     *
     * @type {!boolean}
     */
    this.reliable = false;

    /**
     * Returns the number of milliseconds elapsed since this event was
     * received.
     *
     * @return {!number}
     *     The number of milliseconds elapsed since this event was
     *     received.
     */
    this.getAge = function () {
      return new Date().getTime() - key_event.timestamp;
    };
  };

  /**
   * Information related to the pressing of a key, which need not be a key
   * associated with a printable character. The presence or absence of any
   * information within this object is browser-dependent.
   *
   * @private
   * @constructor
   * @augments Guacamole.Keyboard.KeyEvent
   * @param {!KeyboardEvent} orig
   *     The relevant DOM "keydown" event.
   */
  var KeydownEvent = function KeydownEvent(orig) {
    // We extend KeyEvent
    KeyEvent.call(this, orig);

    // If key is known from keyCode or DOM3 alone, use that
    this.keysym =
      keysym_from_key_identifier(this.key, this.location) ||
      keysym_from_keycode(this.keyCode, this.location);

    /**
     * Whether the keyup following this keydown event is known to be
     * reliable. If false, we cannot rely on the keyup event to occur.
     *
     * @type {!boolean}
     */
    this.keyupReliable = !quirks.keyupUnreliable;

    // DOM3 and keyCode are reliable sources if the corresponding key is
    // not a printable key
    if (this.keysym && !isPrintable(this.keysym)) this.reliable = true;

    // Use legacy keyIdentifier as a last resort, if it looks sane
    if (!this.keysym && key_identifier_sane(this.keyCode, this.keyIdentifier))
      this.keysym = keysym_from_key_identifier(
        this.keyIdentifier,
        this.location,
        this.modifiers.shift,
      );

    // If a key is pressed while meta is held down, the keyup will
    // never be sent in Chrome (bug #108404)
    if (this.modifiers.meta && this.keysym !== 0xffe7 && this.keysym !== 0xffe8)
      this.keyupReliable = false;
    // We cannot rely on receiving keyup for Caps Lock on certain platforms
    else if (this.keysym === 0xffe5 && quirks.capsLockKeyupUnreliable)
      this.keyupReliable = false;

    // Determine whether default action for Alt+combinations must be prevented
    var prevent_alt = !this.modifiers.ctrl && !quirks.altIsTypableOnly;

    // Determine whether default action for Ctrl+combinations must be prevented
    var prevent_ctrl = !this.modifiers.alt;

    // We must rely on the (potentially buggy) keyIdentifier if preventing
    // the default action is important
    if (
      (prevent_ctrl && this.modifiers.ctrl) ||
      (prevent_alt && this.modifiers.alt) ||
      this.modifiers.meta ||
      this.modifiers.hyper
    )
      this.reliable = true;

    // Record most recently known keysym by associated key code
    recentKeysym[this.keyCode] = this.keysym;
  };

  KeydownEvent.prototype = new KeyEvent();

  /**
   * Information related to the pressing of a key, which MUST be
   * associated with a printable character. The presence or absence of any
   * information within this object is browser-dependent.
   *
   * @private
   * @constructor
   * @augments Guacamole.Keyboard.KeyEvent
   * @param {!KeyboardEvent} orig
   *     The relevant DOM "keypress" event.
   */
  var KeypressEvent = function KeypressEvent(orig) {
    // We extend KeyEvent
    KeyEvent.call(this, orig);

    // Pull keysym from char code
    this.keysym = keysym_from_charcode(this.keyCode);

    // Keypress is always reliable
    this.reliable = true;
  };

  KeypressEvent.prototype = new KeyEvent();

  /**
   * Information related to the releasing of a key, which need not be a key
   * associated with a printable character. The presence or absence of any
   * information within this object is browser-dependent.
   *
   * @private
   * @constructor
   * @augments Guacamole.Keyboard.KeyEvent
   * @param {!KeyboardEvent} orig
   *     The relevant DOM "keyup" event.
   */
  var KeyupEvent = function KeyupEvent(orig) {
    // We extend KeyEvent
    KeyEvent.call(this, orig);

    // If key is known from keyCode or DOM3 alone, use that (keyCode is
    // still more reliable for keyup when dead keys are in use)
    this.keysym =
      keysym_from_keycode(this.keyCode, this.location) ||
      keysym_from_key_identifier(this.key, this.location);

    // Fall back to the most recently pressed keysym associated with the
    // keyCode if the inferred key doesn't seem to actually be pressed
    if (!guac_keyboard.pressed[this.keysym])
      this.keysym = recentKeysym[this.keyCode] || this.keysym;

    // Keyup is as reliable as it will ever be
    this.reliable = true;
  };

  KeyupEvent.prototype = new KeyEvent();

  /**
   * An array of recorded events, which can be instances of the private
   * KeydownEvent, KeypressEvent, and KeyupEvent classes.
   *
   * @private
   * @type {!KeyEvent[]}
   */
  var eventLog = [];

  /**
   * Map of known JavaScript keycodes which do not map to typable characters
   * to their X11 keysym equivalents.
   *
   * @private
   * @type {!Object.<number, number[]>}
   */
  var keycodeKeysyms = {
    8: [0xff08], // backspace
    9: [0xff09], // tab
    12: [0xff0b, 0xff0b, 0xff0b, 0xffb5], // clear       / KP 5
    13: [0xff0d], // enter
    16: [0xffe1, 0xffe1, 0xffe2], // shift
    17: [0xffe3, 0xffe3, 0xffe4], // ctrl
    18: [0xffe9, 0xffe9, 0xfe03], // alt
    19: [0xff13], // pause/break
    20: [0xffe5], // caps lock
    27: [0xff1b], // escape
    32: [0x0020], // space
    33: [0xff55, 0xff55, 0xff55, 0xffb9], // page up     / KP 9
    34: [0xff56, 0xff56, 0xff56, 0xffb3], // page down   / KP 3
    35: [0xff57, 0xff57, 0xff57, 0xffb1], // end         / KP 1
    36: [0xff50, 0xff50, 0xff50, 0xffb7], // home        / KP 7
    37: [0xff51, 0xff51, 0xff51, 0xffb4], // left arrow  / KP 4
    38: [0xff52, 0xff52, 0xff52, 0xffb8], // up arrow    / KP 8
    39: [0xff53, 0xff53, 0xff53, 0xffb6], // right arrow / KP 6
    40: [0xff54, 0xff54, 0xff54, 0xffb2], // down arrow  / KP 2
    45: [0xff63, 0xff63, 0xff63, 0xffb0], // insert      / KP 0
    46: [0xffff, 0xffff, 0xffff, 0xffae], // delete      / KP decimal
    91: [0xffe7], // left windows/command key (meta_l)
    92: [0xffe8], // right window/command key (meta_r)
    93: [0xff67], // menu key
    96: [0xffb0], // KP 0
    97: [0xffb1], // KP 1
    98: [0xffb2], // KP 2
    99: [0xffb3], // KP 3
    100: [0xffb4], // KP 4
    101: [0xffb5], // KP 5
    102: [0xffb6], // KP 6
    103: [0xffb7], // KP 7
    104: [0xffb8], // KP 8
    105: [0xffb9], // KP 9
    106: [0xffaa], // KP multiply
    107: [0xffab], // KP add
    109: [0xffad], // KP subtract
    110: [0xffae], // KP decimal
    111: [0xffaf], // KP divide
    112: [0xffbe], // f1
    113: [0xffbf], // f2
    114: [0xffc0], // f3
    115: [0xffc1], // f4
    116: [0xffc2], // f5
    117: [0xffc3], // f6
    118: [0xffc4], // f7
    119: [0xffc5], // f8
    120: [0xffc6], // f9
    121: [0xffc7], // f10
    122: [0xffc8], // f11
    123: [0xffc9], // f12
    144: [0xff7f], // num lock
    145: [0xff14], // scroll lock
    225: [0xfe03], // altgraph (iso_level3_shift)
  };

  /**
   * Map of known JavaScript keyidentifiers which do not map to typable
   * characters to their unshifted X11 keysym equivalents.
   *
   * @private
   * @type {!Object.<string, number[]>}
   */
  var keyidentifier_keysym = {
    Again: [0xff66],
    AllCandidates: [0xff3d],
    Alphanumeric: [0xff30],
    Alt: [0xffe9, 0xffe9, 0xfe03],
    Attn: [0xfd0e],
    AltGraph: [0xfe03],
    ArrowDown: [0xff54],
    ArrowLeft: [0xff51],
    ArrowRight: [0xff53],
    ArrowUp: [0xff52],
    Backspace: [0xff08],
    CapsLock: [0xffe5],
    Cancel: [0xff69],
    Clear: [0xff0b],
    Convert: [0xff21],
    Copy: [0xfd15],
    Crsel: [0xfd1c],
    CrSel: [0xfd1c],
    CodeInput: [0xff37],
    Compose: [0xff20],
    Control: [0xffe3, 0xffe3, 0xffe4],
    ContextMenu: [0xff67],
    Delete: [0xffff],
    Down: [0xff54],
    End: [0xff57],
    Enter: [0xff0d],
    EraseEof: [0xfd06],
    Escape: [0xff1b],
    Execute: [0xff62],
    Exsel: [0xfd1d],
    ExSel: [0xfd1d],
    F1: [0xffbe],
    F2: [0xffbf],
    F3: [0xffc0],
    F4: [0xffc1],
    F5: [0xffc2],
    F6: [0xffc3],
    F7: [0xffc4],
    F8: [0xffc5],
    F9: [0xffc6],
    F10: [0xffc7],
    F11: [0xffc8],
    F12: [0xffc9],
    F13: [0xffca],
    F14: [0xffcb],
    F15: [0xffcc],
    F16: [0xffcd],
    F17: [0xffce],
    F18: [0xffcf],
    F19: [0xffd0],
    F20: [0xffd1],
    F21: [0xffd2],
    F22: [0xffd3],
    F23: [0xffd4],
    F24: [0xffd5],
    Find: [0xff68],
    GroupFirst: [0xfe0c],
    GroupLast: [0xfe0e],
    GroupNext: [0xfe08],
    GroupPrevious: [0xfe0a],
    FullWidth: null,
    HalfWidth: null,
    HangulMode: [0xff31],
    Hankaku: [0xff29],
    HanjaMode: [0xff34],
    Help: [0xff6a],
    Hiragana: [0xff25],
    HiraganaKatakana: [0xff27],
    Home: [0xff50],
    Hyper: [0xffed, 0xffed, 0xffee],
    Insert: [0xff63],
    JapaneseHiragana: [0xff25],
    JapaneseKatakana: [0xff26],
    JapaneseRomaji: [0xff24],
    JunjaMode: [0xff38],
    KanaMode: [0xff2d],
    KanjiMode: [0xff21],
    Katakana: [0xff26],
    Left: [0xff51],
    Meta: [0xffe7, 0xffe7, 0xffe8],
    ModeChange: [0xff7e],
    NumLock: [0xff7f],
    PageDown: [0xff56],
    PageUp: [0xff55],
    Pause: [0xff13],
    Play: [0xfd16],
    PreviousCandidate: [0xff3e],
    PrintScreen: [0xff61],
    Redo: [0xff66],
    Right: [0xff53],
    RomanCharacters: null,
    Scroll: [0xff14],
    Select: [0xff60],
    Separator: [0xffac],
    Shift: [0xffe1, 0xffe1, 0xffe2],
    SingleCandidate: [0xff3c],
    Super: [0xffeb, 0xffeb, 0xffec],
    Tab: [0xff09],
    UIKeyInputDownArrow: [0xff54],
    UIKeyInputEscape: [0xff1b],
    UIKeyInputLeftArrow: [0xff51],
    UIKeyInputRightArrow: [0xff53],
    UIKeyInputUpArrow: [0xff52],
    Up: [0xff52],
    Undo: [0xff65],
    Win: [0xffe7, 0xffe7, 0xffe8],
    Zenkaku: [0xff28],
    ZenkakuHankaku: [0xff2a],
  };

  /**
   * All keysyms which should not repeat when held down.
   *
   * @private
   * @type {!Object.<number, boolean>}
   */
  var no_repeat = {
    0xfe03: true, // ISO Level 3 Shift (AltGr)
    0xffe1: true, // Left shift
    0xffe2: true, // Right shift
    0xffe3: true, // Left ctrl
    0xffe4: true, // Right ctrl
    0xffe5: true, // Caps Lock
    0xffe7: true, // Left meta
    0xffe8: true, // Right meta
    0xffe9: true, // Left alt
    0xffea: true, // Right alt
    0xffeb: true, // Left super/hyper
    0xffec: true, // Right super/hyper
  };

  /**
   * All modifiers and their states.
   *
   * @type {!Guacamole.Keyboard.ModifierState}
   */
  this.modifiers = new Guacamole.Keyboard.ModifierState();

  /**
   * The state of every key, indexed by keysym. If a particular key is
   * pressed, the value of pressed for that keysym will be true. If a key
   * is not currently pressed, it will not be defined.
   *
   * @type {!Object.<number, boolean>}
   */
  this.pressed = {};

  /**
   * The state of every key, indexed by keysym, for strictly those keys whose
   * status has been indirectly determined thorugh observation of other key
   * events. If a particular key is implicitly pressed, the value of
   * implicitlyPressed for that keysym will be true. If a key
   * is not currently implicitly pressed (the key is not pressed OR the state
   * of the key is explicitly known), it will not be defined.
   *
   * @private
   * @type {!Object.<number, boolean>}
   */
  var implicitlyPressed = {};

  /**
   * The last result of calling the onkeydown handler for each key, indexed
   * by keysym. This is used to prevent/allow default actions for key events,
   * even when the onkeydown handler cannot be called again because the key
   * is (theoretically) still pressed.
   *
   * @private
   * @type {!Object.<number, boolean>}
   */
  var last_keydown_result = {};

  /**
   * The keysym most recently associated with a given keycode when keydown
   * fired. This object maps keycodes to keysyms.
   *
   * @private
   * @type {!Object.<number, number>}
   */
  var recentKeysym = {};

  /**
   * Timeout before key repeat starts.
   *
   * @private
   * @type {number}
   */
  var key_repeat_timeout = null;

  /**
   * Interval which presses and releases the last key pressed while that
   * key is still being held down.
   *
   * @private
   * @type {number}
   */
  var key_repeat_interval = null;

  /**
   * Given an array of keysyms indexed by location, returns the keysym
   * for the given location, or the keysym for the standard location if
   * undefined.
   *
   * @private
   * @param {number[]} keysyms
   *     An array of keysyms, where the index of the keysym in the array is
   *     the location value.
   *
   * @param {!number} location
   *     The location on the keyboard corresponding to the key pressed, as
   *     defined at: http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
   */
  var get_keysym = function get_keysym(keysyms, location) {
    if (!keysyms) return null;

    return keysyms[location] || keysyms[0];
  };

  /**
   * Returns true if the given keysym corresponds to a printable character,
   * false otherwise.
   *
   * @param {!number} keysym
   *     The keysym to check.
   *
   * @returns {!boolean}
   *     true if the given keysym corresponds to a printable character,
   *     false otherwise.
   */
  var isPrintable = function isPrintable(keysym) {
    // Keysyms with Unicode equivalents are printable
    return (
      (keysym >= 0x00 && keysym <= 0xff) || (keysym & 0xffff0000) === 0x01000000
    );
  };

  function keysym_from_key_identifier(identifier, location, shifted) {
    if (!identifier) return null;

    var typedCharacter;

    // If identifier is U+xxxx, decode Unicode character
    var unicodePrefixLocation = identifier.indexOf('U+');
    if (unicodePrefixLocation >= 0) {
      var hex = identifier.substring(unicodePrefixLocation + 2);
      typedCharacter = String.fromCharCode(parseInt(hex, 16));
    }

    // If single character and not keypad, use that as typed character
    else if (identifier.length === 1 && location !== 3)
      typedCharacter = identifier;
    // Otherwise, look up corresponding keysym
    else return get_keysym(keyidentifier_keysym[identifier], location);

    // Alter case if necessary
    if (shifted === true) typedCharacter = typedCharacter.toUpperCase();
    else if (shifted === false) typedCharacter = typedCharacter.toLowerCase();

    // Get codepoint
    var codepoint = typedCharacter.charCodeAt(0);
    return keysym_from_charcode(codepoint);
  }

  function isControlCharacter(codepoint) {
    return codepoint <= 0x1f || (codepoint >= 0x7f && codepoint <= 0x9f);
  }

  function keysym_from_charcode(codepoint) {
    // Keysyms for control characters
    if (isControlCharacter(codepoint)) return 0xff00 | codepoint;

    // Keysyms for ASCII chars
    if (codepoint >= 0x0000 && codepoint <= 0x00ff) return codepoint;

    // Keysyms for Unicode
    if (codepoint >= 0x0100 && codepoint <= 0x10ffff)
      return 0x01000000 | codepoint;

    return null;
  }

  function keysym_from_keycode(keyCode, location) {
    return get_keysym(keycodeKeysyms[keyCode], location);
  }

  /**
   * Heuristically detects if the legacy keyIdentifier property of
   * a keydown/keyup event looks incorrectly derived. Chrome, and
   * presumably others, will produce the keyIdentifier by assuming
   * the keyCode is the Unicode codepoint for that key. This is not
   * correct in all cases.
   *
   * @private
   * @param {!number} keyCode
   *     The keyCode from a browser keydown/keyup event.
   *
   * @param {string} keyIdentifier
   *     The legacy keyIdentifier from a browser keydown/keyup event.
   *
   * @returns {!boolean}
   *     true if the keyIdentifier looks sane, false if the keyIdentifier
   *     appears incorrectly derived or is missing entirely.
   */
  var key_identifier_sane = function key_identifier_sane(
    keyCode,
    keyIdentifier,
  ) {
    // Missing identifier is not sane
    if (!keyIdentifier) return false;

    // Assume non-Unicode keyIdentifier values are sane
    var unicodePrefixLocation = keyIdentifier.indexOf('U+');
    if (unicodePrefixLocation === -1) return true;

    // If the Unicode codepoint isn't identical to the keyCode,
    // then the identifier is likely correct
    var codepoint = parseInt(
      keyIdentifier.substring(unicodePrefixLocation + 2),
      16,
    );
    if (keyCode !== codepoint) return true;

    // The keyCodes for A-Z and 0-9 are actually identical to their
    // Unicode codepoints
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57))
      return true;

    // The keyIdentifier does NOT appear sane
    return false;
  };

  /**
   * Marks a key as pressed, firing the keydown event if registered. Key
   * repeat for the pressed key will start after a delay if that key is
   * not a modifier. The return value of this function depends on the
   * return value of the keydown event handler, if any.
   *
   * @param {number} keysym
   *     The keysym of the key to press.
   *
   * @return {boolean}
   *     true if event should NOT be canceled, false otherwise.
   */
  this.press = function (keysym) {
    // Don't bother with pressing the key if the key is unknown
    if (keysym === null) return;

    // Only press if released
    if (!guac_keyboard.pressed[keysym]) {
      // Mark key as pressed
      guac_keyboard.pressed[keysym] = true;

      // Send key event
      if (guac_keyboard.onkeydown) {
        var result = guac_keyboard.onkeydown(keysym);
        last_keydown_result[keysym] = result;

        // Stop any current repeat
        window.clearTimeout(key_repeat_timeout);
        window.clearInterval(key_repeat_interval);

        // Repeat after a delay as long as pressed
        if (!no_repeat[keysym])
          key_repeat_timeout = window.setTimeout(function () {
            key_repeat_interval = window.setInterval(function () {
              guac_keyboard.onkeyup(keysym);
              guac_keyboard.onkeydown(keysym);
            }, 50);
          }, 500);

        return result;
      }
    }

    // Return the last keydown result by default, resort to false if unknown
    return last_keydown_result[keysym] || false;
  };

  /**
   * Marks a key as released, firing the keyup event if registered.
   *
   * @param {number} keysym
   *     The keysym of the key to release.
   */
  this.release = function (keysym) {
    // Only release if pressed
    if (guac_keyboard.pressed[keysym]) {
      // Mark key as released
      delete guac_keyboard.pressed[keysym];
      delete implicitlyPressed[keysym];

      // Stop repeat
      window.clearTimeout(key_repeat_timeout);
      window.clearInterval(key_repeat_interval);

      // Send key event
      if (keysym !== null && guac_keyboard.onkeyup)
        guac_keyboard.onkeyup(keysym);
    }
  };

  /**
   * Presses and releases the keys necessary to type the given string of
   * text.
   *
   * @param {!string} str
   *     The string to type.
   */
  this.type = function type(str) {
    // Press/release the key corresponding to each character in the string
    for (var i = 0; i < str.length; i++) {
      // Determine keysym of current character
      var codepoint = str.codePointAt ? str.codePointAt(i) : str.charCodeAt(i);
      var keysym = keysym_from_charcode(codepoint);

      // Press and release key for current character
      guac_keyboard.press(keysym);
      guac_keyboard.release(keysym);
    }
  };

  /**
   * Resets the state of this keyboard, releasing all keys, and firing keyup
   * events for each released key.
   */
  this.reset = function () {
    // Release all pressed keys
    for (var keysym in guac_keyboard.pressed)
      guac_keyboard.release(parseInt(keysym));

    // Clear event log
    eventLog = [];
  };

  /**
   * Resynchronizes the remote state of the given modifier with its
   * corresponding local modifier state, as dictated by
   * {@link KeyEvent#modifiers} within the given key event, by pressing or
   * releasing keysyms.
   *
   * @private
   * @param {!string} modifier
   *     The name of the {@link Guacamole.Keyboard.ModifierState} property
   *     being updated.
   *
   * @param {!number[]} keysyms
   *     The keysyms which represent the modifier being updated.
   *
   * @param {!KeyEvent} keyEvent
   *     Guacamole's current best interpretation of the key event being
   *     processed.
   */
  var updateModifierState = function updateModifierState(
    modifier,
    keysyms,
    keyEvent,
  ) {
    var localState = keyEvent.modifiers[modifier];
    var remoteState = guac_keyboard.modifiers[modifier];

    var i;

    // Do not trust changes in modifier state for events directly involving
    // that modifier: (1) the flag may erroneously be cleared despite
    // another version of the same key still being held and (2) the change
    // in flag may be due to the current event being processed, thus
    // updating things here is at best redundant and at worst incorrect
    if (keysyms.indexOf(keyEvent.keysym) !== -1) return;

    // Release all related keys if modifier is implicitly released
    if (remoteState && localState === false) {
      for (i = 0; i < keysyms.length; i++) {
        guac_keyboard.release(keysyms[i]);
      }
    }

    // Press if modifier is implicitly pressed
    else if (!remoteState && localState) {
      // Verify that modifier flag isn't already pressed or already set
      // due to another version of the same key being held down
      for (i = 0; i < keysyms.length; i++) {
        if (guac_keyboard.pressed[keysyms[i]]) return;
      }

      // Mark as implicitly pressed only if there is other information
      // within the key event relating to a different key. Some
      // platforms, such as iOS, will send essentially empty key events
      // for modifier keys, using only the modifier flags to signal the
      // identity of the key.
      var keysym = keysyms[0];
      if (keyEvent.keysym) implicitlyPressed[keysym] = true;

      guac_keyboard.press(keysym);
    }
  };

  /**
   * Given a keyboard event, updates the remote key state to match the local
   * modifier state and remote based on the modifier flags within the event.
   * This function pays no attention to keycodes.
   *
   * @private
   * @param {!KeyEvent} keyEvent
   *     Guacamole's current best interpretation of the key event being
   *     processed.
   */
  var syncModifierStates = function syncModifierStates(keyEvent) {
    // Resync state of alt
    updateModifierState(
      'alt',
      [
        0xffe9, // Left alt
        0xffea, // Right alt
        0xfe03, // AltGr
      ],
      keyEvent,
    );

    // Resync state of shift
    updateModifierState(
      'shift',
      [
        0xffe1, // Left shift
        0xffe2, // Right shift
      ],
      keyEvent,
    );

    // Resync state of ctrl
    updateModifierState(
      'ctrl',
      [
        0xffe3, // Left ctrl
        0xffe4, // Right ctrl
      ],
      keyEvent,
    );

    // Resync state of meta
    updateModifierState(
      'meta',
      [
        0xffe7, // Left meta
        0xffe8, // Right meta
      ],
      keyEvent,
    );

    // Resync state of hyper
    updateModifierState(
      'hyper',
      [
        0xffeb, // Left super/hyper
        0xffec, // Right super/hyper
      ],
      keyEvent,
    );

    // Update state
    guac_keyboard.modifiers = keyEvent.modifiers;
  };

  /**
   * Returns whether all currently pressed keys were implicitly pressed. A
   * key is implicitly pressed if its status was inferred indirectly from
   * inspection of other key events.
   *
   * @private
   * @returns {!boolean}
   *     true if all currently pressed keys were implicitly pressed, false
   *     otherwise.
   */
  var isStateImplicit = function isStateImplicit() {
    for (var keysym in guac_keyboard.pressed) {
      if (!implicitlyPressed[keysym]) return false;
    }

    return true;
  };

  /**
   * Reads through the event log, removing events from the head of the log
   * when the corresponding true key presses are known (or as known as they
   * can be).
   *
   * @private
   * @return {boolean}
   *     Whether the default action of the latest event should be prevented.
   */
  function interpret_events() {
    // Do not prevent default if no event could be interpreted
    var handled_event = interpret_event();
    if (!handled_event) return false;

    // Interpret as much as possible
    var last_event;
    do {
      last_event = handled_event;
      handled_event = interpret_event();
    } while (handled_event !== null);

    // Reset keyboard state if we cannot expect to receive any further
    // keyup events
    if (isStateImplicit()) guac_keyboard.reset();

    return last_event.defaultPrevented;
  }

  /**
   * Releases Ctrl+Alt, if both are currently pressed and the given keysym
   * looks like a key that may require AltGr.
   *
   * @private
   * @param {!number} keysym
   *     The key that was just pressed.
   */
  var release_simulated_altgr = function release_simulated_altgr(keysym) {
    // Both Ctrl+Alt must be pressed if simulated AltGr is in use
    if (!guac_keyboard.modifiers.ctrl || !guac_keyboard.modifiers.alt) return;

    // Assume [A-Z] never require AltGr
    if (keysym >= 0x0041 && keysym <= 0x005a) return;

    // Assume [a-z] never require AltGr
    if (keysym >= 0x0061 && keysym <= 0x007a) return;

    // Release Ctrl+Alt if the keysym is printable
    if (keysym <= 0xff || (keysym & 0xff000000) === 0x01000000) {
      guac_keyboard.release(0xffe3); // Left ctrl
      guac_keyboard.release(0xffe4); // Right ctrl
      guac_keyboard.release(0xffe9); // Left alt
      guac_keyboard.release(0xffea); // Right alt
    }
  };

  /**
   * Reads through the event log, interpreting the first event, if possible,
   * and returning that event. If no events can be interpreted, due to a
   * total lack of events or the need for more events, null is returned. Any
   * interpreted events are automatically removed from the log.
   *
   * @private
   * @return {KeyEvent}
   *     The first key event in the log, if it can be interpreted, or null
   *     otherwise.
   */
  var interpret_event = function interpret_event() {
    // Peek at first event in log
    var first = eventLog[0];
    if (!first) return null;

    // Keydown event
    if (first instanceof KeydownEvent) {
      var keysym = null;
      var accepted_events = [];

      // Defer handling of Meta until it is known to be functioning as a
      // modifier (it may otherwise actually be an alternative method for
      // pressing a single key, such as Meta+Left for Home on ChromeOS)
      if (first.keysym === 0xffe7 || first.keysym === 0xffe8) {
        // Defer handling until further events exist to provide context
        if (eventLog.length === 1) return null;

        // Drop keydown if it turns out Meta does not actually apply
        if (eventLog[1].keysym !== first.keysym) {
          if (!eventLog[1].modifiers.meta) return eventLog.shift();
        }

        // Drop duplicate keydown events while waiting to determine
        // whether to acknowledge Meta (browser may repeat keydown
        // while the key is held)
        else if (eventLog[1] instanceof KeydownEvent) return eventLog.shift();
      }

      // If event itself is reliable, no need to wait for other events
      if (first.reliable) {
        keysym = first.keysym;
        accepted_events = eventLog.splice(0, 1);
      }

      // If keydown is immediately followed by a keypress, use the indicated character
      else if (eventLog[1] instanceof KeypressEvent) {
        keysym = eventLog[1].keysym;
        accepted_events = eventLog.splice(0, 2);
      }

      // If keydown is immediately followed by anything else, then no
      // keypress can possibly occur to clarify this event, and we must
      // handle it now
      else if (eventLog[1]) {
        keysym = first.keysym;
        accepted_events = eventLog.splice(0, 1);
      }

      // Fire a key press if valid events were found
      if (accepted_events.length > 0) {
        syncModifierStates(first);

        if (keysym) {
          // Fire event
          release_simulated_altgr(keysym);
          var defaultPrevented = !guac_keyboard.press(keysym);
          recentKeysym[first.keyCode] = keysym;

          // Release the key now if we cannot rely on the associated
          // keyup event
          if (!first.keyupReliable) guac_keyboard.release(keysym);

          // Record whether default was prevented
          for (var i = 0; i < accepted_events.length; i++)
            accepted_events[i].defaultPrevented = defaultPrevented;
        }

        return first;
      }
    } // end if keydown

    // Keyup event
    else if (first instanceof KeyupEvent && !quirks.keyupUnreliable) {
      // Release specific key if known
      var keysym = first.keysym;
      if (keysym) {
        guac_keyboard.release(keysym);
        delete recentKeysym[first.keyCode];
        first.defaultPrevented = true;
      }

      // Otherwise, fall back to releasing all keys
      else {
        guac_keyboard.reset();
        return first;
      }

      syncModifierStates(first);
      return eventLog.shift();
    } // end if keyup

    // Ignore any other type of event (keypress by itself is invalid, and
    // unreliable keyup events should simply be dumped)
    else return eventLog.shift();

    // No event interpreted
    return null;
  };

  /**
   * Returns the keyboard location of the key associated with the given
   * keyboard event. The location differentiates key events which otherwise
   * have the same keycode, such as left shift vs. right shift.
   *
   * @private
   * @param {!KeyboardEvent} e
   *     A JavaScript keyboard event, as received through the DOM via a
   *     "keydown", "keyup", or "keypress" handler.
   *
   * @returns {!number}
   *     The location of the key event on the keyboard, as defined at:
   *     http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
   */
  var getEventLocation = function getEventLocation(e) {
    // Use standard location, if possible
    if ('location' in e) return e.location;

    // Failing that, attempt to use deprecated keyLocation
    if ('keyLocation' in e) return e.keyLocation;

    // If no location is available, assume left side
    return 0;
  };

  /**
   * Attempts to mark the given Event as having been handled by this
   * Guacamole.Keyboard. If the Event has already been marked as handled,
   * false is returned.
   *
   * @param {!Event} e
   *     The Event to mark.
   *
   * @returns {!boolean}
   *     true if the given Event was successfully marked, false if the given
   *     Event was already marked.
   */
  var markEvent = function markEvent(e) {
    // Fail if event is already marked
    if (e[EVENT_MARKER]) return false;

    // Mark event otherwise
    e[EVENT_MARKER] = true;
    return true;
  };

  /**
   * Attaches event listeners to the given Element, automatically translating
   * received key, input, and composition events into simple keydown/keyup
   * events signalled through this Guacamole.Keyboard's onkeydown and
   * onkeyup handlers.
   *
   * @param {!(Element|Document)} element
   *     The Element to attach event listeners to for the sake of handling
   *     key or input events.
   */
  this.listenTo = function listenTo(element) {
    // When key pressed
    element.addEventListener(
      'keydown',
      function (e) {
        // Only intercept if handler set
        if (!guac_keyboard.onkeydown) return;

        // Ignore events which have already been handled
        if (!markEvent(e)) return;

        var keydownEvent = new KeydownEvent(e);

        // Ignore (but do not prevent) the "composition" keycode sent by some
        // browsers when an IME is in use (see: http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html)
        if (keydownEvent.keyCode === 229) return;

        // Log event
        eventLog.push(keydownEvent);

        // Interpret as many events as possible, prevent default if indicated
        if (interpret_events()) e.preventDefault();
      },
      true,
    );

    // When key pressed
    element.addEventListener(
      'keypress',
      function (e) {
        // Only intercept if handler set
        if (!guac_keyboard.onkeydown && !guac_keyboard.onkeyup) return;

        // Ignore events which have already been handled
        if (!markEvent(e)) return;

        // Log event
        eventLog.push(new KeypressEvent(e));

        // Interpret as many events as possible, prevent default if indicated
        if (interpret_events()) e.preventDefault();
      },
      true,
    );

    // When key released
    element.addEventListener(
      'keyup',
      function (e) {
        // Only intercept if handler set
        if (!guac_keyboard.onkeyup) return;

        // Ignore events which have already been handled
        if (!markEvent(e)) return;

        e.preventDefault();

        // Log event, call for interpretation
        eventLog.push(new KeyupEvent(e));
        interpret_events();
      },
      true,
    );

    // NEKO: Do not automatically type text entered into the wrapped field
  };

  // Listen to given element, if any
  if (element) guac_keyboard.listenTo(element);
};

/**
 * The unique numerical identifier to assign to the next Guacamole.Keyboard
 * instance.
 *
 * @private
 * @type {!number}
 */
Guacamole.Keyboard._nextID = 0;

/**
 * The state of all supported keyboard modifiers.
 * @constructor
 */
Guacamole.Keyboard.ModifierState = function () {
  /**
   * Whether shift is currently pressed.
   *
   * @type {!boolean}
   */
  this.shift = false;

  /**
   * Whether ctrl is currently pressed.
   *
   * @type {!boolean}
   */
  this.ctrl = false;

  /**
   * Whether alt is currently pressed.
   *
   * @type {!boolean}
   */
  this.alt = false;

  /**
   * Whether meta (apple key) is currently pressed.
   *
   * @type {!boolean}
   */
  this.meta = false;

  /**
   * Whether hyper (windows key) is currently pressed.
   *
   * @type {!boolean}
   */
  this.hyper = false;
};

/**
 * Returns the modifier state applicable to the keyboard event given.
 *
 * @param {!KeyboardEvent} e
 *     The keyboard event to read.
 *
 * @returns {!Guacamole.Keyboard.ModifierState}
 *     The current state of keyboard modifiers.
 */
Guacamole.Keyboard.ModifierState.fromKeyboardEvent = function (e) {
  var state = new Guacamole.Keyboard.ModifierState();

  // Assign states from old flags
  state.shift = e.shiftKey;
  state.ctrl = e.ctrlKey;
  state.alt = e.altKey;
  state.meta = e.metaKey;

  // Use DOM3 getModifierState() for others
  if (e.getModifierState) {
    state.hyper =
      e.getModifierState('OS') ||
      e.getModifierState('Super') ||
      e.getModifierState('Hyper') ||
      e.getModifierState('Win');
  }

  return state;
};

export default Guacamole.Keyboard;
