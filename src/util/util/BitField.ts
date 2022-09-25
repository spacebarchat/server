"use strict";

// https://github.com/discordjs/discord.js/blob/master/src/util/BitField.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah

export type BitFieldResolvable = number | BigInt | BitField | string | BitFieldResolvable[];

/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export class BitField {
	public bitfield: bigint = BigInt(0);

	public static FLAGS: Record<string, bigint> = {};

	constructor(bits: BitFieldResolvable = 0) {
		this.bitfield = BitField.resolve.call(this, bits);
	}

	/**
	 * Checks whether the bitfield has a bit, or any of multiple bits.
	 */
	any(bit: BitFieldResolvable): boolean {
		return (this.bitfield & BitField.resolve.call(this, bit)) !== BigInt(0);
	}

	/**
	 * Checks if this bitfield equals another
	 */
	equals(bit: BitFieldResolvable): boolean {
		return this.bitfield === BitField.resolve.call(this, bit);
	}

	/**
	 * Checks whether the bitfield has a bit, or multiple bits.
	 */
	has(bit: BitFieldResolvable): boolean {
		if (Array.isArray(bit)) return bit.every((p) => this.has(p));
		const BIT = BitField.resolve.call(this, bit);
		return (this.bitfield & BIT) === BIT;
	}

	/**
	 * Gets all given bits that are missing from the bitfield.
	 */
	missing(bits: BitFieldResolvable) {
		if (!Array.isArray(bits)) bits = new BitField(bits).toArray();
		return bits.filter((p) => !this.has(p));
	}

	/**
	 * Freezes these bits, making them immutable.
	 */
	freeze(): Readonly<BitField> {
		return Object.freeze(this);
	}

	/**
	 * Adds bits to these ones.
	 * @param {...BitFieldResolvable} [bits] Bits to add
	 * @returns {BitField} These bits or new BitField if the instance is frozen.
	 */
	add(...bits: BitFieldResolvable[]): BitField {
		let total = BigInt(0);
		for (const bit of bits) {
			total |= BitField.resolve.call(this, bit);
		}
		if (Object.isFrozen(this)) return new BitField(this.bitfield | total);
		this.bitfield |= total;
		return this;
	}

	/**
	 * Removes bits from these.
	 * @param {...BitFieldResolvable} [bits] Bits to remove
	 */
	remove(...bits: BitFieldResolvable[]) {
		let total = BigInt(0);
		for (const bit of bits) {
			total |= BitField.resolve.call(this, bit);
		}
		if (Object.isFrozen(this)) return new BitField(this.bitfield & ~total);
		this.bitfield &= ~total;
		return this;
	}

	/**
	 * Gets an object mapping field names to a {@link boolean} indicating whether the
	 * bit is available.
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 */
	serialize() {
		const serialized: Record<string, boolean> = {};
		for (const [flag, bit] of Object.entries(BitField.FLAGS)) serialized[flag] = this.has(bit);
		return serialized;
	}

	/**
	 * Gets an {@link Array} of bitfield names based on the bits available.
	 */
	toArray(): string[] {
		return Object.keys(BitField.FLAGS).filter((bit) => this.has(bit));
	}

	toJSON() {
		return this.bitfield;
	}

	valueOf() {
		return this.bitfield;
	}

	*[Symbol.iterator]() {
		yield* this.toArray();
	}

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
	static resolve(bit: BitFieldResolvable = BigInt(0)): bigint {
		// @ts-ignore
		const FLAGS = this.FLAGS || this.constructor?.FLAGS;
		if ((typeof bit === "number" || typeof bit === "bigint") && bit >= BigInt(0)) return BigInt(bit);
		if (bit instanceof BitField) return bit.bitfield;
		if (Array.isArray(bit)) {
			// @ts-ignore
			const resolve = this.constructor?.resolve || this.resolve;
			return bit.map((p) => resolve.call(this, p)).reduce((prev, p) => BigInt(prev) | BigInt(p), BigInt(0));
		}
		if (typeof bit === "string" && typeof FLAGS[bit] !== "undefined") return FLAGS[bit];
		throw new RangeError("BITFIELD_INVALID: " + bit);
	}
}

export function BitFlag(x: bigint | number) {
	return BigInt(1) << BigInt(x);
}
