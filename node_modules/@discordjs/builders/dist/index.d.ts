import * as _sapphire_shapeshift from '@sapphire/shapeshift';
import { APIEmbedField, APIEmbedAuthor, APIEmbedFooter, APIEmbedImage, APIEmbed, APISelectMenuOption, APIMessageComponentEmoji, ButtonStyle, ChannelType, APIActionRowComponent, APIComponentInActionRow, APIMessageComponent, APIModalComponent, APIBaseComponent, ComponentType, APIButtonComponent, Snowflake, APISelectMenuComponent, APIChannelSelectComponent, APIMentionableSelectComponent, APISelectMenuDefaultValue, SelectMenuDefaultValueType, APIRoleSelectComponent, APIStringSelectComponent, APIUserSelectComponent, APITextInputComponent, TextInputStyle, APIComponentInMessageActionRow, APIComponentInModalActionRow, APIFileUploadComponent, APILabelComponent, APIFileComponent, APISeparatorComponent, SeparatorSpacingSize, APITextDisplayComponent, APIContainerComponent, APIMediaGalleryComponent, APISectionComponent, APIComponentInContainer, APIMediaGalleryItem, APIThumbnailComponent, APIModalInteractionResponseCallbackData, LocalizationMap, LocaleString, InteractionContextType, Permissions, ApplicationIntegrationType, RESTPostAPIChatInputApplicationCommandsJSONBody, ApplicationCommandOptionType, APIApplicationCommandBasicOption, APIApplicationCommandAttachmentOption, APIApplicationCommandBooleanOption, APIApplicationCommandChannelOption, APIApplicationCommandOptionChoice, APIApplicationCommandIntegerOption, APIApplicationCommandMentionableOption, APIApplicationCommandNumberOption, APIApplicationCommandRoleOption, APIApplicationCommandStringOption, APIApplicationCommandUserOption, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption, APIApplicationCommandOption, Locale, ApplicationCommandType, RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';
export * from '@discordjs/formatters';
import { JSONEncodable, Equatable } from '@discordjs/util';

declare const fieldNamePredicate: _sapphire_shapeshift.StringValidator<string>;
declare const fieldValuePredicate: _sapphire_shapeshift.StringValidator<string>;
declare const fieldInlinePredicate: _sapphire_shapeshift.UnionValidator<boolean | undefined>;
declare const embedFieldPredicate: _sapphire_shapeshift.ObjectValidator<{
    name: string;
    value: string;
    inline: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>>;
declare const embedFieldsArrayPredicate: _sapphire_shapeshift.ArrayValidator<_sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>[], _sapphire_shapeshift.UndefinedToOptional<{
    name: string;
    value: string;
    inline: boolean | undefined;
}>>;
declare const fieldLengthPredicate: _sapphire_shapeshift.NumberValidator<number>;
declare function validateFieldLength(amountAdding: number, fields?: APIEmbedField[]): void;
declare const authorNamePredicate: _sapphire_shapeshift.UnionValidator<string | null>;
declare const imageURLPredicate: _sapphire_shapeshift.UnionValidator<string | null | undefined>;
declare const urlPredicate: _sapphire_shapeshift.UnionValidator<string | null | undefined>;
declare const embedAuthorPredicate: _sapphire_shapeshift.ObjectValidator<{
    name: string | null;
    iconURL: string | null | undefined;
    url: string | null | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name: string | null;
    iconURL: string | null | undefined;
    url: string | null | undefined;
}>>;
declare const RGBPredicate: _sapphire_shapeshift.NumberValidator<number>;
declare const colorPredicate: _sapphire_shapeshift.UnionValidator<number | [number, number, number] | null>;
declare const descriptionPredicate$1: _sapphire_shapeshift.UnionValidator<string | null>;
declare const footerTextPredicate: _sapphire_shapeshift.UnionValidator<string | null>;
declare const embedFooterPredicate: _sapphire_shapeshift.ObjectValidator<{
    text: string | null;
    iconURL: string | null | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    text: string | null;
    iconURL: string | null | undefined;
}>>;
declare const timestampPredicate: _sapphire_shapeshift.UnionValidator<number | Date | null>;
declare const titlePredicate: _sapphire_shapeshift.UnionValidator<string | null>;

declare const Assertions$8_RGBPredicate: typeof RGBPredicate;
declare const Assertions$8_authorNamePredicate: typeof authorNamePredicate;
declare const Assertions$8_colorPredicate: typeof colorPredicate;
declare const Assertions$8_embedAuthorPredicate: typeof embedAuthorPredicate;
declare const Assertions$8_embedFieldPredicate: typeof embedFieldPredicate;
declare const Assertions$8_embedFieldsArrayPredicate: typeof embedFieldsArrayPredicate;
declare const Assertions$8_embedFooterPredicate: typeof embedFooterPredicate;
declare const Assertions$8_fieldInlinePredicate: typeof fieldInlinePredicate;
declare const Assertions$8_fieldLengthPredicate: typeof fieldLengthPredicate;
declare const Assertions$8_fieldNamePredicate: typeof fieldNamePredicate;
declare const Assertions$8_fieldValuePredicate: typeof fieldValuePredicate;
declare const Assertions$8_footerTextPredicate: typeof footerTextPredicate;
declare const Assertions$8_imageURLPredicate: typeof imageURLPredicate;
declare const Assertions$8_timestampPredicate: typeof timestampPredicate;
declare const Assertions$8_titlePredicate: typeof titlePredicate;
declare const Assertions$8_urlPredicate: typeof urlPredicate;
declare const Assertions$8_validateFieldLength: typeof validateFieldLength;
declare namespace Assertions$8 {
  export { Assertions$8_RGBPredicate as RGBPredicate, Assertions$8_authorNamePredicate as authorNamePredicate, Assertions$8_colorPredicate as colorPredicate, descriptionPredicate$1 as descriptionPredicate, Assertions$8_embedAuthorPredicate as embedAuthorPredicate, Assertions$8_embedFieldPredicate as embedFieldPredicate, Assertions$8_embedFieldsArrayPredicate as embedFieldsArrayPredicate, Assertions$8_embedFooterPredicate as embedFooterPredicate, Assertions$8_fieldInlinePredicate as fieldInlinePredicate, Assertions$8_fieldLengthPredicate as fieldLengthPredicate, Assertions$8_fieldNamePredicate as fieldNamePredicate, Assertions$8_fieldValuePredicate as fieldValuePredicate, Assertions$8_footerTextPredicate as footerTextPredicate, Assertions$8_imageURLPredicate as imageURLPredicate, Assertions$8_timestampPredicate as timestampPredicate, Assertions$8_titlePredicate as titlePredicate, Assertions$8_urlPredicate as urlPredicate, Assertions$8_validateFieldLength as validateFieldLength };
}

/**
 * Normalizes data that is a rest parameter or an array into an array with a depth of 1.
 *
 * @typeParam ItemType - The data that must satisfy {@link RestOrArray}.
 * @param arr - The (possibly variadic) data to normalize
 */
declare function normalizeArray<ItemType>(arr: RestOrArray<ItemType>): ItemType[];
/**
 * Represents data that may be an array or came from a rest parameter.
 *
 * @remarks
 * This type is used throughout builders to ensure both an array and variadic arguments
 * may be used. It is normalized with {@link normalizeArray}.
 */
type RestOrArray<Type> = Type[] | [Type[]];

/**
 * A tuple satisfying the RGB color model.
 *
 * @see {@link https://developer.mozilla.org/docs/Glossary/RGB}
 */
type RGBTuple = [red: number, green: number, blue: number];
/**
 * The base icon data typically used in payloads.
 */
interface IconData {
    /**
     * The URL of the icon.
     */
    iconURL?: string;
    /**
     * The proxy URL of the icon.
     */
    proxyIconURL?: string;
}
/**
 * Represents the author data of an embed.
 */
interface EmbedAuthorData extends IconData, Omit<APIEmbedAuthor, 'icon_url' | 'proxy_icon_url'> {
}
/**
 * Represents the author options of an embed.
 */
interface EmbedAuthorOptions extends Omit<EmbedAuthorData, 'proxyIconURL'> {
}
/**
 * Represents the footer data of an embed.
 */
interface EmbedFooterData extends IconData, Omit<APIEmbedFooter, 'icon_url' | 'proxy_icon_url'> {
}
/**
 * Represents the footer options of an embed.
 */
interface EmbedFooterOptions extends Omit<EmbedFooterData, 'proxyIconURL'> {
}
/**
 * Represents the image data of an embed.
 */
interface EmbedImageData extends Omit<APIEmbedImage, 'proxy_url'> {
    /**
     * The proxy URL for the image.
     */
    proxyURL?: string;
}
/**
 * A builder that creates API-compatible JSON data for embeds.
 */
declare class EmbedBuilder {
    /**
     * The API data associated with this embed.
     */
    readonly data: APIEmbed;
    /**
     * Creates a new embed from API data.
     *
     * @param data - The API data to create this embed with
     */
    constructor(data?: APIEmbed);
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
    addFields(...fields: RestOrArray<APIEmbedField>): this;
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
    spliceFields(index: number, deleteCount: number, ...fields: APIEmbedField[]): this;
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
    setFields(...fields: RestOrArray<APIEmbedField>): this;
    /**
     * Sets the author of this embed.
     *
     * @param options - The options to use
     */
    setAuthor(options: EmbedAuthorOptions | null): this;
    /**
     * Sets the color of this embed.
     *
     * @param color - The color to use
     */
    setColor(color: RGBTuple | number | null): this;
    /**
     * Sets the description of this embed.
     *
     * @param description - The description to use
     */
    setDescription(description: string | null): this;
    /**
     * Sets the footer of this embed.
     *
     * @param options - The footer to use
     */
    setFooter(options: EmbedFooterOptions | null): this;
    /**
     * Sets the image of this embed.
     *
     * @param url - The image URL to use
     */
    setImage(url: string | null): this;
    /**
     * Sets the thumbnail of this embed.
     *
     * @param url - The thumbnail URL to use
     */
    setThumbnail(url: string | null): this;
    /**
     * Sets the timestamp of this embed.
     *
     * @param timestamp - The timestamp or date to use
     */
    setTimestamp(timestamp?: Date | number | null): this;
    /**
     * Sets the title for this embed.
     *
     * @param title - The title to use
     */
    setTitle(title: string | null): this;
    /**
     * Sets the URL of this embed.
     *
     * @param url - The URL to use
     */
    setURL(url: string | null): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): APIEmbed;
}

/**
 * A builder that creates API-compatible JSON data for string select menu options.
 */
declare class StringSelectMenuOptionBuilder implements JSONEncodable<APISelectMenuOption> {
    data: Partial<APISelectMenuOption>;
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
    constructor(data?: Partial<APISelectMenuOption>);
    /**
     * Sets the label for this option.
     *
     * @param label - The label to use
     */
    setLabel(label: string): this;
    /**
     * Sets the value for this option.
     *
     * @param value - The value to use
     */
    setValue(value: string): this;
    /**
     * Sets the description for this option.
     *
     * @param description - The description to use
     */
    setDescription(description: string): this;
    /**
     * Sets whether this option is selected by default.
     *
     * @param isDefault - Whether this option is selected by default
     */
    setDefault(isDefault?: boolean): this;
    /**
     * Sets the emoji to display for this option.
     *
     * @param emoji - The emoji to use
     */
    setEmoji(emoji: APIMessageComponentEmoji): this;
    /**
     * {@inheritDoc BaseSelectMenuBuilder.toJSON}
     */
    toJSON(): APISelectMenuOption;
}

declare const idValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const customIdValidator: _sapphire_shapeshift.StringValidator<string>;
declare const emojiValidator: _sapphire_shapeshift.ObjectValidator<{
    name?: string | undefined;
    id?: string | undefined;
    animated?: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    name?: string | undefined;
    id?: string | undefined;
    animated?: boolean | undefined;
}>>;
declare const disabledValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const buttonLabelValidator: _sapphire_shapeshift.StringValidator<string>;
declare const buttonStyleValidator: _sapphire_shapeshift.NativeEnumValidator<typeof ButtonStyle>;
declare const placeholderValidator$1: _sapphire_shapeshift.StringValidator<string>;
declare const minMaxValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const labelValueDescriptionValidator: _sapphire_shapeshift.StringValidator<string>;
declare const jsonOptionValidator: _sapphire_shapeshift.ObjectValidator<{
    label: string;
    value: string;
    description: string | undefined;
    emoji: _sapphire_shapeshift.UndefinedToOptional<{
        name?: string | undefined;
        id?: string | undefined;
        animated?: boolean | undefined;
    }> | undefined;
    default: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    label: string;
    value: string;
    description: string | undefined;
    emoji: _sapphire_shapeshift.UndefinedToOptional<{
        name?: string | undefined;
        id?: string | undefined;
        animated?: boolean | undefined;
    }> | undefined;
    default: boolean | undefined;
}>>;
declare const optionValidator: _sapphire_shapeshift.InstanceValidator<StringSelectMenuOptionBuilder>;
declare const optionsValidator: _sapphire_shapeshift.ArrayValidator<StringSelectMenuOptionBuilder[], StringSelectMenuOptionBuilder>;
declare const optionsLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare function validateRequiredSelectMenuParameters(options: StringSelectMenuOptionBuilder[], customId?: string): void;
declare const defaultValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare function validateRequiredSelectMenuOptionParameters(label?: string, value?: string): void;
declare const channelTypesValidator: _sapphire_shapeshift.ArrayValidator<ChannelType[], ChannelType>;
declare const urlValidator: _sapphire_shapeshift.StringValidator<string>;
declare function validateRequiredButtonParameters(style?: ButtonStyle, label?: string, emoji?: APIMessageComponentEmoji, customId?: string, skuId?: string, url?: string): void;

declare const Assertions$7_buttonLabelValidator: typeof buttonLabelValidator;
declare const Assertions$7_buttonStyleValidator: typeof buttonStyleValidator;
declare const Assertions$7_channelTypesValidator: typeof channelTypesValidator;
declare const Assertions$7_customIdValidator: typeof customIdValidator;
declare const Assertions$7_defaultValidator: typeof defaultValidator;
declare const Assertions$7_disabledValidator: typeof disabledValidator;
declare const Assertions$7_emojiValidator: typeof emojiValidator;
declare const Assertions$7_idValidator: typeof idValidator;
declare const Assertions$7_jsonOptionValidator: typeof jsonOptionValidator;
declare const Assertions$7_labelValueDescriptionValidator: typeof labelValueDescriptionValidator;
declare const Assertions$7_minMaxValidator: typeof minMaxValidator;
declare const Assertions$7_optionValidator: typeof optionValidator;
declare const Assertions$7_optionsLengthValidator: typeof optionsLengthValidator;
declare const Assertions$7_optionsValidator: typeof optionsValidator;
declare const Assertions$7_urlValidator: typeof urlValidator;
declare const Assertions$7_validateRequiredButtonParameters: typeof validateRequiredButtonParameters;
declare const Assertions$7_validateRequiredSelectMenuOptionParameters: typeof validateRequiredSelectMenuOptionParameters;
declare const Assertions$7_validateRequiredSelectMenuParameters: typeof validateRequiredSelectMenuParameters;
declare namespace Assertions$7 {
  export { Assertions$7_buttonLabelValidator as buttonLabelValidator, Assertions$7_buttonStyleValidator as buttonStyleValidator, Assertions$7_channelTypesValidator as channelTypesValidator, Assertions$7_customIdValidator as customIdValidator, Assertions$7_defaultValidator as defaultValidator, Assertions$7_disabledValidator as disabledValidator, Assertions$7_emojiValidator as emojiValidator, Assertions$7_idValidator as idValidator, Assertions$7_jsonOptionValidator as jsonOptionValidator, Assertions$7_labelValueDescriptionValidator as labelValueDescriptionValidator, Assertions$7_minMaxValidator as minMaxValidator, Assertions$7_optionValidator as optionValidator, Assertions$7_optionsLengthValidator as optionsLengthValidator, Assertions$7_optionsValidator as optionsValidator, placeholderValidator$1 as placeholderValidator, Assertions$7_urlValidator as urlValidator, Assertions$7_validateRequiredButtonParameters as validateRequiredButtonParameters, Assertions$7_validateRequiredSelectMenuOptionParameters as validateRequiredSelectMenuOptionParameters, Assertions$7_validateRequiredSelectMenuParameters as validateRequiredSelectMenuParameters };
}

/**
 * Any action row component data represented as an object.
 */
type AnyAPIActionRowComponent = APIActionRowComponent<APIComponentInActionRow> | APIComponentInActionRow | APIMessageComponent | APIModalComponent;
/**
 * The base component builder that contains common symbols for all sorts of components.
 *
 * @typeParam DataType - The type of internal API data that is stored within the component
 */
declare abstract class ComponentBuilder<DataType extends Partial<APIBaseComponent<ComponentType>> = APIBaseComponent<ComponentType>> implements JSONEncodable<AnyAPIActionRowComponent> {
    /**
     * The API data associated with this component.
     */
    readonly data: Partial<DataType>;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    abstract toJSON(): AnyAPIActionRowComponent;
    /**
     * Constructs a new kind of component.
     *
     * @param data - The data to construct a component out of
     */
    constructor(data: Partial<DataType>);
    /**
     * Sets the id (not the custom id) for this component.
     *
     * @param id - The id for this component
     */
    setId(id: number): this;
    /**
     * Clears the id of this component, defaulting to a default incremented id.
     */
    clearId(): this;
}

/**
 * A builder that creates API-compatible JSON data for buttons.
 */
declare class ButtonBuilder extends ComponentBuilder<APIButtonComponent> {
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
    constructor(data?: Partial<APIButtonComponent>);
    /**
     * Sets the style of this button.
     *
     * @param style - The style to use
     */
    setStyle(style: ButtonStyle): this;
    /**
     * Sets the URL for this button.
     *
     * @remarks
     * This method is only available to buttons using the `Link` button style.
     * Only three types of URL schemes are currently supported: `https://`, `http://`, and `discord://`.
     * @param url - The URL to use
     */
    setURL(url: string): this;
    /**
     * Sets the custom id for this button.
     *
     * @remarks
     * This method is only applicable to buttons that are not using the `Link` button style.
     * @param customId - The custom id to use
     */
    setCustomId(customId: string): this;
    /**
     * Sets the SKU id that represents a purchasable SKU for this button.
     *
     * @remarks Only available when using premium-style buttons.
     * @param skuId - The SKU id to use
     */
    setSKUId(skuId: Snowflake): this;
    /**
     * Sets the emoji to display on this button.
     *
     * @param emoji - The emoji to use
     */
    setEmoji(emoji: APIMessageComponentEmoji): this;
    /**
     * Sets whether this button is disabled.
     *
     * @param disabled - Whether to disable this button
     */
    setDisabled(disabled?: boolean): this;
    /**
     * Sets the label for this button.
     *
     * @param label - The label to use
     */
    setLabel(label: string): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIButtonComponent;
}

/**
 * The base select menu builder that contains common symbols for select menu builders.
 *
 * @typeParam SelectMenuType - The type of select menu this would be instantiated for.
 */
declare abstract class BaseSelectMenuBuilder<SelectMenuType extends APISelectMenuComponent> extends ComponentBuilder<SelectMenuType> {
    /**
     * Sets the placeholder for this select menu.
     *
     * @param placeholder - The placeholder to use
     */
    setPlaceholder(placeholder: string): this;
    /**
     * Sets the minimum values that must be selected in the select menu.
     *
     * @param minValues - The minimum values that must be selected
     */
    setMinValues(minValues: number): this;
    /**
     * Sets the maximum values that must be selected in the select menu.
     *
     * @param maxValues - The maximum values that must be selected
     */
    setMaxValues(maxValues: number): this;
    /**
     * Sets the custom id for this select menu.
     *
     * @param customId - The custom id to use
     */
    setCustomId(customId: string): this;
    /**
     * Sets whether this select menu is disabled.
     *
     * @param disabled - Whether this select menu is disabled
     */
    setDisabled(disabled?: boolean): this;
    /**
     * Sets whether this select menu is required.
     *
     * @remarks Only for use in modals.
     * @param required - Whether this select menu is required
     */
    setRequired(required?: boolean): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): SelectMenuType;
}

