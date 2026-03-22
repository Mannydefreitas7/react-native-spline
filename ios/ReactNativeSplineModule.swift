import ExpoModulesCore
import SplineRuntime

public class ReactNativeSplineModule: Module {
    /// Weak reference to the most recently mounted SplineView.
    /// Used to forward imperative API calls (emitEvent, setZoom, etc.) to the active scene.
    private weak var activeView: ReactNativeSplineView?

    public func definition() -> ModuleDefinition {
        Name("ReactNativeSpline")
        Events("onSplineEvent")

        // ── Imperative Spline Controller API ────────────────────────────────────

        Function("emitEvent") { (eventName: String, nameOrUUID: String) in
            let event = self.splineEvent(eventName)
            DispatchQueue.main.async {
                self.withController { $0.emitEvent(event, nameOrUUID: nameOrUUID) }
            }
        }

        Function("emitEventReverse") { (eventName: String, nameOrUUID: String) in
            let event = self.splineEvent(eventName)
            DispatchQueue.main.async {
                self.withController { $0.emitEventReverse(event, nameOrUUID: nameOrUUID) }
            }
        }

        Function("setZoom") { (zoom: Float) in
            DispatchQueue.main.async { self.withController { $0.setZoom(zoom) } }
        }

        Function("setNumberVariable") { (name: String, value: Float) in
            DispatchQueue.main.async {
                self.withController { $0.setNumberVariable(name: name, value: value) }
            }
        }

        Function("setBoolVariable") { (name: String, value: Bool) in
            DispatchQueue.main.async {
                self.withController { $0.setBoolVariable(name: name, value: value) }
            }
        }

        Function("setStringVariable") { (name: String, value: String) in
            DispatchQueue.main.async {
                self.withController { $0.setStringVariable(name: name, value: value) }
            }
        }

        AsyncFunction("getNumberVariable") { (name: String) -> Float? in
            await MainActor.run { self.activeView?.controller.getNumberVariable(name: name) }
        }

        AsyncFunction("getBoolVariable") { (name: String) -> Bool? in
            await MainActor.run { self.activeView?.controller.getBoolVariable(name: name) }
        }

        AsyncFunction("getStringVariable") { (name: String) -> String? in
            await MainActor.run { self.activeView?.controller.getStringVariable(name: name) }
        }

        AsyncFunction("findObjectById") { (id: String) -> [String: Any]? in
            await MainActor.run {
                guard let object = self.activeView?.controller.findObject(id: id) else {
                    return nil
                }
                return self.serializeObject(object)
            }
        }

        AsyncFunction("findObjectByName") { (name: String) -> [String: Any]? in
            await MainActor.run {
                guard let object = self.activeView?.controller.findObject(name: name) else {
                    return nil
                }
                return self.serializeObject(object)
            }
        }

        Function("stop") {
            DispatchQueue.main.async { self.withController { $0.stop() } }
        }

        Function("play") {
            DispatchQueue.main.async { self.withController { $0.play() } }
        }

        Function("setObjectRotation") { (nameOrUUID: String, x: Float, y: Float, z: Float) in
            DispatchQueue.main.async {
                self.withObject(nameOrUUID) { object in
                    object.rotation = SIMD3<Float>(x, y, z)
                }
            }
        }

        // ── View definition ──────────────────────────────────────────────────────

        View(ReactNativeSplineView.self) {
            Prop("url") { (view: ReactNativeSplineView, url: URL) in
                self.activeView = view
                view.onModuleSplineEvent = { [weak self] payload in
                    self?.sendEvent("onSplineEvent", payload)
                }
                view.loadScene(url: url)
            }

            Events("onLoad", "onSplineEvent")
        }
    }

    // MARK: - Helpers

    private func withController(_ block: (SplineController) -> Void) {
        guard let controller = activeView?.controller else { return }
        block(controller)
    }

    private func withObject(_ nameOrUUID: String, block: (SplineObject) -> Void) {
        guard let controller = activeView?.controller else { return }
        if let object = controller.findObject(id: nameOrUUID)
            ?? controller.findObject(name: nameOrUUID)
        {
            block(object)
        }
    }

    private func serializeObject(_ object: SplineObject) -> [String: Any] {
        [
            "name": object.name,
            "uuid": object.uuid,
            "position": [
                "x": object.position.x,
                "y": object.position.y,
                "z": object.position.z,
            ],
            "rotation": [
                "x": object.rotation.x,
                "y": object.rotation.y,
                "z": object.rotation.z,
            ],
            "scale": [
                "x": object.scale.x,
                "y": object.scale.y,
                "z": object.scale.z,
            ],
            "visible": object.visible,
            "intensity": object.intensity,
        ]
    }

    private func splineEvent(_ name: String) -> SplineEventName {
        switch name {
        case "mouseUp": return .mouseUp
        case "mouseDown": return .mouseDown
        case "mousePress": return .mousePress
        case "mouseHover": return .mouseHover
        case "keyUp": return .keyUp
        case "keyDown": return .keyDown
        case "keyPress": return .keyPress
        case "start": return .start
        case "lookAt": return .lookAt
        case "follow": return .follow
        default:
            print("[ReactNativeSpline] unknown event name '\(name)', ignoring")
            return .mouseUp
        }
    }
}
