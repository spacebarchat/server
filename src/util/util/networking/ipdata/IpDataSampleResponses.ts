/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

export type IpDataIpLookupResponse = typeof ipDataSampleIpLookupResponse;

const ipDataSampleIpLookupResponse = {
	ip: "",
	is_eu: true,
	city: "",
	region: "",
	region_code: "",
	country_name: "",
	country_code: "",
	continent_name: "",
	continent_code: "",
	latitude: 0,
	longitude: 0,
	postal: "",
	calling_code: "",
	flag: "",
	emoji_flag: "",
	emoji_unicode: "",
	asn: {
		asn: "",
		name: "",
		domain: "",
		route: "",
		type: "isp",
	},
	languages: [
		{
			name: "",
			native: "",
		},
	],
	currency: {
		name: "",
		code: "",
		symbol: "",
		native: "",
		plural: "",
	},
	time_zone: {
		name: "",
		abbr: "",
		offset: "",
		is_dst: true,
		current_time: "",
	},
	threat: {
		is_tor: false,
		is_icloud_relay: false,
		is_proxy: false,
		is_datacenter: false,
		is_anonymous: false,
		is_known_attacker: false,
		is_known_abuser: false,
		is_threat: false,
		is_bogon: false,
		blocklists: [],
	},
	count: 0,
	status: 200,
};
