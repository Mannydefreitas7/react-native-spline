package expo.modules.spline

import design.spline.runtime.SplineEventName
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class ReactNativeSplineModule : Module() {
  /// Reference to the most recently mounted SplineView for imperative API calls.
  private var activeView: ReactNativeSplineView? = null

  override fun definition() = ModuleDefinition {
    Name("ReactNativeSpline")

    // ── Imperative Spline API ─────────────────────────────────────────────────

    Function("emitEvent") { eventName: String, nameOrUUID: String ->
      activeView?.splineView?.emitEvent(splineEvent(eventName), nameOrUUID)
    }

    Function("emitEventReverse") { eventName: String, nameOrUUID: String ->
      activeView?.splineView?.emitEventReverse(splineEvent(eventName), nameOrUUID)
    }

    Function("setZoom") { zoom: Float ->
      activeView?.splineView?.setZoom(zoom)
    }

    Function("setNumberVariable") { name: String, value: Float ->
      activeView?.splineView?.setNumberVariable(name, value)
    }

    Function("setBoolVariable") { name: String, value: Boolean ->
      activeView?.splineView?.setBooleanVariable(name, value)
    }

    Function("setStringVariable") { name: String, value: String ->
      activeView?.splineView?.setStringVariable(name, value)
    }

    AsyncFunction("getNumberVariable") { name: String ->
      activeView?.splineView?.getNumberVariable(name)
    }

    AsyncFunction("getBoolVariable") { name: String ->
      activeView?.splineView?.getBooleanVariable(name)
    }

    AsyncFunction("getStringVariable") { name: String ->
      activeView?.splineView?.getStringVariable(name)
    }

    Function("stop") {
      activeView?.splineView?.stop()
    }

    Function("play") {
      activeView?.splineView?.play()
    }

    // ── View definition ───────────────────────────────────────────────────────

    View(ReactNativeSplineView::class) {
      Prop("url") { view: ReactNativeSplineView, url: URL ->
        activeView = view
        view.loadUrl(url.toString())
      }

      Events("onLoad", "onSplineEvent")
    }
  }

  // MARK: - Helpers

  private fun splineEvent(name: String): SplineEventName = when (name) {
    "mouseDown"  -> SplineEventName.mouseDown
    "mousePress" -> SplineEventName.mousePress
    "mouseHover" -> SplineEventName.mouseHover
    "keyUp"      -> SplineEventName.keyUp
    "keyDown"    -> SplineEventName.keyDown
    "keyPress"   -> SplineEventName.keyPress
    "start"      -> SplineEventName.start
    "lookAt"     -> SplineEventName.lookAt
    "follow"     -> SplineEventName.follow
    else         -> SplineEventName.mouseUp
  }
}
