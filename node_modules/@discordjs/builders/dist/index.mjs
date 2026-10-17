var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/messages/embed/Assertions.ts
var Assertions_exports = {};
__export(Assertions_exports, {
  RGBPredicate: () => RGBPredicate,
  authorNamePredicate: () => authorNamePredicate,
  colorPredicate: () => colorPredicate,
  descriptionPredicate: () => descriptionPredicate,
  embedAuthorPredicate: () => embedAuthorPredicate,
  embedFieldPredicate: () => embedFieldPredicate,
  embedFieldsArrayPredicate: () => embedFieldsArrayPredicate,
  embedFooterPredicate: () => embedFooterPredicate,
  fieldInlinePredicate: () => fieldInlinePredicate,
  fieldLengthPredicate: () => fieldLengthPredicate,
  fieldNamePredicate: () => fieldNamePredicate,
  fieldValuePredicate: () => fieldValuePredicate,
  footerTextPredicate: () => footerTextPredicate,
  imageURLPredicate: () => imageURLPredicate,
  timestampPredicate: () => timestampPredicate,
  titlePredicate: () => titlePredicate,
  urlPredicate: () => urlPredicate,
  validateFieldLength: () => validateFieldLength
});
import { s } from "@sapphire/shapeshift";

// src/util/validation.ts
var validate = true;
function enableValidators() {
  return validate = true;
}
__name(enableValidators, "enableValidators");
function disableValidators() {
  return validate = false;
}
__name(disableValidators, "disableValidators");
function isValidationEnabled() {
  return validate;
}
__name(isValidationEnabled, "isValidationEnabled");

// src/messages/embed/Assertions.ts
var fieldNamePredicate = s.string().lengthLessThanOrEqual(256).setValidationEnabled(isValidationEnabled);
var fieldValuePredicate = s.string().lengthLessThanOrEqual(1024).setValidationEnabled(isValidationEnabled);
var fieldInlinePredicate = s.boolean().optional();
var embedFieldPredicate = s.object({
  name: fieldNamePredicate,
  value: fieldValuePredicate,
  inline: fieldInlinePredicate
}).setValidationEnabled(isValidationEnabled);
var embedFieldsArrayPredicate = embedFieldPredicate.array().setValidationEnabled(isValidationEnabled);
var fieldLengthPredicate = s.number().lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateFieldLength(amountAdding, fields) {
  fieldLengthPredicate.parse((fields?.length ?? 0) + amountAdding);
}
__name(validateFieldLength, "validateFieldLength");
var authorNamePredicate = fieldNamePredicate.lengthGreaterThanOrEqual(1).nullable().setValidationEnabled(isValidationEnabled);
var imageURLPredicate = s.string().url({
  allowedProtocols: ["http:", "https:", "attachment:"]
}).nullish().setValidationEnabled(isValidationEnabled);
var urlPredicate = s.string().url({
  allowedProtocols: ["http:", "https:"]
}).nullish().setValidationEnabled(isValidationEnabled);
var embedAuthorPredicate = s.object({
  name: authorNamePredicate,
  iconURL: imageURLPredicate,
  url: urlPredicate
}).setValidationEnabled(isValidationEnabled);
var RGBPredicate = s.number().int().greaterThanOrEqual(0).lessThanOrEqual(255).setValidationEnabled(isValidationEnabled);
var colorPredicate = s.number().int().greaterThanOrEqual(0).lessThanOrEqual(16777215).or(s.tuple([RGBPredicate, RGBPredicate, RGBPredicate])).nullable().setValidationEnabled(isValidationEnabled);
var descriptionPredicate = s.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(4096).nullable().setValidationEnabled(isValidationEnabled);
var footerTextPredicate = s.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(2048).nullable().setValidationEnabled(isValidationEnabled);
var embedFooterPredicate = s.object({
  text: footerTextPredicate,
  iconURL: imageURLPredicate
}).setValidationEnabled(isValidationEnabled);
var timestampPredicate = s.union([s.number(), s.date()]).nullable().setValidationEnabled(isValidationEnabled);
var titlePredicate = fieldNamePredicate.lengthGreaterThanOrEqual(1).nullable().setValidationEnabled(isValidationEnabled);

// src/util/normalizeArray.ts
function normalizeArray(arr) {
  if (Array.isArray(arr[0])) return [...arr[0]];
  return arr;
}
__name(normalizeArray, "normalizeArray");

// src/messages/embed/Embed.ts
var EmbedBuilder = class {
  static {
    __name(this, "EmbedBuilder");
  }
  /**
   * The API data associated with this embed.
   */
  data;
  /**
   * Creates a new embed from API data.
   *
   * @param data - The API data to create this embed with
   */
  constructor(data = {}) {
    this.data = { ...data };
    if (data.timestamp) this.data.timestamp = new Date(data.timestamp).toISOString();
  }
  /**
   * Appends fields to the embed.
   *
   * @remarks
   * This method accepts either an array of fields or a variable number of field parameters.
   * The maximum amount of fields that can be added is 25.
   * @example
   * Using an array:
   * ```ts
   * const fields: APIEmbedField[] = ...;
   * const embed = new EmbedBuilder()
   * 	.addFields(fields);
   * ```
   * @example
   * Using rest parameters (variadic):
   * ```ts
   * const embed = new EmbedBuilder()
   * 	.addFields(
   * 		{ name: 'Field 1', value: 'Value 1' },
   * 		{ name: 'Field 2', value: 'Value 2' },
   * 	);
   * ```
   * @param fields - The fields to add
   */
  addFields(...fields) {
    const normalizedFields = normalizeArray(fields);
    validateFieldLength(normalizedFields.length, this.data.fields);
    embedFieldsArrayPredicate.parse(normalizedFields);
    if (this.data.fields) this.data.fields.push(...normalizedFields);
    else this.data.fields = normalizedFields;
    return this;
  }
  /**
   * Removes, replaces, or inserts fields for this embed.
   *
   * @remarks
   * This method behaves similarly
   * to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice | Array.prototype.splice()}.
   * The maximum amount of fields that can be added is 25.
   *
   * It's useful for modifying and adjusting order of the already-existing fields of an embed.
   * @example
   * Remove the first field:
   * ```ts
   * embed.spliceFields(0, 1);
   * ```
   * @example
   * Remove the first n fields:
   * ```ts
   * const n = 4;
   * embed.spliceFields(0, n);
   * ```
   * @example
   * Remove the last field:
   * ```ts
   * embed.spliceFields(-1, 1);
   * ```
   * @param index - The index to start at
   * @param deleteCount - The number of fields to remove
   * @param fields - The replacing field objects
   */
  spliceFields(index, deleteCount, ...fields) {
    validateFieldLength(fields.length - deleteCount, this.data.fields);
    embedFieldsArrayPredicate.parse(fields);
    if (this.data.fields) this.data.fields.splice(index, deleteCount, ...fields);
    else this.data.fields = fields;
    return this;
  }
  /**
   * Sets the fields for this embed.
   *
   * @remarks
   * This method is an alias for {@link EmbedBuilder.spliceFields}. More specifically,
   * it splices the entire array of fields, replacing them with the provided fields.
   *
   * You can set a maximum of 25 fields.
   * @param fields - The fields to set
   */
  setFields(...fields) {
    this.spliceFields(0, this.data.fields?.length ?? 0, ...normalizeArray(fields));
    return this;
  }
  /**
   * Sets the author of this embed.
   *
   * @param options - The options to use
   */
  setAuthor(options) {
    if (options === null) {
      this.data.author = void 0;
      return this;
    }
    embedAuthorPredicate.parse(options);
    this.data.author = { name: options.name, url: options.url, icon_url: options.iconURL };
    return this;
  }
  /**
   * Sets the color of this embed.
   *
   * @param color - The color to use
   */
  setColor(color) {
    colorPredicate.parse(color);
    if (Array.isArray(color)) {
      const [red, green, blue] = color;
      this.data.color = (red << 16) + (green << 8) + blue;
      return this;
    }
    this.data.color = color ?? void 0;
    return this;
  }
  /**
   * Sets the description of this embed.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    descriptionPredicate.parse(description);
    this.data.description = description ?? void 0;
    return this;
  }
  /**
   * Sets the footer of this embed.
   *
   * @param options - The footer to use
   */
  setFooter(options) {
    if (options === null) {
      this.data.footer = void 0;
      return this;
    }
    embedFooterPredicate.parse(options);
    this.data.footer = { text: options.text, icon_url: options.iconURL };
    return this;
  }
  /**
   * Sets the image of this embed.
   *
   * @param url - The image URL to use
   */
  setImage(url) {
    imageURLPredicate.parse(url);
    this.data.image = url ? { url } : void 0;
    return this;
  }
  /**
   * Sets the thumbnail of this embed.
   *
   * @param url - The thumbnail URL to use
   */
  setThumbnail(url) {
    imageURLPredicate.parse(url);
    this.data.thumbnail = url ? { url } : void 0;
    return this;
  }
  /**
   * Sets the timestamp of this embed.
   *
   * @param timestamp - The timestamp or date to use
   */
  setTimestamp(timestamp = Date.now()) {
    timestampPredicate.parse(timestamp);
    this.data.timestamp = timestamp ? new Date(timestamp).toISOString() : void 0;
    return this;
  }
  /**
   * Sets the title for this embed.
   *
   * @param title - The title to use
   */
  setTitle(title) {
    titlePredicate.parse(title);
    this.data.title = title ?? void 0;
    return this;
  }
  /**
   * Sets the URL of this embed.
   *
   * @param url - The URL to use
   */
  setURL(url) {
    urlPredicate.parse(url);
    this.data.url = url ?? void 0;
    return this;
  }
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    return { ...this.data };
  }
};

// src/index.ts
export * from "@discordjs/formatters";

// src/components/Assertions.ts
var Assertions_exports2 = {};
__export(Assertions_exports2, {
  buttonLabelValidator: () => buttonLabelValidator,
  buttonStyleValidator: () => buttonStyleValidator,
  channelTypesValidator: () => channelTypesValidator,
  customIdValidator: () => customIdValidator,
  defaultValidator: () => defaultValidator,
  disabledValidator: () => disabledValidator,
  emojiValidator: () => emojiValidator,
  idValidator: () => idValidator,
  jsonOptionValidator: () => jsonOptionValidator,
  labelValueDescriptionValidator: () => labelValueDescriptionValidator,
  minMaxValidator: () => minMaxValidator,
  optionValidator: () => optionValidator,
  optionsLengthValidator: () => optionsLengthValidator,
  optionsValidator: () => optionsValidator,
  placeholderValidator: () => placeholderValidator,
  urlValidator: () => urlValidator,
  validateRequiredButtonParameters: () => validateRequiredButtonParameters,
  validateRequiredSelectMenuOptionParameters: () => validateRequiredSelectMenuOptionParameters,
  validateRequiredSelectMenuParameters: () => validateRequiredSelectMenuParameters
});
import { s as s2 } from "@sapphire/shapeshift";
import { ButtonStyle, ChannelType } from "discord-api-types/v10";

// src/components/selectMenu/StringSelectMenuOption.ts
var StringSelectMenuOptionBuilder = class {
  /**
   * Creates a new string select menu option from API data.
   *
   * @param data - The API data to create this string select menu option with
   * @example
   * Creating a string select menu option from an API data object:
   * ```ts
   * const selectMenuOption = new SelectMenuOptionBuilder({
   * 	label: 'catchy label',
   * 	value: '1',
   * });
   * ```
   * @example
   * Creating a string select menu option using setters and API data:
   * ```ts
   * const selectMenuOption = new SelectMenuOptionBuilder({
   * 	default: true,
   * 	value: '1',
   * })
   * 	.setLabel('woah');
   * ```
   */
  constructor(data = {}) {
    this.data = data;
  }
  static {
    __name(this, "StringSelectMenuOptionBuilder");
  }
  /**
   * Sets the label for this option.
   *
   * @param label - The label to use
   */
  setLabel(label) {
    this.data.label = labelValueDescriptionValidator.parse(label);
    return this;
  }
  /**
   * Sets the value for this option.
   *
   * @param value - The value to use
   */
  setValue(value) {
    this.data.value = labelValueDescriptionValidator.parse(value);
    return this;
  }
  /**
   * Sets the description for this option.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    this.data.description = labelValueDescriptionValidator.parse(description);
    return this;
  }
  /**
   * Sets whether this option is selected by default.
   *
   * @param isDefault - Whether this option is selected by default
   */
  setDefault(isDefault = true) {
    this.data.default = defaultValidator.parse(isDefault);
    return this;
  }
  /**
   * Sets the emoji to display for this option.
   *
   * @param emoji - The emoji to use
   */
  setEmoji(emoji) {
    this.data.emoji = emojiValidator.parse(emoji);
    return this;
  }
  /**
   * {@inheritDoc BaseSelectMenuBuilder.toJSON}
   */
  toJSON() {
    validateRequiredSelectMenuOptionParameters(this.data.label, this.data.value);
    return {
      ...this.data
    };
  }
};

