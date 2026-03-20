// expo-spline — Expo Config Plugin
//
// Responsibilities:
//  iOS  → injects the SplineRuntime Swift Package into the Xcode project
//         (equivalent to File > Add Package Dependencies in Xcode)
//  Android → adds `design.spline:spline-runtime` to app/build.gradle
//            and ensures INTERNET permission is declared

import { ConfigPlugin, withXcodeProject, withPodfileProperties, withPodfile, withAppBuildGradle, withAndroidManifest } from '@expo/config-plugins';

// ─── Constants ────────────────────────────────────────────────────────────────

const SPLINE_IOS_REPO = 'https://github.com/splinetool/spline-ios';
const SPLINE_IOS_PRODUCT = 'SplineRuntime';
const SPLINE_IOS_MIN_VERSION = '0.2.0';

const SPLINE_ANDROID_DEP = 'design.spline:spline-runtime:+';

// ─── iOS: set minimum deployment target ──────────────────────────────────────

/**
 * Sets `ios.deploymentTarget` in Podfile.properties.json to 16.0 (for pods)
 * AND sets IPHONEOS_DEPLOYMENT_TARGET in project.pbxproj to 16.0 (for the
 * main app target). Both are required: pods inherit from Podfile.properties,
 * but the Xcode project and the Pods-<app> aggregate target inherit from
 * project.pbxproj. SplineRuntime requires iOS 16+.
 */
const withSplineIOSDeploymentTarget: ConfigPlugin = (config) => {
  config = withPodfileProperties(config, (config) => {
    config.modResults['ios.deploymentTarget'] = '16.0';
    return config;
  });

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const objects = project.hash.project.objects;

    // Update IPHONEOS_DEPLOYMENT_TARGET in all XCBuildConfiguration entries
    const buildConfigs: Record<string, Record<string, any>> = objects['XCBuildConfiguration'] ?? {};
    for (const [key, cfg] of Object.entries(buildConfigs)) {
      if (key.endsWith('_comment')) continue;
      if (typeof cfg !== 'object') continue;
      const buildSettings = (cfg as Record<string, any>).buildSettings ?? {};
      if ('IPHONEOS_DEPLOYMENT_TARGET' in buildSettings) {
        buildSettings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0';
      }
    }

    return config;
  });

  return config;
};

// ─── iOS: expose SPM framework to pod target ─────────────────────────────────

/**
 * Injects a post_install snippet that adds `PackageFrameworks` (where Xcode
 * places SPM-built frameworks) to FRAMEWORK_SEARCH_PATHS of the
 * ReactNativeSpline pod target, so `import SplineRuntime` resolves at
 * compile time.
 */
