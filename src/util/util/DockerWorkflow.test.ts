import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

type WorkflowPackage = {
    attr: string;
    image: string;
    suffix: string;
};

type WorkflowPlatform = {
    system: string;
    runner: string;
    tag: string;
};

const expectedPlatforms: WorkflowPlatform[] = [
    {
        system: "x86_64-linux",
        runner: "ubuntu-latest",
        tag: "amd64",
    },
    {
        system: "aarch64-linux",
        runner: "ubuntu-24.04-arm",
        tag: "arm64",
    },
];

const expectedPackages: WorkflowPackage[] = [
    {
        attr: "default",
        image: "spacebar-server-ts",
        suffix: "",
    },
    {
        attr: "cdn",
        image: "spacebar-server-ts-cdn",
        suffix: "-cdn",
    },
    {
        attr: "api",
        image: "spacebar-server-ts-api",
        suffix: "-api",
    },
    {
        attr: "gateway",
        image: "spacebar-server-ts-gateway",
        suffix: "-gateway",
    },
    {
        attr: "webrtc",
        image: "spacebar-server-ts-webrtc",
        suffix: "-webrtc",
    },
    {
        attr: "admin-api",
        image: "spacebar-server-ts-admin-api",
        suffix: "-admin-api",
    },
    {
        attr: "cdn-cs",
        image: "spacebar-server-ts-cdn-cs",
        suffix: "-cdn-cs",
    },
    {
        attr: "offload",
        image: "spacebar-server-ts-offload",
        suffix: "-gateway-offload",
    },
];

const repoRoot = process.cwd();
const workflowPackageSuffix = "$" + "{{ matrix.package.suffix }}";
const workflowPackageAttr = "$" + "{{ matrix.package.attr }}";
const workflowPlatformSystem = "$" + "{{ matrix.platform.system }}";
const workflowPlatformTag = "$" + "{{ matrix.platform.tag }}";

function readRepoFile(relativePath: string) {
    return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireGroup(source: string, pattern: RegExp, group: string) {
    const match = source.match(pattern);

    if (!match || !match.groups || typeof match.groups[group] !== "string") {
        assert.fail(`Could not find ${group} with ${pattern}`);
    }

    return match.groups[group];
}

function parseYamlScalar(value: string) {
    const trimmed = value.trim();

    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

function parseBuildJob(workflow: string) {
    return requireGroup(workflow, /\n[ ]{2}build:\n(?<job>[\s\S]*?)\n[ ]{2}manifest:/, "job");
}

function parseManifestJob(workflow: string) {
    return requireGroup(workflow, /\n[ ]{2}manifest:\n(?<job>[\s\S]*)$/, "job");
}

function parsePlatformMatrix(workflow: string): WorkflowPlatform[] {
    const buildJob = parseBuildJob(workflow);
    const platformBlock = requireGroup(buildJob, /\n[ ]{8}platform:\n(?<block>[\s\S]*?)\n[ ]{8}package:/, "block");
    const platforms: WorkflowPlatform[] = [];

    for (const match of platformBlock.matchAll(/[ ]{10}- system: ([^\n]+)\n[ ]{12}runner: ([^\n]+)\n[ ]{12}tag: ([^\n]+)/g)) {
        platforms.push({
            system: parseYamlScalar(match[1] ?? ""),
            runner: parseYamlScalar(match[2] ?? ""),
            tag: parseYamlScalar(match[3] ?? ""),
        });
    }

    assert.notEqual(platforms.length, 0, "Expected the Docker workflow build job to define platform matrix entries");
    return platforms;
}

function parseBuildPackageMatrix(workflow: string): WorkflowPackage[] {
    const buildJob = parseBuildJob(workflow);
    const packageBlock = requireGroup(buildJob, /\n[ ]{8}package:\n(?<block>[\s\S]*?)\n[ ]{4}steps:/, "block");
    const packages: WorkflowPackage[] = [];

    for (const match of packageBlock.matchAll(/[ ]{10}- attr: ([^\n]+)\n[ ]{12}image: ([^\n]+)\n[ ]{12}suffix: ([^\n]+)/g)) {
        packages.push({
            attr: parseYamlScalar(match[1] ?? ""),
            image: parseYamlScalar(match[2] ?? ""),
            suffix: parseYamlScalar(match[3] ?? ""),
        });
    }

    assert.notEqual(packages.length, 0, "Expected the Docker workflow build job to define package matrix entries");
    return packages;
}

function parseManifestSuffixes(workflow: string) {
    const manifestJob = parseManifestJob(workflow);
    const packageBlock = requireGroup(manifestJob, /\n[ ]{8}package:\n(?<block>[\s\S]*?)\n[ ]{4}steps:/, "block");
    const suffixes: string[] = [];

    for (const match of packageBlock.matchAll(/[ ]{10}- suffix: ([^\n]+)/g)) {
        suffixes.push(parseYamlScalar(match[1] ?? ""));
    }

    assert.notEqual(suffixes.length, 0, "Expected the Docker workflow manifest job to define suffix matrix entries");
    return suffixes;
}

function parseGeneratedContainerAttrs(flake: string) {
    const generatedAttrs = requireGroup(flake, /lib\.genAttrs \[ (?<attrs>[^\]]+) \]/, "attrs");
    const attrs: string[] = [];

    for (const match of generatedAttrs.matchAll(/"([^"]+)"/g)) {
        if (match[1]) {
            attrs.push(match[1]);
        }
    }

    return attrs;
}