// src/components/Assertions.ts
var idValidator = s2.number().safeInt().greaterThanOrEqual(1).lessThan(4294967296).setValidationEnabled(isValidationEnabled);
var customIdValidator = s2.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var emojiValidator = s2.object({
  id: s2.string(),
  name: s2.string(),
  animated: s2.boolean()
}).partial().strict().setValidationEnabled(isValidationEnabled);
var disabledValidator = s2.boolean();
var buttonLabelValidator = s2.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(80).setValidationEnabled(isValidationEnabled);
var buttonStyleValidator = s2.nativeEnum(ButtonStyle);
var placeholderValidator = s2.string().lengthLessThanOrEqual(150).setValidationEnabled(isValidationEnabled);
var minMaxValidator = s2.number().int().greaterThanOrEqual(0).lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
var labelValueDescriptionValidator = s2.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var jsonOptionValidator = s2.object({
  label: labelValueDescriptionValidator,
  value: labelValueDescriptionValidator,
  description: labelValueDescriptionValidator.optional(),
  emoji: emojiValidator.optional(),
  default: s2.boolean().optional()
}).setValidationEnabled(isValidationEnabled);
var optionValidator = s2.instance(StringSelectMenuOptionBuilder).setValidationEnabled(isValidationEnabled);
var optionsValidator = optionValidator.array().lengthGreaterThanOrEqual(0).setValidationEnabled(isValidationEnabled);
var optionsLengthValidator = s2.number().int().greaterThanOrEqual(0).lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateRequiredSelectMenuParameters(options, customId) {
  customIdValidator.parse(customId);
  optionsValidator.parse(options);
}
__name(validateRequiredSelectMenuParameters, "validateRequiredSelectMenuParameters");
var defaultValidator = s2.boolean();
function validateRequiredSelectMenuOptionParameters(label, value) {
  labelValueDescriptionValidator.parse(label);
  labelValueDescriptionValidator.parse(value);
}
__name(validateRequiredSelectMenuOptionParameters, "validateRequiredSelectMenuOptionParameters");
var channelTypesValidator = s2.nativeEnum(ChannelType).array().setValidationEnabled(isValidationEnabled);
var urlValidator = s2.string().url({
  allowedProtocols: ["http:", "https:", "discord:"]
}).setValidationEnabled(isValidationEnabled);
function validateRequiredButtonParameters(style, label, emoji, customId, skuId, url) {
  if (style === ButtonStyle.Premium) {
    if (!skuId) {
      throw new RangeError("Premium buttons must have an SKU id.");
    }
    if (customId || label || url || emoji) {
      throw new RangeError("Premium buttons cannot have a custom id, label, URL, or emoji.");
    }
  } else {
    if (skuId) {
      throw new RangeError("Non-premium buttons must not have an SKU id.");
    }
    if (url && customId) {
      throw new RangeError("URL and custom id are mutually exclusive.");
    }
    if (!label && !emoji) {
      throw new RangeError("Non-premium buttons must have a label and/or an emoji.");
    }
    if (style === ButtonStyle.Link) {
      if (!url) {
        throw new RangeError("Link buttons must have a URL.");
      }
    } else if (url) {
      throw new RangeError("Non-premium and non-link buttons cannot have a URL.");
    }
  }
}
__name(validateRequiredButtonParameters, "validateRequiredButtonParameters");

// src/components/ActionRow.ts
import {
  ComponentType as ComponentType22
} from "discord-api-types/v10";

// src/components/Component.ts
var ComponentBuilder = class {
  static {
    __name(this, "ComponentBuilder");
  }
  /**
   * The API data associated with this component.
   */
  data;
  /**
   * Constructs a new kind of component.
   *
   * @param data - The data to construct a component out of
   */
  constructor(data) {
    this.data = data;
  }
  /**
   * Sets the id (not the custom id) for this component.
   *
   * @param id - The id for this component
   */
  setId(id) {
    this.data.id = idValidator.parse(id);
    return this;
  }
  /**
   * Clears the id of this component, defaulting to a default incremented id.
   */
  clearId() {
    this.data.id = void 0;
    return this;
  }
};

// src/components/Components.ts
import { ComponentType as ComponentType21 } from "discord-api-types/v10";

// src/components/button/Button.ts
import {
  ComponentType
} from "discord-api-types/v10";
var ButtonBuilder = class extends ComponentBuilder {
  static {
    __name(this, "ButtonBuilder");
  }
  /**
   * Creates a new button from API data.
   *
   * @param data - The API data to create this button with
   * @example
   * Creating a button from an API data object:
   * ```ts
   * const button = new ButtonBuilder({
   * 	custom_id: 'a cool button',
   * 	style: ButtonStyle.Primary,
   * 	label: 'Click Me',
   * 	emoji: {
   * 		name: 'smile',
   * 		id: '123456789012345678',
   * 	},
   * });
   * ```
   * @example
   * Creating a button using setters and API data:
   * ```ts
   * const button = new ButtonBuilder({
   * 	style: ButtonStyle.Secondary,
   * 	label: 'Click Me',
   * })
   * 	.setEmoji({ name: '🙂' })
   * 	.setCustomId('another cool button');
   * ```
   */
  constructor(data) {
    super({ type: ComponentType.Button, ...data });
  }
  /**
   * Sets the style of this button.
   *
   * @param style - The style to use
   */
  setStyle(style) {
    this.data.style = buttonStyleValidator.parse(style);
    return this;
  }
  /**
   * Sets the URL for this button.
   *
   * @remarks
   * This method is only available to buttons using the `Link` button style.
   * Only three types of URL schemes are currently supported: `https://`, `http://`, and `discord://`.
   * @param url - The URL to use
   */
  setURL(url) {
    this.data.url = urlValidator.parse(url);
    return this;
  }
  /**
   * Sets the custom id for this button.
   *
   * @remarks
   * This method is only applicable to buttons that are not using the `Link` button style.
   * @param customId - The custom id to use
   */
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  /**
   * Sets the SKU id that represents a purchasable SKU for this button.
   *
   * @remarks Only available when using premium-style buttons.
   * @param skuId - The SKU id to use
   */
  setSKUId(skuId) {
    this.data.sku_id = skuId;
    return this;
  }
  /**
   * Sets the emoji to display on this button.
   *
   * @param emoji - The emoji to use
   */
  setEmoji(emoji) {
    this.data.emoji = emojiValidator.parse(emoji);
    return this;
  }
  /**
   * Sets whether this button is disabled.
   *
   * @param disabled - Whether to disable this button
   */
  setDisabled(disabled = true) {
    this.data.disabled = disabledValidator.parse(disabled);
    return this;
  }
  /**
   * Sets the label for this button.
   *
   * @param label - The label to use
   */
  setLabel(label) {
    this.data.label = buttonLabelValidator.parse(label);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    validateRequiredButtonParameters(
      this.data.style,
      this.data.label,
      this.data.emoji,
      this.data.custom_id,
      this.data.sku_id,
      this.data.url
    );
    return {
      ...this.data
    };
  }
};

// src/components/fileUpload/FileUpload.ts
import { ComponentType as ComponentType3 } from "discord-api-types/v10";

// src/components/fileUpload/Assertions.ts
var Assertions_exports3 = {};
__export(Assertions_exports3, {
  fileUploadPredicate: () => fileUploadPredicate
});
import { s as s3 } from "@sapphire/shapeshift";
import { ComponentType as ComponentType2 } from "discord-api-types/v10";
var fileUploadPredicate = s3.object({
  type: s3.literal(ComponentType2.FileUpload),
  id: idValidator.optional(),
  custom_id: customIdValidator,
  min_values: s3.number().greaterThanOrEqual(0).lessThanOrEqual(10).optional(),
  max_values: s3.number().greaterThanOrEqual(1).lessThanOrEqual(10).optional(),
  required: s3.boolean().optional()
});

// src/components/fileUpload/FileUpload.ts
var FileUploadBuilder = class extends ComponentBuilder {
  static {
    __name(this, "FileUploadBuilder");
  }
  /**
   * Creates a new file upload.
   *
   * @param data - The API data to create this file upload with
   * @example
   * Creating a file upload from an API data object:
   * ```ts
   * const fileUpload = new FileUploadBuilder({
   * 	custom_id: "file_upload",
   *  min_values: 2,
   *  max_values: 5,
   * });
   * ```
   * @example
   * Creating a file upload using setters and API data:
   * ```ts
   * const fileUpload = new FileUploadBuilder({
   * 	custom_id: "file_upload",
   *  min_values: 2,
   *  max_values: 5,
   * }).setRequired();
   * ```
   */
  constructor(data = {}) {
    super({ type: ComponentType3.FileUpload, ...data });
  }
  /**
   * Sets the custom id for this file upload.
   *
   * @param customId - The custom id to use
   */
  setCustomId(customId) {
    this.data.custom_id = customId;
    return this;
  }
  /**
   * Sets the minimum number of file uploads required.
   *
   * @param minValues - The minimum values that must be uploaded
   */
  setMinValues(minValues) {
    this.data.min_values = minValues;
    return this;
  }
  /**
   * Clears the minimum values.
   */
  clearMinValues() {
    this.data.min_values = void 0;
    return this;
  }
  /**
   * Sets the maximum number of file uploads required.
   *
   * @param maxValues - The maximum values that must be uploaded
   */
  setMaxValues(maxValues) {
    this.data.max_values = maxValues;
    return this;
  }
  /**
   * Clears the maximum values.
   */
  clearMaxValues() {
    this.data.max_values = void 0;
    return this;
  }
  /**
   * Sets whether this file upload is required.
   *
   * @param required - Whether this file upload is required
   */
  setRequired(required = true) {
    this.data.required = required;
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    fileUploadPredicate.parse(this.data);
    return this.data;
  }
};

// src/components/label/Label.ts
import { ComponentType as ComponentType13 } from "discord-api-types/v10";

// src/components/selectMenu/ChannelSelectMenu.ts
import {
  ComponentType as ComponentType5,
  SelectMenuDefaultValueType
} from "discord-api-types/v10";

// src/components/textInput/Assertions.ts
var Assertions_exports4 = {};
__export(Assertions_exports4, {
  labelValidator: () => labelValidator,
  maxLengthValidator: () => maxLengthValidator,
  minLengthValidator: () => minLengthValidator,
  placeholderValidator: () => placeholderValidator2,
  requiredValidator: () => requiredValidator,
  textInputPredicate: () => textInputPredicate,
  textInputStyleValidator: () => textInputStyleValidator,
  validateRequiredParameters: () => validateRequiredParameters,
  valueValidator: () => valueValidator
});
import { s as s4 } from "@sapphire/shapeshift";
import { ComponentType as ComponentType4, TextInputStyle } from "discord-api-types/v10";
var textInputStyleValidator = s4.nativeEnum(TextInputStyle).setValidationEnabled(isValidationEnabled);
var minLengthValidator = s4.number().int().greaterThanOrEqual(0).lessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var maxLengthValidator = s4.number().int().greaterThanOrEqual(1).lessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var requiredValidator = s4.boolean().setValidationEnabled(isValidationEnabled);
var valueValidator = s4.string().lengthLessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var placeholderValidator2 = s4.string().lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var labelValidator = s4.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(45).setValidationEnabled(isValidationEnabled);
var textInputPredicate = s4.object({
  type: s4.literal(ComponentType4.TextInput),
  custom_id: customIdValidator,
  style: textInputStyleValidator,
  id: idValidator.optional(),
  min_length: minLengthValidator.optional(),
  max_length: maxLengthValidator.optional(),
  placeholder: placeholderValidator2.optional(),
  value: valueValidator.optional(),
  required: requiredValidator.optional()
}).setValidationEnabled(isValidationEnabled);
function validateRequiredParameters(customId, style) {
  customIdValidator.parse(customId);
  textInputStyleValidator.parse(style);
}
__name(validateRequiredParameters, "validateRequiredParameters");

// src/components/selectMenu/BaseSelectMenu.ts
var BaseSelectMenuBuilder = class extends ComponentBuilder {
  static {
    __name(this, "BaseSelectMenuBuilder");
  }
  /**
   * Sets the placeholder for this select menu.
   *
   * @param placeholder - The placeholder to use
   */
  setPlaceholder(placeholder) {
    this.data.placeholder = placeholderValidator.parse(placeholder);
    return this;
  }
  /**
   * Sets the minimum values that must be selected in the select menu.
   *
   * @param minValues - The minimum values that must be selected
   */
  setMinValues(minValues) {
    this.data.min_values = minMaxValidator.parse(minValues);
    return this;
  }
  /**
   * Sets the maximum values that must be selected in the select menu.
   *
   * @param maxValues - The maximum values that must be selected
   */
  setMaxValues(maxValues) {
    this.data.max_values = minMaxValidator.parse(maxValues);
    return this;
  }
  /**
   * Sets the custom id for this select menu.
   *
   * @param customId - The custom id to use
   */
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  /**
   * Sets whether this select menu is disabled.
   *
   * @param disabled - Whether this select menu is disabled
   */
  setDisabled(disabled = true) {
    this.data.disabled = disabledValidator.parse(disabled);
    return this;
  }
  /**
   * Sets whether this select menu is required.
   *
   * @remarks Only for use in modals.
   * @param required - Whether this select menu is required
   */
  setRequired(required = true) {
    this.data.required = requiredValidator.parse(required);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    customIdValidator.parse(this.data.custom_id);
    return {
      ...this.data
    };
  }
};

// src/components/selectMenu/ChannelSelectMenu.ts
var ChannelSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  static {
    __name(this, "ChannelSelectMenuBuilder");
  }
  /**
   * Creates a new select menu from API data.
   *
   * @param data - The API data to create this select menu with
   * @example
   * Creating a select menu from an API data object:
   * ```ts
   * const selectMenu = new ChannelSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * 	placeholder: 'select an option',
   * 	max_values: 2,
   * });
   * ```
   * @example
   * Creating a select menu using setters and API data:
   * ```ts
   * const selectMenu = new ChannelSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * })
   * 	.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
   * 	.setMinValues(2);
   * ```
   */
  constructor(data) {
    super({ ...data, type: ComponentType5.ChannelSelect });
  }
  /**
   * Adds channel types to this select menu.
   *
   * @param types - The channel types to use
   */
  addChannelTypes(...types) {
    const normalizedTypes = normalizeArray(types);
    this.data.channel_types ??= [];
    this.data.channel_types.push(...channelTypesValidator.parse(normalizedTypes));
    return this;
  }
  /**
   * Sets channel types for this select menu.
   *
   * @param types - The channel types to use
   */
  setChannelTypes(...types) {
    const normalizedTypes = normalizeArray(types);
    this.data.channel_types ??= [];
    this.data.channel_types.splice(0, this.data.channel_types.length, ...channelTypesValidator.parse(normalizedTypes));
    return this;
  }
  /**
   * Adds default channels to this auto populated select menu.
   *
   * @param channels - The channels to add
   */
  addDefaultChannels(...channels) {
    const normalizedValues = normalizeArray(channels);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(
      ...normalizedValues.map((id) => ({
        id,
        type: SelectMenuDefaultValueType.Channel
      }))
    );
    return this;
  }
  /**
   * Sets default channels for this auto populated select menu.
   *
   * @param channels - The channels to set
   */
  setDefaultChannels(...channels) {
    const normalizedValues = normalizeArray(channels);
    optionsLengthValidator.parse(normalizedValues.length);
    this.data.default_values = normalizedValues.map((id) => ({
      id,
      type: SelectMenuDefaultValueType.Channel
    }));
    return this;
  }
  /**
   * {@inheritDoc BaseSelectMenuBuilder.toJSON}
   */
  toJSON() {
    customIdValidator.parse(this.data.custom_id);
    return {
      ...this.data
    };
  }
};