/**
 * A builder that creates API-compatible JSON data for channel select menus.
 */
declare class ChannelSelectMenuBuilder extends BaseSelectMenuBuilder<APIChannelSelectComponent> {
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
    constructor(data?: Partial<APIChannelSelectComponent>);
    /**
     * Adds channel types to this select menu.
     *
     * @param types - The channel types to use
     */
    addChannelTypes(...types: RestOrArray<ChannelType>): this;
    /**
     * Sets channel types for this select menu.
     *
     * @param types - The channel types to use
     */
    setChannelTypes(...types: RestOrArray<ChannelType>): this;
    /**
     * Adds default channels to this auto populated select menu.
     *
     * @param channels - The channels to add
     */
    addDefaultChannels(...channels: RestOrArray<Snowflake>): this;
    /**
     * Sets default channels for this auto populated select menu.
     *
     * @param channels - The channels to set
     */
    setDefaultChannels(...channels: RestOrArray<Snowflake>): this;
    /**
     * {@inheritDoc BaseSelectMenuBuilder.toJSON}
     */
    toJSON(): APIChannelSelectComponent;
}

/**
 * A builder that creates API-compatible JSON data for mentionable select menus.
 */
declare class MentionableSelectMenuBuilder extends BaseSelectMenuBuilder<APIMentionableSelectComponent> {
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
    constructor(data?: Partial<APIMentionableSelectComponent>);
    /**
     * Adds default roles to this auto populated select menu.
     *
     * @param roles - The roles to add
     */
    addDefaultRoles(...roles: RestOrArray<Snowflake>): this;
    /**
     * Adds default users to this auto populated select menu.
     *
     * @param users - The users to add
     */
    addDefaultUsers(...users: RestOrArray<Snowflake>): this;
    /**
     * Adds default values to this auto populated select menu.
     *
     * @param values - The values to add
     */
    addDefaultValues(...values: RestOrArray<APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role> | APISelectMenuDefaultValue<SelectMenuDefaultValueType.User>>): this;
    /**
     * Sets default values for this auto populated select menu.
     *
     * @param values - The values to set
     */
    setDefaultValues(...values: RestOrArray<APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role> | APISelectMenuDefaultValue<SelectMenuDefaultValueType.User>>): this;
}

