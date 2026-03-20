package expo.modules.spline

import android.content.Context
import design.spline.runtime.SplineView
import design.spline.runtime.SplineEventName
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class ReactNativeSplineView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onLoad by EventDispatcher()
  private val onSplineEvent by EventDispatcher()

  /// The native Spline view from the SplineRuntime SDK.
  internal val splineView = SplineView(context).also { view ->
    view.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    addView(view)
  }

  /// Load a Spline scene from a remote URL and register all event listeners once loaded.
  fun loadUrl(url: String) {
    splineView.loadUrl(url) {
      onLoad(mapOf("url" to url))
      registerEventListeners()
    }
  }

  private fun registerEventListeners() {
    val eventNames = listOf(
      SplineEventName.mouseUp to "mouseUp",
      SplineEventName.mouseDown to "mouseDown",
      SplineEventName.mousePress to "mousePress",
      SplineEventName.mouseHover to "mouseHover",
      SplineEventName.keyUp to "keyUp",
      SplineEventName.keyDown to "keyDown",
      SplineEventName.keyPress to "keyPress",
      SplineEventName.start to "start",
      SplineEventName.lookAt to "lookAt",
      SplineEventName.follow to "follow",
    )

    for ((eventType, eventName) in eventNames) {
      splineView.addEventListener(eventType) { event ->
        onSplineEvent(
          mapOf(
            "event" to eventName,
            "objectName" to event.target.name,
            "objectId" to event.target.uuid,
          )
        )
      }
    }
  }
}