// src/components/selectMenu/MentionableSelectMenu.ts
import {
  ComponentType as ComponentType6,
  SelectMenuDefaultValueType as SelectMenuDefaultValueType2
} from "discord-api-types/v10";
var MentionableSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  static {
    __name(this, "MentionableSelectMenuBuilder");
  }
  /**
   * Creates a new select menu from API data.
   *
   * @param data - The API data to create this select menu with
   * @example
   * Creating a select menu from an API data object:
   * ```ts
   * const selectMenu = new MentionableSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * 	placeholder: 'select an option',
   * 	max_values: 2,
   * });
   * ```
   * @example
   * Creating a select menu using setters and API data:
   * ```ts
   * const selectMenu = new MentionableSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * })
   * 	.setMinValues(1);
   * ```
   */
  constructor(data) {
    super({ ...data, type: ComponentType6.MentionableSelect });
  }
  /**
   * Adds default roles to this auto populated select menu.
   *
   * @param roles - The roles to add
   */
  addDefaultRoles(...roles) {
    const normalizedValues = normalizeArray(roles);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(
      ...normalizedValues.map((id) => ({
        id,
        type: SelectMenuDefaultValueType2.Role
      }))
    );
    return this;
  }
  /**
   * Adds default users to this auto populated select menu.
   *
   * @param users - The users to add
   */
  addDefaultUsers(...users) {
    const normalizedValues = normalizeArray(users);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(
      ...normalizedValues.map((id) => ({
        id,
        type: SelectMenuDefaultValueType2.User
      }))
    );
    return this;
  }
  /**
   * Adds default values to this auto populated select menu.
   *
   * @param values - The values to add
   */
  addDefaultValues(...values) {
    const normalizedValues = normalizeArray(values);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(...normalizedValues);
    return this;
  }
  /**
   * Sets default values for this auto populated select menu.
   *
   * @param values - The values to set
   */
  setDefaultValues(...values) {
    const normalizedValues = normalizeArray(values);
    optionsLengthValidator.parse(normalizedValues.length);
    this.data.default_values = normalizedValues;
    return this;
  }
};

// src/components/selectMenu/RoleSelectMenu.ts
import {
  ComponentType as ComponentType7,
  SelectMenuDefaultValueType as SelectMenuDefaultValueType3
} from "discord-api-types/v10";
var RoleSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  static {
    __name(this, "RoleSelectMenuBuilder");
  }
  /**
   * Creates a new select menu from API data.
   *
   * @param data - The API data to create this select menu with
   * @example
   * Creating a select menu from an API data object:
   * ```ts
   * const selectMenu = new RoleSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * 	placeholder: 'select an option',
   * 	max_values: 2,
   * });
   * ```
   * @example
   * Creating a select menu using setters and API data:
   * ```ts
   * const selectMenu = new RoleSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * })
   * 	.setMinValues(1);
   * ```
   */
  constructor(data) {
    super({ ...data, type: ComponentType7.RoleSelect });
  }
  /**
   * Adds default roles to this auto populated select menu.
   *
   * @param roles - The roles to add
   */
  addDefaultRoles(...roles) {
    const normalizedValues = normalizeArray(roles);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(
      ...normalizedValues.map((id) => ({
        id,
        type: SelectMenuDefaultValueType3.Role
      }))
    );
    return this;
  }
  /**
   * Sets default roles for this auto populated select menu.
   *
   * @param roles - The roles to set
   */
  setDefaultRoles(...roles) {
    const normalizedValues = normalizeArray(roles);
    optionsLengthValidator.parse(normalizedValues.length);
    this.data.default_values = normalizedValues.map((id) => ({
      id,
      type: SelectMenuDefaultValueType3.Role
    }));
    return this;
  }
};

// src/components/selectMenu/StringSelectMenu.ts
import { ComponentType as ComponentType8 } from "discord-api-types/v10";
var StringSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  static {
    __name(this, "StringSelectMenuBuilder");
  }
  /**
   * The options within this select menu.
   */
  options;
  /**
   * Creates a new select menu from API data.
   *
   * @param data - The API data to create this select menu with
   * @example
   * Creating a select menu from an API data object:
   * ```ts
   * const selectMenu = new StringSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * 	placeholder: 'select an option',
   * 	max_values: 2,
   * 	options: [
   * 		{ label: 'option 1', value: '1' },
   * 		{ label: 'option 2', value: '2' },
   * 		{ label: 'option 3', value: '3' },
   * 	],
   * });
   * ```
   * @example
   * Creating a select menu using setters and API data:
   * ```ts
   * const selectMenu = new StringSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * })
   * 	.setMinValues(1)
   * 	.addOptions({
   * 		label: 'Catchy',
   * 		value: 'catch',
   * 	});
   * ```
   */
  constructor(data) {
    const { options, ...initData } = data ?? {};
    super({ ...initData, type: ComponentType8.StringSelect });
    this.options = options?.map((option) => new StringSelectMenuOptionBuilder(option)) ?? [];
  }
  /**
   * Adds options to this select menu.
   *
   * @param options - The options to add
   */
  addOptions(...options) {
    const normalizedOptions = normalizeArray(options);
    optionsLengthValidator.parse(this.options.length + normalizedOptions.length);
    this.options.push(
      ...normalizedOptions.map(
        (normalizedOption) => normalizedOption instanceof StringSelectMenuOptionBuilder ? normalizedOption : new StringSelectMenuOptionBuilder(jsonOptionValidator.parse(normalizedOption))
      )
    );
    return this;
  }
  /**
   * Sets the options for this select menu.
   *
   * @param options - The options to set
   */
  setOptions(...options) {
    return this.spliceOptions(0, this.options.length, ...options);
  }
  /**
   * Removes, replaces, or inserts options for this select menu.
   *
   * @remarks
   * This method behaves similarly
   * to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice | Array.prototype.splice()}.
   * It's useful for modifying and adjusting the order of existing options.
   * @example
   * Remove the first option:
   * ```ts
   * selectMenu.spliceOptions(0, 1);
   * ```
   * @example
   * Remove the first n option:
   * ```ts
   * const n = 4;
   * selectMenu.spliceOptions(0, n);
   * ```
   * @example
   * Remove the last option:
   * ```ts
   * selectMenu.spliceOptions(-1, 1);
   * ```
   * @param index - The index to start at
   * @param deleteCount - The number of options to remove
   * @param options - The replacing option objects or builders
   */
  spliceOptions(index, deleteCount, ...options) {
    const normalizedOptions = normalizeArray(options);
    const clone = [...this.options];
    clone.splice(
      index,
      deleteCount,
      ...normalizedOptions.map(
        (normalizedOption) => normalizedOption instanceof StringSelectMenuOptionBuilder ? normalizedOption : new StringSelectMenuOptionBuilder(jsonOptionValidator.parse(normalizedOption))
      )
    );
    optionsLengthValidator.parse(clone.length);
    this.options.splice(0, this.options.length, ...clone);
    return this;
  }
  /**
   * {@inheritDoc BaseSelectMenuBuilder.toJSON}
   */
  toJSON() {
    validateRequiredSelectMenuParameters(this.options, this.data.custom_id);
    return {
      ...this.data,
      options: this.options.map((option) => option.toJSON())
    };
  }
};

// src/components/selectMenu/UserSelectMenu.ts
import {
  ComponentType as ComponentType9,
  SelectMenuDefaultValueType as SelectMenuDefaultValueType4
} from "discord-api-types/v10";
var UserSelectMenuBuilder = class extends BaseSelectMenuBuilder {
  static {
    __name(this, "UserSelectMenuBuilder");
  }
  /**
   * Creates a new select menu from API data.
   *
   * @param data - The API data to create this select menu with
   * @example
   * Creating a select menu from an API data object:
   * ```ts
   * const selectMenu = new UserSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * 	placeholder: 'select an option',
   * 	max_values: 2,
   * });
   * ```
   * @example
   * Creating a select menu using setters and API data:
   * ```ts
   * const selectMenu = new UserSelectMenuBuilder({
   * 	custom_id: 'a cool select menu',
   * })
   * 	.setMinValues(1);
   * ```
   */
  constructor(data) {
    super({ ...data, type: ComponentType9.UserSelect });
  }
  /**
   * Adds default users to this auto populated select menu.
   *
   * @param users - The users to add
   */
  addDefaultUsers(...users) {
    const normalizedValues = normalizeArray(users);
    optionsLengthValidator.parse((this.data.default_values?.length ?? 0) + normalizedValues.length);
    this.data.default_values ??= [];
    this.data.default_values.push(
      ...normalizedValues.map((id) => ({
        id,
        type: SelectMenuDefaultValueType4.User
      }))
    );
    return this;
  }
  /**
   * Sets default users for this auto populated select menu.
   *
   * @param users - The users to set
   */
  setDefaultUsers(...users) {
    const normalizedValues = normalizeArray(users);
    optionsLengthValidator.parse(normalizedValues.length);
    this.data.default_values = normalizedValues.map((id) => ({
      id,
      type: SelectMenuDefaultValueType4.User
    }));
    return this;
  }
};

// src/components/textInput/TextInput.ts
import { isJSONEncodable } from "@discordjs/util";
import { ComponentType as ComponentType10 } from "discord-api-types/v10";
import isEqual from "fast-deep-equal";
var TextInputBuilder = class extends ComponentBuilder {
  static {
    __name(this, "TextInputBuilder");
  }
  /**
   * Creates a new text input from API data.
   *
   * @param data - The API data to create this text input with
   * @example
   * Creating a text input from an API data object:
   * ```ts
   * const textInput = new TextInputBuilder({
   * 	custom_id: 'a cool text input',
   * 	placeholder: 'Type something',
   * 	style: TextInputStyle.Short,
   * });
   * ```
   * @example
   * Creating a text input using setters and API data:
   * ```ts
   * const textInput = new TextInputBuilder({
   * 	placeholder: 'Type something else',
   * })
   * 	.setCustomId('woah')
   * 	.setStyle(TextInputStyle.Paragraph);
   * ```
   */
  constructor(data) {
    super({ type: ComponentType10.TextInput, ...data });
  }
  /**
   * Sets the custom id for this text input.
   *
   * @param customId - The custom id to use
   */
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  /**
   * Sets the label for this text input.
   *
   * @param label - The label to use
   * @deprecated Use a label builder to create a label (and optionally a description) instead.
   */
  setLabel(label) {
    this.data.label = labelValidator.parse(label);
    return this;
  }
  /**
   * Sets the style for this text input.
   *
   * @param style - The style to use
   */
  setStyle(style) {
    this.data.style = textInputStyleValidator.parse(style);
    return this;
  }
  /**
   * Sets the minimum length of text for this text input.
   *
   * @param minLength - The minimum length of text for this text input
   */
  setMinLength(minLength) {
    this.data.min_length = minLengthValidator.parse(minLength);
    return this;
  }
  /**
   * Sets the maximum length of text for this text input.
   *
   * @param maxLength - The maximum length of text for this text input
   */
  setMaxLength(maxLength) {
    this.data.max_length = maxLengthValidator.parse(maxLength);
    return this;
  }
  /**
   * Sets the placeholder for this text input.
   *
   * @param placeholder - The placeholder to use
   */
  setPlaceholder(placeholder) {
    this.data.placeholder = placeholderValidator2.parse(placeholder);
    return this;
  }
  /**
   * Sets the value for this text input.
   *
   * @param value - The value to use
   */
  setValue(value) {
    this.data.value = valueValidator.parse(value);
    return this;
  }
  /**
   * Sets whether this text input is required.
   *
   * @param required - Whether this text input is required
   */
  setRequired(required = true) {
    this.data.required = requiredValidator.parse(required);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    validateRequiredParameters(this.data.custom_id, this.data.style);
    return {
      ...this.data
    };
  }
  /**
   * Whether this is equal to another structure.
   */
  equals(other) {
    if (isJSONEncodable(other)) {
      return isEqual(other.toJSON(), this.data);
    }
    return isEqual(other, this.data);
  }
};

// src/components/label/Assertions.ts
var Assertions_exports5 = {};
__export(Assertions_exports5, {
  labelPredicate: () => labelPredicate
});
import { s as s6 } from "@sapphire/shapeshift";
import { ComponentType as ComponentType12 } from "discord-api-types/v10";