/**
 * A builder that creates API-compatible JSON data for role select menus.
 */
declare class RoleSelectMenuBuilder extends BaseSelectMenuBuilder<APIRoleSelectComponent> {
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
    constructor(data?: Partial<APIRoleSelectComponent>);
    /**
     * Adds default roles to this auto populated select menu.
     *
     * @param roles - The roles to add
     */
    addDefaultRoles(...roles: RestOrArray<Snowflake>): this;
    /**
     * Sets default roles for this auto populated select menu.
     *
     * @param roles - The roles to set
     */
    setDefaultRoles(...roles: RestOrArray<Snowflake>): this;
}

/**
 * A builder that creates API-compatible JSON data for string select menus.
 */
declare class StringSelectMenuBuilder extends BaseSelectMenuBuilder<APIStringSelectComponent> {
    /**
     * The options within this select menu.
     */
    readonly options: StringSelectMenuOptionBuilder[];
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
    constructor(data?: Partial<APIStringSelectComponent>);
    /**
     * Adds options to this select menu.
     *
     * @param options - The options to add
     */
    addOptions(...options: RestOrArray<APISelectMenuOption | StringSelectMenuOptionBuilder>): this;
    /**
     * Sets the options for this select menu.
     *
     * @param options - The options to set
     */
    setOptions(...options: RestOrArray<APISelectMenuOption | StringSelectMenuOptionBuilder>): this;
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
    spliceOptions(index: number, deleteCount: number, ...options: RestOrArray<APISelectMenuOption | StringSelectMenuOptionBuilder>): this;
    /**
     * {@inheritDoc BaseSelectMenuBuilder.toJSON}
     */
    toJSON(): APIStringSelectComponent;
}

/**
 * A builder that creates API-compatible JSON data for user select menus.
 */
declare class UserSelectMenuBuilder extends BaseSelectMenuBuilder<APIUserSelectComponent> {
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
    constructor(data?: Partial<APIUserSelectComponent>);
    /**
     * Adds default users to this auto populated select menu.
     *
     * @param users - The users to add
     */
    addDefaultUsers(...users: RestOrArray<Snowflake>): this;
    /**
     * Sets default users for this auto populated select menu.
     *
     * @param users - The users to set
     */
    setDefaultUsers(...users: RestOrArray<Snowflake>): this;
}

/**
 * A builder that creates API-compatible JSON data for text inputs.
 */
declare class TextInputBuilder extends ComponentBuilder<APITextInputComponent> implements Equatable<APITextInputComponent | JSONEncodable<APITextInputComponent>> {
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
    constructor(data?: APITextInputComponent & {
        type?: ComponentType.TextInput;
    });
    /**
     * Sets the custom id for this text input.
     *
     * @param customId - The custom id to use
     */
    setCustomId(customId: string): this;
    /**
     * Sets the label for this text input.
     *
     * @param label - The label to use
     * @deprecated Use a label builder to create a label (and optionally a description) instead.
     */
    setLabel(label: string): this;
    /**
     * Sets the style for this text input.
     *
     * @param style - The style to use
     */
    setStyle(style: TextInputStyle): this;
    /**
     * Sets the minimum length of text for this text input.
     *
     * @param minLength - The minimum length of text for this text input
     */
    setMinLength(minLength: number): this;
    /**
     * Sets the maximum length of text for this text input.
     *
     * @param maxLength - The maximum length of text for this text input
     */
    setMaxLength(maxLength: number): this;
    /**
     * Sets the placeholder for this text input.
     *
     * @param placeholder - The placeholder to use
     */
    setPlaceholder(placeholder: string): this;
    /**
     * Sets the value for this text input.
     *
     * @param value - The value to use
     */
    setValue(value: string): this;
    /**
     * Sets whether this text input is required.
     *
     * @param required - Whether this text input is required
     */
    setRequired(required?: boolean): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APITextInputComponent;
    /**
     * Whether this is equal to another structure.
     */
    equals(other: APITextInputComponent | JSONEncodable<APITextInputComponent>): boolean;
}

/**
 * The builders that may be used for modals.
 */
type ModalComponentBuilder = ActionRowBuilder<ModalActionRowComponentBuilder> | ModalActionRowComponentBuilder;
/**
 * The builders that may be used within an action row for messages.
 */
type MessageActionRowComponentBuilder = ButtonBuilder | ChannelSelectMenuBuilder | MentionableSelectMenuBuilder | RoleSelectMenuBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder;
/**
 * The builders that may be used within an action row for modals.
 */
type ModalActionRowComponentBuilder = TextInputBuilder;
/**
 * Any builder.
 */
type AnyComponentBuilder = MessageActionRowComponentBuilder | ModalActionRowComponentBuilder;
/**
 * A builder that creates API-compatible JSON data for action rows.
 *
 * @typeParam ComponentType - The types of components this action row holds
 */
