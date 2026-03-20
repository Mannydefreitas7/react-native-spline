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
            onSceneLoaded: { [weak self] in
                self?.onLoad(["url": url.absoluteString])
            },
            onEvent: { [weak self] eventName, objectName in
                var payload: [String: Any] = ["event": eventName]
                if let name = objectName { payload["objectName"] = name }
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
    let onEvent: (String, String?) -> Void

    var body: some View {
        SplineView(sceneFileURL: url, controller: controller) { phase in
            phase.content?
                .task {
                    onSceneLoaded()

                    controller.addEventListener(.mouseUp) { obj in
                        onEvent("mouseUp", obj.name)
                    }
                    controller.addEventListener(.mouseDown) { obj in
                        onEvent("mouseDown", obj.name)
                    }
                    controller.addEventListener(.mousePress) { obj in
                        onEvent("mousePress", obj.name)
                    }
                    controller.addEventListener(.mouseHover) { obj in
                        onEvent("mouseHover", obj.name)
                    }
                    controller.addEventListener(.keyUp) { obj in
                        onEvent("keyUp", obj.name)
                    }
                    controller.addEventListener(.keyDown) { obj in
                        onEvent("keyDown", obj.name)
                    }
                    controller.addEventListener(.keyPress) { obj in
                        onEvent("keyPress", obj.name)
                    }
                    controller.addEventListener(.start) { obj in
                        onEvent("start", obj.name)
                    }
                    controller.addEventListener(.lookAt) { obj in
                        onEvent("lookAt", obj.name)
                    }
                    controller.addEventListener(.follow) { obj in
                        onEvent("follow", obj.name)
                    }
                }
        }
        .ignoresSafeArea(.all)
    }
}