// src/components/selectMenu/Assertions.ts
import { Result, s as s5 } from "@sapphire/shapeshift";
import { ChannelType as ChannelType2, ComponentType as ComponentType11, SelectMenuDefaultValueType as SelectMenuDefaultValueType5 } from "discord-api-types/v10";
var selectMenuBasePredicate = s5.object({
  id: idValidator.optional(),
  placeholder: s5.string().lengthLessThanOrEqual(150).optional(),
  min_values: s5.number().greaterThanOrEqual(0).lessThanOrEqual(25).optional(),
  max_values: s5.number().greaterThanOrEqual(0).lessThanOrEqual(25).optional(),
  custom_id: customIdValidator,
  disabled: s5.boolean().optional()
});
var selectMenuChannelPredicate = selectMenuBasePredicate.extend({
  type: s5.literal(ComponentType11.ChannelSelect),
  channel_types: s5.nativeEnum(ChannelType2).array().optional(),
  default_values: s5.object({ id: s5.string(), type: s5.literal(SelectMenuDefaultValueType5.Channel) }).array().lengthLessThanOrEqual(25).optional()
}).setValidationEnabled(isValidationEnabled);
var selectMenuMentionablePredicate = selectMenuBasePredicate.extend({
  type: s5.literal(ComponentType11.MentionableSelect),
  default_values: s5.object({
    id: s5.string(),
    type: s5.union([s5.literal(SelectMenuDefaultValueType5.Role), s5.literal(SelectMenuDefaultValueType5.User)])
  }).array().lengthLessThanOrEqual(25).optional()
}).setValidationEnabled(isValidationEnabled);
var selectMenuRolePredicate = selectMenuBasePredicate.extend({
  type: s5.literal(ComponentType11.RoleSelect),
  default_values: s5.object({ id: s5.string(), type: s5.literal(SelectMenuDefaultValueType5.Role) }).array().lengthLessThanOrEqual(25).optional()
}).setValidationEnabled(isValidationEnabled);
var selectMenuUserPredicate = selectMenuBasePredicate.extend({
  type: s5.literal(ComponentType11.UserSelect),
  default_values: s5.object({ id: s5.string(), type: s5.literal(SelectMenuDefaultValueType5.User) }).array().lengthLessThanOrEqual(25).optional()
}).setValidationEnabled(isValidationEnabled);
var selectMenuStringOptionPredicate = s5.object({
  label: labelValidator,
  value: s5.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100),
  description: s5.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).optional(),
  emoji: emojiValidator.optional(),
  default: s5.boolean().optional()
}).setValidationEnabled(isValidationEnabled);
var selectMenuStringPredicate = selectMenuBasePredicate.extend({
  type: s5.literal(ComponentType11.StringSelect),
  options: selectMenuStringOptionPredicate.array().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(25)
}).reshape((value) => {
  if (value.min_values !== void 0 && value.options.length < value.min_values) {
    return Result.err(new RangeError(`The number of options must be greater than or equal to min_values`));
  }
  if (value.min_values !== void 0 && value.max_values !== void 0 && value.min_values > value.max_values) {
    return Result.err(
      new RangeError(`The maximum amount of options must be greater than or equal to the minimum amount of options`)
    );
  }
  return Result.ok(value);
}).setValidationEnabled(isValidationEnabled);

// src/components/label/Assertions.ts
var labelPredicate = s6.object({
  id: idValidator.optional(),
  type: s6.literal(ComponentType12.Label),
  label: s6.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(45),
  description: s6.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).optional(),
  component: s6.union([
    textInputPredicate,
    selectMenuUserPredicate,
    selectMenuRolePredicate,
    selectMenuMentionablePredicate,
    selectMenuChannelPredicate,
    selectMenuStringPredicate,
    fileUploadPredicate
  ])
}).setValidationEnabled(isValidationEnabled);

// src/components/label/Label.ts
var LabelBuilder = class extends ComponentBuilder {
  static {
    __name(this, "LabelBuilder");
  }
  /**
   * @internal
   */
  data;
  /**
   * Creates a new label.
   *
   * @param data - The API data to create this label with
   * @example
   * Creating a label from an API data object:
   * ```ts
   * const label = new LabelBuilder({
   * 	label: "label",
   * 	component,
   * });
   * ```
   * @example
   * Creating a label using setters and API data:
   * ```ts
   * const label = new LabelBuilder({
   * 	label: 'label',
   * 	component,
   * }).setLabel('new text');
   * ```
   */
  constructor(data = {}) {
    super({ type: ComponentType13.Label });
    const { component, ...rest } = data;
    this.data = {
      ...rest,
      component: component ? createComponentBuilder(component) : void 0,
      type: ComponentType13.Label
    };
  }
  /**
   * Sets the label for this label.
   *
   * @param label - The label to use
   */
  setLabel(label) {
    this.data.label = label;
    return this;
  }
  /**
   * Sets the description for this label.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    this.data.description = description;
    return this;
  }
  /**
   * Clears the description for this label.
   */
  clearDescription() {
    this.data.description = void 0;
    return this;
  }
  /**
   * Sets a string select menu component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setStringSelectMenuComponent(input) {
    this.data.component = resolveBuilder(input, StringSelectMenuBuilder);
    return this;
  }
  /**
   * Sets a user select menu component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setUserSelectMenuComponent(input) {
    this.data.component = resolveBuilder(input, UserSelectMenuBuilder);
    return this;
  }
  /**
   * Sets a role select menu component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setRoleSelectMenuComponent(input) {
    this.data.component = resolveBuilder(input, RoleSelectMenuBuilder);
    return this;
  }
  /**
   * Sets a mentionable select menu component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setMentionableSelectMenuComponent(input) {
    this.data.component = resolveBuilder(input, MentionableSelectMenuBuilder);
    return this;
  }
  /**
   * Sets a channel select menu component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setChannelSelectMenuComponent(input) {
    this.data.component = resolveBuilder(input, ChannelSelectMenuBuilder);
    return this;
  }
  /**
   * Sets a text input component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setTextInputComponent(input) {
    this.data.component = resolveBuilder(input, TextInputBuilder);
    return this;
  }
  /**
   * Sets a file upload component to this label.
   *
   * @param input - A function that returns a component builder or an already built builder
   */
  setFileUploadComponent(input) {
    this.data.component = resolveBuilder(input, FileUploadBuilder);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    const { component, ...rest } = this.data;
    const data = {
      ...rest,
      // The label predicate validates the component.
      component: component?.toJSON()
    };
    labelPredicate.parse(data);
    return data;
  }
};

// src/components/v2/Container.ts
import { ComponentType as ComponentType18 } from "discord-api-types/v10";

// src/components/v2/Assertions.ts
var Assertions_exports6 = {};
__export(Assertions_exports6, {
  accessoryPredicate: () => accessoryPredicate,
  assertReturnOfBuilder: () => assertReturnOfBuilder,
  containerColorPredicate: () => containerColorPredicate,
  descriptionPredicate: () => descriptionPredicate2,
  dividerPredicate: () => dividerPredicate,
  filePredicate: () => filePredicate,
  spacingPredicate: () => spacingPredicate,
  spoilerPredicate: () => spoilerPredicate,
  textDisplayContentPredicate: () => textDisplayContentPredicate,
  unfurledMediaItemPredicate: () => unfurledMediaItemPredicate,
  validateComponentArray: () => validateComponentArray
});
import { s as s7 } from "@sapphire/shapeshift";
import { SeparatorSpacingSize } from "discord-api-types/v10";

// src/components/v2/Thumbnail.ts
import { ComponentType as ComponentType14 } from "discord-api-types/v10";
var ThumbnailBuilder = class extends ComponentBuilder {
  static {
    __name(this, "ThumbnailBuilder");
  }
  /**
   * Creates a new thumbnail from API data.
   *
   * @param data - The API data to create this thumbnail with
   * @example
   * Creating a thumbnail from an API data object:
   * ```ts
   * const thumbnail = new ThumbnailBuilder({
   * 	description: 'some text',
   *  media: {
   *      url: 'https://cdn.discordapp.com/embed/avatars/4.png',
   *  },
   * });
   * ```
   * @example
   * Creating a thumbnail using setters and API data:
   * ```ts
   * const thumbnail = new ThumbnailBuilder({
   * 	media: {
   *      url: 'attachment://image.png',
   *  },
   * })
   * 	.setDescription('alt text');
   * ```
   */
  constructor(data = {}) {
    super({
      type: ComponentType14.Thumbnail,
      ...data,
      media: data.media ? { url: data.media.url } : void 0
    });
  }
  /**
   * Sets the description of this thumbnail.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    this.data.description = descriptionPredicate2.parse(description);
    return this;
  }
  /**
   * Clears the description of this thumbnail.
   */
  clearDescription() {
    this.data.description = void 0;
    return this;
  }
  /**
   * Sets the spoiler status of this thumbnail.
   *
   * @param spoiler - The spoiler status to use
   */
  setSpoiler(spoiler = true) {
    this.data.spoiler = spoilerPredicate.parse(spoiler);
    return this;
  }
  /**
   * Sets the media URL of this thumbnail.
   *
   * @param url - The URL to use
   */
  setURL(url) {
    this.data.media = unfurledMediaItemPredicate.parse({ url });
    return this;
  }
  /**
   * {@inheritdoc ComponentBuilder.toJSON}
   */
  toJSON() {
    unfurledMediaItemPredicate.parse(this.data.media);
    return { ...this.data };
  }
};

// src/components/v2/Assertions.ts
var unfurledMediaItemPredicate = s7.object({
  url: s7.string().url(
    { allowedProtocols: ["http:", "https:", "attachment:"] },
    { message: "Invalid protocol for media URL. Must be http:, https:, or attachment:" }
  )
}).setValidationEnabled(isValidationEnabled);
var descriptionPredicate2 = s7.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(1024).setValidationEnabled(isValidationEnabled);
var filePredicate = s7.object({
  url: s7.string().url({ allowedProtocols: ["attachment:"] }, { message: "Invalid protocol for file URL. Must be attachment:" })
}).setValidationEnabled(isValidationEnabled);
var spoilerPredicate = s7.boolean();
var dividerPredicate = s7.boolean();
var spacingPredicate = s7.nativeEnum(SeparatorSpacingSize);
var textDisplayContentPredicate = s7.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(4e3).setValidationEnabled(isValidationEnabled);
var accessoryPredicate = s7.instance(ButtonBuilder).or(s7.instance(ThumbnailBuilder)).setValidationEnabled(isValidationEnabled);
var containerColorPredicate = colorPredicate.nullish();
function assertReturnOfBuilder(input, ExpectedInstanceOf) {
  s7.instance(ExpectedInstanceOf).setValidationEnabled(isValidationEnabled).parse(input);
}
__name(assertReturnOfBuilder, "assertReturnOfBuilder");
function validateComponentArray(input, min, max, ExpectedInstanceOf) {
  (ExpectedInstanceOf ? s7.instance(ExpectedInstanceOf) : s7.instance(ComponentBuilder)).array().lengthGreaterThanOrEqual(min).lengthLessThanOrEqual(max).setValidationEnabled(isValidationEnabled).parse(input);
}
__name(validateComponentArray, "validateComponentArray");

// src/components/v2/File.ts
import { ComponentType as ComponentType15 } from "discord-api-types/v10";
var FileBuilder = class extends ComponentBuilder {
  static {
    __name(this, "FileBuilder");
  }
  /**
   * Creates a new file from API data.
   *
   * @param data - The API data to create this file with
   * @example
   * Creating a file from an API data object:
   * ```ts
   * const file = new FileBuilder({
   * 	spoiler: true,
   * 	file: {
   * 		url: 'attachment://file.png',
   * 	},
   * });
   * ```
   * @example
   * Creating a file using setters and API data:
   * ```ts
   * const file = new FileBuilder({
   * 	file: {
   * 		url: 'attachment://image.jpg',
   * 	},
   * })
   * 	.setSpoiler(false);
   * ```
   */
  constructor(data = {}) {
    super({ type: ComponentType15.File, ...data, file: data.file ? { url: data.file.url } : void 0 });
  }
  /**
   * Sets the spoiler status of this file.
   *
   * @param spoiler - The spoiler status to use
   */
  setSpoiler(spoiler = true) {
    this.data.spoiler = spoilerPredicate.parse(spoiler);
    return this;
  }
  /**
   * Sets the media URL of this file.
   *
   * @param url - The URL to use
   */
  setURL(url) {
    this.data.file = filePredicate.parse({ url });
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    filePredicate.parse(this.data.file);
    return { ...this.data, file: { ...this.data.file } };
  }
};

// src/components/v2/Separator.ts
import { ComponentType as ComponentType16 } from "discord-api-types/v10";
var SeparatorBuilder = class extends ComponentBuilder {
  static {
    __name(this, "SeparatorBuilder");
  }
  /**
   * Creates a new separator from API data.
   *
   * @param data - The API data to create this separator with
   * @example
   * Creating a separator from an API data object:
   * ```ts
   * const separator = new SeparatorBuilder({
   * 	spacing: SeparatorSpacingSize.Small,
   *  divider: true,
   * });
   * ```
   * @example
   * Creating a separator using setters and API data:
   * ```ts
   * const separator = new SeparatorBuilder({
   * 	spacing: SeparatorSpacingSize.Large,
   * })
   * 	.setDivider(false);
   * ```
   */
  constructor(data = {}) {
    super({
      type: ComponentType16.Separator,
      ...data
    });
  }
  /**
   * Sets whether this separator should show a divider line.
   *
   * @param divider - Whether to show a divider line
   */
  setDivider(divider = true) {
    this.data.divider = dividerPredicate.parse(divider);
    return this;
  }
  /**
   * Sets the spacing of this separator.
   *
   * @param spacing - The spacing to use
   */
  setSpacing(spacing) {
    this.data.spacing = spacingPredicate.parse(spacing);
    return this;
  }
  /**
   * Clears the spacing of this separator.
   */
  clearSpacing() {
    this.data.spacing = void 0;
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    return { ...this.data };
  }
};

// src/components/v2/TextDisplay.ts
import { ComponentType as ComponentType17 } from "discord-api-types/v10";
var TextDisplayBuilder = class extends ComponentBuilder {
  static {
    __name(this, "TextDisplayBuilder");
  }
  /**
   * Creates a new text display from API data.
   *
   * @param data - The API data to create this text display with
   * @example
   * Creating a text display from an API data object:
   * ```ts
   * const textDisplay = new TextDisplayBuilder({
   * 	content: 'some text',
   * });
   * ```
   * @example
   * Creating a text display using setters and API data:
   * ```ts
   * const textDisplay = new TextDisplayBuilder({
   * 	content: 'old text',
   * })
   * 	.setContent('new text');
   * ```
   */
  constructor(data = {}) {
    super({
      type: ComponentType17.TextDisplay,
      ...data
    });
  }
  /**
   * Sets the text of this text display.
   *
   * @param content - The text to use
   */
  setContent(content) {
    this.data.content = textDisplayContentPredicate.parse(content);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    textDisplayContentPredicate.parse(this.data.content);
    return { ...this.data };
  }
};