declare class ActionRowBuilder<ComponentType extends AnyComponentBuilder> extends ComponentBuilder<APIActionRowComponent<APIComponentInMessageActionRow | APIComponentInModalActionRow>> {
    /**
     * The components within this action row.
     */
    readonly components: ComponentType[];
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
    constructor({ components, ...data }?: Partial<APIActionRowComponent<APIComponentInActionRow>>);
    /**
     * Adds components to this action row.
     *
     * @param components - The components to add
     */
    addComponents(...components: RestOrArray<ComponentType>): this;
    /**
     * Sets components for this action row.
     *
     * @param components - The components to set
     */
    setComponents(...components: RestOrArray<ComponentType>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIActionRowComponent<ReturnType<ComponentType['toJSON']>>;
}

/**
 * A builder that creates API-compatible JSON data for file uploads.
 */
declare class FileUploadBuilder extends ComponentBuilder<APIFileUploadComponent> {
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
    constructor(data?: Partial<APIFileUploadComponent>);
    /**
     * Sets the custom id for this file upload.
     *
     * @param customId - The custom id to use
     */
    setCustomId(customId: string): this;
    /**
     * Sets the minimum number of file uploads required.
     *
     * @param minValues - The minimum values that must be uploaded
     */
    setMinValues(minValues: number): this;
    /**
     * Clears the minimum values.
     */
    clearMinValues(): this;
    /**
     * Sets the maximum number of file uploads required.
     *
     * @param maxValues - The maximum values that must be uploaded
     */
    setMaxValues(maxValues: number): this;
    /**
     * Clears the maximum values.
     */
    clearMaxValues(): this;
    /**
     * Sets whether this file upload is required.
     *
     * @param required - Whether this file upload is required
     */
    setRequired(required?: boolean): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIFileUploadComponent;
}

interface LabelBuilderData extends Partial<Omit<APILabelComponent, 'component'>> {
    component?: ChannelSelectMenuBuilder | FileUploadBuilder | MentionableSelectMenuBuilder | RoleSelectMenuBuilder | StringSelectMenuBuilder | TextInputBuilder | UserSelectMenuBuilder;
}
/**
 * A builder that creates API-compatible JSON data for labels.
 */
declare class LabelBuilder extends ComponentBuilder<LabelBuilderData> {
    /**
     * @internal
     */
    readonly data: LabelBuilderData;
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
    constructor(data?: Partial<APILabelComponent>);
    /**
     * Sets the label for this label.
     *
     * @param label - The label to use
     */
    setLabel(label: string): this;
    /**
     * Sets the description for this label.
     *
     * @param description - The description to use
     */
    setDescription(description: string): this;
    /**
     * Clears the description for this label.
     */
    clearDescription(): this;
    /**
     * Sets a string select menu component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setStringSelectMenuComponent(input: APIStringSelectComponent | StringSelectMenuBuilder | ((builder: StringSelectMenuBuilder) => StringSelectMenuBuilder)): this;
    /**
     * Sets a user select menu component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setUserSelectMenuComponent(input: APIUserSelectComponent | UserSelectMenuBuilder | ((builder: UserSelectMenuBuilder) => UserSelectMenuBuilder)): this;
    /**
     * Sets a role select menu component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setRoleSelectMenuComponent(input: APIRoleSelectComponent | RoleSelectMenuBuilder | ((builder: RoleSelectMenuBuilder) => RoleSelectMenuBuilder)): this;
    /**
     * Sets a mentionable select menu component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setMentionableSelectMenuComponent(input: APIMentionableSelectComponent | MentionableSelectMenuBuilder | ((builder: MentionableSelectMenuBuilder) => MentionableSelectMenuBuilder)): this;
    /**
     * Sets a channel select menu component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setChannelSelectMenuComponent(input: APIChannelSelectComponent | ChannelSelectMenuBuilder | ((builder: ChannelSelectMenuBuilder) => ChannelSelectMenuBuilder)): this;
    /**
     * Sets a text input component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setTextInputComponent(input: APITextInputComponent | TextInputBuilder | ((builder: TextInputBuilder) => TextInputBuilder)): this;
    /**
     * Sets a file upload component to this label.
     *
     * @param input - A function that returns a component builder or an already built builder
     */
    setFileUploadComponent(input: APIFileUploadComponent | FileUploadBuilder | ((builder: FileUploadBuilder) => FileUploadBuilder)): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APILabelComponent;
}

declare class FileBuilder extends ComponentBuilder<APIFileComponent> {
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
    constructor(data?: Partial<APIFileComponent>);
    /**
     * Sets the spoiler status of this file.
     *
     * @param spoiler - The spoiler status to use
     */
    setSpoiler(spoiler?: boolean): this;
    /**
     * Sets the media URL of this file.
     *
     * @param url - The URL to use
     */
    setURL(url: string): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIFileComponent;
}

declare class SeparatorBuilder extends ComponentBuilder<APISeparatorComponent> {
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
    constructor(data?: Partial<APISeparatorComponent>);
    /**
     * Sets whether this separator should show a divider line.
     *
     * @param divider - Whether to show a divider line
     */
    setDivider(divider?: boolean): this;
    /**
     * Sets the spacing of this separator.
     *
     * @param spacing - The spacing to use
     */
    setSpacing(spacing: SeparatorSpacingSize): this;
    /**
     * Clears the spacing of this separator.
     */
    clearSpacing(): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APISeparatorComponent;
}

declare class TextDisplayBuilder extends ComponentBuilder<APITextDisplayComponent> {
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
    constructor(data?: Partial<APITextDisplayComponent>);
    /**
     * Sets the text of this text display.
     *
     * @param content - The text to use
     */
    setContent(content: string): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APITextDisplayComponent;
}

/**
 * The builders that may be used within a container.
 */
type ContainerComponentBuilder = ActionRowBuilder<AnyComponentBuilder> | FileBuilder | MediaGalleryBuilder | SectionBuilder | SeparatorBuilder | TextDisplayBuilder;
/**
 * A builder that creates API-compatible JSON data for a container.
 */
declare class ContainerBuilder extends ComponentBuilder<APIContainerComponent> {
    /**
     * The components within this container.
     */
    readonly components: ContainerComponentBuilder[];
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
    constructor({ components, ...data }?: Partial<APIContainerComponent>);
    /**
     * Sets the accent color of this container.
     *
     * @param color - The color to use
     */
    setAccentColor(color?: RGBTuple | number): this;
    /**
     * Clears the accent color of this container.
     */
    clearAccentColor(): this;
    /**
     * Adds action row components to this container.
     *
     * @param components - The action row components to add
     */
    addActionRowComponents<ComponentType extends MessageActionRowComponentBuilder>(...components: RestOrArray<ActionRowBuilder<ComponentType> | APIActionRowComponent<APIComponentInMessageActionRow> | ((builder: ActionRowBuilder<ComponentType>) => ActionRowBuilder<ComponentType>)>): this;
    /**
     * Adds file components to this container.
     *
     * @param components - The file components to add
     */
    addFileComponents(...components: RestOrArray<APIFileComponent | FileBuilder | ((builder: FileBuilder) => FileBuilder)>): this;
    /**
     * Adds media gallery components to this container.
     *
     * @param components - The media gallery components to add
     */
    addMediaGalleryComponents(...components: RestOrArray<APIMediaGalleryComponent | MediaGalleryBuilder | ((builder: MediaGalleryBuilder) => MediaGalleryBuilder)>): this;
    /**
     * Adds section components to this container.
     *
     * @param components - The section components to add
     */
    addSectionComponents(...components: RestOrArray<APISectionComponent | SectionBuilder | ((builder: SectionBuilder) => SectionBuilder)>): this;
    /**
     * Adds separator components to this container.
     *
     * @param components - The separator components to add
     */
    addSeparatorComponents(...components: RestOrArray<APISeparatorComponent | SeparatorBuilder | ((builder: SeparatorBuilder) => SeparatorBuilder)>): this;
    /**
     * Adds text display components to this container.
     *
     * @param components - The text display components to add
     */
    addTextDisplayComponents(...components: RestOrArray<APITextDisplayComponent | TextDisplayBuilder | ((builder: TextDisplayBuilder) => TextDisplayBuilder)>): this;
    /**
     * Removes, replaces, or inserts components for this container.
     *
     * @param index - The index to start removing, replacing or inserting components
     * @param deleteCount - The amount of components to remove
     * @param components - The components to set
     */
    spliceComponents(index: number, deleteCount: number, ...components: RestOrArray<APIComponentInContainer | ContainerComponentBuilder>): this;
    /**
     * Sets the spoiler status of this container.
     *
     * @param spoiler - The spoiler status to use
     */
    setSpoiler(spoiler?: boolean): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIContainerComponent;
}

declare class MediaGalleryItemBuilder implements JSONEncodable<APIMediaGalleryItem> {
    /**
     * The API data associated with this media gallery item.
     */
    readonly data: Partial<APIMediaGalleryItem>;
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
    constructor(data?: Partial<APIMediaGalleryItem>);
    /**
     * Sets the description of this media gallery item.
     *
     * @param description - The description to use
     */
    setDescription(description: string): this;
    /**
     * Clears the description of this media gallery item.
     */
    clearDescription(): this;
    /**
     * Sets the spoiler status of this media gallery item.
     *
     * @param spoiler - The spoiler status to use
     */
    setSpoiler(spoiler?: boolean): this;
    /**
     * Sets the media URL of this media gallery item.
     *
     * @param url - The URL to use
     */
    setURL(url: string): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): APIMediaGalleryItem;
}

/**
 * A builder that creates API-compatible JSON data for a container.
 */
