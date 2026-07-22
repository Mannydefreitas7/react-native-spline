require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ReactNativeSpline'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  # SplineRuntime requires iOS 16+. tvOS is not supported by SplineRuntime.
  s.platforms      = {
    :ios => '16.0'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/emmanuel-defreitas/react-native-spline' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