// src/components/v2/Container.ts
var ContainerBuilder = class extends ComponentBuilder {
  static {
    __name(this, "ContainerBuilder");
  }
  /**
   * The components within this container.
   */
  components;
  /**
   * Creates a new container from API data.
   *
   * @param data - The API data to create this container with
   * @example
   * Creating a container from an API data object:
   * ```ts
   * const container = new ContainerBuilder({
   * 	components: [
   * 		{
   * 			content: "Some text here",
   * 			type: ComponentType.TextDisplay,
   * 		},
   * 	],
   * });
   * ```
   * @example
   * Creating a container using setters and API data:
   * ```ts
   * const container = new ContainerBuilder({
   * 	components: [
   * 		{
   * 			content: "# Heading",
   * 			type: ComponentType.TextDisplay,
   * 		},
   * 	],
   * })
   * 	.addComponents(separator, section);
   * ```
   */
  constructor({ components, ...data } = {}) {
    super({ type: ComponentType18.Container, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  /**
   * Sets the accent color of this container.
   *
   * @param color - The color to use
   */
  setAccentColor(color) {
    containerColorPredicate.parse(color);
    if (Array.isArray(color)) {
      const [red, green, blue] = color;
      this.data.accent_color = (red << 16) + (green << 8) + blue;
      return this;
    }
    this.data.accent_color = color;
    return this;
  }
  /**
   * Clears the accent color of this container.
   */
  clearAccentColor() {
    this.data.accent_color = void 0;
    return this;
  }
  /**
   * Adds action row components to this container.
   *
   * @param components - The action row components to add
   */
  addActionRowComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map((component) => resolveBuilder(component, ActionRowBuilder))
    );
    return this;
  }
  /**
   * Adds file components to this container.
   *
   * @param components - The file components to add
   */
  addFileComponents(...components) {
    this.components.push(...normalizeArray(components).map((component) => resolveBuilder(component, FileBuilder)));
    return this;
  }
  /**
   * Adds media gallery components to this container.
   *
   * @param components - The media gallery components to add
   */
  addMediaGalleryComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map((component) => resolveBuilder(component, MediaGalleryBuilder))
    );
    return this;
  }
  /**
   * Adds section components to this container.
   *
   * @param components - The section components to add
   */
  addSectionComponents(...components) {
    this.components.push(...normalizeArray(components).map((component) => resolveBuilder(component, SectionBuilder)));
    return this;
  }
  /**
   * Adds separator components to this container.
   *
   * @param components - The separator components to add
   */
  addSeparatorComponents(...components) {
    this.components.push(...normalizeArray(components).map((component) => resolveBuilder(component, SeparatorBuilder)));
    return this;
  }
  /**
   * Adds text display components to this container.
   *
   * @param components - The text display components to add
   */
  addTextDisplayComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map((component) => resolveBuilder(component, TextDisplayBuilder))
    );
    return this;
  }
  /**
   * Removes, replaces, or inserts components for this container.
   *
   * @param index - The index to start removing, replacing or inserting components
   * @param deleteCount - The amount of components to remove
   * @param components - The components to set
   */
  spliceComponents(index, deleteCount, ...components) {
    this.components.splice(
      index,
      deleteCount,
      ...normalizeArray(components).map(
        (component) => component instanceof ComponentBuilder ? component : createComponentBuilder(component)
      )
    );
    return this;
  }
  /**
   * Sets the spoiler status of this container.
   *
   * @param spoiler - The spoiler status to use
   */
  setSpoiler(spoiler = true) {
    this.data.spoiler = spoilerPredicate.parse(spoiler);
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON())
    };
  }
};

// src/components/v2/MediaGallery.ts
import { ComponentType as ComponentType19 } from "discord-api-types/v10";

// src/components/v2/MediaGalleryItem.ts
var MediaGalleryItemBuilder = class {
  static {
    __name(this, "MediaGalleryItemBuilder");
  }
  /**
   * The API data associated with this media gallery item.
   */
  data;
  /**
   * Creates a new media gallery item from API data.
   *
   * @param data - The API data to create this media gallery item with
   * @example
   * Creating a media gallery item from an API data object:
   * ```ts
   * const item = new MediaGalleryItemBuilder({
   * 	description: "Some text here",
   * 	media: {
   * 		url: 'https://cdn.discordapp.com/embed/avatars/2.png',
   * 	},
   * });
   * ```
   * @example
   * Creating a media gallery item using setters and API data:
   * ```ts
   * const item = new MediaGalleryItemBuilder({
   * 	media: {
   * 		url: 'https://cdn.discordapp.com/embed/avatars/5.png',
   * 	},
   * })
   * 	.setDescription("alt text");
   * ```
   */
  constructor(data = {}) {
    this.data = data;
  }
  /**
   * Sets the description of this media gallery item.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    this.data.description = descriptionPredicate2.parse(description);
    return this;
  }
  /**
   * Clears the description of this media gallery item.
   */
  clearDescription() {
    this.data.description = void 0;
    return this;
  }
  /**
   * Sets the spoiler status of this media gallery item.
   *
   * @param spoiler - The spoiler status to use
   */
  setSpoiler(spoiler = true) {
    this.data.spoiler = spoilerPredicate.parse(spoiler);
    return this;
  }
  /**
   * Sets the media URL of this media gallery item.
   *
   * @param url - The URL to use
   */
  setURL(url) {
    this.data.media = unfurledMediaItemPredicate.parse({ url });
    return this;
  }
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    unfurledMediaItemPredicate.parse(this.data.media);
    return { ...this.data };
  }
};

// src/components/v2/MediaGallery.ts
var MediaGalleryBuilder = class extends ComponentBuilder {
  static {
    __name(this, "MediaGalleryBuilder");
  }
  /**
   * The components within this container.
   */
  items;
  /**
   * Creates a new media gallery from API data.
   *
   * @param data - The API data to create this media gallery with
   * @example
   * Creating a media gallery from an API data object:
   * ```ts
   * const mediaGallery = new MediaGalleryBuilder({
   * 	items: [
   * 		{
   * 			description: "Some text here",
   * 			media: {
   * 				url: 'https://cdn.discordapp.com/embed/avatars/2.png',
   * 			},
   * 		},
   * 	],
   * });
   * ```
   * @example
   * Creating a media gallery using setters and API data:
   * ```ts
   * const mediaGallery = new MediaGalleryBuilder({
   * 	items: [
   * 		{
   * 			description: "alt text",
   * 			media: {
   * 				url: 'https://cdn.discordapp.com/embed/avatars/5.png',
   * 			},
   * 		},
   * 	],
   * })
   * 	.addItems(item2, item3);
   * ```
   */
  constructor({ items, ...data } = {}) {
    super({ type: ComponentType19.MediaGallery, ...data });
    this.items = items?.map((item) => new MediaGalleryItemBuilder(item)) ?? [];
  }
  /**
   * Adds items to this media gallery.
   *
   * @param items - The items to add
   */
  addItems(...items) {
    this.items.push(
      ...normalizeArray(items).map((input) => {
        const result = resolveBuilder(input, MediaGalleryItemBuilder);
        assertReturnOfBuilder(result, MediaGalleryItemBuilder);
        return result;
      })
    );
    return this;
  }
  /**
   * Removes, replaces, or inserts media gallery items for this media gallery.
   *
   * @param index - The index to start removing, replacing or inserting items
   * @param deleteCount - The amount of items to remove
   * @param items - The items to insert
   */
  spliceItems(index, deleteCount, ...items) {
    this.items.splice(
      index,
      deleteCount,
      ...normalizeArray(items).map((input) => {
        const result = resolveBuilder(input, MediaGalleryItemBuilder);
        assertReturnOfBuilder(result, MediaGalleryItemBuilder);
        return result;
      })
    );
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    validateComponentArray(this.items, 1, 10, MediaGalleryItemBuilder);
    return {
      ...this.data,
      items: this.items.map((item) => item.toJSON())
    };
  }
};

// src/components/v2/Section.ts
import { ComponentType as ComponentType20 } from "discord-api-types/v10";
var SectionBuilder = class extends ComponentBuilder {
  static {
    __name(this, "SectionBuilder");
  }
  /**
   * The components within this section.
   */
  components;
  /**
   * The accessory of this section.
   */
  accessory;
  /**
   * Creates a new section from API data.
   *
   * @param data - The API data to create this section with
   * @example
   * Creating a section from an API data object:
   * ```ts
   * const section = new SectionBuilder({
   * 	components: [
   * 		{
   * 			content: "Some text here",
   * 			type: ComponentType.TextDisplay,
   * 		},
   * 	],
   *  accessory: {
   *      media: {
   *          url: 'https://cdn.discordapp.com/embed/avatars/3.png',
   *      },
   *  }
   * });
   * ```
   * @example
   * Creating a section using setters and API data:
   * ```ts
   * const section = new SectionBuilder({
   * 	components: [
   * 		{
   * 			content: "# Heading",
   * 			type: ComponentType.TextDisplay,
   * 		},
   * 	],
   * })
   * 	.setPrimaryButtonAccessory(button);
   * ```
   */
  constructor({ components, accessory, ...data } = {}) {
    super({ type: ComponentType20.Section, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
    this.accessory = accessory ? createComponentBuilder(accessory) : void 0;
  }
  /**
   * Sets the accessory of this section to a button.
   *
   * @param accessory - The accessory to use
   */
  setButtonAccessory(accessory) {
    Reflect.set(this, "accessory", accessoryPredicate.parse(resolveBuilder(accessory, ButtonBuilder)));
    return this;
  }
  /**
   * Sets the accessory of this section to a thumbnail.
   *
   * @param accessory - The accessory to use
   */
  setThumbnailAccessory(accessory) {
    Reflect.set(this, "accessory", accessoryPredicate.parse(resolveBuilder(accessory, ThumbnailBuilder)));
    return this;
  }
  /**
   * Adds text display components to this section.
   *
   * @param components - The text display components to add
   */
  addTextDisplayComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map((input) => {
        const result = resolveBuilder(input, TextDisplayBuilder);
        assertReturnOfBuilder(result, TextDisplayBuilder);
        return result;
      })
    );
    return this;
  }
  /**
   * Removes, replaces, or inserts text display components for this section.
   *
   * @param index - The index to start removing, replacing or inserting text display components
   * @param deleteCount - The amount of text display components to remove
   * @param components - The text display components to insert
   */
  spliceTextDisplayComponents(index, deleteCount, ...components) {
    this.components.splice(
      index,
      deleteCount,
      ...normalizeArray(components).map((input) => {
        const result = resolveBuilder(input, TextDisplayBuilder);
        assertReturnOfBuilder(result, TextDisplayBuilder);
        return result;
      })
    );
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    validateComponentArray(this.components, 1, 3, TextDisplayBuilder);
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON()),
      accessory: accessoryPredicate.parse(this.accessory).toJSON()
    };
  }
};

// src/components/Components.ts
function createComponentBuilder(data) {
  if (data instanceof ComponentBuilder) {
    return data;
  }
  switch (data.type) {
    case ComponentType21.ActionRow:
      return new ActionRowBuilder(data);
    case ComponentType21.Button:
      return new ButtonBuilder(data);
    case ComponentType21.StringSelect:
      return new StringSelectMenuBuilder(data);
    case ComponentType21.TextInput:
      return new TextInputBuilder(data);
    case ComponentType21.UserSelect:
      return new UserSelectMenuBuilder(data);
    case ComponentType21.RoleSelect:
      return new RoleSelectMenuBuilder(data);
    case ComponentType21.MentionableSelect:
      return new MentionableSelectMenuBuilder(data);
    case ComponentType21.ChannelSelect:
      return new ChannelSelectMenuBuilder(data);
    case ComponentType21.File:
      return new FileBuilder(data);
    case ComponentType21.Container:
      return new ContainerBuilder(data);
    case ComponentType21.Section:
      return new SectionBuilder(data);
    case ComponentType21.Separator:
      return new SeparatorBuilder(data);
    case ComponentType21.TextDisplay:
      return new TextDisplayBuilder(data);
    case ComponentType21.Thumbnail:
      return new ThumbnailBuilder(data);
    case ComponentType21.MediaGallery:
      return new MediaGalleryBuilder(data);
    case ComponentType21.Label:
      return new LabelBuilder(data);
    case ComponentType21.FileUpload:
      return new FileUploadBuilder(data);
    default:
      throw new Error(`Cannot properly serialize component type: ${data.type}`);
  }
}
__name(createComponentBuilder, "createComponentBuilder");
function isBuilder(builder, Constructor) {
  return builder instanceof Constructor;
}
__name(isBuilder, "isBuilder");
function resolveBuilder(builder, Constructor) {
  if (isBuilder(builder, Constructor)) {
    return builder;
  }
  if (typeof builder === "function") {
    return builder(new Constructor());
  }
  return new Constructor(builder);
}
__name(resolveBuilder, "resolveBuilder");