declare class MediaGalleryBuilder extends ComponentBuilder<APIMediaGalleryComponent> {
    /**
     * The components within this container.
     */
    readonly items: MediaGalleryItemBuilder[];
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
    constructor({ items, ...data }?: Partial<APIMediaGalleryComponent>);
    /**
     * Adds items to this media gallery.
     *
     * @param items - The items to add
     */
    addItems(...items: RestOrArray<APIMediaGalleryItem | MediaGalleryItemBuilder | ((builder: MediaGalleryItemBuilder) => MediaGalleryItemBuilder)>): this;
    /**
     * Removes, replaces, or inserts media gallery items for this media gallery.
     *
     * @param index - The index to start removing, replacing or inserting items
     * @param deleteCount - The amount of items to remove
     * @param items - The items to insert
     */
    spliceItems(index: number, deleteCount: number, ...items: RestOrArray<APIMediaGalleryItem | MediaGalleryItemBuilder | ((builder: MediaGalleryItemBuilder) => MediaGalleryItemBuilder)>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIMediaGalleryComponent;
}

/**
 * A builder that creates API-compatible JSON data for a section.
 */
declare class SectionBuilder extends ComponentBuilder<APISectionComponent> {
    /**
     * The components within this section.
     */
    readonly components: ComponentBuilder[];
    /**
     * The accessory of this section.
     */
    readonly accessory?: ButtonBuilder | ThumbnailBuilder;
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
    constructor({ components, accessory, ...data }?: Partial<APISectionComponent>);
    /**
     * Sets the accessory of this section to a button.
     *
     * @param accessory - The accessory to use
     */
    setButtonAccessory(accessory: APIButtonComponent | ButtonBuilder | ((builder: ButtonBuilder) => ButtonBuilder)): this;
    /**
     * Sets the accessory of this section to a thumbnail.
     *
     * @param accessory - The accessory to use
     */
    setThumbnailAccessory(accessory: APIThumbnailComponent | ThumbnailBuilder | ((builder: ThumbnailBuilder) => ThumbnailBuilder)): this;
    /**
     * Adds text display components to this section.
     *
     * @param components - The text display components to add
     */
    addTextDisplayComponents(...components: RestOrArray<TextDisplayBuilder | ((builder: TextDisplayBuilder) => TextDisplayBuilder)>): this;
    /**
     * Removes, replaces, or inserts text display components for this section.
     *
     * @param index - The index to start removing, replacing or inserting text display components
     * @param deleteCount - The amount of text display components to remove
     * @param components - The text display components to insert
     */
    spliceTextDisplayComponents(index: number, deleteCount: number, ...components: RestOrArray<APITextDisplayComponent | TextDisplayBuilder | ((builder: TextDisplayBuilder) => TextDisplayBuilder)>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APISectionComponent;
}

declare class ThumbnailBuilder extends ComponentBuilder<APIThumbnailComponent> {
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
    constructor(data?: Partial<APIThumbnailComponent>);
    /**
     * Sets the description of this thumbnail.
     *
     * @param description - The description to use
     */
    setDescription(description: string): this;
    /**
     * Clears the description of this thumbnail.
     */
    clearDescription(): this;
    /**
     * Sets the spoiler status of this thumbnail.
     *
     * @param spoiler - The spoiler status to use
     */
    setSpoiler(spoiler?: boolean): this;
    /**
     * Sets the media URL of this thumbnail.
     *
     * @param url - The URL to use
     */
    setURL(url: string): this;
    /**
     * {@inheritdoc ComponentBuilder.toJSON}
     */
    toJSON(): APIThumbnailComponent;
}

/**
 * The builders that may be used for messages.
 */
type MessageComponentBuilder = ActionRowBuilder<MessageActionRowComponentBuilder> | ContainerBuilder | FileBuilder | MediaGalleryBuilder | MessageActionRowComponentBuilder | SectionBuilder | SeparatorBuilder | TextDisplayBuilder | ThumbnailBuilder;
/**
 * Components here are mapped to their respective builder.
 */
interface MappedComponentTypes {
    /**
     * The action row component type is associated with an {@link ActionRowBuilder}.
     */
    [ComponentType.ActionRow]: ActionRowBuilder<AnyComponentBuilder>;
    /**
     * The button component type is associated with a {@link ButtonBuilder}.
     */
    [ComponentType.Button]: ButtonBuilder;
    /**
     * The string select component type is associated with a {@link StringSelectMenuBuilder}.
     */
    [ComponentType.StringSelect]: StringSelectMenuBuilder;
    /**
     * The text input component type is associated with a {@link TextInputBuilder}.
     */
    [ComponentType.TextInput]: TextInputBuilder;
    /**
     * The user select component type is associated with a {@link UserSelectMenuBuilder}.
     */
    [ComponentType.UserSelect]: UserSelectMenuBuilder;
    /**
     * The role select component type is associated with a {@link RoleSelectMenuBuilder}.
     */
    [ComponentType.RoleSelect]: RoleSelectMenuBuilder;
    /**
     * The mentionable select component type is associated with a {@link MentionableSelectMenuBuilder}.
     */
    [ComponentType.MentionableSelect]: MentionableSelectMenuBuilder;
    /**
     * The channel select component type is associated with a {@link ChannelSelectMenuBuilder}.
     */
    [ComponentType.ChannelSelect]: ChannelSelectMenuBuilder;
    /**
     * The file component type is associated with a {@link FileBuilder}.
     */
    [ComponentType.File]: FileBuilder;
    /**
     * The separator component type is associated with a {@link SeparatorBuilder}.
     */
    [ComponentType.Separator]: SeparatorBuilder;
    /**
     * The container component type is associated with a {@link ContainerBuilder}.
     */
    [ComponentType.Container]: ContainerBuilder;
    /**
     * The text display component type is associated with a {@link TextDisplayBuilder}.
     */
    [ComponentType.TextDisplay]: TextDisplayBuilder;
    /**
     * The thumbnail component type is associated with a {@link ThumbnailBuilder}.
     */
    [ComponentType.Thumbnail]: ThumbnailBuilder;
    /**
     * The section component type is associated with a {@link SectionBuilder}.
     */
    [ComponentType.Section]: SectionBuilder;
    /**
     * The media gallery component type is associated with a {@link MediaGalleryBuilder}.
     */
    [ComponentType.MediaGallery]: MediaGalleryBuilder;
    /**
     * The label component type is associated with a {@link LabelBuilder}.
     */
    [ComponentType.Label]: LabelBuilder;
    /**
     * The file upload component type is associated with a {@link FileUploadBuilder}.
     */
    [ComponentType.FileUpload]: FileUploadBuilder;
}
/**
 * Factory for creating components from API data.
 *
 * @typeParam ComponentType - The type of component to use
 * @param data - The API data to transform to a component class
 */
declare function createComponentBuilder<ComponentType extends keyof MappedComponentTypes>(data: (APIModalComponent | APIMessageComponent) & {
    type: ComponentType;
}): MappedComponentTypes[ComponentType];
/**
 * Factory for creating components from API data.
 *
 * @typeParam ComponentBuilder - The type of component to use
 * @param data - The API data to transform to a component class
 */
declare function createComponentBuilder<ComponentBuilder extends MessageComponentBuilder | ModalComponentBuilder>(data: ComponentBuilder): ComponentBuilder;
declare function resolveBuilder<ComponentType extends Record<PropertyKey, any>, Builder extends JSONEncodable<any>>(builder: Builder | ComponentType | ((builder: Builder) => Builder), Constructor: new (data?: ComponentType) => Builder): Builder;

declare const textInputStyleValidator: _sapphire_shapeshift.NativeEnumValidator<typeof TextInputStyle>;
declare const minLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const maxLengthValidator: _sapphire_shapeshift.NumberValidator<number>;
declare const requiredValidator: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const valueValidator: _sapphire_shapeshift.StringValidator<string>;
declare const placeholderValidator: _sapphire_shapeshift.StringValidator<string>;
declare const labelValidator: _sapphire_shapeshift.StringValidator<string>;
declare const textInputPredicate: _sapphire_shapeshift.ObjectValidator<{
    type: ComponentType;
    custom_id: string;
    style: TextInputStyle;
    id: number | undefined;
    min_length: number | undefined;
    max_length: number | undefined;
    placeholder: string | undefined;
    value: string | undefined;
    required: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    type: ComponentType;
    custom_id: string;
    style: TextInputStyle;
    id: number | undefined;
    min_length: number | undefined;
    max_length: number | undefined;
    placeholder: string | undefined;
    value: string | undefined;
    required: boolean | undefined;
}>>;
declare function validateRequiredParameters$3(customId?: string, style?: TextInputStyle): void;

declare const Assertions$6_labelValidator: typeof labelValidator;
declare const Assertions$6_maxLengthValidator: typeof maxLengthValidator;
declare const Assertions$6_minLengthValidator: typeof minLengthValidator;
declare const Assertions$6_placeholderValidator: typeof placeholderValidator;
declare const Assertions$6_requiredValidator: typeof requiredValidator;
declare const Assertions$6_textInputPredicate: typeof textInputPredicate;
declare const Assertions$6_textInputStyleValidator: typeof textInputStyleValidator;
declare const Assertions$6_valueValidator: typeof valueValidator;
declare namespace Assertions$6 {
  export { Assertions$6_labelValidator as labelValidator, Assertions$6_maxLengthValidator as maxLengthValidator, Assertions$6_minLengthValidator as minLengthValidator, Assertions$6_placeholderValidator as placeholderValidator, Assertions$6_requiredValidator as requiredValidator, Assertions$6_textInputPredicate as textInputPredicate, Assertions$6_textInputStyleValidator as textInputStyleValidator, validateRequiredParameters$3 as validateRequiredParameters, Assertions$6_valueValidator as valueValidator };
}

/**
 * A builder that creates API-compatible JSON data for modals.
 */
declare class ModalBuilder implements JSONEncodable<APIModalInteractionResponseCallbackData> {
    /**
     * The API data associated with this modal.
     */
    readonly data: Partial<APIModalInteractionResponseCallbackData>;
    /**
     * The components within this modal.
     */
    readonly components: (ActionRowBuilder<ModalActionRowComponentBuilder> | LabelBuilder | TextDisplayBuilder)[];
    /**
     * Creates a new modal from API data.
     *
     * @param data - The API data to create this modal with
     */
    constructor({ components, ...data }?: Partial<APIModalInteractionResponseCallbackData>);
    /**
     * Sets the title of this modal.
     *
     * @param title - The title to use
     */
    setTitle(title: string): this;
    /**
     * Sets the custom id of this modal.
     *
     * @param customId - The custom id to use
     */
    setCustomId(customId: string): this;
    /**
     * Adds components to this modal.
     *
     * @param components - The components to add
     * @deprecated Use {@link ModalBuilder.addLabelComponents} or {@link ModalBuilder.addTextDisplayComponents} instead
     */
    addComponents(...components: RestOrArray<ActionRowBuilder<ModalActionRowComponentBuilder> | APIActionRowComponent<APIComponentInModalActionRow> | APILabelComponent | APITextDisplayComponent | APITextInputComponent | LabelBuilder | TextDisplayBuilder | TextInputBuilder>): this;
    /**
     * Adds label components to this modal.
     *
     * @param components - The components to add
     */
    addLabelComponents(...components: RestOrArray<APILabelComponent | LabelBuilder | ((builder: LabelBuilder) => LabelBuilder)>): this;
    /**
     * Adds text display components to this modal.
     *
     * @param components - The components to add
     */
    addTextDisplayComponents(...components: RestOrArray<APITextDisplayComponent | TextDisplayBuilder | ((builder: TextDisplayBuilder) => TextDisplayBuilder)>): this;
    /**
     * Adds action rows to this modal.
     *
     * @param components - The components to add
     * @deprecated Use {@link ModalBuilder.addLabelComponents} instead
     */
    addActionRowComponents(...components: RestOrArray<ActionRowBuilder<ModalActionRowComponentBuilder> | APIActionRowComponent<APIComponentInModalActionRow> | ((builder: ActionRowBuilder<ModalActionRowComponentBuilder>) => ActionRowBuilder<ModalActionRowComponentBuilder>)>): this;
    /**
     * Sets the labels for this modal.
     *
     * @param components - The components to set
     */
    setLabelComponents(...components: RestOrArray<APILabelComponent | LabelBuilder | ((builder: LabelBuilder) => LabelBuilder)>): this;
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
    spliceLabelComponents(index: number, deleteCount: number, ...labels: (APILabelComponent | LabelBuilder | ((builder: LabelBuilder) => LabelBuilder))[]): this;
    /**
     * Sets components for this modal.
     *
     * @param components - The components to set
     * @deprecated Use {@link ModalBuilder.setLabelComponents} instead
     */
    setComponents(...components: RestOrArray<ActionRowBuilder<ModalActionRowComponentBuilder> | LabelBuilder | TextDisplayBuilder>): this;
    /**
     * {@inheritDoc ComponentBuilder.toJSON}
     */
    toJSON(): APIModalInteractionResponseCallbackData;
}

declare const titleValidator: _sapphire_shapeshift.StringValidator<string>;
declare const componentsValidator: _sapphire_shapeshift.ArrayValidator<[LabelBuilder | ActionRowBuilder<AnyComponentBuilder> | TextDisplayBuilder, ...(LabelBuilder | ActionRowBuilder<AnyComponentBuilder> | TextDisplayBuilder)[]], LabelBuilder | ActionRowBuilder<AnyComponentBuilder> | TextDisplayBuilder>;
declare function validateRequiredParameters$2(customId?: string, title?: string, components?: (ActionRowBuilder<ModalActionRowComponentBuilder> | LabelBuilder | TextDisplayBuilder)[]): void;

declare const Assertions$5_componentsValidator: typeof componentsValidator;
declare const Assertions$5_titleValidator: typeof titleValidator;
declare namespace Assertions$5 {
  export { Assertions$5_componentsValidator as componentsValidator, Assertions$5_titleValidator as titleValidator, validateRequiredParameters$2 as validateRequiredParameters };
}

declare const fileUploadPredicate: _sapphire_shapeshift.ObjectValidator<{
    type: ComponentType;
    id: number | undefined;
    custom_id: string;
    min_values: number | undefined;
    max_values: number | undefined;
    required: boolean | undefined;
}, _sapphire_shapeshift.UndefinedToOptional<{
    type: ComponentType;
    id: number | undefined;
    custom_id: string;
    min_values: number | undefined;
    max_values: number | undefined;
    required: boolean | undefined;
}>>;

declare const Assertions$4_fileUploadPredicate: typeof fileUploadPredicate;
declare namespace Assertions$4 {
  export { Assertions$4_fileUploadPredicate as fileUploadPredicate };
}

declare const labelPredicate: _sapphire_shapeshift.ObjectValidator<{
    id: number | undefined;
    type: ComponentType;
    label: string;
    description: string | undefined;
    component: _sapphire_shapeshift.UndefinedToOptional<{
        type: any;
        id: any;
        custom_id: any;
        min_values: any;
        max_values: any;
        required: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        type: any;
        custom_id: any;
        style: any;
        id: any;
        min_length: any;
        max_length: any;
        placeholder: any;
        value: any;
        required: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        id: any;
        placeholder: any;
        min_values: any;
        max_values: any;
        custom_id: any;
        disabled: any;
    } & {
        type: any;
        default_values: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        id: any;
        placeholder: any;
        min_values: any;
        max_values: any;
        custom_id: any;
        disabled: any;
    } & {
        type: any;
        options: any;
    }>;
}, _sapphire_shapeshift.UndefinedToOptional<{
    id: number | undefined;
    type: ComponentType;
    label: string;
    description: string | undefined;
    component: _sapphire_shapeshift.UndefinedToOptional<{
        type: any;
        id: any;
        custom_id: any;
        min_values: any;
        max_values: any;
        required: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        type: any;
        custom_id: any;
        style: any;
        id: any;
        min_length: any;
        max_length: any;
        placeholder: any;
        value: any;
        required: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        id: any;
        placeholder: any;
        min_values: any;
        max_values: any;
        custom_id: any;
        disabled: any;
    } & {
        type: any;
        default_values: any;
    }> | _sapphire_shapeshift.UndefinedToOptional<{
        id: any;
        placeholder: any;
        min_values: any;
        max_values: any;
        custom_id: any;
        disabled: any;
    } & {
        type: any;
        options: any;
    }>;
}>>;

declare const Assertions$3_labelPredicate: typeof labelPredicate;
declare namespace Assertions$3 {
  export { Assertions$3_labelPredicate as labelPredicate };
}

declare const unfurledMediaItemPredicate: _sapphire_shapeshift.ObjectValidator<{
    url: string;
}, _sapphire_shapeshift.UndefinedToOptional<{
    url: string;
}>>;
declare const descriptionPredicate: _sapphire_shapeshift.StringValidator<string>;
declare const filePredicate: _sapphire_shapeshift.ObjectValidator<{
    url: string;
}, _sapphire_shapeshift.UndefinedToOptional<{
    url: string;
}>>;
declare const spoilerPredicate: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const dividerPredicate: _sapphire_shapeshift.BooleanValidator<boolean>;
declare const spacingPredicate: _sapphire_shapeshift.NativeEnumValidator<typeof SeparatorSpacingSize>;
declare const textDisplayContentPredicate: _sapphire_shapeshift.StringValidator<string>;
declare const accessoryPredicate: _sapphire_shapeshift.UnionValidator<ButtonBuilder | ThumbnailBuilder>;
declare const containerColorPredicate: _sapphire_shapeshift.UnionValidator<number | [number, number, number] | null | undefined>;
declare function assertReturnOfBuilder$1<ReturnType extends MediaGalleryItemBuilder | TextDisplayBuilder>(input: unknown, ExpectedInstanceOf: new () => ReturnType): asserts input is ReturnType;
declare function validateComponentArray<ReturnType extends ContainerComponentBuilder | MediaGalleryItemBuilder = ContainerComponentBuilder>(input: unknown, min: number, max: number, ExpectedInstanceOf?: new () => ReturnType): asserts input is ReturnType[];

declare const Assertions$2_accessoryPredicate: typeof accessoryPredicate;
declare const Assertions$2_containerColorPredicate: typeof containerColorPredicate;
declare const Assertions$2_descriptionPredicate: typeof descriptionPredicate;
declare const Assertions$2_dividerPredicate: typeof dividerPredicate;
declare const Assertions$2_filePredicate: typeof filePredicate;
declare const Assertions$2_spacingPredicate: typeof spacingPredicate;
declare const Assertions$2_spoilerPredicate: typeof spoilerPredicate;
declare const Assertions$2_textDisplayContentPredicate: typeof textDisplayContentPredicate;
declare const Assertions$2_unfurledMediaItemPredicate: typeof unfurledMediaItemPredicate;
declare const Assertions$2_validateComponentArray: typeof validateComponentArray;
declare namespace Assertions$2 {
  export { Assertions$2_accessoryPredicate as accessoryPredicate, assertReturnOfBuilder$1 as assertReturnOfBuilder, Assertions$2_containerColorPredicate as containerColorPredicate, Assertions$2_descriptionPredicate as descriptionPredicate, Assertions$2_dividerPredicate as dividerPredicate, Assertions$2_filePredicate as filePredicate, Assertions$2_spacingPredicate as spacingPredicate, Assertions$2_spoilerPredicate as spoilerPredicate, Assertions$2_textDisplayContentPredicate as textDisplayContentPredicate, Assertions$2_unfurledMediaItemPredicate as unfurledMediaItemPredicate, Assertions$2_validateComponentArray as validateComponentArray };
}

/**
 * This mixin holds name and description symbols for slash commands.
 */
declare class SharedNameAndDescription {
    /**
     * The name of this command.
     */
    readonly name: string;
    /**
     * The name localizations of this command.
     */
    readonly name_localizations?: LocalizationMap;
    /**
     * The description of this command.
     */
    readonly description: string;
    /**
     * The description localizations of this command.
     */
    readonly description_localizations?: LocalizationMap;
    /**
     * Sets the name of this command.
     *
     * @param name - The name to use
     */
    setName(name: string): this;
    /**
     * Sets the description of this command.
     *
     * @param description - The description to use
     */
    setDescription(description: string): this;
    /**
     * Sets a name localization for this command.
     *
     * @param locale - The locale to set
     * @param localizedName - The localized name for the given `locale`
     */
    setNameLocalization(locale: LocaleString, localizedName: string | null): this;
    /**
     * Sets the name localizations for this command.
     *
     * @param localizedNames - The object of localized names to set
     */
    setNameLocalizations(localizedNames: LocalizationMap | null): this;
    /**
     * Sets a description localization for this command.
     *
     * @param locale - The locale to set
     * @param localizedDescription - The localized description for the given locale
     */
    setDescriptionLocalization(locale: LocaleString, localizedDescription: string | null): this;
    /**
     * Sets the description localizations for this command.
     *
     * @param localizedDescriptions - The object of localized descriptions to set
     */
    setDescriptionLocalizations(localizedDescriptions: LocalizationMap | null): this;
}

/**
 * This mixin holds symbols that can be shared in slashcommands independent of options or subcommands.
 */
declare class SharedSlashCommand {
    readonly name: string;
    readonly name_localizations?: LocalizationMap;
    readonly description: string;
    readonly description_localizations?: LocalizationMap;
    readonly options: ToAPIApplicationCommandOptions[];
    readonly contexts?: InteractionContextType[];
    /**
     * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
     */
    readonly default_permission: boolean | undefined;
    readonly default_member_permissions: Permissions | null | undefined;
    /**
     * @deprecated Use {@link SharedSlashCommand.contexts} instead.
     */
    readonly dm_permission: boolean | undefined;
    readonly integration_types?: ApplicationIntegrationType[];
    readonly nsfw: boolean | undefined;
    /**
     * Sets the contexts of this command.
     *
     * @param contexts - The contexts
     */
    setContexts(...contexts: RestOrArray<InteractionContextType>): this;
    /**
     * Sets the integration types of this command.
     *
     * @param integrationTypes - The integration types
     */
    setIntegrationTypes(...integrationTypes: RestOrArray<ApplicationIntegrationType>): this;
    /**
     * Sets whether the command is enabled by default when the application is added to a guild.
     *
     * @remarks
     * If set to `false`, you will have to later `PUT` the permissions for this command.
     * @param value - Whether or not to enable this command by default
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
     * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
     */
    setDefaultPermission(value: boolean): this;
    /**
     * Sets the default permissions a member should have in order to run the command.
     *
     * @remarks
     * You can set this to `'0'` to disable the command by default.
     * @param permissions - The permissions bit field to set
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
     */
    setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined): this;
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
    setDMPermission(enabled: boolean | null | undefined): this;
    /**
     * Sets whether this command is NSFW.
     *
     * @param nsfw - Whether this command is NSFW
     */
    setNSFW(nsfw?: boolean): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
}

/**
 * The base application command option builder that contains common symbols for application command builders.
 */
declare abstract class ApplicationCommandOptionBase extends SharedNameAndDescription {
    /**
     * The type of this option.
     */
    abstract readonly type: ApplicationCommandOptionType;
    /**
     * Whether this option is required.
     *
     * @defaultValue `false`
     */
    readonly required: boolean;
    /**
     * Sets whether this option is required.
     *
     * @param required - Whether this option should be required
     */
    setRequired(required: boolean): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    abstract toJSON(): APIApplicationCommandBasicOption;
    /**
     * This method runs required validators on this builder.
     */
    protected runRequiredValidations(): void;
}

/**
 * A slash command attachment option.
 */
declare class SlashCommandAttachmentOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Attachment;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandAttachmentOption;
}

