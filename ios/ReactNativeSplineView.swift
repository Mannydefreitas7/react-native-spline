import ExpoModulesCore
import SplineRuntime
import SwiftUI

// MARK: - ExpoView bridge

/// UIKit view that hosts a SwiftUI SplineView from the SplineRuntime SDK.
class ReactNativeSplineView: ExpoView {
    let onLoad = EventDispatcher()
    let onSplineEvent = EventDispatcher()

    /// Exposed so the module can call SplineController API methods imperatively.
    private(set) var controller = SplineController()

    private var hostingContainer: UIView?

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        backgroundColor = .clear
        clipsToBounds = true
    }

    /// Called when the `url` prop changes. Loads the Spline scene from the given URL.
    func loadScene(url: URL) {
        hostingContainer?.removeFromSuperview()
        hostingContainer = nil

        // Fresh controller for each new scene so previous listeners don't leak.
        controller = SplineController()

        let sceneView = SplineSceneView(
            url: url,
            controller: controller,
            onSceneLoaded: {
                [weak self] in
                self?.onLoad(["url": url.absoluteString])
            },
            onEvent: {
                [weak self] eventName, objectName, objectId in
                let payload: [String: Any] = [
                    "event": eventName,
                    "objectName": objectName,
                    "objectId": objectId,
                ]
                self?.onSplineEvent(payload)
            }
        )

        // Bridge SwiftUI → UIKit via UIHostingController.
        let hosting = UIHostingController(rootView: sceneView)
        hosting.view.backgroundColor = .clear
        hosting.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        hosting.view.frame = bounds
        addSubview(hosting.view)
        hostingContainer = hosting.view
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        hostingContainer?.frame = bounds
    }
}

// MARK: - SwiftUI wrapper

/// Wraps `SplineView` from SplineRuntime and wires up all Spline event listeners
/// once the scene has finished loading via the phase trailing closure.
private struct SplineSceneView: View {
    let url: URL
    let controller: SplineController
    let onSceneLoaded: () -> Void
    let onEvent: (String, String, String) -> Void

    var body: some View {
        SplineView(sceneFileURL: url, controller: controller) { phase in
            phase.content?.task {
                onSceneLoaded()
                for (eventName, eventType) in [
                    ("mouseUp", SplineEventName.mouseUp),
                    ("mouseDown", SplineEventName.mouseDown),
                    ("mousePress", SplineEventName.mousePress),
                    ("mouseHover", SplineEventName.mouseHover),
                    ("keyUp", SplineEventName.keyUp),
                    ("keyDown", SplineEventName.keyDown),
                    ("keyPress", SplineEventName.keyPress),
                    ("start", SplineEventName.start),
                    ("lookAt", SplineEventName.lookAt),
                    ("follow", SplineEventName.follow),
                ] {
                    controller.addEventListener(eventType) { obj in
                        print("[ReactNativeSpline] event '\(eventName)' on object '\(obj.name)'")
                        onEvent(eventName, obj.name, obj.uuid)
                    }
                }
            }
        }.ignoresSafeArea(.all)
    }
}