// src/components/ActionRow.ts
var ActionRowBuilder = class extends ComponentBuilder {
  static {
    __name(this, "ActionRowBuilder");
  }
  /**
   * The components within this action row.
   */
  components;
  /**
   * Creates a new action row from API data.
   *
   * @param data - The API data to create this action row with
   * @example
   * Creating an action row from an API data object:
   * ```ts
   * const actionRow = new ActionRowBuilder({
   * 	components: [
   * 		{
   * 			custom_id: "custom id",
   * 			label: "Type something",
   * 			style: TextInputStyle.Short,
   * 			type: ComponentType.TextInput,
   * 		},
   * 	],
   * });
   * ```
   * @example
   * Creating an action row using setters and API data:
   * ```ts
   * const actionRow = new ActionRowBuilder({
   * 	components: [
   * 		{
   * 			custom_id: "custom id",
   * 			label: "Click me",
   * 			style: ButtonStyle.Primary,
   * 			type: ComponentType.Button,
   * 		},
   * 	],
   * })
   * 	.addComponents(button2, button3);
   * ```
   */
  constructor({ components, ...data } = {}) {
    super({ type: ComponentType22.ActionRow, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  /**
   * Adds components to this action row.
   *
   * @param components - The components to add
   */
  addComponents(...components) {
    this.components.push(...normalizeArray(components));
    return this;
  }
  /**
   * Sets components for this action row.
   *
   * @param components - The components to set
   */
  setComponents(...components) {
    this.components.splice(0, this.components.length, ...normalizeArray(components));
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON())
    };
  }
};

// src/interactions/modals/Modal.ts
import { ComponentType as ComponentType23 } from "discord-api-types/v10";

// src/interactions/modals/Assertions.ts
var Assertions_exports7 = {};
__export(Assertions_exports7, {
  componentsValidator: () => componentsValidator,
  titleValidator: () => titleValidator,
  validateRequiredParameters: () => validateRequiredParameters2
});
import { s as s8 } from "@sapphire/shapeshift";
var titleValidator = s8.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(45).setValidationEnabled(isValidationEnabled);
var componentsValidator = s8.union([s8.instance(ActionRowBuilder), s8.instance(LabelBuilder), s8.instance(TextDisplayBuilder)]).array().lengthGreaterThanOrEqual(1).setValidationEnabled(isValidationEnabled);
function validateRequiredParameters2(customId, title, components) {
  customIdValidator.parse(customId);
  titleValidator.parse(title);
  componentsValidator.parse(components);
}
__name(validateRequiredParameters2, "validateRequiredParameters");

// src/interactions/modals/Modal.ts
var ModalBuilder = class {
  static {
    __name(this, "ModalBuilder");
  }
  /**
   * The API data associated with this modal.
   */
  data;
  /**
   * The components within this modal.
   */
  components = [];
  /**
   * Creates a new modal from API data.
   *
   * @param data - The API data to create this modal with
   */
  constructor({ components, ...data } = {}) {
    this.data = { ...data };
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  /**
   * Sets the title of this modal.
   *
   * @param title - The title to use
   */
  setTitle(title) {
    this.data.title = titleValidator.parse(title);
    return this;
  }
  /**
   * Sets the custom id of this modal.
   *
   * @param customId - The custom id to use
   */
  setCustomId(customId) {
    this.data.custom_id = customIdValidator.parse(customId);
    return this;
  }
  /**
   * Adds components to this modal.
   *
   * @param components - The components to add
   * @deprecated Use {@link ModalBuilder.addLabelComponents} or {@link ModalBuilder.addTextDisplayComponents} instead
   */
  addComponents(...components) {
    this.components.push(
      ...normalizeArray(components).map((component, idx) => {
        if (component instanceof ActionRowBuilder || component instanceof LabelBuilder || component instanceof TextDisplayBuilder) {
          return component;
        }
        if (component instanceof TextInputBuilder) {
          return new ActionRowBuilder().addComponents(component);
        }
        if ("type" in component) {
          if (component.type === ComponentType23.ActionRow) {
            return new ActionRowBuilder(component);
          }
          if (component.type === ComponentType23.Label) {
            return new LabelBuilder(component);
          }
          if (component.type === ComponentType23.TextDisplay) {
            return new TextDisplayBuilder(component);
          }
          if (component.type === ComponentType23.TextInput) {
            return new ActionRowBuilder().addComponents(
              new TextInputBuilder(component)
            );
          }
        }
        throw new TypeError(`Invalid component passed in ModalBuilder.addComponents at index ${idx}!`);
      })
    );
    return this;
  }
  /**
   * Adds label components to this modal.
   *
   * @param components - The components to add
   */
  addLabelComponents(...components) {
    const normalized = normalizeArray(components);
    const resolved = normalized.map((label) => resolveBuilder(label, LabelBuilder));
    this.components.push(...resolved);
    return this;
  }
  /**
   * Adds text display components to this modal.
   *
   * @param components - The components to add
   */
  addTextDisplayComponents(...components) {
    const normalized = normalizeArray(components);
    const resolved = normalized.map((row) => resolveBuilder(row, TextDisplayBuilder));
    this.components.push(...resolved);
    return this;
  }
  /**
   * Adds action rows to this modal.
   *
   * @param components - The components to add
   * @deprecated Use {@link ModalBuilder.addLabelComponents} instead
   */
  addActionRowComponents(...components) {
    const normalized = normalizeArray(components);
    const resolved = normalized.map((row) => resolveBuilder(row, ActionRowBuilder));
    this.components.push(...resolved);
    return this;
  }
  /**
   * Sets the labels for this modal.
   *
   * @param components - The components to set
   */
  setLabelComponents(...components) {
    const normalized = normalizeArray(components);
    this.spliceLabelComponents(0, this.components.length, ...normalized);
    return this;
  }
  /**
   * Removes, replaces, or inserts labels for this modal.
   *
   * @remarks
   * This method behaves similarly
   * to {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/splice | Array.prototype.splice()}.
   * The maximum amount of labels that can be added is 5.
   *
   * It's useful for modifying and adjusting order of the already-existing labels of a modal.
   * @example
   * Remove the first label:
   * ```ts
   * modal.spliceLabelComponents(0, 1);
   * ```
   * @example
   * Remove the first n labels:
   * ```ts
   * const n = 4;
   * modal.spliceLabelComponents(0, n);
   * ```
   * @example
   * Remove the last label:
   * ```ts
   * modal.spliceLabelComponents(-1, 1);
   * ```
   * @param index - The index to start at
   * @param deleteCount - The number of labels to remove
   * @param labels - The replacing label objects
   */
  spliceLabelComponents(index, deleteCount, ...labels) {
    const resolved = labels.map((label) => resolveBuilder(label, LabelBuilder));
    this.components.splice(index, deleteCount, ...resolved);
    return this;
  }
  /**
   * Sets components for this modal.
   *
   * @param components - The components to set
   * @deprecated Use {@link ModalBuilder.setLabelComponents} instead
   */
  setComponents(...components) {
    this.components.splice(0, this.components.length, ...normalizeArray(components));
    return this;
  }
  /**
   * {@inheritDoc ComponentBuilder.toJSON}
   */
  toJSON() {
    validateRequiredParameters2(this.data.custom_id, this.data.title, this.components);
    return {
      ...this.data,
      components: this.components.map((component) => component.toJSON())
    };
  }
};

// src/interactions/slashCommands/Assertions.ts
var Assertions_exports8 = {};
__export(Assertions_exports8, {
  assertReturnOfBuilder: () => assertReturnOfBuilder2,
  contextsPredicate: () => contextsPredicate,
  integrationTypesPredicate: () => integrationTypesPredicate,
  localizationMapPredicate: () => localizationMapPredicate,
  validateChoicesLength: () => validateChoicesLength,
  validateDMPermission: () => validateDMPermission,
  validateDefaultMemberPermissions: () => validateDefaultMemberPermissions,
  validateDefaultPermission: () => validateDefaultPermission,
  validateDescription: () => validateDescription,
  validateLocale: () => validateLocale,
  validateLocalizationMap: () => validateLocalizationMap,
  validateMaxOptionsLength: () => validateMaxOptionsLength,
  validateNSFW: () => validateNSFW,
  validateName: () => validateName,
  validateRequired: () => validateRequired,
  validateRequiredParameters: () => validateRequiredParameters3
});
import { s as s9 } from "@sapphire/shapeshift";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  Locale
} from "discord-api-types/v10";
var namePredicate = s9.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u).setValidationEnabled(isValidationEnabled);
function validateName(name) {
  namePredicate.parse(name);
}
__name(validateName, "validateName");
var descriptionPredicate3 = s9.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100).setValidationEnabled(isValidationEnabled);
var localePredicate = s9.nativeEnum(Locale);
function validateDescription(description) {
  descriptionPredicate3.parse(description);
}
__name(validateDescription, "validateDescription");
var maxArrayLengthPredicate = s9.unknown().array().lengthLessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateLocale(locale) {
  return localePredicate.parse(locale);
}
__name(validateLocale, "validateLocale");
function validateMaxOptionsLength(options) {
  maxArrayLengthPredicate.parse(options);
}
__name(validateMaxOptionsLength, "validateMaxOptionsLength");
function validateRequiredParameters3(name, description, options) {
  validateName(name);
  validateDescription(description);
  validateMaxOptionsLength(options);
}
__name(validateRequiredParameters3, "validateRequiredParameters");
var booleanPredicate = s9.boolean();
function validateDefaultPermission(value) {
  booleanPredicate.parse(value);
}
__name(validateDefaultPermission, "validateDefaultPermission");
function validateRequired(required) {
  booleanPredicate.parse(required);
}
__name(validateRequired, "validateRequired");
var choicesLengthPredicate = s9.number().lessThanOrEqual(25).setValidationEnabled(isValidationEnabled);
function validateChoicesLength(amountAdding, choices) {
  choicesLengthPredicate.parse((choices?.length ?? 0) + amountAdding);
}
__name(validateChoicesLength, "validateChoicesLength");
function assertReturnOfBuilder2(input, ExpectedInstanceOf) {
  s9.instance(ExpectedInstanceOf).parse(input);
}
__name(assertReturnOfBuilder2, "assertReturnOfBuilder");
var localizationMapPredicate = s9.object(Object.fromEntries(Object.values(Locale).map((locale) => [locale, s9.string().nullish()]))).strict().nullish().setValidationEnabled(isValidationEnabled);
function validateLocalizationMap(value) {
  localizationMapPredicate.parse(value);
}
__name(validateLocalizationMap, "validateLocalizationMap");
var dmPermissionPredicate = s9.boolean().nullish();
function validateDMPermission(value) {
  dmPermissionPredicate.parse(value);
}
__name(validateDMPermission, "validateDMPermission");
var memberPermissionPredicate = s9.union([
  s9.bigint().transform((value) => value.toString()),
  s9.number().safeInt().transform((value) => value.toString()),
  s9.string().regex(/^\d+$/)
]).nullish();
function validateDefaultMemberPermissions(permissions) {
  return memberPermissionPredicate.parse(permissions);
}
__name(validateDefaultMemberPermissions, "validateDefaultMemberPermissions");
function validateNSFW(value) {
  booleanPredicate.parse(value);
}
__name(validateNSFW, "validateNSFW");
var contextsPredicate = s9.array(
  s9.nativeEnum(InteractionContextType).setValidationEnabled(isValidationEnabled)
);
var integrationTypesPredicate = s9.array(
  s9.nativeEnum(ApplicationIntegrationType).setValidationEnabled(isValidationEnabled)
);

// src/interactions/slashCommands/SlashCommandBuilder.ts
import { mix as mix6 } from "ts-mixer";