/**
 * A slash command boolean option.
 */
declare class SlashCommandBooleanOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Boolean;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandBooleanOption;
}

/**
 * The allowed channel types used for a channel option in a slash command builder.
 *
 * @privateRemarks This can't be dynamic because const enums are erased at runtime.
 * @internal
 */
declare const allowedChannelTypes: readonly [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildCategory, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildStageVoice, ChannelType.GuildForum, ChannelType.GuildMedia];
/**
 * The type of allowed channel types used for a channel option.
 */
type ApplicationCommandOptionAllowedChannelTypes = (typeof allowedChannelTypes)[number];
/**
 * This mixin holds channel type symbols used for options.
 */
declare class ApplicationCommandOptionChannelTypesMixin {
    /**
     * The channel types of this option.
     */
    readonly channel_types?: ApplicationCommandOptionAllowedChannelTypes[];
    /**
     * Adds channel types to this option.
     *
     * @param channelTypes - The channel types
     */
    addChannelTypes(...channelTypes: RestOrArray<ApplicationCommandOptionAllowedChannelTypes>): this;
}

/**
 * A slash command channel option.
 */
declare class SlashCommandChannelOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Channel;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandChannelOption;
}
interface SlashCommandChannelOption extends ApplicationCommandOptionChannelTypesMixin {
}

/**
 * This mixin holds minimum and maximum symbols used for options.
 */
declare abstract class ApplicationCommandNumericOptionMinMaxValueMixin {
    /**
     * The maximum value of this option.
     */
    readonly max_value?: number;
    /**
     * The minimum value of this option.
     */
    readonly min_value?: number;
    /**
     * Sets the maximum number value of this option.
     *
     * @param max - The maximum value this option can be
     */
    abstract setMaxValue(max: number): this;
    /**
     * Sets the minimum number value of this option.
     *
     * @param min - The minimum value this option can be
     */
    abstract setMinValue(min: number): this;
}

/**
 * This mixin holds choices and autocomplete symbols used for options.
 */
declare class ApplicationCommandOptionWithAutocompleteMixin {
    /**
     * Whether this option utilizes autocomplete.
     */
    readonly autocomplete?: boolean;
    /**
     * The type of this option.
     *
     * @privateRemarks Since this is present and this is a mixin, this is needed.
     */
    readonly type: ApplicationCommandOptionType;
    /**
     * Whether this option uses autocomplete.
     *
     * @param autocomplete - Whether this option should use autocomplete
     */
    setAutocomplete(autocomplete: boolean): this;
}

