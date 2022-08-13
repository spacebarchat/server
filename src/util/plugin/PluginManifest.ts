export class PluginManifest {
    id: string;
    name: string;
    authors: string[];
    repository: string;
    license: string;
	version: string // semver
	versionCode: number // integer
    index: string;
}