// src/interactions/slashCommands/mixins/NameAndDescription.ts
var SharedNameAndDescription = class {
  static {
    __name(this, "SharedNameAndDescription");
  }
  /**
   * The name of this command.
   */
  name;
  /**
   * The name localizations of this command.
   */
  name_localizations;
  /**
   * The description of this command.
   */
  description;
  /**
   * The description localizations of this command.
   */
  description_localizations;
  /**
   * Sets the name of this command.
   *
   * @param name - The name to use
   */
  setName(name) {
    validateName(name);
    Reflect.set(this, "name", name);
    return this;
  }
  /**
   * Sets the description of this command.
   *
   * @param description - The description to use
   */
  setDescription(description) {
    validateDescription(description);
    Reflect.set(this, "description", description);
    return this;
  }
  /**
   * Sets a name localization for this command.
   *
   * @param locale - The locale to set
   * @param localizedName - The localized name for the given `locale`
   */
  setNameLocalization(locale, localizedName) {
    if (!this.name_localizations) {
      Reflect.set(this, "name_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedName === null) {
      this.name_localizations[parsedLocale] = null;
      return this;
    }
    validateName(localizedName);
    this.name_localizations[parsedLocale] = localizedName;
    return this;
  }
  /**
   * Sets the name localizations for this command.
   *
   * @param localizedNames - The object of localized names to set
   */
  setNameLocalizations(localizedNames) {
    if (localizedNames === null) {
      Reflect.set(this, "name_localizations", null);
      return this;
    }
    Reflect.set(this, "name_localizations", {});
    for (const args of Object.entries(localizedNames)) {
      this.setNameLocalization(...args);
    }
    return this;
  }
  /**
   * Sets a description localization for this command.
   *
   * @param locale - The locale to set
   * @param localizedDescription - The localized description for the given locale
   */
  setDescriptionLocalization(locale, localizedDescription) {
    if (!this.description_localizations) {
      Reflect.set(this, "description_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedDescription === null) {
      this.description_localizations[parsedLocale] = null;
      return this;
    }
    validateDescription(localizedDescription);
    this.description_localizations[parsedLocale] = localizedDescription;
    return this;
  }
  /**
   * Sets the description localizations for this command.
   *
   * @param localizedDescriptions - The object of localized descriptions to set
   */
  setDescriptionLocalizations(localizedDescriptions) {
    if (localizedDescriptions === null) {
      Reflect.set(this, "description_localizations", null);
      return this;
    }
    Reflect.set(this, "description_localizations", {});
    for (const args of Object.entries(localizedDescriptions)) {
      this.setDescriptionLocalization(...args);
    }
    return this;
  }
};

// src/interactions/slashCommands/mixins/SharedSlashCommand.ts
import {
  ApplicationCommandType
} from "discord-api-types/v10";
var SharedSlashCommand = class {
  static {
    __name(this, "SharedSlashCommand");
  }
  name = void 0;
  name_localizations;
  description = void 0;
  description_localizations;
  options = [];
  contexts;
  /**
   * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
   */
  default_permission = void 0;
  default_member_permissions = void 0;
  /**
   * @deprecated Use {@link SharedSlashCommand.contexts} instead.
   */
  dm_permission = void 0;
  integration_types;
  nsfw = void 0;
  /**
   * Sets the contexts of this command.
   *
   * @param contexts - The contexts
   */
  setContexts(...contexts) {
    Reflect.set(this, "contexts", contextsPredicate.parse(normalizeArray(contexts)));
    return this;
  }
  /**
   * Sets the integration types of this command.
   *
   * @param integrationTypes - The integration types
   */
  setIntegrationTypes(...integrationTypes) {
    Reflect.set(this, "integration_types", integrationTypesPredicate.parse(normalizeArray(integrationTypes)));
    return this;
  }
  /**
   * Sets whether the command is enabled by default when the application is added to a guild.
   *
   * @remarks
   * If set to `false`, you will have to later `PUT` the permissions for this command.
   * @param value - Whether or not to enable this command by default
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
   */
  setDefaultPermission(value) {
    validateDefaultPermission(value);
    Reflect.set(this, "default_permission", value);
    return this;
  }
  /**
   * Sets the default permissions a member should have in order to run the command.
   *
   * @remarks
   * You can set this to `'0'` to disable the command by default.
   * @param permissions - The permissions bit field to set
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   */
  setDefaultMemberPermissions(permissions) {
    const permissionValue = validateDefaultMemberPermissions(permissions);
    Reflect.set(this, "default_member_permissions", permissionValue);
    return this;
  }
  /**
   * Sets if the command is available in direct messages with the application.
   *
   * @remarks
   * By default, commands are visible. This method is only for global commands.
   * @param enabled - Whether the command should be enabled in direct messages
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   * @deprecated
   * Use {@link SharedSlashCommand.setContexts} instead.
   */
  setDMPermission(enabled) {
    validateDMPermission(enabled);
    Reflect.set(this, "dm_permission", enabled);
    return this;
  }
  /**
   * Sets whether this command is NSFW.
   *
   * @param nsfw - Whether this command is NSFW
   */
  setNSFW(nsfw = true) {
    validateNSFW(nsfw);
    Reflect.set(this, "nsfw", nsfw);
    return this;
  }
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    validateLocalizationMap(this.name_localizations);
    validateLocalizationMap(this.description_localizations);
    return {
      ...this,
      type: ApplicationCommandType.ChatInput,
      options: this.options.map((option) => option.toJSON())
    };
  }
};

// src/interactions/slashCommands/options/attachment.ts
import { ApplicationCommandOptionType } from "discord-api-types/v10";

// src/interactions/slashCommands/mixins/ApplicationCommandOptionBase.ts
var ApplicationCommandOptionBase = class extends SharedNameAndDescription {
  static {
    __name(this, "ApplicationCommandOptionBase");
  }
  /**
   * Whether this option is required.
   *
   * @defaultValue `false`
   */
  required = false;
  /**
   * Sets whether this option is required.
   *
   * @param required - Whether this option should be required
   */
  setRequired(required) {
    validateRequired(required);
    Reflect.set(this, "required", required);
    return this;
  }
  /**
   * This method runs required validators on this builder.
   */
  runRequiredValidations() {
    validateRequiredParameters3(this.name, this.description, []);
    validateLocalizationMap(this.name_localizations);
    validateLocalizationMap(this.description_localizations);
    validateRequired(this.required);
  }
};

// src/interactions/slashCommands/options/attachment.ts
var SlashCommandAttachmentOption = class extends ApplicationCommandOptionBase {
  static {
    __name(this, "SlashCommandAttachmentOption");
  }
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType.Attachment;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};

// src/interactions/slashCommands/options/boolean.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType2 } from "discord-api-types/v10";
var SlashCommandBooleanOption = class extends ApplicationCommandOptionBase {
  static {
    __name(this, "SlashCommandBooleanOption");
  }
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType2.Boolean;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};

// src/interactions/slashCommands/options/channel.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType3 } from "discord-api-types/v10";
import { mix } from "ts-mixer";

// src/interactions/slashCommands/mixins/ApplicationCommandOptionChannelTypesMixin.ts
import { s as s10 } from "@sapphire/shapeshift";
import { ChannelType as ChannelType3 } from "discord-api-types/v10";
var allowedChannelTypes = [
  ChannelType3.GuildText,
  ChannelType3.GuildVoice,
  ChannelType3.GuildCategory,
  ChannelType3.GuildAnnouncement,
  ChannelType3.AnnouncementThread,
  ChannelType3.PublicThread,
  ChannelType3.PrivateThread,
  ChannelType3.GuildStageVoice,
  ChannelType3.GuildForum,
  ChannelType3.GuildMedia
];
var channelTypesPredicate = s10.array(s10.union(allowedChannelTypes.map((type) => s10.literal(type))));
var ApplicationCommandOptionChannelTypesMixin = class {
  static {
    __name(this, "ApplicationCommandOptionChannelTypesMixin");
  }
  /**
   * The channel types of this option.
   */
  channel_types;
  /**
   * Adds channel types to this option.
   *
   * @param channelTypes - The channel types
   */
  addChannelTypes(...channelTypes) {
    if (this.channel_types === void 0) {
      Reflect.set(this, "channel_types", []);
    }
    this.channel_types.push(...channelTypesPredicate.parse(normalizeArray(channelTypes)));
    return this;
  }
};

// src/interactions/slashCommands/options/channel.ts
var SlashCommandChannelOption = class extends ApplicationCommandOptionBase {
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType3.Channel;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};
__name(SlashCommandChannelOption, "SlashCommandChannelOption");
SlashCommandChannelOption = __decorateClass([
  mix(ApplicationCommandOptionChannelTypesMixin)
], SlashCommandChannelOption);

// src/interactions/slashCommands/options/integer.ts
import { s as s13 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType5 } from "discord-api-types/v10";
import { mix as mix2 } from "ts-mixer";

// src/interactions/slashCommands/mixins/ApplicationCommandNumericOptionMinMaxValueMixin.ts
var ApplicationCommandNumericOptionMinMaxValueMixin = class {
  static {
    __name(this, "ApplicationCommandNumericOptionMinMaxValueMixin");
  }
  /**
   * The maximum value of this option.
   */
  max_value;
  /**
   * The minimum value of this option.
   */
  min_value;
};

// src/interactions/slashCommands/mixins/ApplicationCommandOptionWithAutocompleteMixin.ts
import { s as s11 } from "@sapphire/shapeshift";
var booleanPredicate2 = s11.boolean();
var ApplicationCommandOptionWithAutocompleteMixin = class {
  static {
    __name(this, "ApplicationCommandOptionWithAutocompleteMixin");
  }
  /**
   * Whether this option utilizes autocomplete.
   */
  autocomplete;
  /**
   * The type of this option.
   *
   * @privateRemarks Since this is present and this is a mixin, this is needed.
   */
  type;
  /**
   * Whether this option uses autocomplete.
   *
   * @param autocomplete - Whether this option should use autocomplete
   */
  setAutocomplete(autocomplete) {
    booleanPredicate2.parse(autocomplete);
    if (autocomplete && "choices" in this && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    Reflect.set(this, "autocomplete", autocomplete);
    return this;
  }
};

// src/interactions/slashCommands/mixins/ApplicationCommandOptionWithChoicesMixin.ts
import { s as s12 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType4 } from "discord-api-types/v10";
var stringPredicate = s12.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
var numberPredicate = s12.number().greaterThan(Number.NEGATIVE_INFINITY).lessThan(Number.POSITIVE_INFINITY);
var choicesPredicate = s12.object({
  name: stringPredicate,
  name_localizations: localizationMapPredicate,
  value: s12.union([stringPredicate, numberPredicate])
}).array();
var ApplicationCommandOptionWithChoicesMixin = class {
  static {
    __name(this, "ApplicationCommandOptionWithChoicesMixin");
  }
  /**
   * The choices of this option.
   */
  choices;
  /**
   * The type of this option.
   *
   * @privateRemarks Since this is present and this is a mixin, this is needed.
   */
  type;
  /**
   * Adds multiple choices to this option.
   *
   * @param choices - The choices to add
   */
  addChoices(...choices) {
    const normalizedChoices = normalizeArray(choices);
    if (normalizedChoices.length > 0 && "autocomplete" in this && this.autocomplete) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    choicesPredicate.parse(normalizedChoices);
    if (this.choices === void 0) {
      Reflect.set(this, "choices", []);
    }
    validateChoicesLength(normalizedChoices.length, this.choices);
    for (const { name, name_localizations, value } of normalizedChoices) {
      if (this.type === ApplicationCommandOptionType4.String) {
        stringPredicate.parse(value);
      } else {
        numberPredicate.parse(value);
      }
      this.choices.push({ name, name_localizations, value });
    }
    return this;
  }
  /**
   * Sets multiple choices for this option.
   *
   * @param choices - The choices to set
   */
  setChoices(...choices) {
    const normalizedChoices = normalizeArray(choices);
    if (normalizedChoices.length > 0 && "autocomplete" in this && this.autocomplete) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    choicesPredicate.parse(normalizedChoices);
    Reflect.set(this, "choices", []);
    this.addChoices(normalizedChoices);
    return this;
  }
};

// src/interactions/slashCommands/options/integer.ts
var numberValidator = s13.number().int();
var SlashCommandIntegerOption = class extends ApplicationCommandOptionBase {
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType5.Integer;
  /**
   * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
   */
  setMaxValue(max) {
    numberValidator.parse(max);
    Reflect.set(this, "max_value", max);
    return this;
  }
  /**
   * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
   */
  setMinValue(min) {
    numberValidator.parse(min);
    Reflect.set(this, "min_value", min);
    return this;
  }
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandIntegerOption, "SlashCommandIntegerOption");
SlashCommandIntegerOption = __decorateClass([
  mix2(
    ApplicationCommandNumericOptionMinMaxValueMixin,
    ApplicationCommandOptionWithAutocompleteMixin,
    ApplicationCommandOptionWithChoicesMixin
  )
], SlashCommandIntegerOption);

// src/interactions/slashCommands/options/mentionable.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType6 } from "discord-api-types/v10";
var SlashCommandMentionableOption = class extends ApplicationCommandOptionBase {
  static {
    __name(this, "SlashCommandMentionableOption");
  }
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType6.Mentionable;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};

// src/interactions/slashCommands/options/number.ts
import { s as s14 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType7 } from "discord-api-types/v10";
import { mix as mix3 } from "ts-mixer";
var numberValidator2 = s14.number();
var SlashCommandNumberOption = class extends ApplicationCommandOptionBase {
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType7.Number;
  /**
   * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
   */
  setMaxValue(max) {
    numberValidator2.parse(max);
    Reflect.set(this, "max_value", max);
    return this;
  }
  /**
   * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
   */
  setMinValue(min) {
    numberValidator2.parse(min);
    Reflect.set(this, "min_value", min);
    return this;
  }
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandNumberOption, "SlashCommandNumberOption");
SlashCommandNumberOption = __decorateClass([
  mix3(
    ApplicationCommandNumericOptionMinMaxValueMixin,
    ApplicationCommandOptionWithAutocompleteMixin,
    ApplicationCommandOptionWithChoicesMixin
  )
], SlashCommandNumberOption);

// src/interactions/slashCommands/options/role.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType8 } from "discord-api-types/v10";
var SlashCommandRoleOption = class extends ApplicationCommandOptionBase {
  static {
    __name(this, "SlashCommandRoleOption");
  }
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType8.Role;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};

// src/interactions/slashCommands/options/string.ts
import { s as s15 } from "@sapphire/shapeshift";
import { ApplicationCommandOptionType as ApplicationCommandOptionType9 } from "discord-api-types/v10";
import { mix as mix4 } from "ts-mixer";
var minLengthValidator2 = s15.number().greaterThanOrEqual(0).lessThanOrEqual(6e3);
var maxLengthValidator2 = s15.number().greaterThanOrEqual(1).lessThanOrEqual(6e3);
var SlashCommandStringOption = class extends ApplicationCommandOptionBase {
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType9.String;
  /**
   * The maximum length of this option.
   */
  max_length;
  /**
   * The minimum length of this option.
   */
  min_length;
  /**
   * Sets the maximum length of this string option.
   *
   * @param max - The maximum length this option can be
   */
  setMaxLength(max) {
    maxLengthValidator2.parse(max);
    Reflect.set(this, "max_length", max);
    return this;
  }
  /**
   * Sets the minimum length of this string option.
   *
   * @param min - The minimum length this option can be
   */
  setMinLength(min) {
    minLengthValidator2.parse(min);
    Reflect.set(this, "min_length", min);
    return this;
  }
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    if (this.autocomplete && Array.isArray(this.choices) && this.choices.length > 0) {
      throw new RangeError("Autocomplete and choices are mutually exclusive to each other.");
    }
    return { ...this };
  }
};
__name(SlashCommandStringOption, "SlashCommandStringOption");
SlashCommandStringOption = __decorateClass([
  mix4(ApplicationCommandOptionWithAutocompleteMixin, ApplicationCommandOptionWithChoicesMixin)
], SlashCommandStringOption);

// src/interactions/slashCommands/options/user.ts
import { ApplicationCommandOptionType as ApplicationCommandOptionType10 } from "discord-api-types/v10";
var SlashCommandUserOption = class extends ApplicationCommandOptionBase {
  static {
    __name(this, "SlashCommandUserOption");
  }
  /**
   * The type of this option.
   */
  type = ApplicationCommandOptionType10.User;
  /**
   * {@inheritDoc ApplicationCommandOptionBase.toJSON}
   */
  toJSON() {
    this.runRequiredValidations();
    return { ...this };
  }
};

// src/interactions/slashCommands/mixins/SharedSlashCommandOptions.ts
var SharedSlashCommandOptions = class {
  static {
    __name(this, "SharedSlashCommandOptions");
  }
  options;
  /**
   * Adds a boolean option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addBooleanOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandBooleanOption);
  }
  /**
   * Adds a user option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addUserOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandUserOption);
  }
  /**
   * Adds a channel option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addChannelOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandChannelOption);
  }
  /**
   * Adds a role option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addRoleOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandRoleOption);
  }
  /**
   * Adds an attachment option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addAttachmentOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandAttachmentOption);
  }
  /**
   * Adds a mentionable option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addMentionableOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandMentionableOption);
  }
  /**
   * Adds a string option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addStringOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandStringOption);
  }
  /**
   * Adds an integer option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addIntegerOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandIntegerOption);
  }
  /**
   * Adds a number option.
   *
   * @param input - A function that returns an option builder or an already built builder
   */
  addNumberOption(input) {
    return this._sharedAddOptionMethod(input, SlashCommandNumberOption);
  }
  /**
   * Where the actual adding magic happens. ✨
   *
   * @param input - The input. What else?
   * @param Instance - The instance of whatever is being added
   * @internal
   */
  _sharedAddOptionMethod(input, Instance) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new Instance()) : input;
    assertReturnOfBuilder2(result, Instance);
    options.push(result);
    return this;
  }
};