/**
 * This mixin holds choices and autocomplete symbols used for options.
 */
declare class ApplicationCommandOptionWithChoicesMixin<ChoiceType extends number | string> {
    /**
     * The choices of this option.
     */
    readonly choices?: APIApplicationCommandOptionChoice<ChoiceType>[];
    /**
     * The type of this option.
     *
     * @privateRemarks Since this is present and this is a mixin, this is needed.
     */
    readonly type: ApplicationCommandOptionType;
    /**
     * Adds multiple choices to this option.
     *
     * @param choices - The choices to add
     */
    addChoices(...choices: RestOrArray<APIApplicationCommandOptionChoice<ChoiceType>>): this;
    /**
     * Sets multiple choices for this option.
     *
     * @param choices - The choices to set
     */
    setChoices<Input extends APIApplicationCommandOptionChoice<ChoiceType>>(...choices: RestOrArray<Input>): this;
}

/**
 * A slash command integer option.
 */
declare class SlashCommandIntegerOption extends ApplicationCommandOptionBase implements ApplicationCommandNumericOptionMinMaxValueMixin {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Integer;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
     */
    setMaxValue(max: number): this;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
     */
    setMinValue(min: number): this;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandIntegerOption;
}
interface SlashCommandIntegerOption extends ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesMixin<number>, ApplicationCommandOptionWithAutocompleteMixin {
}

/**
 * A slash command mentionable option.
 */
declare class SlashCommandMentionableOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Mentionable;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandMentionableOption;
}

/**
 * A slash command number option.
 */
declare class SlashCommandNumberOption extends ApplicationCommandOptionBase implements ApplicationCommandNumericOptionMinMaxValueMixin {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Number;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMaxValue}
     */
    setMaxValue(max: number): this;
    /**
     * {@inheritDoc ApplicationCommandNumericOptionMinMaxValueMixin.setMinValue}
     */
    setMinValue(min: number): this;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandNumberOption;
}
interface SlashCommandNumberOption extends ApplicationCommandNumericOptionMinMaxValueMixin, ApplicationCommandOptionWithChoicesMixin<number>, ApplicationCommandOptionWithAutocompleteMixin {
}

/**
 * A slash command role option.
 */
declare class SlashCommandRoleOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.Role;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandRoleOption;
}

/**
 * A slash command string option.
 */
declare class SlashCommandStringOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.String;
    /**
     * The maximum length of this option.
     */
    readonly max_length?: number;
    /**
     * The minimum length of this option.
     */
    readonly min_length?: number;
    /**
     * Sets the maximum length of this string option.
     *
     * @param max - The maximum length this option can be
     */
    setMaxLength(max: number): this;
    /**
     * Sets the minimum length of this string option.
     *
     * @param min - The minimum length this option can be
     */
    setMinLength(min: number): this;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandStringOption;
}
interface SlashCommandStringOption extends ApplicationCommandOptionWithChoicesMixin<string>, ApplicationCommandOptionWithAutocompleteMixin {
}

/**
 * A slash command user option.
 */
declare class SlashCommandUserOption extends ApplicationCommandOptionBase {
    /**
     * The type of this option.
     */
    readonly type: ApplicationCommandOptionType.User;
    /**
     * {@inheritDoc ApplicationCommandOptionBase.toJSON}
     */
    toJSON(): APIApplicationCommandUserOption;
}

/**
 * This mixin holds symbols that can be shared in slash command options.
 *
 * @typeParam TypeAfterAddingOptions - The type this class should return after adding an option.
 */
declare class SharedSlashCommandOptions<TypeAfterAddingOptions extends SharedSlashCommandOptions<TypeAfterAddingOptions>> {
    readonly options: ToAPIApplicationCommandOptions[];
    /**
     * Adds a boolean option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): TypeAfterAddingOptions;
    /**
     * Adds a user option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): TypeAfterAddingOptions;
    /**
     * Adds a channel option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): TypeAfterAddingOptions;
    /**
     * Adds a role option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): TypeAfterAddingOptions;
    /**
     * Adds an attachment option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): TypeAfterAddingOptions;
    /**
     * Adds a mentionable option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): TypeAfterAddingOptions;
    /**
     * Adds a string option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addStringOption(input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption)): TypeAfterAddingOptions;
    /**
     * Adds an integer option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addIntegerOption(input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption)): TypeAfterAddingOptions;
    /**
     * Adds a number option.
     *
     * @param input - A function that returns an option builder or an already built builder
     */
    addNumberOption(input: SlashCommandNumberOption | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption)): TypeAfterAddingOptions;
    /**
     * Where the actual adding magic happens. ✨
     *
     * @param input - The input. What else?
     * @param Instance - The instance of whatever is being added
     * @internal
     */
    private _sharedAddOptionMethod;
}

/**
 * Represents a folder for subcommands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups}
 */
declare class SlashCommandSubcommandGroupBuilder implements ToAPIApplicationCommandOptions {
    /**
     * The name of this subcommand group.
     */
    readonly name: string;
    /**
     * The description of this subcommand group.
     */
    readonly description: string;
    /**
     * The subcommands within this subcommand group.
     */
    readonly options: SlashCommandSubcommandBuilder[];
    /**
     * Adds a new subcommand to this group.
     *
     * @param input - A function that returns a subcommand builder or an already built builder
     */
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): APIApplicationCommandSubcommandGroupOption;
}
interface SlashCommandSubcommandGroupBuilder extends SharedNameAndDescription {
}
/**
 * A builder that creates API-compatible JSON data for slash command subcommands.
 *
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#subcommands-and-subcommand-groups}
 */
declare class SlashCommandSubcommandBuilder implements ToAPIApplicationCommandOptions {
    /**
     * The name of this subcommand.
     */
    readonly name: string;
    /**
     * The description of this subcommand.
     */
    readonly description: string;
    /**
     * The options within this subcommand.
     */
    readonly options: ApplicationCommandOptionBase[];
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): APIApplicationCommandSubcommandOption;
}
interface SlashCommandSubcommandBuilder extends SharedNameAndDescription, SharedSlashCommandOptions<SlashCommandSubcommandBuilder> {
}

/**
 * This mixin holds symbols that can be shared in slash subcommands.
 *
 * @typeParam TypeAfterAddingSubcommands - The type this class should return after adding a subcommand or subcommand group.
 */
declare class SharedSlashCommandSubcommands<TypeAfterAddingSubcommands extends SharedSlashCommandSubcommands<TypeAfterAddingSubcommands>> {
    readonly options: ToAPIApplicationCommandOptions[];
    /**
     * Adds a new subcommand group to this command.
     *
     * @param input - A function that returns a subcommand group builder or an already built builder
     */
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): TypeAfterAddingSubcommands;
    /**
     * Adds a new subcommand to this command.
     *
     * @param input - A function that returns a subcommand builder or an already built builder
     */
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): TypeAfterAddingSubcommands;
}

/**
 * A builder that creates API-compatible JSON data for slash commands.
 */
declare class SlashCommandBuilder {
    /**
     * The name of this command.
     */
    readonly name: string;
    /**
     * The name localizations of this command.
     */
    readonly name_localizations?: LocalizationMap;
    /**
     * The description of this command.
     */
    readonly description: string;
    /**
     * The description localizations of this command.
     */
    readonly description_localizations?: LocalizationMap;
    /**
     * The options of this command.
     */
    readonly options: ToAPIApplicationCommandOptions[];
    /**
     * The contexts for this command.
     */
    readonly contexts?: InteractionContextType[];
    /**
     * Whether this command is enabled by default when the application is added to a guild.
     *
     * @deprecated Use {@link SharedSlashCommand.setDefaultMemberPermissions} or {@link SharedSlashCommand.setDMPermission} instead.
     */
    readonly default_permission: boolean | undefined;
    /**
     * The set of permissions represented as a bit set for the command.
     */
    readonly default_member_permissions: Permissions | null | undefined;
    /**
     * Indicates whether the command is available in direct messages with the application.
     *
     * @remarks
     * By default, commands are visible. This property is only for global commands.
     * @deprecated
     * Use {@link SlashCommandBuilder.contexts} instead.
     */
    readonly dm_permission: boolean | undefined;
    /**
     * The integration types for this command.
     */
    readonly integration_types?: ApplicationIntegrationType[];
    /**
     * Whether this command is NSFW.
     */
    readonly nsfw: boolean | undefined;
}
interface SlashCommandBuilder extends SharedNameAndDescription, SharedSlashCommandOptions<SlashCommandOptionsOnlyBuilder>, SharedSlashCommandSubcommands<SlashCommandSubcommandsOnlyBuilder>, SharedSlashCommand {
}
/**
 * An interface specifically for slash command subcommands.
 */
interface SlashCommandSubcommandsOnlyBuilder extends SharedNameAndDescription, SharedSlashCommandSubcommands<SlashCommandSubcommandsOnlyBuilder>, SharedSlashCommand {
}
/**
 * An interface specifically for slash command options.
 */
interface SlashCommandOptionsOnlyBuilder extends SharedNameAndDescription, SharedSlashCommandOptions<SlashCommandOptionsOnlyBuilder>, SharedSlashCommand {
}
/**
 * An interface that ensures the `toJSON()` call will return something
 * that can be serialized into API-compatible data.
 */
interface ToAPIApplicationCommandOptions {
    toJSON(): APIApplicationCommandOption;
}

declare function validateName$1(name: unknown): asserts name is string;
declare function validateDescription(description: unknown): asserts description is string;
declare function validateLocale(locale: unknown): Locale;
declare function validateMaxOptionsLength(options: unknown): asserts options is ToAPIApplicationCommandOptions[];
declare function validateRequiredParameters$1(name: string, description: string, options: ToAPIApplicationCommandOptions[]): void;
declare function validateDefaultPermission$1(value: unknown): asserts value is boolean;
declare function validateRequired(required: unknown): asserts required is boolean;
declare function validateChoicesLength(amountAdding: number, choices?: APIApplicationCommandOptionChoice[]): void;
declare function assertReturnOfBuilder<ReturnType extends ApplicationCommandOptionBase | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder>(input: unknown, ExpectedInstanceOf: new () => ReturnType): asserts input is ReturnType;
declare const localizationMapPredicate: _sapphire_shapeshift.UnionValidator<_sapphire_shapeshift.UndefinedToOptional<Partial<Record<Locale, string | null>>> | null | undefined>;
declare function validateLocalizationMap(value: unknown): asserts value is LocalizationMap;
declare function validateDMPermission$1(value: unknown): asserts value is boolean | null | undefined;
declare function validateDefaultMemberPermissions$1(permissions: unknown): string | null | undefined;
declare function validateNSFW(value: unknown): asserts value is boolean;
declare const contextsPredicate$1: _sapphire_shapeshift.ArrayValidator<InteractionContextType[], InteractionContextType>;
declare const integrationTypesPredicate$1: _sapphire_shapeshift.ArrayValidator<ApplicationIntegrationType[], ApplicationIntegrationType>;

