export declare type BitFieldResolvable = number | BigInt | BitField | string | BitFieldResolvable[];
/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export declare class BitField {
    bitfield: bigint;
    static FLAGS: Record<string, bigint>;
    constructor(bits?: BitFieldResolvable);
    /**
     * Checks whether the bitfield has a bit, or any of multiple bits.
     */
    any(bit: BitFieldResolvable): boolean;
    /**
     * Checks if this bitfield equals another
     */
    equals(bit: BitFieldResolvable): boolean;
    /**
     * Checks whether the bitfield has a bit, or multiple bits.
     */
    has(bit: BitFieldResolvable): boolean;
    /**
     * Gets all given bits that are missing from the bitfield.
     */
    missing(bits: BitFieldResolvable): BitFieldResolvable[];
    /**
     * Freezes these bits, making them immutable.
     */
    freeze(): Readonly<BitField>;
    /**
     * Adds bits to these ones.
     * @param {...BitFieldResolvable} [bits] Bits to add
     * @returns {BitField} These bits or new BitField if the instance is frozen.
     */
    add(...bits: BitFieldResolvable[]): BitField;
    /**
     * Removes bits from these.
     * @param {...BitFieldResolvable} [bits] Bits to remove
     */
    remove(...bits: BitFieldResolvable[]): BitField;
    /**
     * Gets an object mapping field names to a {@link boolean} indicating whether the
     * bit is available.
     * @param {...*} hasParams Additional parameters for the has method, if any
     */
    serialize(): Record<string, boolean>;
    /**
     * Gets an {@link Array} of bitfield names based on the bits available.
     */
    toArray(): string[];
    toJSON(): bigint;
    valueOf(): bigint;
    [Symbol.iterator](): Generator<string, void, undefined>;
    /**
     * Data that can be resolved to give a bitfield. This can be:
     * * A bit number (this can be a number literal or a value taken from {@link BitField.FLAGS})
     * * An instance of BitField
     * * An Array of BitFieldResolvable
     * @typedef {number|BitField|BitFieldResolvable[]} BitFieldResolvable
     */
    /**
     * Resolves bitfields to their numeric form.
     * @param {BitFieldResolvable} [bit=0] - bit(s) to resolve
     * @returns {number}
     */
    static resolve(bit?: BitFieldResolvable): bigint;
}