// src/interactions/slashCommands/SlashCommandSubcommands.ts
import {
  ApplicationCommandOptionType as ApplicationCommandOptionType11
} from "discord-api-types/v10";
import { mix as mix5 } from "ts-mixer";
var SlashCommandSubcommandGroupBuilder = class {
  /**
   * The name of this subcommand group.
   */
  name = void 0;
  /**
   * The description of this subcommand group.
   */
  description = void 0;
  /**
   * The subcommands within this subcommand group.
   */
  options = [];
  /**
   * Adds a new subcommand to this group.
   *
   * @param input - A function that returns a subcommand builder or an already built builder
   */
  addSubcommand(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    assertReturnOfBuilder2(result, SlashCommandSubcommandBuilder);
    options.push(result);
    return this;
  }
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    return {
      type: ApplicationCommandOptionType11.SubcommandGroup,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map((option) => option.toJSON())
    };
  }
};
__name(SlashCommandSubcommandGroupBuilder, "SlashCommandSubcommandGroupBuilder");
SlashCommandSubcommandGroupBuilder = __decorateClass([
  mix5(SharedNameAndDescription)
], SlashCommandSubcommandGroupBuilder);
var SlashCommandSubcommandBuilder = class {
  /**
   * The name of this subcommand.
   */
  name = void 0;
  /**
   * The description of this subcommand.
   */
  description = void 0;
  /**
   * The options within this subcommand.
   */
  options = [];
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    validateRequiredParameters3(this.name, this.description, this.options);
    return {
      type: ApplicationCommandOptionType11.Subcommand,
      name: this.name,
      name_localizations: this.name_localizations,
      description: this.description,
      description_localizations: this.description_localizations,
      options: this.options.map((option) => option.toJSON())
    };
  }
};
__name(SlashCommandSubcommandBuilder, "SlashCommandSubcommandBuilder");
SlashCommandSubcommandBuilder = __decorateClass([
  mix5(SharedNameAndDescription, SharedSlashCommandOptions)
], SlashCommandSubcommandBuilder);

// src/interactions/slashCommands/mixins/SharedSubcommands.ts
var SharedSlashCommandSubcommands = class {
  static {
    __name(this, "SharedSlashCommandSubcommands");
  }
  options = [];
  /**
   * Adds a new subcommand group to this command.
   *
   * @param input - A function that returns a subcommand group builder or an already built builder
   */
  addSubcommandGroup(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandGroupBuilder()) : input;
    assertReturnOfBuilder2(result, SlashCommandSubcommandGroupBuilder);
    options.push(result);
    return this;
  }
  /**
   * Adds a new subcommand to this command.
   *
   * @param input - A function that returns a subcommand builder or an already built builder
   */
  addSubcommand(input) {
    const { options } = this;
    validateMaxOptionsLength(options);
    const result = typeof input === "function" ? input(new SlashCommandSubcommandBuilder()) : input;
    assertReturnOfBuilder2(result, SlashCommandSubcommandBuilder);
    options.push(result);
    return this;
  }
};

// src/interactions/slashCommands/SlashCommandBuilder.ts
var SlashCommandBuilder = class {
  /**
   * The name of this command.
   */
  name = void 0;
  /**
   * The name localizations of this command.
   */
  name_localizations;
  /**
   * The description of this command.
   */
  description = void 0;
  /**
   * The description localizations of this command.
   */
  description_localizations;
  /**
   * The options of this command.
   */
  options = [];
  /**
   * The contexts for this command.
   */
  contexts;
  /**
   * Whether this command is enabled by default when the application is added to a guild.
   *
   * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
   */
  default_permission = void 0;
  /**
   * The set of permissions represented as a bit set for the command.
   */
  default_member_permissions = void 0;
  /**
   * Indicates whether the command is available in direct messages with the application.
   *
   * @remarks
   * By default, commands are visible. This property is only for global commands.
   * @deprecated
   * Use {@link SlashCommandBuilder.contexts} instead.
   */
  dm_permission = void 0;
  /**
   * The integration types for this command.
   */
  integration_types;
  /**
   * Whether this command is NSFW.
   */
  nsfw = void 0;
};
__name(SlashCommandBuilder, "SlashCommandBuilder");
SlashCommandBuilder = __decorateClass([
  mix6(SharedSlashCommandOptions, SharedNameAndDescription, SharedSlashCommandSubcommands, SharedSlashCommand)
], SlashCommandBuilder);

// src/interactions/contextMenuCommands/Assertions.ts
var Assertions_exports9 = {};
__export(Assertions_exports9, {
  contextsPredicate: () => contextsPredicate2,
  integrationTypesPredicate: () => integrationTypesPredicate2,
  validateDMPermission: () => validateDMPermission2,
  validateDefaultMemberPermissions: () => validateDefaultMemberPermissions2,
  validateDefaultPermission: () => validateDefaultPermission2,
  validateName: () => validateName2,
  validateRequiredParameters: () => validateRequiredParameters4,
  validateType: () => validateType
});
import { s as s16 } from "@sapphire/shapeshift";
import { ApplicationCommandType as ApplicationCommandType2, ApplicationIntegrationType as ApplicationIntegrationType2, InteractionContextType as InteractionContextType2 } from "discord-api-types/v10";
var namePredicate2 = s16.string().lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/\S/).setValidationEnabled(isValidationEnabled);
var typePredicate = s16.union([s16.literal(ApplicationCommandType2.User), s16.literal(ApplicationCommandType2.Message)]).setValidationEnabled(isValidationEnabled);
var booleanPredicate3 = s16.boolean();
function validateDefaultPermission2(value) {
  booleanPredicate3.parse(value);
}
__name(validateDefaultPermission2, "validateDefaultPermission");
function validateName2(name) {
  namePredicate2.parse(name);
}
__name(validateName2, "validateName");
function validateType(type) {
  typePredicate.parse(type);
}
__name(validateType, "validateType");
function validateRequiredParameters4(name, type) {
  validateName2(name);
  validateType(type);
}
__name(validateRequiredParameters4, "validateRequiredParameters");
var dmPermissionPredicate2 = s16.boolean().nullish();
function validateDMPermission2(value) {
  dmPermissionPredicate2.parse(value);
}
__name(validateDMPermission2, "validateDMPermission");
var memberPermissionPredicate2 = s16.union([
  s16.bigint().transform((value) => value.toString()),
  s16.number().safeInt().transform((value) => value.toString()),
  s16.string().regex(/^\d+$/)
]).nullish();
function validateDefaultMemberPermissions2(permissions) {
  return memberPermissionPredicate2.parse(permissions);
}
__name(validateDefaultMemberPermissions2, "validateDefaultMemberPermissions");
var contextsPredicate2 = s16.array(
  s16.nativeEnum(InteractionContextType2).setValidationEnabled(isValidationEnabled)
);
var integrationTypesPredicate2 = s16.array(
  s16.nativeEnum(ApplicationIntegrationType2).setValidationEnabled(isValidationEnabled)
);

// src/interactions/contextMenuCommands/ContextMenuCommandBuilder.ts
var ContextMenuCommandBuilder = class {
  static {
    __name(this, "ContextMenuCommandBuilder");
  }
  /**
   * The name of this command.
   */
  name = void 0;
  /**
   * The name localizations of this command.
   */
  name_localizations;
  /**
   * The type of this command.
   */
  type = void 0;
  /**
   * The contexts for this command.
   */
  contexts;
  /**
   * Whether this command is enabled by default when the application is added to a guild.
   *
   * @deprecated Use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
   */
  default_permission = void 0;
  /**
   * The set of permissions represented as a bit set for the command.
   */
  default_member_permissions = void 0;
  /**
   * Indicates whether the command is available in direct messages with the application.
   *
   * @remarks
   * By default, commands are visible. This property is only for global commands.
   * @deprecated
   * Use {@link ContextMenuCommandBuilder.contexts} instead.
   */
  dm_permission = void 0;
  /**
   * The integration types for this command.
   */
  integration_types;
  /**
   * Sets the contexts of this command.
   *
   * @param contexts - The contexts
   */
  setContexts(...contexts) {
    Reflect.set(this, "contexts", contextsPredicate2.parse(normalizeArray(contexts)));
    return this;
  }
  /**
   * Sets integration types of this command.
   *
   * @param integrationTypes - The integration types
   */
  setIntegrationTypes(...integrationTypes) {
    Reflect.set(this, "integration_types", integrationTypesPredicate2.parse(normalizeArray(integrationTypes)));
    return this;
  }
  /**
   * Sets the name of this command.
   *
   * @param name - The name to use
   */
  setName(name) {
    validateName2(name);
    Reflect.set(this, "name", name);
    return this;
  }
  /**
   * Sets the type of this command.
   *
   * @param type - The type to use
   */
  setType(type) {
    validateType(type);
    Reflect.set(this, "type", type);
    return this;
  }
  /**
   * Sets whether the command is enabled by default when the application is added to a guild.
   *
   * @remarks
   * If set to `false`, you will have to later `PUT` the permissions for this command.
   * @param value - Whether to enable this command by default
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   * @deprecated Use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
   */
  setDefaultPermission(value) {
    validateDefaultPermission2(value);
    Reflect.set(this, "default_permission", value);
    return this;
  }
  /**
   * Sets the default permissions a member should have in order to run this command.
   *
   * @remarks
   * You can set this to `'0'` to disable the command by default.
   * @param permissions - The permissions bit field to set
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   */
  setDefaultMemberPermissions(permissions) {
    const permissionValue = validateDefaultMemberPermissions2(permissions);
    Reflect.set(this, "default_member_permissions", permissionValue);
    return this;
  }
  /**
   * Sets if the command is available in direct messages with the application.
   *
   * @remarks
   * By default, commands are visible. This method is only for global commands.
   * @param enabled - Whether the command should be enabled in direct messages
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   * @deprecated Use {@link ContextMenuCommandBuilder.setContexts} instead.
   */
  setDMPermission(enabled) {
    validateDMPermission2(enabled);
    Reflect.set(this, "dm_permission", enabled);
    return this;
  }
  /**
   * Sets a name localization for this command.
   *
   * @param locale - The locale to set
   * @param localizedName - The localized name for the given `locale`
   */
  setNameLocalization(locale, localizedName) {
    if (!this.name_localizations) {
      Reflect.set(this, "name_localizations", {});
    }
    const parsedLocale = validateLocale(locale);
    if (localizedName === null) {
      this.name_localizations[parsedLocale] = null;
      return this;
    }
    validateName2(localizedName);
    this.name_localizations[parsedLocale] = localizedName;
    return this;
  }
  /**
   * Sets the name localizations for this command.
   *
   * @param localizedNames - The object of localized names to set
   */
  setNameLocalizations(localizedNames) {
    if (localizedNames === null) {
      Reflect.set(this, "name_localizations", null);
      return this;
    }
    Reflect.set(this, "name_localizations", {});
    for (const args of Object.entries(localizedNames))
      this.setNameLocalization(...args);
    return this;
  }
  /**
   * Serializes this builder to API-compatible JSON data.
   *
   * @remarks
   * This method runs validations on the data before serializing it.
   * As such, it may throw an error if the data is invalid.
   */
  toJSON() {
    validateRequiredParameters4(this.name, this.type);
    validateLocalizationMap(this.name_localizations);
    return { ...this };
  }
};

// src/util/componentUtil.ts
function embedLength(data) {
  return (data.title?.length ?? 0) + (data.description?.length ?? 0) + (data.fields?.reduce((prev, curr) => prev + curr.name.length + curr.value.length, 0) ?? 0) + (data.footer?.text.length ?? 0) + (data.author?.name.length ?? 0);
}
__name(embedLength, "embedLength");

// src/index.ts
var version = "1.13.0";
export {
  ActionRowBuilder,
  ApplicationCommandNumericOptionMinMaxValueMixin,
  ApplicationCommandOptionBase,
  ApplicationCommandOptionChannelTypesMixin,
  ApplicationCommandOptionWithAutocompleteMixin,
  ApplicationCommandOptionWithChoicesMixin,
  BaseSelectMenuBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  Assertions_exports2 as ComponentAssertions,
  ComponentBuilder,
  Assertions_exports6 as ComponentsV2Assertions,
  ContainerBuilder,
  Assertions_exports9 as ContextMenuCommandAssertions,
  ContextMenuCommandBuilder,
  Assertions_exports as EmbedAssertions,
  EmbedBuilder,
  FileBuilder,
  Assertions_exports3 as FileUploadAssertions,
  FileUploadBuilder,
  Assertions_exports5 as LabelAssertions,
  LabelBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MentionableSelectMenuBuilder,
  Assertions_exports7 as ModalAssertions,
  ModalBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  StringSelectMenuBuilder as SelectMenuBuilder,
  StringSelectMenuOptionBuilder as SelectMenuOptionBuilder,
  SeparatorBuilder,
  SharedNameAndDescription,
  SharedSlashCommand,
  SharedSlashCommandOptions,
  SharedSlashCommandSubcommands,
  Assertions_exports8 as SlashCommandAssertions,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandUserOption,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  Assertions_exports4 as TextInputAssertions,
  TextInputBuilder,
  ThumbnailBuilder,
  UserSelectMenuBuilder,
  createComponentBuilder,
  disableValidators,
  embedLength,
  enableValidators,
  isValidationEnabled,
  normalizeArray,
  resolveBuilder,
  version
};
//# sourceMappingURL=index.mjs.map