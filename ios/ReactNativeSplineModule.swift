import ExpoModulesCore
import SplineRuntime

public class ReactNativeSplineModule: Module {
  /// Weak reference to the most recently mounted SplineView.
  /// Used to forward imperative API calls (emitEvent, setZoom, etc.) to the active scene.
  private weak var activeView: ReactNativeSplineView?

  public func definition() -> ModuleDefinition {
    Name("ReactNativeSpline")

    // ── Imperative Spline Controller API ────────────────────────────────────

    Function("emitEvent") { (eventName: String, nameOrUUID: String) in
      let event = self.splineEvent(eventName)
      DispatchQueue.main.async { self.withController { $0.emitEvent(event, nameOrUUID: nameOrUUID) } }
    }

    Function("emitEventReverse") { (eventName: String, nameOrUUID: String) in
      let event = self.splineEvent(eventName)
      DispatchQueue.main.async { self.withController { $0.emitEventReverse(event, nameOrUUID: nameOrUUID) } }
    }

    Function("setZoom") { (zoom: Float) in
      DispatchQueue.main.async { self.withController { $0.setZoom(zoom) } }
    }

    Function("setNumberVariable") { (name: String, value: Float) in
      DispatchQueue.main.async { self.withController { $0.setNumberVariable(name: name, value: value) } }
    }

    Function("setBoolVariable") { (name: String, value: Bool) in
      DispatchQueue.main.async { self.withController { $0.setBoolVariable(name: name, value: value) } }
    }

    Function("setStringVariable") { (name: String, value: String) in
      DispatchQueue.main.async { self.withController { $0.setStringVariable(name: name, value: value) } }
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

    Function("stop") {
      DispatchQueue.main.async { self.withController { $0.stop() } }
    }

    Function("play") {
      DispatchQueue.main.async { self.withController { $0.play() } }
    }

    // ── View definition ──────────────────────────────────────────────────────

    View(ReactNativeSplineView.self) {
      Prop("url") { (view: ReactNativeSplineView, url: URL) in
        self.activeView = view
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

  private func splineEvent(_ name: String) -> SplineEventName {
    switch name {
    case "mouseUp":    return .mouseUp
    case "mouseDown":  return .mouseDown
    case "mousePress": return .mousePress
    case "mouseHover": return .mouseHover
    case "keyUp":      return .keyUp
    case "keyDown":    return .keyDown
    case "keyPress":   return .keyPress
    case "start":      return .start
    case "lookAt":     return .lookAt
    case "follow":     return .follow
    default:
      print("[ReactNativeSpline] unknown event name '\(name)', ignoring")
      return .mouseUp
    }
  }
}