declare const Assertions$1_assertReturnOfBuilder: typeof assertReturnOfBuilder;
declare const Assertions$1_localizationMapPredicate: typeof localizationMapPredicate;
declare const Assertions$1_validateChoicesLength: typeof validateChoicesLength;
declare const Assertions$1_validateDescription: typeof validateDescription;
declare const Assertions$1_validateLocale: typeof validateLocale;
declare const Assertions$1_validateLocalizationMap: typeof validateLocalizationMap;
declare const Assertions$1_validateMaxOptionsLength: typeof validateMaxOptionsLength;
declare const Assertions$1_validateNSFW: typeof validateNSFW;
declare const Assertions$1_validateRequired: typeof validateRequired;
declare namespace Assertions$1 {
  export { Assertions$1_assertReturnOfBuilder as assertReturnOfBuilder, contextsPredicate$1 as contextsPredicate, integrationTypesPredicate$1 as integrationTypesPredicate, Assertions$1_localizationMapPredicate as localizationMapPredicate, Assertions$1_validateChoicesLength as validateChoicesLength, validateDMPermission$1 as validateDMPermission, validateDefaultMemberPermissions$1 as validateDefaultMemberPermissions, validateDefaultPermission$1 as validateDefaultPermission, Assertions$1_validateDescription as validateDescription, Assertions$1_validateLocale as validateLocale, Assertions$1_validateLocalizationMap as validateLocalizationMap, Assertions$1_validateMaxOptionsLength as validateMaxOptionsLength, Assertions$1_validateNSFW as validateNSFW, validateName$1 as validateName, Assertions$1_validateRequired as validateRequired, validateRequiredParameters$1 as validateRequiredParameters };
}

/**
 * The type a context menu command can be.
 */
type ContextMenuCommandType = ApplicationCommandType.Message | ApplicationCommandType.User;
/**
 * A builder that creates API-compatible JSON data for context menu commands.
 */
declare class ContextMenuCommandBuilder {
    /**
     * The name of this command.
     */
    readonly name: string;
    /**
     * The name localizations of this command.
     */
    readonly name_localizations?: LocalizationMap;
    /**
     * The type of this command.
     */
    readonly type: ContextMenuCommandType;
    /**
     * The contexts for this command.
     */
    readonly contexts?: InteractionContextType[];
    /**
     * Whether this command is enabled by default when the application is added to a guild.
     *
     * @deprecated Use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
     */
    readonly default_permission: boolean | undefined;
    /**
     * The set of permissions represented as a bit set for the command.
     */
    readonly default_member_permissions: Permissions | null | undefined;
    /**
     * Indicates whether the command is available in direct messages with the application.
     *
     * @remarks
     * By default, commands are visible. This property is only for global commands.
     * @deprecated
     * Use {@link ContextMenuCommandBuilder.contexts} instead.
     */
    readonly dm_permission: boolean | undefined;
    /**
     * The integration types for this command.
     */
    readonly integration_types?: ApplicationIntegrationType[];
    /**
     * Sets the contexts of this command.
     *
     * @param contexts - The contexts
     */
    setContexts(...contexts: RestOrArray<InteractionContextType>): this;
    /**
     * Sets integration types of this command.
     *
     * @param integrationTypes - The integration types
     */
    setIntegrationTypes(...integrationTypes: RestOrArray<ApplicationIntegrationType>): this;
    /**
     * Sets the name of this command.
     *
     * @param name - The name to use
     */
    setName(name: string): this;
    /**
     * Sets the type of this command.
     *
     * @param type - The type to use
     */
    setType(type: ContextMenuCommandType): this;
    /**
     * Sets whether the command is enabled by default when the application is added to a guild.
     *
     * @remarks
     * If set to `false`, you will have to later `PUT` the permissions for this command.
     * @param value - Whether to enable this command by default
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
     * @deprecated Use {@link ContextMenuCommandBuilder.setDefaultMemberPermissions} or {@link ContextMenuCommandBuilder.setDMPermission} instead.
     */
    setDefaultPermission(value: boolean): this;
    /**
     * Sets the default permissions a member should have in order to run this command.
     *
     * @remarks
     * You can set this to `'0'` to disable the command by default.
     * @param permissions - The permissions bit field to set
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
     */
    setDefaultMemberPermissions(permissions: Permissions | bigint | number | null | undefined): this;
    /**
     * Sets if the command is available in direct messages with the application.
     *
     * @remarks
     * By default, commands are visible. This method is only for global commands.
     * @param enabled - Whether the command should be enabled in direct messages
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
     * @deprecated Use {@link ContextMenuCommandBuilder.setContexts} instead.
     */
    setDMPermission(enabled: boolean | null | undefined): this;
    /**
     * Sets a name localization for this command.
     *
     * @param locale - The locale to set
     * @param localizedName - The localized name for the given `locale`
     */
    setNameLocalization(locale: LocaleString, localizedName: string | null): this;
    /**
     * Sets the name localizations for this command.
     *
     * @param localizedNames - The object of localized names to set
     */
    setNameLocalizations(localizedNames: LocalizationMap | null): this;
    /**
     * Serializes this builder to API-compatible JSON data.
     *
     * @remarks
     * This method runs validations on the data before serializing it.
     * As such, it may throw an error if the data is invalid.
     */
    toJSON(): RESTPostAPIContextMenuApplicationCommandsJSONBody;
}

declare function validateDefaultPermission(value: unknown): asserts value is boolean;
declare function validateName(name: unknown): asserts name is string;
declare function validateType(type: unknown): asserts type is ContextMenuCommandType;
declare function validateRequiredParameters(name: string, type: number): void;
declare function validateDMPermission(value: unknown): asserts value is boolean | null | undefined;
declare function validateDefaultMemberPermissions(permissions: unknown): string | null | undefined;
declare const contextsPredicate: _sapphire_shapeshift.ArrayValidator<InteractionContextType[], InteractionContextType>;
declare const integrationTypesPredicate: _sapphire_shapeshift.ArrayValidator<ApplicationIntegrationType[], ApplicationIntegrationType>;

declare const Assertions_contextsPredicate: typeof contextsPredicate;
declare const Assertions_integrationTypesPredicate: typeof integrationTypesPredicate;
declare const Assertions_validateDMPermission: typeof validateDMPermission;
declare const Assertions_validateDefaultMemberPermissions: typeof validateDefaultMemberPermissions;
declare const Assertions_validateDefaultPermission: typeof validateDefaultPermission;
declare const Assertions_validateName: typeof validateName;
declare const Assertions_validateRequiredParameters: typeof validateRequiredParameters;
declare const Assertions_validateType: typeof validateType;
declare namespace Assertions {
  export { Assertions_contextsPredicate as contextsPredicate, Assertions_integrationTypesPredicate as integrationTypesPredicate, Assertions_validateDMPermission as validateDMPermission, Assertions_validateDefaultMemberPermissions as validateDefaultMemberPermissions, Assertions_validateDefaultPermission as validateDefaultPermission, Assertions_validateName as validateName, Assertions_validateRequiredParameters as validateRequiredParameters, Assertions_validateType as validateType };
}

/**
 * Calculates the length of the embed.
 *
 * @param data - The embed data to check
 */
declare function embedLength(data: APIEmbed): number;

/**
 * Enables validators.
 *
 * @returns Whether validation is occurring.
 */
declare function enableValidators(): boolean;
/**
 * Disables validators.
 *
 * @returns Whether validation is occurring.
 */
declare function disableValidators(): boolean;
/**
 * Checks whether validation is occurring.
 */
declare function isValidationEnabled(): boolean;

/**
 * The {@link https://github.com/discordjs/discord.js/blob/main/packages/builders#readme | @discordjs/builders} version
 * that you are currently using.
 *
 * @privateRemarks This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild.
 */
declare const version: string;

export { ActionRowBuilder, type AnyAPIActionRowComponent, type AnyComponentBuilder, ApplicationCommandNumericOptionMinMaxValueMixin, type ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionBase, ApplicationCommandOptionChannelTypesMixin, ApplicationCommandOptionWithAutocompleteMixin, ApplicationCommandOptionWithChoicesMixin, BaseSelectMenuBuilder, ButtonBuilder, ChannelSelectMenuBuilder, Assertions$7 as ComponentAssertions, ComponentBuilder, Assertions$2 as ComponentsV2Assertions, ContainerBuilder, type ContainerComponentBuilder, Assertions as ContextMenuCommandAssertions, ContextMenuCommandBuilder, type ContextMenuCommandType, Assertions$8 as EmbedAssertions, type EmbedAuthorData, type EmbedAuthorOptions, EmbedBuilder, type EmbedFooterData, type EmbedFooterOptions, type EmbedImageData, FileBuilder, Assertions$4 as FileUploadAssertions, FileUploadBuilder, type IconData, Assertions$3 as LabelAssertions, LabelBuilder, type LabelBuilderData, type MappedComponentTypes, MediaGalleryBuilder, MediaGalleryItemBuilder, MentionableSelectMenuBuilder, type MessageActionRowComponentBuilder, type MessageComponentBuilder, type ModalActionRowComponentBuilder, Assertions$5 as ModalAssertions, ModalBuilder, type ModalComponentBuilder, type RGBTuple, type RestOrArray, RoleSelectMenuBuilder, SectionBuilder, StringSelectMenuBuilder as SelectMenuBuilder, StringSelectMenuOptionBuilder as SelectMenuOptionBuilder, SeparatorBuilder, SharedNameAndDescription, SharedSlashCommand, SharedSlashCommandOptions, SharedSlashCommandSubcommands, Assertions$1 as SlashCommandAssertions, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, type SlashCommandOptionsOnlyBuilder, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, type SlashCommandSubcommandsOnlyBuilder, SlashCommandUserOption, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextDisplayBuilder, Assertions$6 as TextInputAssertions, TextInputBuilder, ThumbnailBuilder, type ToAPIApplicationCommandOptions, UserSelectMenuBuilder, createComponentBuilder, disableValidators, embedLength, enableValidators, isValidationEnabled, normalizeArray, resolveBuilder, version };