function containerAttrExists(attr: string, flake: string, adminOutputs: string) {
    if (attr === "default") {
        return flake.includes("default = pkgs.dockerTools.buildLayeredImage");
    }

    if (parseGeneratedContainerAttrs(flake).includes(attr)) {
        return true;
    }

    return adminOutputs.includes(`containers.docker.${attr} = pkgs.dockerTools.buildLayeredImage`);
}

function containerImageNameExists(entry: WorkflowPackage, flake: string, adminOutputs: string) {
    if (`${flake}\n${adminOutputs}`.includes(`name = "${entry.image}";`)) {
        return true;
    }

    return parseGeneratedContainerAttrs(flake).includes(entry.attr) && entry.image === `spacebar-server-ts-${entry.attr}`;
}

describe("Docker image workflow", () => {
    const workflow = readRepoFile(".github/workflows/build-docker.yml");
    const flake = readRepoFile("flake.nix");
    const adminOutputs = readRepoFile("extra/admin-api/outputs.nix");

    test("builds each supported architecture on a matching native runner", () => {
        assert.deepEqual(parsePlatformMatrix(workflow), expectedPlatforms);
        assert(workflow.includes(`nix build .#containers.${workflowPlatformSystem}.docker.${workflowPackageAttr}`));
    });

    test("keeps workflow packages aligned with Nix container attrs and image names", () => {
        assert.deepEqual(parseBuildPackageMatrix(workflow), expectedPackages);

        for (const entry of expectedPackages) {
            assert(containerAttrExists(entry.attr, flake, adminOutputs), `Expected Nix container attr ${entry.attr} for Docker image ${entry.image}`);
            assert(containerImageNameExists(entry, flake, adminOutputs), `Expected Nix container image name ${entry.image}`);
        }
    });

    test("publishes arch tags before assembling the legacy latest manifest", () => {
        assert(workflow.includes(`docker push "ghcr.io/$REPO${workflowPackageSuffix}:latest-${workflowPlatformTag}"`));
        assert.deepEqual(
            parseManifestSuffixes(workflow),
            expectedPackages.map((entry) => entry.suffix),
        );
        assert(workflow.includes(`docker manifest create "ghcr.io/$REPO${workflowPackageSuffix}:latest" \\`));
        assert(workflow.includes(`"ghcr.io/$REPO${workflowPackageSuffix}:latest-amd64" \\`));
        assert(workflow.includes(`"ghcr.io/$REPO${workflowPackageSuffix}:latest-arm64"`));
        assert(workflow.includes(`docker manifest push "ghcr.io/$REPO${workflowPackageSuffix}:latest"`));
    });
});