const withSplineIOSPodfileFrameworkPath: ConfigPlugin = (config) => {
  return withPodfile(config, (config) => {
    const MARKER = '# expo-spline: SplineRuntime framework search path';
    if (config.modResults.contents.includes(MARKER)) return config; // idempotent

    const snippet = `
  ${MARKER}
  installer.pods_project.targets.each do |target|
    if target.name == 'ReactNativeSpline'
      target.build_configurations.each do |build_config|
        build_config.build_settings['FRAMEWORK_SEARCH_PATHS'] ||= ['$(inherited)']
        build_config.build_settings['FRAMEWORK_SEARCH_PATHS'] << '"$(BUILD_DIR)/$(CONFIGURATION)$(EFFECTIVE_PLATFORM_NAME)"'
        build_config.build_settings['FRAMEWORK_SEARCH_PATHS'] << '"$(BUILD_DIR)/$(CONFIGURATION)$(EFFECTIVE_PLATFORM_NAME)/PackageFrameworks"'
      end
    end
  end`;

    // Insert into the existing post_install block (guaranteed to exist from the RN Podfile template)
    config.modResults.contents = config.modResults.contents.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|${snippet}`
    );
    return config;
  });
};

// ─── iOS: inject Swift Package ────────────────────────────────────────────────

/**
 * Adds the SplineRuntime Swift Package to the host Xcode project.
 *
 * This modifies `ios/<AppName>.xcodeproj/project.pbxproj` to add:
 *  • XCRemoteSwiftPackageReference  – points at the GitHub repo
 *  • XCSwiftPackageProductDependency – links the `SplineRuntime` product
 *  • packageReferences on the PBXProject
 *  • packageProductDependencies on the main app target
 */
const withSplineIOS: ConfigPlugin = (config) => {
  return withXcodeProject(config, (xcodeProject) => {
    const objects = xcodeProject.modResults.hash.project.objects;

    // ── Guard: already added? ────────────────────────────────────────────────
    const existingRefs: Record<string, Record<string, any>> = objects['XCRemoteSwiftPackageReference'] ?? {};
    const alreadyAdded = Object.values(existingRefs).some(
      (ref: Record<string, any>) =>
        typeof ref === 'object' &&
        ref.repositoryURL === `"${SPLINE_IOS_REPO}"`
    );
    if (alreadyAdded) return xcodeProject;

    // ── Generate stable-ish UUIDs ────────────────────────────────────────────
    const packageUUID = xcodeProject.modResults.generateUuid();
    const productUUID = xcodeProject.modResults.generateUuid();

    // ── 1. XCRemoteSwiftPackageReference ────────────────────────────────────
    objects['XCRemoteSwiftPackageReference'] = objects['XCRemoteSwiftPackageReference'] ?? {};
    objects['XCRemoteSwiftPackageReference'][packageUUID] = {
      isa: 'XCRemoteSwiftPackageReference',
      repositoryURL: `"${SPLINE_IOS_REPO}"`,
      requirement: {
        kind: 'upToNextMajorVersion',
        minimumVersion: SPLINE_IOS_MIN_VERSION,
      },
    };
    objects['XCRemoteSwiftPackageReference'][`${packageUUID}_comment`] = SPLINE_IOS_PRODUCT;

    // ── 2. XCSwiftPackageProductDependency ───────────────────────────────────
    objects['XCSwiftPackageProductDependency'] = objects['XCSwiftPackageProductDependency'] ?? {};
    objects['XCSwiftPackageProductDependency'][productUUID] = {
      isa: 'XCSwiftPackageProductDependency',
      package: packageUUID,
      productName: SPLINE_IOS_PRODUCT,
    };
    objects['XCSwiftPackageProductDependency'][`${productUUID}_comment`] = SPLINE_IOS_PRODUCT;

    // ── 3. Add packageReference to PBXProject ────────────────────────────────
    const projectSection: Record<string, Record<string, any>> = objects['PBXProject'] ?? {};
    const projectObj = Object.values(projectSection).find(
      (p: Record<string, any>) => typeof p === 'object' && p.isa === 'PBXProject'
    );
    if (projectObj) {
      projectObj.packageReferences = projectObj.packageReferences ?? [];
      projectObj.packageReferences.push({
        value: packageUUID,
        comment: `XCRemoteSwiftPackageReference "${SPLINE_IOS_PRODUCT}"`,
      });
    }

    // ── 4. Add product dependency to the main app target ─────────────────────
    const nativeTargets: Record<string, Record<string, any>> = objects['PBXNativeTarget'] ?? {};
    for (const [key, target] of Object.entries(nativeTargets)) {
      if (key.endsWith('_comment')) continue;
      if (typeof target !== 'object') continue;
      // Target the application target (not test targets, extensions, etc.)
      const typedTarget = target as Record<string, any>;
      if (typedTarget.productType === '"com.apple.product-type.application"') {
        typedTarget.packageProductDependencies = typedTarget.packageProductDependencies ?? [];
        typedTarget.packageProductDependencies.push({
          value: productUUID,
          comment: SPLINE_IOS_PRODUCT,
        });
        break;
      }
    }

    return xcodeProject;
  });
};

// ─── Android: add Gradle dependency ──────────────────────────────────────────

/**
 * Appends `design.spline:spline-runtime:+` to the app's `dependencies {}` block
 * in `android/app/build.gradle`.
 */
const withSplineAndroid: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes(SPLINE_ANDROID_DEP)) {
      return config; // already present
    }
    config.modResults.contents = config.modResults.contents.replace(
      /dependencies\s*\{/,
      `dependencies {\n    // Spline 3D runtime — added by expo-spline config plugin\n    implementation("${SPLINE_ANDROID_DEP}")\n`
    );
    return config;
  });
};

// ─── Android: ensure INTERNET permission ─────────────────────────────────────

const withSplineAndroidManifest: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const permissions = manifest['uses-permission'] ?? [];

    const hasInternet = permissions.some(
      (p: any) => p.$?.['android:name'] === 'android.permission.INTERNET'
    );
    if (!hasInternet) {
      manifest['uses-permission'] = [
        ...permissions,
        { $: { 'android:name': 'android.permission.INTERNET' } },
      ];
    }

    const hasNetwork = permissions.some(
      (p: any) => p.$?.['android:name'] === 'android.permission.ACCESS_NETWORK_STATE'
    );
    if (!hasNetwork) {
      manifest['uses-permission'] = [
        ...(manifest['uses-permission'] ?? []),
        { $: { 'android:name': 'android.permission.ACCESS_NETWORK_STATE' } },
      ];
    }

    config.modResults.manifest = manifest;
    return config;
  });
};

// ─── Compose them together ────────────────────────────────────────────────────

/**
 * Main plugin export.
 *
 * Usage in `app.json` / `app.config.js`:
 * ```json
 * {
 *   "plugins": ["expo-spline"]
 * }
 * ```
 */
const withSpline: ConfigPlugin = (config) => {
  config = withSplineIOSDeploymentTarget(config);
  config = withSplineIOS(config);
  config = withSplineIOSPodfileFrameworkPath(config);
  config = withSplineAndroid(config);
  config = withSplineAndroidManifest(config);
  return config;
};

export default withSpline;
